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
    } catch (err) {
      console.error(err);
      setError('Failed to create course');
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
    } catch (err) {
      console.error(err);
      setError('Failed to update course');
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
    } catch (err) {
      console.error(err);
      setError('Failed to delete course');
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
      updateUser(profileData); // Обновление AuthContext
      setIsEditingProfile(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.firstName || user?.email}!</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

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
                onClick={() => navigate(`/courses/${course.courseId}/view`)}
              >
                <div className="course-main">
                  <h4>{course.courseName}</h4>
                  <span className="status-badge active">Active</span>
                </div>
                <p className="course-meta">Duration: {course.duration || 'N/A'}</p>

                <div className="course-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(course); }}
                    className="action-btn btn-edit"
                  >
                    Edit
                  </button>
                  <Link to={`/courses/${course.courseId}/lessons`}>
                    <button onClick={(e) => e.stopPropagation()} className="action-btn btn-manage">
                      Manage Lessons
                    </button>
                  </Link>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteCourse(course.courseId); }}
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

      {/* Модалки создания и редактирования курса */}
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
<section className="profile-section">
  <h2>Profile</h2>

  <div className="profile-card">
    {!isEditingProfile ? (
      <div className="profile-view">
        <div className="profile-info">
          <p><strong>Name:</strong> {profileData.firstName} {profileData.lastName}</p>
          <p><strong>Email:</strong> {profileData.email}</p>
        </div>
        <button
          onClick={() => setIsEditingProfile(true)}
          className="quick-btn primary edit-profile-btn"
        >
          Edit Profile
        </button>
      </div>
    ) : (
      <div className="profile-edit-form">
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

        <div className="form-actions profile-actions">
          <button onClick={saveProfile} className="btn btn-primary">
            Save Changes
          </button>
          <button
            onClick={() => setIsEditingProfile(false)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
  </div>
</section>
    </div>
  );
}

// Вынесенная компонент модалки курса
function CourseModal({ title, course, setCourse, onClose, onSave, saveBtnText }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        <form onSubmit={onSave} className="course-form">
          <div className="form-group">
            <label>Course Name</label>
            <input
              className="form-input"
              value={course.courseName}
              onChange={(e) => setCourse({ ...course, courseName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-textarea"
              value={course.description}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Duration</label>
            <input
              className="form-input"
              value={course.duration}
              onChange={(e) => setCourse({ ...course, duration: e.target.value })}
              placeholder="e.g., 8 weeks"
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
