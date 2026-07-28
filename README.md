# austral

> A local-first personal finance PWA that keeps your data on your device.

austral is a minimalist, privacy-first expense tracker for people who want to
understand their monthly spending without accounts, ads, bank connections, or
cloud storage.

**Private by default · No account required · Offline-first · Open source**

[Live demo](https://austral-six.vercel.app) ·
[Quick expense entry](https://austral-six.vercel.app/nuevo)

> austral currently ships in Spanish (Argentina) and uses ARS.

austral started as a personal tool, but anyone can use it, fork it, deploy a
private copy, or adapt it to their own workflow. It is a mobile-first PWA
designed primarily for modern mobile devices while remaining fully usable on
tablets and desktop browsers.

## Why austral?

- **Private by default** — transactions stay in your browser.
- **No account required** — open it and start tracking.
- **Offline-first** — works without a permanent connection.
- **Portable** — export and import JSON backups whenever you want.
- **Open source** — fork it, self-host it, or adapt it to your workflow.

## Features

- Monthly dashboard with income, expenses, balance, and budget.
- Month navigation and useful empty states.
- Quick expense entry through `/nuevo`.
- Transaction history with filters, editing, deletion, and swipe actions.
- Spending distribution, trends, and comparison with the previous month.
- Versioned JSON backup export and validated import.
- Installable, offline-capable PWA.
- Separate installable quick-entry access named **Anotar gasto**.
- Local-first storage using IndexedDB.

## Use it yourself

You can use austral directly from the live demo or deploy your own copy.

1. Fork this repository.
2. Import it into Vercel.
3. Keep the default Next.js preset.
4. Deploy without environment variables.
5. Open the resulting URL and install it as a PWA.

No database, account, backend, or third-party service is required. Each browser
keeps its own local financial data.

## Privacy and backups

austral does not use a backend, authentication, analytics, advertising, or
external services. Financial data is stored locally in IndexedDB inside the
browser.

> [!IMPORTANT]
> Clearing site data, resetting the browser, or switching devices without
> exporting a backup means losing access to local data.

JSON backups are versioned and validated before import. You can merge a backup
without duplicating existing transactions or replace all local data. Exported
backup files should be stored somewhere outside the browser.

## Install locally

Requirements:

- Node.js 20.9 or newer
- npm

```bash
git clone https://github.com/EnzoFernandezz11/austral.git
cd austral
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). austral does not require
environment variables.

In development, an empty IndexedDB database is populated with mock transactions
so the dashboard and charts are easy to inspect. Production builds never add
mock financial data. To reset the development data, delete the
`austral-finance` database from **Developer Tools → Application → IndexedDB**
and reload the page.

## Install as an app on mobile

austral works in modern browsers on iPhone, Android phones, tablets, and
desktop.

On mobile, open [austral](https://austral-six.vercel.app) in your browser and
use the browser's install or **Add to Home Screen** option to access it like an
app. Open it once while connected so the offline assets can be cached.

To install the separate quick-entry access:

1. Open [austral-six.vercel.app/nuevo](https://austral-six.vercel.app/nuevo) on
   your mobile device.
2. Choose the browser's install or **Add to Home Screen** option.
3. Keep the name **Anotar gasto**.

This second shortcut opens the expense form directly.

## Architecture

austral is a client-only application. The UI talks to application state and
repositories, which persist data through Dexie and IndexedDB.

Financial values are stored as integer cents to avoid floating-point errors.
The app never writes transactions to localStorage, logs, repository files, or
remote databases.

The main stack is Next.js with App Router, strict TypeScript, Tailwind CSS,
Dexie, Zod, Lucide React, Recharts, and Vitest.

```text
src/
  app/          # routes, layouts, and metadata
  components/   # shared visual components and navigation
  features/     # transactions, dashboard, analytics, backup, and settings
  lib/          # database access, finance logic, validation, and formatters
  hooks/        # reusable React hooks
  types/        # domain types
public/         # PWA icons, manifests, and service worker
```

## Scripts and quality checks

| Command                | Purpose                            |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | Start the local development server |
| `npm run build`        | Create a production build          |
| `npm run start`        | Run the production build           |
| `npm run typecheck`    | Check strict TypeScript types      |
| `npm run lint`         | Run ESLint                         |
| `npm run format:check` | Check formatting with Prettier     |
| `npm test`             | Run unit tests                     |
| `npm run test:watch`   | Run Vitest in watch mode           |

The unit tests cover financial totals, balances, month filtering, remaining
budget calculations, backup validation, and transaction deduplication.

Run the full local check with:

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

## Current limitations

- ARS only.
- Spanish (Argentina) UI only.
- No cross-device sync.
- No account recovery.
- Manual backups.
- Light theme only.

## Open source

austral is available under the [MIT License](LICENSE). You are free to use,
fork, and adapt it for your own personal workflow.
