---
name: plan-trip
description: Plans a visa-aware trip to one or more countries for any passport — checks entry rules live against official sources for the traveller's nationality (including dual nationals), then writes a day-by-day itinerary with named places and Google Maps links, a places list, budget estimate and survival kit, and opens it as a browser preview. Use when the user runs /plan-trip, asks to plan a trip or itinerary to specific countries, or asks whether they can enter a country with their passport.
argument-hint: <countries, comma-separated> --passport <country|code>[,<second passport>] [--days 7] [--budget 15000 MAD] [--from <airport>] [--interests food,history]
---

# Plan Trip

Arguments: `$ARGUMENTS`

## 1. Parse inputs

Be forgiving: accept typos, extra spaces, any case, and "czesh"-style misspellings, and normalize them (Czechia, United Arab Emirates, …).

- **Countries** (required): everything before the first `--`, comma-separated. If none are given, ask.
- `--passport` (required): a country name, nationality or ISO code (`Morocco`, `moroccan`, `MA`, `Nigeria`, `IN`, …). Dual nationals can pass several: `--passport MA,FR`.
  - If it's missing, **ask once** ("Which passport(s) will you travel on?"). Don't assume one; visa results depend entirely on it.
  - With several passports, check every destination against each one, use the easiest per country, and say which passport to show where. Remind them to enter and exit each country on the same passport.
- `--from` departure airport. Default: the main international airport of the (first) passport country (e.g. MA → CMN, NG → LOS, PK → ISB). If they live elsewhere they should pass `--from`. State the assumption.
- `--budget` amount + currency (any ISO currency). Default: no budget. Then give the estimate without a fits/tight/over verdict. The default currency is the passport country's own.
- `--days` total trip length. Default 7, or 3–4 days per country if that's longer. State the split per country.
- `--interests` any of history, nature, beaches, nightlife, food. Default: balanced.

Don't ask about anything except missing countries or passport. State every assumption at the top of the output.

## 2. Visa check — never from memory

Visa rules change without notice (e.g. Thailand dropped visa-free entry for Moroccans on 2026-09-15). For **each passport × country** pair:

1. WebSearch (send all searches in one turn): `"<nationality> citizens <country> visa requirements <current year>"`, plus one search aimed at the official source (MFA, immigration department, e-visa portal).
2. Prefer official government pages > recent news citing a gazette/press release > aggregators. Note dates.
3. Classify: `Visa-free` · `e-Visa (easy)` · `Conditional` (e.g. needs a valid Schengen/US/UK visa) · `Visa required`.
4. Record: rule, allowed stay, conditions, fee if known, official source URL, confidence (`high` = official source found; `medium` = recent sources agree; `low` = sources conflict).
5. If sources conflict, say so, pick the **more restrictive** reading, and mark `low`.
6. If trip days in a country exceed its allowed stay, warn.

**Shared visa zones:** if several destinations share one visa (Schengen, the planned GCC visa, the CA-4 in Central America, the ECOWAS free-movement area, …), check it once. Explain which consulate to apply to (where they spend the most nights; on a tie, the first entry point) and that the stay limit is combined across the zone.

If any country is `Visa required`, still produce the plan but put the visa step first in its section: where and how to apply, the fee, and a realistic lead time including appointment waits.

Check transit rules for likely connecting airports. Some passports need airport-transit visas (e.g. the Schengen Annex IV list, UK DATV, and US transit, which needs a C-1 or a visa).

## 3. Plan

- **Itinerary**: day-by-day, morning/afternoon/evening. Reorder the countries if the given order zig-zags, and say so. Cluster by area and include travel days between countries with mode and rough duration. Keep the arrival day light; the last day is departure. If there are too many countries for the days, say so and show where extra days would go.
- **Places**: every itinerary stop is a specific, named place, not "explore the old town". Link each place name in the itinerary to Google Maps: `https://www.google.com/maps/search/?api=1&query=<URL-encoded "Place name, City">`. Never invent coordinates or addresses. Only use real places you're confident still exist; for restaurants, markets and anything small, confirm with a quick WebSearch that it's open (not "permanently closed"). Under each day add a **Day route** link: `https://www.google.com/maps/dir/?api=1&origin=<first>&destination=<last>&waypoints=<mid1>|<mid2>&travelmode=walking` (use `transit` if stops are far apart).
- **Places list**: after the itinerary, list every place grouped by city, with: type (sight / museum / food / market / viewpoint / nature), area, why go (one line), time needed, cost tier (free / € / €€ / €€€), and a booking tip ("timed ticket — book online", "closed Mondays", "cash only"). Mark booking-required places ⚠.
- **Budget** (in the user's currency, as ranges, labelled as estimates, no live prices): flights from origin (including inter-country legs), accommodation per night × nights, daily spend × days, visa fees, and mandatory insurance. Compare to budget → `fits` / `tight` / `over`. If the main flight is >40% of budget or long-haul, add "Flights eat the budget on long-haul" with a concrete suggestion.
- **Survival kit** per country: money (cash vs card, ATMs, **decline DCC**, currency restrictions), 2–3 common scams, local etiquette, SIM/eSIM, and the main ride-hailing app. Add nationality-relevant notes where useful, e.g. halal/kosher/vegetarian availability, or whether the traveller's home SIM roams there.

## 4. Output

1. Write to `./trips/<passport>-<countries-slug>-<YYYY-MM-DD>.md` (create `trips/` if missing) using [TEMPLATE.md](TEMPLATE.md).
2. Preview it in the browser. Run `node <this skill's base directory>/scripts/preview.mjs <the .md path>`. It writes a styled `.html` next to the `.md` (tables, dark mode, print-to-PDF and download buttons) and opens it in the default browser. If `node` is missing or the command fails, tell the user the `.md` path and continue. If they say they don't want the browser to open, add `--no-open`.
3. Reply in chat with: the absolute paths of both files, a one-line visa verdict per country (naming the passport used, if several), the budget fit, and any blocker.

Every visa section must end with: **"Rules change — verify on the official source before booking: <link>"**.

## Examples

- `/plan-trip Georgia, Azerbaijan --passport MA --days 10 --budget 15000 MAD` → from CMN
- `/plan-trip Japan, South Korea --passport Nigeria --from LHR --budget 3000 GBP` → Nigerian living in the UK
- `/plan-trip Austria, Czechia, Hungary --passport MA,FR` → dual national; French passport for Schengen
- `/plan-trip Malaysia, Indonesia --passport pakistani --interests food,nature`
