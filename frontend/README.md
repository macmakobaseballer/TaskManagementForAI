# TaskManagementForAI — フロントエンド

React 19 + TypeScript + Vite によるフロントエンドアプリケーション。

## 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | 19.2.x | UI フレームワーク |
| TypeScript | ~6.0.x | 型安全な JavaScript |
| Vite | 8.x | バンドラー・開発サーバー |
| Tailwind CSS | 4.x | ユーティリティファースト CSS |
| react-router-dom | 7.x | クライアントサイドルーティング |
| Axios | 1.x | HTTP クライアント |

## 開発コマンド

```bash
npm install      # 依存パッケージのインストール
npm run dev      # 開発サーバー起動（ポート 5173、ホットリロード）
npm run build    # 本番ビルド（dist/ に出力）
npm run lint     # ESLint 実行
npm run preview  # 本番ビルドのプレビュー
```

## ディレクトリ構成

```
frontend/src/
├── api/               # Axios を使った API クライアント
│   ├── client.ts      # Axios インスタンスの設定
│   ├── boards.ts      # ボード API
│   └── cards.ts       # カード API
├── components/        # React コンポーネント
│   ├── BoardList.tsx  # ボード一覧画面
│   ├── BoardDetail.tsx # カンバン画面（ボード詳細）
│   └── CardDetail.tsx # カード詳細モーダル
├── hooks/             # カスタムフック
│   ├── useBoards.ts
│   ├── useBoardDetail.ts
│   └── useCardDetail.ts
├── types/
│   └── api.ts         # API レスポンスの TypeScript 型定義
├── App.tsx            # ルーティング設定
└── main.tsx           # エントリーポイント
```

## バックエンドとの接続

開発時は Vite のプロキシを経由してバックエンド API (`:8080`) に接続します。
バックエンドが起動していない場合は API リクエストが失敗します。

詳細はリポジトリルートの [README.md](../README.md) を参照してください。
