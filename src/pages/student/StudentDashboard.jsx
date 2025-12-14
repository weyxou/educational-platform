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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/course/all_courses');
        setCourses(res.data); // 👈 ВСЕ курсы инструкторов
      } catch (err) {
        console.error(err);
        alert('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>
          Welcome back, <span className="user-name">{user?.firstName || user?.email}</span>!
        </h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      {/* Courses */}
      <section className="courses-section">
        <h2>Available Courses</h2>

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
                {course.description && <p>{course.description}</p>}
                <p><strong>Duration:</strong> {course.duration || 'N/A'}</p>
                <button className="continue-btn">View Course</button>
              </div>
            ))}

            {courses.length === 0 && (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                No courses available yet.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Profile */}
      <section className="profile-section">
        <h2>Profile</h2>
        <p><strong>Name:</strong> {user?.firstName || 'Student'}</p>
        <p><strong>Email:</strong> {user?.email}</p>
      </section>
    </div>
  );
}
