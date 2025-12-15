import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/course/all_courses');
        setCourses(res.data);
      } catch (err) {
        console.error(err);
        alert('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    try {
      const res = await api.put(`/student/update_profile/${user.userAccountId}`, profileForm);
      alert('Profile updated successfully');
      setEditingProfile(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      {/* Hero */}
      <div className="dashboard-hero">
        <h1>
          Welcome back, <span className="user-name">{user?.firstName || user?.email}</span>! 👋
        </h1>
        <p>Ready to continue learning? Your courses and progress are waiting for you.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{courses.length}</div>
          <div className="stat-label">Available Courses</div>
        </div>
        {/* ... other stats */}
      </div>

      {/* Courses */}
      <section className="courses-section">
        <h2>My Courses</h2>
        {loading ? (
          <p>Loading courses...</p>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <div
                key={course.courseId}
                className="course-card"
                onClick={() => navigate(`/courses/${course.courseId}/view`)}
              >
                <h3>{course.courseName}</h3>
                {course.description && <p className="course-description">{course.description}</p>}
                <p className="course-duration"><strong>Duration:</strong> {course.duration || 'N/A'}</p>
                <button className="continue-btn">View Course →</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Profile Section */}
      <section className="profile-section">
        <h2>Profile</h2>

        {!editingProfile ? (
          <>
            <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <button
              className="edit-profile-btn"
              onClick={() => setEditingProfile(true)}
            >
              Edit Profile
            </button>
          </>
        ) : (
          <div className="edit-profile-form">
            <label>
              First Name:
              <input
                type="text"
                name="firstName"
                value={profileForm.firstName}
                onChange={handleProfileChange}
              />
            </label>
            <label>
              Last Name:
              <input
                type="text"
                name="lastName"
                value={profileForm.lastName}
                onChange={handleProfileChange}
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
              />
            </label>
            <div className="profile-buttons">
              <button onClick={handleProfileSave} className="save-btn">Save</button>
              <button onClick={() => setEditingProfile(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
