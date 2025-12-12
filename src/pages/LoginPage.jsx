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

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }

    try {
      // Отправляем ТОЛЬКО email и password — без role!
      const res = await api.post('/auth/login', {
        email: email,
        password: password,
      });

      const data = res.data;

      const user = {
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        userAccountId: data.userId || data.userAccountId || data.id,
        role: data.userType || data.role, // бэкенд должен вернуть роль!
      };

      localStorage.setItem('jwtToken', data.token || data.accessToken || data.jwt);

      login(user);

      // Редирект по роли, которую вернул бэкенд
      if (user.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (user.role === 'INSTRUCTOR') {
        navigate('/instructor/dashboard');
      } else {
        console.warn('Unknown role:', user.role);
        navigate('/'); // или на общую страницу
      }
    } catch (err) {
      console.error('Login error:', err.response?.data);
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Login</h1>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}