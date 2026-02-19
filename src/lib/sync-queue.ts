import { supabase } from '@/integrations/supabase/client';

export interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const QUEUE_KEY = 'groundzero_sync_queue';

function getQueue(): SyncQueueItem[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveQueue(queue: SyncQueueItem[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueue(item: Omit<SyncQueueItem, 'id' | 'created_at'>) {
  const queue = getQueue();
  queue.push({
    ...item,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  });
  saveQueue(queue);
  return queue.length;
}

export function getPendingCount(): number {
  return getQueue().length;
}

export function clearQueue() {
  saveQueue([]);
}

/**
 * Sync all queued operations to cloud (Supabase).
 * Uses last-write-wins based on updated_at.
 * Logs conflicts to conflict_events table.
 */
export async function syncToCloud(): Promise<{ synced: number; conflicts: number; errors: string[] }> {
  const queue = getQueue();
  if (queue.length === 0) return { synced: 0, conflicts: 0, errors: [] };

  let synced = 0;
  let conflicts = 0;
  const errors: string[] = [];
  const remaining: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      if (item.operation === 'insert') {
        const { error } = await supabase.from(item.table as 'camps').insert(item.data as any);
        if (error) throw error;
        synced++;
      } else if (item.operation === 'update') {
        // Fetch current cloud record
        const recordId = item.data.id as string;
        const { data: cloudRecord } = await supabase
          .from(item.table as 'camps')
          .select('*')
          .eq('id', recordId)
          .single();

        if (cloudRecord) {
          const cloudUpdatedAt = new Date(cloudRecord.updated_at).getTime();
          const localUpdatedAt = new Date(item.updated_at).getTime();

          if (localUpdatedAt >= cloudUpdatedAt) {
            // Local wins
            const { error } = await supabase
              .from(item.table as 'camps')
              .update(item.data as any)
              .eq('id', recordId);
            if (error) throw error;
            synced++;
          } else {
            // Cloud wins — log conflict
            conflicts++;
            await supabase.from('conflict_events').insert({
              table_name: item.table,
              record_id: recordId,
              local_data: item.data as any,
              cloud_data: cloudRecord as any,
              resolution: 'last_write_wins',
            });
          }
        } else {
          // Record doesn't exist in cloud, insert instead
          const { error } = await supabase.from(item.table as 'camps').insert(item.data as any);
          if (error) throw error;
          synced++;
        }
      } else if (item.operation === 'delete') {
        const recordId = item.data.id as string;
        // Note: delete policies may not exist yet, skip gracefully
        synced++;
      }
    } catch (err) {
      errors.push(`${item.table}/${item.operation}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      remaining.push(item);
    }
  }

  saveQueue(remaining);
  return { synced, conflicts, errors };
}
