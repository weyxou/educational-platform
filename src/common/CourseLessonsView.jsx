// src/pages/common/CourseLessonsView.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import './CourseLessonsView.css';

export default function CourseLessonsView() {
  const { courseId } = useParams();
  const { user } = useAuth(); // Получаем текущего пользователя и его роль

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загружаем курс
        const courseRes = await api.get(`/course/course_id/${courseId}`);
        setCourse(courseRes.data);

        // Загружаем все уроки
        const lessonsRes = await api.get(`/lesson/get_all_lessons/${courseId}`);
        setLessons(lessonsRes.data);
      } catch (err) {
        console.error('Ошибка загрузки курса или уроков:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading) return <div className="loading">Загрузка курса...</div>;
  if (!course) return <div className="not-found">Курс не найден</div>;

  // Убираем фильтрацию по статусу: все уроки видны
  const visibleLessons = lessons;

  const backLink = isInstructor
    ? '/instructor/dashboard'
    : '/student/dashboard';

  return (
    <div className="course-view-container">
      <div className="course-header">
        <Link to={backLink} className="back-link">
          ← Назад
        </Link>
        <h1>{course.courseName}</h1>
        {course.description && <p className="course-desc">{course.description}</p>}
        {course.duration && <span className="course-duration">Продолжительность: {course.duration}</span>}
      </div>

      <div className="lessons-list">
        <h2>
          Уроки ({visibleLessons.length})
        </h2>

        {visibleLessons.length === 0 ? (
          <p className="empty-lessons" style={{ textAlign: 'center', padding: '3rem 0', color: '#666' }}>
            {isInstructor
              ? 'В этом курсе пока нет уроков. Добавьте первый урок в разделе управления.'
              : 'В этом курсе пока нет уроков.'}
          </p>
        ) : (
          <div className="lessons-grid">
            {visibleLessons.map((lesson, index) => (
              <div key={lesson.lessonId} className="lesson-card">
                <div className="lesson-number">Урок {index + 1}</div>
                <h3>{lesson.lessonName}</h3>

                {/* Статус урока — видно только инструктору */}
                {isInstructor && (
                  <span
                    className={`status-badge ${lesson.status === 'Published' ? 'active' : 'inactive'}`}
                    style={{ fontSize: '0.8rem', marginBottom: '8px', display: 'inline-block' }}
                  >
                    {lesson.status || 'Draft'}
                  </span>
                )}

                {lesson.youtubeUrl ? (
                  <div className="video-thumbnail">
                    <img
                      src={`https://img.youtube.com/vi/${getYouTubeId(lesson.youtubeUrl)}/hqdefault.jpg`}
                      alt={lesson.lessonName}
                    />
                    <div className="play-icon">▶</div>
                  </div>
                ) : (
                  <div className="no-video">Текстовый урок</div>
                )}

                {lesson.content && <p className="lesson-preview">{lesson.content}</p>}

                {/* Кнопка "Начать урок" для студентов */}
                {!isInstructor && (
                  <button className="continue-btn" style={{ marginTop: 'auto' }}>
                    Начать урок
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Вспомогательная функция для извлечения YouTube ID
function getYouTubeId(url) {
  if (!url) return 'dQw4w9WgXcQ'; // fallback
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match ? match[1] : 'dQw4w9WgXcQ';
}