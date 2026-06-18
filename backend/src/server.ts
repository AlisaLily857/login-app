import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';
import { apiLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/validate';

dotenv.config();

const app: Application = express();

// 中间件
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 限流
app.use('/api/', apiLimiter);

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 错误处理
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
});

export default app;
