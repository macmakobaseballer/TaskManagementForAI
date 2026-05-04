# CLAUDE.md

このファイルは Claude Code がこのリポジトリで作業する際の行動ルールを定めます。
人間向けの開発フロー詳細は [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) を参照してください。

---

## 0. 開発ワークフロー（必ず守ること）

**いかなる開発作業も、GitHub Issue を作成してから始める。**

```
① Issue 作成 → ② ブランチ作成 → ③ 実装 → ④ PR 作成 → ⑤ マージ
```

### ① Issue 作成

```bash
# バグ報告
gh issue create --title "fix: <概要>" --label "bug,triage" --repo macmakobaseballer/TaskManagementForAI

# 新機能
gh issue create --title "feat: <概要>" --label "enhancement" --repo macmakobaseballer/TaskManagementForAI

# 作業タスク
gh issue create --title "task: <概要>" --label "task" --repo macmakobaseballer/TaskManagementForAI
```

- Issue 本文は [.github/ISSUE_TEMPLATE/](.github/ISSUE_TEMPLATE/) のテンプレートに沿って記述する
- 作成後に優先度ラベル (`priority: high` / `priority: medium` / `priority: low`) を付与する
- **Issue 番号を必ず控える**（ブランチ名・PRに使用する）

### ② ブランチ作成

```bash
git checkout develop && git pull origin develop
git checkout -b <type>/<issue番号>-<短い説明>
# 例: git checkout -b feature/12-add-comment
```

### ③ 実装・コミット

コミットメッセージは Conventional Commits 形式（§2 参照）。

### ④ PR 作成

```bash
gh pr create --base develop \
  --title "<type>: <概要>" \
  --body "Closes #<issue番号>"
```

PR 本文は [.github/pull_request_template.md](.github/pull_request_template.md) に従う。

### ⑤ マージ後

- Squash merge を使用する
- 作業ブランチを削除する

---

## 1. ブランチとPushの絶対ルール

- `main` および `develop` への直接 Push は**絶対に禁止**。必ずPRを経由する。
- 作業は常に `develop` から派生したブランチで行う。

**ブランチ命名規則:** `<type>/<issue番号>-<短い説明>`

| type | 用途 |
|------|------|
| `feature` | 新機能実装 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `refactor` | リファクタリング（機能変更なし） |
| `chore` | ビルド・CI・依存関係の変更 |
| `test` | テストの追加・修正 |

## 2. コミットメッセージ規則

```
<type>: <概要（日本語可）>
```

- 正しい例: `feat: カードにコメント機能を追加`
- 誤った例: `add comment feature`（typeなし）

## 3. PRの作成ルール

1. ベースブランチは必ず `develop`（`main` へのPRは直接作らない）
2. 関連Issueは `Closes #<番号>` でリンクする
3. Squash merge 推奨（マージ後は作業ブランチを削除）

## 4. 重要ファイルパス

| パス | 用途 |
|------|------|
| `docker-compose.yml` | PostgreSQL 16 コンテナ定義 |
| `.env.example` | 環境変数テンプレート（`.env` はgit管理外） |
| `.github/CONTRIBUTING.md` | 人間向け開発フロー |
| `docs/機能要件.md` | 機能要件一覧 |
| `docs/要件定義書.md` | 要件定義書 |
| `docs/データベース設計.md` | DBスキーマ設計 |

バックエンド固有のファイルパスは [backend/CLAUDE.md](backend/CLAUDE.md) を参照。

## 5. 言語規則

| 対象 | 言語 |
|------|------|
| クラス名・メソッド名・変数名 | 英語 |
| コミットメッセージ概要 | 日本語可（英語も可） |
| PRタイトル・本文 | 日本語 |
| コードコメント | 日本語可 |
| `docs/` 配下・このファイル | 日本語 |

## 6. 禁止事項

- `.env` をコミットしない（`.gitignore` で除外済み）
- `git push --force` を使わない（`.claude/settings.json` でブロック済み）
- `git reset --hard` を使わない（`.claude/settings.json` でブロック済み）
- `main` / `develop` への直接Pushを試みない
