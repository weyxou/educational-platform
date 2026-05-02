import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useNotification } from '../../context/AlertCustom';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { showToast, confirm } = useNotification();

  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [showAchievements, setShowAchievements] = useState(false);
const [certificates, setCertificates] = useState([]);

  const getUserId = () => user?.userAccountId || user?.id;

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [coursesRes, enrolledRes] = await Promise.all([
          api.get('/course/all_courses'),
          api.get('/enrollment/my-courses')
        ]);
        
        const coursesData = coursesRes.data;
        const coursesArray = Array.isArray(coursesData) ? coursesData : (coursesData?.content || []);
        setAllCourses(coursesArray);
        
        const enrolledData = enrolledRes.data;
        const enrolledArray = Array.isArray(enrolledData) ? enrolledData : (enrolledData?.content || []);
        setEnrolledCourses(enrolledArray);
      } catch (err) {
        console.error('Error loading courses:', err);
        setEnrolledCourses([]);
        showToast('Failed to load courses', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, showToast]);

  useEffect(() => {
  if (user) {
    setProfileForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
    });
  }
  loadCertificates();
}, [user]);

  const handleEnroll = async (course) => {
    confirm(`Enroll in "${course.courseName}"?`, async () => {
      try {
        const userId = getUserId();
        await api.post('/enrollment/enroll', {
          courseId: course.courseId,
          studentId: userId
        });
        const enrolledRes = await api.get('/enrollment/my-courses');
        const enrolledData = enrolledRes.data;
        const enrolledArray = Array.isArray(enrolledData) ? enrolledData : (enrolledData?.content || []);
        setEnrolledCourses(enrolledArray);
        showToast('Successfully enrolled!', 'success');
      } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || 'Enrollment failed. Please try again.', 'error');
      }
    }, 'Enroll');
  };

  const handleUnenroll = async (courseId) => {
    confirm('Are you sure you want to unenroll from this course?', async () => {
      try {
        await api.delete(`/enrollment/unenroll/${courseId}`);
        setEnrolledCourses((prev) => prev.filter((c) => c.courseId !== courseId));
        showToast('Unenrolled successfully', 'success');
      } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || 'Unenroll failed', 'error');
      }
    }, 'Unenroll');
  };

  const availableCourses = allCourses.filter(
    (course) => !enrolledCourses.some((e) => e.courseId === course.courseId)
  );

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    const userId = getUserId();
    if (!userId) {
      showToast('User ID not found. Please log in again.', 'error');
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
      showToast('Profile updated successfully', 'success');
      setEditingProfile(false);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error updating profile. Please try again.', 'error');
    }
  };



  const loadCertificates = () => {
  const allCertificates = [];
  const currentUserEmail = user?.email;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    if (key && key.startsWith('certificate_issued_') && key.includes(currentUserEmail)) {
      const courseId = key.replace('certificate_issued_', '').replace(`_${currentUserEmail}`, '');
      const courseName = localStorage.getItem(`certificate_course_name_${courseId}_${currentUserEmail}`);
      const completionDate = localStorage.getItem(`certificate_date_${courseId}_${currentUserEmail}`);
      
      if (courseName) {
        allCertificates.push({
          courseId,
          courseName,
          completionDate: completionDate || 'Unknown date',
          issued: true
        });
      }
    }
    
    if (key && key === `certificate_issued_${key.match(/certificate_issued_(\\d+)/)?.[1]}` && !key.includes('@')) {
      const courseId = key.replace('certificate_issued_', '');
      const courseName = localStorage.getItem(`certificate_course_name_${courseId}`);
      const completionDate = localStorage.getItem(`certificate_date_${courseId}`);
      
      if (courseName && !allCertificates.some(c => c.courseId === courseId)) {
        allCertificates.push({
          courseId,
          courseName,
          completionDate: completionDate || 'Unknown date',
          issued: true
        });
      }
    }
  }
  
  setCertificates(allCertificates);
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
    <div className="profile-email">{user.email}</div>
  </div>
  <div className="profile-actions">
    <button onClick={() => setEditingProfile(true)} className="edit-profile-btn desktop-only">
      Edit Profile
    </button>
    <button onClick={() => setShowAchievements(true)} className="achievements-btn">
      🏆 My Achievements
    </button>
  </div>
</div>
         <button
  className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  aria-label="Menu"
>
  <span></span><span></span><span></span>
</button>
          <button onClick={logout} className="logout-btn desktop-only">Logout</button>

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
    setShowAchievements(true);
    setIsMobileMenuOpen(false);
  }}
  className="mobile-achievements-btn"
>
  🏆 My Achievements
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
            <div className="loading-state">Loading courses</div>
          ) : enrolledCourses.length === 0 ? (
            <div className="empty-state">You haven't enrolled in any courses yet.</div>
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

      {showAchievements && (
  <div className="modal-overlay" onClick={() => setShowAchievements(false)}>
    <div className="modal-content achievements-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2 className="modal-title"> My Achievements</h2>
        <button className="modal-close" onClick={() => setShowAchievements(false)}>×</button>
      </div>
      <div className="achievements-list">
        {certificates.length === 0 ? (
          <div className="empty-achievements">
            <div className="empty-icon">🎓</div>
            <h3>No certificates yet</h3>
            <p>Complete a course to earn your first certificate!</p>
          </div>
        ) : (
          certificates.map((cert, index) => (
            <div key={index} className="achievement-card">
              <div className="achievement-icon"></div>
              <div className="achievement-info">
                <h3>{cert.courseName}</h3>
                <p>Completed on: {cert.completionDate}</p>
                <span className="achievement-badge">Certificate of Completion</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}