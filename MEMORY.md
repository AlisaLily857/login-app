# 项目记忆 / Project Memory

> 更新时间：2026-06-18 23:18 CST
> 仓库：`https://github.com/AlisaLily857/login-app`
> 本地路径：`/mnt/data/055`

---

## 1. 近期完成的工作

### 1.1 CI 修复（commit `5789266`）
- **问题**：Android CI 因 workspace 提升依赖后 `mobile/android/settings.gradle` 找不到 `mobile/node_modules` 下文件而失败；Windows CI 因 `electron-builder` 不在 PATH 中而失败。
- **修复**：
  - `mobile/android/settings.gradle` 中所有 `../node_modules` 改为 `../../node_modules`，指向仓库根目录的 `node_modules`。
  - `desktop/package.json` 的 `build*` / `pack` 脚本改用 `npx electron-builder`，让 npm 在 workspace 中解析本地二进制。

### 1.2 升级到 React 19.2.7 + React Native 0.86.0（commit `b8cdf8d`）
- 用户要求使用最新版 React 与 React Native，因此执行了大版本升级：
  - `react` / `react-dom`：`^18.2.0` → `^19.2.7`（web/root/shared），`19.2.7`（mobile 精确版本）。
  - `react-native`：`0.72.0` → `0.86.0`。
  - 类型定义同步升级到 `@types/react@^19.2.17`、`@types/react-dom@^19.2.3`。
- 重新生成了 `mobile/android` 项目：
  - 基于 RN 0.86 模板创建新的 Kotlin `MainActivity.kt` / `MainApplication.kt`。
  - 包名保持 `com.loginapp`。
  - 为 monorepo/workspace 调整 `settings.gradle` 与 `app/build.gradle` 中的 `node_modules` 路径（`../../node_modules` 与 `../../../node_modules`）。
  - 更新了 `gradle-wrapper.properties`（Gradle 9.3.1）、`gradle.properties`（SDK 36、NDK 27、Kotlin 2.1.20）。
- 更新了移动端配置：
  - `babel.config.js`、`metro.config.js`、`tsconfig.json`（extends `@react-native/typescript-config`）、`jest.config.js`（preset `@react-native/jest-preset`）。
  - `mobile/package.json` 中的 devDependencies 与 scripts 对齐 RN 0.86 模板，并添加 `@react-native/jest-preset`。
  - 更新 `@react-native-google-signin/google-signin`、`@react-native-async-storage/async-storage` 到最新版。
- 更新了 `web/package.json`：
  - `vite@^8.0.16`、`@vitejs/plugin-react@^6.0.2`、`typescript@^5.8.3`。
- 更新了 `shared/package.json`：
  - `react@^19.2.7`、`react-native@^0.86.0`、类型同步。
- 更新了 `package.json`（root）：
  - 添加 `engines.node: ">= 22.11.0"`。
  - 添加 root `dependencies`：`react@^19.2.7`、`react-dom@^19.2.7`，确保 workspace 提升一致。
  - 移除已废弃的 `@types/react-native`。
- 修复了 `web/src/hooks/usePerformance.ts` 中 `useRef<ReturnType<typeof setTimeout>>()` 在 React 19 严格类型下缺少初始值的问题。

### 1.3 GitHub Actions 工作流更新
- `.github/workflows/build.yml`：
  - 所有 job 的 Node.js 版本从 `18` 升级到 `22`。
  - Android job 的 Java 从 `17` 升级到 `21`（RN 0.86 / AGP 要求）。
  - Android job 增加显式安装 `platforms;android-36`、`build-tools;36.0.0`、`ndk;27.1.12297006` 并自动接受 licenses。
  - Windows job 简化依赖安装流程：只执行一次 root `npm ci`，避免子目录 `npm ci` 与 workspace 模式冲突。

---

## 2. 本地验证结果

- `npm install` 成功（root lockfile 已重新生成）。
- `npm run typecheck`（backend + web）通过。
- `cd web && npm run build` 成功。
- `cd mobile && npx tsc --noEmit` 成功。
- `cd mobile && npx react-native config` 成功解析到 `com.loginapp` 与根目录依赖。
- `cd desktop && npx electron-builder --version` 可正常解析到 `24.13.3`。

---

## 3. 正在监控的 CI

- Run ID：`27769740397`
- Commit：`b8cdf8d`（`feat: upgrade to React 19.2.7 and React Native 0.86.0`）
- 状态：已入队，等待运行结果。
- 关注点：
  - Android 能否在 SDK 36 / NDK 27 / Java 21 环境下编译通过。
  - Windows 能否正确找到 `electron-builder` 并打包。
  - Web 构建是否继续成功。

---

## 4. 仍需关注 / 未处理事项

- **CVE 依赖漏洞**：`nodemailer`、`uuid`、`esbuild`、`fast-xml-parser`、`ip` 等仍有已知漏洞。本次未处理，可在后续迭代中处理。
- **功能缺口**：OAuth/MFA/WebAuthn 真实验证、登录时创建设备、密码重置接口、Admin UI 等仍未实现。
- **测试**：项目配置了 Jest 但没有实际测试文件。
- **iOS 端**：目前只有 Android 工程，未生成 iOS 工程（如后续需要可再补充）。
- **Electron 版本**：仍使用 `electron@^25.0.0` / `electron-builder@^24.0.0`，如后续需要可升级到最新版。
- **后端 Node 版本**：`backend/package.json` 未显式设置 engines；CI 中未单独安装后端依赖（root 安装不安装 backend，因为 backend 不是 workspace）。当前 `npm run typecheck` 在本地执行前需手动 `cd backend && npm install`。

---

## 5. 关键文件清单

| 文件 | 说明 |
|------|------|
| `package.json` | root workspace，新增 React 19 依赖与 node engine |
| `package-lock.json` | 重新生成 |
| `shared/package.json` | React 19 / RN 0.86 |
| `web/package.json` | React 19 / Vite 8 / plugin-react 6 |
| `web/src/hooks/usePerformance.ts` | React 19 useRef 类型修复 |
| `mobile/package.json` | RN 0.86 完整依赖 |
| `mobile/android/**` | RN 0.86 新模板 + monorepo 路径调整 |
| `mobile/babel.config.js` | RN 0.86 babel preset |
| `mobile/metro.config.js` | RN 0.86 metro config |
| `mobile/tsconfig.json` | RN 0.86 TS config |
| `mobile/jest.config.js` | RN 0.86 jest preset |
| `desktop/package.json` | 使用 `npx electron-builder` |
| `.github/workflows/build.yml` | Node 22 / Java 21 / SDK 36 安装 |

