# Security Configuration

このドキュメントは、Self-Care Guide for Wellness アプリケーションのセキュリティ設定について説明します。

## セキュリティヘッダー

### 1. Content Security Policy (CSP)

**API エンドポイント** (`api/compendium.ts`):

```
default-src 'none'; script-src 'none'; style-src 'none'; img-src 'none';
```

- APIエンドポイントは JSON のみを返すため、最も制限的なCSPを設定
- すべてのスクリプト実行を禁止
- スタイルシート、画像の読み込みを禁止

**フロントエンド** (`vercel.json`):

```
default-src 'self';
script-src 'self' 'wasm-unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self';
connect-src 'self' https://ai.google.dev https://self-care-guide.vercel.app;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

| ディレクティブ                             | 説明                                        |
| :----------------------------------------- | :------------------------------------------ |
| `default-src 'self'`                       | デフォルトで同一オリジンのみを許可          |
| `script-src 'self' 'wasm-unsafe-eval'`     | 自身のスクリプトと WebAssembly を許可       |
| `style-src 'self' 'unsafe-inline'`         | インラインスタイル許可（Tailwind CSS 対応） |
| `img-src 'self' data: https:`              | 同一オリジン、データURI、HTTPS画像を許可    |
| `connect-src 'self' https://ai.google.dev` | API呼び出しを許可                           |
| `frame-ancestors 'none'`                   | iframe埋め込みを禁止                        |
| `form-action 'self'`                       | フォーム送信を同一オリジンのみに制限        |

### 2. Strict-Transport-Security (HSTS)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

- **max-age=31536000**: 1年間 HTTPS を強制
- **includeSubDomains**: サブドメインにも適用
- **preload**: HSTS プリロードリストに登録推奨

### 3. X-Content-Type-Options

```
X-Content-Type-Options: nosniff
```

ブラウザが MIME タイプを推測しないよう強制（MIME タイプスニッフィング攻撃対策）

### 4. X-Frame-Options

```
X-Frame-Options: DENY
```

iframe での埋め込みを完全に禁止（クリックジャッキング対策）

### 5. X-XSS-Protection

```
X-XSS-Protection: 1; mode=block
```

ブラウザの XSS フィルタを有効化（従来のブラウザ互換性のため）

### 6. Referrer-Policy

```
Referrer-Policy: strict-origin-when-cross-origin
```

リファラ情報を厳密に制御：

- クロスオリジンリクエスト: オリジンのみ送信
- 同一オリジン: 完全な URL を送信

### 7. Permissions-Policy

```
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

以下のAPIを完全に無効化：

- カメラアクセス
- マイクアクセス
- 位置情報取得
- 決済API

---

## CORS設定

### 許可されたオリジン

```typescript
const ALLOWED_ORIGINS = [
  'https://self-care-guide.vercel.app',
  'https://self-care-guide-git-main-asofia888.vercel.app',
  'http://localhost:5173',
];
```

- **本番環境**: 自身のドメインのみ
- **プレビュー環境**: Vercel プレビュー URL
- **ローカル開発**: localhost:5173

### CORS ヘッダー

| ヘッダー                         | 値                             |
| :------------------------------- | :----------------------------- |
| Access-Control-Allow-Origin      | リクエスト元に応じて動的に設定 |
| Access-Control-Allow-Methods     | POST, OPTIONS                  |
| Access-Control-Allow-Headers     | Content-Type                   |
| Access-Control-Allow-Credentials | true                           |
| Access-Control-Max-Age           | 86400（24時間）                |

---

## レート制限

**エンドポイント**: `/api/compendium`

```typescript
const RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 5,
  WINDOW_MS: 60 * 1000,
};

// コンペンディウムは 2倍: 10 req/min
```

実装方式: メモリストア（シングルインスタンス）

**改善予定**: Redis/Vercel KV への移行

---

## API認証

現在の実装:

- Origin ベースの検証（CORS）
- 入力値の厳密なバリデーション
- APIキーの環境変数管理

**改善予定**:

- JWT ベースの認証
- API Key トークン方式

---

## 入力値検証

### /api/compendium エンドポイント

```typescript
// クエリ検証
if (!query || typeof query !== 'string' || query.trim().length === 0) {
  return res.status(400).json({ error: 'Query is required' });
}

if (query.length > 500) {
  return res.status(400).json({ error: 'Query must be less than 500 characters' });
}

// 言語検証
if (!language || !LANGUAGES.includes(language)) {
  return res.status(400).json({ error: 'Language must be "ja" or "en"' });
}
```

---

## キャッシング戦略

```
Cache-Control: no-store, max-age=0
```

- **no-store**: レスポンスをキャッシュしない
- **max-age=0**: 即座にキャッシュ無効化

理由: APIレスポンスはユーザー固有の内容で、キャッシュするとセキュリティリスク

---

## APIキー管理

```typescript
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!API_KEY || API_KEY === 'PLACEHOLDER_API_KEY' || API_KEY.trim() === '') {
  console.error('API key validation failed');
  return res.status(500).json({
    error: 'Service configuration error. API key not properly configured.',
  });
}
```

**ベストプラクティス**:

- 環境変数で管理（`.env` には保存しない）
- Vercel Secrets で安全に保存
- プレースホルダーの検出と拒否

---

## エラーハンドリング

```typescript
// 認証エラーのマスキング
if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
  return res.status(500).json({
    error: 'Service configuration error. Please contact support.',
  });
}

// 本番環境では詳細なエラーメッセージを隠す
const isDevelopment = process.env.NODE_ENV === 'development';
return res.status(500).json({
  error: 'Failed to process request. Please try again.',
  ...(isDevelopment && { details: errorMessage }),
});
```

---

## チェックリスト

セキュリティを確認する際は、以下の項目をチェック:

- [ ] CSP ヘッダーが正しく設定されているか
- [ ] HTTPS が強制されているか（HSTS）
- [ ] CORS オリジンが制限されているか
- [ ] APIキーが環境変数で管理されているか
- [ ] 入力値が検証されているか
- [ ] 詳細なエラーメッセージが本番環境で隠されているか
- [ ] レート制限が機能しているか
- [ ] キャッシング戦略が適切か

---

## セキュリティテスト

### Security Headers テスト

オンラインツール: https://securityheaders.com/

### CSP 検証

```bash
curl -I https://self-care-guide.vercel.app/
# Content-Security-Policy ヘッダーを確認
```

### CORS テスト

```bash
curl -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS \
  https://self-care-guide.vercel.app/api/compendium
```

---

## 参考資料

- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [Mozilla Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
