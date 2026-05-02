import jsPDF from 'jspdf';

export const generateCertificate = (studentName, studentEmail, courseName, completionDate, courseId, userId, totalLessons) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = 297;
  const pdfHeight = 210;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pdfWidth, pdfHeight, 'F');

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(3);
  doc.rect(10, 10, pdfWidth - 20, pdfHeight - 20);

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1.5);
  doc.rect(13, 13, pdfWidth - 26, pdfHeight - 26);

  for (let i = 0; i < 4; i++) {
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    const offset = 18 + i * 3;
    doc.rect(offset, offset, pdfWidth - (offset * 2), pdfHeight - (offset * 2));
  }

  const corners = [
    { x: 15, y: 15 }, { x: pdfWidth - 15, y: 15 },
    { x: 15, y: pdfHeight - 15 }, { x: pdfWidth - 15, y: pdfHeight - 15 }
  ];
  corners.forEach(corner => {
    for (let i = 0; i < 3; i++) {
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(1);
      const size = 8 - i * 2;
      doc.rect(corner.x - size/2, corner.y - size/2, size, size);
    }
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(128, 128, 128);
  doc.text('D R E A M   E D U', pdfWidth / 2, 35, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(160, 160, 160);
  doc.text('Online Learning Platform', pdfWidth / 2, 45, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(42);
  doc.setTextColor(212, 175, 55);
  doc.text('CERTIFICATE', pdfWidth / 2, 75, { align: 'center' });
  doc.text('OF COMPLETION', pdfWidth / 2, 95, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  doc.text('This certificate is proudly presented to', pdfWidth / 2, 125, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(212, 175, 55);
  doc.text(studentName, pdfWidth / 2, 145, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(studentEmail, pdfWidth / 2, 157, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(80, 80, 80);
  doc.text('has successfully completed the course', pdfWidth / 2, 175, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(212, 175, 55);
  doc.text(courseName, pdfWidth / 2, 192, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  doc.text(`Date of Completion: ${completionDate}`, pdfWidth / 2, 208, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('Certificate ID: ' + courseId + '-' + Date.now(), pdfWidth - 25, pdfHeight - 12, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(212, 175, 55);
  doc.text('DreamEdu', 25, pdfHeight - 12, { align: 'left' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(160, 160, 160);
  doc.text('Authorized Signature', 25, pdfHeight - 5, { align: 'left' });

  const userIdentifier = studentEmail || userId;
  const certificateKey = `certificate_issued_${courseId}_${userIdentifier}`;
  const courseNameKey = `certificate_course_name_${courseId}_${userIdentifier}`;
  const dateKey = `certificate_date_${courseId}_${userIdentifier}`;
  const lessonsKey = `certificate_lessons_count_${courseId}_${userIdentifier}`;

  localStorage.setItem(courseNameKey, courseName);
  localStorage.setItem(dateKey, completionDate);
  localStorage.setItem(lessonsKey, totalLessons.toString());
  localStorage.setItem(certificateKey, 'true');

  const fileName = `${studentName.replace(/\s/g, '_')}_${courseName.replace(/\s/g, '_')}_Certificate.pdf`;
  doc.save(fileName);
};

export const markCertificateIssued = (courseId, userId, totalLessons, userEmail) => {
  const userIdentifier = userEmail || userId;
  localStorage.setItem(`certificate_issued_${courseId}_${userIdentifier}`, 'true');
  localStorage.setItem(`certificate_lessons_count_${courseId}_${userIdentifier}`, totalLessons.toString());
};

export const hasCertificateBeenIssued = (courseId, userId, currentTotalLessons, userEmail) => {
  const userIdentifier = userEmail || userId;
  const issued = localStorage.getItem(`certificate_issued_${courseId}_${userIdentifier}`) === 'true';
  if (!issued) return false;
  
  const lessonsAtCompletion = localStorage.getItem(`certificate_lessons_count_${courseId}_${userIdentifier}`);
  
  if (lessonsAtCompletion && parseInt(lessonsAtCompletion) !== currentTotalLessons) {
    return false;
  }
  
  return true;
};