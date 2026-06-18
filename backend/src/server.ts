import express, { Application } from 'express';
import { securityHeaders, corsConfig, preventParameterPollution, mongoSanitizeConfig, globalRateLimit, sqlInjectionCheck, auditLog, requestId, performanceMonitor } from './middleware/security';
import { errorHandler } from './middleware/validate';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';
import biometricRoutes from './routes/biometric';
import messageRoutes from './routes/messages';
import statsRoutes from './routes/stats';
import achievementRoutes from './routes/achievements';
import config from './config';

const app: Application = express();

// 安全中间件（按顺序）
app.use(requestId);                    // 1. 请求ID
app.use(securityHeaders);              // 2. 安全头
app.use(corsConfig);                   // 3. CORS
app.use(globalRateLimit);              // 4. 限流
app.use(express.json({ limit: '10kb' }));  // 5. JSON解析
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // 6. URL编码
app.use(preventParameterPollution);    // 7. 参数污染防护
app.use(mongoSanitizeConfig);          // 8. MongoDB注入防护
app.use(sqlInjectionCheck);            // 9. SQL注入检测
app.use(performanceMonitor);           // 10. 性能监控
app.use(auditLog);                     // 11. 审计日志

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/biometric', biometricRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/achievements', achievementRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 错误处理
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🔒 Security headers enabled`);
  console.log(`📊 Performance monitoring enabled`);
  console.log(`📝 Audit logging enabled`);
});

export default app;
