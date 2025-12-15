import React from 'react';
import styles from './Benefits.module.css';

const benefitsData = [
  {
    number: '01',
    title: 'Learn at Your Own Pace',
    desc: 'Access courses anytime, anywhere, and study according to your own schedule.',
  },
  {
    number: '02',
    title: 'Industry Experts',
    desc: 'Gain knowledge from experienced instructors who work in the field.',
  },
  {
    number: '03',
    title: 'Wide Range of Courses',
    desc: 'Explore various subjects including tech, business, design, and more.',
  },
  {
    number: '04',
    title: 'Up-to-Date Content',
    desc: 'Stay ahead with courses that reflect the latest industry trends and skills.',
  },
  {
    number: '05',
    title: 'Hands-On Projects',
    desc: 'Work on real-world projects to build a strong portfolio for future opportunities.',
  },
  {
    number: '06',
    title: 'Collaborative Learning',
    desc: 'Engage with peers, share ideas, and enhance your learning through discussion.',
  },
];

const Benefits = () => {
  return (
    <section className={styles.benefits}>
      <div className={styles.container}>
        <h2 className={styles.title}>Why Choose Our Platform</h2>
        <p className={styles.subtitle}>
          Our online educational platform is designed to help you learn effectively, build new skills, and achieve your career goals with flexible and interactive courses.
        </p>

        <div className={styles.grid}>
          {benefitsData.map((item, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.number}>{item.number}</div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.desc}</p>
              <div className={styles.arrow}>→</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
