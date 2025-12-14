// src/pages/common/LessonDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function LessonDetail() {
  const { lessonId, courseId } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/lesson/${lessonId}`);
        setLesson(res.data);
      } catch (err) {
        console.error('Ошибка загрузки урока:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  if (loading) return <div className="loading">Загрузка урока...</div>;
  if (!lesson) return <div className="not-found">Урок не найден</div>;

  return (
    <div className="lesson-detail-container">
      <Link to={`/courses/${courseId}/view`} className="back-link">
        ← Назад к курсу
      </Link>

      <h1>{lesson.lessonName}</h1>

      {isInstructor && (
        <span className={`status-badge ${lesson.status === 'Published' ? 'active' : 'inactive'}`}>
          {lesson.status || 'Draft'}
        </span>
      )}

      {lesson.youtubeUrl && (
        <div className="video-container">
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${getYouTubeId(lesson.youtubeUrl)}`}
            title={lesson.lessonName}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {lesson.content && <p className="lesson-content">{lesson.content}</p>}
    </div>
  );
}

function getYouTubeId(url) {
  if (!url) return '';
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : '';
}
