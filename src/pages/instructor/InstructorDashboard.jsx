// src/pages/instructor/InstructorDashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import './InstructorDashboard.css';

export default function InstructorDashboard() {
  const { user, logout } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Модалка создания курса
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    description: '',
    duration: '',
  });

  // Модалка редактирования курса
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Модалка редактирования профиля
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  // Загрузка курсов
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

  // Создание курса
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

  // Редактирование курса
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

  // Редактирование профиля
  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const updateRequest = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
      };
      await api.put(`/instructor/update_profile/${user.userAccountId}`, updateRequest);
      // Здесь можно обновить контекст аутентификации, если нужно
      alert('Profile updated successfully!');
      setIsProfileModalOpen(false);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  // Удаление курса
  const deleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course?')) return;
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
              <div key={course.courseId} className="course-item">
                <div className="course-main">
                  <h4>{course.courseName}</h4>
                  <span className="status-badge active">Active</span>
                </div>
                <p className="course-meta">Duration: {course.duration || 'N/A'}</p>
                <div className="course-actions">
                  <button onClick={() => openEditModal(course)} className="action-btn btn-edit">
                    Edit
                  </button>
                  <Link to={`/courses/${course.courseId}/lessons`}>
                    <button className="action-btn btn-manage">Manage Lessons</button>
                  </Link>
                  <button onClick={() => deleteCourse(course.courseId)} className="action-btn btn-delete">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {courses.length === 0 && <p>No courses yet. Create your first one!</p>}
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

      {/* Модалка редактирования профиля */}
      {isProfileModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Profile</h2>
            <form onSubmit={saveProfile} className="course-form">
              <div className="form-group">
                <label>First Name</label>
                <input
                  className="form-input"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  className="form-input"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save Profile</button>
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Section */}
      <section className="profile-section">
        <h2>Profile</h2>
        <div className="profile-info">
          <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>
        <button onClick={() => {
          setProfileForm({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
          });
          setIsProfileModalOpen(true);
        }} className="action-btn">
          Edit Profile
        </button>
      </section>
    </div>
  );
}