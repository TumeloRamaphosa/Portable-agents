import fs from "node:fs";
import path from "node:path";

const vaultPath = process.env.VAULT_PATH;

if (!vaultPath) {
  console.error("Set VAULT_PATH to your Obsidian vault root, then run npm run vault:init");
  process.exit(1);
}

const jobRoot = path.join(
  vaultPath,
  "Studio",
  "Jobs",
  "001-from-the-veld-to-the-table",
);

const files = {
  "README.md": `# From the Veld to the Table

Launch video — Wagyu Biltong Gold. StudBot narrates (approved originals only).

**Status:** Draft — awaiting G1 script lock.

**Gates:** G1–G5 per Studex Studio.
`,
  "script.md": `# Script — From the Veld to the Table

## 1. Dawn on the farm
Before there was a brand, there was a farmer who got up before the sun.

## 2. The craft
Wagyu Biltong Gold isn't rushed. It's made the old way, then checked the new way.

## 3. The proof
Every batch carries its story: where it came from, who handled it, and when.

## 4. The table
From the farmer's hands to yours. Studex. Proof before scale.

## 5. Close
This is just the start. We're aiming to bring this standard to coffee next.
`,
  "shot-list.md": `# Shot list

| Scene | Beat | Notes |
|-------|------|-------|
| 1 | Dawn | Wide veld, pre-dawn light |
| 2 | Craft | Hands, curing rack |
| 3 | Proof | Batch trace card |
| 4 | Table | Product on board |
| 5 | Close | Studex mark, hold |
`,
  "reviews.md": `# Reviews and gate decisions

`,
};

fs.mkdirSync(path.join(jobRoot, "drafts"), { recursive: true });
fs.mkdirSync(path.join(jobRoot, "finals"), { recursive: true });

for (const [name, content] of Object.entries(files)) {
  const target = path.join(jobRoot, name);
  if (fs.existsSync(target)) {
    console.log(`skip (exists): ${target}`);
  } else {
    fs.writeFileSync(target, content, "utf8");
    console.log(`created: ${target}`);
  }
}

console.log("Done. Job folder ready under Studio/Jobs/001-from-the-veld-to-the-table/");
