// src/pages/instructor/ManageLessons.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import './InstructorDashboard.css';

export default function ManageLessons() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);

  // Форма нового урока
  const [newLesson, setNewLesson] = useState({
    title: '',
    content: '',
    youtubeUrl: ''
  });

  // Модалка редактирования
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  // Загрузка уроков
  useEffect(() => {
    api.get(`/lesson/get_all_lessons/${Number(courseId)}`)
      .then(res => setLessons(res.data))
      .catch(err => {
        console.error(err);
        alert('Failed to load lessons');
      });
  }, [courseId]);

  // Валидация YouTube URL
  const isValidYouTubeUrl = (url) => {
    if (!url) return true;
    const regExp = /^(https?:\/\/)?(www\.)?(youtube\.com\/(embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return regExp.test(url.trim());
  };

  // Извлечение YouTube ID
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Thumbnail
  const getThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  };

  // Добавление урока
  const createLesson = async () => {
    if (!newLesson.title.trim()) {
      alert('Please enter a lesson title');
      return;
    }
    if (newLesson.youtubeUrl && !isValidYouTubeUrl(newLesson.youtubeUrl)) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    try {
      const dto = {
        lessonName: newLesson.title.trim(),
        content: newLesson.content.trim() || null,
        youtubeUrl: newLesson.youtubeUrl.trim() || null,
        courseId: Number(courseId)
      };

      const res = await api.post('/lesson/add_lesson', dto);
      setLessons([...lessons, res.data]);
      setNewLesson({ title: '', content: '', youtubeUrl: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to add lesson');
    }
  };

  // Открытие модалки редактирования
  const openEditModal = (lesson) => {
    setEditingLesson({ ...lesson });
    setIsEditModalOpen(true);
  };

  // Сохранение изменений
  const saveLessonChanges = async (e) => {
    e.preventDefault();
    if (editingLesson.youtubeUrl && !isValidYouTubeUrl(editingLesson.youtubeUrl)) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    try {
      const updatedDto = {
        lessonName: editingLesson.lessonName.trim(),
        content: editingLesson.content?.trim() || null,
        youtubeUrl: editingLesson.youtubeUrl?.trim() || null,
        courseId: Number(courseId)
      };

      await api.put(`/lesson/update/lesson_id/${editingLesson.lessonId}`, updatedDto);

      setLessons(lessons.map(l =>
        l.lessonId === editingLesson.lessonId
          ? { ...l, ...updatedDto }
          : l
      ));
      setIsEditModalOpen(false);
      alert('Lesson updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update lesson');
    }
  };

  // Удаление урока
  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;

    try {
      await api.delete(`/lesson/delete/lesson_id/${lessonId}/course_id/${Number(courseId)}`);
      setLessons(lessons.filter(l => l.lessonId !== lessonId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete lesson');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="page-card">
        <h2 className="page-title">Lessons for Course ID: {courseId}</h2>

        {/* Форма добавления урока */}
        <section className="courses-section" style={{ marginBottom: '3rem' }}>
          <div className="section-header">
            <h3>Add New Lesson</h3>
          </div>

          <div className="course-form" style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem', background: '#f9f9f9', borderRadius: '12px' }}>
            <div className="form-group">
              <label>Title <span style={{ color: 'red' }}>*</span></label>
              <input
                className="form-input"
                placeholder="Enter lesson title"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Text Content (optional)</label>
              <textarea
                rows="3"
                className="form-textarea"
                placeholder="Enter text content"
                value={newLesson.content}
                onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>YouTube Video URL (optional)</label>
              <input
                className="form-input"
                placeholder="https://www.youtube.com/watch?v=..."
                value={newLesson.youtubeUrl}
                onChange={(e) => setNewLesson({ ...newLesson, youtubeUrl: e.target.value })}
              />
            </div>

            <div className="form-actions">
              <button onClick={createLesson} className="btn btn-primary">Add Lesson</button>
            </div>
          </div>
        </section>

        {/* Список уроков */}
        <section className="courses-section">
          <div className="section-header">
            <h3>Existing Lessons ({lessons.length})</h3>
          </div>

          {lessons.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
              No lessons yet. Add your first one above!
            </p>
          ) : (
            <div className="courses-grid">
              {lessons.map(lesson => {
                const thumbnail = getThumbnail(lesson.youtubeUrl);

                return (
                  <div key={lesson.lessonId} className="course-item">
                    <div
                      className="course-thumb"
                      style={{
                        background: thumbnail ? `url(${thumbnail})` : '#e0e0e0',
                        backgroundSize: thumbnail ? 'cover' : 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        height: '180px',
                        borderRadius: '12px 12px 0 0',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {!thumbnail && (
                        <div style={{ textAlign: 'center', color: '#999' }}>
                          <div style={{ fontSize: '48px', marginBottom: '8px' }}>📄</div>
                          <div style={{ fontSize: '14px' }}>Text Lesson</div>
                        </div>
                      )}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '12px 12px 0 0'
                      }}>
                        <div style={{
                          width: 64,
                          height: 64,
                          background: 'rgba(255,255,255,0.95)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '32px',
                          color: '#333'
                        }}>▶</div>
                      </div>
                    </div>

                    <div className="course-main" style={{ padding: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{lesson.lessonName}</h4>
                    </div>

                    <div className="course-actions" style={{ padding: '0 1rem 1rem', display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEditModal(lesson)}
                        className="action-btn btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteLesson(lesson.lessonId)}
                        className="action-btn btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Модалка редактирования урока */}
        {isEditModalOpen && editingLesson && (
          <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Edit Lesson</h2>
              <form onSubmit={saveLessonChanges} className="course-form">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    className="form-input"
                    value={editingLesson.lessonName || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, lessonName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Text Content (optional)</label>
                  <textarea
                    rows="4"
                    className="form-textarea"
                    value={editingLesson.content || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, content: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>YouTube Video URL (optional)</label>
                  <input
                    className="form-input"
                    value={editingLesson.youtubeUrl || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, youtubeUrl: e.target.value })}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Кнопка назад */}
        <div className="form-actions" style={{ marginTop: '4rem', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/instructor/dashboard')}
            className="btn btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
