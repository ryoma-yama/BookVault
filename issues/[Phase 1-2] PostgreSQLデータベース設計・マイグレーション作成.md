## 概要
現行のRemix + Drizzle ORM + SQLiteスキーマをLaravel + PostgreSQLのマイグレーションファイルに変換し、すべてのテーブルとリレーションを構築します。

## タスク詳細

### スキーマ分析
- [ ] `app/db/schema.ts`の全テーブル定義を分析
- [ ] リレーションシップの洗い出し
- [ ] インデックス・制約の確認

### Laravelマイグレーション作成
以下のテーブルのマイグレーションファイルを作成：
- [ ] `users` テーブル
- [ ] `books` テーブル
- [ ] `authors` テーブル
- [ ] `book_authors` テーブル（中間テーブル）
- [ ] `tags` テーブル
- [ ] `book_tags` テーブル（中間テーブル）
- [ ] `book_copies` テーブル
- [ ] `loans` テーブル
- [ ] `reservations` テーブル
- [ ] `reviews` テーブル
- [ ] `audit_logs` テーブル

### データ型変換
- [ ] SQLiteの`TEXT`型（日付）→PostgreSQLの`timestamp`型へ変換
- [ ] `integer`型のauto increment設定
- [ ] UNIQUE制約の適用（`google_id`, `isbn_13`, `email`）
- [ ] 外部キー制約の設定

### Eloquentモデル作成
- [ ] 各テーブルに対応するEloquentモデルの作成
- [ ] リレーションシップの定義（hasMany, belongsTo, belongsToMany）
- [ ] `$fillable`, `$casts`の設定

### シードデータ移植
- [ ] `seed.sql`の内容を分析
- [ ] Laravel Seederクラスの作成
- [ ] テストデータの投入確認

## 技術要件
- **参照元**: `app/db/schema.ts`, `docs/02-DB定義.md`, `seed.sql`
- **PostgreSQL**: カラム型はPostgreSQL準拠
- **外部キー**: ON DELETE CASCADE等の適切な設定
- **インデックス**: 検索対象カラムに適切なインデックス

## データ型対応表
| Drizzle (SQLite) | Laravel (PostgreSQL) |
|------------------|---------------------|
| `text("created_at")` | `timestamp('created_at')` |
| `integer("id").primaryKey()` | `id()` or `bigIncrements('id')` |
| `text("email").unique()` | `string('email')->unique()` |
| `integer("fulfilled", {mode: "boolean"})` | `boolean('fulfilled')->default(false)` |

## 完了条件（DoD）
- [ ] すべてのマイグレーションファイルが作成されている
- [ ] `php artisan migrate`が正常に実行できる
- [ ] すべてのEloquentモデルが作成されている
- [ ] リレーションシップが正しく動作する（tinkerで確認）
- [ ] Seederが正常に実行できる
- [ ] ER図ドキュメントを更新（`docs/database.md`）

## 関連イシュー
- Phase 1-1: Laravel環境構築（前提）
- Phase 2-1: 書籍管理機能実装（依存）