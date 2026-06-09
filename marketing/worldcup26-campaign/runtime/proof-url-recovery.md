# WorldCup26 Proof URL Recovery

Generated: 2026-06-08 09:54 +0300

- Pending private X proof rows: 1
- Referral code: `26BC4B90CB`

## 2026-06-07 01:40 +0300 Dexter / X / public fallback

- Pulse: `dexter_pulse65`
- X profile: https://x.com/NervixAi
- X live search: https://x.com/search?q=%22dexter_pulse65%22%20from%3ANervixAi&src=typed_query&f=live
- Web search: https://www.google.com/search?q=site%3Ax.com%2FNervixAi%2Fstatus%20%22dexter_pulse65%22

Current proof:

```text
private-x-note: posted from logged-in Semenescu Dan / @NervixAi X compose at 2026-06-07 01:39 EEST; browser returned to https://x.com/home after clicking Postează; text included code 26BC4B90CB and https://worldcup26.world/login?ref=26BC4B90CB with x-public-fallback utm_content=dexter_pulse65; public permalink pending because X profile timeline kept loading
```

After the public URL is visible:

```bash
node campaign-proof-log.mjs --pulse "dexter_pulse65" --proof-url "PUBLIC_X_STATUS_URL" --status "posted" --force
```

## Rule

Use this board only to replace private proof with a public permalink after the public post URL is visible. Do not invent a URL.
