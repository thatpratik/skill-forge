# SkillForge

A central, installable repository of reusable AI-agent skills and workflows, primarily for
Claude Code and compatible agent tooling. Instead of manually copying and configuring each
skill into every repo (and repeating that for every new teammate), install what you need with
one command.

## Install

Install the entire collection:

```
npx skills add https://github.com/pratiksharma/skillforge
```

Install a single skill:

```
npx skills add https://github.com/pratiksharma/skillforge --skill <name>
```

Installed skills land in `.claude/skills/<name>/`, where Claude Code picks them up
automatically at the start of a session — no extra registration step required.

## Skills

| Skill | Description |
| --- | --- |
| `clarify-prd` | Interviews the user from raw vision down to a concrete why and what, then writes PRD.md (with approval). The starting point for a greenfield project. |
| `clarify-constitution` | Interviews the user to establish the project constitution — language, stack, and architecture standards that stay fixed across all tasks — then writes CONSTITUTION.md (with approval). |
| `suggest-next-iteration` | Suggests the next iteration to build, based on PRD.md and CONSTITUTION.md. Use after a PRD exists and the user wants to know what to build next. |
| `diary` | Write and maintain an implementation diary capturing what changed, why, what worked, what failed, what was tricky, and how to review and validate. |
