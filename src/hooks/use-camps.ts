import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface CampRow {
  id: string;
  name: string;
  location: string;
  capacity: number;
  occupancy: number;
  status: string;
  lead: string | null;
  created_at: string;
  updated_at: string;
}

export function useCamps() {
  const query = useQuery({
    queryKey: ['camps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('camps')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as CampRow[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('camps-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'camps' }, () => {
        query.refetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return query;
}
