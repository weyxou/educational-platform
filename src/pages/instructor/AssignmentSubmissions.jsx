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
      gradesObj[sub.submissionId] = sub.grade !== null && sub.grade !== undefined ? sub.grade : '';
    });
    
    setFeedback(feedbackObj);
    setGrades(gradesObj);
    setLoading(false);
  };
  
  const saveGrade = (submissionId, studentId) => {
    const grade = grades[submissionId];
    
    // Если поле пустое - не сохраняем
    if (grade === '' || grade === null || grade === undefined) {
      alert('Please enter a grade');
      return;
    }
    
    const numericGrade = parseFloat(grade);
    
    // Проверка на корректность оценки
    if (isNaN(numericGrade)) {
      alert('Please enter a valid number');
      return;
    }
    
    if (numericGrade < 0 || numericGrade > 100) {
      alert('Please enter a grade between 0 and 100');
      return;
    }
    
    // Получаем текущую оценку
    const currentSubmission = submissions.find(sub => sub.submissionId === submissionId);
    const currentGrade = currentSubmission?.grade;
    
    // Проверяем, изменилась ли оценка
    if (currentGrade === numericGrade) {
      return; // Оценка не изменилась
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
    alert('✓ Grade saved successfully!');
  };
  
  const saveFeedback = (submissionId, studentId) => {
    const text = feedback[submissionId] || '';
    
    // Получаем текущий фидбек
    const currentSubmission = submissions.find(sub => sub.submissionId === submissionId);
    const currentFeedback = currentSubmission?.feedback || '';
    
    // Проверяем, изменился ли фидбек
    if (currentFeedback === text) {
      return; // Фидбек не изменился
    }
    
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
    alert('✓ Feedback saved successfully!');
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getGradeColor = (grade) => {
    if (grade === null || grade === undefined || grade === '') return '';
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade)) return '';
    
    if (numGrade >= 90) return 'grade-excellent';
    if (numGrade >= 75) return 'grade-good';
    if (numGrade >= 60) return 'grade-average';
    return 'grade-poor';
  };
  
  const viewFullSubmission = (submission) => {
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
      width: 100%;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
      position: absolute;
      top: 15px;
      right: 15px;
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #666;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s;
    `;
    closeBtn.onclick = () => document.body.removeChild(modal);
    closeBtn.onmouseenter = () => closeBtn.style.background = '#f1f5f9';
    closeBtn.onmouseleave = () => closeBtn.style.background = 'none';
    
    const title = document.createElement('h2');
    title.textContent = `${submission.studentName}'s Submission`;
    title.style.marginBottom = '10px';
    title.style.color = '#1e293b';
    
    const studentInfo = document.createElement('div');
    studentInfo.style.marginBottom = '20px';
    studentInfo.style.paddingBottom = '15px';
    studentInfo.style.borderBottom = '1px solid #e2e8f0';
    
    const email = document.createElement('p');
    email.textContent = `Email: ${submission.studentEmail}`;
    email.style.margin = '5px 0';
    email.style.color = '#64748b';
    
    const submitted = document.createElement('p');
    submitted.textContent = `Submitted: ${formatDate(submission.submittedAt)}`;
    submitted.style.margin = '5px 0';
    submitted.style.color = '#64748b';
    
    const grade = document.createElement('p');
    grade.textContent = `Grade: ${submission.grade !== null && submission.grade !== undefined ? `${submission.grade}/100` : 'Not graded'}`;
    grade.style.margin = '5px 0';
    grade.style.fontWeight = 'bold';
    grade.style.color = submission.grade >= 60 ? '#166534' : '#dc2626';
    
    const textLabel = document.createElement('h4');
    textLabel.textContent = 'Submission Content:';
    textLabel.style.marginTop = '20px';
    textLabel.style.marginBottom = '10px';
    textLabel.style.color = '#374151';
    
    const text = document.createElement('div');
    text.textContent = submission.answer || 'No content submitted';
    text.style.whiteSpace = 'pre-wrap';
    text.style.lineHeight = '1.6';
    text.style.padding = '20px';
    text.style.background = '#f8fafc';
    text.style.borderRadius = '8px';
    text.style.border = '1px solid #e2e8f0';
    text.style.maxHeight = '400px';
    text.style.overflowY = 'auto';
    
    studentInfo.appendChild(email);
    studentInfo.appendChild(submitted);
    studentInfo.appendChild(grade);
    
    content.appendChild(closeBtn);
    content.appendChild(title);
    content.appendChild(studentInfo);
    content.appendChild(textLabel);
    content.appendChild(text);
    
    if (submission.feedback) {
      const feedbackLabel = document.createElement('h4');
      feedbackLabel.textContent = 'Feedback:';
      feedbackLabel.style.marginTop = '20px';
      feedbackLabel.style.marginBottom = '10px';
      feedbackLabel.style.color = '#374151';
      
      const feedbackText = document.createElement('div');
      feedbackText.textContent = submission.feedback;
      feedbackText.style.whiteSpace = 'pre-wrap';
      feedbackText.style.lineHeight = '1.6';
      feedbackText.style.padding = '20px';
      feedbackText.style.background = '#f0fdf4';
      feedbackText.style.borderRadius = '8px';
      feedbackText.style.border = '1px solid #bbf7d0';
      feedbackText.style.color = '#166534';
      
      content.appendChild(feedbackLabel);
      content.appendChild(feedbackText);
    }
    
    modal.appendChild(content);
    document.body.appendChild(modal);
  };
  
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="page-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading submissions...</p>
          </div>
        </div>
      </div>
    );
  }
  
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
          <p><strong>Description:</strong> {assignment?.assignmentDescription || 'No description provided'}</p>
          <p><strong>Due Date:</strong> {assignment?.dueDate ? formatDate(assignment.dueDate) : 'No due date'}</p>
          <p><strong>Total Submissions:</strong> <span className="submission-count">{submissions.length} student(s)</span></p>
          <p><strong>Graded:</strong> {submissions.filter(s => s.grade !== null && s.grade !== undefined).length} of {submissions.length}</p>
        </div>
        
        <section className="courses-section">
          <div className="section-header">
            <h3>Student Submissions</h3>
          </div>
          
          {submissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h4>No submissions yet</h4>
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
                      <td>
                        <div className="submission-date">
                          {formatDate(submission.submittedAt)}
                        </div>
                      </td>
                      <td>
                        <div className="content-preview">
                          {submission.answer?.substring(0, 80) || 'No answer submitted'}
                          {submission.answer?.length > 80 && '...'}
                        </div>
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
                            className={`grade-input ${getGradeColor(grades[submission.submissionId])}`}
                            placeholder="0-100"
                          />
                          <span>/100</span>
                          <button
                            onClick={() => saveGrade(submission.submissionId, submission.studentId)}
                            className="save-grade-btn"
                            title="Save grade"
                          >
                            ✓
                          </button>
                          {submission.grade !== null && submission.grade !== undefined && (
                            <div className={`current-grade ${getGradeColor(submission.grade)}`}>
                              {submission.grade}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="feedback-control">
                          <textarea
                            rows="2"
                            value={feedback[submission.submissionId] || ''}
                            onChange={(e) => setFeedback({
                              ...feedback,
                              [submission.submissionId]: e.target.value
                            })}
                            className="feedback-textarea"
                            placeholder="Enter feedback for student..."
                          />
                          <button
                            onClick={() => saveFeedback(submission.submissionId, submission.studentId)}
                            className="save-feedback-btn"
                            title="Save feedback"
                          >
                            ✓
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => viewFullSubmission(submission)}
                            className="action-btn btn-manage"
                            title="View full submission"
                          >
                            👁️ View
                          </button>
                        </div>
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