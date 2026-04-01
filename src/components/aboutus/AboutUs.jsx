import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-us-page">
      {/* HERO */}
      <section className="about-hero">
        <div className="container">
          <h1>About Us</h1>
          <p className="hero-subtitle">
            We are passionate about making high-quality education accessible to everyone,
            anytime and anywhere.
          </p>
        </div>
      </section>

      {/* MISSION */}
      <section className="about-section">
        <div className="container">
          <h2 className="section-title">Our Mission</h2>
          <p className="section-text">
            To empower learners worldwide by providing flexible, expert-led online courses
            that fit into busy lifestyles and help people achieve their career and personal goals.
          </p>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us</h2>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-number">01</div>
              <h3>Flexible Learning</h3>
              <p>
                Study anytime, anywhere at your own pace without strict schedules.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-number">02</div>
              <h3>Expert Instructors</h3>
              <p>
                Learn from professionals with real-world experience in their fields.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-number">03</div>
              <h3>Modern Skills</h3>
              <p>
                Courses designed for today’s job market and future career growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="team-section">
        <div className="container">
          <h2 className="section-title">Our Team</h2>
          <p className="section-text">
            We are a team of developers, designers, and educators united by one goal —
            to build the best online learning platform.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;