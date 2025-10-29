# テスト実行ガイド

## WSL2環境でのテスト実行問題

WSL2環境では、vitestのesbuildが`write EPIPE`エラーで失敗する既知の問題があります。

### 解決方法

#### オプション1: Windowsネイティブで実行（推奨）

```bash
# PowerShellまたはCmd.exeで実行
npm run test:run
```

#### オプション2: WSLでnode_modulesを再インストール

```bash
# WSL内でLinuxバイナリを使用
rm -rf node_modules package-lock.json
npm install --force
npm run test:run
```

#### オプション3: Docker環境で実行

```bash
docker run -it --rm -v $(pwd):/app -w /app node:20 npm run test:run
```

#### オプション4: CI/CDで実行（GitHub Actions）

プロジェクトに`.github/workflows/test.yml`が設定されている場合、
GitHubにpushすると自動的にテストが実行されます。

## テストの種類

```bash
# すべてのテストを実行
npm run test:run

# カバレッジ付きで実行
npm run test:coverage

# ウォッチモードで実行
npm run test:watch

# UIモードで実行（ブラウザで結果確認）
npm run test:ui
```

## テストファイルの場所

- `components/*.test.tsx` - コンポーネントのテスト
- `services/*.test.ts` - サービスレイヤーのテスト
- `contexts/*.test.tsx` - コンテキストのテスト
- `__tests__/integration/*.test.tsx` - 統合テスト

## カバレッジ閾値

現在の閾値設定：

- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## 参考リンク

- [Vitest WSL Issue](https://github.com/vitest-dev/vitest/issues/3077)
- [esbuild WSL2 EPIPE](https://github.com/evanw/esbuild/issues/1819)
