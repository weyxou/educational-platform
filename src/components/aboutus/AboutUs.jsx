import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-us-page">
      {/* Hero заголовок */}
      <section className="about-hero">
        <h1>About Us</h1>
        <p className="hero-subtitle">
          We are passionate about making high-quality education accessible to everyone, 
          anytime and anywhere.
        </p>
      </section>

      {/* Наша миссия */}
      <section className="about-section">
        <div className="container">
          <h2 className="section-title">Our Mission</h2>
          <p className="section-text">
            To empower learners worldwide by providing flexible, expert-led online courses 
            that fit into busy lifestyles and help people achieve their career and personal goals.
          </p>
        </div>
      </section>

      {/* Преимущества / Почему выбирают нас */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="section-title benefits-title">Why Choose Us</h2>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-number">01</div>
              <h3>Flexible Learning Schedule</h3>
              <p>
                Fit your coursework around your existing commitments and obligations. 
                Study at your own pace, whenever and wherever you want.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-number">02</div>
              <h3>Expert Instruction</h3>
              <p>
                Learn from industry experts who have hands-on experience in design, 
                development, marketing and many other fields.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-number">03</div>
              <h3>Diverse Course Offerings</h3>
              <p>
                Explore a wide range of up-to-date courses covering the most in-demand 
                skills in today's job market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Команда (по желанию можно добавить фото/имена) */}
      <section className="team-section">
        <div className="container">
          <h2 className="section-title">Our Team</h2>
          <p className="section-text team-intro">
            We are a group of educators, developers, and designers united by one goal — 
            to deliver the best online learning experience.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;