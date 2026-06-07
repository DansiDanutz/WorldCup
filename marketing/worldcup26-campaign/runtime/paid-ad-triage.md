# WorldCup26 Paid Ad Triage

Generated: 2026-06-07 20:44 +0300

- State: `critical-paid-signup-friction`
- Referral code: `26BC4B90CB`
- App views: 509
- Referral views: 171
- Paid-source views: 244
- Signup saves: 0
- Accepted referrals: 0
- Dashboard state: `paid-clicks-no-signups`
- Dashboard checks: 2
- Dashboard impressions: 12
- Dashboard clicks: 227
- Dashboard spend: 31.78
- Top source: -
- Top signup source: -

This is an operator triage page. It proves paid delivery only after Memo records real dashboard status, spend, impressions, clicks, landing URL, and screenshot/note details.

## Meta Ads Manager

- Manager: https://adsmanager.facebook.com/adsmanager/manage/ads/edit/standalone?act=61071192&ads_manager_write_regions=true&nav_entry_point=lep_176&selected_ad_ids=6971048413400&nav_source=unknown
- Landing URL: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=meta&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h
- Landing guard: unknown

- Campaign, ad set, and ad are active or scheduled.
- Landing URL includes ref=26BC4B90CB and utm_source=meta.
- Creative text leads with free 3-team picks and private points preview.
- Dashboard shows impressions, clicks, spend, CTR, delivery status, and rejection warnings.

### Decision Rules

- No impressions: check budget, schedule, audience, approval status, and whether Meta Ads Manager is paused.
- Impressions but zero clicks: change hook/creative toward 'Pick 3 teams free first' and try a stronger football question.
- Clicks but no app views with this UTM source: landing URL is wrong, redirecting, blocked, or ad link tracking stripped.
- Clicks and app views but no signup saves: signup screen or Google auth friction is the next conversion problem.
- Rejected or limited delivery: fix the dashboard warning before adding more creative variants.

```bash
node campaign-paid-dashboard-intake.mjs --add --platform "meta" --status "active" --spend "0" --impressions "0" --clicks "0" --landing-url "https://worldcup26.world/login?ref=26BC4B90CB&utm_source=meta&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h" --warning "none" --screenshot-note "Meta Ads Manager checked at YYYY-MM-DD HH:mm EEST; screenshot/private note saved; campaign/ad ids=<ids>" --next-action "keep/change/fix"
```

## X Ads Manager

- Manager: https://ads.x.com/manager/18ce55rrs16/campaigns
- Landing URL: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=x&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h
- Landing guard: unknown

- Campaign exists inside account 18ce55rrs16.
- Campaign, ad group, and ad are active or scheduled.
- Landing URL includes ref=26BC4B90CB and utm_source=x.
- Dashboard shows impressions, clicks, spend, CTR, delivery status, and rejection warnings.

### Decision Rules

- No impressions: check budget, schedule, audience, approval status, and whether X Ads Manager is paused.
- Impressions but zero clicks: change hook/creative toward 'Pick 3 teams free first' and try a stronger football question.
- Clicks but no app views with this UTM source: landing URL is wrong, redirecting, blocked, or ad link tracking stripped.
- Clicks and app views but no signup saves: signup screen or Google auth friction is the next conversion problem.
- Rejected or limited delivery: fix the dashboard warning before adding more creative variants.

```bash
node campaign-paid-dashboard-intake.mjs --add --platform "x" --status "active" --spend "0" --impressions "0" --clicks "0" --landing-url "https://worldcup26.world/login?ref=26BC4B90CB&utm_source=x&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h" --warning "none" --screenshot-note "X Ads Manager checked at YYYY-MM-DD HH:mm EEST; screenshot/private note saved; campaign/ad ids=<ids>" --next-action "keep/change/fix"
```
