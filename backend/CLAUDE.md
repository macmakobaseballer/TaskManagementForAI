# CLAUDE.md — バックエンド

Spring Boot バックエンド開発時に適用されるルールです。
プロジェクト全体のルール（Git・PR・Issue）はリポジトリルートの [CLAUDE.md](../CLAUDE.md) を参照してください。

---

## 1. ビルドとテストコマンド

作業ディレクトリは `backend/` を前提とする。

```bash
./gradlew build                # ビルド（テスト込み）
./gradlew test                 # テストのみ
./gradlew build -x test        # ビルド（テストスキップ）
./gradlew bootRun --args='--spring.profiles.active=local'  # ローカル起動
```

## 2. データベース起動

リポジトリルートから実行する。

```bash
docker compose up -d           # PostgreSQL 16 起動（サービス名: postgres）
docker compose down            # 停止
docker compose logs postgres   # ログ確認
```

バックエンド起動前に必ず DB が起動していることを確認する。

## 3. 重要ファイルパス

| パス | 用途 |
|------|------|
| `build.gradle` | Gradle依存関係・プラグイン設定 |
| `src/main/resources/application.yml` | アプリ共通設定（`ddl-auto: validate`） |
| `src/main/resources/application-local.yml` | ローカル開発用DB設定 |
| `src/main/resources/db/migration/` | Flywayマイグレーションスクリプト |

## 4. DBスキーマ変更の作法

`application.yml` で `ddl-auto: validate` が設定されているため、Hibernateによる自動DDL変更は**無効**。
スキーマ変更は必ず Flyway マイグレーションで行う。

- ファイル命名: `V{次の番号}__{説明}.sql`
- 例: `V2__add_comments_table.sql`（現在の最新: `V1__init_schema.sql`）
- **適用済みのマイグレーションファイルは絶対に編集しない**

## 5. テクノロジースタック

- Java 21
- Spring Boot 3.4.x
- Gradle 8.13（Groovy DSL）
- PostgreSQL 16（Flyway でマイグレーション管理）
