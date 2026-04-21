# EduVantaAZ

### Student Academic Performance Tracking & Mentor Support System
#### with Federated Learning *(In Progress – Semester VII)*

> B.Tech (Computer Science) – VI Semester | 2024-25  
> Department of CS & IT, Maulana Azad National Urdu University (MANUU)  
> **Authors:** Faij Ahamad (23BTCS031HY) · Aayan Aslam (23BTCS033HY)  
> **Supervisor:** Mrs. Geeta Pattun, Assistant Professor, Dept. CS & IT

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [First Admin Setup](#first-admin-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Federated Learning Module](#federated-learning-module)
- [Future Scope](#future-scope)
- [Contributors](#contributors)

---

## Overview

EduVantaAZ is a full-stack web application that bridges the gap between students and their academic mentors through a centralized, data-driven platform. It replaces scattered tools — spreadsheets, email threads, paper records — with a single unified system where academic performance is tracked, mentor-student interactions are structured, and student wellbeing is continuously monitored.

The platform supports three distinct user roles (Admin, Mentor, Student), each with a dedicated dashboard and role-specific functionality. A key planned innovation is a **Federated Learning (FL)** module that will bring privacy-preserving ML to the platform — training models locally on each student's browser using TensorFlow.js, sharing only model weights (never raw data) for central aggregation via the FedAvg algorithm.

---

## Features

### Core Platform (Implemented – Semester VI)

| Feature | Description |
|---|---|
| 🔐 OTP Authentication | Email-based one-time password verification before login/registration |
| 🎯 Target & Goal Tracking | Mentors assign academic targets; students track and update their status |
| 📚 Study Material Upload | Mentors upload PDFs/docs; students access via the platform |
| 🎫 Support Ticket System | Students raise tickets to their mentor; mentors respond and resolve |
| ⏱️ Study Session Logger | Stopwatch-based session tracker to log focused study hours |
| 💚 Wellbeing Module | Students log daily mood, stress levels, and self-assessment notes |
| 📊 Activity Log | Automatic logging of all student academic actions and interactions |
| 📝 Recommendations | Mentors write personalized academic recommendations for students |
| 👤 Admin Panel | Full staff management, subject assignments, and system oversight |
| 📈 Dashboard Charts | Recharts-powered visualizations for performance and session data |

### Federated Learning Module (Planned – Semester VII)

| Feature | Description |
|---|---|
| 🤖 Performance Predictor | Classifies students as Low / Medium / High risk using on-device ML |
| 📖 Material Recommender | Suggests relevant study materials based on individual learning patterns |
| 🔒 Privacy by Design | Raw student data never leaves the device; only weight tensors are shared |
| ⚡ TensorFlow.js | Model training runs in the browser using WebGL — no GPU server needed |
| 🔄 FedAvg Aggregation | Python Flask microservice averages weights from all participating devices |

---

## User Roles

### 🛡️ Administrator
- Create and manage mentor/staff accounts
- Assign subjects to mentors
- View system-wide activity and logs
- Seed first admin via `createFirstAdmin.js`

### 👨‍🏫 Mentor
- View assigned students and their profiles
- Create and monitor academic targets per student
- Write recommendations for students
- Upload and manage study materials
- Respond to and resolve student support tickets

### 👨‍🎓 Student
- View mentor-assigned targets and update their status
- Log study sessions with a built-in stopwatch
- Access uploaded study materials
- Raise support tickets to their mentor
- Submit daily wellbeing logs (mood, stress, notes)
- View personalized recommendations

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React.js | ^19.2.0 | UI component library |
| Vite | ^7.3.1 | Build tool and dev server |
| Tailwind CSS | ^4.2.0 | Utility-first styling |
| React Router DOM | ^7.13.0 | Client-side routing |
| TanStack React Query | ^5.95.2 | Server state management & caching |
| Axios | ^1.14.0 | HTTP client for API calls |
| Recharts | ^3.8.1 | Interactive performance charts |
| Lucide React | ^0.575.0 | Icon library |
| idb | ^8.0.3 | IndexedDB wrapper (for FL model storage) |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | LTS | Server-side runtime |
| Express.js | ^5.2.1 | REST API framework |
| Sequelize | ^6.37.8 | ORM for MySQL |
| MySQL2 | ^3.20.0 | MySQL database driver |
| bcrypt | ^6.0.0 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT authentication |
| Nodemailer | ^8.0.4 | OTP email delivery |
| Multer | ^2.1.1 | File upload handling |
| dotenv | ^17.3.1 | Environment variable management |
| cors | ^2.8.6 | Cross-origin resource sharing |

### Database
- **MySQL** — single relational database with 13 entity tables
- **Sequelize ORM** — model definitions, associations, and auto-sync
- **MySQL Event Scheduler** — auto-purges expired OTPs every minute

### Federated Learning *(Planned)*
- **TensorFlow.js** — in-browser model training (WebGL backend)
- **Python Flask** — FedAvg weight aggregation microservice
- **IndexedDB (idb)** — local model weight persistence between sessions

---

## Project Structure

```
eduvantaaz/
│
├── backend/
│   ├── controllers/          # Route handler logic
│   ├── middleware/           # JWT auth, role-based access
│   ├── models/
│   │   └── sql/              # Sequelize models (Student, Staff, Target, etc.)
│   ├── routes/               # Express route files
│   │   ├── auth.js
│   │   ├── student.js
│   │   ├── mentor.js
│   │   ├── tasks.js
│   │   ├── wellbeing.js
│   │   └── admin.js
│   ├── uploads/              # Uploaded study materials (served statically)
│   ├── utils/                # Helper utilities
│   ├── server.js             # Express app entry point
│   ├── dbSync.js             # Sequelize associations + DB sync
│   ├── sqlConnection.js      # Sequelize instance
│   ├── createFirstAdmin.js   # One-time admin seed script
│   └── .env                  # Environment variables
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Page-level components per route
    │   ├── hooks/            # Custom React hooks
    │   ├── api/              # Axios API call functions
    │   └── main.jsx          # React entry point
    ├── index.html
    ├── vite.config.js        # Vite config with /api proxy to port 2000
    └── package.json
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MySQL** v8.0 or higher (running locally or on a remote server)
- **Git**

---

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/eduvantaaz.git
cd eduvantaaz/backend

# 2. Install dependencies
npm install

# 3. Create your .env file (see Environment Variables section)
cp .env.example .env
# Fill in your DB credentials, JWT secret, and email config

# 4. Start the development server
npm run dev
```

The backend will start on **http://localhost:2000**

On startup, `dbSync.js` will:
- Connect to MySQL
- Auto-create all tables if they don't exist (`sequelize.sync`)
- Set up the OTP auto-purge MySQL event scheduler

---

### Frontend Setup

```bash
# In a new terminal
cd eduvantaaz/frontend

# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The frontend will start on **http://localhost:5173**

> All `/api` requests from the frontend are automatically proxied to `http://localhost:2000` via the Vite proxy config in `vite.config.js`.

---

### First Admin Setup

After starting the backend for the first time, run the admin seeder script to create the initial admin account:

```bash
cd backend
node createFirstAdmin.js
```

This script will:
1. Connect to the database
2. Check if an admin already exists
3. If not, create one using credentials from your `.env` file
4. Log the created admin's details to the console

> You only need to run this once. Running it again when an admin exists does nothing.

---

## Environment Variables

Create a `.env` file in the `/backend` directory with the following variables:

```env
# Server
PORT=2000

# MySQL Database
DB_NAME=eduvantaaz
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Email (for OTP via Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# First Admin Seed (used by createFirstAdmin.js)
FIRST_ADMIN_FULL_NAME=Admin
FIRST_ADMIN_EMAIL=admin@eduvantaaz.com
FIRST_ADMIN_PASSWORD=admin123
FIRST_ADMIN_EMPLOYEE_ID=EMP001
```

> **Gmail users:** Use an [App Password](https://support.google.com/accounts/answer/185833) for `EMAIL_PASS`, not your regular Gmail password.

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require a valid JWT in the `Authorization: Bearer <token>` header.

### Authentication — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/send-otp` | Public | Send OTP to email |
| POST | `/api/auth/verify-otp` | Public | Verify OTP |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| POST | `/api/auth/register` | Admin | Register new student/staff |

### Student — `/api/student`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/student/profile` | Student | Get logged-in student profile |
| PUT | `/api/student/profile` | Student | Update student profile |
| GET | `/api/student/sessions` | Student | Get all study sessions |
| POST | `/api/student/sessions` | Student | Log a new study session |
| GET | `/api/student/activity` | Student | Get activity log entries |

### Mentor — `/api/mentor`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/mentor/students` | Mentor | Get list of assigned students |
| GET | `/api/mentor/materials` | Mentor | Get uploaded materials |
| POST | `/api/mentor/materials` | Mentor | Upload a new study material |
| DELETE | `/api/mentor/materials/:id` | Mentor | Delete a material |

### Tasks — `/api/tasks`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/tasks/targets` | Student/Mentor | Get targets for a student |
| POST | `/api/tasks/targets` | Mentor | Create a new target |
| PUT | `/api/tasks/targets/:id` | Student/Mentor | Update target status |
| DELETE | `/api/tasks/targets/:id` | Mentor | Delete a target |
| GET | `/api/tasks/tickets` | Student/Mentor | Get tickets |
| POST | `/api/tasks/tickets` | Student | Raise a new ticket |
| PUT | `/api/tasks/tickets/:id` | Mentor | Respond to and close a ticket |
| GET | `/api/tasks/recommendations` | Student/Mentor | Get recommendations |
| POST | `/api/tasks/recommendations` | Mentor | Write a recommendation |

### Wellbeing — `/api/wellbeing`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/wellbeing` | Student | Get wellbeing log entries |
| POST | `/api/wellbeing` | Student | Submit a new wellbeing entry |

### Admin — `/api/admin`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/staff` | Admin | List all staff members |
| POST | `/api/admin/staff` | Admin | Create a staff account |
| PUT | `/api/admin/staff/:id` | Admin | Update staff details |
| DELETE | `/api/admin/staff/:id` | Admin | Remove a staff account |
| GET | `/api/admin/subjects` | Admin | List all subjects |
| POST | `/api/admin/subjects` | Admin | Add a new subject |
| POST | `/api/admin/assign-subject` | Admin | Assign subject to a mentor |

### Federated Learning — `/api/ml` *(Planned – Semester VII)*

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/ml/global-model` | Student | Download current global model weights |
| POST | `/api/ml/submit-weights` | Student | Upload local model weights after training |
| GET | `/api/ml/predictions/:studentId` | Mentor | Get performance prediction for a student |

---

## Database Schema

EduVantaAZ uses a single MySQL database with **13 relational tables** (+ 1 planned):

| Table | Key Fields | Relations |
|---|---|---|
| `students` | id, name, email, password, role, rollNo | Central entity |
| `staff` | id, fullName, email, password, role, employeeId | Central entity |
| `subjects` | id, name, code | — |
| `staff_assigned_subjects` | id, staff_id, subject_id | Staff ↔ Subject (many-to-many) |
| `targets` | id, student_id, mentor_id, title, status, deadline | Student + Staff |
| `recommendations` | id, student_id, mentor_id, content, createdAt | Student + Staff |
| `tickets` | id, student_id, mentor_id, subject, message, status, response | Student + Staff |
| `activity_logs` | id, student_id, action, timestamp | Student |
| `study_sessions` | id, student_id, startTime, endTime, duration | Student |
| `otps` | id, email, otp, created_at | Standalone (auto-purged) |
| `materials` | id, mentor_id, title, filePath, uploadedAt | Staff |
| `activities` | id, user_id, label, startTime, endTime | Student |
| `wellbeings` | id, user_id, mood, stress, note, createdAt | Student |
| `model_rounds` *(planned)* | id, round_no, participants, model_version, createdAt | FL tracking |

### Key Associations

```
Student ──< Target          (student_id)
Student ──< Recommendation  (student_id)
Student ──< Ticket          (student_id)
Student ──< StudySession    (student_id)
Student ──< ActivityLog     (student_id)
Student ──< Activity        (user_id)
Student ──< Wellbeing       (user_id)

Staff ──< Target            (mentor_id)
Staff ──< Recommendation    (mentor_id)
Staff ──< Ticket            (mentor_id)
Staff ──< Material          (mentor_id)
Staff ──< StaffAssignedSubject (staff_id)

Subject ──< StaffAssignedSubject (subject_id)
```

---

## Federated Learning Module

> ⚠️ This module is currently **under development** and will be completed in **Semester VII**.

### Why Federated Learning?

Student behavioral data (study hours, wellbeing logs, performance patterns) is highly sensitive. Traditional ML requires sending this data to a central server for training — a privacy risk. Federated Learning solves this by keeping all raw data on the student's device and sharing only model weight vectors.

### How It Works

```
Step 1  →  Student browser downloads current global model from /api/ml/global-model
Step 2  →  TensorFlow.js trains the model locally on student's own data (IndexedDB)
Step 3  →  Local model weights extracted and serialized (float32 array)
Step 4  →  Weights submitted via POST /api/ml/submit-weights (NOT raw data)
Step 5  →  Flask microservice collects N submissions and runs FedAvg:
              w_global = (1/N) × Σ w_i
Step 6  →  Updated global model saved; ModelRound table updated
Step 7  →  New global model available for next round
```

### ML Models

**Model 1 — Student Performance Predictor**
- Architecture: 2-layer dense neural network (ReLU activation, Softmax output)
- Input: study session duration, target completion rate, activity frequency, ticket count, wellbeing score
- Output: Low Risk / Medium Risk / High Risk classification
- Shown on: Mentor dashboard as a risk badge per student

**Model 2 — Study Material Recommender**
- Architecture: Collaborative filtering with embedding layer
- Input: subject-wise target scores, material access history, session duration per subject
- Output: Top-N ranked material recommendations
- Shown on: Student dashboard as a "Recommended for You" section

### FedAvg Algorithm

```
Given N participating student devices with local weights w_1, w_2, ..., w_N:

  w_global = (1/N) × Σ w_i    (uniform average)

Weighted variant (by local dataset size n_i):

  w_global = Σ (n_i / n_total) × w_i
```

### Privacy Guarantees

- ✅ Raw student data never leaves the device
- ✅ Weight submissions linked to anonymized participant tokens
- ✅ All API communication over HTTPS (production)
- ✅ Opt-in participation — platform works fully without FL
- 🔜 Differential Privacy (Gaussian noise) — planned future enhancement

---

## Future Scope

### Core Platform
- **Real-Time Notifications** — WebSocket (Socket.io) for instant ticket and material alerts
- **Mobile Application** — React Native app for Android and iOS
- **In-App Chat** — Direct messaging between student and assigned mentor
- **Attendance Tracking** — Mentor marks and monitors student attendance
- **Calendar Integration** — Mentor schedules sessions with deadline-linked reminders
- **Multi-Language Support** — Urdu, Hindi, and regional language UI

### AI + GUI Skill Enhancement
- **AI Study Planner** — ML-generated personalized weekly timetable based on session patterns
- **Skill Gap Radar Chart** — Visual subject-wise gap analysis vs. class average
- **Adaptive Quiz Module** — IRT-based difficulty adjustment per student
- **Emotion-Aware Wellbeing Chatbot** — NLP-powered mood trend analysis and suggestions
- **Mentor Effectiveness Score** — ML-derived scorecard for admin analytics

### Platform Growth
- **Analytics Dashboard for Admins** — Institution-wide performance and engagement metrics
- **Dark Mode Toggle** — Light/dark theme for extended study sessions
- **Parent/Guardian Portal** — Read-only academic summary view
- **Multi-Institution Support** — Multi-tenant architecture for cross-institution FL

---

## License

This project is developed as an academic submission for the B.Tech (Computer Science) degree at MANUU. All rights reserved by the authors.

---