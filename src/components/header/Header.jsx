// src/components/Header.jsx
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header() {
  const location = useLocation(); // чтобы подсвечивать активную ссылку

  // Функция для проверки, активна ли ссылка
  const isActive = (path) => {
    return location.pathname === path ? styles.active : '';
  };

  return (
    <header className={styles.header}>
      <div className={`${styles.container} ${styles.headerContent}`}>
        
        {/* Логотип — переход на главную */}
        <div className={styles.logo}>
          <Link to="/">
            <span>Educational Platform</span>
          </Link>
        </div>

        {/* Навигация */}
        <nav className={styles.nav}>
          <Link to="/" className={isActive('/')}>
            Home
          </Link>
          <Link to="/courses" className={isActive('/courses')}>
            Courses
          </Link>
        <Link to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
  About Us
</Link>
          <Link to="/contact" className={isActive('/contact')}>
            Contact
          </Link>
        </nav>

        {/* Кнопки авторизации */}
        <div className={styles.authButtons}>
          <Link to="/register" className={styles.signup}>
            Sign Up
          </Link>
          <Link to="/login" className={styles.login}>
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}