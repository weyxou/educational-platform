// src/pages/instructor/CreateCourse.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function CreateCourse() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courseName: '',
    description: '',
    duration: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/course/add_course', {
        ...formData,
        instructorId: user.userAccountId,
      });
      navigate('/instructor/dashboard');
    } catch (err) {
      alert('Failed to create course');
    }
  };

 return (
  <div className="dashboard-container">
    <div className="page-card">
      <h2 className="page-title">Create New Course</h2> {/* или Edit Course */}
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-group">
          <label>Course Name</label>
          <input className="form-input"/>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea className="form-textarea"/>
        </div>
        <div className="form-group">
          <label>Duration</label>
          <input className="form-input"/>
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