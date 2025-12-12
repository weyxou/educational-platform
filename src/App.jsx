// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Компоненты
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import Benefits from './components/benefits/Benefits';
import Courses from './components/courses/Courses';
import AboutUs from './components/aboutus/AboutUs';
import Contact from './components/contact/Contact';

// Страницы
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/student/StudentDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';

// Новые страницы инструктора
import ManageLessons from './pages/instructor/ManageLessons';

// Заглушка для всех курсов (можно заменить на реальную страницу позже)
const AllCoursesPage = () => (
  <div style={{ padding: '150px', textAlign: 'center', fontSize: '2.5rem' }}>
    Все курсы — скоро здесь
  </div>
);

// Защищённый роут
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, role } = useAuth();

  if (loading) {
    return <div style={{ padding: '150px', textAlign: 'center' }}>Загрузка...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Только для незалогиненных пользователей
function PublicOnlyRoute({ children }) {
  const { user, role } = useAuth();

  if (user) {
    const redirectTo = role === 'STUDENT' ? '/student/dashboard' : '/instructor/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

// Обёртка для контента с условным хедером/футером
function MainLayout({ children }) {
  const location = useLocation();
  const isDashboardRoute = location.pathname.includes('/dashboard') ||
                           location.pathname.includes('/courses/') && location.pathname.includes('/lessons');

  return (
    <>
      {!isDashboardRoute && <Header />}
      <main>{children}</main>
      {!isDashboardRoute && <Footer />}
    </>
  );
}

// Основные роуты
function AppContent() {
  return (
    <MainLayout>
      <Routes>
        {/* Главная страница и публичные роуты */}
        <Route path="/" element={<Benefits />} />
        <Route path="/home" element={<Benefits />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/all-courses" element={<AllCoursesPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />

        {/* Авторизация */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* Дашборд студента */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute requiredRole="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Дашборд инструктора + связанные страницы */}
        <Route
          path="/instructor/dashboard"
          element={
            <ProtectedRoute requiredRole="INSTRUCTOR">
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
  
        <Route
          path="/courses/:id/lessons"
          element={
            <ProtectedRoute requiredRole="INSTRUCTOR">
              <ManageLessons />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div style={{
              padding: '150px',
              textAlign: 'center',
              fontSize: '3rem',
              minHeight: '80vh'
            }}>
              404 — Страница не найдена
            </div>
          }
        />
      </Routes>
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}