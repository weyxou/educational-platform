import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminStats from './AdminStats';
import AdminUsers from './AdminUsers';
import AdminCourses from './AdminCourses';
import './AdminPanel.css';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');

  const tabs = [
    { id: 'stats', name: 'Statistics'},
    { id: 'users', name: 'Users'},
    { id: 'courses', name: 'Courses'},
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <AdminStats />;
      case 'users':
        return <AdminUsers />;
      case 'courses':
        return <AdminCourses />;
      default:
        return <AdminStats />;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-header-left">
            <h1 className="admin-title"> Admin Panel</h1>
            <p className="admin-subtitle">Manage your learning platform</p>
          </div>
          <div className="admin-header-right">
            <div className="admin-user-info">
              <span className="admin-user-name">
                {user?.firstName || user?.email}
              </span>
              <span className="admin-user-role">Administrator</span>
            </div>
            <button onClick={handleLogout} className="admin-logout-btn">
              Logout
            </button>
          </div>
        </div>

        <div className="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-name">{tab.name}</span>
            </button>
          ))}
        </div>

        <div className="admin-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}