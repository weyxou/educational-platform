import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { useNotification } from '../../context/AlertCustom';
import './ManageLessons.css';

export default function ManageLessons() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { showToast, confirm } = useNotification();
  const [activeTab, setActiveTab] = useState('lessons');

  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', description: '', content: '', order: '' });
  const [editingLesson, setEditingLesson] = useState(null);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);

  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '' });
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isEditAssignmentModalOpen, setIsEditAssignmentModalOpen] = useState(false);

  // Состояния для кастомного модального окна (вместо prompt)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [pendingMediaCallback, setPendingMediaCallback] = useState(null);

  const extractData = (response) => {
    const data = response.data;
    return Array.isArray(data) ? data : (data?.content || []);
  };

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get(`/lesson/get_all_lessons/${courseId}`);
        setLessons(extractData(res));
      } catch (err) {
        console.error(err);
        showToast('Failed to load lessons', 'error');
      } finally {
        setLoadingLessons(false);
      }
    };
    fetchLessons();
  }, [courseId, showToast]);

  useEffect(() => {
    const loadAssignmentsFromApi = async () => {
      try {
        const res = await api.get(`/assignment/course/${courseId}`);
        setAssignments(extractData(res));
      } catch (err) {
        console.error('Failed to load assignments:', err);
        showToast('Failed to load assignments', 'error');
      } finally {
        setLoadingAssignments(false);
      }
    };
    loadAssignmentsFromApi();
  }, [courseId, showToast]);

  const createLesson = async () => {
    if (!newLesson.title.trim()) {
      showToast('Please enter a lesson title', 'error');
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
      showToast('Lesson added successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to add lesson', 'error');
    }
  };

  const openEditLessonModal = (lesson) => {
    setEditingLesson({
      ...lesson,
      title: lesson.lessonName,
      description: lesson.lessonDescription,
      content: lesson.content,
      order: lesson.lessonOrder,
    });
    setIsEditLessonModalOpen(true);
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
      setIsEditLessonModalOpen(false);
      showToast('Lesson updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update lesson', 'error');
    }
  };

 const deleteLesson = (lessonId) => {
  confirm('Delete this lesson?', async () => {
    try {
    
await api.delete(`/lesson/delete/lesson_id/${lessonId}`);      
      setLessons(lessons.filter((l) => l.lessonId !== lessonId));
      showToast('Lesson deleted successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete lesson', 'error');
    }
  }, 'Delete Lesson');
};

  const createAssignment = async () => {
    if (!newAssignment.title.trim()) {
      showToast('Please enter assignment title', 'error');
      return;
    }
    try {
      const payload = {
        courseId: parseInt(courseId, 10),
        assignmentTitle: newAssignment.title.trim(),
        assignmentDescription: newAssignment.description.trim() || '',
        dueDate: newAssignment.dueDate ? new Date(newAssignment.dueDate).toISOString() : null
      };
      const res = await api.post('/assignment/add_assignment', payload);
      setAssignments(prev => [...prev, res.data]);
      setNewAssignment({ title: '', description: '', dueDate: '' });
      showToast('Assignment created successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to create assignment', 'error');
    }
  };

  const openEditAssignmentModal = (assign) => {
    setEditingAssignment({ ...assign });
    setIsEditAssignmentModalOpen(true);
  };

  const saveAssignmentChanges = async (e) => {
    e.preventDefault();
    showToast('Editing not yet implemented on backend. Please delete and recreate.', 'info');
    setIsEditAssignmentModalOpen(false);
  };

  const deleteAssignmentHandler = (assignmentId) => {
    confirm('Delete this assignment? All submissions will be lost.', async () => {
      try {
        await api.delete(`/assignment/${assignmentId}`);
        setAssignments(prev => prev.filter(a => a.assignmentId !== assignmentId));
        showToast('Assignment deleted', 'success');
      } catch (err) {
        console.error(err);
        showToast('Failed to delete assignment', 'error');
      }
    }, 'Delete Assignment');
  };

  function extractYouTubeId(url) {
    const match = url.match(/(?:youtu\.be\/|watch\?v=|embed\/)([^&\n?#]+)/);
    return match ? match[1] : url;
  }

  // Функция для получения embed тега (без prompt)
  const getEmbedTagFromUrl = (url) => {
    if (!url) return '';
    if (url.endsWith('.mp4')) return `<video controls style="width:100%" src="${url}"></video>`;
    if (url.includes('youtube')) {
      const youtubeId = extractYouTubeId(url);
      return `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allowfullscreen></iframe>`;
    }
    if (url.match(/\.(jpg|jpeg|png|gif)$/)) return `<img src="${url}" alt="media" style="max-width:100%; border-radius:8px"/>`;
    if (url.endsWith('.pdf')) return `<iframe src="${url}" width="100%" height="500px"></iframe>`;
    return `<a href="${url}" target="_blank">${url}</a>`;
  };

  // Открыть кастомное модальное окно для ввода ссылки
  const openLinkModal = () => {
    setMediaUrl('');
    setIsLinkModalOpen(true);
  };

  // Добавить медиа по ссылке после ввода
  const handleAddMediaLink = () => {
    if (!mediaUrl.trim()) {
      showToast('Please enter a valid URL', 'error');
      return;
    }
    const tag = getEmbedTagFromUrl(mediaUrl.trim());
    setNewLesson({
      ...newLesson,
      content: (newLesson.content || '') + '\n' + tag,
    });
    showToast('Media added successfully!', 'success');
    setIsLinkModalOpen(false);
    setMediaUrl('');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('File is too large. Maximum size is 50MB', 'error');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Unsupported file type. Please upload images, MP4 videos, or PDF files.', 'error');
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
      const tag = getEmbedTagFromUrl(fileUrl);
      setNewLesson({
        ...newLesson,
        content: (newLesson.content || '') + '\n' + tag,
      });
      showToast('File uploaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast(`Upload error: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const sortedLessons = [...lessons].sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0));

  if (loadingLessons && loadingAssignments) return <div className="loading-state">Loading course content...</div>;

  return (
    <div className="manage-lessons-page">
      <div className="manage-container">
        <div className="page-card">
          <h1 className="page-title">Course Management</h1>
          <div className="tab-bar">
            <button className={`tab-btn ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => setActiveTab('lessons')}>
              Lessons ({lessons.length})
            </button>
            <button className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>
              Assignments ({assignments.length})
            </button>
          </div>

          {activeTab === 'lessons' && (
            <>
              <div className="form-section">
                <div className="course-form">
                  <div className="form-header">
                    <span className="form-header-icon"></span>
                    <h3>Create New Lesson</h3>
                  </div>
                  <div className="form-group">
                    <label>Lesson Title *</label>
                    <input className="form-input" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-textarea" value={newLesson.description} onChange={e => setNewLesson({ ...newLesson, description: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Content (Text / HTML)</label>
                    <textarea rows="4" className="form-textarea" placeholder="Enter text or HTML..." value={newLesson.content} onChange={e => setNewLesson({ ...newLesson, content: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Add Media</label>
                    <div className="media-buttons-group">
                      <button type="button" className="media-btn" onClick={openLinkModal}>
                        Add Link / Embed
                      </button>
                      <label htmlFor="fileUpload" className={`media-btn ${uploading ? 'disabled' : ''}`} 
                      style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
                        {uploading ? 'Uploading...' : 'Upload File'}
                      </label>
                      <input type="file" id="fileUpload" style={{ display: 'none' }}
                       accept="image/*,video/*,application/pdf" onChange={handleFileUpload} disabled={uploading} />
                    </div>
                    <span className="help-text">Supports images, MP4, PDF, YouTube links</span>
                  </div>
                  <div className="form-group">
                    <label>Lesson Order (optional)</label>
                    <input type="number" className="form-input" value={newLesson.order} onChange={e => setNewLesson({ ...newLesson, order: e.target.value })} />
                  </div>
                  <div className="form-actions">
                    <button onClick={createLesson} className="btn btn-primary">Add Lesson</button>
                  </div>
                </div>
              </div>

              <div className="section-header">
                <h3>All Lessons <span className="lessons-count">{sortedLessons.length}</span></h3>
              </div>
              {sortedLessons.length === 0 ? (
                <div className="empty-state">No lessons created yet.</div>
              ) : (
                <div className="courses-grid">
                  {sortedLessons.map(lesson => (
                    <div key={lesson.lessonId} className="course-item">
                      <div className="course-thumb">
                        <div className="lesson-order">{lesson.lessonOrder || '—'}</div>
                      </div>
                      <div className="course-main">
                        <h4>{lesson.lessonName}</h4>
                        {lesson.lessonDescription && <p>{lesson.lessonDescription.substring(0, 100)}...</p>}
                        <div className="meta">
                          <span>OTP: <strong>{lesson.otp}</strong></span>
                          <span>Updated: {new Date(lesson.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="course-actions">
                        <button onClick={() => openEditLessonModal(lesson)} 
                        className="action-btn edit">Edit</button>
                        <button onClick={() => deleteLesson(lesson.lessonId)}
                         className="action-btn delete">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'assignments' && (
            <>
              <div className="form-section">
                <div className="course-form">
                  <div className="form-header">
                    <span className="form-header-icon"></span>
                    <h3>Create New Assignment</h3>
                  </div>
                  <div className="form-group">
                    <label>Assignment Title *</label>
                    <input className="form-input" value={newAssignment.title} 
                    onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-textarea" value={newAssignment.description}
                     onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input type="datetime-local" className="form-input" value={newAssignment.dueDate} 
                    onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} />
                  </div>
                  <div className="form-actions">
                    <button onClick={createAssignment} className="btn btn-primary">Create Assignment</button>
                  </div>
                </div>
              </div>

              <div className="section-header">
                <h3>Assignments <span className="lessons-count">{assignments.length}</span></h3>
              </div>
              {assignments.length === 0 ? (
                <div className="empty-state">No assignments created yet.</div>
              ) : (
                <div className="courses-grid">
                  {assignments.map(assign => (
                    <div key={assign.assignmentId} className="course-item">
                      <div className="course-thumb">
                        <div className="lesson-order">📋</div>
                      </div>
                      <div className="course-main">
                        <h4>{assign.assignmentTitle}</h4>
                        <p>{assign.assignmentDescription?.substring(0, 100) || 'No description'}</p>
                        <div className="meta">
                          <span>Due: {assign.dueDate ? new Date(assign.dueDate).toLocaleString() 
                          : 'No due date'}</span>
                        </div>
                      </div>
                      <div className="course-actions">
                        <Link to={`/courses/${courseId}/assignments/${assign.assignmentId}/submissions`} 
                        className="action-btn submissions">Submissions</Link>
                        <button onClick={() => openEditAssignmentModal(assign)} className="action-btn edit">Edit</button>
                        <button onClick={() => deleteAssignmentHandler(assign.assignmentId)} className="action-btn delete">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="back-button-container">
            <button onClick={() => navigate('/instructor/dashboard')}
             className="btn btn-secondary">← Back to Dashboard</button>
          </div>
        </div>
      </div>

      {/* Модальное окно для ввода ссылки (вместо prompt) */}
      {isLinkModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLinkModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Enter Media URL</h2>
              <button className="modal-close" onClick={() => setIsLinkModalOpen(false)}>×</button>
            </div>
            <div className="form-group">
              <label>Link (YouTube, MP4, Image, PDF)</label>
              <input 
                type="text"
                className="form-input"
                placeholder="https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleAddMediaLink}>Add Media</button>
              <button className="btn btn-secondary" onClick={() => setIsLinkModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isEditLessonModalOpen && editingLesson && (
        <div className="modal-overlay" onClick={() => setIsEditLessonModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Edit Lesson</h2>
            <form onSubmit={saveLessonChanges}>
              <div className="form-group"><label>Title</label><input className="form-input"
               value={editingLesson.title} onChange={e => setEditingLesson({ ...editingLesson, title: e.target.value })} /></div>
              <div className="form-group"><label>Description</label><textarea 
              className="form-textarea" value={editingLesson.description} 
              onChange={e => setEditingLesson({ ...editingLesson, description: e.target.value })} /></div>
              <div className="form-group"><label>Content</label><textarea rows="5" 
              className="form-textarea" value={editingLesson.content} onChange={e => setEditingLesson({ ...editingLesson, content: e.target.value })} /></div>
              <div className="form-group"><label>Order</label><input type="number" 
              className="form-input" value={editingLesson.order} onChange={e => setEditingLesson({ ...editingLesson, order: e.target.value })} /></div>
              <div className="form-actions"><button type="submit" 
              className="btn btn-primary">Save Changes</button><button type="button" onClick={() => setIsEditLessonModalOpen(false)} className="btn btn-secondary">Cancel</button></div>
            </form>
          </div>
        </div>
      )}

      {isEditAssignmentModalOpen && editingAssignment && (
        <div className="modal-overlay" onClick={() => setIsEditAssignmentModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Edit Assignment</h2>
            <p>Assignments cannot be edited. You can delete and recreate.</p>
            <div className="form-actions">
              <button onClick={() => setIsEditAssignmentModalOpen(false)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}