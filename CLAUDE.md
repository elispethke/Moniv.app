# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Type-check + production build
npm run lint         # ESLint (zero warnings tolerance)
npm run test         # Vitest in watch mode
npm run test:run     # Vitest single run
npm run preview      # Preview production build
```

## Architecture

**Finora** (branded as **Moniv**) is a React 18 + TypeScript personal finance PWA using Supabase (auth/database), Stripe (payments), and Recharts (charts).

### Directory layout

```
src/
├── app/          # App.tsx (modals, providers), Router.tsx (all routes)
├── components/   # Shared UI: auth guards, layout (Navbar, BottomNav), charts, ui
├── features/     # Feature modules: dashboard, transactions, insights, pro/*, admin, auth
├── store/        # 11 Zustand stores (see below)
├── services/     # Supabase CRUD, PDF export, payment (Stripe), auth service
├── hooks/        # 20+ custom hooks: useTheme, useFormatters, useFeatureAccess, ...
├── types/        # TypeScript interfaces: transaction, user, budget, goal, wallet
├── utils/        # cn(), formatters, calculation helpers
├── i18n/         # en/pt/de JSON + translation utility (dot-notation keys)
└── styles/       # globals.css — all CSS custom properties (design tokens)
```

### Routing

- Public: `/entry`, `/login`, `/signup`, `/forgot-password`, `/reset-password`
- Protected (auth required): `/dashboard`, `/transactions`, `/insights`, `/onboarding`
- Pro-gated: `/pro/budgets`, `/pro/goals`, `/pro/installments`, `/pro/recurring`, `/pro/wallets`, `/pro/upgrade`
- Admin-only: `/admin`

Feature access is guarded via the `useFeatureAccess` hook; gating logic lives there, not scattered in components.

### State management

All stores in `src/store/`. Zustand with immutable patterns. **On logout, every store resets** to prevent cross-user data leaks — always call the reset action when adding a new store.

Key stores: `useAuthStore`, `useTransactionStore`, `usePlanStore`, `useSettingsStore`, `useUIStore`, `usePeriodStore`, and Pro stores (`useBudgetStore`, `useGoalStore`, `useInstallmentStore`, `useRecurringStore`, `useWalletStore`).

### Design system & theming

- **Dark is the CSS default** (`:root`); light mode is activated by adding `.light` to `<html>`. The app always starts in dark mode.
- All colors are CSS custom properties defined in `src/styles/globals.css` and mapped in `tailwind.config.ts` as `rgb(var(--token) / <alpha>)`.
- **Never use hardcoded Tailwind color classes** (e.g. `bg-indigo-500`) or hex values. Always use the design system tokens (e.g. `bg-primary`, `text-foreground-muted`, `border-border`).
- Custom utilities: `.glass` (backdrop blur card), `.gradient-text`, `.pb-safe` (iOS safe area).

### i18n

Three locales: `pt` (default), `en`, `de`. Translations are in `src/i18n/`. Use the `t()` utility with dot-notation keys. Never hardcode user-visible strings.

### Path alias

`@` resolves to `./src` — use it for all imports within `src/`.

### External services

- **Supabase** — auth, Postgres, edge functions. Config via `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- **Stripe** — Pro subscription (€10/month). Secret key lives in Supabase edge function secrets, never in frontend env.
