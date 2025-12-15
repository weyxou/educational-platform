// src/pages/AllCoursesPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from '../../api/api';
import "./Courses.css";

const AllCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Категории должны точно совпадать с тем, что возвращает API
  const categories = [
    { value: "all", label: "All Courses" },
    { value: "Frontend", label: "Frontend" },
    { value: "Backend", label: "Backend" },
    { value: "Data Science", label: "Data Science" },
    { value: "Design", label: "Design" },
    { value: "Security", label: "Security" },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/course/all_courses"); // эндпоинт API
        const instructorCourses = res.data.filter(course => course.instructorName);
        setCourses(instructorCourses);
      } catch (err) {
        console.error("Failed to load courses:", err);
        alert("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
  const matchesSearch =
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.instructorName && course.instructorName.toLowerCase().includes(searchTerm.toLowerCase()));

  const matchesCategory =
    selectedCategory === "all" ||
    (course.category && course.category.toLowerCase() === selectedCategory.toLowerCase());

  return matchesSearch && matchesCategory;
});


  if (loading) return <div className="loading">Loading courses...</div>;

  return (
    <div className="courses-page">
      {/* Hero + Filters */}
      <section className="courses-hero">
        <div className="container">
          <h1>All Courses</h1>
          <p className="subtitle">Choose from courses created by expert instructors</p>
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
            {filteredCourses.length > 0 ? (
              filteredCourses.map(course => (
                <Link
                  to={`/courses/${course.id}/detail`} // Ссылка на детальную страницу курса
                  key={course.id}
                  className="course-square"
                >
                  <div className="course-square-inner">
                    <div className="course-header" style={{ backgroundColor: course.color || "#6366f1" }}>
                      <h3>{course.courseName}</h3>
                      <div className="price-tag">{course.price || "Free"}</div>
                    </div>
                    <div className="course-body">
                      <p className="instructor">by <strong>{course.instructorName}</strong></p>
                      <div className="course-stats">
                        <span>{course.studentsCount || 0} students</span>
                        <span className="rating">★ {course.rating || 0}</span>
                      </div>
                    </div>
                    <div className="course-footer">
                      <span>View Details →</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="no-courses">
                <h3>No courses found</h3>
                <p>Try changing filters or search term</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AllCoursesPage;
