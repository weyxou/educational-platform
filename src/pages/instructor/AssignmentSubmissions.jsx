// src/pages/instructor/AssignmentSubmissions.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
    // 1. Найти задание
    const instructorAssignments = JSON.parse(localStorage.getItem('instructor_assignments') || '{}');
    const courseAssignments = instructorAssignments[courseId] || [];
    const foundAssignment = courseAssignments.find(a => a.assignmentId == assignmentId);
    
    if (foundAssignment) {
      setAssignment(foundAssignment);
    } else {
      // Ищем в локальных заданиях
      const savedAssignments = localStorage.getItem(`assignments_${courseId}`);
      if (savedAssignments) {
        const assignments = JSON.parse(savedAssignments);
        const localAssignment = assignments.find(a => a.assignmentId == assignmentId);
        if (localAssignment) {
          setAssignment(localAssignment);
        } else {
          setAssignment({ 
            assignmentId: assignmentId, 
            assignmentTitle: `Assignment ${assignmentId}` 
          });
        }
      }
    }
    
    // 2. Загрузить отправки студентов
    const allSubmissions = JSON.parse(
      localStorage.getItem(`instructor_submissions_${courseId}`) || '[]'
    );
    
    const assignmentSubmissions = allSubmissions.filter(
      sub => sub.assignmentId == assignmentId
    );
    
    setSubmissions(assignmentSubmissions);
    
    // Инициализируем feedback и grades
    const feedbackObj = {};
    const gradesObj = {};
    assignmentSubmissions.forEach(sub => {
      feedbackObj[sub.submissionId] = sub.feedback || '';
      gradesObj[sub.submissionId] = sub.grade !== null ? sub.grade : '';
    });
    
    setFeedback(feedbackObj);
    setGrades(gradesObj);
    setLoading(false);
  };
  
  const saveGrade = (submissionId, studentId) => {
    const grade = grades[submissionId];
    if (grade === '' || grade === null || grade === undefined) return;
    
    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
      alert('Please enter a valid grade between 0 and 100');
      return;
    }
    
    // 1. Обновляем в instructor_submissions
    const allSubmissions = JSON.parse(
      localStorage.getItem(`instructor_submissions_${courseId}`) || '[]'
    );
    
    const updated = allSubmissions.map(sub => {
      if (sub.submissionId === submissionId) {
        return { ...sub, grade: numericGrade };
      }
      return sub;
    });
    
    localStorage.setItem(`instructor_submissions_${courseId}`, JSON.stringify(updated));
    
    // 2. Обновляем у студента
    const studentData = JSON.parse(
      localStorage.getItem(`student_${studentId}_submissions`) || '{}'
    );
    
    if (studentData[courseId] && studentData[courseId][assignmentId]) {
      studentData[courseId][assignmentId].grade = numericGrade;
      localStorage.setItem(`student_${studentId}_submissions`, JSON.stringify(studentData));
    }
    
    // 3. Обновляем состояние
    const updatedSubmissions = submissions.map(sub =>
      sub.submissionId === submissionId
        ? { ...sub, grade: numericGrade }
        : sub
    );
    
    setSubmissions(updatedSubmissions);
    alert('Grade saved successfully!');
  };
  
  const saveFeedback = (submissionId, studentId) => {
    const text = feedback[submissionId] || '';
    
    // 1. Обновляем в instructor_submissions
    const allSubmissions = JSON.parse(
      localStorage.getItem(`instructor_submissions_${courseId}`) || '[]'
    );
    
    const updated = allSubmissions.map(sub => {
      if (sub.submissionId === submissionId) {
        return { ...sub, feedback: text };
      }
      return sub;
    });
    
    localStorage.setItem(`instructor_submissions_${courseId}`, JSON.stringify(updated));
    
    // 2. Обновляем у студента
    const studentData = JSON.parse(
      localStorage.getItem(`student_${studentId}_submissions`) || '{}'
    );
    
    if (studentData[courseId] && studentData[courseId][assignmentId]) {
      studentData[courseId][assignmentId].feedback = text;
      localStorage.setItem(`student_${studentId}_submissions`, JSON.stringify(studentData));
    }
    
    // 3. Обновляем состояние
    const updatedSubmissions = submissions.map(sub =>
      sub.submissionId === submissionId
        ? { ...sub, feedback: text }
        : sub
    );
    
    setSubmissions(updatedSubmissions);
    alert('Feedback saved successfully!');
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };
  
  if (loading) return <div className="loading-spinner">Loading submissions...</div>;
  
  return (
    <div className="dashboard-container">
      <div className="page-card">
        <div className="page-header">
          <button 
            onClick={() => navigate(`/courses/${courseId}/lessons`)}
            className="back-btn"
          >
            ← Back to Course
          </button>
          <h2 className="page-title">
            {assignment?.assignmentTitle} - Student Submissions
          </h2>
        </div>
        
        <div className="assignment-info">
          <p><strong>Description:</strong> {assignment?.assignmentDescription || 'No description'}</p>
          <p><strong>Due Date:</strong> {assignment?.dueDate ? formatDate(assignment.dueDate) : 'No due date'}</p>
          <p><strong>Total Submissions:</strong> {submissions.length} students</p>
        </div>
        
        <section className="courses-section">
          <div className="section-header">
            <h3>Student Submissions</h3>
          </div>
          
          {submissions.length === 0 ? (
            <div className="empty-state">
              <p>No submissions yet.</p>
              <p>Students will appear here when they submit their work.</p>
            </div>
          ) : (
            <div className="submissions-table">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Submitted</th>
                    <th>Answer</th>
                    <th>Grade</th>
                    <th>Feedback</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(submission => (
                    <tr key={submission.submissionId}>
                      <td>
                        <div className="student-info">
                          <strong>{submission.studentName}</strong>
                          <small>{submission.studentEmail}</small>
                        </div>
                      </td>
                      <td>{formatDate(submission.submittedAt)}</td>
                      <td>
                        <div className="content-preview">
                          {submission.answer?.substring(0, 100)}
                          {submission.answer?.length > 100 && '...'}
                        </div>
                        {submission.answer?.length > 100 && (
                          <button
                            className="view-full-btn"
                            onClick={() => alert(submission.answer)}
                          >
                            View Full
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="grade-control">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={grades[submission.submissionId] || ''}
                            onChange={(e) => setGrades({
                              ...grades,
                              [submission.submissionId]: e.target.value
                            })}
                            onBlur={() => saveGrade(submission.submissionId, submission.studentId)}
                            className="grade-input"
                            placeholder="Grade"
                          />
                          <span>/100</span>
                        </div>
                      </td>
                      <td>
                        <textarea
                          rows="2"
                          value={feedback[submission.submissionId] || ''}
                          onChange={(e) => setFeedback({
                            ...feedback,
                            [submission.submissionId]: e.target.value
                          })}
                          onBlur={() => saveFeedback(submission.submissionId, submission.studentId)}
                          className="feedback-textarea"
                          placeholder="Enter feedback..."
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            if (submission.answer) {
                              const modal = document.createElement('div');
                              modal.style.cssText = `
                                position: fixed;
                                top: 0;
                                left: 0;
                                right: 0;
                                bottom: 0;
                                background: rgba(0,0,0,0.7);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                z-index: 9999;
                                padding: 20px;
                              `;
                              
                              const content = document.createElement('div');
                              content.style.cssText = `
                                background: white;
                                padding: 30px;
                                border-radius: 12px;
                                max-width: 800px;
                                max-height: 80vh;
                                overflow-y: auto;
                                position: relative;
                              `;
                              
                              const closeBtn = document.createElement('button');
                              closeBtn.textContent = '×';
                              closeBtn.style.cssText = `
                                position: absolute;
                                top: 10px;
                                right: 10px;
                                background: none;
                                border: none;
                                font-size: 24px;
                                cursor: pointer;
                                color: #666;
                              `;
                              closeBtn.onclick = () => document.body.removeChild(modal);
                              
                              const title = document.createElement('h3');
                              title.textContent = `${submission.studentName}'s Submission`;
                              title.style.marginBottom = '20px';
                              
                              const studentInfo = document.createElement('p');
                              studentInfo.textContent = `Student: ${submission.studentName} (${submission.studentEmail})`;
                              studentInfo.style.color = '#666';
                              studentInfo.style.marginBottom = '10px';
                              
                              const submittedInfo = document.createElement('p');
                              submittedInfo.textContent = `Submitted: ${formatDate(submission.submittedAt)}`;
                              submittedInfo.style.color = '#666';
                              submittedInfo.style.marginBottom = '20px';
                              
                              const text = document.createElement('div');
                              text.textContent = submission.answer;
                              text.style.whiteSpace = 'pre-wrap';
                              text.style.lineHeight = '1.6';
                              text.style.padding = '20px';
                              text.style.background = '#f9f9f9';
                              text.style.borderRadius = '8px';
                              
                              content.appendChild(closeBtn);
                              content.appendChild(title);
                              content.appendChild(studentInfo);
                              content.appendChild(submittedInfo);
                              content.appendChild(text);
                              modal.appendChild(content);
                              
                              document.body.appendChild(modal);
                            }
                          }}
                          className="action-btn btn-manage"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}