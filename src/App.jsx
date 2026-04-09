import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import Benefits from './components/benefits/Benefits';
import Courses from './components/courses/Courses';
import AboutUs from './components/aboutus/AboutUs';
import Contact from './components/contact/Contact';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/student/StudentDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import ManageLessons from './pages/instructor/ManageLessons';
import CourseLessonsView from './common/CourseLessonsView';
import LessonDetail from './common/LessonDetail';
import CourseDetailPage from './components/courses/CourseDetailPage';
import AssignmentSubmissions from './pages/instructor/AssignmentSubmissions';
import CourseAssignments from './pages/student/CourseAssignments';
import NotificationProvider from './context/AlertCustom';

const AllCoursesPage = () => (
  <div style={{ padding: '150px', textAlign: 'center', fontSize: '2.5rem' }}>
    All Courses
  </div>
);

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, role } = useAuth();
  if (loading) return <div style={{ padding: '150px', textAlign: 'center' }}>Loading</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, role } = useAuth();
  if (user) {
    const redirectTo = role === 'STUDENT' ? '/student/dashboard' : '/instructor/dashboard';
    return <Navigate to={redirectTo} replace />;
  }
  return children;
}

function MainLayout({ children }) {
  const location = useLocation();
  const path = location.pathname;
  
  const hideHeaderFooter = path.includes('/dashboard') ||
                           (path.includes('/courses/') && (
                             path.includes('/view') ||
                             path.includes('/lessons') ||
                             path.includes('/lesson')
                           ));
  
  return (
    <>
      {!hideHeaderFooter && <Header />}
      <main>{children}</main>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

function AppContent() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Benefits />} />
        <Route path="/home" element={<Benefits />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/all-courses" element={<AllCoursesPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />



        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        <Route path="/student/dashboard" element={<ProtectedRoute requiredRole="STUDENT"><StudentDashboard /></ProtectedRoute>} />

        <Route path="/instructor/dashboard" element={<ProtectedRoute requiredRole="INSTRUCTOR"><InstructorDashboard /></ProtectedRoute>} />
        <Route path="/courses/:courseId/lessons" element={<ProtectedRoute requiredRole="INSTRUCTOR"><ManageLessons /></ProtectedRoute>} />

        <Route path="/courses/:courseId/view" element={<ProtectedRoute><CourseLessonsView /></ProtectedRoute>} />
        <Route path="/courses/:courseId/lesson/:lessonId" element={<ProtectedRoute><LessonDetail /></ProtectedRoute>} />

        <Route path="/courses/:courseId/detail" element={<CourseDetailPage />} />

        <Route path="/courses/:courseId/assignments" element={<ProtectedRoute><CourseAssignments /></ProtectedRoute>} />
        <Route path="/courses/:courseId/assignments/:assignmentId/submissions" element={<AssignmentSubmissions />} />

        <Route path="*" element={
          <div style={{ padding: '150px', textAlign: 'center', fontSize: '3rem', minHeight: '80vh' }}>
            404 — Page not Found
          </div>
        } />
      </Routes>
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}