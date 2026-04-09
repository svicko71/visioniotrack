
-- Urban detections table
CREATE TABLE public.urban_detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  detection_type TEXT NOT NULL CHECK (detection_type IN ('waste', 'empty_land', 'construction_activity', 'structural_damage')),
  confidence NUMERIC NOT NULL DEFAULT 0,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  image_url TEXT,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'investigating')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.urban_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view detections" ON public.urban_detections FOR SELECT USING (true);
CREATE POLICY "Auth users can create detections" ON public.urban_detections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own detections" ON public.urban_detections FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_urban_detections_updated_at BEFORE UPDATE ON public.urban_detections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Donations marketplace table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('wood', 'plants', 'furniture', 'building_materials', 'other')),
  image_url TEXT,
  condition TEXT DEFAULT 'good' CHECK (condition IN ('new', 'good', 'fair', 'poor')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'used')),
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Auth users can create donations" ON public.donations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own donations" ON public.donations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own donations" ON public.donations FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Urban alerts table
CREATE TABLE public.urban_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  detection_id UUID REFERENCES public.urban_detections(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('hazard', 'illegal_activity', 'structural_risk', 'environmental')),
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.urban_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view alerts" ON public.urban_alerts FOR SELECT USING (true);
CREATE POLICY "Auth users can create alerts" ON public.urban_alerts FOR INSERT WITH CHECK (true);

-- AI matches table
CREATE TABLE public.ai_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  detection_id UUID REFERENCES public.urban_detections(id) ON DELETE CASCADE,
  donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE,
  recommendation TEXT NOT NULL,
  match_score NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'accepted', 'rejected', 'implemented')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view matches" ON public.ai_matches FOR SELECT USING (true);
CREATE POLICY "Auth users can create matches" ON public.ai_matches FOR INSERT WITH CHECK (true);

-- Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.urban_alerts;
