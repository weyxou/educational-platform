// src/components/Header.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../assets/logo.png';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Функция для определения класса активной ссылки
  const getLinkClass = ({ isActive }) => {
    return isActive ? `${styles.navLink} ${styles.active}` : styles.navLink;
  };

  // Закрыть меню при клике на ссылку
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Переключение меню
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={`${styles.container} ${styles.headerContent}`}>
        
        {/* Логотип — переход на главную */}
        <div className={styles.logo}>
          <NavLink to="/" onClick={handleLinkClick}>
            <img 
              src={logo}
              alt="Logo" 
              className={styles.logoImage}
            />
          </NavLink>
        </div>

        {/* Бургер-иконка */}
        <button 
          className={`${styles.burger} ${isMenuOpen ? styles.burgerActive : ''}`}
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
        </button>

        {/* Мобильное меню */}
        <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
          {/* Навигация */}
          <nav className={styles.nav}>
            <NavLink to="/home" className={getLinkClass} onClick={handleLinkClick}>
              Home
            </NavLink>
            <NavLink to="/courses" className={getLinkClass} onClick={handleLinkClick}>
              Courses
            </NavLink>
            <NavLink to="/about" className={getLinkClass} onClick={handleLinkClick}>
              About Us
            </NavLink>
            <NavLink to="/contact" className={getLinkClass} onClick={handleLinkClick}>
              Contact
            </NavLink>
          </nav>

          {/* Кнопки авторизации */}
          <div className={styles.authButtons}>
            <NavLink to="/register" className={styles.signup} onClick={handleLinkClick}>
              Sign Up
            </NavLink>
            <NavLink to="/login" className={styles.login} onClick={handleLinkClick}>
              Login
            </NavLink>
          </div>
        </div>

        {/* Десктопная навигация (скрывается на мобильных) */}
        <div className={styles.desktopNav}>
          <nav className={styles.navDesktop}>
            <NavLink to="/home" className={getLinkClass}>
              Home
            </NavLink>
            <NavLink to="/courses" className={getLinkClass}>
              Courses
            </NavLink>
            <NavLink to="/about" className={getLinkClass}>
              About Us
            </NavLink>
            <NavLink to="/contact" className={getLinkClass}>
              Contact
            </NavLink>
          </nav>

          {/* Десктопные кнопки авторизации */}
          <div className={styles.authButtonsDesktop}>
            <NavLink to="/register" className={styles.signup}>
              Sign Up
            </NavLink>
            <NavLink to="/login" className={styles.login}>
              Login
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}