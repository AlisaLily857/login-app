# 构建说明

## GitHub Actions 自动构建

本项目使用 GitHub Actions 自动构建三端应用。

## 配置步骤

### 1. 创建 GitHub 仓库

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/AlisaLily857/login-app.git
git push -u origin main
```

### 2. 配置 Secrets

在 GitHub 仓库 Settings > Secrets and variables > Actions 中添加：

#### 必需 Secrets

| Secret | 获取方式 |
|--------|---------|
| `GH_TOKEN` | GitHub Settings > Developer settings > Personal access tokens |

#### Android 签名（可选，用于发布）

| Secret | 说明 |
|--------|------|
| `SIGNING_KEY` | Base64 编码的 keystore 文件 |
| `ALIAS` | 密钥别名 |
| `KEY_STORE_PASSWORD` | 密钥库密码 |
| `KEY_PASSWORD` | 密钥密码 |

生成签名密钥：
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
base64 my-release-key.keystore > signing-key.txt
```

### 3. 触发构建

#### 自动触发
- 推送到 `main` 分支
- 推送标签 `v*` (如 `v1.0.0`)

#### 手动触发
在 GitHub Actions 页面点击 "Run workflow"

## 构建产物

构建完成后，产物会自动上传到：

1. **GitHub Artifacts** - 每次构建
2. **GitHub Releases** - 推送标签时

## 本地构建

### Web
```bash
cd web
npm install
npm run build
```

### Android
```bash
cd mobile
npm install
cd android
./gradlew assembleRelease
```

### Windows
```bash
cd desktop
npm install
npm run build:win
```
