# BookVault

BookVault is a simple library management app for individuals or small teams. It lets you track books, lending, and user profiles. Built with Remix and Cloudflare Pages, it uses D1 for storage and supports Google Books integration and Cloudflare Access authentication.

- [Remix docs](https://remix.run/docs)
- [Remix Cloudflare docs](https://remix.run/guides/vite#cloudflare)

# Development

Install dependencies:

```sh
pnpm install
```

Apply database migrations (required before first run):

```sh
pnpm migrate:local
```

Seed initial data (optional):

```sh
pnpm seed:local
```

Start the development server:

```sh
pnpm dev
```

# Type Generation

Generate types for Cloudflare bindings after editing `wrangler.toml`:

```sh
pnpm typegen
```

# Database Migrations & Seed

Generate migration files:

```sh
pnpm migrate:generate
```

Apply migrations (local):

```sh
pnpm migrate:local
```

Seed database (local):

```sh
pnpm seed:local
```

# Build & Deploy

Build for production:

```sh
pnpm build
```

Deploy to Cloudflare Pages:

```sh
pnpm deploy:app
```

Preview deployment locally:

```sh
pnpm preview
```

# Code Quality

Format code:

```sh
pnpm format
```

Lint code:

```sh
pnpm lint
```

Type check:

```sh
pnpm typecheck
```

# Styling

Tailwind CSS is preconfigured. Edit `app/tailwind.css` as needed.

# Tech Stack

- Remix (Cloudflare Pages adapter)
- Cloudflare Pages, D1, Access
- Drizzle ORM
- Tailwind CSS
- Google Books API
- TypeScript, Vite

For requirements and architecture, see `docs/01-要件定義.md` (Japanese).
