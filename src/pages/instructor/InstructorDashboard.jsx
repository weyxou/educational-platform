// src/pages/instructor/InstructorDashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import './InstructorDashboard.css';

export default function InstructorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Модалки
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    description: '',
    duration: '',
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    school: user?.school || 'My School',
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/course/all_courses');
        const myCourses = response.data.filter(
          c => c.instructorId === user?.userAccountId
        );
        setCourses(myCourses);
      } catch (err) {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    if (user?.userAccountId) fetchCourses();
  }, [user]);

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/course/add_course', {
        ...newCourse,
        instructorId: user.userAccountId,
      });
      setCourses([...courses, res.data]);
      setIsCreateModalOpen(false);
      setNewCourse({ courseName: '', description: '', duration: '' });
      alert('Course created successfully!');
    } catch (err) {
      alert('Failed to create course');
    }
  };

  const openEditModal = (course) => {
    setEditingCourse({ ...course });
    setIsEditModalOpen(true);
  };

  const saveCourseChanges = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/course/update/course_id/${editingCourse.courseId}`, editingCourse);
      setCourses(courses.map(c => c.courseId === editingCourse.courseId ? editingCourse : c));
      setIsEditModalOpen(false);
      alert('Course updated successfully!');
    } catch (err) {
      alert('Failed to update course');
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course? All lessons will be deleted.')) return;
    try {
      await api.delete(`/course/delete/course_id/${courseId}`);
      setCourses(courses.filter(c => c.courseId !== courseId));
    } catch (err) {
      alert('Failed to delete course');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Welcome, {user?.firstName || user?.email}!</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* My Courses */}
      <section className="courses-section">
        <div className="section-header">
          <h3>My Courses ({courses.length})</h3>
          <button onClick={() => setIsCreateModalOpen(true)} className="quick-btn primary">
            Add New Course
          </button>
        </div>

        {loading ? (
          <p>Loading courses...</p>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <div
                key={course.courseId}
                className="course-item clickable-course-card"
                onClick={() => navigate(`/courses/${course.courseId}/view`)} // Клик по карточке → просмотр
              >
                <div className="course-main">
                  <h4>{course.courseName}</h4>
                  <span className="status-badge active">Active</span>
                </div>
                <p className="course-meta">Duration: {course.duration || 'N/A'}</p>

                {/* Кнопки — отключаем переход по карточке */}
                <div className="course-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(course);
                    }}
                    className="action-btn btn-edit"
                  >
                    Edit
                  </button>

                  <Link to={`/courses/${course.courseId}/lessons`}>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="action-btn btn-manage"
                    >
                      Manage Lessons
                    </button>
                  </Link>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCourse(course.courseId);
                    }}
                    className="action-btn btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {courses.length === 0 && (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>
                No courses yet. Create your first one!
              </p>
            )}
          </div>
        )}
      </section>

      {/* Модалка создания курса */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create New Course</h2>
            <form onSubmit={createCourse} className="course-form">
              <div className="form-group">
                <label>Course Name</label>
                <input
                  className="form-input"
                  value={newCourse.courseName}
                  onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-textarea"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input
                  className="form-input"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                  placeholder="e.g., 8 weeks"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Create Course</button>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалка редактирования курса */}
      {isEditModalOpen && editingCourse && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Course</h2>
            <form onSubmit={saveCourseChanges} className="course-form">
              <div className="form-group">
                <label>Course Name</label>
                <input
                  className="form-input"
                  value={editingCourse.courseName || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, courseName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-textarea"
                  value={editingCourse.description || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input
                  className="form-input"
                  value={editingCourse.duration || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Профиль (если нужно — добавишь сам) */}
      <section className="profile-section">
        <h2>Profile</h2>
        <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
        <p><strong>Email:</strong> {user?.email}</p>
      </section>
    </div>
  );
}