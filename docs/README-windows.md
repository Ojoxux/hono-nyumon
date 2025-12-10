# Windows 環境セットアップ

Windows で Hono Railway の開発環境をセットアップする手順を説明します。

## Node.js のインストール

1. [Node.js 公式サイト](https://nodejs.org/) から Node.js v24 LTS をダウンロードしてインストールします。

2. インストール後、コマンドプロンプトまたは PowerShell で以下を実行して確認します：

```powershell
node --version
```

3. pnpm を有効化します：

```powershell
corepack enable pnpm
pnpm --version
```

## Docker Desktop のインストール

1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) をダウンロードしてインストールします。

2. インストール後、Docker Desktop を起動します。

3. コマンドプロンプトまたは PowerShell で以下を実行して確認します：

```powershell
docker --version
docker compose version
```

## WSL 2 について

Docker Desktop は WSL 2 を使用します。インストール時に WSL 2 のセットアップが求められる場合があります。

詳細は [WSL のインストール](https://learn.microsoft.com/ja-jp/windows/wsl/install) を参照してください。
