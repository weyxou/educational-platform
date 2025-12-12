import { useAuth } from '../../context/AuthContext';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user, logout } = useAuth();

  // Заглушки для данных (замените на реальные из API)
  const courses = [
    { id: 1, name: 'React Basics', progress: 60, lastLesson: 'Hooks' },
    { id: 2, name: 'JavaScript Advanced', progress: 30, lastLesson: 'Promises' },
    { id: 3, name: 'HTML & CSS', progress: 90, lastLesson: 'Flexbox' },
  ];

  const achievements = [
    { id: 1, title: 'React Novice', description: 'Completed first React course', badge: '🎓' },
    { id: 2, title: 'JS Pro', description: 'Advanced JavaScript completed', badge: '🏆' },
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>
          Welcome back, <span className="user-name">{user?.firstName || user?.email}</span>!
        </h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      {/* Courses */}
      <section className="courses-section">
        <h2>My Courses</h2>
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course.id} className="course-card">
              <h3>{course.name}</h3>
              <p>Last lesson: {course.lastLesson}</p>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${course.progress}%` }}></div>
              </div>
              <p>{course.progress}% completed</p>
              <button className="continue-btn">Continue</button>
            </div>
          ))}
        </div>
      </section>

      {/* Profile */}
      <section className="profile-section">
        <h2>Profile</h2>
        <p><strong>Name:</strong> {user?.firstName || 'Student'}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <div className="profile-actions">
          <button className="action-btn">Change Password</button>
          <button className="action-btn">Language Settings</button>
        </div>
      </section>

      {/* Achievements */}
      <section className="achievements-section">
        <h2>Achievements</h2>
        <div className="achievements-grid">
          {achievements.map(a => (
            <div key={a.id} className="achievement-card">
              <div className="badge">{a.badge}</div>
              <h4>{a.title}</h4>
              <p>{a.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}