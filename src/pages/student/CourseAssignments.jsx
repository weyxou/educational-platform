import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAssignments, getSubmissions, saveSubmission, saveStudentSubmission } from '../../utils/assignmentStorage';
import './StudentDashboard.css';

export default function CourseAssignments() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Модалка отправки
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [answer, setAnswer] = useState('');
  
  useEffect(() => {
    if (!user) return;
    loadData();
  }, [courseId, user]);
  
  const loadData = () => {
    // 1. Загружаем курс
    const allCourses = JSON.parse(localStorage.getItem('all_courses') || '[]');
    const courseData = allCourses.find(c => c.courseId == courseId);
    setCourse(courseData);
    
    // 2. Загружаем задания используя универсальную функцию
    const courseAssignments = getAssignments(courseId);
    console.log('Assignments loaded for student:', courseAssignments);
    setAssignments(courseAssignments);
    
    // 3. Загружаем отправки студента
    const studentKey = `student_${user.userAccountId}_submissions`;
    const studentData = JSON.parse(localStorage.getItem(studentKey) || '{}');
    setSubmissions(studentData[courseId] || {});
    
    setLoading(false);
  };
  
  const submitAssignment = () => {
    if (!answer.trim()) {
      alert('Please write your answer');
      return;
    }
    
    if (!currentAssignment || !user) return;
    
    const submissionData = {
      submissionId: Date.now(),
      assignmentId: currentAssignment.assignmentId,
      assignmentTitle: currentAssignment.assignmentTitle,
      studentId: user.userAccountId,
      studentName: `${user.firstName} ${user.lastName}`,
      studentEmail: user.email,
      answer: answer.trim(),
      submittedAt: new Date().toISOString(),
      grade: null,
      feedback: null,
      status: 'submitted'
    };
    
    try {
      // 1. Сохраняем у студента
      saveStudentSubmission(user.userAccountId, courseId, currentAssignment.assignmentId, submissionData);
      
      // 2. Сохраняем для инструктора
      saveSubmission(courseId, submissionData);
      
      // 3. Обновляем состояние
      const studentKey = `student_${user.userAccountId}_submissions`;
      const studentData = JSON.parse(localStorage.getItem(studentKey) || '{}');
      setSubmissions(studentData[courseId] || {});
      
      setAnswer('');
      setShowSubmitModal(false);
      
      alert('Assignment submitted successfully! Your instructor will review it.');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment');
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusInfo = (assignmentId) => {
    const submission = submissions[assignmentId];
    if (!submission) return { status: 'not_submitted', text: 'Not Submitted', color: '#ef4444' };
    
    if (submission.grade !== null) {
      return { 
        status: 'graded', 
        text: `Graded: ${submission.grade}/100`,
        color: '#10b981' 
      };
    }
    
    return { 
      status: 'submitted', 
      text: 'Submitted - Awaiting Grade', 
      color: '#f59e0b' 
    };
  };
  
  if (loading) return <div className="loading-spinner">Loading assignments...</div>;
  
  return (
    <div className="dashboard-container">
      <div className="page-card">
        <div className="page-header">
          <button 
            onClick={() => navigate(`/courses/${courseId}/view`)}
            className="back-btn"
          >
            ← Back to Course
          </button>
          <h2 className="page-title">
            {course?.courseName || 'Course'} - Assignments ({assignments.length})
          </h2>
        </div>
        
        <div className="course-info">
          <p><strong>Instructions:</strong> Submit your assignments before the due date.</p>
          <p><strong>Note:</strong> You can resubmit if you need to make changes.</p>
        </div>
        
        <section className="assignments-section">
          <div className="section-header">
            <h3>Course Assignments</h3>
            <p>Total: {assignments.length} assignment(s)</p>
          </div>
          
          {assignments.length === 0 ? (
            <div className="empty-state">
              <p>No assignments available for this course yet.</p>
              <p>Your instructor will add assignments soon.</p>
            </div>
          ) : (
            <div className="assignments-list student-view">
              {assignments.map(assignment => {
                const statusInfo = getStatusInfo(assignment.assignmentId);
                const submission = submissions[assignment.assignmentId];
                const isOverdue = assignment.dueDate && 
                  new Date(assignment.dueDate) < new Date() && 
                  statusInfo.status === 'not_submitted';
                
                return (
                  <div key={assignment.assignmentId} className="assignment-card student">
                    <div className="assignment-header">
                      <div>
                        <h4>{assignment.assignmentTitle}</h4>
                        {assignment.dueDate && (
                          <p className="due-date">
                            <strong>Due:</strong> {formatDate(assignment.dueDate)}
                            {isOverdue && <span className="overdue-badge">OVERDUE</span>}
                          </p>
                        )}
                      </div>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: statusInfo.color }}
                      >
                        {statusInfo.text}
                      </span>
                    </div>
                    
                    <div className="assignment-body">
                      <p>{assignment.assignmentDescription || 'No description provided.'}</p>
                      
                      {submission && (
                        <div className="submission-info">
                          <p><strong>Submitted:</strong> {formatDate(submission.submittedAt)}</p>
                          
                          {submission.feedback && (
                            <div className="feedback-box">
                              <div className="feedback-header">
                                <strong>Instructor Feedback:</strong>
                                {submission.grade !== null && (
                                  <span className="grade-display">Grade: {submission.grade}/100</span>
                                )}
                              </div>
                              <p>{submission.feedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="assignment-actions">
                      {statusInfo.status === 'not_submitted' ? (
                        <button
                          onClick={() => {
                            setCurrentAssignment(assignment);
                            setAnswer('');
                            setShowSubmitModal(true);
                          }}
                          className="btn-primary"
                          disabled={isOverdue}
                        >
                          {isOverdue ? 'Submission Closed' : 'Submit Assignment'}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setCurrentAssignment(assignment);
                              setAnswer(submission?.answer || '');
                              setShowSubmitModal(true);
                            }}
                            className="btn-edit"
                            disabled={isOverdue}
                          >
                            {isOverdue ? 'Resubmission Closed' : 'Resubmit'}
                          </button>
                          <button
                            onClick={() => {
                              if (submission?.answer) {
                                alert(`Your submission:\n\n${submission.answer}`);
                              }
                            }}
                            className="btn-secondary"
                          >
                            View My Submission
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
      
      {/* Модалка отправки задания */}
      {showSubmitModal && currentAssignment && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">
              {submissions[currentAssignment.assignmentId] ? 'Resubmit Assignment' : 'Submit Assignment'}
            </h2>
            <p><strong>{currentAssignment.assignmentTitle}</strong></p>
            
            {currentAssignment.dueDate && (
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                Due: {formatDate(currentAssignment.dueDate)}
              </p>
            )}
            
            <div className="form-group">
              <label>Your Answer <span style={{ color: 'red' }}>*</span></label>
              <textarea
                rows="10"
                className="form-textarea"
                placeholder="Write your answer here..."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                required
              />
            </div>
            
            <div className="form-actions">
              <button onClick={submitAssignment} className="btn btn-primary" disabled={!answer.trim()}>
                Submit Assignment
              </button>
              <button onClick={() => setShowSubmitModal(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}