// src/pages/RegisterPage.jsx
import { Link } from 'react-router-dom'
import './auth.css';    // ← вот так правильно

export default function RegisterPage() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Educational Platform</h1>
        <p className="auth-subtitle">Create your account</p>

        <form>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Minimum 6 characters" required />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" required />
          </div>

          <div className="form-group">
            <label>I am registering as</label>
            <div className="role-options">
              <label className="role-card selected">
                <input type="radio" name="role" value="student" defaultChecked />
                <div className="text-3xl mb-2">Student</div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Student</div>
              </label>
              <label className="role-card">
                <input type="radio" name="role" value="instructor" />
                <div className="text-3xl mb-2">Teacher</div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Instructor</div>
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Create Account
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#6b7280' }}>
          Already have an account?{' '}
          <Link to="/login" className="text-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}