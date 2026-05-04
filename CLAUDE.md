# CLAUDE.md

このファイルは Claude Code がこのリポジトリで作業する際の行動ルールを定めます。
人間向けの開発フロー詳細は [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) を参照してください。

---

## 1. ブランチとPushの絶対ルール

- `main` および `develop` への直接 Push は**絶対に禁止**。必ずPRを経由する。
- 作業は常に `develop` から派生したブランチで行う。
- 作業前に必ずブランチを確認する: `git branch --show-current`

**ブランチ命名規則:** `<type>/<issue番号>-<短い説明>`

| type | 用途 |
|------|------|
| `feature` | 新機能実装 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `refactor` | リファクタリング（機能変更なし） |
| `chore` | ビルド・CI・依存関係の変更 |
| `test` | テストの追加・修正 |

例: `feature/12-add-comment` / `fix/34-card-freeze` / `docs/update-api-spec`
issue番号が存在しない場合のみ省略可（例: `docs/update-readme`）

## 2. コミットメッセージ規則

[Conventional Commits](https://www.conventionalcommits.org/) 形式を厳守する。

```
<type>: <概要（日本語可）>
```

- 正しい例: `feat: カードにコメント機能を追加`
- 正しい例: `fix: カード削除時のフリーズを修正`
- 誤った例: `add comment feature`（typeなし）

## 3. PRの作成ルール

1. ベースブランチは必ず `develop`（`main` へのPRは直接作らない）
2. PR説明は [.github/pull_request_template.md](.github/pull_request_template.md) のテンプレートに従う
3. 関連Issueは `Closes #<番号>` でリンクする
4. PRタイトルもコミットと同様の Conventional Commits 形式にする
5. Squash merge 推奨（マージ後は作業ブランチを削除）

```bash
gh pr create --base develop --title "feat: カードにコメント機能を追加" --body "..."
```

## 4. ビルドとテストコマンド

### バックエンド（作業dir: `backend/`）

```bash
cd backend && ./gradlew build           # ビルド（テスト込み）
cd backend && ./gradlew test            # テストのみ
cd backend && ./gradlew build -x test   # ビルド（テストスキップ）
cd backend && ./gradlew bootRun --args='--spring.profiles.active=local'  # 起動
```

### データベース（リポジトリルートから）

```bash
docker compose up -d            # PostgreSQL 起動（サービス名: postgres）
docker compose down             # 停止
docker compose logs postgres    # ログ確認
```

### フロントエンド

> まだ作成されていない。ディレクトリが追加され次第このセクションを更新する。

## 5. 重要ファイルパス

| パス | 用途 |
|------|------|
| `backend/build.gradle` | Gradle依存関係・プラグイン設定 |
| `backend/src/main/resources/application.yml` | アプリ共通設定（`ddl-auto: validate`） |
| `backend/src/main/resources/application-local.yml` | ローカル開発用DB設定 |
| `backend/src/main/resources/db/migration/` | Flywayマイグレーションスクリプト |
| `docker-compose.yml` | PostgreSQL 16 コンテナ定義 |
| `.env.example` | 環境変数テンプレート（`.env` はgit管理外） |
| `.github/CONTRIBUTING.md` | 人間向け開発フロー |
| `docs/機能要件.md` | 機能要件一覧 |
| `docs/要件定義書.md` | 要件定義書 |
| `docs/データベース設計.md` | DBスキーマ設計 |

## 6. DBスキーマ変更の作法

`application.yml` で `ddl-auto: validate` が設定されているため、Hibernateによる自動DDL変更は**無効**。
スキーマ変更は必ず Flyway マイグレーションで行う。

- ファイル命名: `V{次の番号}__{説明}.sql`
- 例: `V2__add_comments_table.sql`（現在の最新: `V1__init_schema.sql`）
- **適用済みのマイグレーションファイルは絶対に編集しない**

## 7. 言語規則

| 対象 | 言語 |
|------|------|
| クラス名・メソッド名・変数名 | 英語 |
| コミットメッセージ概要 | 日本語可（英語も可） |
| PRタイトル・本文 | 日本語 |
| コードコメント | 日本語可 |
| `docs/` 配下・このファイル | 日本語 |

## 8. 禁止事項

- `.env` をコミットしない（`.gitignore` で除外済み）
- `git push --force` を使わない（`.claude/settings.json` でブロック済み）
- `git reset --hard` を使わない（`.claude/settings.json` でブロック済み）
- `main` / `develop` への直接Pushを試みない

## 9. Issue管理

[.github/ISSUE_TEMPLATE/](.github/ISSUE_TEMPLATE/) の3種テンプレートを使用:

| テンプレート | 自動ラベル | 用途 |
|------------|-----------|------|
| `bug_report.yml` | `bug`, `triage` | 不具合報告 |
| `feature_request.yml` | `enhancement` | 新機能提案 |
| `task.yml` | `task` | 実装・作業チケット |

作成後に優先度ラベル (`priority: high` / `priority: medium` / `priority: low`) を手動で付与する。
