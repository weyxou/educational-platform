import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import './CourseLessonsView.css';

export default function CourseLessonsView() {
  const { courseId } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState({});
  const [lastOpenedLessonId, setLastOpenedLessonId] = useState(null);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.userId || decoded.id || decoded.sub || decoded.user_id || null;
    } catch (err) {
      return null;
    }
  };

  const userId = user?.userId || user?.id || getUserIdFromToken();
  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await api.get(`/course/course_id/${courseId}`);
        setCourse(courseRes.data);
        const lessonsRes = await api.get(`/lesson/get_all_lessons/${courseId}`);
        setLessons(lessonsRes.data || []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  useEffect(() => {
    if (!courseId || !userId) return;
    const progressKey = `progress_${courseId}_${userId}`;
    const lastLessonKey = `last_lesson_${courseId}_${userId}`;
    const savedProgress = localStorage.getItem(progressKey);
    if (savedProgress) {
      setCompletedLessons(JSON.parse(savedProgress));
    }
    const lastLesson = localStorage.getItem(lastLessonKey);
    if (lastLesson) {
      setLastOpenedLessonId(lastLesson);
    }
  }, [courseId, userId]);

  useEffect(() => {
    const handleFocus = () => {
      if (!courseId || !userId) return;
      const savedProgress = localStorage.getItem(`progress_${courseId}_${userId}`);
      if (savedProgress) setCompletedLessons(JSON.parse(savedProgress));
      const lastLesson = localStorage.getItem(`last_lesson_${courseId}_${userId}`);
      if (lastLesson) setLastOpenedLessonId(lastLesson);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [courseId, userId]);

  const sortedLessons = [...lessons].sort((a, b) => a.lessonOrder - b.lessonOrder);

  const handleLessonComplete = (lessonId, isComplete) => {
    const newCompleted = { ...completedLessons, [lessonId]: isComplete };
    setCompletedLessons(newCompleted);
    if (courseId && userId) {
      const key = `progress_${courseId}_${userId}`;
      localStorage.setItem(key, JSON.stringify(newCompleted));
    }
  };

  const handleLastLesson = (lessonId) => {
    if (courseId && userId) {
      const key = `last_lesson_${courseId}_${userId}`;
      localStorage.setItem(key, lessonId);
      setLastOpenedLessonId(lessonId);
    }
  };

  const getContinueLessonId = () => {
    if (sortedLessons.length === 0) return null;
    const firstIncomplete = sortedLessons.find(lesson => !completedLessons[lesson.lessonId]);
    return firstIncomplete ? firstIncomplete.lessonId : sortedLessons[sortedLessons.length - 1].lessonId;
  };

  const continueLessonId = getContinueLessonId();
  const completedCount = sortedLessons.filter(lesson => completedLessons[lesson.lessonId]).length;
  const progressPercentage = sortedLessons.length > 0 ? (completedCount / sortedLessons.length) * 100 : 0;

  if (authLoading || loading) return <div className="loading-state">Loading course...</div>;
  if (!course) return <div className="empty-state">Course not found</div>;

  return (
    <div className="course-lessons-view">
      <div className="container">
        <Link to={isInstructor ? '/instructor/dashboard' : '/student/dashboard'} className="back-button">
          ← Back to Dashboard
        </Link>

        <div className="course-header">
          <h1>{course.courseName}</h1>
          {course.description && <p className="course-description">{course.description}</p>}
        </div>

        {!isInstructor && sortedLessons.length > 0 && (
          <div className="progress-section">
            <div className="progress-info">
              <span>Your Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            {continueLessonId ? (
              <Link
                to={`/courses/${courseId}/lesson/${continueLessonId}`}
                className="continue-btn"
                onClick={() => handleLastLesson(continueLessonId)}
              >
                ▶ Continue Learning
              </Link>
            ) : (
              <button className="continue-btn disabled" disabled>No lessons available</button>
            )}
          </div>
        )}

        <div className="lessons-layout">
          <aside className="lessons-toc">
            <h3>📖 Contents</h3>
            <ul className="toc-list">
              {sortedLessons.map((lesson, idx) => (
                <li key={lesson.lessonId}>
                  <Link
                    to={`/courses/${courseId}/lesson/${lesson.lessonId}`}
                    onClick={() => handleLastLesson(lesson.lessonId)}
                    className={`toc-link ${completedLessons[lesson.lessonId] ? 'completed' : ''}`}
                  >
                    <span className="toc-index">{idx + 1}</span>
                    <span className="toc-title">{lesson.lessonName}</span>
                    {completedLessons[lesson.lessonId] && <span className="check-mark">✓</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <div className="lessons-content">
            <div className="section-title">
              <h2>Lessons</h2>
              <span className="lessons-count">{sortedLessons.length} lessons</span>
            </div>

            {sortedLessons.length === 0 ? (
              <div className="empty-state">No lessons yet. Check back later!</div>
            ) : (
              <div className="lessons-grid">
                {sortedLessons.map((lesson) => (
                  <div key={lesson.lessonId} className="lesson-card">
                    <div className="lesson-card-header">
                      <div className="lesson-order">Lesson {lesson.lessonOrder || '?'}</div>
                    </div>
                    <div className="lesson-card-body">
                      <h3>{lesson.lessonName}</h3>
                      {lesson.lessonDescription && <p className="lesson-description">{lesson.lessonDescription}</p>}
                      <div className="lesson-meta">
                        <span>📅 {new Date(lesson.createdAt).toLocaleDateString()}</span>
                        {completedLessons[lesson.lessonId] && <span className="completed-badge">Completed</span>}
                      </div>
                      <div className="lesson-actions">
                        <Link
                          to={`/courses/${courseId}/lesson/${lesson.lessonId}`}
                          className="lesson-link"
                          onClick={() => handleLastLesson(lesson.lessonId)}
                        >
                          {isInstructor ? 'Manage Lesson →' : 'Start Lesson →'}
                        </Link>
                        {!isInstructor && (
                          <button
                            className={`complete-toggle ${completedLessons[lesson.lessonId] ? 'completed' : ''}`}
                            onClick={() => handleLessonComplete(lesson.lessonId, !completedLessons[lesson.lessonId])}
                          >
                            {completedLessons[lesson.lessonId] ? '✓ Completed' : 'Mark Complete'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}