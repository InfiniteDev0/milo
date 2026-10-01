// Delivers what Supabase's cron found due (migration 0013). It never decides what to send — it signs and sends.

import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

// a timer is news for a quarter of an hour; a phone that wakes later than that gets nothing
const TTL = 15 * 60;

export async function POST(request) {
  const secret = process.env.PUSH_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response(null, { status: 401 });
  }

  webpush.setVapidDetails(
    "https://miloplanner.vercel.app",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const { pushes = [] } = await request.json();
  const results = await Promise.allSettled(
    pushes.map(({ endpoint, p256dh, auth, title, body, tag }) =>
      webpush.sendNotification(
        { endpoint, keys: { p256dh, auth } },
        JSON.stringify({ title, body, tag, url: "/daily" }),
        { TTL, urgency: "high" },
      ),
    ),
  );

  // 404 and 410 mean the device is gone for good
  const gone = pushes
    .filter((_, i) => [404, 410].includes(results[i].reason?.statusCode))
    .map((p) => p.endpoint);
  if (gone.length) {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    await db.rpc("forget_push", { secret, endpoints: gone });
  }

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return Response.json({ sent, gone: gone.length, failed: pushes.length - sent - gone.length });
}
