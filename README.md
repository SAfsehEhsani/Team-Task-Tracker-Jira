# 🚀 Team Task Tracker (PulseSync)

> **Enterprise-Grade Jira-style Task Tracker with Role-Based Access Control, Direct SMTP Email Invitations, Interactive Kanban Boards, and Real-Time MongoDB Persistence.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Django](https://img.shields.io/badge/Django-5.0-092E20?logo=django)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/Django_REST-3.15-red)](https://www.django-rest-framework.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## ⚡ Quick Start (Run Locally in 10 Seconds)

> 📖 **Need a step-by-step setup guide for a new computer (ZIP or Git clone)?**  
> Check the plain guide: **[SETUP_AND_RUN_GUIDE.md](./SETUP_AND_RUN_GUIDE.md)**

### 1-Click Launch (Windows)
Double-click **`start.bat`** in this folder!

It automatically:
1. Starts the local MongoDB service.
2. Launches Django Backend on `http://127.0.0.1:8000`.
3. Launches Next.js Frontend on `http://localhost:3000`.

Open your browser: **[http://localhost:3000](http://localhost:3000)**

---

### Manual Launch (Command Line)

**Terminal 1 — Backend:**

1. Start MongoDB Service (Windows)
Open Command Prompt as Administrator and run:

cmd
net start MongoDB
2. Terminal 1: Setup & Launch Backend (Django REST Framework)
In the project root folder, open your first Command Prompt and run:

cmd
:: 1. Create a virtual environment (only needed once)
python -m venv backend_venv
:: 2. Activate the virtual environment
backend_venv\Scripts\activate
:: 3. Install required backend libraries (only needed once)
pip install -r backend\requirements.txt
:: 4. Start the Django backend server
python backend\manage.py runserver 127.0.0.1:8000
Backend status: Running at http://127.0.0.1:8000

3. Terminal 2: Setup & Launch Frontend (Next.js)
Open a new second Command Prompt window in the project root folder and run:

cmd
:: 1. Navigate to the frontend directory
cd frontend
:: 2. Install npm dependencies (only needed once)
npm install
:: 3. Start the Next.js development server
npm run dev
Frontend status: Running at http://localhost:3000

Method 3: For macOS / Linux Users
If someone is using macOS or Linux, they can run the shell script:

bash
chmod +x start.sh
./start.sh
Or manually:

bash
# Terminal 1 (Backend):
python3 -m venv backend_venv
source backend_venv/bin/activate
pip install -r backend/requirements.txt
python backend/manage.py runserver 127.0.0.1:8000
# Terminal 2 (Frontend):
cd frontend
npm install
npm run dev
Access the Application in Your Browser
Once the servers are running, open your web browser:

Web Application (Frontend): http://localhost:3000
Backend API Health Check: http://127.0.0.1:8000/api/health/



```powershell
.\backend_venv\Scripts\python backend\manage.py runserver 127.0.0.1:8000
```

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
```

---

## 🌟 Core Features

* **100% Real Work / No Demo Shortcuts**: Authentication uses real email & password credentials stored in MongoDB with salted PBKDF2 hashing.
* **Strict Role-Based Access Control (RBAC)**:
  * **Admin Role**: Full workspace control, team creation, user management portal (`/users`), role editing (promote/demote), assignment across all members.
  * **Member Role**: Restricted access. Can view assigned tasks, update task statuses, comment, and filter. Cannot see user directory or self-promote.
* **Direct Email Invitations**: Admins invite teammates via email; PulseSync dispatches responsive HTML invitations with secure, single-use cryptographic join tokens.
* **Interactive Kanban Board**: 3 workflow stages (`To Do`, `In Progress`, `Done`), 1-click status transitions, priority badges (`Low`, `Medium`, `High`, `Urgent`), and search/filters.
* **Real-Time Audit Timeline**: Automatic activity logging tracking creations, assignments, status changes, and member onboarding.
* **Admin User Management Portal**: `/users` portal for viewing real-time user registrations, tracking `last_login` timestamps, creating members, editing roles, and deleting accounts.

---

## 📚 Complete Project Documentation

For in-depth architectural details, database schemas, full REST API endpoints reference, and cloud deployment guides, see:
👉 **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)**

---

## 📌 Application Access URLs

* **Frontend Web Application**: [http://localhost:3000](http://localhost:3000)
* **Backend REST API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
* **Backend Health Check**: [http://127.0.0.1:8000/api/health/](http://127.0.0.1:8000/api/health/)
* **MongoDB Storage**: Local MongoDB on `127.0.0.1:27017` (Database: `tasktracker_db`)

---

## 🧪 Automated Testing

Run the automated backend test suites:

```powershell
# Role lock & member privacy test
.\backend_venv\Scripts\python backend/tests/test_member_privacy_and_role_lock.py

# Real user persistence & Admin CRUD test
.\backend_venv\Scripts\python backend/tests/test_admin_user_management.py

# Direct email invitation flow test
.\backend_venv\Scripts\python backend/tests/test_invitation_flow.py
```
