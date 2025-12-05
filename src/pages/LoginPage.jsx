// src/pages/LoginPage.jsx
import { Link } from 'react-router-dom'
import './auth.css'

export default function LoginPage() {

  // ТЕСТОВЫЙ ВХОД — просто нажми кнопку
  const handleTestLogin = (role) => {
    const testUser = {
      email: role === 'student' ? 'student@example.com' : 'teacher@example.com',
      role: role
    };
    localStorage.setItem('user', JSON.stringify(testUser));
    window.location.href = '/dashboard';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Educational Platform</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        <form>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" style={{ marginRight: '0.5rem' }} />
              Remember me
            </label>
            <a href="#" className="text-link">Forgot password?</a>
          </div>

          <button type="submit" className="btn-primary">
            Sign In
          </button>
        </form>

        {/* ТЕСТОВЫЕ КНОПКИ */}
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <button
            onClick={() => handleTestLogin('student')}
            style={{
              padding: '14px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Войти как студент (тест)
          </button>

          <button
            onClick={() => handleTestLogin('instructor')}
            style={{
              padding: '14px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Войти как преподаватель (тест)
          </button>
        </div>

        <div className="divider"><span>Or</span></div>

        <p style={{ textAlign: 'center', color: '#6b7280' }}>
          Don't have an account?{' '}
          <Link to="/register" className="text-link">Sign up</Link>
        </p>
      </div>
    </div>
  )
}