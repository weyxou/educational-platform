import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { getAssignments } from '../utils/assignmentStorage';
import './CourseLessonsView.css';

export default function CourseLessonsView() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загружаем курс
        const courseRes = await api.get(`/course/course_id/${courseId}`);
        setCourse(courseRes.data);

        // Загружаем уроки
        const lessonsRes = await api.get(`/lesson/get_all_lessons/${courseId}`);
        setLessons(lessonsRes.data || []);
        
        // Загружаем задания (для студентов)
        if (!isInstructor) {
          const courseAssignments = getAssignments(courseId);
          console.log('Assignments loaded:', courseAssignments);
          setAssignments(courseAssignments || []);
        }
      } catch (err) {
        console.error('Error loading course data:', err);
        // Если API недоступен, пробуем получить из localStorage
        try {
          const savedCourses = JSON.parse(localStorage.getItem('all_courses') || '[]');
          const foundCourse = savedCourses.find(c => c.courseId == courseId);
          if (foundCourse) {
            setCourse(foundCourse);
          }
          
          if (!isInstructor) {
            const courseAssignments = getAssignments(courseId);
            setAssignments(courseAssignments || []);
          }
        } catch (localErr) {
          console.error('Error loading from localStorage:', localErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, isInstructor]);

  if (loading) return <div className="loading">Loading course...</div>;
  if (!course) return <div className="not-found">Course not found</div>;

  const visibleLessons = lessons;
  const backLink = isInstructor ? '/instructor/dashboard' : '/student/dashboard';

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  return (
    <div className="course-view-container">
      <div className="course-header">
        <Link to={backLink} className="back-link">
          ← Back to Dashboard
        </Link>

        <h1>{course.courseName}</h1>

        {course.description && (
          <p className="course-desc">{course.description}</p>
        )}

        {course.duration && (
          <span className="course-duration">
            Duration: {course.duration}
          </span>
        )}
      </div>

      {/* Кнопка Assignments для студентов - ПЕРЕМЕЩЕНА ВНЕРХ */}
      {!isInstructor && (
        <div className="assignments-section" style={{ 
          marginBottom: '2rem',
          backgroundColor: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e9ecef'
        }}>
          <div className="section-header" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem' 
          }}>
            <h2 style={{ margin: 0 }}>Course Assignments</h2>
            <Link 
              to={`/courses/${courseId}/assignments`} 
              className="btn btn-primary"
              style={{
                backgroundColor: '#0d6efd',
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              View All Assignments ({assignments.length})
            </Link>
          </div>
          
          {assignments.length > 0 ? (
            <>
              <div className="assignments-preview" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                {assignments.slice(0, 2).map(assignment => (
                  <div 
                    key={assignment.assignmentId} 
                    className="assignment-preview-card"
                    style={{
                      backgroundColor: 'white',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6'
                    }}
                  >
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{assignment.assignmentTitle}</h4>
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: '#666', 
                      marginBottom: '0.5rem',
                      minHeight: '40px'
                    }}>
                      {assignment.assignmentDescription?.substring(0, 100) || 'No description'}
                      {assignment.assignmentDescription?.length > 100 && '...'}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                      <strong>Due:</strong> {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                    </p>
                    <Link 
                      to={`/courses/${courseId}/assignments`} 
                      className="btn btn-secondary"
                      style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        padding: '0.4rem 1rem',
                        fontSize: '0.9rem',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        display: 'inline-block'
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
              
              {assignments.length > 2 && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <Link 
                    to={`/courses/${courseId}/assignments`} 
                    className="view-more-link"
                    style={{
                      color: '#0d6efd',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}
                  >
                    + {assignments.length - 2} more assignments →
                  </Link>
                </div>
              )}
            </>
          ) : (
            <p style={{ textAlign: 'center', color: '#666', margin: '1rem 0' }}>
              No assignments available yet. Your instructor will add them soon.
            </p>
          )}
        </div>
      )}

      {/* Lessons Section */}
      <div className="lessons-list" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Course Lessons ({visibleLessons.length})</h2>

        {visibleLessons.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 0', 
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '1px dashed #dee2e6'
          }}>
            {isInstructor
              ? 'This course has no lessons yet. Add the first lesson in the management section.'
              : 'This course has no lessons yet.'}
          </div>
        ) : (
          <div className="lessons-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {visibleLessons.map((lesson, index) => {
              const youtubeId = getYouTubeId(lesson.youtubeUrl);
              
              return (
                <div 
                  key={lesson.lessonId} 
                  className="lesson-card"
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div className="lesson-number" style={{
                    backgroundColor: '#f8f9fa',
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    color: '#666',
                    borderBottom: '1px solid #e9ecef'
                  }}>
                    Lesson {index + 1}
                  </div>

                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0' }}>{lesson.lessonName}</h3>

                    {youtubeId ? (
                      <div className="video-thumbnail" style={{
                        position: 'relative',
                        marginBottom: '1rem',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <img
                          src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                          alt={lesson.lessonName}
                          style={{
                            width: '100%',
                            height: '180px',
                            objectFit: 'cover'
                          }}
                        />
                        <div className="play-icon" style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '60px',
                          height: '60px',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          color: '#ff0000'
                        }}>
                          ▶
                        </div>
                      </div>
                    ) : (
                      <div className="no-video" style={{
                        backgroundColor: '#e9ecef',
                        padding: '2rem',
                        textAlign: 'center',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        color: '#666'
                      }}>
                        Text Lesson
                      </div>
                    )}

                    {lesson.content && (
                      <p className="lesson-preview" style={{
                        color: '#666',
                        fontSize: '0.95rem',
                        lineHeight: '1.5',
                        marginBottom: '1.5rem'
                      }}>
                        {lesson.content.substring(0, 150)}
                        {lesson.content.length > 150 && '...'}
                      </p>
                    )}
                  </div>

                  {/* Start lesson button (students only) */}
                  {!isInstructor && (
                    <div style={{ 
                      padding: '1rem 1.5rem', 
                      borderTop: '1px solid #e9ecef',
                      marginTop: 'auto'
                    }}>
                      <Link
                        to={`/courses/${courseId}/lesson/${lesson.lessonId}`}
                        className="continue-btn"
                        style={{
                          display: 'block',
                          backgroundColor: '#0d6efd',
                          color: 'white',
                          padding: '0.75rem',
                          textAlign: 'center',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontWeight: '500',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#0b5ed7'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#0d6efd'}
                      >
                        Start Lesson →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}