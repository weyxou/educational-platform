import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { useNotification } from '../../context/AlertCustom';
import './CourseAssigments.css';

export default function CourseAssignments() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast, confirm } = useNotification();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [answer, setAnswer] = useState('');
  const [viewSubmission, setViewSubmission] = useState(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [courseId, user]);

  const loadData = async () => {
    try {
      try {
        const courseRes = await api.get(`/course/course_id/${courseId}`);
        setCourse(courseRes.data);
      } catch (err) {
        console.warn('Course info not available:', err);
      }

      const assignmentsRes = await api.get(`/assignment/course/${courseId}`);
      const courseAssignments = assignmentsRes.data;
      setAssignments(courseAssignments);

      const submissionsMap = {};
      for (const assignment of courseAssignments) {
        try {
          const subRes = await api.get(`/assignment/submission/student/${user.userAccountId}/assignment/${assignment.assignmentId}`);
          if (subRes.data) {
            submissionsMap[assignment.assignmentId] = subRes.data;
          }
        } catch (err) {
          if (err.response?.status !== 404) {
            console.warn(`Failed to load submission for assignment ${assignment.assignmentId}`, err);
          }
        }
      }
      setSubmissions(submissionsMap);
    } catch (err) {
      console.error('Error loading assignments:', err);
      showToast('Failed to load assignments. Make sure the backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const submitAssignment = async () => {
    if (!answer.trim()) {
      showToast('Please write your answer', 'error');
      return;
    }
    if (!currentAssignment || !user) return;

    try {
      const submissionData = {
        assignment: { assignmentId: parseInt(currentAssignment.assignmentId, 10) },
        submittedContent: answer.trim(),
        submissionDate: new Date().toISOString()
      };

      const response = await api.post('/assignment/uploadAssignment', submissionData);
      console.log('Submit success:', response.data);

      const newSubmission = response.data;
      setSubmissions(prev => ({
        ...prev,
        [currentAssignment.assignmentId]: newSubmission
      }));

      setAnswer('');
      setShowSubmitModal(false);
      showToast('Assignment submitted successfully!', 'success');
    } catch (err) {
      console.error('Submit error:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Status:', err.response.status);
        if (err.response.status === 400 && err.response.data?.message?.includes('already submitted')) {
          showToast('You have already submitted this assignment. Resubmission is not allowed.', 'error');
        } else {
          showToast(`Submission failed: ${err.response.status} - ${err.response.data?.message || JSON.stringify(err.response.data)}`, 'error');
        }
      } else {
        showToast('Failed to submit assignment. Check network connection.', 'error');
      }
    }
  };

  const viewSubmissionDetails = (assignment) => {
    const submission = submissions[assignment.assignmentId];
    if (submission) {
      setViewSubmission({
        assignmentTitle: assignment.assignmentTitle,
        submittedContent: submission.submittedContent,
        submissionDate: submission.submissionDate,
        grade: submission.grade,
        feedback: submission.feedback
      });
      setShowViewModal(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusInfo = (assignmentId) => {
    const submission = submissions[assignmentId];
    if (!submission) return { status: 'not_submitted', text: 'Not Submitted', color: '#ef4444' };
    if (submission.grade !== null && submission.grade !== undefined) {
      return { status: 'graded', text: `Graded: ${submission.grade}/100`, color: '#10b981' };
    }
    return { status: 'submitted', text: 'Submitted - Awaiting Grade', color: '#f59e0b' };
  };

  if (loading) return <div className="loading-spinner">Loading assignments...</div>;

  return (
    <div className="dashboard-container">
      <div className="page-card">
        <div className="page-header">
          <button onClick={() => navigate(`/courses/${courseId}/view`)} className="back-btn">
            ← Back to Course
          </button>
          <h2 className="page-title">
            {course?.courseName || 'Course'} - Assignments ({assignments.length})
          </h2>
        </div>

        <div className="course-info">
          <p><strong>Instructions:</strong> Submit your assignments before the due date.</p>
          <p><strong>Note:</strong> Only one submission is allowed per assignment.</p>
        </div>

        <section className="assignments-section">
          <div className="section-header">
            <h3>Course Assignments</h3>
            <p>Total: {assignments.length} assignment(s)</p>
          </div>

          {assignments.length === 0 ? (
            <div className="empty-state">
              <p>No assignments available for this course yet.</p>
            </div>
          ) : (
            <div className="assignments-list student-view">
              {assignments.map(assignment => {
                const statusInfo = getStatusInfo(assignment.assignmentId);
                const submission = submissions[assignment.assignmentId];
                const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date() && statusInfo.status === 'not_submitted';

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
                      <span className="status-badge" style={{ backgroundColor: statusInfo.color }}>
                        {statusInfo.text}
                      </span>
                    </div>

                    <div className="assignment-body">
                      <p>{assignment.assignmentDescription || 'No description provided.'}</p>
                      {submission && submission.feedback && (
                        <div className="feedback-box">
                          <div className="feedback-header">
                            <strong>Instructor Feedback:</strong>
                            {submission.grade != null && (
                              <span className="grade-display">Grade: {submission.grade}/100</span>
                            )}
                          </div>
                          <p>{submission.feedback}</p>
                        </div>
                      )}
                    </div>

                    <div className="assignment-actions">
                      {statusInfo.status === 'not_submitted' ? (
                        <button 
                          onClick={() => { setCurrentAssignment(assignment); setAnswer(''); setShowSubmitModal(true); }}
                          className="btn-primary" 
                          disabled={isOverdue}
                        >
                          {isOverdue ? 'Submission Closed' : 'Submit Assignment'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => viewSubmissionDetails(assignment)} 
                          className="btn-secondary"
                        >
                          View My Submission
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {showSubmitModal && currentAssignment && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Submit Assignment</h2>
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
              <button onClick={() => setShowSubmitModal(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && viewSubmission && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h2 className="modal-title">My Submission</h2>
            <p><strong>{viewSubmission.assignmentTitle}</strong></p>
            <p><strong>Submitted:</strong> {formatDate(viewSubmission.submissionDate)}</p>
            {viewSubmission.grade != null && (
              <p><strong>Grade:</strong> {viewSubmission.grade}/100</p>
            )}
            <div className="form-group">
              <label><strong>Your Answer:</strong></label>
              <div className="answer-box" style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                {viewSubmission.submittedContent}
              </div>
            </div>
            {viewSubmission.feedback && (
              <div className="form-group">
                <label><strong>Instructor Feedback:</strong></label>
                <div className="feedback-box" style={{ background: '#e8f0fe', padding: '1rem', borderRadius: '4px' }}>
                  {viewSubmission.feedback}
                </div>
              </div>
            )}
            <div className="form-actions">
              <button onClick={() => setShowViewModal(false)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}