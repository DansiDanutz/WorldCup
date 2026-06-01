const DEFAULT_BASE_URL = "https://worldcup-ten-eta.vercel.app";
const baseUrl = (process.env.SMOKE_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
const runRateLimitProbe = process.argv.includes("--rate-limit");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchText(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();

  return { response, text };
}

async function checkPage(path, expectedText) {
  const { response, text } = await fetchText(path);

  assert(response.status === 200, `${path} expected 200, got ${response.status}`);
  assert(text.includes(expectedText), `${path} did not include "${expectedText}"`);

  return response;
}

async function checkHealth() {
  const { response, text } = await fetchText("/api/health");

  assert(response.status === 200, `/api/health expected 200, got ${response.status}`);

  const data = JSON.parse(text);
  assert(data.ok === true, "/api/health did not report ok=true");
  assert(data.database === "available", "/api/health did not report database=available");
}

async function checkAdminRejection() {
  const { response, text } = await fetchText("/api/admin/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });

  assert(response.status === 401, `/api/admin/accounts expected 401, got ${response.status}`);
  assert(text.includes("Admin authorization required"), "Admin rejection body changed unexpectedly");
}

async function checkSecurityHeaders(response) {
  const requiredHeaders = [
    "permissions-policy",
    "referrer-policy",
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
  ];

  for (const header of requiredHeaders) {
    assert(response.headers.has(header), `Missing security header: ${header}`);
  }
}

async function checkRateLimit() {
  const statuses = [];

  for (let index = 0; index < 35; index += 1) {
    const response = await fetch(`${baseUrl}/api/referrals/resolve?code=ZZZZZZ`);
    statuses.push(response.status);
  }

  assert(statuses.includes(429), `Expected at least one 429 from rate limiter, got ${statuses.join(",")}`);
}

async function main() {
  console.log(`Smoke testing ${baseUrl}`);

  const homeResponse = await checkPage("/", "Choose 3 Teams");
  await checkPage("/admin", "WorldCup");
  await checkHealth();
  await checkAdminRejection();
  await checkSecurityHeaders(homeResponse);

  if (runRateLimitProbe) {
    await checkRateLimit();
  }

  console.log("Production smoke checks passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
