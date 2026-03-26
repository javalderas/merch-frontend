@AGENTS.md
@/Users/juanantonio/NEBARI.SL/Developer/.claude/skills/dev/SKILL.md
@/Users/juanantonio/NEBARI.SL/Developer/.claude/skills/advisorDev/SKILL.md

# Merch — Band Merchandising Manager

## Overview

Web app for managing band merchandising: product catalog, inventory, point-of-sale, expenses, and profit reports. Mobile-first, designed for use at gigs on tablets and phones.

## Tech Stack

- **Frontend**: Next.js 16+ (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS v4 (inline @theme, no tailwind.config)
- **Components**: shadcn/ui (new-york style, CSS variables, lucide icons)
- **State**: TanStack Query v5 (server state), React Context (cart)
- **Forms**: react-hook-form + zod
- **HTTP**: Axios (mock store for now, real backend later)
- **Toasts**: Sonner
- **Tests**: Playwright E2E

## Architecture

```
src/
  app/(app)/           — Pages (dashboard, pos, products, sales, expenses, reports)
  components/ui/       — shadcn/ui primitives + custom (empty-state, loading-spinner, error-fallback)
  components/layout/   — app-shell, sidebar, bottom-nav, header
  components/{domain}/ — products, pos, sales, expenses
  hooks/               — TanStack Query hooks (use-{resource}.ts)
  lib/api/             — API functions + mock-store (swap point for real backend)
  lib/validations/     — Zod schemas
  lib/format.ts        — Currency/date formatting (es-ES, EUR)
  types/               — TypeScript types mirroring backend DTOs
  contexts/            — cart-context.tsx
```

## API Contract

- OpenAPI 3.1 spec at `api/openapi.yaml`
- RESTful at `/api/v1/`
- Currently using mock data in `src/lib/api/mock-store.ts`
- To connect real backend: replace mock implementations in `*-api.ts` files with axios calls

## Commands

```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm run test:e2e     # Playwright E2E tests
```

## Conventions

- Spanish UI labels, English code
- "use client" only when needed
- One API file + one hook file per resource
- Toast on every mutation (success + error)
- Mobile-first: design for 375px width, enhance for larger
- Touch targets: minimum 44px
- Dark theme by default (venue aesthetic)

## Lessons Learned (from building this project)

### Zod v4 + react-hook-form v7

**Never use `z.coerce.number()`** — In Zod v4, `z.coerce.number()` produces a `ZodPipeline<ZodEffects<ZodUnknown, number, unknown>, ZodNumber>` where the input type is `unknown`. react-hook-form v7's `zodResolver` expects a schema whose input type matches the form values, so this combination causes a TypeScript error like `Type 'unknown' is not assignable to type 'number'`.

**Fix:** Use `z.number()` and convert manually in the `onChange` handler:
```tsx
// Instead of: <Input type="number" {...field} />
<Input
  type="number"
  value={field.value ?? ""}
  onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
/>
```

**`z.enum()` no longer accepts `required_error`** — Zod v4 changed the options object API. Remove `required_error` from all `z.enum()` calls:
```typescript
// WRONG (Zod v4): z.enum(["A", "B"], { required_error: "..." })
// CORRECT:        z.enum(["A", "B"])
```

### shadcn/ui Dialog components

**Always use controlled `open`/`onOpenChange` props** — Do not use internal `useState` with `DialogTrigger`. The page/parent controls open state and passes it down:
```tsx
// Component interface:
interface MyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // ...other props
}

// Usage from page:
const [open, setOpen] = useState(false)
<MyDialog open={open} onOpenChange={setOpen} />
```

### Next.js App Router (this version)

**Async params:** Page props params are a Promise in this version. Use `use(params)` (React `use` hook) to unwrap them, not `await` at the top level:
```tsx
import { use } from "react"
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
}
```

**Editing existing files:** Always `Read` a file before `Write` — even files created by `create-next-app` like `layout.tsx` exist and must be read first or the write will fail.
