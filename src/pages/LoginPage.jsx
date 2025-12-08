import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const API_BASE = 'http://localhost:8090';

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
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      });

      // Получаем ответ (JSON или текст)
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        setError(typeof data === "string" ? data : data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Формируем объект user на фронте
      const user = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        userId: data.userId,
        role: data.userType // бэкенд возвращает userType
      };

      login(user, data.token);

      navigate(user.role === 'STUDENT' ? '/student/dashboard' : '/instructor/dashboard');

    } catch (err) {
      console.error(err);
      setError('Server not responding (port 8090?)');
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
        <p>No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
