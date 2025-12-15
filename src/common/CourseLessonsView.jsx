// src/pages/common/CourseLessonsView.jsx
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
        setLessons(lessonsRes.data);
      } catch (err) {
        console.error('Error loading course or lessons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading) return <div className="loading">Loading course...</div>;
  if (!course) return <div className="not-found">Course not found</div>;

  const visibleLessons = lessons;

  const backLink = isInstructor
    ? '/instructor/dashboard'
    : '/student/dashboard';

  return (
    <div className="course-view-container">
      <div className="course-header">
        <Link to={backLink} className="back-link">
          ← Back
        </Link>

        <h1>{course.courseName}</h1>

        {course.description && (
          <p className="course-desc">{course.description}</p>
        )}

        {course.duration && (
          <span className="course-duration">
            Duration: {course.duration}
          </span>
        )}
      </div>

      <div className="lessons-list">
        <h2>Lessons ({visibleLessons.length})</h2>

        {visibleLessons.length === 0 ? (
          <p
            className="empty-lessons"
            style={{ textAlign: 'center', padding: '3rem 0', color: '#666' }}
          >
            {isInstructor
              ? 'This course has no lessons yet. Add the first lesson in the management section.'
              : 'This course has no lessons yet.'}
          </p>
        ) : (
          <div className="lessons-grid">
            {visibleLessons.map((lesson, index) => (
              <div key={lesson.lessonId} className="lesson-card">
                <div className="lesson-number">
                  Lesson {index + 1}
                </div>

                <h3>{lesson.lessonName}</h3>

              
                {lesson.youtubeUrl ? (
                  <div className="video-thumbnail">
                    <img
                      src={`https://img.youtube.com/vi/${getYouTubeId(
                        lesson.youtubeUrl
                      )}/hqdefault.jpg`}
                      alt={lesson.lessonName}
                    />
                    <div className="play-icon">▶</div>
                  </div>
                ) : (
                  <div className="no-video">Text Lesson</div>
                )}

                {lesson.content && (
                  <p className="lesson-preview">
                    {lesson.content}
                  </p>
                )}

                {/* Start lesson (students only) */}
                {!isInstructor && (
                  <Link
                    to={`/courses/${courseId}/lesson/${lesson.lessonId}`}
                    className="continue-btn"
                    style={{ marginTop: 'auto', textAlign: 'center' }}
                  >
                    Start Lesson →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getYouTubeId(url) {
  if (!url) return 'dQw4w9WgXcQ';
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match ? match[1] : 'dQw4w9WgXcQ';
}
