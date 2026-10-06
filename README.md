# VirtuStock Frontend

IPO simulator and insights platform for India: track open IPOs, GMP, subscription
status and verdicts, compare IPOs, and keep a record of the IPOs you apply to.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · Redux Toolkit (auth) ·
TanStack React Query · Axios

## Getting started

```bash
npm install
cp .env.example .env     # then set VITE_BACKEND_URL
npm run dev
```

| Variable           | Description                                   |
| ------------------ | --------------------------------------------- |
| `VITE_BACKEND_URL` | Base URL of the VirtuStock backend (no slash) |

Other scripts: `npm run build` (production build), `npm run lint`,
`npm run preview`.

## Project layout

```
src/
├── API/            Axios client (JWT interceptor, error toasts)
├── queries/        Shared React Query hooks (open IPOs, IPO detail, GMP…)
├── Helper/         Formatting + IPO maths (GMP stats, countdowns, subscription)
├── components/
│   ├── ipo/        IPOCard, IPOVerdict, GMPChart, SubscriptionBars, skeletons…
│   └── …           Generic UI (buttons, tables, modal, form inputs)
├── pages/          Home, IPO detail, GMP, Compare, Admin, User dashboard…
├── layout/         App shell: sidebar, header, search, disclaimer
├── Pagination/     Paginated IPO list provider
└── Store/          Redux auth slice
```

## Conventions

- **Verdicts** are always rendered with `<IPOVerdict />`.
- **GMP** is never read as `ipo.gmp[0]`; use `latestGmp()` / `gmpStats()` from
  `Helper/ipoHelper.ts`, which are safe when no GMP exists.
- **API calls** for server data go through `src/queries/ipoQueries.ts` so they are
  cached and shared. Optional requests pass `skipErrorToast: true`.

## Backend contract

The frontend only uses existing endpoints: `/auth/*`, `/user/*`, `/ipo`,
`/ipo/search`, `/ipo/{id}`, `/ipo/{id}/gmp`, `/admin/*`, `/feedback/*`.
If the backend later returns `applicationUrl` on an IPO, the Apply Now button uses
it automatically; otherwise it falls back to the broker home page.
