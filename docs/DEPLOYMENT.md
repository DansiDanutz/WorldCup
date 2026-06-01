# Deployment

The recommended production host is Vercel.

## Production Environment Variables

Set these in Vercel Project Settings:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_RESULT_SECRET
CRON_SECRET
RESULT_API_URL
RESULT_API_KEY
```

Required immediately:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_RESULT_SECRET`
- `CRON_SECRET`

Optional until a real result provider is connected:

- `RESULT_API_URL`
- `RESULT_API_KEY`

## Security Rules

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe for browser reads because Row Level Security is enabled.
- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser.
- `ADMIN_RESULT_SECRET` protects manual result submission.
- `CRON_SECRET` protects scheduled result ingestion.

## Vercel Cron

`vercel.json` schedules:

```json
{
  "path": "/api/cron/results",
  "schedule": "0 * * * *"
}
```

This checks due matches every hour.

Vercel calls cron endpoints with:

```http
Authorization: Bearer <CRON_SECRET>
```

The app validates that header before doing any work.

## Health Check

After deployment, verify:

```http
GET /api/health
```

Expected response:

```json
{
  "ok": true,
  "service": "worldcup",
  "database": "available"
}
```

## Manual Deployment Checklist

1. Connect GitHub repository `DansiDanutz/WorldCup` to Vercel.
2. Add the required environment variables.
3. Deploy `main`.
4. Open `/api/health`.
5. Open `/` and confirm teams, matches, and leaderboard load.
6. Confirm the Vercel Cron job appears in the production deployment.
7. Run one protected cron test:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<deployment-url>/api/cron/results
```

8. Run one protected admin test only on a known safe test match or staging project.

## Plan Notes

Hourly cron requires a Vercel plan that supports hourly cron frequency. If the deployed project is on a plan that only supports daily cron, either upgrade the plan or use an external scheduler that can call `/api/cron/results` with the `CRON_SECRET` header.

