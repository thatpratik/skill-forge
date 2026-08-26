# Diary: Bootstrap SkillForge — PRD, Constitution, and the first library scaffold

Goal: take SkillForge from a raw idea (a modular, installable library of reusable AI-agent
skills) through the greenfield process — clarify the PRD, lock in the constitution, then build
the first iteration: an actual, installable `skills/` library seeded with the four
bootstrapping skills used to run this process itself.

## Step 1: Clarify the PRD

**Author:** main

### Prompt Context

**Verbatim prompt:** "A modular library of reusable skills and workflows for AI coding agents. Each skill is independently installable and designed to improve software development, planning, architecture, testing, code review, and developer productivity."

**Interpretation:** The user wanted to define, from scratch, a product that packages reusable AI-agent skills into an installable library, and wanted the `/clarify-prd` skill's interview process to sharpen that into a concrete problem statement, solution, and scope.

**Inferred intent:** Get a written, approved `PRD.md` that would drive the rest of the greenfield workflow (constitution, iterations) without the agent inventing scope on its own.

### What I did

Ran the `/clarify-prd` interview loop: asked about the primary user and the actual pain point
(repeated manual setup of each skill per repo, and again for every new developer joining), then
asked what "one command" should mean concretely. The user supplied a detailed spec mid-interview,
including the exact install command shape (`npx skills add https://github.com/pratiksharma/skillforge`,
with a `--skill <name>` variant for installing a single skill), the target install location
(`.claude/skills/<name>/`), and confirmation that Claude Code auto-discovers skills there with no
extra registration step. I also confirmed the v1 seed content would be the four skills already
present in `greenfield/idea-to-prototype/skills/` (`clarify-prd`, `clarify-constitution`,
`suggest-next-iteration`, `diary`), with 10+ more skills to be added later, and that building the
`npx skills add` CLI itself is out of scope (it already exists; SkillForge only needs to be
structurally compatible with it). Summarized the resulting PRD, got explicit approval, and wrote
`/Users/pratiksharma/repos/skill-forge/PRD.md`.

### Why

The greenfield workflow requires a written, user-approved PRD before any implementation decisions
(constitution) or code get made, so that later steps have a concrete "why" and "what" to work
against instead of the agent guessing.

### What worked

Asking one focused question at a time (user vs. team, cost of the current manual process, what
"one command" means) surfaced a very concrete spec quickly — the user had clearly already thought
through the exact CLI shape and install target, which made the PRD nearly self-writing once asked.

### What didn't work

Nothing failed in this step; the interview converged in a handful of turns.

### What I learned

The `npx skills add` ecosystem tool already exists externally — SkillForge's job is only to be a
compatible *repository*, not to build tooling. This is an important scope boundary that's easy to
blur if not stated explicitly, since "add a CLI command" and "build a repo installable by that
command" sound similar but are very different bodies of work.

### What was tricky

Nothing especially tricky — the main judgment call was recognizing that "how does the install
target get populated" (`.claude/skills/<name>/`, auto-discovered by Claude Code) was a PRD-level
implementation decision worth capturing explicitly, even though it borders on being a technical
detail that might otherwise belong in the constitution.

### What warrants review

`/Users/pratiksharma/repos/skill-forge/PRD.md`, specifically the "Implementation Decisions"
section — it records an unresolved open question (whether the `npx skills add` tool needs a
root-level manifest file) that should be revisited before assuming the current flat `skills/`
folder structure is sufficient for real compatibility.

### Future work

Confirm whether the external `npx skills add` tool requires a manifest/index file at the repo
root, and if so, add it — this was deliberately deferred rather than guessed at.

## Step 2: Clarify the Constitution

**Author:** main

### Prompt Context

**Verbatim prompt:** "no it means I am not sure what programming language would be required to do that. I am asking you to decide it."

**Interpretation:** After running `/clarify-constitution` and asking about language/stack/architecture constraints, the user had no opinion on implementation language and explicitly delegated that decision to me, rather than leaving it unspecified.

**Inferred intent:** Get a real, usable `CONSTITUTION.md` in place rather than stalling on a decision the user didn't care to make themselves — but still wanted a deliberate choice, not a placeholder.

### What I did

Read `PRD.md` first (per the skill's instructions), asked the initial "what language and hard
constraints" prompt, and got an ambiguous "no constraints" answer. Asked one clarifying follow-up
to check whether that meant "no language at all" (since the repo is mostly Markdown/YAML
`SKILL.md` content, not application code) versus "no opinion, you decide." The user confirmed the
latter. I reasoned from the fact that the install mechanism (`npx skills add`) is Node/npm-based,
and picked TypeScript (Node.js) as the language for any supporting tooling/scripts, while noting
that skills themselves are Markdown + YAML content and need no runtime. Proposed three short
architecture principles (flat self-contained skill folders, installable via plain file copy with
no build step, no speculative tooling) and left "Fixed Dependencies" empty since none were
actually chosen. Got approval and wrote
`/Users/pratiksharma/repos/skill-forge/CONSTITUTION.md`.

### Why

The constitution exists to lock in decisions that shouldn't be re-litigated per iteration. Since
the user explicitly deferred the language choice, making a deliberate, justified decision here
(rather than leaving it open) avoids the question resurfacing during every future iteration.

### What worked

Grounding the language decision in the one hard constraint that *was* already fixed by the PRD
(the `npx skills add` tool is part of the Node/npm ecosystem) gave a principled reason for
TypeScript rather than picking arbitrarily.

### What didn't work

Nothing failed outright, but the first framing of the initial prompt's answer ("no contraints")
was genuinely ambiguous and needed a clarifying round-trip before it was clear the user wanted a
decision made on their behalf rather than no decision at all.

### What I learned

When a user delegates a technical decision explicitly ("I am asking you to decide it"), the right
move is still to ground the choice in something already established in the conversation (here,
the Node-based install tooling) rather than defaulting to a generic "safe" choice — it keeps the
constitution's rationale legible later.

### What was tricky

Distinguishing "the repo has no programming language" from "the user has no opinion on the
programming language" required an explicit follow-up question rather than assuming either reading.

### What warrants review

`/Users/pratiksharma/repos/skill-forge/CONSTITUTION.md` — specifically whether TypeScript is
still the right call once real tooling needs (e.g. a validation script, manifest generation) are
actually built in a later iteration.

### Future work

None beyond what's already tracked in the PRD's open question about a manifest file.

## Step 3: Scaffold the skill library and migrate the seed skills

**Author:** main

### Prompt Context

**Verbatim prompt:** "1"

**Interpretation:** After `/suggest-next-iteration` proposed three options, the user picked
option 1: scaffold the actual library structure and migrate the four seed skills into it,
without yet trying to prove `npx skills add` compatibility or add validation tooling.

**Inferred intent:** Get the smallest real slice of the product built — an actual, git-tracked,
installable-shaped `skills/` directory — before investing in verifying the install mechanism or
building tooling on top of it.

### What I did

Before planning, I scanned the repo and found that neither `.claude/skills/` (this session's own
skill copies) nor `greenfield/` (workshop reference material containing the original seed skills
under `greenfield/idea-to-prototype/skills/`) held any product content — both are gitignored, and
I confirmed via `git diff .gitignore` that the user had already staged `.claude` and was
mid-edit adding `greenfield` to `.gitignore` too, which corroborated that neither directory was
meant to ship as part of the actual library. I diffed the `.claude/skills/*` copies against
`greenfield/idea-to-prototype/skills/*` and confirmed they were byte-identical, and checked that
each of the four skills (`clarify-prd`, `clarify-constitution`, `suggest-next-iteration`,
`diary`) is a single self-contained `SKILL.md` file with valid `name`/`description` frontmatter
and no extra assets.

Entered plan mode, wrote the plan to
`/Users/pratiksharma/.claude/plans/typed-tinkering-bear.md`, and got it approved. Implementation:
created `/Users/pratiksharma/repos/skill-forge/skills/<name>/SKILL.md` for all four skills by
copying verbatim from `greenfield/idea-to-prototype/skills/<name>/SKILL.md` (via `cp`, after
`mkdir -p` for each of the four folders), and rewrote
`/Users/pratiksharma/repos/skill-forge/README.md` (previously just `# skill-forge`) to describe
the project, give both install command forms from the PRD
(`npx skills add https://github.com/pratiksharma/skillforge` and the `--skill <name>` variant),
and list the four skills with descriptions pulled straight from their frontmatter.

Verified with `find skills -type f` (exactly 4 files), a `diff` of each migrated file against its
source (all empty — verbatim copies), and `git status --short`, which showed `skills/` as
untracked-but-not-ignored and `README.md` as modified — confirming the library now lives in the
trackable, installable part of the repo rather than the gitignored dev/workshop directories.

### Why

This is the foundation the PRD's "one command install" promise depends on: without a real,
tracked `skills/` directory at the repo root, there's nothing for `npx skills add` to actually
install. Building this first (before trying to prove the install command works, or adding
validation tooling) follows the constitution's "no speculative infra" principle and the
suggest-next-iteration guidance to get something runnable/checkable end-to-end before layering
more on top.

### What worked

Confirming byte-identical content between the `.claude/skills` copies and the `greenfield` source
before migrating meant there was a single unambiguous source of truth to copy from, with no
risk of migrating a stale or diverged version.

### What didn't work

Nothing failed — this was a straightforward, mechanical scaffold (directory creation, file copies,
one README rewrite) once the plan was approved.

### What I learned

The repo's `.gitignore` already encoded the intended boundary between "process scaffolding"
(`.claude/`, `greenfield/`) and "actual product" before I made any changes — reading it (and its
pending uncommitted edit) was a cheap way to confirm where the real library needed to live,
rather than guessing at a new top-level convention.

### What was tricky

Nothing especially tricky in execution; the main judgment call already made in Step 1 (deferring
the manifest-file question) meant this iteration could stay intentionally minimal — a flat
`skills/<name>/SKILL.md` layout — without needing to resolve `npx skills add`'s exact
compatibility requirements yet.

### What warrants review

`/Users/pratiksharma/repos/skill-forge/skills/` (the four migrated `SKILL.md` files) and
`/Users/pratiksharma/repos/skill-forge/README.md` — worth checking that the install commands and
skill descriptions in the README stay in sync if any skill's frontmatter changes later. Nothing
in this step touched `.claude/skills/`, `greenfield/`, or `.gitignore` — those were left exactly
as they were.

### Future work

The next iteration (per the options already presented in `/suggest-next-iteration`) is either
proving `npx skills add` actually installs from this repo end-to-end (both full-collection and
single-skill flows), which would also resolve the deferred manifest-file question, or adding a
small validation script for skill folders before more skills are added. Neither has been started.
