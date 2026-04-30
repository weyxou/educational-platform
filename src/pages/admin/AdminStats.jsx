import { useState, useEffect } from 'react';
import api from '../../api/api';
import { useNotification } from '../../context/AlertCustom';

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalAssignments: 0,
    totalQuizzes: 0,
  });
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/statistics');
      setStats(res.data);
    } catch (err) {
      console.error('Error loading stats:', err);
      showToast('Failed to load statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { key: 'totalUsers', label: 'Users', icon: '👥', color: '#667eea' },
    { key: 'totalCourses', label: 'Courses', icon: '📚', color: '#3b82f6' },
    { key: 'totalLessons', label: 'Lessons', icon: '📖', color: '#10b981' },
    { key: 'totalAssignments', label: 'Assignments', icon: '📝', color: '#f59e0b' },
    { key: 'totalQuizzes', label: 'Quizzes', icon: '🧪', color: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className="admin-stats-page">
      <div className="stats-header">
        <h2>System Statistics</h2>
        <button onClick={loadStats} className="refresh-btn">Refresh</button>
      </div>
      <div className="stats-grid">
        {statCards.map(card => (
          <div key={card.key} className="stat-card">
            <div className="stat-card-icon" style={{ background: card.color }}>
              {card.icon}
            </div>
            <div className="stat-card-info">
              <p className="stat-card-label">{card.label}</p>
              <p className="stat-card-value">{stats[card.key] || 0}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}