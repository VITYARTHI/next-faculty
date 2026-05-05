@AGENTS.md

# Faculty Admin — Project Conventions

Admin panel built on Next.js (App Router) integrating with a backend API that is already implemented. Our job is the UI + integration layer.

## Stack

- **Next.js 15** (App Router, TypeScript, Turbopack, `src/` dir, `@/*` import alias)
- **Tailwind CSS v4** for styling
- **shadcn/ui** (radix base, `nova` preset) — components under `src/components/ui/`
- **TanStack Query (React Query)** — server state, caching, mutations
- **TanStack Table v8** — sortable/filterable data grids (see `src/components/data-table.tsx`)
- **React Hook Form + Zod** (`@hookform/resolvers`) — forms and validation
- **Lucide React** — icons
- **Recharts** — analytics/charts
- **Axios** — HTTP client (`src/lib/api.ts`)
- **Sonner** — toast notifications (mounted in `Providers`)

## Directory layout

```
src/
  app/                  # Next.js routes (App Router)
  components/
    ui/                 # shadcn primitives — do not hand-edit unless extending
    providers.tsx       # QueryClient + TooltipProvider + Toaster
    app-shell.tsx       # Sidebar + main layout
    data-table.tsx      # Generic TanStack Table wrapper
  features/
    <feature>/
      schema.ts         # Zod schemas + inferred types
      api.ts            # Axios calls (raw API surface)
      queries.ts        # React Query hooks + queryKeys factory
      components/       # Feature-specific UI (forms, dialogs, columns)
  lib/
    api.ts              # Axios instance (auth header + 401 handling)
    query-client.ts     # QueryClient factory
    utils.ts            # cn() and other small utils
```

The `features/faculty/` folder is the canonical example — mirror that pattern (`types.ts` / `schema.ts` + `api.ts` + `queries.ts`) for new resources.

## Conventions

- **Always use the `@/` import alias**, never relative `../../` paths across feature boundaries.
- **Forms**: React Hook Form with `zodResolver(schema)`; share the Zod schema with API types via `z.infer`. Use shadcn `<Form>` components.
- **Server state**: never store API data in `useState` — use React Query. Keep a `queryKeys` factory in each feature's `queries.ts` and invalidate with `queryClient.invalidateQueries({ queryKey: keys.all })` after mutations.
- **API calls**: go through the axios instance in `src/lib/api.ts`. Don't `fetch` directly — we want a single place for auth headers, 401 handling, and envelope unwrapping. Base URL is the same-origin `/api/v1` (proxied — see "API proxy" below).
- **Tables**: use `<DataTable />` from `src/components/data-table.tsx`. Define columns as `ColumnDef<T>[]` colocated with the feature.
- **Dialogs/sheets**: prefer shadcn `Dialog` for create/edit modals on desktop, `Sheet` for mobile or longer forms.
- **Icons**: import from `lucide-react`, size with Tailwind (`className="size-4"`).
- **Toasts**: `import { toast } from "sonner"` for user feedback after mutations. Use `toast.success` / `toast.error`.
- **Client vs server components**: default to server components; add `"use client"` only when needed (hooks, event handlers, Query/Table/Form). Feature `components/` are usually client.
- **Error handling**: rely on React Query's `isError` / `error` for UI state. Show toasts for mutation failures. Don't try/catch around `useQuery`.

## Available shadcn components

Already installed: `button`, `dialog`, `form`, `input`, `label`, `tabs`, `sheet`, `command`, `table`, `dropdown-menu`, `select`, `sonner`, `card`, `badge`, `skeleton`, `separator`, `avatar`, `tooltip`, `popover`, `textarea`, `input-group`.

To add more: `npx shadcn@latest add <name>`.

## API proxy (important)

All backend traffic is proxied through Next.js. The browser never talks to the backend directly.

- `next.config.ts` rewrites `/api/v1/:path*` → `${BACKEND_URL}/api/v1/:path*`.
- Frontend code calls **same-origin** paths (e.g. `/api/v1/faculty/slots`). The axios client in `src/lib/api.ts` has `baseURL: "/api/v1"`, so call sites use bare paths like `api.get("/faculty/slots")`.
- `BACKEND_URL` is **server-only** (no `NEXT_PUBLIC_` prefix) — keep it that way. If you ever need to override per-environment, add overrides to `.env.local`.
- Benefit: no CORS issues, single place to swap backend hosts, and we can add server-side middleware later (rate limiting, request logging) without touching call sites.

## Auth — Laravel Sanctum

- Login: `POST /api/v1/auth/login` returns `{ token, user }` inside the standard envelope. The user object now includes `is_faculty: boolean` and `faculty: { id, name, email } | null`. Token is stored in `localStorage["auth_token"]` and attached as `Authorization: Bearer …` by the axios request interceptor.
- Current user: `GET /api/v1/auth/user`.
- **Faculty gate: use `user.is_faculty`. Do NOT check `user.role`** — faculty linkage lives in a separate `flipped_course_faculty` table and is not reflected in `users.role`. The backend's `faculty.api` middleware re-verifies the link on every `/api/v1/faculty/*` call, so once `is_faculty === true` the user is cleared for the faculty UI. Always go through `isFaculty(user)` from `@/features/auth/queries` rather than reading the field directly.
- 401 from any endpoint clears the stored token (response interceptor). 403 means logged-in-but-not-faculty.
- Hooks: `useLogin()`, `useLogout()`, `useCurrentUser()`, `isFaculty()` from `@/features/auth/queries`.

## Response envelope

All V1 endpoints use a consistent envelope:

- Single resource: `{ success, message, data: T }` — use `unwrap(res)` from `@/lib/api`.
- Paginated list: `{ success, message, data: T[], meta, links }` — use `unwrapPage(res)` to keep meta + links.
- Error: `{ success: false, message, errors? }` — use `getErrorMessage(err)` for toasts.

Types: `ApiEnvelope<T>`, `PaginatedEnvelope<T>`, `ApiErrorBody`, `ApiError`, `PaginationMeta`, `PaginationLinks` exported from `@/lib/api`.

## Faculty domain (phase 1, read-only)

Implemented in `src/features/faculty/` per `APIDETAILS.txt`. All endpoints are scoped server-side to the authenticated faculty — a slot/registration belonging to another faculty returns **404, not 403** (intentional, to avoid ID leaks).

- `useSlots(params)` → paginated list, filters: `is_active`, `search`, `per_page`, `page`.
- `useSlot(id)` → single slot with `available_capacity`, `capacity_status`, `is_registration_open`.
- `useSlotRegistrations(slotId, params)` → registrations for one slot.
- `useRegistrations(params)` → registrations across all owned slots; default `status=approved`. Filters: `slot_id`, `flipped_course_id`, `status`, `search`, `approved_from`, `approved_until`.
- `useRegistration(id)` → single registration.

**Mutations available** for registrations: approve / reject (single + bulk).

- `useApproveRegistration()` — `POST /faculty/registrations/{id}/approve`. `admin_notes` optional.
- `useRejectRegistration()` — `POST /faculty/registrations/{id}/reject`. `admin_notes` **required** (max 1000). Rejecting an `approved` registration revokes it.
- `useBulkApprove()` — `POST /faculty/registrations/bulk-approve`. Always returns 200; inspect `data.approved` and `data.skipped` (reasons: `not_found | not_owned | not_pending | slot_full`).
- `useBulkReject()` — `POST /faculty/registrations/bulk-reject`. `admin_notes` required.

All four mutations invalidate `facultyKeys.all` on success so the dashboard, slot detail counts, and registration lists all refresh together. The reusable `RegistrationActionDialog` (`features/faculty/components/action-dialog.tsx`) handles single + bulk for both actions and enforces the required-notes-on-reject rule. Slot creation is still admin-side.

## Environment

- `BACKEND_URL` (server-only) — backend host for the rewrite proxy. See `.env.example`.
- Auth token: `localStorage["auth_token"]` via the `authToken` helper in `@/lib/api`.

## Scripts

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npx tsc --noEmit` — typecheck

## Adding a new feature

1. Create `src/features/<name>/schema.ts` with Zod schemas + inferred types.
2. Add `api.ts` with axios calls returning typed data.
3. Add `queries.ts` with `<name>Keys` factory and React Query hooks.
4. Build UI in `src/features/<name>/components/` (table columns, form, dialogs).
5. Add a route under `src/app/<name>/` that composes those components inside `<AppShell>`.
