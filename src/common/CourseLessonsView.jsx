import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import './CourseLessonsView.css';

export default function CourseLessonsView() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await api.get(`/course/course_id/${courseId}`);
        setCourse(courseRes.data);

        const lessonsRes = await api.get(`/lesson/get_all_lessons/${courseId}`);
        setLessons(lessonsRes.data || []);
      } catch (err) {
        console.error('Error loading course/lessons:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  if (loading) return <div className="loading">Loading course...</div>;
  if (!course) return <div className="not-found">Course not found</div>;

  const sortedLessons = [...lessons].sort((a, b) => a.lessonOrder - b.lessonOrder);

  return (
    <div className="course-view-container">
      <div className="course-header">
        <Link
          to={isInstructor ? '/instructor/dashboard' : '/student/dashboard'}
          className="back-link">
          Back to Dashboard
        </Link>

        <h1>{course.courseName}</h1>
        {course.description && <p className="course-desc">{course.description}</p>}
      </div>

      <div className="lessons-list">
        <h2>Lessons ({sortedLessons.length})</h2>
        {sortedLessons.length === 0 ? (
          <div className="empty-state">No lessons yet.</div>
        ) : (
          <div className="lessons-grid">
            {sortedLessons.map((lesson) => (
              <div key={lesson.lessonId} className="lesson-card">
                <div className="lesson-number">
                  Lesson {lesson.lessonOrder || '?'}
                </div>
                <div className="lesson-body">
                  <h3>{lesson.lessonName}</h3>
                  {lesson.lessonDescription && (
                    <p className="lesson-desc">{lesson.lessonDescription}</p>
                  )}
                  <p className="lesson-meta">
                    Created: {new Date(lesson.createdAt).toLocaleDateString()}
                  </p>

                  {!isInstructor && (
                    <Link
                      to={`/courses/${courseId}/lesson/${lesson.lessonId}`}
                      className="btn btn-primary"
                    >
                      View Lesson →
                    </Link>
                  )}

                  {isInstructor && (
                    <Link
                      to={`/courses/${courseId}/lesson/${lesson.lessonId}`}
                      className="btn btn-secondary"
                    >
                      View & Manage →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
