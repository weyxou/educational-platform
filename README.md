# Educational Platform

A web-based educational platform built with React that supports role-based access (Student / Instructor), course management, assignments, and learning progress tracking.

## Live Demo
https://educational-platform-zfde.onrender.com

## Test Accounts

| Role       | Email             | Password     |
|------------|------------------|--------------|
| Student    | jibek@gmail.com  | Qwerty12345@ |
| Instructor | aibek@gmail.com  | Qwerty123@   |


## Academic Information

Faculty of Engineering and Informatics  
Department of Computer Engineering  

Student: Makushova Zhibek, Com 22  
Supervisor: Mr. Erustan Erkebulanov  



## Problem

Existing educational platforms in Kyrgyzstan (GeekTech, Codify, Bilim) lack flexibility for instructors and students to create and follow structured courses tailored to local educational needs.

## Solution

The developed platform provides:

- Role-based access (student / instructor)
- Structured course creation
- Assignment and quiz functionality
- Learning progress tracking
- Adaptation to local educational requirements

## Goal

To provide instructors with simple and effective tools for course creation, and students with a structured and convenient learning experience.

## Objectives

- Analyze existing platforms and define UI/UX requirements  
- Design component architecture and application structure  
- Implement role-based routing using React Router  
- Develop global state management using Context API  
- Integrate REST API using Axios  
- Implement local storage for progress tracking and notes  
- Ensure responsive design across devices  
- Deploy the application  


## Technology Stack

- React 19  
- React Router DOM  
- Axios  
- jwt-decode  
- Vite  
- CSS  
- ESLint  
- Render (Deployment)  



## Installation and Local Setup

### Prerequisites

- Node.js (v18 or higher)  
- npm or yarn  

### Steps

```bash
git clone https://github.com/MakushovaZhibek/educational-platform.git
cd educational-platform
npm install
npm run dev
````



## Features

* Role-based system (Student / Instructor)
* Course management (create, edit, delete, enroll, unenroll)
* Lesson content support (text, video, PDF, images)
* Assignment submission and grading
* Progress tracking (stored in localStorage)
* Personal notes per lesson
* Continue learning functionality
* Notifications and confirmations
* Responsive interface
* Media upload for instructors



## Screenshots

### Login Page

<img src="https://github.com/user-attachments/assets/b7241533-6f87-4189-bd79-415796504a0e" />

### Register Page

<img src="https://github.com/user-attachments/assets/71be4492-a4bf-4711-8433-d4a5f50f957c" />

### Student Lesson Page

<img src="https://github.com/user-attachments/assets/9f8d7ddc-2939-4c41-a2c9-971580b9e1eb" />

### Instructor Panel

<img src="https://github.com/user-attachments/assets/53d170f8-49f2-4b05-a58a-dd4390881419" />


## Project Structure

.
├── public/
│   ├── images/
│   └── vite.svg
│
├── src/
│   ├── api/            # API requests
│   ├── assets/         
│   ├── common/         # Shared logic
│   ├── components/     # Reusable UI components
│   ├── context/        # Global state (Context API)
│   ├── layout/         # Layout components
│
│   ├── pages/
│   │   ├── instructor/
│   │   └── student/
│   │       ├── CourseAssignments.jsx
│   │       ├── CourseAssignments.css
│   │       ├── StudentDashboard.jsx
│   │       ├── StudentDashboard.css
│
│   ├── utils/
│
│   ├── Dashboard.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── eslint.config.js
└── .gitignore


## Acknowledgements

Special thanks to Mr. Erustan Erkebulanov for guidance and support throughout this project.

## Contact

GitHub: [https://github.com/weyxou]
Email: [nurzhibek.makushova@alatoo.edu.kg]
