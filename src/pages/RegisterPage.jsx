// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';  // ← используем твой axios-инстанс
import './auth.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT' // по умолчанию студент
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role
    };

    if (!trimmedData.firstName || !trimmedData.lastName || !trimmedData.email || !trimmedData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (trimmedData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Основной запрос на регистрацию
      const signupPayload = {
        email: trimmedData.email,
        password: trimmedData.password,
        role: trimmedData.role  // "STUDENT" или "INSTRUCTOR"
      };

      const signupRes = await api.post('/auth/signup', signupPayload);

      const data = signupRes.data;

      // Формируем объект пользователя
      const user = {
        email: data.email || trimmedData.email,
        firstName: trimmedData.firstName,
        lastName: trimmedData.lastName,
        userAccountId: data.userId || data.userAccountId || data.id,
        role: data.userType || data.role || trimmedData.role
      };

      // Сохраняем токен и логинимся
      if (data.token) {
        localStorage.setItem('jwtToken', data.token);
      }

      login(user);

      // Если бэкенд поддерживает firstName/lastName в AuthRequest — всё уже готово
      // Если нет — обновляем профиль отдельно
      if (data.userId || data.userAccountId) {
        try {
          await api.put(`/instructor/update_profile/${user.userAccountId || data.userId}`, {
            firstName: trimmedData.firstName,
            lastName: trimmedData.lastName
          });
          // Если студент — возможно другой эндпоинт, но пока предполагаем общий или instructor
        } catch (profileErr) {
          console.warn('Could not update profile names:', profileErr);
          // Не критично — можно продолжить
        }
      }

      // Редирект
      navigate(user.role === 'STUDENT' ? '/student/dashboard' : '/instructor/dashboard');

    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed';
      setError(typeof msg === 'string' ? msg : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
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
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* Выбор роли */}
          <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
            <span style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600' }}>
              Register as:
            </span>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="role"
                  value="STUDENT"
                  checked={formData.role === 'STUDENT'}
                  onChange={() => handleRoleChange('STUDENT')}
                />
                <span style={{ marginLeft: '0.5rem' }}>Student</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="role"
                  value="INSTRUCTOR"
                  checked={formData.role === 'INSTRUCTOR'}
                  onChange={() => handleRoleChange('INSTRUCTOR')}
                />
                <span style={{ marginLeft: '0.5rem' }}>Instructor</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}