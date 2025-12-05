// src/pages/student/StudentDashboard.jsx
import { useAuth } from '../../context/AuthContext';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      {/* Заголовок + кнопка выхода */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Welcome back, <span className="user-name">{user?.email || 'Student'}</span>!
        </h1>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>

      {/* Карточки статистики */}
      <div className="stats-grid">
        {/* Мои курсы */}
        <div className="stat-card">
          <div className="stat-icon courses-icon">Book</div>
          <div className="stat-content">
            <h3>My Courses</h3>
            <p className="stat-number">8</p>
            <a href="/courses" className="stat-link">View all →</a>
          </div>
        </div>

        {/* Дедлайны */}
        <div className="stat-card">
          <div className="stat-icon deadline-icon">Clock</div>
          <div className="stat-content">
            <h3>Upcoming Deadlines</h3>
            <p className="deadline-text">React Project – 2 days left</p>
          </div>
        </div>

        {/* Уведомления */}
        <div className="stat-card">
          <div className="stat-icon notif-icon">Bell</div>
          <div className="stat-content">
            <h3>New Notifications</h3>
            <p className="stat-number green">3</p>
          </div>
        </div>
      </div>
    </div>
  );
}