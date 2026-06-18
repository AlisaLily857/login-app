# Login App - 三端登录应用

## 📱 支持平台

| 平台 | 技术栈 | 状态 |
|------|--------|------|
| 🌐 Web 网页端 | React + Vite | ✅ 就绪 |
| 🤖 Android App | React Native | ✅ 就绪 |
| 🖥️ Windows 桌面端 | Electron | ✅ 就绪 |

## 🏗️ 项目结构

```
login-app/
├── shared/                    # 共享代码
│   ├── components/            # 共享组件
│   ├── hooks/                 # 共享 Hooks
│   ├── utils/                 # 工具函数
│   └── types/                 # TypeScript 类型
│
├── web/                       # Web 网页端
│   ├── src/
│   ├── public/
│   └── package.json
│
├── mobile/                    # Android App
│   ├── android/               # Android 原生代码
│   ├── src/
│   └── package.json
│
├── desktop/                   # Windows 桌面端
│   ├── electron-main/         # Electron 主进程
│   ├── src/
│   └── package.json
│
└── .github/workflows/         # GitHub Actions 自动构建
    └── build.yml
```

## 🚀 快速开始

### 安装依赖

```bash
# 根目录安装
npm install

# 安装各端依赖
cd web && npm install
cd ../mobile && npm install
cd ../desktop && npm install
```

### 开发模式

```bash
# Web 端
npm run web

# Android 端
npm run mobile

# Windows 桌面端
npm run desktop
```

## 📦 自动构建

项目配置了 GitHub Actions，推送代码后自动构建：

### 触发条件

- 推送到 `main` 或 `master` 分支
- 推送标签 `v*` (如 `v1.0.0`)

### 构建产物

| 平台 | 产物 |
|------|------|
| Web | `web-build/` 文件夹 |
| Android | `.apk` 安装包 |
| Windows | `.exe` 安装程序 |

### 配置 GitHub Secrets

在仓库 Settings > Secrets and variables > Actions 中添加：

| Secret | 说明 |
|--------|------|
| `GH_TOKEN` | GitHub Personal Access Token |
| `SIGNING_KEY` | Android 签名密钥 (Base64) |
| `ALIAS` | 密钥别名 |
| `KEY_STORE_PASSWORD` | 密钥库密码 |
| `KEY_PASSWORD` | 密钥密码 |

## ✨ 功能特性

- ✅ 邮箱/密码登录
- ✅ Google OAuth 登录
- ✅ 密码强度实时检测
- ✅ 表单验证
- ✅ 记住我功能
- ✅ 忘记密码
- ✅ 响应式设计
- ✅ TypeScript 类型安全

## 🛠️ 技术栈

- **前端**: React 18 + TypeScript
- **构建工具**: Vite (Web) / React Native CLI (Mobile) / Electron (Desktop)
- **样式**: CSS3 + Flexbox
- **CI/CD**: GitHub Actions

## 📝 开发指南

### 添加新功能

1. 在 `shared/` 中添加共享逻辑
2. 在各端 `src/` 中实现平台特定代码
3. 更新 GitHub Actions 配置（如需要）

### 发布新版本

```bash
# 1. 更新版本号
npm version patch|minor|major

# 2. 推送标签触发构建
git push origin main --tags
```

## 📄 许可证

MIT
