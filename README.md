## Faculty of Engineering and Informatics
## Department of Computer Engineering

## Student: Makushova Zhibek, Com 22
## Supervisor: Mr.Erustan Erkebulanov

## Deploy: https://educational-platform-zfde.onrender.com

Test Accounts:

| Role | Email | Password |
|------|-------|----------|
| Student | jibek@gmail.com | Qwerty12345@ |
| Instructor | aibek@gmail.com | Qwerty123@ |


## Video Presentation: 

## Installation & Local Setup

Prerequisites
- Node.js (v18 or higher)
- npm or yarn

bash
# Clone the repository
git clone https://github.com/MakushovaZhibek/educational-platform.git

# Navigate to project folder
cd educational-platform

# Install dependencies
npm install

# Start development server
npm run dev



Problem:
Existing educational platforms in Kyrgyzstan (GeekTech, Codify, Bilim) lack flexibility for instructors and students to create and learn structured courses tailored to local educational needs.

Solution:
A React-based web platform with role separation (instructor / student) enabling:
Course creation with clear structure
Quiz functionality and progress tracking
Content adaptation for Kyrgyzstan's requirements

Goal:
Provide instructors with simple yet powerful course creation tools while offering students a convenient and structured learning experience.

## Objectives:
Analyze existing platforms and define UI/UX requirements.
Design component architecture and page structure (React).
Implement role‑based routing with React Router.
Build global state management using Context API.
Integrate REST API via axios (authentication, courses, lessons, assignments).
Implement local storage for lesson progress and student notes.
Ensure responsive design and cross‑device compatibility.
Deployment 


## Tech Stack

- React 19
- React Router DOM
- Axios
- jwt-decode
- Vite
- CSS
- ESLint
- Render (Deployment)


## Screenshots:
<img width="1406" height="768" alt="image" src="https://github.com/user-attachments/assets/b7241533-6f87-4189-bd79-415796504a0e" />

<img width="1405" height="745" alt="image" src="https://github.com/user-attachments/assets/71be4492-a4bf-4711-8433-d4a5f50f957c" />

Student Lesson Page 
<img width="1554" height="906" alt="image" src="https://github.com/user-attachments/assets/9f8d7ddc-2939-4c41-a2c9-971580b9e1eb" />

Instructor Page
<img width="1900" height="893" alt="image" src="https://github.com/user-attachments/assets/53d170f8-49f2-4b05-a58a-dd4390881419" />

## Structure of project:
├── public/
│ ├── images/
│ └── vite.svg
│
├── src/
│ ├── api/ API requests
│ ├── assets/ 
│ ├── common/ Shared logic
│ ├── components/ Reusable UI components
│ ├── context/ React Context (state management)
│ ├── layout/ Layout components
│ │
│ ├── pages/
│ │ ├── instructor/
│ │ └── student/
│ │ ├── CourseAssignments.jsx
│ │ ├── CourseAssignments.css
│ │ ├── StudentDashboard.jsx
│ │ ├── StudentDashboard.css
│ │
│ ├── utils/
│ │
│ ├── Dashboard.jsx
│ ├── LoginPage.jsx
│ ├── RegisterPage.jsx
│ │
│ ├── App.jsx
│ ├── App.css
│ ├── main.jsx
│ └── index.css
│
├── index.html
├── eslint.config.js
├── .gitignore


## Features:
Role-based model (Student / Instructor)
Course management (create, edit, delete courses; enroll/unenroll)
Rich lessons (text, YouTube, MP4, PDF, images; lesson ordering)
Assignments & grading (submit text answers; grade 0–100 + feedback)
Learning progress (mark lessons completed, progress percentage, saved in localStorage)
Personal notes (auto-save notes per lesson)
Continue Learning (resume from first incomplete lesson)
Notifications (toasts and confirmation dialogs)
Responsive design
Media upload (instructors can upload images, videos, PDFs for lessons)


## Acknowledgements

Special thanks to my supervisor **Mr. Erustan Erkebulanov** for his guidance, support, and valuable feedback throughout this diploma project.

Also thanks to the **Department of Computer Science**, **Faculty of Engineering and Informatics**.

## Contact
- **GitHub:** https://github.com/weyxou
- **Email:** nurzhibek.makushova@alatoo.edu.kg
