// src/pages/instructor/InstructorDashboard.jsx
import React, { useState } from "react";
import "./InstructorDashboard.css";

const InstructorDashboard = () => {
  // Mock data
  const [filter, setFilter] = useState("active");

  const courses = [
    { id: 1, title: "Advanced React & Redux", students: 68, status: "active", created: "2025-10-15" },
    { id: 2, title: "Python for Data Science", students: 45, status: "active", created: "2025-09-20" },
    { id: 3, title: "UI/UX Design Masterclass", students: 32, status: "archived", created: "2025-06-10" },
  ];

  const notifications = [
    { id: 1, text: "5 students submitted Final Project", time: "2 hours ago" },
    { id: 2, text: "Quiz 'React Hooks' completed by 18 students", time: "5 hours ago" },
    { id: 3, text: "New question in Lesson 8", time: "1 day ago" },
  ];

  const activities = [
    { id: 1, text: "Updated lesson 'Advanced Hooks'", course: "Advanced React", time: "2h ago" },
    { id: 2, text: "Graded 12 assignments", course: "Python for Data Science", time: "5h ago" },
    { id: 3, text: "Published new quiz 'Flexbox'", course: "UI/UX Design", time: "1d ago" },
  ];

  const filteredCourses = courses.filter(c => filter === "all" || c.status === filter);

  return (
    <div className="instructor-dashboard">
      {/* Header */}
      <header className="dash-header">
        <div className="container">
          <h1>Instructor Dashboard</h1>
          <p>Welcome back, <strong>Professor Ivanov</strong></p>
        </div>
      </header>

      <div className="container dashboard-content">
        {/* Quick Create Panel */}
        <div className="quick-create">
          <h3>Quick Actions</h3>
          <div className="quick-buttons">
            <button className="quick-btn primary">Create Course</button>
            <button className="quick-btn">Create Lesson</button>
            <button className="quick-btn">Create Quiz</button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-box">
            <h2>12</h2>
            <p>Total Courses</p>
          </div>
          <div className="stat-box">
            <h2>156</h2>
            <p>Active Students</p>
          </div>
          <div className="stat-box">
            <h2>94%</h2>
            <p>Avg. Attendance</p>
          </div>
          <div className="stat-box">
            <h2>78%</h2>
            <p>Avg. Progress</p>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* My Courses */}
          <div className="courses-section">
            <div className="section-header">
              <h3>My Courses</h3>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="all">All</option>
              </select>
            </div>

            <div className="courses-list">
              {filteredCourses.map(course => (
                <div key={course.id} className="course-item">
                  <div className="course-main">
                    <h4>{course.title}</h4>
                    <span className={`status-badge ${course.status}`}>
                      {course.status === "active" ? "Live" : "Archived"}
                    </span>
                  </div>
                  <div className="course-meta">
                    <span>{course.students} students</span>
                    <span>• Created {new Date(course.created).toLocaleDateString()}</span>
                  </div>
                  <div className="course-actions">
                    <button>Edit</button>
                    <button>Add Lesson</button>
                    <button>Analytics</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications + Recent Activity */}
          <div className="side-panels">
            {/* Notifications */}
            <div className="notification-panel">
              <div className="panel-header">
                <h3>Notifications <span className="badge">3</span></h3>
                <a href="/notifications">View all →</a>
              </div>
              <ul className="notification-list">
                {notifications.map(n => (
                  <li key={n.id}>
                    <strong>{n.text}</strong>
                    <small>{n.time}</small>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Activity */}
            <div className="activity-panel">
              <h3>Recent Activity</h3>
              <ul className="activity-list">
                {activities.map(a => (
                  <li key={a.id}>
                    <div>{a.text}</div>
                    <div className="activity-meta">
                      <small>{a.course} • {a.time}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;