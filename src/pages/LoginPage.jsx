// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './auth.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: formData.email.trim(),
        password: formData.password,
      });

      const data = res.data;

      const user = {
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        userAccountId: data.userId || data.userAccountId,
        role: data.userType,  // "INSTRUCTOR" или "STUDENT"
      };

      // ← КРИТИЧЕСКИ: сохраняем под ТОТ ЖЕ ключ, что и interceptor
      localStorage.setItem('jwtToken', data.token);

      login(user);

      navigate(user.role === 'STUDENT' ? '/student/dashboard' : '/instructor/dashboard');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ... остальной JSX без изменений
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Login</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p>No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}