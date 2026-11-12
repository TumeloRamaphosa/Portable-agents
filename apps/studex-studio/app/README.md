# Studex Studio — Phase 1 web app

Thin local dashboard (Vite + React + TypeScript). Browser only — no Tauri, no paid APIs.

## Run locally

```bash
cd apps/studex-studio/app
npm install
npm run dev
```

Open the URL Vite prints in the terminal (default dev server).

Production build:

```bash
npm run build
npm run preview
```

## Vault init (Obsidian)

From this folder, with your vault root exported:

```bash
export VAULT_PATH="/absolute/path/to/your/obsidian-vault"
npm run vault:init
```

Creates `Studio/Jobs/001-from-the-veld-to-the-table/` with stub notes. Does not overwrite existing files.

Set the same path in **Settings** in the app so the vault banner clears and screening can target `reviews.md`.

## Settings

- **In-app:** Settings screen → `localStorage`
- **Optional defaults:** copy `.env.local.example` to `.env.local` (gitignored) for `VITE_DEFAULT_*` vars

Never commit secrets or real endpoints.

## Gitea remote (local)

On your machine, after Gitea hosts your mirror:

```bash
cd /path/to/your/checkout
git remote add gitea <your-gitea-remote>
git push gitea main
```

Use a placeholder remote name you control; push-mirror to GitHub separately if you use both.

## Screens

Today, Jobs, Content plan, Calendar, Pipeline, Screening (G1), Writers' Room (chat), Settings. Hermes opens from the header when configured.

See [../PLAN.md](../PLAN.md) for the full product plan.
