/**
 * Central Data Service Layer
 * 
 * All data operations go through this service.
 * In cloud mode: uses Supabase client directly.
 * In LAN mode: uses WebSocket + local LAN API, queues for later sync.
 */

import { supabase } from '@/integrations/supabase/client';
import { enqueue } from './sync-queue';

type TableName = 'camps' | 'shipments' | 'inventory' | 'volunteer_tasks' | 'audit_logs' | 'conflict_events';

interface ServiceOptions {
  mode: 'cloud' | 'lan' | 'forced-lan';
  lanApiBase: string;
}

let lanSocket: WebSocket | null = null;
let lanSocketListeners: Map<string, Set<(data: any) => void>> = new Map();

function getLanSocket(lanApiBase: string): WebSocket | null {
  const wsUrl = lanApiBase.replace(/^http/, 'ws') + '/ws';
  if (lanSocket && lanSocket.readyState === WebSocket.OPEN) return lanSocket;
  
  try {
    lanSocket = new WebSocket(wsUrl);
    lanSocket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const listeners = lanSocketListeners.get(msg.table);
        if (listeners) listeners.forEach(cb => cb(msg));
      } catch { /* ignore parse errors */ }
    };
    lanSocket.onerror = () => { lanSocket = null; };
    lanSocket.onclose = () => { lanSocket = null; };
    return lanSocket;
  } catch {
    return null;
  }
}

export function subscribeLanRealtime(table: string, callback: (data: any) => void, lanApiBase: string) {
  if (!lanSocketListeners.has(table)) lanSocketListeners.set(table, new Set());
  lanSocketListeners.get(table)!.add(callback);
  getLanSocket(lanApiBase);
  return () => {
    lanSocketListeners.get(table)?.delete(callback);
  };
}

export async function fetchRecords(
  table: TableName,
  options: ServiceOptions,
  queryOptions?: {
    filters?: Record<string, unknown>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    ilike?: { column: string; pattern: string };
    isNull?: string;
  }
): Promise<{ data: any[]; error: string | null }> {
  if (options.mode === 'cloud') {
    let q: any = supabase.from(table).select('*');
    if (queryOptions?.orderBy) {
      q = q.order(queryOptions.orderBy.column, { ascending: queryOptions.orderBy.ascending ?? true });
    }
    if (queryOptions?.filters) {
      for (const [key, value] of Object.entries(queryOptions.filters)) {
        q = q.eq(key, value);
      }
    }
    if (queryOptions?.ilike) {
      q = q.ilike(queryOptions.ilike.column, queryOptions.ilike.pattern);
    }
    if (queryOptions?.isNull) {
      q = q.is(queryOptions.isNull, null);
    }
    if (queryOptions?.limit) {
      q = q.limit(queryOptions.limit);
    }
    const { data, error } = await q;
    return { data: data || [], error: error?.message || null };
  }

  // LAN mode: fetch from local server
  try {
    const url = new URL(`${options.lanApiBase}/api/${table}`);
    if (queryOptions?.filters) {
      for (const [key, value] of Object.entries(queryOptions.filters)) {
        url.searchParams.set(key, String(value));
      }
    }
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`LAN fetch failed: ${res.status}`);
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : 'LAN fetch failed' };
  }
}

export async function insertRecord(
  table: TableName,
  record: Record<string, unknown>,
  options: ServiceOptions
): Promise<{ error: string | null }> {
  if (options.mode === 'cloud') {
    const { error } = await supabase.from(table).insert(record as any);
    return { error: error?.message || null };
  }

  // LAN mode: send to local server + queue for sync
  try {
    const res = await fetch(`${options.lanApiBase}/api/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error(`LAN insert failed: ${res.status}`);
  } catch {
    // Even if LAN fails, queue for cloud sync
  }

  enqueue({
    table,
    operation: 'insert',
    data: record,
    updated_at: new Date().toISOString(),
  });

  return { error: null };
}

export async function updateRecord(
  table: TableName,
  id: string,
  updates: Record<string, unknown>,
  options: ServiceOptions
): Promise<{ error: string | null }> {
  if (options.mode === 'cloud') {
    const { error } = await supabase.from(table).update(updates as any).eq('id', id);
    return { error: error?.message || null };
  }

  try {
    const res = await fetch(`${options.lanApiBase}/api/${table}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`LAN update failed: ${res.status}`);
  } catch { /* queue anyway */ }

  enqueue({
    table,
    operation: 'update',
    data: { id, ...updates },
    updated_at: new Date().toISOString(),
  });

  return { error: null };
}
