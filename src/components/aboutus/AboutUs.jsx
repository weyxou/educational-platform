import React, { useEffect, useRef } from "react";
import "./AboutUs.css";

const AboutUs = () => {
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-us-page">
      <section className="about-hero">
        <div className="container">
          <h1 className="fade-up">About Us</h1>
          <p className="hero-subtitle fade-up">
            We are passionate about making high-quality education accessible to everyone,
            anytime and anywhere.
          </p>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card fade-up">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat-card fade-up">
              <div className="stat-number">50+</div>
              <div className="stat-label">Expert Instructors</div>
            </div>
            <div className="stat-card fade-up">
              <div className="stat-number">120+</div>
              <div className="stat-label">Courses</div>
            </div>
            <div className="stat-card fade-up">
              <div className="stat-number">4.9</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </section>


 <section className="benefits-section">
  <div className="container">
    <h2 className="section-title fade-up">Why Choose Us</h2>
    <div className="benefits-grid">
      <div className="benefit-card fade-up">
        <img 
          src="/images/learning.jpg" 
          alt="Flexible Learning" 
          className="benefit-image"
        />
        <div className="benefit-number">01</div>
        <h3>Flexible Learning</h3>
        <p>Study anytime, anywhere at your own pace without strict schedules.</p>
      </div>
      <div className="benefit-card fade-up">
        <img 
          src="/images/instructors.jpg" 
          alt="Expert Instructors" 
          className="benefit-image"
        />
        <div className="benefit-number">02</div>
        <h3>Expert Instructors</h3>
        <p>Learn from professionals with real-world experience in their fields.</p>
      </div>
      <div className="benefit-card fade-up">
        <img 
          src="/images/skills.jpg" 
          alt="Modern Skills" 
          className="benefit-image"
        />
        <div className="benefit-number">03</div>
        <h3>Modern Skills</h3>
        <p>Courses designed for today’s job market and future career growth.</p>
      </div>
    </div>
  </div>
</section>

      <section className="about-section">
        <div className="container">
          <h2 className="section-title fade-up">Our Mission</h2>
          <p className="section-text fade-up">
            To empower learners worldwide by providing flexible, expert-led online courses
            that fit into busy lifestyles and help people achieve their career and personal goals.
          </p>
        </div>
      </section>

    

      <section className="team-section">
        <div className="container">
          <h2 className="section-title fade-up">Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-card fade-up">
              <div className="team-photo placeholder"></div>
              <h3>Alex Morgan</h3>
              <p>Founder & CEO</p>
            </div>
            <div className="team-card fade-up">
              <div className="team-photo placeholder"></div>
              <h3>Jamie Lee</h3>
              <p>Head of Education</p>
            </div>
            <div className="team-card fade-up">
              <div className="team-photo placeholder"></div>
              <h3>Taylor Chen</h3>
              <p>Lead Developer</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonial-section">
        <div className="container">
          <h2 className="section-title fade-up">What Our Students Say</h2>
          <div className="testimonial-grid">
            <div className="testimonial-card fade-up">
              <div className="testimonial-text">
                "This platform changed my career! The courses are well-structured and the instructors are amazing."
              </div>
              <div className="testimonial-author">— Sarah Johnson</div>
            </div>
            <div className="testimonial-card fade-up">
              <div className="testimonial-text">
                "Flexible schedule and high-quality content. I completed 3 courses and already got a promotion."
              </div>
              <div className="testimonial-author">— Michael Brown</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;