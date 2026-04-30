import { useState, useEffect } from 'react';
import api from '../../api/api';
import { useNotification } from '../../context/AlertCustom';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { showToast, confirm } = useNotification();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error loading users:', err);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId, userName) => {
    if (currentUser?.userAccountId === userId) {
      showToast('You cannot delete yourself', 'error');
      return;
    }
    confirm(
      `Are you sure you want to delete user "${userName}"?`,
      async () => {
        try {
          await api.delete(`/admin/users/${userId}`);
          showToast('User deleted successfully', 'success');
          loadUsers();
        } catch (err) {
          console.error('Error deleting user:', err);
          showToast('Failed to delete user', 'error');
        }
      },
      'Delete User'
    );
  };

  const getRoleBadgeClass = (role) => {
    const roleLower = (role || '').toLowerCase();
    if (roleLower === 'admin') return 'role-badge admin';
    if (roleLower === 'instructor') return 'role-badge instructor';
    return 'role-badge student';
  };

  const getRoleName = (role) => {
    const roleLower = (role || '').toLowerCase();
    if (roleLower === 'admin') return 'Admin';
    if (roleLower === 'instructor') return 'Instructor';
    return 'Student';
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || 
      (user.userType || '').toLowerCase() === filter;
    const matchesSearch = search === '' || 
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="users-header">
        <h2>User Management</h2>
        <button onClick={loadUsers} className="refresh-btn">Refresh</button>
      </div>
      <div className="users-filters">
        <div className="filter-buttons">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({users.length})
          </button>
          <button className={`filter-btn ${filter === 'student' ? 'active' : ''}`} onClick={() => setFilter('student')}>
            Students ({users.filter(u => (u.userType || '').toLowerCase() === 'student').length})
          </button>
          <button className={`filter-btn ${filter === 'instructor' ? 'active' : ''}`} onClick={() => setFilter('instructor')}>
            Instructors ({users.filter(u => (u.userType || '').toLowerCase() === 'instructor').length})
          </button>
          <button className={`filter-btn ${filter === 'admin' ? 'active' : ''}`} onClick={() => setFilter('admin')}>
            Admins ({users.filter(u => (u.userType || '').toLowerCase() === 'admin').length})
          </button>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      <div className="users-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Registered</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td><span className={getRoleBadgeClass(user.userType)}>{getRoleName(user.userType)}</span></td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td><button onClick={() => handleDeleteUser(user.id, user.email)} className="delete-user-btn">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}