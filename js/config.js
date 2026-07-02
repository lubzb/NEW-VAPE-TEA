// ═══════════════════════════════════════════════════════
//  SUPABASE CONFIG
//  Replace the two values below with your own project's
//  credentials (Supabase Dashboard → Project Settings → API).
//  SUPABASE_ANON_KEY is safe to expose in client-side code —
//  it is the public "anon" key, not the service_role secret.
// ═══════════════════════════════════════════════════════
const SUPABASE_URL = 'https://iypdgvjhtwacbftddhla.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yoqyf9unN53Z4lgNTGXWhQ_u7DzipGF';

// Creates the Supabase client used by every other file.
// `sb` is intentionally not named `supabase` to avoid clashing
// with the global `supabase` object created by the CDN script.
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
