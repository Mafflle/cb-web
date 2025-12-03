# ChowBenin

A food ordering platform for Benin, built as a monorepo with separate packages for the customer-facing web app, restaurant dashboard, and shared utilities.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Environment Variables](#3-environment-variables)
- [Supabase Setup](#supabase-setup)
  - [Local Supabase Development](#local-supabase-development)
  - [Running Migrations](#running-migrations)
  - [Seeding the Database](#seeding-the-database)
  - [Generating Database Types](#generating-database-types)
- [Running the Applications](#running-the-applications)
  - [Web (Customer App)](#web-customer-app)
  - [Dashboard (Restaurant App)](#dashboard-restaurant-app)
- [Packages](#packages)
  - [@chowbenin/web](#chowbeninweb)
  - [@chowbenin/dashboard](#chowbenindashboard)
  - [@chowbenin/shared](#chowbeninshared)
- [Working with the Shared Package](#working-with-the-shared-package)
  - [What's in Shared](#whats-in-shared)
  - [Importing from Shared](#importing-from-shared)
  - [Adding New Exports](#adding-new-exports)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
  - [Branch Naming](#branch-naming)
  - [Commit Messages](#commit-messages)
  - [Pull Requests](#pull-requests)
  - [Code Style](#code-style)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

ChowBenin is a food ordering platform consisting of:

- **Web App** (`@chowbenin/web`): Customer-facing application for browsing restaurants, placing orders, and tracking deliveries
- **Dashboard** (`@chowbenin/dashboard`): Restaurant management interface for handling orders, managing menus, and viewing analytics
- **Shared** (`@chowbenin/shared`): Common utilities, types, and constants used across all packages

This monorepo structure allows for:
- Code sharing between applications
- Consistent types across the platform
- Independent deployments for each app
- Unified development experience

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [SvelteKit 2](https://kit.svelte.dev/) with [Svelte 5](https://svelte.dev/) |
| Language | TypeScript (strict mode) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Backend | [Supabase](https://supabase.com/) (Auth, Database, Edge Functions, Realtime) |
| Package Manager | [pnpm](https://pnpm.io/) with workspaces |
| Build Tool | [Vite](https://vitejs.dev/) |

---

## Project Structure

```
chowbenin/
├── package.json              # Root package.json with workspace scripts
├── pnpm-workspace.yaml       # pnpm workspace configuration
├── pnpm-lock.yaml            # Lockfile (single for entire monorepo)
│
├── packages/
│   ├── web/                  # Customer-facing web application
│   │   ├── src/
│   │   │   ├── lib/          # Components, stores, services, repositories
│   │   │   ├── routes/       # SvelteKit file-based routing
│   │   │   └── app.html      # HTML template
│   │   ├── static/           # Static assets (images, fonts, icons)
│   │   ├── package.json      # @chowbenin/web
│   │   └── svelte.config.js
│   │
│   ├── dashboard/            # Restaurant management dashboard
│   │   ├── src/
│   │   ├── static/
│   │   └── package.json      # @chowbenin/dashboard
│   │
│   └── shared/               # Shared utilities and types
│       ├── src/
│       │   ├── types/        # Database types, domain types
│       │   ├── utils/        # Helper functions
│       │   ├── constants.ts  # Shared constants
│       │   └── index.ts      # Main exports
│       └── package.json      # @chowbenin/shared
│
└── supabase/                 # Supabase configuration (shared)
    ├── config.toml           # Supabase local config
    ├── migrations/           # Database migrations
    ├── seeds/                # Seed data for development
    └── templates/            # Email/SMS templates
```

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or later ([Download](https://nodejs.org/))
- **pnpm** v8 or later ([Installation](https://pnpm.io/installation))
  ```bash
  npm install -g pnpm
  ```
- **Docker** (for local Supabase) ([Download](https://www.docker.com/products/docker-desktop/))
- **Supabase CLI** (installed via pnpm, no global install needed)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone git@github.com:Mafflle/cb-web.git
cd cb-web
```

### 2. Install Dependencies

From the root directory, install all dependencies for all packages:

```bash
pnpm install
```

This will:
- Install dependencies for the root workspace
- Install dependencies for all packages (`web`, `dashboard`, `shared`)
- Create symlinks between workspace packages

### 3. Environment Variables

Environment variables are organized as follows:

| Location | Purpose |
|----------|---------|
| `.env` (root) | Supabase local development configuration |
| `packages/web/.env` | Web app specific variables (payments, public keys) |
| `packages/dashboard/.env` | Dashboard specific variables |

#### Root `.env` (Supabase Configuration):

```bash
cp .env.example .env
```

This file contains Supabase-related environment variables used by the local Supabase instance:

```bash
# Supabase Auth (Google OAuth)
SUPABASE_AUTH_EXTERNAL_GOOGLE_ID=your-google-client-id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your-google-client-secret
```

#### For the Web App (`packages/web`):

```bash
cp packages/web/.env.example packages/web/.env
```

Edit `packages/web/.env` with your values:

```bash
# Supabase
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key

# Payment Processing
PRIVATE_PAYSTACK_SECRET_KEY=your-paystack-secret
PRIVATE_MOMO_API_KEY=your-momo-api-key
# ... other payment variables
```

#### For the Dashboard (`packages/dashboard`):

```bash
cp packages/dashboard/.env.example packages/dashboard/.env
```

---

## Supabase Setup

ChowBenin uses Supabase as its backend. The `supabase/` folder at the root contains all database migrations, seeds, and configuration shared by all packages.

### Local Supabase Development

1. **Login to Supabase CLI** (first time only):
   ```bash
   pnpx supabase login
   ```

2. **Start the local Supabase instance**:
   ```bash
   pnpx supabase start
   ```

   This will:
   - Start PostgreSQL, Auth, Storage, and other Supabase services in Docker
   - Display your local credentials (API URL, anon key, service role key)

   Example output:
   ```
   Started supabase local development setup.

   API URL: http://localhost:54321
   GraphQL URL: http://localhost:54321/graphql/v1
   DB URL: postgresql://postgres:postgres@localhost:54322/postgres
   Studio URL: http://localhost:54323
   Inbucket URL: http://localhost:54324
   anon key: eyJhbG...
   service_role key: eyJhbG...
   ```

3. **Copy the credentials** to your `.env` files:
   ```bash
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=<anon key from above>
   ```

### Running Migrations

#### Local Development

Apply all database migrations to your local Supabase:

```bash
pnpx supabase migration up
```

Or reset the database and rerun all migrations:

```bash
pnpx supabase db reset
```

### Seeding the Database

Seed files are in `supabase/seeds/`. After running migrations, seed data is automatically applied during `db reset`, or you can run:

```bash
pnpx supabase db seed
```

### Generating Database Types

When you modify the database schema, regenerate TypeScript types:

```bash
pnpm run generate-database-types
```

This updates `packages/shared/src/types/database.types.ts` which is used by all packages.

---

## Running the Applications

### Web (Customer App)

Start the customer-facing web application:

```bash
pnpm dev:web
```

This runs `packages/web` on `http://localhost:5173`

### Dashboard (Restaurant App)

Start the restaurant dashboard:

```bash
pnpm dev:dashboard
```

This runs `packages/dashboard` on a different port (e.g., `http://localhost:5174`)

### Running Both Simultaneously

Open two terminal windows/tabs:

```bash
# Terminal 1
pnpm dev:web

# Terminal 2
pnpm dev:dashboard
```

---

## Packages

### @chowbenin/web

The customer-facing application where users can:
- Browse restaurants and menus
- Add items to cart
- Place and pay for orders
- Track order status in real-time

**Location**: `packages/web/`

### @chowbenin/dashboard

The restaurant management interface where restaurant owners can:
- View and manage incoming orders
- Update menu items and prices
- Set opening hours
- View analytics and reports

**Location**: `packages/dashboard/`

### @chowbenin/shared

Shared code used by both applications:
- Database types (auto-generated from Supabase schema)
- Domain types (Restaurant, Order, etc.)
- Utility functions (formatting, validation, calculations)
- Constants (supported countries, payment methods)

**Location**: `packages/shared/`

---

## Working with the Shared Package

### What's in Shared

```
packages/shared/src/
├── index.ts              # Main exports
├── constants.ts          # Shared constants (countries, payment methods)
├── types/
│   ├── index.ts          # Type exports
│   ├── database.types.ts # Auto-generated Supabase types
│   └── restaurants.types.ts
└── utils/
    ├── index.ts          # Utility exports
    └── helpers.ts        # Helper functions
```

### Importing from Shared

The shared package exposes multiple entry points:

```typescript
// Import from main entry
import { debounce, supportedCountries } from '@chowbenin/shared';

// Import types
import type { Database, Tables, Enums } from '@chowbenin/shared/types';

// Import utilities
import { isRestaurantOpen, getOrderTotalPrice } from '@chowbenin/shared/utils';

// Import constants
import { paymentMethods, supportedCountries } from '@chowbenin/shared/constants';
```

### Adding New Exports

When adding new code to the shared package:

1. **Create your file** in the appropriate directory:
   ```typescript
   // packages/shared/src/utils/newHelper.ts
   export const myNewFunction = () => { ... };
   ```

2. **Export from the index file**:
   ```typescript
   // packages/shared/src/utils/index.ts
   export * from './helpers';
   export * from './newHelper';  // Add this
   ```

3. **Changes are immediately available** in other packages (no rebuild needed).

4. **If adding a new entry point**, update `package.json`:
   ```json
   "exports": {
     ".": "./src/index.ts",
     "./types": "./src/types/index.ts",
     "./utils": "./src/utils/index.ts",
     "./constants": "./src/constants.ts",
     "./newEntry": "./src/newEntry/index.ts"  // Add this
   }
   ```

---

## Available Scripts

Run these from the **root directory**:

| Script | Description |
|--------|-------------|
| `pnpm dev:web` | Start the web app in development mode |
| `pnpm dev:dashboard` | Start the dashboard in development mode |
| `pnpm build:web` | Build the web app for production |
| `pnpm build:dashboard` | Build the dashboard for production |
| `pnpm check` | Run type checking across all packages |
| `pnpm lint` | Run linting across all packages |
| `pnpm format` | Format code across all packages |
| `pnpm generate-database-types` | Regenerate Supabase database types |

### Package-specific scripts

You can also run scripts for a specific package:

```bash
# Run any script in a specific package
pnpm --filter @chowbenin/web <script>
pnpm --filter @chowbenin/dashboard <script>
pnpm --filter @chowbenin/shared <script>

# Examples
pnpm --filter @chowbenin/web build
pnpm --filter @chowbenin/shared check
```

---

## Contributing

We welcome contributions! Please follow these guidelines:

### Branch Naming

Use descriptive branch names with prefixes:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/order-tracking` |
| `fix/` | Bug fixes | `fix/payment-error` |
| `refactor/` | Code refactoring | `refactor/cart-logic` |
| `docs/` | Documentation | `docs/readme-update` |
| `chore/` | Maintenance tasks | `chore/update-deps` |

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]
```

Examples:
```
feat(web): add real-time order tracking
fix(dashboard): resolve menu item update issue
docs(shared): update type documentation
chore: update dependencies
```

### Pull Requests

1. **Fork the repository** and create your branch from `development`
2. **Make your changes** following the code style guidelines
3. **Test your changes** locally
4. **Run checks** before committing:
   ```bash
   pnpm check
   pnpm lint
   ```
5. **Create a Pull Request** against `development` branch
6. **Fill out the PR template** with a clear description

### Code Style

- **TypeScript**: Use strict mode, avoid `any` when possible
- **Svelte**: Use Svelte 5 runes (`$state`, `$derived`, `$effect`) in `.svelte.ts` files
- **Formatting**: Run `pnpm format` before committing
- **Components**: Keep them small and focused on a single responsibility
- **Naming**: 
  - PascalCase for components (`RestaurantCard.svelte`)
  - camelCase for functions and variables
  - SCREAMING_SNAKE_CASE for constants

---

## Deployment

Each package deploys independently.

### Web App (Netlify)

The web app is deployed to Netlify. Configuration:

| Setting | Value |
|---------|-------|
| Base directory | `packages/web` |
| Build command | `pnpm run build` |
| Publish directory | `build` |

Environment variables are configured in the Netlify dashboard.

### Dashboard (Netlify)

Same setup as web, but with:

| Setting | Value |
|---------|-------|
| Base directory | `packages/dashboard` |

### Deployment Triggers

- Changes to `packages/web/` → Rebuilds web app only
- Changes to `packages/dashboard/` → Rebuilds dashboard only
- Changes to `packages/shared/` → Rebuilds **both** apps

---

## Troubleshooting

### Common Issues

**1. "Module not found" errors for `@chowbenin/shared`**

```bash
# Reinstall dependencies
pnpm install
```

**2. Types not updating after schema change**

```bash
# Regenerate database types
pnpm generate-database-types

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

**3. Supabase not starting**

```bash
# Ensure Docker is running, then:
pnpx supabase stop
pnpx supabase start
```

**4. Changes in shared not reflecting**

```bash
# Restart the dev server
# Ctrl+C, then:
pnpm dev:web
```

**5. SvelteKit cache issues**

```bash
# Clear the cache
rm -rf packages/web/.svelte-kit
pnpm dev:web
```

---

## License

This project is private and proprietary. All rights reserved.

---

## Questions?

If you have questions or need help, please:
1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing GitHub issues
3. Create a new issue with detailed information

Happy coding! 🚀
