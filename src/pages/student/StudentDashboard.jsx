import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Загрузка курсов и профиля
  useEffect(() => {
    if (!user) return;

    const init = async () => {
      try {
        const coursesRes = await api.get('/course/all_courses');
        setAllCourses(coursesRes.data || []);

        const saved = localStorage.getItem(`enrolled_courses_${user.userAccountId}`);
        setEnrolledCourses(saved ? JSON.parse(saved) : []);

        setProfileForm({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
        });

        setIsInitialized(true);
      } catch (err) {
        console.error(err);
        setAllCourses([]);
        setEnrolledCourses([]);
        setIsInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user]);

  // Сохраняем записанные курсы в localStorage
  useEffect(() => {
    if (!user || !isInitialized) return;

    localStorage.setItem(
      `enrolled_courses_${user.userAccountId}`,
      JSON.stringify(enrolledCourses)
    );
  }, [enrolledCourses, user, isInitialized]);

  // Записаться на курс
  const handleEnroll = (course) => {
    if (!window.confirm(`Enroll in "${course.courseName}"?`)) return;

    setEnrolledCourses((prev) => {
      if (prev.some((c) => c.courseId === course.courseId)) return prev;
      return [...prev, course];
    });
  };

  // Отписаться от курса
  const handleUnenroll = (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) return;

    setEnrolledCourses((prev) =>
      prev.filter((c) => c.courseId !== courseId)
    );
  };

  const availableCourses = allCourses.filter(
    (course) => !enrolledCourses.some((e) => e.courseId === course.courseId)
  );

  // Профиль
  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    try {
      await api.put(`/student/update_profile/${user.userAccountId}`, profileForm);
      alert('Profile updated successfully');
      setEditingProfile(false);
    } catch (err) {
      console.error(err);
      alert('Error updating profile');
    }
  };

  if (!user) {
    return <p style={{ padding: 40 }}>Loading user...</p>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      {/* Hero */}
      <div className="dashboard-hero">
        <h1>
          Welcome back, <span className="user-name">{user.firstName || user.email}</span> 👋
        </h1>
        <p>Ready to continue learning? Your courses are waiting.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{enrolledCourses.length}</div>
          <div className="stat-label">Enrolled Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">➕</div>
          <div className="stat-value">{availableCourses.length}</div>
          <div className="stat-label">Available to Enroll</div>
        </div>
      </div>

      {/* My Courses */}
      <section className="courses-section">
        <h2>My Courses</h2>
        {loading ? (
          <p>Loading courses...</p>
        ) : enrolledCourses.length === 0 ? (
          <p>You haven't enrolled in any courses yet.</p>
        ) : (
          <div className="courses-grid">
            {enrolledCourses.map((course) => (
              <div
                key={course.courseId}
                className="course-card enrolled"
                onClick={() => navigate(`/courses/${course.courseId}/view`)}
              >
                <div className="course-header">
                  <span className="course-icon">📖</span>
                  <h3>{course.courseName}</h3>
                </div>
                {course.description && <p className="course-description">{course.description}</p>}
                <div className="course-meta">
                  <span>⏱ {course.duration || 'N/A'}</span>
                </div>

                <div className="course-actions">
                  <button
                    className="continue-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/courses/${course.courseId}/view`);
                    }}
                  >
                    Continue Learning →
                  </button>
                  
                  {/* Кнопка для просмотра заданий */}
                  <button
                    className="assignments-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/courses/${course.courseId}/assignments`);
                    }}
                    style={{
                      background: '#f0f9ff',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}
                  >
                    View Assignments
                  </button>

                  <button
                    className="unenroll-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnenroll(course.courseId);
                    }}
                  >
                    Unenroll
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Available Courses */}
      <section className="courses-section">
        <h2>Available Courses</h2>
        {loading ? (
          <p>Loading...</p>
        ) : availableCourses.length === 0 ? (
          <p>No courses available for enrollment at the moment.</p>
        ) : (
          <div className="courses-grid">
            {availableCourses.map((course) => (
              <div key={course.courseId} className="course-card available">
                <div className="course-header">
                  <span className="course-icon">✨</span>
                  <h3>{course.courseName}</h3>
                </div>
                {course.description && <p className="course-description">{course.description}</p>}
                <div className="course-meta">
                  <span>⏱ {course.duration || 'N/A'}</span>
                </div>

                <div className="course-actions">
                  <button
                    className="enroll-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEnroll(course);
                    }}
                  >
                    Enroll Now
                  </button>
                  
                  {/* Кнопка для просмотра деталей курса */}
                  <button
                    className="preview-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/courses/${course.courseId}/view`);
                    }}
                    style={{
                      background: '#f8f9fa',
                      color: '#495057',
                      border: '1px solid #dee2e6',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}
                  >
                    Preview Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Profile Section */}
      <section className="profile-section">
        <h2>Profile</h2>

        {!editingProfile ? (
          <div className="profile-view">
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <button
              className="edit-profile-btn"
              onClick={() => setEditingProfile(true)}
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="edit-profile-form">
            <label>
              First Name
              <input
                type="text"
                name="firstName"
                value={profileForm.firstName}
                onChange={handleProfileChange}
              />
            </label>

            <label>
              Last Name
              <input
                type="text"
                name="lastName"
                value={profileForm.lastName}
                onChange={handleProfileChange}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
              />
            </label>

            <div className="profile-buttons">
              <button onClick={handleProfileSave} className="save-btn">
                Save Changes
              </button>
              <button
                onClick={() => setEditingProfile(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}