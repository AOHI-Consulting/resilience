# Resilience Room

Student demo for Digital Developments (LDD), class 8 "The importance of resilience", 19 Oct 2026.
The brief: what are resilience challenges for the hotel school? Build a demo web page with a dashboard to track & trace resilience KPIs, in max 2 hours, using an LLM.

Live: https://aohi-consulting.github.io/resilience/ · phone form: `/report.html`

## What is on the page

- **Overview**: resilience index (average of six areas) with its trend, plus a tile per area: Cyber & data, Digital learning, Campus & training ops, People, Finance & intake, Reputation & trust.
- **Stress test**: six scenarios (ransomware, Sakai down in exam week, phishing wave, intake −30%, power cut, key IT person leaves). Each moves the KPIs and index, adds a live incident to Track & trace, and compares recovery time with and without a playbook against the recovery target.
- **Top resilience challenges**: 10 risks on a likelihood × impact matrix.
- **Track & trace**: incidents from start → detected → contained → recovered → lesson learned, timed against a recovery target.
- **All KPIs**: 24 KPIs with target, status, sparkline, owner and "why it matters".
- **Live from the room**: QR code to `report.html`. Reports land in Supabase and show up on the dashboard within ~4 seconds. Presenter code hides a post.
- **Lessons from Marriott**: the Starwood (2014–2018) and franchise-login (2020) breaches mapped to KPIs.

All KPI values are demo data in `assets/data.js`. Change numbers there; nothing else needs touching.

## Tech

Plain HTML/CSS/JS, no build. `python3 -m http.server` to run locally.
Live reports: Supabase project `block-a-notes` (ref fziyuauwrfdmiomwelij), table `resilience_reports` behind three RPCs (`resilience_report`, `resilience_feed`, `resilience_hide`). Setup: `supabase/reports.sql`. Presenter code: LDD8.

Clear all reports before a session (SQL editor): `delete from public.resilience_reports;`
