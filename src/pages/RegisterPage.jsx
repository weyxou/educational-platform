import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const API_BASE = 'http://localhost:8090';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, authFetch } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleChange = (role) =>
    setFormData((prev) => ({ ...prev, role }));

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  if (formData.password.length < 6) {
    setError('Password must be at least 6 characters');
    setLoading(false);
    return;
  }

  const payload = {
    email: formData.email.trim(),
    password: formData.password,
    role: formData.role === 'student' ? 'STUDENT' : 'INSTRUCTOR'
  };

  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Проверка типа ответа
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      setError(typeof data === "string" ? data : data.message || 'Registration failed');
      setLoading(false);
      return;
    }

    data.user.role = data.user.role?.role || data.user.role;
    login(data.user, data.token);

    if (formData.firstName || formData.lastName) {
      try {
        await authFetch(`${API_BASE}/users/${data.user.userId}`, {
          method: 'PUT',
          body: JSON.stringify({
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim()
          })
        });
      } catch (err) {
        console.warn('Failed to update profile:', err);
      }
    }

    navigate(data.user.role === 'STUDENT' ? '/student/dashboard' : '/instructor/dashboard');

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
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div>
            <label>
              <input
                type="radio"
                checked={formData.role === 'student'}
                onChange={() => handleRoleChange('student')}
              />
              Student
            </label>
            <label>
              <input
                type="radio"
                checked={formData.role === 'instructor'}
                onChange={() => handleRoleChange('instructor')}
              />
              Instructor
            </label>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
