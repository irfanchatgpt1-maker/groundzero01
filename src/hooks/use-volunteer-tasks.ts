import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface VolunteerTaskRow {
  id: string;
  volunteer_name: string;
  title: string;
  description: string | null;
  mission: string | null;
  status: string;
  urgency: string;
  created_at: string;
  updated_at: string;
}

export function useVolunteerTasks(volunteerName?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['volunteer_tasks', volunteerName ?? 'all'];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let q = supabase.from('volunteer_tasks').select('*').order('created_at', { ascending: false });
      if (volunteerName) {
        q = q.eq('volunteer_name', volunteerName);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data as VolunteerTaskRow[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'volunteer_tasks' }, () => {
        queryClient.invalidateQueries({ queryKey: ['volunteer_tasks'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
}
