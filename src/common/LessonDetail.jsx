import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import './LessonDetail.css';

export default function LessonDetail() {
  const { lessonId, courseId } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allLessons, setAllLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState({});
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';

  const getUserId = () => {
    if (user?.userId) return user.userId;
    if (user?.id) return user.id;
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.userId || decoded.id || decoded.sub || null;
    } catch {
      return null;
    }
  };
  const userId = getUserId();

  const extractData = (response) => {
    const data = response.data;
    return Array.isArray(data) ? data : (data?.content || []);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonRes, lessonsRes] = await Promise.all([
          api.get(`/lesson/lesson_id/${lessonId}`),
          api.get(`/lesson/get_all_lessons/${courseId}`)
        ]);
        setLesson(lessonRes.data);
        const lessonsArray = extractData(lessonsRes);
        const sorted = lessonsArray.sort((a, b) => a.lessonOrder - b.lessonOrder);
        setAllLessons(sorted);
      } catch (err) {
        console.error('Error loading lesson data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lessonId, courseId]);

  useEffect(() => {
    if (!courseId || !userId) return;
    const progressKey = `progress_${courseId}_${userId}`;
    const savedProgress = localStorage.getItem(progressKey);
    if (savedProgress) {
      setCompletedLessons(JSON.parse(savedProgress));
    }
  }, [courseId, userId]);

  useEffect(() => {
    if (!courseId || !userId || !lessonId) return;
    const notesKey = `notes_${courseId}_${lessonId}_${userId}`;
    const savedNote = localStorage.getItem(notesKey);
    if (savedNote) setNote(savedNote);
  }, [courseId, userId, lessonId]);

  useEffect(() => {
    if (!courseId || !userId || !lessonId) return;
    const timer = setTimeout(() => {
      const notesKey = `notes_${courseId}_${lessonId}_${userId}`;
      localStorage.setItem(notesKey, note);
      setSavingNote(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [note, courseId, userId, lessonId]);

  const handleNoteChange = (e) => {
    setSavingNote(true);
    setNote(e.target.value);
  };

  const toggleCompleted = () => {
    if (!courseId || !userId || !lessonId) return;
    const newCompleted = !completedLessons[lessonId];
    const updated = { ...completedLessons, [lessonId]: newCompleted };
    setCompletedLessons(updated);
    const progressKey = `progress_${courseId}_${userId}`;
    localStorage.setItem(progressKey, JSON.stringify(updated));
  };

  const currentIndex = allLessons.findIndex(l => l.lessonId === parseInt(lessonId));
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (authLoading || loading) return <div className="loading">Loading lesson...</div>;
  if (!lesson) return <div className="not-found">Lesson not found</div>;

  return (
    <div className="lesson-detail-container">
      <div className="container-full">
        <Link to={`/courses/${courseId}/view`} className="back-link">
          Back to Course
        </Link>

        <div className="three-columns">
          <aside className="lessons-sidebar">
            <h3>Course content</h3>
            <ul className="sidebar-lesson-list">
              {allLessons.map((l, idx) => (
                <li key={l.lessonId}>
                  <Link
                    to={`/courses/${courseId}/lesson/${l.lessonId}`}
                    className={`sidebar-lesson-link ${l.lessonId === lesson.lessonId ? 'active' : ''}`}
                  >
                    <span className="lesson-index">{idx + 1}</span>
                    <span className="lesson-name">{l.lessonName}</span>
                    {completedLessons[l.lessonId] && <span className="check-mark">✓</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <main className="lesson-main">
            <div className="lesson-header">
              <div className="lesson-header-top">
                <span className="lesson-badge">
                  {lesson.lessonOrder ? `Lesson ${lesson.lessonOrder}` : 'Lesson'}
                </span>
                {!isInstructor && (
                  <button
                    className={`complete-btn ${completedLessons[lesson.lessonId] ? 'completed' : ''}`}
                    onClick={toggleCompleted}
                  >
                    {completedLessons[lesson.lessonId] ? 'Completed ✓' : 'Mark as Completed'}
                  </button>
                )}
              </div>
              <h1 className="lesson-title">{lesson.lessonName}</h1>
              {lesson.lessonDescription && (
                <p className="lesson-description">{lesson.lessonDescription}</p>
              )}
            </div>

            {lesson.videoUrl && (
              <div className="video-section">
                <div className="video-wrapper">
                  <iframe
                    src={lesson.videoUrl}
                    title={lesson.lessonName}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {lesson.content && (
              <div className="content-section">
                <div
                  className="lesson-content"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              </div>
            )}

            {isInstructor && (
              <div className="otp-section">
                <strong>Lesson OTP:</strong> {lesson.otp ?? 'Not generated'}
              </div>
            )}

            <div className="meta-section">
              <div className="meta-item">
                <span className="meta-label">Created</span>
                <span className="meta-value">{new Date(lesson.createdAt).toLocaleString()}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Updated</span>
                <span className="meta-value">{new Date(lesson.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="navigation-section">
              {prevLesson ? (
                <Link to={`/courses/${courseId}/lesson/${prevLesson.lessonId}`} className="nav-link prev">
                  ← Previous: {prevLesson.lessonName}
                </Link>
              ) : (
                <span className="nav-link disabled">← No previous lesson</span>
              )}
              {nextLesson ? (
                <Link to={`/courses/${courseId}/lesson/${nextLesson.lessonId}`} className="nav-link next">
                  Next: {nextLesson.lessonName} →
                </Link>
              ) : (
                <span className="nav-link disabled">No next lesson →</span>
              )}
            </div>
          </main>

          {!isInstructor && (
            <aside className="notes-sidebar">
              <div className="notes-section">
                <div className="notes-header">
                  <h3>My notes</h3>
                  {savingNote && <span className="saving-indicator">Saving...</span>}
                </div>
                <textarea
                  className="notes-textarea"
                  value={note}
                  onChange={handleNoteChange}
                  placeholder="Write your personal notes here... (saved automatically)"
                  rows={12}
                />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}