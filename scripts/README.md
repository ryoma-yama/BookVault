# GitHub Issue Creation Script

このスクリプトは、`/issues` ディレクトリ内のマークダウンファイルを読み取り、GitHub Issues として自動的に作成するツールです。

## 前提条件

1. GitHub Personal Access Token (PAT) が必要です
   - [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens) から作成できます
   - 必要なスコープ: `repo` (プライベートリポジトリの場合) または `public_repo` (パブリックリポジトリの場合)

2. 依存パッケージのインストール:
   ```bash
   pnpm install
   ```

## 使い方

### 1. 環境変数の設定

GitHubトークンを環境変数として設定します:

```bash
export GITHUB_TOKEN=ghp_your_token_here
```

リポジトリ名を指定する場合（オプション）:

```bash
export GITHUB_REPOSITORY=owner/repo
```

※ `GITHUB_REPOSITORY` を省略した場合、スクリプトは自動的に git remote から取得を試みます。

### 2. スクリプトの実行

```bash
pnpm create-issues
```

## 動作の仕組み

1. `/issues` ディレクトリ内のすべてのファイルを読み取ります
2. 各ファイルから以下を抽出します:
   - **タイトル**: ファイル名から抽出（数字のみの場合は、ファイル内の最初の見出しから取得）
   - **本文**: ファイルの全内容
   - **ラベル**: コンテンツに基づいて自動的に検出（例: "Phase"、"PostgreSQL"、"Laravel"など）
3. GitHub API を使用して Issue を作成します

## ファイル形式

### 例 1: 数字のみのファイル名（`issues/1`）

ファイル名が数字のみの場合、スクリプトはファイル内の最初の `#` 見出しをタイトルとして使用します:

```markdown
## Laravel 12プロジェクトのセットアップ

Remix + Cloudflare環境からLaravel 12への移行...
```

この場合、Issue タイトルは "Laravel 12プロジェクトのセットアップ" になります。

### 例 2: わかりやすいファイル名（`issues/[Phase 1-2] PostgreSQLデータベース設計・マイグレーション作成.md`）

ファイル名がわかりやすい場合、そのファイル名がそのままタイトルになります（`.md` 拡張子は除去されます）:

```markdown
## 概要
現行のRemix + Drizzle ORM + SQLiteスキーマを...
```

この場合、Issue タイトルは "[Phase 1-2] PostgreSQLデータベース設計・マイグレーション作成" になります。

## 自動ラベル検出

スクリプトは以下のキーワードに基づいてラベルを自動的に付与します:

- `Phase` を含む場合: `enhancement` ラベル
- `PostgreSQL` または `database` を含む場合: `database` ラベル
- `Laravel` を含む場合: `migration` ラベル

## 注意事項

- **既存のIssueとの重複**: このスクリプトは既存の Issue をチェックしません。同じ内容で複数回実行すると、重複した Issue が作成されます。
- **レート制限**: GitHub API のレート制限を避けるため、各 Issue の作成間に 1 秒の遅延があります。
- **トークンの保護**: `GITHUB_TOKEN` は機密情報です。コミットしたり公開したりしないよう注意してください。

## トラブルシューティング

### エラー: "GITHUB_TOKEN environment variable is required"

環境変数 `GITHUB_TOKEN` が設定されていません。上記の手順に従って設定してください。

### エラー: "Failed to create issue: 401"

トークンが無効または期限切れです。新しいトークンを作成して設定してください。

### エラー: "Failed to create issue: 404"

リポジトリが見つかりません。`GITHUB_REPOSITORY` 環境変数が正しく設定されているか確認してください。
