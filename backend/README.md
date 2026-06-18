# Login App 后端 API

## 🚀 快速开始

### 安装依赖

```bash
cd backend
npm install
```

### 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库和其他服务
```

### 数据库设置

```bash
# 创建数据库
npx prisma migrate dev --name init

# 生成 Prisma Client
npx prisma generate

# 启动数据库可视化工具
npx prisma studio
```

### 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

## 📚 API 文档

### 认证接口

#### 注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "phone": "13800138000" // 可选
}
```

#### 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 刷新令牌
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### 发送验证码
```http
POST /api/auth/send-verification-code
Content-Type: application/json

{
  "email": "user@example.com",
  "type": "EMAIL_VERIFICATION" // 或 PASSWORD_RESET
}
```

#### 验证邮箱
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

### 用户接口

#### 获取当前用户
```http
GET /api/auth/me
Authorization: Bearer {accessToken}
```

#### 更新个人资料
```http
PUT /api/user/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "新名字",
  "bio": "个人简介",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### 修改密码
```http
PUT /api/user/password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "currentPassword": "旧密码",
  "newPassword": "新密码"
}
```

#### 获取登录历史
```http
GET /api/user/login-history?page=1&limit=20
Authorization: Bearer {accessToken}
```

#### 获取设备列表
```http
GET /api/user/devices
Authorization: Bearer {accessToken}
```

#### 移除设备
```http
DELETE /api/user/devices/{deviceId}
Authorization: Bearer {accessToken}
```

### 管理后台接口

#### 获取用户列表
```http
GET /api/admin/users?page=1&limit=20&search=keyword&role=USER&status=ACTIVE
Authorization: Bearer {accessToken}
```

#### 获取统计数据
```http
GET /api/admin/stats
Authorization: Bearer {accessToken}
```

#### 获取审计日志
```http
GET /api/admin/audit-logs?page=1&limit=50&action=LOGIN
Authorization: Bearer {accessToken}
```

## 🗄️ 数据库结构

### 核心表

| 表名 | 说明 |
|------|------|
| `users` | 用户表 |
| `oauth_accounts` | 第三方账号绑定 |
| `sessions` | 会话管理 |
| `refresh_tokens` | 刷新令牌 |
| `login_histories` | 登录历史 |
| `devices` | 设备管理 |
| `verification_codes` | 验证码 |
| `audit_logs` | 审计日志 |
| `system_settings` | 系统设置 |

## 🔒 安全特性

- ✅ 密码加密（bcrypt）
- ✅ JWT 认证
- ✅ 刷新令牌轮换
- ✅ 登录限流
- ✅ 账号锁定
- ✅ 设备管理
- ✅ 登录历史
- ✅ 审计日志
- ✅ 输入验证
- ✅ CORS 保护
- ✅ Helmet 安全头

## 🛠️ 技术栈

- **框架**: Express.js
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT + bcrypt
- **验证**: express-validator + Zod
- **邮件**: Nodemailer
- **日志**: Winston + Morgan
- **安全**: Helmet + express-rate-limit
