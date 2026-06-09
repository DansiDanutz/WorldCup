# WorldCup26 Paid Dashboard Checks

Generated: 2026-06-08 09:50 +0300

- State: `paid-clicks-no-signups`
- Checks: 2/2
- Spend: 31.78
- Impressions: 12
- Clicks: 227
- Paid-source views: 751
- Signup saves: 0

Record only real dashboard observations. Use this to decide whether the paid problem is delivery, creative, tracking, or signup friction.

## Latest Checks

### Meta Ads Manager

- Time: 2026-06-07 17:47 +0300
- Status: active
- Spend: 31.78
- Impressions: 0
- Clicks: 227
- CTR: 0
- Landing: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=meta&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h&utm_content=three-team-question
- Warning: partial: Today range shows 227 link clicks and 0.14 lei per link click; spend inferred as 31.78 lei; impressions not visible in current table view
- Screenshot/note: Meta Ads Manager checked 2026-06-07 17:43 EEST; selected ad WorldCup26 - Pick 3 Teams Free First - Image active; date Astazi: 7 iun. 2026; 227 link clicks visible at 0.14 lei/click; budget 200 lei/day; proof screenshot runtime/proofs/meta-ads-today-227-clicks-20260607.png
- Next: paid clicks are arriving; inspect app referral landing and signup friction before changing creative

### X Ads Manager

- Time: 2026-06-07 15:52 +0300
- Status: appeal_requested
- Spend: 0
- Impressions: 12
- Clicks: 0
- CTR: 0
- Landing: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=x&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h
- Warning: X delivery is review-blocked: top ad halted after 12 impressions and appeal was requested; second ad is pending with appeal requested; link clicks remain zero.
- Screenshot/note: X Ads Manager checked 2026-06-07 15:52 EEST; selected campaign 41558061; ads table shows summary impressions=12 spend=€0.00 link_clicks=0; ad 2063599593947009378 Halted -> Appeal requested; ad 2063318732923949092 Pending / Appeal requested; proof screenshot runtime/proofs/x-adsmanager-appeal-requested-20260607-1552.png
- Next: Wait for X appeal/review or create a fresh compliant free-first campaign variant; do not rely on the halted/pending ads for signup volume.

## Log Commands

### Meta Ads Manager

- Manager: https://adsmanager.facebook.com/adsmanager/manage/ads/edit/standalone?act=61071192&ads_manager_write_regions=true&nav_entry_point=lep_176&selected_ad_ids=6971048413400&nav_source=unknown
- Landing: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=meta&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h

```bash
node campaign-paid-dashboard-intake.mjs --add --platform "meta" --status "active" --spend "0" --impressions "0" --clicks "0" --landing-url "https://worldcup26.world/login?ref=26BC4B90CB&utm_source=meta&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h" --warning "none" --screenshot-note "Meta Ads Manager checked at YYYY-MM-DD HH:mm EEST; screenshot/private note saved; campaign/ad ids=<ids>" --next-action "keep/change/fix"
```

### X Ads Manager

- Manager: https://ads.x.com/manager/18ce55rrs16/campaigns
- Landing: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=x&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h

```bash
node campaign-paid-dashboard-intake.mjs --add --platform "x" --status "active" --spend "0" --impressions "0" --clicks "0" --landing-url "https://worldcup26.world/login?ref=26BC4B90CB&utm_source=x&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h" --warning "none" --screenshot-note "X Ads Manager checked at YYYY-MM-DD HH:mm EEST; screenshot/private note saved; campaign/ad ids=<ids>" --next-action "keep/change/fix"
```
