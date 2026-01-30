# BookVault

## 日本語

### 概要

BookVault は、個人や小規模チーム向けのシンプルな蔵書管理アプリケーションです。書籍の管理、貸出・返却の追跡、ユーザープロフィール管理などの機能を提供します。

### 主な特徴

- 📚 **蔵書管理**: 書籍情報（タイトル、著者、ISBN、出版社など）の登録・編集・削除
- 🔍 **検索機能**: タイトル、著者、出版社、タグによる書籍検索
- 📖 **貸出管理**: 書籍の貸出・返却履歴の追跡
- 🏷️ **タグ管理**: 書籍へのタグ付けとタグによるフィルタリング
- 📱 **Google Books連携**: ISBNによる書籍情報の自動取得
- 🔐 **認証**: Cloudflare Accessによる安全な認証システム
- 👤 **ユーザー管理**: プロフィール設定と権限管理（管理者/一般ユーザー）

### 技術スタック

- **フレームワーク**: Remix (Cloudflare Pages対応)
- **インフラ**: Cloudflare Pages + D1 (SQLite) + Cloudflare Access
- **ORM**: Drizzle ORM
- **スタイリング**: Tailwind CSS + shadcn/ui
- **外部API**: Google Books API
- **言語**: TypeScript

### ドキュメント

詳細な技術仕様やアーキテクチャについては、以下のドキュメントを参照してください：

- [要件定義](./docs/01-要件定義.md) - プロジェクトの目的、機能要件、非機能要件
- [DB定義](./docs/02-DB定義.md) - データベーススキーマとER図
- [画面構成](./docs/03-画面構成.md) - 画面一覧とルーティング設計
- [使用技術・実装ルール](./docs/06-使用技術・実装ルール.md) - 技術選定と実装ガイドライン
- [ローカル開発における注意点](./docs/07-ローカル開発における注意点.md) - 開発環境のセットアップと注意事項

### コスト

Cloudflare の無料枠内での運用を前提としており、小規模な利用（蔵書数・ユーザー数ともに三桁未満）であればコストをかけずに運用可能です。

---

## English

### Overview

BookVault is a simple library management app for individuals or small teams. It lets you track books, lending, and user profiles. Built with Remix and Cloudflare Pages, it uses D1 for storage and supports Google Books integration and Cloudflare Access authentication.

### Key Features

- 📚 **Book Management**: Register, edit, and delete book information (title, author, ISBN, publisher, etc.)
- 🔍 **Search**: Search books by title, author, publisher, or tags
- 📖 **Loan Tracking**: Track book lending and return history
- 🏷️ **Tag Management**: Tag books and filter by tags
- 📱 **Google Books Integration**: Auto-fetch book information using ISBN
- 🔐 **Authentication**: Secure authentication via Cloudflare Access
- 👤 **User Management**: Profile settings and role management (admin/user)

### Tech Stack

- **Framework**: Remix (Cloudflare Pages adapter)
- **Infrastructure**: Cloudflare Pages + D1 (SQLite) + Cloudflare Access
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **External API**: Google Books API
- **Language**: TypeScript

### Documentation

For detailed technical specifications and architecture, please refer to:

- [Requirements (Japanese)](./docs/01-要件定義.md) - Project objectives, functional and non-functional requirements
- [Database Schema (Japanese)](./docs/02-DB定義.md) - Database schema and ER diagrams
- [UI Design (Japanese)](./docs/03-画面構成.md) - Screen layouts and routing design
- [Tech Stack & Implementation Rules (Japanese)](./docs/06-使用技術・実装ルール.md) - Technology choices and implementation guidelines
- [Local Development Notes (Japanese)](./docs/07-ローカル開発における注意点.md) - Development environment setup and considerations

External references:
- [Remix docs](https://remix.run/docs)
- [Remix Cloudflare docs](https://remix.run/guides/vite#cloudflare)

### Cost

This application is designed to run within Cloudflare's free tier. For small-scale usage (less than a few hundred books and users), it can be operated at no cost.

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
