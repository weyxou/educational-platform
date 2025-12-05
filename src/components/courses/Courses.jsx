// src/pages/AllCoursesPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Courses.css";

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const allCourses = [
    { id: 1, title: "Advanced React & Redux", instructor: "Prof. Ivanov", students: 156, rating: 4.9, category: "frontend", price: "$89", color: "#6366f1" },
    { id: 2, title: "Python for Data Science", instructor: "Dr. Smith", students: 98, rating: 4.8, category: "data", price: "$99", color: "#10b981" },
    { id: 3, title: "UI/UX Design Masterclass", instructor: "Anna Petrova", students: 124, rating: 5.0, category: "design", price: "$79", color: "#f59e0b" },
    { id: 4, title: "Backend with Node.js", instructor: "Michael Lee", students: 87, rating: 4.7, category: "backend", price: "$95", color: "#8b5cf6" },
    { id: 5, title: "Cybersecurity Fundamentals", instructor: "Prof. Brown", students: 67, rating: 4.9, category: "security", price: "$110", color: "#ef4444" },
    { id: 6, title: "Vue.js + Nuxt Mastery", instructor: "Sarah Kim", students: 102, rating: 4.8, category: "frontend", price: "$85", color: "#14b8a6" },
    { id: 7, title: "Machine Learning A-Z", instructor: "Dr. Chen", students: 189, rating: 4.9, category: "data", price: "$129", color: "#8b5cf6" },
    { id: 8, title: "Full-Stack JavaScript", instructor: "Alex Turner", students: 134, rating: 4.8, category: "backend", price: "$105", color: "#3b82f6" },
  ];

  const categories = [
    { value: "all", label: "All Courses" },
    { value: "frontend", label: "Frontend" },
    { value: "backend", label: "Backend" },
    { value: "data", label: "Data Science" },
    { value: "design", label: "Design" },
    { value: "security", label: "Security" },
  ];

  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="courses-page">
      {/* Hero */}
      <section className="courses-hero">
        <div className="container">
          <h1>All Courses</h1>
          <p className="subtitle">Choose from 50+ courses created by expert instructors</p>
          
          <div className="filters-bar">
            <input
              type="text"
              placeholder="Search courses or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="courses-grid-section">
        <div className="container">
          <div className="courses-grid">
            {filteredCourses.map(course => (
              <Link to={`/course/${course.id}`} key={course.id} className="course-square">
                <div className="course-square-inner">
                  <div className="course-header" style={{ backgroundColor: course.color }}>
                    <h3>{course.title}</h3>
                    <div className="price-tag">{course.price}</div>
                  </div>
                  <div className="course-body">
                    <p className="instructor">by <strong>{course.instructor}</strong></p>
                    <div className="course-stats">
                      <span>{course.students} students</span>
                      <span className="rating">★ {course.rating}</span>
                    </div>
                  </div>
                  <div className="course-footer">
                    <span>View Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="no-courses">
              <h3>No courses found</h3>
              <p>Try changing filters or search term</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Courses;