import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Skeleton from './components/Skeleton';

// 懒加载页面组件
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// 路由配置
export const routes = [
  { path: '/', element: <LoginPage />, title: '登录' },
  { path: '/login', element: <LoginPage />, title: '登录' },
  { path: '/register', element: <RegisterPage />, title: '注册' },
  { path: '/profile', element: <ProfilePage />, title: '个人资料', auth: true },
  { path: '/dashboard', element: <DashboardPage />, title: '仪表盘', auth: true },
  { path: '/admin', element: <AdminPage />, title: '管理后台', auth: true, admin: true },
  { path: '*', element: <NotFoundPage />, title: '404' },
];

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<Skeleton type="page" />}>
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRouter;