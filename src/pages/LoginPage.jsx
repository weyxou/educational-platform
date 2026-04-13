import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './auth.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
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
        role: data.userType || data.role,
      };

      localStorage.setItem('jwtToken', data.token || data.accessToken || data.jwt);

      login(user);

      setIsAnimating(true);
      
      setTimeout(() => {
        if (user.role === 'STUDENT') {
          navigate('/student/dashboard');
        } else if (user.role === 'INSTRUCTOR') {
          navigate('/instructor/dashboard');
        } else {
          console.warn('Unknown role:', user.role);
          navigate('/');
        }
      }, 600);

    } catch (err) {
      console.error('Login error:', err.response?.data);
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
      setLoading(false);
    }
  };

  const handleRegisterRedirect = (e) => {
    e.preventDefault();
    setIsAnimating(true);
    
    setTimeout(() => {
      navigate('/register');
    }, 600);
  };

  return (
    <div className={`auth-container ${isAnimating ? 'fade-out' : ''}`}>
      <div className={`auth-wrapper login-wrapper ${isAnimating ? 'slide-out' : ''}`}>
        <div className="auth-left login-left">
          <div className="auth-content login-content">
           <h2>Welcome Back!</h2>

<p>
  Continue your journey — learn new skills, teach your courses, and grow with the platform.
</p>

<div className="features">
  <div className="feature-item">
    <span>Access your courses and learning materials</span>
  </div>

  <div className="feature-item">
    <span>Track your progress or student performance</span>
  </div>

  <div className="feature-item">
    <span>Connect with instructors and learners</span>
  </div>

  <div className="feature-item">
    <span>Get personalized recommendations for growth</span>
  </div>
</div>
          </div>
        </div>
        <div className="auth-right login-right">
          <div className="auth-card login-card">
            <h1>Sign In</h1>
            <div className="auth-subtitle">Access your account</div>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p>
              Don't have an account?{' '}
              <Link to="/register" onClick={handleRegisterRedirect}>
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}