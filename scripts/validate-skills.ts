// Validates that every folder under skills/ is installable by `npx skills add`:
// a SKILL.md with --- frontmatter containing non-empty name/description, and a
// frontmatter name that matches the folder name (the CLI discovers skills by
// scanning for SKILL.md files, so a mismatch here is silently confusing rather
// than a hard failure, but it breaks the assumption `--skill <name>` matches
// the folder you'd `cd` into).

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SKILLS_DIR = "skills";

type Frontmatter = Record<string, string>;

function parseFrontmatter(content: string): Frontmatter | null {
  if (!content.startsWith("---\n")) return null;
  const end = content.indexOf("\n---", 4);
  if (end === -1) return null;

  const fields: Frontmatter = {};
  for (const line of content.slice(4, end).split("\n")) {
    if (!line.trim()) continue;
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    const isQuoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (isQuoted) value = value.slice(1, -1);

    fields[key] = value;
  }
  return fields;
}

function main(): void {
  const errors: string[] = [];
  const skillDirs = readdirSync(SKILLS_DIR, { withFileTypes: true }).filter((e) =>
    e.isDirectory(),
  );

  if (skillDirs.length === 0) {
    errors.push(`No skill folders found under ${SKILLS_DIR}/`);
  }

  for (const dir of skillDirs) {
    const skillPath = join(SKILLS_DIR, dir.name, "SKILL.md");
    let content: string;
    try {
      content = readFileSync(skillPath, "utf8");
    } catch {
      errors.push(`${dir.name}: missing SKILL.md at ${skillPath}`);
      continue;
    }

    const frontmatter = parseFrontmatter(content);
    if (!frontmatter) {
      errors.push(`${dir.name}: SKILL.md has no valid --- frontmatter block`);
      continue;
    }

    if (!frontmatter.name) {
      errors.push(`${dir.name}: frontmatter missing "name"`);
    } else if (frontmatter.name !== dir.name) {
      errors.push(
        `${dir.name}: frontmatter name "${frontmatter.name}" does not match folder name "${dir.name}"`,
      );
    }

    if (!frontmatter.description?.trim()) {
      errors.push(`${dir.name}: frontmatter missing "description"`);
    }
  }

  if (errors.length > 0) {
    console.error(`Found ${errors.length} issue(s) in ${SKILLS_DIR}/:\n`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`All ${skillDirs.length} skill folder(s) in ${SKILLS_DIR}/ are valid.`);
}

main();
