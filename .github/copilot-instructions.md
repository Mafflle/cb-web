# Copilot Instructions for cb-web

This is a SvelteKit web application for a food ordering platform, using TypeScript, Tailwind CSS v4, and Supabase as the backend.

## Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (authentication, database, edge functions)
- **Package Manager**: pnpm
- **Build Tool**: Vite

## Project Structure

```
src/
├── lib/
│   ├── components/    # Reusable Svelte components
│   ├── repositories/  # Data access layer for Supabase
│   ├── services/      # Business logic and external service integrations
│   ├── stores/        # Svelte stores using runes (.svelte.ts files)
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── routes/            # SvelteKit file-based routing
│   ├── (app)/         # Main application routes
│   │   └── (authed)/  # Routes requiring authentication
│   ├── api/           # API endpoints
│   └── auth/          # Authentication flow routes (login, callback)
└── static/            # Static assets
supabase/
├── migrations/        # Database migrations
├── seeds/             # Database seed data
└── config.toml        # Supabase local config
```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing ESLint and Prettier configurations
- Use Svelte 5 runes (`$state`, `$derived`, `$effect`) in `.svelte.ts` files
- Keep components small and focused on a single responsibility

### Component Conventions

- Place reusable components in `src/lib/components/`
- Use PascalCase for component file names (e.g., `RestaurantCard.svelte`)
- Keep form-related components in `src/lib/components/forms/`
- Keep icon components in `src/lib/components/icons/`

### State Management

- Use Svelte stores in `src/lib/stores/` with the `.svelte.ts` extension
- Follow the runes pattern for reactive state management

### Data Layer

- Repositories handle direct Supabase interactions
- Services contain business logic and orchestrate repository calls
- Keep Supabase queries in repository files

### Routing

- Use SvelteKit's file-based routing conventions
- Group routes with parentheses for layout organization (e.g., `(app)`, `(authed)`)
- Use `+page.server.ts` for server-side data loading
- Use `+layout.server.ts` for shared layout data

## Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm check` - Run Svelte type checking
- `pnpm lint` - Run ESLint and Prettier checks
- `pnpm format` - Format code with Prettier
- `pnpm generate-database-types` - Generate TypeScript types from Supabase schema

## Testing

When making changes:
1. Run `pnpm check` to ensure TypeScript types are valid
2. Run `pnpm lint` to check code style
3. Test changes locally with `pnpm dev`

## Environment Variables

Required environment variables are documented in `.env.example`. Key variables include:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Supabase

- Local development uses Supabase CLI
- Database migrations are in `supabase/migrations/`
- Start local Supabase with `pnpx supabase start`
- Push migrations with `pnpx supabase db push --local`
