import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './auth.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
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
      const signupPayload = {
        email: trimmedData.email,
        password: trimmedData.password,
        role: trimmedData.role
      };

      const signupRes = await api.post('/auth/signup', signupPayload);
      const data = signupRes.data;

      const user = {
        email: data.email || trimmedData.email,
        firstName: trimmedData.firstName,
        lastName: trimmedData.lastName,
        userAccountId: data.userId || data.userAccountId || data.id,
        role: data.userType || data.role || trimmedData.role
      };

      if (data.token) {
        localStorage.setItem('jwtToken', data.token);
      }

      login(user);

      if (data.userId || data.userAccountId) {
        try {
          await api.put(`/instructor/update_profile/${user.userAccountId || data.userId}`, {
            firstName: trimmedData.firstName,
            lastName: trimmedData.lastName
          });
        } catch (profileErr) {
          console.warn('Could not update profile names:', profileErr);
        }
      }
      setIsAnimating(true);
      
      setTimeout(() => {
        navigate(user.role === 'STUDENT' ? '/student/dashboard' : '/instructor/dashboard');
      }, 600);

    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed';
      setError(typeof msg === 'string' ? msg : 'Something went wrong');
      setLoading(false);
    }
  };

  const handleLoginRedirect = (e) => {
    e.preventDefault();
    setIsAnimating(true);
    
    setTimeout(() => {
      navigate('/login');
    }, 600);
  };

  return (
    <div className={`auth-container ${isAnimating ? 'fade-out' : ''}`}>
      <div className={`auth-wrapper register-wrapper ${isAnimating ? 'slide-out' : ''}`}>
        <div className="auth-left register-left">
          <div className="auth-card register-card">
            <h1>Create Account</h1>
            <div className="auth-subtitle">Join our community of learners and instructors</div>
            
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>First Name</label>
                <input
                  name="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Last Name</label>
                <input
                  name="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

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
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="role-selection">
                <div className="role-title">I want to join as:</div>
                <div className="role-options">
                  <label className="role-radio">
                    <input
                      type="radio"
                      name="role"
                      value="STUDENT"
                      checked={formData.role === 'STUDENT'}
                      onChange={() => handleRoleChange('STUDENT')}
                    />
                    <span>Student</span>
                  </label>
                  <label className="role-radio">
                    <input
                      type="radio"
                      name="role"
                      value="INSTRUCTOR"
                      checked={formData.role === 'INSTRUCTOR'}
                      onChange={() => handleRoleChange('INSTRUCTOR')}
                    />
                    <span>Instructor</span>
                  </label>
                </div>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p>
              Already have an account?{' '}
              <Link to="/login" onClick={handleLoginRedirect}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-right register-right">
          <div className="auth-content">
            <h2>Start Your Journey Today</h2>
            <p>Join thousands of successful students and instructors who are already learning and teaching on our platform</p>
            <div className="features">
              <div className="feature-item">
                <span>1000+ courses available</span>
              </div>
              <div className="feature-item">
                <span>Learn from industry experts</span>
              </div>
              <div className="feature-item">
                <span>Earn certificates & advance career</span>
              </div>
              <div className="feature-item">
                <span>Teach what you love</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}