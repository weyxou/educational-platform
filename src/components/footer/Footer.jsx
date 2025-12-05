import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Top Section */}
        <div className={styles.top}>
          {/* Logo & Description */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>Course</span>
            </div>
            <p className={styles.desc}>
              Unlock your potential with our online design and development courses. 
              Learn from industry experts and enhance your skills.
            </p>
          </div>

          {/* Navigation Links */}
          <div className={styles.links}>
            <div className={styles.linkColumn}>
              <h4 className={styles.linkTitle}>Courses</h4>
              <a href="#" className={styles.link}>Web Design</a>
              <a href="#" className={styles.link}>UI/UX Design</a>
              <a href="#" className={styles.link}>Backend</a>
              <a href="#" className={styles.link}>Frontend</a>
              <a href="#" className={styles.link}>Cybersecurity</a>
            </div>
            <div className={styles.linkColumn}>
              <h4 className={styles.linkTitle}>Company</h4>
              <a href="#" className={styles.link}>About Us</a>
              <a href="#" className={styles.link}>Pricing</a>
              <a href="#" className={styles.link}>Contact</a>
              <a href="#" className={styles.link}>Blog</a>
            </div>
            <div className={styles.linkColumn}>
              <h4 className={styles.linkTitle}>Support</h4>
              <a href="#" className={styles.link}>Help Center</a>
              <a href="#" className={styles.link}>Terms of Service</a>
              <a href="#" className={styles.link}>Privacy Policy</a>
              <a href="#" className={styles.link}>FAQ</a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className={styles.divider} />

        {/* Bottom Section */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2025 Educational Platform. All rights reserved.
          </p>
          <div className={styles.social}>
            <a href="#" className={styles.socialLink} aria-label="Facebook">Facebook</a>
            <a href="#" className={styles.socialLink} aria-label="Twitter">Twitter</a>
            <a href="#" className={styles.socialLink} aria-label="Instagram">Instagram</a>
            <a href="#" className={styles.socialLink} aria-label="LinkedIn">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;