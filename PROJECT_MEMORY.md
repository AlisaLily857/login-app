# 项目记忆 - Login App

## 项目概述
- **名称**: Login App - 三端登录应用
- **创建时间**: 2026-06-18
- **GitHub**: https://github.com/AlisaLily857/login-app
- **开发者**: 艾米亚 (Amya)

## 技术架构

### 前端
- **Web**: React 18 + TypeScript + Vite
- **Mobile**: React Native (Android)
- **Desktop**: Electron (Windows)
- **共享代码**: `shared/` 目录

### 后端
- **框架**: Express.js + TypeScript
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT + bcrypt + WebAuthn
- **安全**: Helmet + Rate Limit + CORS

## 已实现功能

### 核心功能
- ✅ 邮箱/密码登录
- ✅ 注册 + 邮箱验证
- ✅ JWT + Refresh Token
- ✅ 密码强度检测
- ✅ 表单验证
- ✅ 记住我功能
- ✅ 忘记密码

### 第三方登录
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ 微信登录
- ✅ 手机号登录

### 安全功能
- ✅ 生物识别 (WebAuthn/FIDO2)
- ✅ 双因素认证 (MFA)
- ✅ 账号锁定保护
- ✅ 登录限流
- ✅ 设备管理
- ✅ 登录历史
- ✅ 审计日志
- ✅ 安全评分

### 用户中心
- ✅ 个人资料
- ✅ 密码修改
- ✅ 账号绑定
- ✅ 账号注销
- ✅ 主题切换 (暗色/浅色)
- ✅ 多语言 (中英)

### 消息系统
- ✅ 站内消息
- ✅ 通知设置
- ✅ 消息已读/未读

### 数据可视化
- ✅ 登录统计图表
- ✅ 设备分布
- ✅ 时段分布
- ✅ 地理位置

### 成就系统
- ✅ 10个成就
- ✅ 积分系统
- ✅ 排行榜

### 管理后台
- ✅ 用户管理
- ✅ 角色管理
- ✅ 数据统计
- ✅ 审计日志

## 项目结构

```
login-app/
├── shared/                    # 共享代码
│   ├── types/                 # TypeScript 类型
│   ├── hooks/                 # 共享 Hooks
│   └── utils/                 # 工具函数
├── web/                       # Web 端
│   ├── src/
│   │   ├── components/        # 组件
│   │   ├── hooks/             # Hooks
│   │   ├── utils/             # API 封装
│   │   └── App.tsx            # 主应用
│   └── package.json
├── mobile/                    # Android 端
│   └── src/
├── desktop/                   # Windows 端
│   └── src/
├── backend/                   # 后端
│   ├── src/
│   │   ├── controllers/       # 控制器
│   │   ├── middleware/        # 中间件
│   │   ├── routes/            # 路由
│   │   └── utils/             # 工具
│   ├── prisma/
│   │   └── schema.prisma      # 数据库设计
│   └── package.json
└── .github/workflows/          # CI/CD
    └── build.yml              # 自动构建
```

## 数据库表

| 表名 | 说明 |
|------|------|
| users | 用户表 |
| oauth_accounts | 第三方账号 |
| sessions | 会话管理 |
| refresh_tokens | 刷新令牌 |
| login_histories | 登录历史 |
| devices | 设备管理 |
| verification_codes | 验证码 |
| messages | 消息表 |
| notifications | 通知设置 |
| achievements | 成就表 |
| user_achievements | 用户成就 |
| audit_logs | 审计日志 |
| system_settings | 系统设置 |

## API 端点

### 认证
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh-token
- POST /api/auth/send-verification-code
- POST /api/auth/verify-email
- GET /api/auth/me

### 用户
- PUT /api/user/profile
- PUT /api/user/password
- GET /api/user/login-history
- GET /api/user/devices
- DELETE /api/user/devices/:id
- DELETE /api/user/account

### 生物识别
- POST /api/biometric/register/options
- POST /api/biometric/register/verify
- POST /api/biometric/auth/options
- POST /api/biometric/auth/verify

### 消息
- GET /api/messages/messages
- PUT /api/messages/messages/:id/read
- PUT /api/messages/messages/read-all
- DELETE /api/messages/messages/:id

### 统计
- GET /api/stats/user
- GET /api/stats/system

### 成就
- GET /api/achievements
- GET /api/achievements/leaderboard

### 管理
- GET /api/admin/users
- GET /api/admin/stats
- GET /api/admin/audit-logs

## 环境变量

```env
# 数据库
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
WECHAT_APP_ID=...
WECHAT_APP_SECRET=...

# 邮件
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...

# WebAuthn
WEBAUTHN_RP_ID=localhost
```

## 部署配置

### Docker
```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

### GitHub Actions
- Web 构建
- Android APK 构建
- Windows EXE 构建
- 自动发布 Release

## 开发命令

```bash
# 启动后端
cd backend && npm run dev

# 启动前端
cd web && npm run dev

# 数据库迁移
cd backend && npx prisma migrate dev

# 生成 Prisma Client
cd backend && npx prisma generate
```

## 安全特性

- ✅ Helmet 安全头
- ✅ CORS 配置
- ✅ 限流保护
- ✅ SQL 注入检测
- ✅ MongoDB 注入防护
- ✅ 参数污染防护
- ✅ 输入验证
- ✅ 审计日志
- ✅ 请求追踪
- ✅ 性能监控

## 优化特性

- ✅ 懒加载
- ✅ 代码分割
- ✅ 骨架屏
- ✅ 错误边界
- ✅ 虚拟列表
- ✅ 防抖/节流
- ✅ 缓存策略
- ✅ PWA 支持

## 待办事项

- [ ] 前端对接新 API（生物识别、消息、成就）
- [ ] 部署到生产服务器
- [ ] 添加更多第三方集成（Slack/Discord）
- [ ] 添加更多语言支持
- [ ] 添加更多主题
- [ ] 添加更多成就
- [ ] 添加更多统计图表
- [ ] 添加更多游戏化功能

## 备注

- 项目使用 GitHub Actions 自动构建三端应用
- 代码推送到 main 分支或标签 v* 触发构建
- 构建产物自动上传到 GitHub Releases
- 支持 Android 签名配置

---

**更新日期**: 2026-06-18
**版本**: v1.0.0
