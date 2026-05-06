---
name: security-check
description: コミット後・Push前にセキュリティリスクのある情報が含まれていないかチェックするスキル。インフラ（AWSアカウントID・アクセスキー・ARN等）・バックエンド（Java/Spring Boot: SQLインジェクション・ハードコード認証情報・CORS設定等）・フロントエンド（React/TS: XSS・ハードコードAPIキー・localStorage機密情報等）の3層をすべてスキャンする。以下のような場面で使用すること: 「コミット後にセキュリティチェックして」「Pushする前にセキュリティチェックして」「機密情報が入っていないか確認して」「セキュリティスキャンして」「実装にセキュリティ問題がないか確認して」。git diff や変更ファイルを対象に実行する。
---

# security-check

コミット後・Push前に変更ファイルをスキャンし、インフラ・バックエンド・フロントエンドの3層でセキュリティ問題を優先度付きで報告する。

---

## スキャン対象ファイルの収集

デフォルトは **直近コミットの変更ファイル**。ユーザーが特定ファイルを指定した場合はそのファイルのみ対象とする。

```bash
# 直近コミットの変更ファイル
git diff --name-only HEAD~1 HEAD 2>/dev/null

# まだコミットされていない変更も含める場合
git diff --name-only HEAD 2>/dev/null
git ls-files --others --exclude-standard 2>/dev/null
```

ファイルを拡張子でグループ分けして、該当する層のチェックを実行する:
- **インフラ層**: `*.tf`, `*.yml`, `*.yaml`, `*.sh`, `*.md`, `*.json`（`node_modules/` 除く）
- **バックエンド層**: `*.java`, `*.kt`, `*.properties`, `*.yml`（`backend/` 配下）
- **フロントエンド層**: `*.ts`, `*.tsx`, `*.js`, `*.jsx`, `*.env*`（`frontend/` 配下）

---

## 除外ファイル

```
*.lock  (package-lock.json, gradle.lockfile 等)
node_modules/
.git/
.claude/skills/  ← スキル定義自体に含まれる例示値は誤検知のため除外
```

`<YOUR_AWS_ACCOUNT_ID>` / `<YOUR_IAM_USER>` 等のプレースホルダー形式は検出対象外とする。

---

## 層1: インフラ・設定ファイルのチェック

対象: `*.tf`, `*.yml`, `*.yaml`, `*.sh`, `*.md`, `terraform.tfvars`

| 優先度 | カテゴリ | パターン | 例 |
|-------|---------|---------|---|
| CRITICAL | AWS アクセスキー ID | `AKIA[0-9A-Z]{16}` | `AKIAIOSFODNN7EXAMPLE` |
| CRITICAL | AWS シークレットアクセスキー | `(secret|aws_secret).*[A-Za-z0-9/+=]{40}` | 40文字のランダム文字列 |
| CRITICAL | AWS セッショントークン | `ASIA[0-9A-Z]{16}` | 一時認証情報 |
| HIGH | AWS アカウント ID | `\b[0-9]{12}\b`（AWS文脈） | `238337501373` |
| HIGH | ARN（アカウントID含む） | `arn:aws:[^:]+:[^:]*:[0-9]{12}:` | `arn:aws:iam::123456789012:user/foo` |
| MEDIUM | パスワードのハードコード | `(password\|passwd\|pwd)\s*[=:]\s*['"]?[^\s'"]{6,}` | `password=MySecret123` |
| MEDIUM | 秘密鍵ブロック | `-----BEGIN (RSA\|EC\|OPENSSH\|PRIVATE) KEY-----` | PEM 形式の秘密鍵 |
| LOW | DB接続文字列（認証情報入り） | `jdbc:[^:]+://[^:]+:[^@]+@` | `jdbc:postgresql://user:pass@host` |

```bash
# CRITICAL: AWS アクセスキー
grep -n -E "(AKIA|ASIA)[0-9A-Z]{16}" "$file"

# HIGH: AWS アカウント ID
grep -n -E "\b[0-9]{12}\b" "$file"

# HIGH: ARN
grep -n -E "arn:aws:[a-z0-9-]+:[a-z0-9-]*:[0-9]{12}:" "$file"

# MEDIUM: パスワードのハードコード
grep -n -i -E "(password|passwd|pwd)\s*[=:]\s*['\"]?[^\s'\"]{6,}" "$file"

# MEDIUM: 秘密鍵
grep -n -E "-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----" "$file"

# LOW: DB接続文字列（認証情報入り）
grep -n -E "jdbc:[a-z]+://[^:]+:[^@]+@" "$file"
```

---

## 層2: バックエンド（Java / Spring Boot）のチェック

対象: `backend/src/**/*.java`, `backend/src/**/*.properties`, `backend/src/**/*.yml`

| 優先度 | カテゴリ | 検出内容 | 悪い例 |
|-------|---------|---------|-------|
| CRITICAL | SQLインジェクション | 文字列結合でSQLを組み立てている | `"SELECT * FROM users WHERE id = " + id` |
| CRITICAL | ハードコード認証情報 | Java コード内にパスワード・トークンが直書き | `String password = "secret123"` |
| HIGH | `@CrossOrigin` の過剰許可 | `origins = "*"` で全ドメイン許可 | `@CrossOrigin(origins = "*")` |
| HIGH | Spring Security 無効化 | SecurityConfig で認証を全無効化 | `permitAll()` の過剰使用 |
| HIGH | 例外の丸投げ（情報漏洩） | スタックトレースをレスポンスに含める | `e.printStackTrace()` をそのまま返却 |
| MEDIUM | `@Transactional` の readOnly 未設定 | 更新系でないのに readOnly 指定なし | 参照専用メソッドへの未設定 |
| MEDIUM | 入力バリデーション欠如 | `@Valid` / `@Validated` なしでリクエストを受け取る | `@RequestBody` に `@Valid` なし |
| LOW | ログへの機密情報出力 | パスワード・トークンを log.info 等で出力 | `log.info("password: {}", password)` |

```bash
# CRITICAL: SQLインジェクション（文字列結合）
grep -n -E '"(SELECT|INSERT|UPDATE|DELETE).*"\s*\+' "$file"
grep -n -E 'createQuery\(.*\+.*\)' "$file"

# CRITICAL: ハードコード認証情報
grep -n -i -E '(password|passwd|secret|token|apikey)\s*=\s*"[^$\{][^"]{5,}"' "$file"

# HIGH: CrossOrigin 全許可
grep -n -E '@CrossOrigin\s*\(.*\*.*\)' "$file"

# HIGH: セキュリティ全開放
grep -n -E '\.permitAll\(\)' "$file"
grep -n -E 'disable\(\)' "$file"

# HIGH: スタックトレース露出
grep -n -E 'e\.printStackTrace\(\)' "$file"

# MEDIUM: @Valid なし RequestBody
grep -n -B1 '@RequestBody' "$file" | grep -v '@Valid'

# LOW: ログへの機密情報
grep -n -i -E 'log\.(info|debug|warn|error).*\b(password|token|secret)\b' "$file"
```

---

## 層3: フロントエンド（React / TypeScript）のチェック

対象: `frontend/src/**/*.ts`, `frontend/src/**/*.tsx`, `frontend/src/**/*.js`, `frontend/.env*`

| 優先度 | カテゴリ | 検出内容 | 悪い例 |
|-------|---------|---------|-------|
| CRITICAL | ハードコード API キー・トークン | ソースコードに認証情報を直書き | `const API_KEY = "sk-abc123..."` |
| CRITICAL | `dangerouslySetInnerHTML` の使用 | XSS リスク | `dangerouslySetInnerHTML={{ __html: userInput }}` |
| HIGH | `localStorage` に機密情報を保存 | トークン・パスワードを localStorage に保存 | `localStorage.setItem("token", jwt)` |
| HIGH | `VITE_` 付きの機密情報 | ビルド時にバンドルされてブラウザに露出 | `VITE_SECRET_KEY=xxx` in `.env` |
| HIGH | `eval()` の使用 | 任意コード実行リスク | `eval(userInput)` |
| MEDIUM | HTTP（非HTTPS）の API エンドポイント | 通信の盗聴リスク | `http://api.example.com` のハードコード |
| MEDIUM | `console.log` で機密情報出力 | ブラウザコンソールに機密が残る | `console.log("token:", token)` |
| LOW | CORS プロキシ設定の全許可 | `vite.config.ts` で `*` 許可 | `origin: '*'` |

```bash
# CRITICAL: ハードコード API キー（環境変数以外）
grep -n -i -E "const\s+(API_KEY|SECRET|TOKEN|PASSWORD)\s*=\s*['\"][^'\"]+" "$file"

# CRITICAL: dangerouslySetInnerHTML
grep -n -E 'dangerouslySetInnerHTML' "$file"

# HIGH: localStorage に token/password 系を保存
grep -n -i -E "localStorage\.setItem\(['\"]?(token|password|secret|auth)" "$file"

# HIGH: eval 使用
grep -n -E '\beval\s*\(' "$file"

# HIGH: .env ファイルに VITE_ 付き機密情報
grep -n -i -E "VITE_.*(SECRET|KEY|PASSWORD|TOKEN)\s*=" "$file"

# MEDIUM: HTTP ハードコード
grep -n -E '"http://[^l]' "$file"  # http://localhost は除外

# MEDIUM: console.log で機密情報
grep -n -i -E 'console\.(log|warn|error).*\b(token|password|secret)\b' "$file"
```

---

## 結果レポート形式

スキャン完了後、以下の形式で報告する:

```
## セキュリティチェック結果

### 🔴 CRITICAL（即時修正・Push 禁止）
- [backend/src/.../UserService.java:42] SQLインジェクション: 文字列結合でクエリを組み立てています
  該当: `"SELECT * FROM users WHERE id = " + userId`
  対応: JPA の `@Query` パラメータバインディング（`?1` or `:id`）を使用してください

### 🟠 HIGH（Push 前に修正推奨）
- [frontend/src/api/client.ts:8] localStorage にトークンを保存しています
  該当: `localStorage.setItem("authToken", token)`
  対応: httpOnly Cookie または メモリ上の状態管理に変更してください

### 🟡 MEDIUM（確認推奨）
- ...

### 🔵 LOW（許容可能だが要確認）
- ...

---
⚠️ N 件の問題が見つかりました（CRITICAL: X, HIGH: Y, MEDIUM: Z, LOW: W）
```

問題がなければ:
```
✅ セキュリティチェック完了（インフラ・バックエンド・フロントエンドの3層）— 問題は検出されませんでした。Push 可能です。
```

---

## 注意事項

- **CRITICAL が 1 件でもある場合は Push を止めるよう強く警告する**
- **HIGH 以上はすべて修正を推奨する**
- 誤検知（テスト用ダミー値、コメント内の例示等）の可能性がある場合はユーザーに確認を取る
- `.gitignore` に `.env`・`terraform.tfvars`・`*.pem` が含まれているか合わせて確認し、なければ追加を推奨する
- バックエンドの `@CrossOrigin` や Spring Security 設定は学習用途で意図的に緩くしている場合があるため、判断が難しい場合はユーザーに確認する
