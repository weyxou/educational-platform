import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import './ManageLessons.css';
import './InstructorDashboard.css';

export default function ManageLessons() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    content: '',
    order: '',
  });

  const [editingLesson, setEditingLesson] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get(`/lesson/get_all_lessons/${courseId}`);
        setLessons(res.data || []);
      } catch (err) {
        console.error('Failed to load lessons:', err);
        setError('Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [courseId]);

  // CREATE
  const createLesson = async () => {
    if (!newLesson.title.trim()) {
      alert('Please enter a lesson title');
      return;
    }
    try {
      const dto = {
        lessonName: newLesson.title.trim(),
        lessonDescription: newLesson.description.trim() || null,
        lessonOrder: newLesson.order ? Number(newLesson.order) : null,
        content: newLesson.content.trim() || null,
        courseId: Number(courseId),
      };
      const res = await api.post('/lesson/add_lesson', dto);
      setLessons([...lessons, res.data]);
      setNewLesson({ title: '', description: '', content: '', order: '' });
      alert('Lesson added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to add lesson');
    }
  };

  // UPDATE
  const openEditLessonModal = (lesson) => {
    setEditingLesson({
      ...lesson,
      title: lesson.lessonName,
      description: lesson.lessonDescription,
      content: lesson.content,
      order: lesson.lessonOrder,
    });
    setIsEditModalOpen(true);
  };

  const saveLessonChanges = async (e) => {
    e.preventDefault();
    try {
      const updatedDto = {
        lessonName: editingLesson.title.trim(),
        lessonDescription: editingLesson.description?.trim() || null,
        lessonOrder: editingLesson.order ? Number(editingLesson.order) : null,
        content: editingLesson.content?.trim() || null,
      };
      await api.put(`/lesson/update/lesson_id/${editingLesson.lessonId}`, updatedDto);
      setLessons((prev) =>
        prev.map((l) =>
          l.lessonId === editingLesson.lessonId ? { ...l, ...updatedDto } : l
        )
      );
      setIsEditModalOpen(false);
      alert('Lesson updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update lesson');
    }
  };

  // DELETE
  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/lesson/delete/lesson_id/${lessonId}/course_id/${Number(courseId)}`);
      setLessons(lessons.filter((l) => l.lessonId !== lessonId));
      alert('Lesson deleted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to delete lesson');
    }
  };

  // MEDIA
  function extractYouTubeId(url) {
    const match = url.match(/(?:youtu\.be\/|watch\?v=|embed\/)([^&\n?#]+)/);
    return match ? match[1] : url;
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File is too large. Maximum size is 50MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Unsupported file type. Please upload images, MP4 videos, or PDF files.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);

    try {
      const res = await api.post('/lesson/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      });

      const fileUrl = res.data;
      const tag = getEmbedTag(fileUrl, file.name);

      setNewLesson({
        ...newLesson,
        content: (newLesson.content || '') + '\n' + tag,
      });

      alert('File uploaded successfully!');
    } catch (err) {
      console.error(err);

      if (err.response?.status === 500) {
        alert('Server error during file upload. Try again later.');
      } else if (err.response?.status === 413) {
        alert('File is too large for the server.');
      } else if (err.code === 'ECONNABORTED') {
        alert('Upload timeout exceeded. Try a smaller file.');
      } else {
        alert(`Upload error: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const getEmbedTag = (url, name) => {
    if (url.endsWith('.mp4'))
      return `<video controls style="width:100%" src="${url}"></video>`;
    if (url.endsWith('.pdf'))
      return `<iframe src="${url}" width="100%" height="500px"></iframe>`;
    if (url.match(/\.(jpg|jpeg|png|gif)$/))
      return `<img src="${url}" alt="${name}" style="max-width:100%; border-radius:8px"/>`;
    return `<a href="${url}" target="_blank">${name}</a>`;
  };

  if (loading) return <div className="loading-state">Loading lessons...</div>;
  if (error) return <div className="error">{error}</div>;

  const sortedLessons = [...lessons].sort((a, b) => a.lessonOrder - b.lessonOrder);

  return (
    <div className="dashboard-container">
      <div className="page-card">
        <h2 className="page-title">Manage Lessons</h2>

        <section className="courses-section" style={{ marginBottom: '3rem' }}>
          <div className="section-header">
            <h3>Add New Lesson</h3>
          </div>

          <div className="course-form">
            <div className="form-group">
              <label>Lesson Title *</label>
              <input
                className="form-input"
                value={newLesson.title}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, title: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-textarea"
                value={newLesson.description}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, description: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Content (Text / HTML)</label>
              <textarea
                rows="5"
                className="form-textarea"
                placeholder="Enter text or HTML, including images, videos, etc."
                value={newLesson.content}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, content: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Add media (optional)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    const url = prompt(
                      'Enter media URL (YouTube, MP4, image, PDF, etc.):'
                    );
                    if (!url) return;
                    let tag;
                    if (url.endsWith('.mp4')) {
                      tag = `<video controls style="width:100%" src="${url}"></video>`;
                    } else if (url.includes('youtube')) {
                      const youtubeId = extractYouTubeId(url);
                      tag = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allowfullscreen></iframe>`;
                    } else if (url.match(/\.(jpg|jpeg|png|gif)$/)) {
                      tag = `<img src="${url}" alt="media" style="max-width:100%; border-radius:8px"/>`;
                    } else if (url.endsWith('.pdf')) {
                      tag = `<iframe src="${url}" width="100%" height="500px"></iframe>`;
                    } else {
                      tag = `<a href="${url}" target="_blank">${url}</a>`;
                    }

                    setNewLesson({
                      ...newLesson,
                      content: (newLesson.content || '') + '\n' + tag,
                    });
                  }}
                >
                  ➕ Add link/embed
                </button>

                <label
                  htmlFor="fileUpload"
                  className={`btn btn-secondary ${uploading ? 'disabled' : ''}`}
                  style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}
                >
                  {uploading ? '⏳ Uploading...' : '📁 Upload file'}
                </label>
                <input
                  type="file"
                  id="fileUpload"
                  style={{ display: 'none' }}
                  accept="image/*,video/*,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>
              <small style={{ color: '#64748b' }}>
                Insert YouTube/Google Drive links or upload MP4, images, PDF.
              </small>
            </div>

            <div className="form-group">
              <label>Lesson Order (optional)</label>
              <input
                type="number"
                className="form-input"
                value={newLesson.order}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, order: e.target.value })
                }
              />
            </div>

            <div className="form-actions">
              <button onClick={createLesson} className="btn btn-primary">
                Add Lesson
              </button>
            </div>
          </div>
        </section>

        <section className="courses-section">
          <div className="section-header">
            <h3>Existing Lessons ({sortedLessons.length})</h3>
          </div>

          {sortedLessons.length === 0 ? (
            <div className="empty-state">No lessons yet.</div>
          ) : (
            <div className="courses-grid">
              {sortedLessons.map((lesson) => (
                <div key={lesson.lessonId} className="course-item">
                  <div className="course-thumb">
                    <div className="lesson-order">
                      #{lesson.lessonOrder || '?'}
                    </div>
                  </div>

                  <div className="course-main">
                    <h4>{lesson.lessonName}</h4>
                    {lesson.lessonDescription && (
                      <p>{lesson.lessonDescription.substring(0, 100)}...</p>
                    )}
                    <p className="meta">
                      OTP: <strong>{lesson.otp}</strong>
                    </p>
                    <p className="meta">
                      Updated: {new Date(lesson.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="course-actions">
                    <button
                      onClick={() => openEditLessonModal(lesson)}
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
              ))}
            </div>
          )}
        </section>

        {isEditModalOpen && editingLesson && (
          <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Edit Lesson</h2>
              <form onSubmit={saveLessonChanges} className="course-form">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    className="form-input"
                    value={editingLesson.title}
                    onChange={(e) =>
                      setEditingLesson({
                        ...editingLesson,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button
                    onClick={() => navigate('/instructor/dashboard')}
                    className="btn btn-secondary"
                  >
                    ← Back to Dashboard
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}