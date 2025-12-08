import React from 'react';
import styles from './Benefits.module.css';

const benefitsData = [
  {
    number: '01',
    title: 'Flexible Learning Schedule',
    desc: 'Fit your coursework around your existing commitments and obligations.',
  },
  {
    number: '02',
    title: 'Expert Instruction',
    desc: 'Learn from industry experts who have hands-on experience in design and development.',
  },
  {
    number: '03',
    title: 'Diverse Course Offerings',
    desc: 'Explore a wide range of design and development courses covering various topics.',
  },
  {
    number: '04',
    title: 'Updated Curriculum',
    desc: 'Access courses with up-to-date content reflecting the latest trends and industry practices.',
  },
  {
    number: '05',
    title: 'Practical Projects and Assignments',
    desc: 'Develop a portfolio showcasing your skills and abilities to potential employers.',
  },
  {
    number: '06',
    title: 'Interactive Learning Environment',
    desc: 'Collaborate with fellow learners, exchanging ideas and feedback to enhance your understanding.',
  },
];

const Benefits = () => {
  return (
    <section className={styles.benefits}>
      <div className={styles.container}>
        <h2 className={styles.title}>Benefits</h2>
        <p className={styles.subtitle}>
          Lorem ipsum dolor sit amet consectetur. Tempus tincidunt et sit elit imperdiet et. Cras eu sit dignissim lorem nibh et. Ac cum eget habitasse in velit fringilla feugiat senectus in.
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