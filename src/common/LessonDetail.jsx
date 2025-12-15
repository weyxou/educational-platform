// src/pages/common/LessonDetail.jsx
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
        ← Back to Course
      </Link>

      {/* Video */}
      {lesson.youtubeUrl && (
        <div className="video-container">
          <iframe
            src={`https://www.youtube.com/embed/${getYouTubeId(
              lesson.youtubeUrl
            )}`}
            title={lesson.lessonName}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Lesson info */}
      <div className="lesson-info">
        <h1>{lesson.lessonName}</h1>

        {lesson.lessonDescription && (
          <p className="lesson-description">
            {lesson.lessonDescription}
          </p>
        )}

        {lesson.content && (
          <div className="lesson-content">
            {lesson.content}
          </div>
        )}
      </div>
    </div>
  );
}

function getYouTubeId(url) {
  if (!url) return '';
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match ? match[1] : '';
}
