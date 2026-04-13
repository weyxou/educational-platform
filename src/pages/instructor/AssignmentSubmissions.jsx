import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useNotification } from '../../context/AlertCustom';
import './AssignmentSubmissions.css';

export default function AssignmentSubmissions() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState({});
  const [feedbacks, setFeedbacks] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
const [fullAnswer, setFullAnswer] = useState('');
  
  useEffect(() => {
    loadData();
  }, [assignmentId]);
  
  const loadData = async () => {
    try {
      const submissionsRes = await api.get(`/assignment/submissions/${assignmentId}`);
      const subs = submissionsRes.data;
      setSubmissions(subs);
      
      const initGrades = {};
      const initFeedbacks = {};
      subs.forEach(sub => {
        initGrades[sub.submissionId] = sub.grade !== null ? sub.grade : '';
        initFeedbacks[sub.submissionId] = sub.feedback || '';
      });
      setGrades(initGrades);
      setFeedbacks(initFeedbacks);
      try {
        const assignmentRes = await api.get(`/assignment/${assignmentId}`);
        setAssignment(assignmentRes.data);
      } catch (err) {
        setAssignment({ assignmentTitle: `Assignment ${assignmentId}` });
      }
    } catch (err) {
      console.error('Error loading submissions:', err);
      showToast('Failed to load submissions', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const saveGrade = async (submissionId, studentId) => {
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
    const feedback = feedbacks[submissionId];
    if (!feedback) {
      showToast('Please enter feedback', 'error');
      return;
    }
    try {
      await api.put('/assignment/saveAssignmentFeedback', {
        studentId: studentId,
        assignmentId: parseInt(assignmentId),
        feedback: feedback
      });
      setSubmissions(prev => prev.map(sub => 
        sub.submissionId === submissionId ? { ...sub, feedback: feedback } : sub
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
  
  if (loading) return <div className="loading-state">Loading submissions</div>;
  
  return (
    <div className="submissions-page">
      <div className="submissions-container">
        <div className="page-card">
          <div className="submissions-header">
            <button onClick={() => navigate(`/instructor/course/${courseId}/manage`)} className="back-btn">
              Back to Course
            </button>
            <h1>{assignment?.assignmentTitle || 'Assignment'} Submissions</h1>
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
                  {submissions.map(sub => (
                    <tr key={sub.submissionId}>
                      <td className="student-cell">
                        <strong>{sub.student?.firstName} {sub.student?.lastName}</strong>
                        <span className="student-email">{sub.student?.email}</span>
                      </td>
                      <td>{formatDate(sub.submissionDate)}</td>
                      <td>
                        <div className="answer-preview">{sub.submittedContent?.substring(0, 100)}...</div>
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
                            onClick={() => saveGrade(sub.submissionId, sub.student?.userAccountId)} 
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
                            onClick={() => saveFeedback(sub.submissionId, sub.student?.userAccountId)}
                            className="icon-btn save-feedback"
                          >
                            Save
                          </button>
                        </div>
                      </td>
                      <td>
                        <button onClick={() => viewFullAnswer(sub.submittedContent)} className="view-btn">
                          View Full Answer
                        </button>
                      </td>
                    </tr>
                  ))}
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
        <p>{fullAnswer}</p>
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