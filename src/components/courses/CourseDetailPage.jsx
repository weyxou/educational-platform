// src/pages/CourseDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/api";

export default function CourseDetailPage() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем информацию о курсе
        const courseRes = await api.get(`/course/course_id/${courseId}`);
        setCourse(courseRes.data);

        // Получаем уроки курса
        const lessonsRes = await api.get(`/lesson/get_all_lessons/${courseId}`);
        setLessons(lessonsRes.data);
      } catch (err) {
        console.error("Ошибка загрузки курса или уроков:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading) return <div className="loading">Loading course...</div>;
  if (!course) return <div className="not-found">Course not found</div>;

  return (
    <div className="course-detail-page">
      <div className="course-header">
        <Link to="/student/dashboard" className="back-link">← Back to Dashboard</Link>
        <h1>{course.courseName}</h1>
        {course.description && <p className="course-desc">{course.description}</p>}
        {course.duration && <span className="course-duration">Duration: {course.duration}</span>}
        {course.category && <span className="course-category">Category: {course.category}</span>}
      </div>

      <div className="instructor-info">
        <h2>Instructor</h2>
        <p><strong>Name:</strong> {course.instructorName}</p>
        {course.instructorEmail && <p><strong>Email:</strong> {course.instructorEmail}</p>}
        {course.instructorBio && <p><strong>Bio:</strong> {course.instructorBio}</p>}
      </div>

      <div className="lessons-list">
        <h2>Lessons ({lessons.length})</h2>
        {lessons.length === 0 ? (
          <p>No lessons available for this course yet.</p>
        ) : (
          <ul>
            {lessons.map((lesson, index) => (
              <li key={lesson.lessonId}>
                <Link to={`/lesson/${lesson.lessonId}`}>
                  {index + 1}. {lesson.lessonName}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
