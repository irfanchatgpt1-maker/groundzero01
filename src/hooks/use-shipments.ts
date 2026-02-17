import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface ShipmentRow {
  id: string;
  tracking_id: string;
  origin: string;
  destination: string;
  resource: string;
  quantity: string;
  urgency: string;
  status: string;
  vehicle_id: string | null;
  weight: number | null;
  eta: string | null;
  created_at: string;
  updated_at: string;
}

export function useShipments(filter?: { destination?: string }) {
  const queryClient = useQueryClient();
  const queryKey = ['shipments', filter?.destination ?? 'all'];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let q = supabase.from('shipments').select('*').order('created_at', { ascending: false });
      if (filter?.destination) {
        q = q.ilike('destination', `%${filter.destination}%`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data as ShipmentRow[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('shipments-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['shipments'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
}

export function getShipmentProgress(status: string): number {
  switch (status) {
    case 'ORDERED': return 15;
    case 'PROCESSING': return 15;
    case 'DISPATCHED': return 50;
    case 'IN_TRANSIT': return 75;
    case 'ARRIVED': 
    case 'DELIVERED': return 100;
    default: return 0;
  }
}
