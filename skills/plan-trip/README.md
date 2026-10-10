# /plan-trip — a visa-aware trip planner skill for Claude Code

Most travel tools assume you hold a powerful passport. This [Claude Code](https://claude.com/claude-code) skill starts from **your** passport. It checks whether you can actually get into each country, then plans the trip.

```
/plan-trip Georgia, Azerbaijan --passport Morocco --days 10 --budget 15000 MAD
```

You get a Markdown plan that also opens in your browser as a clean, printable page:

- **Entry requirements, checked live every run.** Each country is classified as `Visa-free` / `e-Visa (easy)` / `Conditional` / `Visa required`. Each rule comes with its source link, a confidence level, and any conflicts between sources. Rules are never answered from memory.
- **Shared visa zones handled.** For Schengen and similar zones it tells you which consulate to apply to and that the stay limit is shared across the zone. It also checks transit visas for likely connections.
- **Day-by-day itinerary** with real, named places linked to Google Maps, plus a "Day route" link for each day.
- **Places list** for each city: what each place is, time needed, cost tier, and booking tips.
- **Budget estimate** in your currency (flights, trains, stays, daily spend, visa fees), marked fits / tight / over, with a warning when long-haul flights eat the budget.
- **Survival kit** for each country: money tips (cash vs card, ATMs, always decline DCC), common scams, etiquette, SIM and ride-hailing apps.

## Install

Requires Claude Code. `node` is optional; it's only used for the browser preview.

```bash
git clone https://github.com/aymanesarrar/claude-skills.git
mkdir -p ~/.claude/skills
cp -R claude-skills/skills/plan-trip ~/.claude/skills/
```

Restart Claude Code. `/plan-trip` will then be available in every project. To install it for one project only, copy the `plan-trip` folder into `<project>/.claude/skills/` instead.

To update:

```bash
cd claude-skills && git pull && cp -R skills/plan-trip ~/.claude/skills/
```

## Usage

```
/plan-trip <countries, comma-separated> --passport <country|code>[,<second passport>]
           [--days 7] [--budget <amount> <currency>] [--from <airport>]
           [--interests history,nature,beaches,nightlife,food]
```

| Option | Default |
|---|---|
| `--passport` | **Required.** Country name, nationality or ISO code (`Morocco`, `nigerian`, `PK`). Dual nationals pass both: `MA,FR`. Claude asks if it's missing. |
| `--from` | Main international airport of your passport country |
| `--budget` | None. Without it you get an estimate with no fits/tight/over verdict. |
| `--days` | 7, or 3–4 per country if that's longer |
| `--interests` | Balanced |

You can also just ask in plain words: *"plan me 10 days in Japan and Korea, I have a Nigerian passport and live in London"*.

### Examples

```
/plan-trip Austria, Czechia, Poland, Hungary --passport MA --budget 25000 MAD --interests history,food
/plan-trip Japan, South Korea --passport Nigeria --from LHR --budget 3000 GBP
/plan-trip Malaysia, Indonesia --passport pakistani --interests food,nature
/plan-trip Austria, Czechia, Hungary --passport MA,FR
```

Plans are saved to `./trips/` in your current folder as `.md` and `.html`.

## ⚠️ Visa information disclaimer

Visa rules change without notice. For example, Thailand ended visa-free entry for Moroccan citizens on 15 September 2026. This skill searches current sources on every run and links the official source for each rule. It can still be wrong, especially when sources conflict, and it marks those cases. **Always confirm on the official government source before you book or travel.** This is not legal or immigration advice.

Prices are rough estimates, not live quotes.

## How it works

```
plan-trip/
├── SKILL.md              # Instructions Claude follows: parsing, visa check, planning, output
├── TEMPLATE.md           # Structure of the generated plan
└── scripts/preview.mjs   # Renders the .md to a styled .html and opens your browser (no npm deps)
```

The preview page loads [marked](https://github.com/markedjs/marked) and [DOMPurify](https://github.com/cure53/DOMPurify) from jsDelivr. If you're offline, it falls back to the raw Markdown.

## Contributing

Issues and PRs are welcome. Especially useful: corrections to visa-handling logic, shared visa zones that are missing, and better survival-kit guidance for specific regions.

## License

[MIT](LICENSE)
