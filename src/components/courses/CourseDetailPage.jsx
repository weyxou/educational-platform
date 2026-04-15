import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import './Courses.css';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const extractData = (response) => {
    const data = response.data;
    return Array.isArray(data) ? data : (data?.content || []);
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      setError("unauthorized");
      return;
    }

    const fetchData = async () => {
      try {
        const courseRes = await api.get(`/course/course_id/${courseId}`);
        setCourse(courseRes.data);
        const lessonsRes = await api.get(`/lesson/get_all_lessons/${courseId}`);
        const lessonsArray = extractData(lessonsRes);
        setLessons(lessonsArray);
        setError(null);
      } catch (err) {
        console.error("Error:", err);
        if (err.response?.status === 403) {
          setError("forbidden");
        } else {
          setError("server");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user, authLoading]);

  if (authLoading || loading) return <div className="loading">Loading course...</div>;

  if (!user || error === "unauthorized") {
    return (
      <div className="course-detail-page">
        <div className="container">
          <div className="auth-warning">
            <h2>Access Restricted</h2>
            <p>You need to be logged in to view course details and lessons.</p>
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </div>
            <Link to="/student/dashboard" className="back-link">← Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  if (error === "forbidden") {
    return (
      <div className="course-detail-page">
        <div className="container">
          <div className="error-message">
            <h2>Access Denied</h2>
            <p>You don't have permission to view this course.</p>
            <Link to="/student/dashboard" className="back-link">← Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!course) return <div className="not-found">Course not found</div>;

  return (
    <div className="course-detail-page">
      <div className="course-header">
        <Link to="/student/dashboard" className="back-link">← Back to Dashboard</Link>
        <h1>{course.courseName}</h1>
        {course.description && <p className="course-desc">{course.description}</p>}
        {course.duration && <span className="course-duration">Duration: {course.duration}</span>}
        {course.category && <span className="course-category">Category: {course.category}</span>}
      </div>

      <div className="instructor-info">
        <h2>Instructor</h2>
        <p><strong>Name:</strong> {course.instructorName}</p>
        {course.instructorEmail && <p><strong>Email:</strong> {course.instructorEmail}</p>}
        {course.instructorBio && <p><strong>Bio:</strong> {course.instructorBio}</p>}
      </div>

      <div className="lessons-list">
        <h2>Lessons ({lessons.length})</h2>
        {lessons.length === 0 ? (
          <p>No lessons available for this course yet.</p>
        ) : (
          <ul>
            {lessons.map((lesson, index) => (
              <li key={lesson.lessonId}>
                <Link to={`/courses/${courseId}/lesson/${lesson.lessonId}`}>
                  {index + 1}. {lesson.lessonName}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}