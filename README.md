# Hono Railway

TypeScript の Web アプリケーションフレームワークである Hono を使用して、
TODO アプリのバックエンド開発を学習するための Railway 教材です。

## 環境構築

この Railway に取り組むために必要な下記ツールのインストール方法と環境構築の手順を解説します。

- Node.js v24 LTS
- pnpm
- Docker Desktop
- Visual Studio Code
- Git

Visual Studio Code と Git についてのインストール方法は、
[Railway 準備編](https://techbowl.notion.site/Railway-ceba695d5014460e9733c2a46318cdec) をご確認いただき、挑戦の準備をしてください。

## 扱う技術要素

- **Hono** - TypeScript 用の軽量 Web アプリケーションフレームワーク
- **Drizzle ORM** - TypeScript 用 ORM
- **PostgreSQL** - リレーショナルデータベース
- **Vitest** - テスティングフレームワーク

## 開発環境

```
┌─────────────────────────────────────────────────────────────┐
│  ローカル環境                                                  │
│  ┌──────────────────┐        ┌──────────────────────────┐   │
│  │  Node.js (Hono)  │  ───▶  │  Docker (PostgreSQL)     │   │
│  │  localhost:18008 │        │  localhost:5432          │   │
│  └──────────────────┘        └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

- アプリケーションは Node.js でローカル実行します
- PostgreSQL は Docker コンテナで起動します

## セットアップ手順

### 1. Node.js と pnpm のインストール

Node.js v24 LTS をインストールしてください。
pnpm は Node.js に corepack で同梱されています。

```bash
corepack enable pnpm
```

### 2. Docker Desktop のインストール

Docker Desktop をインストールしてください。

- [Windows](./docs/README-windows.md)
- [MacOS](./docs/README-mac.md)

### 3. 依存パッケージのインストール

```bash
pnpm install
```

### 4. 環境変数の設定

```bash
cp .env.example .env
```

### 5. データベースの起動

```bash
docker compose up -d
```

### 6. 開発サーバの起動

```bash
pnpm dev
```

ブラウザで http://localhost:18008/hello にアクセスして動作確認してください。

## プロジェクト構造

```
.
├── .techtrain/
│   └── manifests/          # TechTrain 合格判定用設定
├── .vscode/
│   └── extensions.json     # 推奨拡張機能
├── infra/
│   └── db/                 # PostgreSQL Docker 設定
├── src/
│   ├── app.ts              # Hono アプリケーションエントリポイント
│   ├── index.ts            # サーバー起動エントリポイント
│   ├── db/                 # データベース関連コード
│   └── routes/             # ルート定義
├── tests/                  # Vitest テストコード
├── test-outputs/           # テスト出力保存フォルダ
├── docker-compose.yml      # Docker Compose 定義
├── package.json            # 依存関係とスクリプト
└── tsconfig.json           # TypeScript 設定
```

## 主に使用している VSCode 拡張機能

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [TypeScript Next](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)
- [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)

## スクリプト一覧

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバを起動（ホットリロード対応） |
| `pnpm build` | TypeScript をビルド |
| `pnpm start` | ビルド後のアプリケーションを起動 |
| `pnpm test` | テストを実行 |
| `pnpm lint` | ESLint によるコードチェック |
| `pnpm format` | Prettier によるコードフォーマット |
| `pnpm db:studio` | Drizzle Studio を起動（DB GUI） |
