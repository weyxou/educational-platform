// const INSTRUCTOR_ASSIGNMENTS_KEY = 'instructor_assignments';
// const ASSIGNMENTS_PREFIX = 'assignments_';

// export const saveAssignments = (courseId, assignments) => {
//   try {
//     const allAssignments = JSON.parse(localStorage.getItem(INSTRUCTOR_ASSIGNMENTS_KEY) || '{}');
//     allAssignments[courseId] = assignments;
//     localStorage.setItem(INSTRUCTOR_ASSIGNMENTS_KEY, JSON.stringify(allAssignments));
//         localStorage.setItem(`${ASSIGNMENTS_PREFIX}${courseId}`, JSON.stringify(assignments));
    
//     const submissionKey = `instructor_submissions_${courseId}`;
//     if (!localStorage.getItem(submissionKey)) {
//       localStorage.setItem(submissionKey, JSON.stringify([]));
//     }
    
//     console.log('Assignments saved for course:', courseId, assignments);
//     return true;
//   } catch (error) {
//     console.error('Error saving assignments:', error);
//     return false;
//   }
// };

// export const getAssignments = (courseId) => {
//   try {
//     const allAssignments = JSON.parse(localStorage.getItem(INSTRUCTOR_ASSIGNMENTS_KEY) || '{}');
//     const assignments = allAssignments[courseId] || [];
    
//     if (assignments.length === 0) {
//       const newFormat = localStorage.getItem(`${ASSIGNMENTS_PREFIX}${courseId}`);
//       if (newFormat) {
//         return JSON.parse(newFormat);
//       }
//     }
    
//     return assignments;
//   } catch (error) {
//     console.error('Error getting assignments:', error);
//     return [];
//   }
// };

// export const addAssignment = (courseId, assignment) => {
//   const assignments = getAssignments(courseId);
//   const newAssignment = {
//     ...assignment,
//     assignmentId: assignment.assignmentId || Date.now(),
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString()
//   };
  
//   const updatedAssignments = [...assignments, newAssignment];
//   saveAssignments(courseId, updatedAssignments);
//   return newAssignment;
// };
// export const updateAssignment = (courseId, assignmentId, updates) => {
//   const assignments = getAssignments(courseId);
//   const updatedAssignments = assignments.map(a => 
//     a.assignmentId == assignmentId 
//       ? { ...a, ...updates, updatedAt: new Date().toISOString() }
//       : a
//   );
//   saveAssignments(courseId, updatedAssignments);
//   return updatedAssignments.find(a => a.assignmentId == assignmentId);
// };

// export const deleteAssignment = (courseId, assignmentId) => {
//   const assignments = getAssignments(courseId);
//   const updatedAssignments = assignments.filter(a => a.assignmentId != assignmentId);
//   saveAssignments(courseId, updatedAssignments);
//   return true;
// };

// export const getSubmissions = (courseId) => {
//   try {
//     return JSON.parse(localStorage.getItem(`instructor_submissions_${courseId}`) || '[]');
//   } catch (error) {
//     console.error('Error getting submissions:', error);
//     return [];
//   }
// };

// export const saveSubmission = (courseId, submission) => {
//   try {
//     const submissions = getSubmissions(courseId);
//     const filtered = submissions.filter(
//       s => !(s.assignmentId === submission.assignmentId && s.studentId === submission.studentId)
//     );
//     const updated = [...filtered, submission];
//     localStorage.setItem(`instructor_submissions_${courseId}`, JSON.stringify(updated));
//     return true;
//   } catch (error) {
//     console.error('Error saving submission:', error);
//     return false;
//   }
// };
// export const saveStudentSubmission = (studentId, courseId, assignmentId, submission) => {
//   try {
//     const studentKey = `student_${studentId}_submissions`;
//     const studentData = JSON.parse(localStorage.getItem(studentKey) || '{}');
    
//     if (!studentData[courseId]) {
//       studentData[courseId] = {};
//     }
    
//     studentData[courseId][assignmentId] = submission;
//     localStorage.setItem(studentKey, JSON.stringify(studentData));
//     return true;
//   } catch (error) {
//     console.error('Error saving student submission:', error);
//     return false;
//   }
// };
