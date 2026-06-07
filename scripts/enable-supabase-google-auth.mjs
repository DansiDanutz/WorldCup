const projectRef = requireEnv("SUPABASE_PROJECT_REF", process.env.SUPABASE_PROJECT_REF);
const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL).replace(/\/$/, "");
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function patchGoogleProvider() {
  const token = requireEnv("SUPABASE_ACCESS_TOKEN", accessToken);
  const clientId = requireEnv("GOOGLE_CLIENT_ID", googleClientId);
  const clientSecret = requireEnv("GOOGLE_CLIENT_SECRET", googleClientSecret);

  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_google_enabled: true,
      external_google_client_id: clientId,
      external_google_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase auth config update failed with ${response.status}: ${text}`);
  }
}

async function verifyGoogleProvider() {
  const key = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey);
  const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
    headers: { apikey: key },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase auth settings check failed with ${response.status}: ${text}`);
  }

  const settings = await response.json();
  const enabled = settings.external?.google === true;

  if (!enabled) {
    throw new Error("Supabase accepted the request, but /auth/v1/settings still reports external.google=false.");
  }
}

async function main() {
  console.log("Enabling Google Auth for the configured Supabase project.");
  await patchGoogleProvider();
  await verifyGoogleProvider();
  console.log("Google Auth is enabled in Supabase.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
