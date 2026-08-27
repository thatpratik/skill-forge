# SkillForge

A central, installable repository of reusable AI-agent skills and workflows, primarily for
Claude Code and compatible agent tooling. Instead of manually copying and configuring each
skill into every repo (and repeating that for every new teammate), install what you need with
one command.

## Install

Install the entire collection:

```
npx skills add https://github.com/thatpratik/skill-forge
```

Install a single skill:

```
npx skills add https://github.com/thatpratik/skill-forge --skill <name>
```

Installed skills land in `.claude/skills/<name>/`, where Claude Code picks them up
automatically at the start of a session — no extra registration step required.

## Skills

### Project lifecycle

Skills for taking a greenfield project from raw idea to an ongoing, documented build.

| Skill | Description |
| --- | --- |
| `clarify-prd` | Interviews the user from raw vision down to a concrete why and what, then writes PRD.md (with approval). The starting point for a greenfield project. |
| `clarify-constitution` | Interviews the user to establish the project constitution — language, stack, and architecture standards that stay fixed across all tasks — then writes CONSTITUTION.md (with approval). |
| `suggest-next-iteration` | Suggests the next iteration to build, based on PRD.md and CONSTITUTION.md. Use after a PRD exists and the user wants to know what to build next. |
| `diary` | Write and maintain an implementation diary capturing what changed, why, what worked, what failed, what was tricky, and how to review and validate. |

### Building web pages & products

Skills for producing full pages, sites, or UI artifacts end to end.

| Skill | Description |
| --- | --- |
| `build-awwwards-quality-sites` | Art-directs and builds Awwwards-quality, motion-rich marketing/portfolio/landing sites — GSAP choreography, one smooth-scroll engine, optional Three.js shaders, and accessibility/performance safeguards. |
| `landing-page-design` | End-to-end landing page system: intake questions, page structure, layout selection, conversion copywriting, SEO, and strict visual rules for typography, spacing, and motion. |
| `web-design-engineer` | Builds or redesigns polished browser-rendered visual artifacts (pages, dashboards, prototypes, UI mockups, data viz) in HTML/CSS/JS/React, with design critique and browser-based QA. Includes a library of style recipes (Swiss, Y2K, MUJI, Stripe Press, and more). |

### Design direction & philosophy

Reference guidance for aesthetic decisions rather than end-to-end builds.

| Skill | Description |
| --- | --- |
| `frontend-design` | Guidance for distinctive, intentional visual design when building or reshaping UI — aesthetic direction, typography, and avoiding templated defaults. |
| `apple-design` | Apple's approach to interface design and fluid, physical motion, translated for the web — gestures, springs, materials, and typography. |
| `emil-design-eng` | Emil Kowalski's philosophy on UI polish, component design, animation decisions, and invisible details. |

### Animation & motion

Skills for deciding on, building, finding, or naming motion.

| Skill | Description |
| --- | --- |
| `animate` | Builds a web animation from scratch — purpose, tool, properties, curve/duration, interruption, and exit. |
| `animate-expo` | Builds React Native/Expo animations with Reanimated, Gesture Handler, and expo-haptics. |
| `find-animation-opportunities` | Read-only scan of a codebase or UI for places that should animate but don't, with exact proposed values. |
| `animation-vocabulary` | Reverse-lookup glossary that turns a vague motion description into its exact animation term. |

### Component & library guides

Focused how-tos for specific third-party libraries.

| Skill | Description |
| --- | --- |
| `ask-sonner` | Guide to the Sonner React toast library — setup, toast variants, styling, theming, and troubleshooting. |

## Contributing a skill

Every folder under `skills/` must contain a `SKILL.md` with `name` and `description` in its
frontmatter, and the `name` must match the folder name — this is what `npx skills add` scans
for. Check a new skill before committing it:

```
npm run validate
```

## Troubleshooting

If `npx skills add` hangs with no output, check `npm config get registry` — a private/internal
registry mirror that's unreachable will make npm block on package resolution indefinitely instead
of failing fast or falling back to a local cache. Point at the public registry to work around it:

```
npm_config_registry=https://registry.npmjs.org npx skills add ...
```
