import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <NavLink to="/" className={styles.logoLink}>
                <span className={styles.logoIcon}>DreamEdu</span>
              </NavLink>
            </div>
            <p className={styles.desc}>
             Learn new skills or teach what you know on our platform built for growth and connection.
            </p>
          </div>
          <div className={styles.links}>
            <div className={styles.linkColumn}>
              <h4 className={styles.linkTitle}>Courses</h4>
              <NavLink to="/courses/web-design" className={styles.link}>Web Design</NavLink>
              <NavLink to="/courses/uiux" className={styles.link}>UI/UX Design</NavLink>
              <NavLink to="/courses/backend" className={styles.link}>Backend</NavLink>
              <NavLink to="/courses/frontend" className={styles.link}>Frontend</NavLink>
              <NavLink to="/courses/cybersecurity" className={styles.link}>Cybersecurity</NavLink>
            </div>
            <div className={styles.linkColumn}>
              <h4 className={styles.linkTitle}>Company</h4>
              <NavLink to="/about" className={styles.link}>About Us</NavLink>
              <NavLink to="/pricing" className={styles.link}>Pricing</NavLink>
              <NavLink to="/contact" className={styles.link}>Contact</NavLink>
              <NavLink to="/blog" className={styles.link}>Blog</NavLink>
            </div>
            <div className={styles.linkColumn}>
              <h4 className={styles.linkTitle}>Support</h4>
              <NavLink to="/help" className={styles.link}>Help Center</NavLink>
              <NavLink to="/terms" className={styles.link}>Terms of Service</NavLink>
              <NavLink to="/privacy" className={styles.link}>Privacy Policy</NavLink>
              <NavLink to="/faq" className={styles.link}>FAQ</NavLink>
            </div>
          </div>
        </div>

        <hr className={styles.divider} />
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            2025 Educational Platform. All rights reserved.
          </p>
          <div className={styles.social}>
            <a href="#" className={styles.socialLink} aria-label="Facebook">
             <img src="\images\facebook.svg" alt="" />
            </a>
            <a href="#" className={styles.socialLink} aria-label="Instagram">
              <img src="\images\insta.svg" alt="" />
            </a>
            <a href="#" className={styles.socialLink} aria-label="LinkedIn">
             <img src="\images\linkedin.svg" alt="" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;