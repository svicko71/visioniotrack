import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { image_base64, image_url } = await req.json();
    if (!image_base64 && !image_url) {
      return new Response(JSON.stringify({ error: "image_base64 or image_url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build vision message
    const userContent: any[] = [
      {
        type: "text",
        text: `You are VisionTrack AI, an expert image classification system. Analyze this image and return a JSON object with:
- "predicted_class": the most likely category/object in the image (e.g. "cat", "car", "building", "person", "food", "landscape", etc.)
- "confidence": a number between 0 and 1 representing your confidence
- "description": a brief 1-2 sentence description of what you see
- "all_predictions": an array of top 5 predictions, each with "class" and "confidence" fields

Return ONLY valid JSON, no markdown or extra text.`,
      },
    ];

    if (image_base64) {
      userContent.push({
        type: "image_url",
        image_url: { url: image_base64.startsWith("data:") ? image_base64 : `data:image/jpeg;base64,${image_base64}` },
      });
    } else if (image_url) {
      userContent.push({ type: "image_url", image_url: { url: image_url } });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: userContent }],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted. Add funds in Settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI error:", status, t);
      return new Response(JSON.stringify({ error: "AI classification failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response (strip markdown fences if present)
    let result;
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      result = { predicted_class: "unknown", confidence: 0, description: raw, all_predictions: [] };
    }

    // Save to DB if auth token provided
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("classifications").insert({
            user_id: user.id,
            image_url: image_url || null,
            predicted_class: result.predicted_class,
            confidence: result.confidence,
            model_used: "gemini-2.5-flash",
            all_predictions: result.all_predictions || [],
          });
        }
      } catch (e) { console.error("DB save error:", e); }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("classify error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
