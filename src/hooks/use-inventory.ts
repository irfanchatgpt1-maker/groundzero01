import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface InventoryRow {
  id: string;
  camp_id: string | null;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  min_threshold: number;
  is_critical: boolean | null;
  created_at: string;
  updated_at: string;
}

export function useInventory(campId?: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['inventory', campId ?? 'global'];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let q = supabase.from('inventory').select('*').order('created_at', { ascending: true });
      if (campId) {
        q = q.eq('camp_id', campId);
      } else if (campId === null) {
        q = q.is('camp_id', null);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data as InventoryRow[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('inventory-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
}
