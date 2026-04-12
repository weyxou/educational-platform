import React from 'react';
import './Contact.css';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you! Message sent');
  };


  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We are always here to help!</p>
        </div>
      </section>

      <section className="contact-compact">
        <div className="container">
          <div className="contact-grid">



            <div className="contact-form-compact">
              <h2>Send us a Message</h2>
              <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Your Name" required />
                <input type="email" placeholder="Email Address" required />
                <textarea rows="4" placeholder="Your Message" required></textarea>
                <button type="submit" className="send-btn">Send message</button>
              </form>
            </div>
            <div className="contact-info-compact">
              <h2>Information</h2>
              <div className="info-row">support@educationalplatform.com</div>
              <div className="info-row">+996 707000999</div>
              <div className="info-row">Bishkek, Kyrgyzstan</div>

              <div className="social-mini">
                <a href="#">Facebook</a>
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