// src/pages/instructor/InstructorDashboard.jsx
import { useAuth } from '../../context/AuthContext';
import './InstructorDashboard.css';

export default function InstructorDashboard() {
  const { user, logout } = useAuth();

  // Example courses
  const myCourses = [
    { id: 1, name: 'React Course', students: 15 },
    { id: 2, name: 'JS Basics', students: 8 },
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Welcome, Instructor {user?.firstName || user?.email}!</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      {/* My Courses */}
      <section className="courses-section">
        <div className="section-header">
          <h3>My Courses</h3>
          <button className="quick-btn primary">Add New Course</button>
        </div>
        <div className="courses-list">
          {myCourses.map(course => (
            <div key={course.id} className="course-item">
              <div className="course-main">
                <h4>{course.name}</h4>
                <span className="status-badge active">Active</span>
              </div>
              <p className="course-meta">Students enrolled: {course.students}</p>
              <div className="course-actions">
                <button>Edit</button>
                <button>Manage Lessons</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Management */}
      <section className="management-section">
        <h2>Management</h2>
        <p>Add or remove lessons, upload videos, PDFs, and quizzes.</p>
      </section>

      {/* Statistics */}
      <section className="stats-section">
        <h2>Statistics</h2>
        <p>Student Progress: 70%</p>
        <p>Attendance: 85%</p>
      </section>

      {/* Profile */}
      <section className="profile-section">
        <h2>Profile</h2>
        <p>School: {user?.school || 'My School'}</p>
        <button className="action-btn">Course Settings</button>
      </section>
    </div>
  );
}
