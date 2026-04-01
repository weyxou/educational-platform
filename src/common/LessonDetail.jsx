import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import './LessonDetail.css';

export default function LessonDetail() {
  const { lessonId, courseId } = useParams();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/lesson/lesson_id/${lessonId}`);
        setLesson(res.data);
      } catch (err) {
        console.error('Error loading lesson:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  if (loading) return <div className="loading">Loading lesson...</div>;
  if (!lesson) return <div className="not-found">Lesson not found</div>;

  return (
    <div className="lesson-detail-container">
      <Link to={`/courses/${courseId}/view`} className="back-link">
      Back to Course
      </Link>

      <div className="lesson-info">
        <h1>
          {lesson.lessonOrder ? `Lesson ${lesson.lessonOrder}: ` : ''}
          {lesson.lessonName}
        </h1>

        {lesson.lessonDescription && (
          <p className="lesson-description">{lesson.lessonDescription}</p>
        )}

        {lesson.content && (
          <div
            className="lesson-content"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        )}

        {isInstructor && (
          <div className="otp-section">
            <p><strong>Lesson OTP:</strong> {lesson.otp ?? 'Not generated'}</p>
          </div>
        )}

        <div className="lesson-meta">
          <p><strong>Created:</strong> {new Date(lesson.createdAt).toLocaleString()}</p>
          <p><strong>Updated:</strong> {new Date(lesson.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
