import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useNotification } from '../../context/AlertCustom';
import './AssignmentSubmissions.css';

export default function AssignmentSubmissions() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [fullAnswer, setFullAnswer] = useState('');
  
  const extractData = (response) => {
    const data = response.data;
    return Array.isArray(data) ? data : (data?.content || []);
  };
  
  useEffect(() => {
    loadSubmissions();
  }, [assignmentId]);
  
  const loadSubmissions = async () => {
    try {
      const submissionsRes = await api.get(`/assignment/submissions/${assignmentId}`);
      const subs = extractData(submissionsRes);
      setSubmissions(subs);
      
      const initGrades = {};
      const initFeedbacks = {};
      subs.forEach(sub => {
        initGrades[sub.submissionId] = sub.grade !== null ? sub.grade : '';
        initFeedbacks[sub.submissionId] = sub.feedback || '';
      });
      setGrades(initGrades);
      setFeedbacks(initFeedbacks);
    } catch (err) {
      console.error('Error loading submissions:', err);
      showToast('Failed to load submissions', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const saveGrade = async (submissionId, studentId) => {
    if (!studentId) {
      showToast('Student ID not found', 'error');
      return;
    }
    const grade = grades[submissionId];
    if (grade === '' || grade === null) {
      showToast('Please enter a grade', 'error');
      return;
    }
    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
      showToast('Grade must be between 0 and 100', 'error');
      return;
    }
    try {
      await api.put('/assignment/gradeAssignment', {
        studentId: studentId,
        assignmentId: parseInt(assignmentId),
        grade: numericGrade
      });
      setSubmissions(prev => prev.map(sub => 
        sub.submissionId === submissionId ? { ...sub, grade: numericGrade } : sub
      ));
      showToast('Grade saved successfully', 'success');
    } catch (err) {
      console.error('Grade save error:', err);
      showToast('Failed to save grade', 'error');
    }
  };
  
  const saveFeedback = async (submissionId, studentId) => {
    if (!studentId) {
      showToast('Student ID not found', 'error');
      return;
    }
    const feedback = feedbacks[submissionId];
    if (!feedback || !feedback.trim()) {
      showToast('Please enter feedback', 'error');
      return;
    }
    try {
      await api.put('/assignment/saveAssignmentFeedback', {
        studentId: studentId,
        assignmentId: parseInt(assignmentId),
        feedback: feedback.trim()
      });
      setSubmissions(prev => prev.map(sub => 
        sub.submissionId === submissionId ? { ...sub, feedback: feedback.trim() } : sub
      ));
      showToast('Feedback saved successfully', 'success');
    } catch (err) {
      console.error('Feedback save error:', err);
      showToast('Failed to save feedback', 'error');
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };
  
  const viewFullAnswer = (content) => {
    setFullAnswer(content);
    setModalOpen(true);
  };
  
  if (loading) return <div className="loading-state">Loading submissions...</div>;
  
  return (
    <div className="submissions-page">
      <div className="submissions-container">
        <div className="page-card">
          <div className="submissions-header">
            <button onClick={() => navigate(`/courses/${courseId}/lessons`)} className="back-btn">
              ← Back to Course
            </button>
            <h1>Assignment {assignmentId} - Submissions</h1>
          </div>
          
          {submissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <h4>No submissions yet</h4>
              <p>Students haven't submitted this assignment.</p>
            </div>
          ) : (
            <div className="submissions-table-wrapper">
              <table className="submissions-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Submitted</th>
                    <th>Answer</th>
                    <th>Grade / 100</th>
                    <th>Feedback</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(sub => {
                    const studentId = sub.student?.userAccountId || sub.studentId || sub.student?.id;
                    return (
                      <tr key={sub.submissionId}>
                        <td className="student-cell">
                          <strong>{sub.student?.firstName || sub.firstName} {sub.student?.lastName || sub.lastName}</strong>
                          <span className="student-email">{sub.student?.email || sub.email}</span>
                        </td>
                        <td>{formatDate(sub.submissionDate)}</td>
                        <td>
                          <div className="answer-preview">
                            {sub.submittedContent ? sub.submittedContent.substring(0, 100) : 'No content'}...
                          </div>
                        </td>
                        <td className="grade-cell">
                          <div className="input-group">
                            <input 
                              type="number" 
                              min="0" 
                              max="100" 
                              step="1"
                              value={grades[sub.submissionId] || ''}
                              onChange={e => setGrades({...grades, [sub.submissionId]: e.target.value})}
                              className="grade-input" 
                            />
                            <button 
                              onClick={() => saveGrade(sub.submissionId, studentId)} 
                              className="icon-btn save-grade"
                            >
                              Save
                            </button>
                          </div>
                        </td>
                        <td className="feedback-cell">
                          <div className="input-group vertical">
                            <textarea 
                              rows="2"
                              value={feedbacks[sub.submissionId] || ''}
                              onChange={e => setFeedbacks({...feedbacks, [sub.submissionId]: e.target.value})}
                              placeholder="Write feedback..."
                              className="feedback-input" 
                            />
                            <button 
                              onClick={() => saveFeedback(sub.submissionId, studentId)}
                              className="icon-btn save-feedback"
                            >
                              Save
                            </button>
                          </div>
                        </td>
                        <td>
                          <button 
                            onClick={() => viewFullAnswer(sub.submittedContent)} 
                            className="view-btn"
                            disabled={!sub.submittedContent}
                          >
                            View Full Answer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {modalOpen && (
            <div className="modal-overlay" onClick={() => setModalOpen(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Full Answer</h2>
                  <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
                </div>
                <div className="modal-body">
                  <p style={{ whiteSpace: 'pre-wrap' }}>{fullAnswer}</p>
                </div>
                <div className="modal-footer">
                  <button onClick={() => setModalOpen(false)} className="btn btn-primary">Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}