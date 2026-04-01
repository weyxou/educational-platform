import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import './InstructorDashboard.css';

export default function InstructorDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    email: user?.email || '',
    school: user?.school || '',
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

  useEffect(() => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      school: user?.school || '',
    });
  }, [user]);

  const createCourse = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/course/add_course', {
        ...newCourse,
        instructorId: user.userAccountId,
      });
      setCourses([...courses, res.data]);
      setIsCreateModalOpen(false);
      setNewCourse({ courseName: '', description: '', duration: '' });
      setSuccess('Course created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to create course');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openEditModal = (course) => {
    setEditingCourse({ ...course });
    setIsEditModalOpen(true);
  };

  const saveCourseChanges = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.put(`/course/update/course_id/${editingCourse.courseId}`, editingCourse);
      setCourses(courses.map(c => c.courseId === editingCourse.courseId ? editingCourse : c));
      setIsEditModalOpen(false);
      setSuccess('Course updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update course');
      setTimeout(() => setError(''), 3000);
    }
  };

  const deleteCourse = async (courseId) => {
    setError('');
    setSuccess('');
    if (!window.confirm('Delete this course? All lessons will be deleted.')) return;
    try {
      await api.delete(`/course/delete/course_id/${courseId}`);
      setCourses(courses.filter(c => c.courseId !== courseId));
      setSuccess('Course deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to delete course');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/student/update_profile/${user.userAccountId}`, profileData);
      updateUser(profileData);
      setIsEditingProfile(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="instructor-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Welcome back, {user?.firstName || 'Instructor'}!</h1>
            <p className="header-subtitle">Manage your courses and track your success</p>
          </div>
          <button onClick={logout} className="logout-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>

        {/* Messages */}
        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        {/* Courses Section */}
        <section className="courses-section">
          <div className="section-header">
            <div>
              <h3>My Courses</h3>
              <p className="section-subtitle">{courses.length} course{courses.length !== 1 ? 's' : ''} in total</p>
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="create-course-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create New Course
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your courses...</p>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map(course => (
                <div
                  key={course.courseId}
                  className="course-card"
                  onClick={() => navigate(`/courses/${course.courseId}/view`)}
                >
                  <div className="course-card-header">
                    <div className="course-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </div>
                    <span className="status-badge active">Active</span>
                  </div>
                  
                  <h4 className="course-title">{course.courseName}</h4>
                  <p className="course-description">{course.description || 'No description provided'}</p>
                  
                  <div className="course-meta">
                    <span className="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {course.duration || 'Self-paced'}
                    </span>
                  </div>

                  <div className="course-actions" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEditModal(course)} className="action-btn edit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                        <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                      </svg>
                      Edit
                    </button>
                    <Link to={`/courses/${course.courseId}/lessons`} onClick={(e) => e.stopPropagation()}>
                      <button className="action-btn manage">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2a10 10 0 0 1 10 10c0 5-3 7-5 7s-3-2-5-2-3 2-5 2-5-2-5-7a10 10 0 0 1 10-10z" />
                          <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                        </svg>
                        Lessons
                      </button>
                    </Link>
                    <button onClick={() => deleteCourse(course.courseId)} className="action-btn delete">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {courses.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <h4>No courses yet</h4>
                  <p>Create your first course and start teaching</p>
                  <button onClick={() => setIsCreateModalOpen(true)} className="empty-create-btn">
                    Create Your First Course
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Profile Section */}
        <section className="profile-section">
          <div className="profile-header">
            <h2>Profile Information</h2>
            <p className="profile-subtitle">Manage your personal details</p>
          </div>

          <div className="profile-card">
            {!isEditingProfile ? (
              <div className="profile-view">
                <div className="profile-info-grid">
                  <div className="info-item">
                    <label>Full Name</label>
                    <p>{profileData.firstName} {profileData.lastName}</p>
                  </div>
                  <div className="info-item">
                    <label>Email Address</label>
                    <p>{profileData.email}</p>
                  </div>
                </div>
                <button onClick={() => setIsEditingProfile(true)} className="edit-profile-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                    <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                  </svg>
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="profile-edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button onClick={saveProfile} className="btn btn-primary">
                    Save Changes
                  </button>
                  <button onClick={() => setIsEditingProfile(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CourseModal
          title="Create New Course"
          course={newCourse}
          setCourse={setNewCourse}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={createCourse}
          saveBtnText="Create Course"
        />
      )}
      {isEditModalOpen && editingCourse && (
        <CourseModal
          title="Edit Course"
          course={editingCourse}
          setCourse={setEditingCourse}
          onClose={() => setIsEditModalOpen(false)}
          onSave={saveCourseChanges}
          saveBtnText="Save Changes"
        />
      )}
    </div>
  );
}

function CourseModal({ title, course, setCourse, onClose, onSave, saveBtnText }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSave} className="course-form">
          <div className="form-group">
            <label>Course Name</label>
            <input
              className="form-input"
              value={course.courseName}
              onChange={(e) => setCourse({ ...course, courseName: e.target.value })}
              placeholder="e.g., Advanced Web Development"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-textarea"
              value={course.description}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
              placeholder="Describe what students will learn..."
              rows="4"
            />
          </div>
          <div className="form-group">
            <label>Duration</label>
            <input
              className="form-input"
              value={course.duration}
              onChange={(e) => setCourse({ ...course, duration: e.target.value })}
              placeholder="e.g., 8 weeks, 40 hours, Self-paced"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{saveBtnText}</button>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}