# Diary: Verify the install mechanism end-to-end, then add a skill-folder validator

Goal: take the two follow-on iterations proposed by `/suggest-next-iteration` after the initial
scaffold — first prove that `npx skills add` actually installs this repo's skills (closing the
PRD's deferred manifest-file question), then add a small validation script so skill-folder drift
gets caught automatically as the collection grows.

## Step 1: Verify `npx skills add` works end-to-end

**Author:** main

### Prompt Context

**Verbatim prompt:** "Verify npx skills add works end-to-end"

**Interpretation:** After `/suggest-next-iteration` scanned the repo and proposed three options —
verify the install mechanism, add a validation script, or add more skills — the user picked
verifying that `npx skills add` actually installs this repo's skills end-to-end. This was the
option that could resolve the PRD's explicitly deferred "does this need a manifest file" question
and validate the core "one command install" promise before building anything further on top of an
unproven structure.

**Inferred intent:** Get concrete proof, not assumption, that the documented install commands in
`PRD.md`/`README.md` actually work, and close out the one open question left dangling from the
original PRD-writing session.

### What I did

Ran `npx skills add --help` to see the CLI's real flags, then `npx skills add . --list` from the
repo root, which found all 4 skills via a flat scan with no manifest file present. Tested a
full-collection install (`--all`) into a scratch project directory and confirmed
`.claude/skills/<name>/SKILL.md` landed correctly — as a symlink into a shared `.agents/skills/`
store when installing to many agents at once. Tested a single-skill install
(`--skill diary -a claude-code -y`) and confirmed a direct copy landed at
`.claude/skills/diary/SKILL.md`, byte-identical to the source, and confirmed the CLI's helpful
error listing when asked for a skill that doesn't exist (`--skill code-review`). Tested the actual
documented GitHub URL (`https://github.com/pratiksharma/skillforge`), which failed with an
authentication error because that repo doesn't exist, then tested the real git remote
(`https://github.com/thatpratik/skill-forge`, confirmed via `git remote -v`), which cloned and
listed skills successfully. Fixed the wrong URL in both `/PRD.md` and `/README.md`, and replaced
the PRD's "unresolved" manifest-file note with a confirmation that no manifest is needed —
verified end-to-end.

### Why

The PRD's "one command install" promise had never actually been exercised — the four skills
existed as files and the CLI existed as an external tool, but nothing had proven they worked
together. CONSTITUTION.md forbids speculative infrastructure, so given the deferred manifest
question and no validation tooling yet, the right move was to spend this iteration proving the
existing structure already works rather than building more on an unverified foundation.

### What worked

Testing all four install permutations end to end (local + full, local + single-skill, remote +
list, remote + clone) surfaced two real, previously undiscovered issues that reading the files by
eye would never have caught.

### What didn't work

The documented install URL failed outright:

```
npx skills add https://github.com/pratiksharma/skillforge -l
...
■  Failed to clone repository
│  Authentication failed for https://github.com/pratiksharma/skillforge.git.
```

This happened because the PRD/README recorded the wrong GitHub org — the actual `git remote -v`
for this repo is `https://github.com/thatpratik/skill-forge.git`, not `pratiksharma/skillforge`. A
brand-new developer following the README exactly as written would have hit this same failure.

### What I learned

The CLI's `--full-depth` flag description ("Search all subdirectories even when a root SKILL.md
exists") was the tell that it does a flat filesystem scan for `SKILL.md` files rather than reading
any index or manifest — confirmed empirically when `--list` found all 4 skills with zero manifest
file present. This resolves the PRD's deferred open question definitively: no manifest is needed
for the flat `skills/<name>/SKILL.md` layout this repo already uses.

### What was tricky

Distinguishing "the install mechanism is broken" from "the documented URL is wrong" required
deliberately testing both the URL as literally written in the docs and the actual git remote side
by side, rather than assuming the docs were correct and only testing whether the CLI itself
worked.

### What warrants review

`/PRD.md`'s "Implementation Decisions" section (the corrected URL and the resolved manifest note)
and `/README.md`'s install commands — both now read `https://github.com/thatpratik/skill-forge`.
Worth double-checking this is in fact the intended canonical remote, since a typo here would
silently reintroduce the same failure for every future reader.

### Future work

None beyond what surfaced in the next step — the install mechanism itself doesn't need further
work, just needs to stay in sync if the repo ever moves.

## Step 2: Add a skill-folder validation script

**Author:** main

### Prompt Context

**Verbatim prompt:** "Add a skill-folder validation script"

**Interpretation:** After a second `/suggest-next-iteration` pass proposed three follow-on
options — a validation script, building the `code-review` skill referenced in the PRD's own
example, or committing the prior fixes first — the user chose the validation script: the smallest,
most mechanical of the three, and the one CONSTITUTION.md explicitly names as the reason project
tooling exists at all ("e.g. validating skill folders, generating a manifest").

**Inferred intent:** Get a cheap, repeatable guardrail in place before the skill collection grows
further, rather than continuing to eyeball frontmatter by hand.

### What I did

Before writing any code, re-scanned `/skills/` and found three new, untracked skill folders
(`build-awwwards-quality-sites`, `landing-page`, `web-design-engineer`) that had appeared on disk
since the previous step, added outside of this session — confirmed via `git status --short`
showing them as `??` and their file modification times. Inspected `web-design-engineer`
specifically, since it had 8+ files and subdirectories (`references/`, `agents/`, `manifest.json`,
two READMEs); this ruled out assuming skills must be single-file, and shaped the validator to only
require a `SKILL.md` inside each folder rather than a single-file layout.

Wrote `/scripts/validate-skills.ts`: it walks every directory under `/skills/`, requires a
`SKILL.md` with a parsable `---`-delimited frontmatter block, and requires non-empty
`name`/`description` fields where `name` matches the folder name. Chose TypeScript with zero new
dependencies — confirmed `node --version` was `v24.15.0` and that
`node --experimental-strip-types -e "const x: number = 5; console.log(x)"` correctly printed `5`,
so the script needs no `npm install`, no `tsx`, and no build step. Added `/package.json` with
`"validate": "node --experimental-strip-types scripts/validate-skills.ts"` as an npm script, and
documented it under a new "Contributing a skill" section in `/README.md`.

Ran `npm run validate` immediately and it found a real issue on the first run:

```
Found 1 issue(s) in skills/:
  - landing-page: frontmatter name "landing-page-design" does not match folder name "landing-page"
```

Checked the file for self-references (`grep -n "landing-page" skills/landing-page/SKILL.md`,
which matched only the frontmatter line itself out of 409 lines), then renamed the folder from
`/skills/landing-page` to `/skills/landing-page-design` to match the frontmatter identity and the
convention every other skill in the repo already follows (folder name equals frontmatter `name`).
Re-ran `npm run validate`, which then reported all 7 skill folders valid. Also sanity-checked the
failure path directly by hand-writing a throwaway `SKILL.md` with a missing `name` field in
`/tmp/_fake_skill_test/skills/bad-skill/` and confirming the script correctly reported the missing
field, before deleting that scratch folder.

### Why

CONSTITUTION.md names skill-folder validation as the canonical example of tooling this project
should have, and the timing was right: three new, unvetted skill folders had just landed with no
process behind them, which is exactly the drift a validator exists to catch. Building it now, and
running it immediately against the real repo, turned an abstract "we should validate this" into a
concrete fix.

### What worked

Checking the Node version and testing the `--experimental-strip-types` flag with a one-line
throwaway script before committing to that approach avoided adding `tsx` or `typescript` as
dependencies for what is a very small script — this kept the change to two new files with no
`npm install` step, matching CONSTITUTION.md's "no speculative infra" principle.

### What didn't work

An earlier attempt to determine whether `npx skills add --skill <name>` resolves by folder name or
frontmatter `name` (to decide which side of the `landing-page` / `landing-page-design` mismatch
was "correct") hung twice and had to be killed:

```
npx --yes skills add /Users/pratiksharma/repos/skill-forge --skill landing-page -l
```

and

```
npx --yes skills add /Users/pratiksharma/repos/skill-forge --skill landing-page -a claude-code -y
```

both exceeded their timeouts with no output beyond the initial echo line and had to be stopped via
the task-stop tool. Rather than keep retrying, I abandoned that investigation — grepping the file
for self-references and renaming the folder to match the frontmatter (the semantic identity of the
skill) made the two agree regardless of which one the CLI actually keys off.

### What I learned

"Self-contained" in CONSTITUTION.md's architecture principles does not mean single-file —
`web-design-engineer` is a legitimate multi-file skill bundle with its own `references/`,
`agents/`, and `manifest.json`, and the validator had to be written to only require a `SKILL.md`
at the top of the folder, not to reject extra files or subdirectories.

### What was tricky

Deciding which side of the `landing-page` vs `landing-page-design` mismatch to change without
being able to confirm the CLI's actual matching behavior, since that investigation hung. Falling
back to "does the name appear anywhere else in the file" (it didn't) and "what does every other
skill in this repo already do" (folder name equals frontmatter name) gave a defensible answer
without needing that confirmation.

### What warrants review

`/scripts/validate-skills.ts` and the rename from `/skills/landing-page` to
`/skills/landing-page-design` — worth a second look to confirm the renamed folder is in fact what
should ship. More importantly: `/skills/build-awwwards-quality-sites/`,
`/skills/landing-page-design/`, and `/skills/web-design-engineer/` are all still untracked and
were not added by me in this session — their provenance is unknown, and they were deliberately
left out of the `/README.md` skill table pending confirmation they're meant to be part of the
published collection.

### Future work

Decide what to do with the three untracked skill folders (commit as-is, curate, or discard), then
update the README's skill table once that's decided. The two options not chosen this round —
building the `code-review` skill referenced by the PRD's own example, and committing the prior
URL/manifest fixes — are both still open.

## Step 3: Verify the three new skills actually install

**Author:** main

### Prompt Context

**Verbatim prompt:** "I added few more skills can you check if those can be added via the command
or needed some extra work ?"

**Interpretation:** The user was asking about the same three untracked skill folders flagged as
"future work" in Step 2 (`build-awwwards-quality-sites`, `landing-page-design`,
`web-design-engineer` — no new folders had appeared since then) and wanted to know, concretely,
whether `npx skills add` can install them as-is or whether they need restructuring first.

**Inferred intent:** Resolve the open provenance/readiness question from Step 2 with real evidence
— not another frontmatter lint pass (already covered by `npm run validate`), but an actual install
test — before deciding whether to add these skills to the README and commit them.

### What I did

Ran a 4-way parallel verification (one agent per new skill, plus one testing the combined `--all`
install) since each check involved real `npx skills add` invocations plus judgment about what
"extra work" would mean, rather than a single mechanical pass. Each agent installed its skill into
a fresh scratch directory, diffed the installed output against `/skills/<name>` recursively, and
inspected the skill's own content for portability issues (absolute paths, hardcoded URLs, dead
files).

All three passed cleanly: `build-awwwards-quality-sites` (1 file, 65 lines) and
`landing-page-design` (1 file, 409 lines) are lean single-file skills with no absolute paths and
no external functional dependencies. `web-design-engineer` (39 files: `SKILL.md`, `README.md`,
`README.zh-CN.md`, `manifest.json`, `agents/openai.yaml`, and a `references/` tree including 25
style-recipe docs) installed byte-identical to source with every file and subdirectory intact. The
combined `--all` run installed all 7 skills together with zero name collisions and confirmed
`.claude/skills/` (what Claude Code actually reads) is an unmodified symlink into a canonical
`.agents/skills/` store for every skill, including the large multi-file one.

Two non-blocking findings came out of it. First, grepping the `skills` CLI's own bundled source
for `manifest.json`, `agents/openai`, and `compat` found zero references — `web-design-engineer`'s
`manifest.json` and `agents/openai.yaml` are inert as far as this CLI is concerned (harmless dead
weight, likely meant for the upstream collection it was imported from, per the `homepage` field in
`manifest.json` pointing at `github.com/ConardLi/garden-skills`). Second, and more useful: the
literal `npx skills add ...` command hung indefinitely with zero output on every one of the four
test runs, because the test machine's `~/.npmrc` points at a private registry mirror
(`192.168.52.81`) that's unreachable from the sandbox — confirmed by `curl` timeouts against that
host and by the exact same hang reproducing on a bare `npx skills --help` with no repo involved at
all. Prefixing the command with `npm_config_registry=https://registry.npmjs.org` resolved it
immediately every time. Added both the three new skills and this troubleshooting note to
`/README.md`.

### Why

The point of building `/scripts/validate-skills.ts` in Step 2 was to catch frontmatter drift, not
to prove installability — it never actually shells out to `npx skills add`. Since the user's
question was specifically about the install command, and the CLI's real behavior with a large
multi-file skill (symlink vs. copy, manifest handling, nested directories) hadn't been exercised
in this repo before, running genuine install tests was the only way to answer with evidence rather
than inference from the validator passing.

### What worked

Running all four checks in parallel meant the registry-hang problem, when it hit every single
agent independently, was immediately recognizable as an environment issue rather than a per-skill
defect — three unrelated processes hanging on the exact same IP at the exact same time is much
stronger signal than one agent's install failing in isolation. Diffing installed output against
source recursively for every skill (not just checking exit codes) is what confirmed the large
`web-design-engineer` bundle transferred all 39 files intact, including the nested
`references/style-recipes/` subdirectory.

### What didn't work

The exact command a real contributor would run — `npx skills add ... -y`, with no registry
override — hung with zero output for as long as 7 minutes in one case before being force-killed:

```
npx --yes skills add /Users/pratiksharma/repos/skill-forge --skill landing-page-design -a claude-code -y
```

This isn't a skill-forge or CLI defect (confirmed the hang reproduces on `npx skills --help` with
no repo argument at all), but it means anyone behind a similar misconfigured/unreachable private
npm registry would see this exact command hang silently rather than fail with a clear error —
worth documenting even though there's nothing in this repo to fix.

### What I learned

`npx skills add --all` writes three separate trees on disk, not one: a canonical
`.agents/skills/<name>/` store (byte-identical to source), symlinks from `.claude/skills/<name>`
into that store (what Claude Code reads, unmodified), and a third `agent/skills/<name>/SKILL.md`
copy for a separate "Eve" agent target whose frontmatter gets rewritten in the process (the `name`
field is dropped, and quotes are stripped from `description`/`license`). This is expected
per-target normalization and doesn't touch the tree Claude Code reads, but it means "installed
content" isn't byte-identical everywhere on disk — only in the path that actually matters here.

### What was tricky

Telling apart "the skill has a real portability problem" from "this sandbox's npm config is
broken" required independent confirmation (checking `~/.npmrc`, curling the configured registry
host directly, and reproducing the same hang with no repo involved) rather than trusting the first
hang as a finding about the skill itself.

### What warrants review

`/README.md`'s three new skill-table rows and the new "Troubleshooting" section — the table
descriptions are my own condensed paraphrases of each skill's (much longer) frontmatter
`description`, written for table readability, so worth checking they still read as accurate.
`/skills/web-design-engineer/manifest.json` and `/skills/web-design-engineer/agents/openai.yaml`
were left in place since removing them was a discretionary cleanup suggestion, not a requirement —
worth a decision on whether to keep them for upstream/other-agent compatibility or drop them since
this CLI never reads them.

### Future work

None of the three skills need code changes to be installable. Remaining open items are unchanged
from Step 2's future work (deciding on `manifest.json`/`agents/openai.yaml`, building the
`code-review` skill referenced in the PRD's own example) plus one new one: nothing in this repo
currently commits anything, so `/PRD.md`, `/README.md`, `/package.json`, `/scripts/`, the three new
skill folders, and today's diary entries are all still sitting uncommitted in the working tree.
