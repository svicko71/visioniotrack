import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a dataset labeling assistant for a face recognition system. Analyze the face image and return ONLY a JSON object with these fields:
{
  "fitzpatrick": "I-II" | "III" | "IV" | "V" | "VI",
  "quality": "Standard" | "Low-Quality" | "Surveillance",
  "age_group": "Child" | "Youth" | "Adult" | "Elderly",
  "gender": "Male" | "Female",
  "confidence": number between 0 and 1,
  "notes": string (any issues: blur, occlusion, lighting)
}
Return ONLY the JSON object, no explanation, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this face and return the JSON labels." },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      return new Response(JSON.stringify({ error: `AI error ${response.status}: ${t}` }), {
        status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let raw: string = data.choices?.[0]?.message?.content ?? "{}";
    raw = raw.replace(/```json\s*|\s*```/g, "").trim();
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch { parsed = { error: "parse_failed", raw }; }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
