import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/AlertCustom';

export default function CreateCourse() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [formData, setFormData] = useState({
    courseName: '',
    description: '',
    duration: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseName.trim()) {
      showToast('Course name is required', 'error');
      return;
    }
    try {
      await api.post('/course/add_course', {
        ...formData,
        instructorId: user.userAccountId,
      });
      showToast('Course created successfully!', 'success');
      navigate('/instructor/dashboard');
    } catch (err) {
      showToast('Failed to create course', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="dashboard-container">
      <div className="page-card">
        <h2 className="page-title">Create New Course</h2>
        <form onSubmit={handleSubmit} className="course-form">
          <div className="form-group">
            <label>Course Name</label>
            <input
              className="form-input"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              required
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
            />
          </div>
          <div className="form-group">
            <label>Duration</label>
            <input
              className="form-input"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 8 weeks"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Create Course</button>
            <button type="button" onClick={() => navigate('/instructor/dashboard')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}