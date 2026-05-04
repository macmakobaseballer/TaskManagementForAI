# 開発フロー

## ブランチ戦略

```
main        本番リリース用。直接Pushは禁止。developからのみマージ可。
develop     開発統合ブランチ。機能ブランチのマージ先。直接Pushは禁止。
feature/*   新機能開発
fix/*       バグ修正
docs/*      ドキュメント
refactor/*  リファクタリング
chore/*     設定・依存関係・CI等の変更
```

## ブランチ命名規則

```
<type>/<issue番号>-<短い説明>

例:
  feature/12-add-comment-feature
  fix/34-card-delete-freeze
  docs/update-api-spec
```

| type | 用途 |
|------|------|
| `feature` | 新機能実装 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `refactor` | リファクタリング（機能変更なし） |
| `chore` | ビルド・CI・依存関係の変更 |
| `test` | テストの追加・修正 |

## コミットメッセージ規則

[Conventional Commits](https://www.conventionalcommits.org/) に従う。

```
<type>: <概要（日本語可）>

例:
  feat: カードにコメント機能を追加
  fix: カード削除時のフリーズを修正
  docs: API仕様書を更新
```

## PR作成の流れ

1. `develop` から作業ブランチを作成
2. 実装 → コミット
3. `develop` へPRを作成（テンプレートに従って記入）
4. レビュー → 承認後マージ（Squash merge 推奨）
5. 作業ブランチを削除

## リリースの流れ

1. `develop` → `main` へPR作成
2. 動作確認・レビュー後マージ
3. GitHub Releases でタグを付与

## Issue ラベル

| ラベル | 説明 |
|--------|------|
| `bug` | 不具合 |
| `enhancement` | 機能追加・改善 |
| `task` | 実装タスク |
| `triage` | 調査・優先度未定 |
| `priority: high` | 優先度：高 |
| `priority: medium` | 優先度：中 |
| `priority: low` | 優先度：低 |
| `status: in-progress` | 対応中 |
| `status: blocked` | ブロック中 |
| `good first issue` | 初心者向け |
