# TaskManagementForAI

Trello 風のカンバン形式タスク管理アプリ。ボード・リスト・カードの 3 階層でタスクを視覚的に管理できます。

## アーキテクチャ概要

```
ブラウザ (React 19 + Vite)
        │ HTTP/JSON (Axios)
        ▼  :5173 → :8080
バックエンド API (Spring Boot 3.4.5)
        │ JDBC (HikariCP)
        ▼
PostgreSQL 16 (Docker コンテナ :5432)
```

- フロントエンド: Vite dev server (ポート 5173)
- バックエンド REST API: Spring Boot (ポート 8080)
- データベース: PostgreSQL 16 on Docker (ポート 5432)

## 技術スタック

### バックエンド

| 技術 | バージョン |
|------|-----------|
| Java | 21.0.x LTS |
| Spring Boot | 3.4.5 |
| Gradle (Groovy DSL) | 8.13 |
| Spring Data JPA / Hibernate | Spring Boot BOM 管理 |
| Spring Security | Spring Boot BOM 管理 |
| Flyway | 10.x (Spring Boot BOM 管理) |
| PostgreSQL driver | Spring Boot BOM 管理 |
| HikariCP | Spring Boot 標準内蔵 |

### フロントエンド

| 技術 | バージョン |
|------|-----------|
| Node.js | 24.x |
| React | 19.2.x |
| TypeScript | ~6.0.x |
| Vite | 8.x |
| Tailwind CSS | 4.x |
| Axios | 1.x |
| react-router-dom | 7.x |

### インフラ

| 技術 | バージョン |
|------|-----------|
| PostgreSQL | 16 (Docker alpine イメージ) |
| Docker / Docker Compose | 29.x |

## 動作要件

- Java 21
- Node.js 24
- Docker & Docker Compose

## セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/macmakobaseballer/TaskManagementForAI.git
cd TaskManagementForAI
```

### 2. 環境変数ファイルを作成

```bash
cp .env.example .env
# .env を開いて POSTGRES_DB / POSTGRES_USER / POSTGRES_PASSWORD を設定
```

### 3. データベースを起動

```bash
docker compose up -d
```

### 4. バックエンドを起動

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'
```

> 初回起動時に Flyway が自動でスキーマを作成します。

### 5. フロントエンドを起動

```bash
cd frontend
npm install
npm run dev
```

ブラウザで http://localhost:5173 にアクセス。

## 開発コマンド

### バックエンド（`backend/` で実行）

```bash
./gradlew build           # ビルド（テスト込み）
./gradlew test            # テストのみ
./gradlew build -x test   # テストスキップでビルド
./gradlew bootRun --args='--spring.profiles.active=local'  # ローカル起動
```

### フロントエンド（`frontend/` で実行）

```bash
npm run dev      # 開発サーバー起動（ホットリロード）
npm run build    # 本番ビルド
npm run lint     # ESLint 実行
npm run preview  # 本番ビルドのプレビュー
```

### データベース

```bash
docker compose up -d           # PostgreSQL 起動
docker compose down            # 停止
docker compose logs postgres   # ログ確認
```

## ディレクトリ構成

```
TaskManagementForAI/
├── backend/           # Spring Boot バックエンド
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/          # アプリケーションコード
│   │   │   └── resources/
│   │   │       ├── application.yml        # 共通設定
│   │   │       ├── application-local.yml  # ローカル開発用 DB 設定
│   │   │       └── db/migration/          # Flyway マイグレーション
│   │   └── test/              # テストコード
│   ├── build.gradle
│   └── CLAUDE.md              # バックエンド開発ルール
├── frontend/          # React + Vite フロントエンド
│   ├── src/
│   │   ├── api/               # Axios API クライアント
│   │   ├── components/        # React コンポーネント
│   │   ├── hooks/             # カスタムフック
│   │   └── types/             # TypeScript 型定義
│   ├── package.json
│   └── vite.config.ts
├── docs/              # 設計ドキュメント
│   ├── 要件定義書.md
│   ├── 機能要件.md
│   ├── 画面仕様書.md
│   └── データベース設計.md
├── docker-compose.yml # PostgreSQL 16 コンテナ定義
├── .env.example       # 環境変数テンプレート
└── CLAUDE.md          # 開発ワークフロールール
```

## API エンドポイント

| メソッド | パス | 概要 |
|---------|------|------|
| GET | `/api/boards` | ボード一覧取得 |
| GET | `/api/boards/{id}` | ボード詳細（リスト・カード含む） |
| GET | `/api/cards/{id}` | カード詳細 |

ヘルスチェック: `GET /actuator/health`

## ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [要件定義書](docs/要件定義書.md) | プロダクト概要・技術スタック・非機能要件 |
| [機能要件](docs/機能要件.md) | 機能 ID ごとの詳細仕様 |
| [データベース設計](docs/データベース設計.md) | ER 図・テーブル定義・インデックス設計 |
| [画面仕様書](docs/画面仕様書.md) | 各画面・モーダルのレイアウト仕様 |
| [開発ガイド](.github/CONTRIBUTING.md) | ブランチ戦略・PR フロー |
