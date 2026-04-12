import React from 'react';
import styles from './Benefits.module.css';

const benefitsData = [
  {
    number: '01',
    title: 'Learn or Teach at Your Own Pace',
    desc: 'Study new skills or share your knowledge whenever it works for you — no strict schedules.',
    gradient: 'gradient1',
  },
  {
    number: '02',
    title: 'Learn from Real Experience',
    desc: 'Get insights from professionals in the industry or become one and teach others.',
    gradient: 'gradient2',
  },
  {
    number: '03',
    title: 'Everything in One Place',
    desc: 'From tech and business to design and more — learn or teach whatever you’re passionate about.',
    gradient: 'gradient3',
  },
  {
    number: '04',
    title: 'Always Up to Date',
    desc: 'Courses evolve with industry trends, so learners and instructors stay relevant.',
    gradient: 'gradient1',
  },
  {
    number: '05',
    title: 'Learn by Doing',
    desc: 'Build real projects as a student or guide learners through practical, hands-on experience as an instructor.',
    gradient: 'gradient2',
  },
  {
    number: '06',
    title: 'Grow Together',
    desc: 'Connect with others, share feedback, and learn in a supportive community.',
    gradient: 'gradient3',
  },
];

const Benefits = () => {
  return (
    <section className={styles.benefits}>
      <div className={styles.container}>
        <h2 className={styles.title}>Why Choose Our Platform</h2>
        <p className={styles.subtitle}>
Our platform helps you learn new skills, grow your career, or share your knowledge with others through flexible and interactive learning.        </p>

        <div className={styles.grid}>
          {benefitsData.map((item, index) => (
            <div key={index} className={`${styles.card} ${styles[item.gradient]}`}>
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