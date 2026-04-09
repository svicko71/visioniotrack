
-- Fix urban_alerts INSERT policy
DROP POLICY "Auth users can create alerts" ON public.urban_alerts;
CREATE POLICY "Auth users can create alerts" ON public.urban_alerts FOR INSERT TO authenticated WITH CHECK (true);

-- Fix ai_matches INSERT policy  
DROP POLICY "Auth users can create matches" ON public.ai_matches;
CREATE POLICY "Auth users can create matches" ON public.ai_matches FOR INSERT TO authenticated WITH CHECK (true);
