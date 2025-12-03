# Copilot Instructions for ChowBenin

ChowBenin is a food ordering platform for Benin, built as a **pnpm monorepo** with three packages: a customer-facing web app, a restaurant dashboard, and shared utilities. The backend uses Supabase.

## Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (authentication, database, edge functions, realtime)
- **Package Manager**: pnpm with workspaces
- **Build Tool**: Vite

## Project Structure

This is a monorepo with three packages:

```
├── packages/
│   ├── web/                  # @chowbenin/web - Customer-facing web app
│   │   └── src/
│   │       ├── lib/          # Components, repositories, services, stores, utils
│   │       └── routes/       # SvelteKit file-based routing
│   ├── dashboard/            # @chowbenin/dashboard - Restaurant management app
│   │   └── src/
│   │       ├── lib/
│   │       └── routes/
│   └── shared/               # @chowbenin/shared - Shared types, utils, constants
│       └── src/
│           ├── types/        # Database and domain types
│           ├── utils/        # Shared helper functions
│           └── constants.ts  # Shared constants
└── supabase/                 # Supabase configuration (shared by all packages)
    ├── migrations/           # Database migrations
    ├── seeds/                # Seed data
    └── config.toml           # Supabase local config
```

## Commands

Run from the repository root:

- `pnpm dev:web` - Start the customer web app (port 5173)
- `pnpm dev:dashboard` - Start the restaurant dashboard (port 5174)
- `pnpm build:web` - Build the web app for production
- `pnpm build:dashboard` - Build the dashboard for production
- `pnpm check` - Run type checking across all packages
- `pnpm lint` - Run linting across all packages
- `pnpm format` - Format code across all packages
- `pnpm generate-database-types` - Regenerate TypeScript types from Supabase schema

For package-specific commands:

```bash
pnpm --filter @chowbenin/web <script>
pnpm --filter @chowbenin/dashboard <script>
pnpm --filter @chowbenin/shared <script>
```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing ESLint and Prettier configurations
- Use Svelte 5 runes (`$state`, `$derived`, `$effect`) in `.svelte.ts` files
- Keep components small and focused on a single responsibility

### Component Conventions (web/dashboard packages)

- Place reusable components in `src/lib/components/`
- Use PascalCase for component file names (e.g., `RestaurantCard.svelte`)
- Keep form-related components in `src/lib/components/forms/`
- Keep icon components in `src/lib/components/icons/`

### Data Layer (web package)

- Repositories in `src/lib/repositories/` handle direct Supabase interactions
- Services in `src/lib/services/` contain business logic and orchestrate repository calls
- State management uses Svelte stores in `src/lib/stores/` with `.svelte.ts` extension

### Shared Package

Import from the shared package using these entry points:

```typescript
import { debounce } from '@chowbenin/shared';
import type { Database, Tables } from '@chowbenin/shared/types';
import { isRestaurantOpen } from '@chowbenin/shared/utils';
import { supportedCountries } from '@chowbenin/shared/constants';
```

When adding to shared:
1. Create your file in the appropriate directory
2. Export from the relevant index file
3. Changes are immediately available in other packages (no rebuild needed)

### Routing

- Use SvelteKit's file-based routing conventions
- Group routes with parentheses for layout organization (e.g., `(app)`, `(authed)`)
- Use `+page.server.ts` for server-side data loading
- Use `+layout.server.ts` for shared layout data

## Testing

When making changes:

1. Run `pnpm check` to ensure TypeScript types are valid
2. Run `pnpm lint` to check code style
3. Test changes locally with `pnpm dev:web` or `pnpm dev:dashboard`

## Environment Variables

Environment variables are organized by package:

- Root `.env` - Supabase local development configuration
- `packages/web/.env` - Web app specific variables
- `packages/dashboard/.env` - Dashboard specific variables

See `.env.example` files for required variables.

## Supabase

- Local development uses Supabase CLI
- Database migrations are in `supabase/migrations/`
- Start local Supabase with `pnpx supabase start`
- Apply migrations with `pnpx supabase migration up --local`
- Reset database with `pnpx supabase db reset`
- Regenerate types after schema changes with `pnpm generate-database-types`
