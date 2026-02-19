
-- Table to log sync conflicts during LAN→Cloud reconciliation
CREATE TABLE public.conflict_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  local_data JSONB NOT NULL,
  cloud_data JSONB,
  resolution TEXT NOT NULL DEFAULT 'last_write_wins',
  resolved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.conflict_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read conflict_events" ON public.conflict_events FOR SELECT USING (true);
CREATE POLICY "Demo insert conflict_events" ON public.conflict_events FOR INSERT WITH CHECK (true);
