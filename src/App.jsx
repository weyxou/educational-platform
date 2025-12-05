// src/App.jsx — финальная версия с реальным InstructorDashboard
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Компоненты
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import Benefits from './components/benefits/Benefirs';
import Courses from './components/courses/Courses';
import AboutUs from './components/aboutus/AboutUs';
import Contact from './components/contact/Contact';

// Страницы
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/student/StudentDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard'; // ← НОВОЕ

// Заглушки
const AllCoursesPage = () => (
  <div style={{ padding: '150px', textAlign: 'center', fontSize: '2.5rem' }}>
    Все курсы — скоро здесь
  </div>
);

// Защищённый роут
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '150px', textAlign: 'center' }}>Загрузка...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

// Только для незалогиненных
function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

// Главный контент
function AppContent() {
  const { user } = useAuth();

  return (
    <>
      {/* Хедер показываем везде, кроме дашбордов — там будет свой */}
      {!user || !window.location.pathname.startsWith('/dashboard') ? <Header /> : null}

      <main>
        <Routes>
          {/* Публичные */}
          <Route path="/courses" element={<Courses/>} />
          <Route path="/about" element={<AboutUs />} />   
          <Route path='/contact' element={<Contact />}  />
          <Route path="/" element={<><Benefits/></>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />


          {/* Защищённые — один роут /dashboard автоматически выбирает нужный дашборд */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {user?.role === 'instructor'
                  ? <InstructorDashboard />
                  : <StudentDashboard />
                }
              </ProtectedRoute>
            }
          />

          <Route path="/courses" element={<AllCoursesPage />} />

          {/* 404 */}
          <Route path="*" element={
            <div style={{ padding: '150px', textAlign: 'center', fontSize: '3rem', minHeight: '100vh' }}>
              404 — Страница не найдена
            </div>
          } />
        </Routes>
      </main>

      {/* Футер тоже прячем на дашбордах */}
      {!user || !window.location.pathname.startsWith('/dashboard') ? <Footer /> : null}
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