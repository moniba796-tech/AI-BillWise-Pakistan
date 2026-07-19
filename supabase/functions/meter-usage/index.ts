// Supabase Edge Function: meter-usage
//
// Given a meter's friendly `meter_id` (the consumer/meter number printed on
// the bill) for the CURRENTLY LOGGED IN user, returns current unit usage.
//
// - If a real DISCO/smart-meter provider is configured (via the
//   METER_PROVIDER_URL + METER_PROVIDER_API_KEY secrets), this function
//   calls that provider and returns its live reading.
// - If no provider is configured (the default, since Pakistani DISCOs like
//   WAPDA/LESCO/K-Electric do not currently expose a public per-meter API),
//   it returns a clearly-labeled SIMULATED reading so the feature is still
//   fully testable end-to-end. Swap in a real provider later with zero
//   frontend changes.
//
// Deploy with:
//   supabase functions deploy meter-usage
// Optional real-provider secrets:
//   supabase secrets set METER_PROVIDER_URL=https://your-disco-provider/api
//   supabase secrets set METER_PROVIDER_API_KEY=xxxxx

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Deterministic-ish simulated reading so repeated checks within the same
// day/month look consistent rather than random every click.
function simulateReading(meterId: string) {
  let hash = 0;
  for (let i = 0; i < meterId.length; i++) {
    hash = (hash * 31 + meterId.charCodeAt(i)) >>> 0;
  }
  const now = new Date();
  const dayOfMonth = now.getDate();
  const hour = now.getHours();

  const baseDailyUnits = 8 + (hash % 12); // 8–19 units/day baseline
  const timeOfDayFactor = hour >= 18 || hour <= 6 ? 1.3 : 1.0; // evening AC/lights bump
  const unitsToday = Number((baseDailyUnits * timeOfDayFactor * (0.85 + (hash % 30) / 100)).toFixed(2));
  const unitsThisMonth = Number((baseDailyUnits * dayOfMonth * (0.9 + (hash % 20) / 100)).toFixed(2));
  const currentLoadKw = Number((0.4 + (hash % 25) / 10).toFixed(2));

  return { unitsToday, unitsThisMonth, currentLoadKw };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header — please sign in again." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Scoped to the calling user's JWT so RLS applies — this function can
    // only ever see/insert rows the logged-in user is allowed to touch.
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return json({ error: "Not authenticated." }, 401);
    }

    const { meterId, label } = await req.json();

    if (!meterId || typeof meterId !== "string" || !meterId.trim()) {
      return json({ error: "meterId is required" }, 400);
    }

    const cleanMeterId = meterId.trim();

    // Find or register this meter for the current user.
    let { data: meterRow, error: meterFetchError } = await supabase
      .from("meters")
      .select("id, meter_id, provider")
      .eq("meter_id", cleanMeterId)
      .maybeSingle();

    if (meterFetchError) {
      return json({ error: "Database error looking up meter", detail: meterFetchError.message }, 500);
    }

    if (!meterRow) {
      const { data: inserted, error: insertError } = await supabase
        .from("meters")
        .insert({
          user_id: user.id,
          meter_id: cleanMeterId,
          label: label ?? null,
          provider: "simulated",
        })
        .select("id, meter_id, provider")
        .single();

      if (insertError) {
        return json({ error: "Could not register meter", detail: insertError.message }, 500);
      }
      meterRow = inserted;
    }

    const providerUrl = Deno.env.get("METER_PROVIDER_URL");
    const providerApiKey = Deno.env.get("METER_PROVIDER_API_KEY");

    let reading: { unitsToday: number; unitsThisMonth: number; currentLoadKw: number };
    let isSimulated = true;

    if (providerUrl && providerApiKey) {
      // Real provider path — adjust the request/response shape to match
      // whatever DISCO/smart-meter API you actually have access to.
      try {
        const providerRes = await fetch(`${providerUrl}/meters/${encodeURIComponent(cleanMeterId)}/usage`, {
          headers: { Authorization: `Bearer ${providerApiKey}` },
        });
        if (!providerRes.ok) throw new Error(`Provider responded ${providerRes.status}`);
        const providerData = await providerRes.json();
        reading = {
          unitsToday: providerData.unitsToday,
          unitsThisMonth: providerData.unitsThisMonth,
          currentLoadKw: providerData.currentLoadKw,
        };
        isSimulated = false;
      } catch {
        // Provider unreachable — fall back to simulated so the user still
        // gets an answer, clearly labeled as such.
        reading = simulateReading(cleanMeterId);
        isSimulated = true;
      }
    } else {
      reading = simulateReading(cleanMeterId);
      isSimulated = true;
    }

    const { error: readingInsertError } = await supabase.from("meter_readings").insert({
      meter_id: meterRow.id,
      units_today: reading.unitsToday,
      units_this_month: reading.unitsThisMonth,
      current_load_kw: reading.currentLoadKw,
      is_simulated: isSimulated,
    });

    if (readingInsertError) {
      return json({ error: "Could not save reading", detail: readingInsertError.message }, 500);
    }

    return json({
      meterId: cleanMeterId,
      unitsToday: reading.unitsToday,
      unitsThisMonth: reading.unitsThisMonth,
      currentLoadKw: reading.currentLoadKw,
      isSimulated,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
