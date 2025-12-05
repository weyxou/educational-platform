import React from 'react';
import './Contact.css';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Спасибо! Сообщение отправлено');
  };

  return (
    <div className="contact-page">

      {/* Hero */}
      <section className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We’re here to help! Drop us a message.</p>
        </div>
      </section>

      {/* Компактная форма + контакты */}
      <section className="contact-compact">
        <div className="container">
          <div className="contact-grid">

            {/* Форма — теперь маленькая и красивая */}
            <div className="contact-form-compact">
              <h2>Send us a Message</h2>
              <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Your Name" required />
                <input type="email" placeholder="Email Address" required />
                <textarea rows="4" placeholder="Your Message" required></textarea>
                <button type="submit" className="send-btn">Send Message</button>
              </form>
            </div>

            {/* Контакты */}
            <div className="contact-info-compact">
              <h2>Get in Touch</h2>
              <div className="info-row">support@educationalplatform.com</div>
              <div className="info-row">+1 (555) 123-4567</div>
              <div className="info-row">San Francisco, CA</div>

              <div className="social-mini">
                <a href="#">Facebook</a>
                <a href="#">Twitter</a>
                <a href="#">LinkedIn</a>
                <a href="#">Instagram</a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;