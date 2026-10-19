# Resilience Room

Student demo for Digital Developments (LDD), class 8 "The importance of resilience", 19 Oct 2026.
The brief: what are resilience challenges for the hotel school? Build a demo web page with a dashboard to track & trace resilience KPIs, in max 2 hours, using an LLM.

Live: https://aohi-consulting.github.io/resilience/ · phone form: `/report.html`

## What is on the page (v2, cyber first)

App layout with a sidebar; one page at a time; ← → keys move between pages like slides, F = full screen, Esc ends a simulation.

- **Command centre**: cyber resilience score (gauge), the six NIST CSF 2.0 functions, key KPI tiles, blocked phishing chart, top cyber risks, a strip for the wider resilience areas.
- **Challenges**: 10 risks on a likelihood × impact matrix (6 cyber, incl. R5: confusing platform + scattered messages).
- **Defences**: 18 KPIs, 3 per NIST function (Govern, Identify, Protect, Detect, Respond, Recover).
- **Attack surface**: 8 school systems with data sensitivity, two-step login, patching, supplier review.
- **Track & trace**: incidents from start → detected → contained → recovered → lesson.
- **Attack simulator**: 5 attacks. Each shows the attack chain with the control that would stop each step, the score drop, and recovery with vs without a playbook. A red banner follows you on every page while it runs.
- **Human factor**: "a confusing platform is a security risk" (the students' real problem), click rate by group, five fixes.
- **Live from the room**: QR → `report.html`: "Spot the phish" (3 e-mails, real or fake) then a problem report. Results appear within ~4 s.
- **Wider resilience**, **Marriott case** (two timelines), **How it works**.

All numbers are demo data in `assets/data.js`.

## Tech

Plain HTML/CSS/JS, no build. `python3 -m http.server` to run locally.
Live reports: Supabase project `block-a-notes` (ref fziyuauwrfdmiomwelij), table `resilience_reports` behind three RPCs (`resilience_report`, `resilience_feed`, `resilience_hide`). Setup: `supabase/reports.sql`. Presenter code: LDD8.

Clear all live answers before a session (SQL editor): `delete from public.resilience_reports; delete from public.resilience_quiz;`
