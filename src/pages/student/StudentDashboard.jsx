import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import './StudentDashboard.css';


export default function StudentDashboard() {
  const { user, logout, updateUser } = useAuth(); 
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  useEffect(() => {
    if (!user) return;

    const init = async () => {
      try {
        const coursesRes = await api.get('/course/all_courses');
        setAllCourses(coursesRes.data || []);
        const saved = localStorage.getItem(`enrolled_courses_${user.userAccountId || user.id}`);
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

  useEffect(() => {
    if (!user || !isInitialized) return;
    const storageKey = `enrolled_courses_${user.userAccountId || user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(enrolledCourses));
  }, [enrolledCourses, user, isInitialized]);


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  const handleEnroll = (course) => {
    if (!window.confirm(`Enroll in "${course.courseName}"?`)) return;
    setEnrolledCourses((prev) => {
      if (prev.some((c) => c.courseId === course.courseId)) return prev;
      return [...prev, course];
    });
  };

  const handleUnenroll = (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) return;
    setEnrolledCourses((prev) => prev.filter((c) => c.courseId !== courseId));
  };

  const availableCourses = allCourses.filter(
    (course) => !enrolledCourses.some((e) => e.courseId === course.courseId)
  );

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    const userId = user.userAccountId || user.id;
    if (!userId) {
      alert('User ID not found. Please log in again.');
      return;
    }

    try {
      await api.put(`/student/update_profile/${userId}`, profileForm);
      if (updateUser) {
        updateUser({
          ...user,
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          email: profileForm.email,
        });
      } else {
        localStorage.setItem('user', JSON.stringify({
          ...user,
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          email: profileForm.email,
        }));
        window.location.reload();
      }
      alert('Profile updated successfully');
      setEditingProfile(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error updating profile. Please try again.');
    }
  };

  const displayedEnrolled = enrolledCourses.slice(0, 4);
  const displayedAvailable = availableCourses.slice(0, 4);
  const hasMoreEnrolled = enrolledCourses.length > 4;
  const hasMoreAvailable = availableCourses.length > 4;

  if (!user) {
    return <div className="loading-state">Loading user...</div>;
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-top-bar">
          <div className="profile-summary">
            <div className="profile-avatar">
              <span className="avatar-initials">
                {user.firstName?.[0] || user.email?.[0] || 'S'}
              </span>
            </div>
            <div className="profile-info desktop-only">
              <div className="profile-name">
                {user.firstName} {user.lastName}
              </div>
              <div className="profile-email">{user.email}

              </div>
            </div>
            <button 
              onClick={() => setEditingProfile(true)} 
              className="edit-profile-btn desktop-only"
            >
              Edit Profile
            </button>
          </div>
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <span></span><span></span><span></span>
          </button>
          <button onClick={logout} className="logout-btn desktop-only">Logout</button>

          {/* Мобильное выезжающее меню */}
          <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="mobile-profile-info">
              <div className="mobile-profile-name">
                {user.firstName} {user.lastName}
              </div>
              <div className="mobile-profile-email">{user.email}</div>
            </div>
            <button 
              onClick={() => {
                setEditingProfile(true);
                setIsMobileMenuOpen(false);
              }} 
              className="mobile-edit-btn"
            >
              Edit Profile
            </button>
            <button 
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }} 
              className="mobile-logout-btn"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-hero">
          <h1>
            Welcome back, <span className="user-name">{user.firstName || user.email}</span>
          </h1>
          <p>Ready to continue learning? Your courses are waiting.</p>
        </div>

        <section className="courses-section">
          <div className="section-header">
            <h2>My Courses</h2>
            {hasMoreEnrolled && (
              <button 
                onClick={() => navigate('/student/my-courses')} 
                className="view-all-btn"
              >
                View All ({enrolledCourses.length})
              </button>
            )}
          </div>
          {loading ? (
            <div className="loading-state">Loading courses
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="empty-state">You haven't enrolled in any courses yet.
            </div>
          ) : (
            <div className="courses-grid">
              {displayedEnrolled.map((course) => (
                <div
                  key={course.courseId}
                  className="course-card enrolled"
                  onClick={() => navigate(`/courses/${course.courseId}/view`)}
                >
                  <div className="course-card-header">
                    <div className="course-icon"></div>
                    <h3>{course.courseName}</h3>
                  </div>
                  {course.description && <p className="course-description">{course.description}</p>}
                  <div className="course-meta">
                    <span className="meta-item">{course.duration || 'Self-paced'}</span>
                  </div>
                  <div className="course-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="action-btn continue"
                      onClick={() => navigate(`/courses/${course.courseId}/view`)}
                    >
                      Continue Learning
                    </button>
                    <button
                      className="action-btn assignments"
                      onClick={() => navigate(`/courses/${course.courseId}/assignments`)}
                    >
                      Assignments
                    </button>
                    <button
                      className="action-btn unenroll"
                      onClick={() => handleUnenroll(course.courseId)}
                    >
                      Unenroll
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="courses-section">
          <div className="section-header">
            <h2>Available Courses</h2>
            {hasMoreAvailable && (
              <button 
                onClick={() => navigate('/student/available-courses')} 
                className="view-all-btn"
              >
                View All ({availableCourses.length})
              </button>
            )}
          </div>
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : availableCourses.length === 0 ? (
            <div className="empty-state">No courses available for enrollment at the moment.</div>
          ) : (
            <div className="courses-grid">
              {displayedAvailable.map((course) => (
                <div key={course.courseId} className="course-card available">
                  <div className="course-card-header">
                    <div className="course-icon"></div>
                    <h3>{course.courseName}</h3>
                  </div>
                  {course.description && <p className="course-description">{course.description}</p>}
                  <div className="course-meta">
                    <span className="meta-item">{course.duration || 'Self-paced'}</span>
                  </div>
                  <div className="course-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="action-btn enroll"
                      onClick={() => handleEnroll(course)}
                    >
                      Enroll Now
                    </button>
                    <button
                      className="action-btn preview"
                      onClick={() => navigate(`/courses/${course.courseId}/view`)}
                    >
                      Preview Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {editingProfile && (
        <div className="modal-overlay" onClick={() => setEditingProfile(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Profile</h2>
            <div className="profile-edit-form">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-actions">
                <button onClick={handleProfileSave} className="btn btn-primary">Save Changes</button>
                <button onClick={() => setEditingProfile(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}