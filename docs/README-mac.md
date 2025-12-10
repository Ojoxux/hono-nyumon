# macOS 環境セットアップ

macOS で Hono Railway の開発環境をセットアップする手順を説明します。

## Node.js のインストール

### Homebrew を使用する場合

1. Homebrew がインストールされていない場合は、以下のコマンドでインストールします：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Node.js v24 をインストールします：

```bash
brew install node@24
```

3. インストール後、以下を実行して確認します：

```bash
node --version
```

4. pnpm を有効化します：

```bash
corepack enable pnpm
pnpm --version
```

### 公式インストーラを使用する場合

[Node.js 公式サイト](https://nodejs.org/) から Node.js v24 LTS をダウンロードしてインストールします。

## Docker Desktop のインストール

1. [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/) をダウンロードしてインストールします。

2. インストール後、Docker Desktop を起動します。

3. ターミナルで以下を実行して確認します：

```bash
docker --version
docker compose version
```

## Apple Silicon (M1/M2/M3) について

Apple Silicon 搭載の Mac を使用している場合は、Docker Desktop の Apple Silicon 版をダウンロードしてください。
