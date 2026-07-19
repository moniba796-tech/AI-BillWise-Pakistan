// Supabase Edge Function: voice-assistant
// Proxies chat messages to Groq's API (OpenAI-compatible, has a free tier
// with no credit card required) so the API key never sits in frontend code.
//
// Deploy with:
//   supabase functions deploy voice-assistant
// Set the secret with:
//   supabase secrets set GROQ_API_KEY=gsk_xxxxx

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tum "BillWise Assistant" ho — Pakistan mein bijli (WAPDA/K-Electric) ke bills se
mutaliq sawalon ka jawab dene wale ek madadgar assistant. Tumhare jawabat:
- Roman Urdu ya Urdu script mein ho (jaisa user poochay), chota aur seedha rakho.
- Bijli ki units, slabs, fuel adjustment, taxes, saving tips, solar panels,
  appliances ki consumption jaisay topics par focus rakho.
- Agar sawal bijli/bill se related na ho, to politely bata do ke tum sirf
  bijli bill se mutaliq madad kar sakte ho.
- Kabhi bhi lambi essay na likho — 3-5 chotay points ya 2-3 chotay paragraphs kaafi hain.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Server not configured: GROQ_API_KEY missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        max_tokens: 600,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: "Groq API error", detail: errText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});