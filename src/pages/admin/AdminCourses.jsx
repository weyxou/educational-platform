import { useState, useEffect } from 'react';
import api from '../../api/api';
import { useNotification } from '../../context/AlertCustom';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast, confirm } = useNotification();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/courses');
      setCourses(res.data);
    } catch (err) {
      console.error('Error loading courses:', err);
      showToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = (courseId, courseName) => {
    confirm(`Delete course "${courseName}"? All lessons and assignments will be deleted.`, async () => {
      try {
        await api.delete(`/admin/courses/${courseId}`);
        showToast('Course deleted successfully', 'success');
        loadCourses();
      } catch (err) {
        console.error('Error deleting course:', err);
        showToast('Failed to delete course', 'error');
      }
    }, 'Delete Course');
  };

  const filteredCourses = courses.filter(course =>
    course.courseName?.toLowerCase().includes(search.toLowerCase()) ||
    course.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="admin-courses-page">
      <div className="courses-header">
        <h2>Course Management</h2>
        <button onClick={loadCourses} className="refresh-btn">Refresh</button>
      </div>
      <div className="courses-search">
        <input type="text" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
      </div>
      <div className="courses-grid">
        {filteredCourses.map(course => (
          <div key={course.courseId} className="admin-course-card">
            <div className="course-card-header">
              <div className="course-icon">📚</div>
              <span className="course-id">ID: {course.courseId}</span>
            </div>
            <h3 className="course-title">{course.courseName}</h3>
            <p className="course-description">{course.description || 'No description'}</p>
            <div className="course-meta">
              <span>Instructor ID: {course.instructorId}</span>
              <span>{course.duration || 'Self-paced'}</span>
            </div>
            <button onClick={() => handleDeleteCourse(course.courseId, course.courseName)} className="delete-course-btn">Delete Course</button>
          </div>
        ))}
      </div>
      {filteredCourses.length === 0 && <div className="empty-state"><div className="empty-icon">📭</div><h4>No courses found</h4></div>}
    </div>
  );
}