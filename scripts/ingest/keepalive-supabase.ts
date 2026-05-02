#!/usr/bin/env tsx
/**
 * Pings Supabase to keep the free-tier project from pausing after 7 days
 * of inactivity. A weekly GitHub Action runs this against the
 * `subscribers` table (a single SELECT count is enough to register activity).
 *
 * Reads SUPABASE_URL and SUPABASE_ANON_KEY from the environment.
 */

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY. " +
      "Set them as repository secrets and reference them in the workflow env.",
  );
  process.exit(1);
}

async function main() {
  // Hit a lightweight REST endpoint. We only need ANY query to count as activity.
  // `Prefer: count=exact` returns the row count without bodies.
  const target = `${url}/rest/v1/subscribers?select=*&limit=1`;
  const res = await fetch(target, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "count=exact",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`Supabase ping failed: ${res.status} ${res.statusText}`);
    if (body) console.error(body);
    process.exit(1);
  }

  console.log(
    `✓ Supabase ping ok (${res.status}). Project will stay active for another week.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
