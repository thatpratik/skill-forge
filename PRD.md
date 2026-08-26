## Problem Statement

Developers setting up a repository that uses AI coding agents (primarily Claude Code and compatible tooling) currently have to manually copy and configure each reusable skill one at a time. This manual work is repetitive across projects, and has to be repeated in full every time a new developer joins a team and needs to set up the same environment.

## Solution

SkillForge is a central, installable repository of reusable, self-contained AI-agent skills and workflows. It is installable through the existing `npx skills add` ecosystem — either as the full collection or as individual skills — so a repo's agent tooling can be set up (or an onboarding developer's environment matched to the team) with a single command instead of manual copying.

## User Stories

1. As a developer setting up a new repo, I want to install the entire skill collection with one command, so that my agent tooling is ready without manual copying.
2. As a developer, I want to install a single specific skill (e.g. `npx skills add <repo-url> --skill code-review`), so that I only bring in what's relevant to my project.
3. As a developer onboarding a new team member, I want them to run the same install command, so that their environment matches the team's setup with no manual steps.
4. As a skill author, I want each skill to be self-contained and documented in its own folder, so that it's easy to discover, understand, and maintain independently of others.
5. As a maintainer, I want the library to grow over time with new skills and workflows without restructuring existing ones.

## Implementation Decisions

- Install command: `npx skills add https://github.com/thatpratik/skill-forge` installs the full collection.
- Install command: `npx skills add https://github.com/thatpratik/skill-forge --skill <name>` installs a single named skill.
- The `npx skills add` CLI already exists as an external tool; this repository only needs to be structurally compatible with it — the CLI itself is not built here.
- Installed skills land under `.claude/skills/<name>/` in the target repo. Claude Code auto-discovers any `SKILL.md` there at the start of a session, so no extra registration step is required.
- v1 seed content is the existing `idea-to-prototype` bundle of skills: `clarify-prd`, `clarify-constitution`, `suggest-next-iteration`, and `diary`. At least 10 more skills will be added over time.
- Verified end-to-end (2026-08-26): `npx skills add` requires no root-level manifest/index file — it auto-discovers every `SKILL.md` via a flat scan of `skills/`. Confirmed by running both the full-collection (`--all`) and single-skill (`--skill <name>`) flows against the local path and against the GitHub remote, with `.claude/skills/<name>/SKILL.md` landing byte-identical to the source in both cases.

## Out of Scope

- Building the `npx skills add` CLI tool itself.
- Any centralized registry/discovery service beyond the GitHub repository.

## Further Notes

- Future skill categories may include frontend development, architecture, code review, planning, testing, Git workflows, documentation, and debugging.
