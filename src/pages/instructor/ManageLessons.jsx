import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import './ManageLessons.css'
import { 
  getAssignments, 
  addAssignment, 
  updateAssignment, 
  deleteAssignment 
} from '../../utils/assignmentStorage';
import './InstructorDashboard.css';

export default function ManageLessons() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // Состояния
  const [activeTab, setActiveTab] = useState('lessons');
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  
  // Состояния для уроков
  const [newLesson, setNewLesson] = useState({
    title: '',
    content: '',
    youtubeUrl: ''
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  
  // Состояния для заданий
  const [newAssignment, setNewAssignment] = useState({
    assignmentTitle: '',
    assignmentDescription: '',
    dueDate: ''
  });
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  
  // Состояния загрузки
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [apiError, setApiError] = useState('');
  
  // Загрузка данных
  useEffect(() => {
    if (courseId) {
      fetchLessons();
      fetchAssignments();
    }
  }, [courseId]);
  
  const fetchLessons = async () => {
    try {
      setLoadingLessons(true);
      const res = await api.get(`/lesson/get_all_lessons/${Number(courseId)}`);
      setLessons(res.data || []);
      setApiError('');
    } catch (err) {
      console.error('Failed to load lessons:', err);
      setLessons([]);
      setApiError('Failed to load lessons');
    } finally {
      setLoadingLessons(false);
    }
  };
  
  const fetchAssignments = () => {
    try {
      setLoadingAssignments(true);
      setApiError('');
      
      console.log('Попытка получить задания для курса:', courseId);
      
      // Используем единую функцию получения заданий
      const loadedAssignments = getAssignments(courseId);
      console.log('Загружены задания:', loadedAssignments);
      setAssignments(loadedAssignments);
      
    } catch (err) {
      console.error('Failed to load assignments:', err);
      setAssignments([]);
      setApiError('Using local storage for assignments');
    } finally {
      setLoadingAssignments(false);
    }
  };
  
  // === ФУНКЦИИ ДЛЯ УРОКОВ ===
  
  const createLesson = async () => {
    if (!newLesson.title.trim()) {
      alert('Please enter a lesson title');
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
      alert('Lesson added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to add lesson');
    }
  };
  
  const openEditLessonModal = (lesson) => {
    setEditingLesson({ 
      ...lesson,
      title: lesson.lessonName || '',
      content: lesson.content || '',
      youtubeUrl: lesson.youtubeUrl || ''
    });
    setIsEditModalOpen(true);
  };
  
  const saveLessonChanges = async (e) => {
    e.preventDefault();
    
    try {
      const updatedDto = {
        lessonName: editingLesson.title.trim(),
        content: editingLesson.content?.trim() || null,
        youtubeUrl: editingLesson.youtubeUrl?.trim() || null
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
  
  const getThumbnail = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  };
  
  // === ФУНКЦИИ ДЛЯ ЗАДАНИЙ ===
  
  const createAssignment = async (e) => {
    e.preventDefault();
    
    if (!newAssignment.assignmentTitle.trim()) {
      alert('Please enter assignment title');
      return;
    }
    
    try {
      // Создаем объект задания
      const assignmentData = {
        assignmentTitle: newAssignment.assignmentTitle.trim(),
        assignmentDescription: newAssignment.assignmentDescription.trim() || null,
        dueDate: newAssignment.dueDate ? new Date(newAssignment.dueDate).toISOString() : null,
        courseId: Number(courseId)
      };
      
      console.log('Создаем новое задание:', assignmentData);
      
      // Добавляем задание через универсальную функцию
      const newAssignmentObj = addAssignment(courseId, assignmentData);
      
      // Обновляем локальное состояние
      setAssignments(prev => [...prev, newAssignmentObj]);
      
      // Очищаем форму и закрываем модалку
      setNewAssignment({
        assignmentTitle: '',
        assignmentDescription: '',
        dueDate: ''
      });
      setIsAssignmentModalOpen(false);
      
      alert('Assignment created successfully! Students can now see it.');
    } catch (err) {
      console.error('Error creating assignment:', err);
      alert(`Failed to create assignment: ${err.message}`);
    }
  };
  
  const openEditAssignmentModal = (assignment) => {
    // Форматируем дату для input[type="datetime-local"]
    let formattedDate = '';
    if (assignment.dueDate) {
      const date = new Date(assignment.dueDate);
      formattedDate = date.toISOString().slice(0, 16);
    }
    
    setEditingAssignment({ 
      ...assignment,
      dueDate: formattedDate
    });
    setIsAssignmentModalOpen(true);
  };
  
  const saveAssignmentChanges = async (e) => {
    e.preventDefault();
    
    if (!editingAssignment.assignmentTitle.trim()) {
      alert('Please enter assignment title');
      return;
    }
    
    try {
      const updatedData = {
        assignmentTitle: editingAssignment.assignmentTitle.trim(),
        assignmentDescription: editingAssignment.assignmentDescription?.trim() || null,
        dueDate: editingAssignment.dueDate ? new Date(editingAssignment.dueDate).toISOString() : null,
      };
      
      // Обновляем через универсальную функцию
      const updatedAssignment = updateAssignment(courseId, editingAssignment.assignmentId, updatedData);
      
      // Обновляем локальное состояние
      setAssignments(prev => prev.map(a =>
        a.assignmentId === editingAssignment.assignmentId
          ? { ...a, ...updatedData, updatedAt: new Date().toISOString() }
          : a
      ));
      
      setIsAssignmentModalOpen(false);
      alert('Assignment updated successfully!');
      
    } catch (err) {
      console.error(err);
      alert('Failed to update assignment');
    }
  };
  
  const deleteAssignmentHandler = (assignmentId) => {
    if (!window.confirm('Delete this assignment? All submissions will be deleted.')) return;
    
    try {
      // Удаляем через универсальную функцию
      deleteAssignment(courseId, assignmentId);
      
      // Обновляем локальное состояние
      setAssignments(prev => prev.filter(a => a.assignmentId !== assignmentId));
      
      alert('Assignment deleted successfully!');
      
    } catch (err) {
      console.error(err);
      alert('Failed to delete assignment');
    }
  };
  
  // Форматирование даты для отображения
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };
  
  return (
    <div className="dashboard-container">
      <div className="page-card">
        <h2 className="page-title">Manage Course Content</h2>
        
        {apiError && (
          <div className="warning-banner">
            ⚠️ {apiError}
          </div>
        )}
        
        {/* Вкладки переключения */}
        <div className="tabs" style={{ marginBottom: '2rem' }}>
          <button
            className={`tab-btn ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            Lessons ({lessons.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            Assignments ({assignments.length})
          </button>
        </div>
        
        {/* Контент в зависимости от активной вкладки */}
        {activeTab === 'lessons' ? (
          // === КОНТЕНТ УРОКОВ ===
          <>
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
              
              {loadingLessons ? (
                <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
                  Loading lessons...
                </p>
              ) : lessons.length === 0 ? (
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
                          {lesson.content && (
                            <p style={{ 
                              margin: '0.5rem 0 0', 
                              color: '#666',
                              fontSize: '0.9rem',
                              maxHeight: '40px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {lesson.content.substring(0, 100)}...
                            </p>
                          )}
                        </div>

                        <div className="course-actions" style={{ padding: '0 1rem 1rem', display: 'flex', gap: '0.5rem' }}>
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
                    );
                  })}
                </div>
              )}
            </section>
          </>
        ) : (
          // === КОНТЕНТ ЗАДАНИЙ ===
          <>
            {/* Форма добавления задания */}
            <section className="courses-section" style={{ marginBottom: '3rem' }}>
              <div className="section-header">
                <h3>Add New Assignment</h3>
                <button 
                  onClick={() => setIsAssignmentModalOpen(true)} 
                  className="quick-btn primary"
                >
                  + New Assignment
                </button>
              </div>
              
              <div className="info-message">
                <p><strong>Note:</strong> Assignments are saved in your browser and will be visible to students.</p>
              </div>
            </section>
            
            {/* Список заданий */}
            <section className="courses-section">
              <div className="section-header">
                <h3>Course Assignments ({assignments.length})</h3>
              </div>
              
              {loadingAssignments ? (
                <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
                  Loading assignments...
                </p>
              ) : assignments.length === 0 ? (
                <div className="empty-state">
                  <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem', fontSize: '1.1rem' }}>
                    No assignments yet. Create your first one!
                  </p>
                </div>
              ) : (
                <div className="assignments-list">
                  {assignments.map(assignment => (
                    <div key={assignment.assignmentId} className="assignment-card">
                      <div className="assignment-header">
                        <h4 style={{ margin: 0, color: '#333' }}>
                          {assignment.assignmentTitle}
                        </h4>
                        <span className={`status-badge ${assignment.dueDate ? 'active' : 'inactive'}`}>
                          {assignment.dueDate ? `Due: ${formatDate(assignment.dueDate)}` : 'No due date'}
                        </span>
                      </div>
                      
                      <div className="assignment-body">
                        <p style={{ margin: '0.5rem 0', color: '#666', lineHeight: '1.5' }}>
                          {assignment.assignmentDescription || 'No description provided'}
                        </p>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                          <span>Created: {formatDate(assignment.createdAt)}</span>
                          {assignment.updatedAt && assignment.updatedAt !== assignment.createdAt && (
                            <span>Updated: {formatDate(assignment.updatedAt)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="assignment-actions">
                        <button
                          onClick={() => openEditAssignmentModal(assignment)}
                          className="action-btn btn-edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAssignmentHandler(assignment.assignmentId)}
                          className="action-btn btn-delete"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => navigate(`/courses/${courseId}/assignments/${assignment.assignmentId}/submissions`)}
                          className="action-btn btn-manage"
                        >
                          View Submissions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
        
        {/* Модалка для создания/редактирования задания */}
        {(isAssignmentModalOpen) && (
          <div className="modal-overlay" onClick={() => setIsAssignmentModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">
                {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </h2>
              <form onSubmit={editingAssignment ? saveAssignmentChanges : createAssignment} className="course-form">
                <div className="form-group">
                  <label>Assignment Title <span style={{ color: 'red' }}>*</span></label>
                  <input
                    className="form-input"
                    value={editingAssignment ? editingAssignment.assignmentTitle : newAssignment.assignmentTitle}
                    onChange={(e) => editingAssignment 
                      ? setEditingAssignment({ ...editingAssignment, assignmentTitle: e.target.value })
                      : setNewAssignment({ ...newAssignment, assignmentTitle: e.target.value })
                    }
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Description (optional)</label>
                  <textarea
                    rows="4"
                    className="form-textarea"
                    placeholder="Describe the assignment requirements..."
                    value={editingAssignment ? editingAssignment.assignmentDescription : newAssignment.assignmentDescription}
                    onChange={(e) => editingAssignment 
                      ? setEditingAssignment({ ...editingAssignment, assignmentDescription: e.target.value })
                      : setNewAssignment({ ...newAssignment, assignmentDescription: e.target.value })
                    }
                  />
                </div>
                
                <div className="form-group">
                  <label>Due Date (optional)</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={editingAssignment ? editingAssignment.dueDate : newAssignment.dueDate}
                    onChange={(e) => editingAssignment 
                      ? setEditingAssignment({ ...editingAssignment, dueDate: e.target.value })
                      : setNewAssignment({ ...newAssignment, dueDate: e.target.value })
                    }
                  />
                  <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
                    Local timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </small>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingAssignment ? 'Save Changes' : 'Create Assignment'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsAssignmentModalOpen(false);
                      setEditingAssignment(null);
                    }} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Модалка для редактирования урока */}
        {(isEditModalOpen && editingLesson) && (
          <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Edit Lesson</h2>
              <form onSubmit={saveLessonChanges} className="course-form">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    className="form-input"
                    value={editingLesson.title || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
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