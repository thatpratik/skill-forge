## Language & Runtime

TypeScript (Node.js) — used only for supporting tooling/scripts in the repo (e.g. validating skill folders, generating a manifest). Skills themselves are authored as Markdown + YAML frontmatter (`SKILL.md`), not code, and need no runtime to work.

## Architecture Principles

- Each skill is a flat, self-contained folder — no shared code or cross-skill dependencies unless a skill genuinely needs it.
- A skill must be usable via plain file copy — no build step required to install or run it.
- Add tooling only when a skill or the repo genuinely needs it; don't build infrastructure speculatively.

## Fixed Dependencies

None yet — no specific libraries chosen.
