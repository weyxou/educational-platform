// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

// Заглушка для всех курсов
const AllCoursesPage = () => (
  <div style={{ padding: '150px', textAlign: 'center', fontSize: '2.5rem' }}>
    Все курсы — скоро здесь
  </div>
);

// Защищённый роут
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, role } = useAuth();

  if (loading) return <div style={{ padding: '150px', textAlign: 'center' }}>Загрузка...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;

  return children;
}

// Только для незалогиненных
function PublicRoute({ children }) {
  const { user, role } = useAuth();
  if (user) {
    return <Navigate to={role === "STUDENT" ? "/student/dashboard" : "/instructor/dashboard"} replace />;
  }
  return children;
}

// Главный контент
function AppContent() {
  const isDashboard = window.location.pathname.includes('/dashboard');

  return (
    <>
      {/* Хедер/футер скрываем на дашбордах */}
      {!isDashboard && <Header />}

      <main>
        <Routes>
          {/* Публичные страницы */}
          <Route path="/benefits" element={<Benefits />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/all-courses" element={<AllCoursesPage />} />

          {/* Защищённые дашборды */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRole="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/dashboard"
            element={
              <ProtectedRoute requiredRole="INSTRUCTOR">
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={
            <div style={{ padding: '150px', textAlign: 'center', fontSize: '3rem', minHeight: '100vh' }}>
              404 — Страница не найдена
            </div>
          } />
        </Routes>
      </main>

      {!isDashboard && <Footer />}
    </>
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
