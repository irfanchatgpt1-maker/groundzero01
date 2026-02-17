
-- GroundZero Database Schema

-- Camps table
CREATE TABLE public.camps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  occupancy INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'OPERATIONAL',
  lead TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shipments table
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_id TEXT NOT NULL UNIQUE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  resource TEXT NOT NULL,
  quantity TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'MEDIUM',
  status TEXT NOT NULL DEFAULT 'ORDERED',
  vehicle_id TEXT,
  weight NUMERIC,
  eta TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventory table
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  camp_id UUID REFERENCES public.camps(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'units',
  min_threshold INTEGER NOT NULL DEFAULT 0,
  is_critical BOOLEAN GENERATED ALWAYS AS (quantity <= min_threshold) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Volunteer Tasks table
CREATE TABLE public.volunteer_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  mission TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  urgency TEXT NOT NULL DEFAULT 'NORMAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_name TEXT,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read access (demo mode)
CREATE POLICY "Public read camps" ON public.camps FOR SELECT USING (true);
CREATE POLICY "Public read shipments" ON public.shipments FOR SELECT USING (true);
CREATE POLICY "Public read inventory" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Public read volunteer_tasks" ON public.volunteer_tasks FOR SELECT USING (true);
CREATE POLICY "Public read audit_logs" ON public.audit_logs FOR SELECT USING (true);

-- Allow anonymous inserts/updates for demo mode (will be restricted with auth later)
CREATE POLICY "Demo insert camps" ON public.camps FOR INSERT WITH CHECK (true);
CREATE POLICY "Demo update camps" ON public.camps FOR UPDATE USING (true);
CREATE POLICY "Demo insert shipments" ON public.shipments FOR INSERT WITH CHECK (true);
CREATE POLICY "Demo update shipments" ON public.shipments FOR UPDATE USING (true);
CREATE POLICY "Demo insert inventory" ON public.inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Demo update inventory" ON public.inventory FOR UPDATE USING (true);
CREATE POLICY "Demo insert volunteer_tasks" ON public.volunteer_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Demo update volunteer_tasks" ON public.volunteer_tasks FOR UPDATE USING (true);
CREATE POLICY "Demo insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Enable realtime for shipments, inventory, and volunteer_tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteer_tasks;

-- Auto-update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_camps_updated_at BEFORE UPDATE ON public.camps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_volunteer_tasks_updated_at BEFORE UPDATE ON public.volunteer_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
