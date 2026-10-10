# Claude Code skills

A collection of [skills](https://docs.claude.com/en/docs/claude-code/skills) for [Claude Code](https://claude.com/claude-code). Each skill lives in its own folder under `skills/` and has its own README.

## Skills

| Skill | What it does |
|---|---|
| [`/plan-trip`](skills/plan-trip) | Visa-aware trip planner for any passport. It checks entry rules live, then writes a day-by-day itinerary with Google Maps links, a budget and a survival kit, and opens it as a browser preview. |

## Install

Clone once:

```bash
git clone https://github.com/aymanesarrar/claude-skills.git
mkdir -p ~/.claude/skills
```

Install one skill:

```bash
cp -R claude-skills/skills/plan-trip ~/.claude/skills/
```

Or install all of them:

```bash
cp -R claude-skills/skills/* ~/.claude/skills/
```

Restart Claude Code and the skills appear as `/<skill-name>`. To install a skill for one project only, copy its folder into `<project>/.claude/skills/` instead of `~/.claude/skills/`.

To update, run `git pull` in `claude-skills/` and repeat the copy.

## Adding a skill

Each skill is a folder under `skills/`:

```
skills/<skill-name>/
├── SKILL.md      # required: frontmatter (name, description) + instructions
├── README.md     # for humans: what it does, usage, examples
└── …             # optional templates, scripts, reference files
```

Add a row to the table above when you add one.

## License

[MIT](LICENSE)
