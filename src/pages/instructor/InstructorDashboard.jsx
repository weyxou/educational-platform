import { useEffect, useState } from 'react';
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
  const [newCourse, setNewCourse] = useState({ courseName: '', description: '', duration: '' });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const [settingsData, setSettingsData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });


  // Load instructor's courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/course/all_courses');
        const myCourses = response.data.filter(c => c.instructorId === user?.userAccountId);
        setCourses(myCourses);
      } catch (err) {
        showToast('Failed to load courses', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (user?.userAccountId) fetchCourses();
  }, [user, showToast]);
  

  useEffect(() => {
    const data = {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    };
    setProfileData(data);
  }, [user]);


// Collect all students enrolled across instructor courses
  const fetchStudents = async () => {
    if (!courses.length) return;
    setStudentsLoading(true);
    try {
      const enrolledStudentsMap = new Map();
      for (const course of courses) {
        try {
          const res = await api.get(`/enrollment/view_enrolled_students/${course.courseId}`);
          const enrollments = res.data;
          enrollments.forEach(enrollment => {
            if (!enrolledStudentsMap.has(enrollment.studentId)) {
              enrolledStudentsMap.set(enrollment.studentId, {
                studentId: enrollment.studentId,
                studentName: enrollment.studentName || `Student ${enrollment.studentId}`,
                email: enrollment.email || '',
                courses: [course.courseName],
              });
            } else {
              enrolledStudentsMap.get(enrollment.studentId).courses.push(course.courseName);
            }
          });
        } catch (err) {
          console.error(`Failed fetch enrollments for course ${course.courseId}`);
        }
      }
      setStudents(Array.from(enrolledStudentsMap.values()));
    } catch (err) {
      showToast('Failed to load students', 'error');
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'students' && courses.length > 0) {
      fetchStudents();
    }
  }, [activeTab, courses]);

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/course/add_course', { ...newCourse, instructorId: user.userAccountId });
      setCourses([...courses, res.data]);
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
    try {
      await api.put(`/course/update/course_id/${editingCourse.courseId}`, editingCourse);
      setCourses(courses.map(c => c.courseId === editingCourse.courseId ? editingCourse : c));
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
          localStorage.removeItem(`instructor_lessons_${courseId}`);
          localStorage.removeItem(`instructor_assignments_${courseId}`);
          localStorage.removeItem(`instructor_submissions_${courseId}`);
          setCourses(courses.filter(c => c.courseId !== courseId));
          showToast('Course deleted successfully!', 'success');
        } catch (err) {
          showToast('Failed to delete course', 'error');
        }
      },
      'Delete the Course?'
    );
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    try {
      await api.put(`/student/update_profile/${user.userAccountId}`, profileData);
      updateUser(profileData);
      setIsEditingProfile(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleSettingsChange = (e) => {
    setSettingsData({ ...settingsData, [e.target.name]: e.target.value });
  };

  const saveSettings = async () => {
    try {
      await api.put(`/student/update_profile/${user.userAccountId}`, {
        firstName: settingsData.firstName,
        lastName: settingsData.lastName,
        email: settingsData.email,
      });
      updateUser({
        firstName: settingsData.firstName,
        lastName: settingsData.lastName,
        email: settingsData.email,
      });
      setProfileData({
        firstName: settingsData.firstName,
        lastName: settingsData.lastName,
        email: settingsData.email,
      });
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
                    <div key={course.courseId} className="course-card" onClick={() => navigate(`/courses/${course.courseId}/lessons`)}>
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
                          {student.courses.map((course, idx) => (
                            <span key={idx} className="course-tag">{course}</span>
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
                    <div className="info-item"><label>Full Name</label><p>{profileData.firstName} {profileData.lastName}</p></div>
                    <div className="info-item"><label>Email</label><p>{profileData.email}</p></div>
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
                  <input name="firstName" value={settingsData.firstName} onChange={handleSettingsChange} placeholder="First Name" />
                </div>
                <div className="settings-group">
                  <label>Last Name</label>
                  <input name="lastName" value={settingsData.lastName} onChange={handleSettingsChange} placeholder="Last Name" />
                </div>
                <div className="settings-group">
                  <label>Email</label>
                  <input name="email" value={settingsData.email} onChange={handleSettingsChange} placeholder="Email" />
                </div>
                <button onClick={saveSettings} className="btn btn-primary">Save Settings</button>
              </div>
            </section>
          )}
        </main>
      </div>

      {isCreateModalOpen && (
        <CourseModal title="Create New Course" course={newCourse} setCourse={setNewCourse} onClose={() => setIsCreateModalOpen(false)} onSave={createCourse} saveBtnText="Create Course" />
      )}

      {isEditModalOpen && editingCourse && (
        <CourseModal title="Edit Course" course={editingCourse} setCourse={setEditingCourse} onClose={() => setIsEditModalOpen(false)} onSave={saveCourseChanges} saveBtnText="Save Changes" />
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
            <input value={course.courseName} onChange={(e) => setCourse({ ...course, courseName: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={course.description} onChange={(e) => setCourse({ ...course, description: e.target.value })} rows="4" />
          </div>
          <div className="form-group">
            <label>Duration</label>
            <input value={course.duration} onChange={(e) => setCourse({ ...course, duration: e.target.value })} placeholder="e.g., 8 weeks" />
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