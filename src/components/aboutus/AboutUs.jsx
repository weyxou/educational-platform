import React, { useEffect, useRef } from "react";
import "./AboutUs.css";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const statsRef = useRef(null);

  const navigate = useNavigate();

    const handleStartLearning = () => {
    navigate("/register");
  };

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
            We believe learning should be simple, accessible, and meaningful — whether you're
    starting your journey as a student or sharing your experience as an instructor.
          </p>
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
        <div className="benefit-number"></div>
        <h3>Flexible Learning & Teaching</h3>
        <p>
          Learn or teach anytime, from any device — on your own schedule.
        </p>
      </div>

      <div className="benefit-card fade-up">
        <img 
          src="/images/instructors.jpg" 
          alt="Expert Community" 
          className="benefit-image"
        />
        <div className="benefit-number"></div>
        <h3>Expert Community</h3>
        <p>
          Learn from industry professionals or share your knowledge as an instructor.
        </p>
      </div>

      <div className="benefit-card fade-up">
        <img 
          src="/images/skills.jpg" 
          alt="Practical Growth" 
          className="benefit-image"
        />
        <div className="benefit-number"></div>
        <h3>Practical Skills & Growth</h3>
        <p>
          Gain real-world skills or help others build them through hands-on teaching.
        </p>
      </div>

    </div>
  </div>
</section>
  <section>
        <div className="cta-buttons">
          <button onClick={handleStartLearning}>  Join as Student or Instructor
</button>
        </div>
        
      </section>


    <section className="about-section">
  <div className="container">
    <div className="mission-grid">

      <div className="mission-text fade-up">
        <h2>Grow your skills, share what you know</h2>

        <p className="mission-description">
          Whether you're here to learn something new or teach what you already know,
          we’re here to support your journey.
        </p>

        <ul className="mission-features">
          <li>Learn practical skills that you can use right away</li>
          <li>Get guidance and prepare for real career opportunities</li>
          <li>Build projects instead of just watching lessons</li>
          <li>Teach others and grow as an expert in your field</li>
        </ul>

        <div className="mission-cta">
          <button className="mission-link">Explore platform</button>
        </div>
      </div>

      <div className="mission-image fade-up">
        <div className="image-placeholder">
          <img src="public/images/tIED7.jpg" alt="Learning community" />
        </div>
      </div>

    </div>
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