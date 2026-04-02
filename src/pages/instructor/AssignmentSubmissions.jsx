import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AssignmentSubmissions.css';

export default function AssignmentSubmissions() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, [courseId, assignmentId]);
  
  const loadData = () => {
    // Load assignment from storage (supports both storage patterns)
    const instructorAssignments = JSON.parse(localStorage.getItem('instructor_assignments') || '{}');
    const courseAssignments = instructorAssignments[courseId] || [];
    let foundAssignment = courseAssignments.find(a => a.assignmentId == assignmentId);
    
    if (!foundAssignment) {
      const newFormat = localStorage.getItem(`instructor_assignments_${courseId}`);
      if (newFormat) {
        const assignments = JSON.parse(newFormat);
        foundAssignment = assignments.find(a => a.assignmentId == assignmentId);
      }
    }
    
    if (foundAssignment) {
      setAssignment(foundAssignment);
    } else {
      setAssignment({ assignmentTitle: `Assignment ${assignmentId}` });
    }
    
    // Load submissions
    const allSubmissions = JSON.parse(localStorage.getItem(`instructor_submissions_${courseId}`) || '[]');
    const assignmentSubmissions = allSubmissions.filter(sub => sub.assignmentId == assignmentId);
    setSubmissions(assignmentSubmissions);
    
    const feedbackObj = {};
    const gradesObj = {};
    assignmentSubmissions.forEach(sub => {
      feedbackObj[sub.submissionId] = sub.feedback || '';
      gradesObj[sub.submissionId] = sub.grade !== undefined && sub.grade !== null ? sub.grade : '';
    });
    setFeedback(feedbackObj);
    setGrades(gradesObj);
    setLoading(false);
  };
  
  const saveGrade = (submissionId, studentId) => {
    const grade = grades[submissionId];
    if (grade === '' || grade === null || grade === undefined) {
      alert('Please enter a grade');
      return;
    }
    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
      alert('Please enter a valid grade between 0 and 100');
      return;
    }
    
    const currentSubmission = submissions.find(sub => sub.submissionId === submissionId);
    if (currentSubmission?.grade === numericGrade) return;
    
    // Update instructor submissions
    const allSubmissions = JSON.parse(localStorage.getItem(`instructor_submissions_${courseId}`) || '[]');
    const updated = allSubmissions.map(sub => 
      sub.submissionId === submissionId ? { ...sub, grade: numericGrade } : sub
    );
    localStorage.setItem(`instructor_submissions_${courseId}`, JSON.stringify(updated));
    
    // Update student's record
    const studentData = JSON.parse(localStorage.getItem(`student_${studentId}_submissions`) || '{}');
    if (studentData[courseId] && studentData[courseId][assignmentId]) {
      studentData[courseId][assignmentId].grade = numericGrade;
      localStorage.setItem(`student_${studentId}_submissions`, JSON.stringify(studentData));
    }
    
    // Update local state
    setSubmissions(prev => prev.map(sub => 
      sub.submissionId === submissionId ? { ...sub, grade: numericGrade } : sub
    ));
    alert('Grade saved successfully');
  };
  
  const saveFeedback = (submissionId, studentId) => {
    const text = feedback[submissionId] || '';
    const currentSubmission = submissions.find(sub => sub.submissionId === submissionId);
    if (currentSubmission?.feedback === text) return;
    
    const allSubmissions = JSON.parse(localStorage.getItem(`instructor_submissions_${courseId}`) || '[]');
    const updated = allSubmissions.map(sub => 
      sub.submissionId === submissionId ? { ...sub, feedback: text } : sub
    );
    localStorage.setItem(`instructor_submissions_${courseId}`, JSON.stringify(updated));
    
    const studentData = JSON.parse(localStorage.getItem(`student_${studentId}_submissions`) || '{}');
    if (studentData[courseId] && studentData[courseId][assignmentId]) {
      studentData[courseId][assignmentId].feedback = text;
      localStorage.setItem(`student_${studentId}_submissions`, JSON.stringify(studentData));
    }
    
    setSubmissions(prev => prev.map(sub => 
      sub.submissionId === submissionId ? { ...sub, feedback: text } : sub
    ));
    alert('Feedback saved successfully');
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };
  
  if (loading) return <div className="loading-state">Loading submissions...</div>;
  
  const handleBack = () => {
    if (window.location.pathname.includes('/instructor/')) {
      navigate(`/instructor/course/${courseId}/manage`);
    } else {
      navigate(`/courses/${courseId}/assignments`);
    }
  };
  
  return (
    <div className="submissions-page">
      <div className="submissions-container">
        <div className="page-card">
          <div className="submissions-header">
            <button onClick={handleBack} className="back-btn">← Back to Course</button>
            <h1>{assignment?.assignmentTitle} - Submissions</h1>
          </div>
          
          <div className="assignment-info-card">
            <div className="assignment-info-row">
              <span className="info-label">Description</span>
              <span className="info-value">{assignment?.assignmentDescription || 'No description'}</span>
            </div>
            <div className="assignment-info-row">
              <span className="info-label">Due Date</span>
              <span className="info-value">{assignment?.dueDate ? formatDate(assignment.dueDate) : 'No due date'}</span>
            </div>
            <div className="assignment-info-row">
              <span className="info-label">Submissions</span>
              <span className="info-value highlight">{submissions.length} student(s)</span>
            </div>
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
                        <strong>{sub.studentName}</strong>
                        <span className="student-email">{sub.studentEmail}</span>
                      </td>
                      <td>{formatDate(sub.submittedAt)}</td>
                      <td>
                        <div className="answer-preview">{sub.answer?.substring(0, 100)}...</div>
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
                          <button onClick={() => saveGrade(sub.submissionId, sub.studentId)} className="icon-btn save-grade">Save</button>
                        </div>
                      </td>
                      <td className="feedback-cell">
                        <div className="input-group vertical">
                          <textarea 
                            rows="2" 
                            value={feedback[sub.submissionId] || ''}
                            onChange={e => setFeedback({...feedback, [sub.submissionId]: e.target.value})}
                            placeholder="Write feedback..."
                            className="feedback-input"
                          />
                          <button onClick={() => saveFeedback(sub.submissionId, sub.studentId)} className="icon-btn save-feedback">Save</button>
                        </div>
                      </td>
                      <td>
                        <button onClick={() => alert(sub.answer)} className="view-btn">View Full Answer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}