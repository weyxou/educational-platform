import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useNotification } from '../../context/AlertCustom';
import './InstructorDashboard.css';

export default function InstructorDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { showToast, confirm } = useNotification();

  const [activeTab, setActiveTab] = useState('mycourses');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    description: '',
    duration: ''
  });

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const extractData = (response) => {
    const data = response.data;
    return Array.isArray(data) ? data : (data?.content || []);
  };

  useEffect(() => {
    if (!user?.userAccountId) return;

    const loadCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get('/course/all_courses');
        const allCourses = extractData(res);
        const myCourses = allCourses.filter(c => c.instructorId === user.userAccountId);
        setCourses(myCourses);
      } catch (err) {
        showToast('Failed to load courses', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [user?.userAccountId, showToast]);

  useEffect(() => {
    setProfile({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
  }, [user]);

  const loadStudents = useCallback(async () => {
    if (!courses.length) return;

    setStudentsLoading(true);
    try {
      const studentMap = new Map();

      for (const course of courses) {
        try {
const res = await api.get(`/enrollment/course/${course.courseId}`);
          const enrollments = extractData(res);
          enrollments.forEach(enrollment => {
            if (!studentMap.has(enrollment.studentId)) {
              studentMap.set(enrollment.studentId, {
                studentId: enrollment.studentId,
                studentName: enrollment.studentName || `Student ${enrollment.studentId}`,
                email: enrollment.email || '',
                courses: [course.courseName],
              });
            } else {
              studentMap.get(enrollment.studentId).courses.push(course.courseName);
            }
          });
        } catch (err) {
          console.warn(`Failed to load students for course ${course.courseId}`);
        }
      }

      setStudents(Array.from(studentMap.values()));
    } catch (err) {
      showToast('Failed to load students', 'error');
    } finally {
      setStudentsLoading(false);
    }
  }, [courses, showToast]);

  useEffect(() => {
    if (activeTab === 'students') {
      loadStudents();
    }
  }, [activeTab, loadStudents]);

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/course/add_course', {
        ...newCourse,
        instructorId: user.userAccountId,
      });

      setCourses(prev => [...prev, data]);
      setIsCreateModalOpen(false);
      setNewCourse({ courseName: '', description: '', duration: '' });

      showToast('Course created successfully!', 'success');
    } catch (err) {
      showToast('Failed to create course', 'error');
    }
  };

  const openEditModal = (course) => {
    setEditingCourse({ ...course });
    setIsEditModalOpen(true);
  };

  const saveCourseChanges = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      await api.put(`/course/update/course_id/${editingCourse.courseId}`, editingCourse);

      setCourses(prev =>
        prev.map(c => (c.courseId === editingCourse.courseId ? editingCourse : c))
      );

      setIsEditModalOpen(false);
      showToast('Course updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update course', 'error');
    }
  };

  const deleteCourse = (courseId) => {
    confirm(
      'Delete this course? All lessons and assignments will be deleted permanently.',
      async () => {
        try {
          await api.delete(`/course/delete/course_id/${courseId}`);

          ['lessons', 'assignments', 'submissions'].forEach(key => {
            localStorage.removeItem(`instructor_${key}_${courseId}`);
          });

          setCourses(prev => prev.filter(c => c.courseId !== courseId));
          showToast('Course deleted successfully!', 'success');
        } catch (err) {
          showToast('Failed to delete course', 'error');
        }
      },
      'Delete the Course?'
    );
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const saveSettings = async () => {
    try {
      await api.put(`/student/update_profile/${user.userAccountId}`, profile);
      updateUser(profile);
      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    }
  };

  return (
    <div className="instructor-dashboard">
      <div className="dashboard-layout">
        <button 
          className="burger-menu" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">
            <h2>DreamEdu</h2>
          </div>
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'mycourses' ? 'active' : ''}`}
              onClick={() => { setActiveTab('mycourses'); setIsSidebarOpen(false); }}
            >
              <span className="nav-icon"></span> My Courses
            </button>
            <button
              className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => { setActiveTab('students'); setIsSidebarOpen(false); }}
            >
              <span className="nav-icon"></span> Students
            </button>
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
            >
              <span className="nav-icon"></span> Profile
            </button>
            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
            >
              <span className="nav-icon"></span> Settings
            </button>
          </nav>
        </aside>

        {isSidebarOpen && <div className="overlay" onClick={() => setIsSidebarOpen(false)}></div>}

        <main className="main-content">
          <div className="dashboard-header">
            <div className="header-left">
              <h1>Welcome back, {user?.firstName || 'Instructor'}!</h1>
              <p className="header-subtitle">Manage your courses, track student progress, and grow your impact</p>
            </div>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>

          {activeTab === 'mycourses' && (
            <section className="courses-section">
              <div className="section-header">
                <div>
                  <h3>My Courses</h3>
                  <p className="section-subtitle">{courses.length} course{courses.length !== 1 ? 's' : ''} in total</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(true)} className="create-course-btn">+ Create New Course</button>
              </div>

              {loading ? (
                <div className="loading-state"><div className="spinner"></div><p>Loading...</p></div>
              ) : (
                <div className="courses-grid">
                  {courses.map(course => (
                    <div 
                      key={course.courseId} 
                      className="course-card" 
                      onClick={() => navigate(`/courses/${course.courseId}/lessons`)}
                    >
                      <div className="course-card-header">
                        <div className="course-icon"></div>
                        <span className="status-badge active">Active</span>
                      </div>
                      <h4 className="course-title">{course.courseName}</h4>
                      <p className="course-description">{course.description || 'No description'}</p>
                      <div className="course-meta">
                        <span className="meta-item">{course.duration || 'Self-paced'}</span>
                      </div>
                      <div className="course-actions" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => openEditModal(course)} className="action-btn edit">Edit</button>
                        <button onClick={() => deleteCourse(course.courseId)} className="action-btn delete">Delete</button>
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon"></div>
                      <h4>No courses yet</h4>
                      <button onClick={() => setIsCreateModalOpen(true)} className="empty-create-btn">Create Your First Course</button>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {activeTab === 'students' && (
            <section className="students-section">
              <div className="section-header">
                <h3>Enrolled Students</h3>
                <p className="section-subtitle">Students enrolled in your courses</p>
              </div>
              {studentsLoading ? (
                <div className="loading-state"><div className="spinner"></div><p>Loading students...</p></div>
              ) : students.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"></div>
                  <h4>No students yet</h4>
                  <p>Students who enroll in your courses will appear here</p>
                </div>
              ) : (
                <div className="students-grid">
                  {students.map(student => (
                    <div key={student.studentId} className="student-card">
                      <div className="student-avatar"></div>
                      <div className="student-info">
                        <h4>{student.studentName}</h4>
                        <p className="student-email">{student.email}</p>
                        <div className="student-courses">
                          {student.courses.map((courseName, idx) => (
                            <span key={idx} className="course-tag">{courseName}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'profile' && (
            <section className="profile-section">
              <div className="profile-header"><h2>Profile Information</h2></div>
              <div className="profile-card">
                <div className="profile-view">
                  <div className="profile-info-grid">
                    <div className="info-item">
                      <label>Full Name</label>
                      <p>{profile.firstName} {profile.lastName}</p>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <p>{profile.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="settings-section">
              <div className="section-header">
                <h3>Settings</h3>
                <p className="section-subtitle">Edit your profile and preferences</p>
              </div>
              <div className="settings-card">
                <div className="settings-group">
                  <label>First Name</label>
                  <input 
                    name="firstName" 
                    value={profile.firstName} 
                    onChange={handleProfileChange} 
                    placeholder="First Name" 
                  />
                </div>
                <div className="settings-group">
                  <label>Last Name</label>
                  <input 
                    name="lastName" 
                    value={profile.lastName} 
                    onChange={handleProfileChange} 
                    placeholder="Last Name" 
                  />
                </div>
                <div className="settings-group">
                  <label>Email</label>
                  <input 
                    name="email" 
                    value={profile.email} 
                    onChange={handleProfileChange} 
                    placeholder="Email" 
                  />
                </div>
                <button onClick={saveSettings} className="btn btn-primary">Save Settings</button>
              </div>
            </section>
          )}
        </main>
      </div>

      {isCreateModalOpen && (
        <CourseModal 
          title="Create New Course" 
          course={newCourse} 
          setCourse={setNewCourse} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSave={createCourse} 
          saveBtnText="Create Course" 
        />
      )}

      {isEditModalOpen && editingCourse && (
        <CourseModal 
          title="Edit Course" 
          course={editingCourse} 
          setCourse={setEditingCourse} 
          onClose={() => setIsEditModalOpen(false)} 
          onSave={saveCourseChanges} 
          saveBtnText="Save Changes" 
        />
      )}
    </div>
  );
}

function CourseModal({ title, course, setCourse, onClose, onSave, saveBtnText }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSave} className="course-form">
          <div className="form-group">
            <label>Course Name</label>
            <input 
              value={course.courseName} 
              onChange={(e) => setCourse({ ...course, courseName: e.target.value })} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={course.description} 
              onChange={(e) => setCourse({ ...course, description: e.target.value })} 
              rows="4" 
            />
          </div>
          <div className="form-group">
            <label>Duration</label>
            <input 
              value={course.duration} 
              onChange={(e) => setCourse({ ...course, duration: e.target.value })} 
              placeholder="e.g., 8 weeks" 
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{saveBtnText}</button>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}