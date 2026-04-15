import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/AlertCustom';
import './CreateCourse.css';

export default function CreateCourse() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [formData, setFormData] = useState({
    courseName: '',
    description: '',
    duration: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseName.trim()) {
      showToast('Course name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        courseName: formData.courseName.trim(),
        description: formData.description.trim() || null,
        duration: formData.duration.trim() || null,
        instructorId: user?.userAccountId || user?.id,
      };

      const response = await api.post('/course/add_course', payload);
      const newCourse = response.data;

      showToast(`Course "${newCourse.courseName}" created successfully!`, 'success');
      navigate('/instructor/dashboard');
    } catch (err) {
      console.error('Create course error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to create course';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="page-card">
        <h2 className="page-title">Create New Course</h2>
        <form onSubmit={handleSubmit} className="course-form">
          <div className="form-group">
            <label>Course Name *</label>
            <input
              className="form-input"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Duration</label>
            <input
              className="form-input"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 8 weeks, 10 hours"
              disabled={loading}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/instructor/dashboard')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}