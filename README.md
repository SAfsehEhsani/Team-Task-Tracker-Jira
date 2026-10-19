# 🚀 Team Task Tracker (PulseSync)

> **Enterprise-Grade Jira-style Task Management Platform with Role-Based Access Control, Real-Time MongoDB Persistence, Live Database Inspector, and Interactive Kanban Boards.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Django](https://img.shields.io/badge/Django-6.1.2-092E20?logo=django)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/Django_REST-3.18-red)](https://www.django-rest-framework.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## ⚡ Quick Start: How to Run the Application

> 📖 **Need a complete printable PDF or plain markdown guide?**
> - **[SETUP_AND_RUN_GUIDE.pdf](./SETUP_AND_RUN_GUIDE.pdf)** (Printable 2-page manual with bold commands)
> - **[SETUP_AND_RUN_GUIDE.md](./SETUP_AND_RUN_GUIDE.md)** (Full setup document)

### Prerequisites
Make sure your machine has:
1. **Python 3.10+**
2. **Node.js 18+ (with npm)**
3. **MongoDB** (Local MongoDB service running on port 27017 or a MongoDB Atlas URI)

---

### Option A: 1-Click Launch (Windows — Recommended)
Simply double-click **`start.bat`** in the project root folder (or run `.\start.bat` in Command Prompt).

**What `start.bat` does automatically:**
1. Verifies the local MongoDB service is running.
2. Automatically creates `backend_venv` on your computer and installs all packages from `backend\requirements.txt`.
3. Automatically installs frontend dependencies via `npm install`.
4. Launches Backend on `http://127.0.0.1:8000` and Frontend on `http://localhost:3000`.
5. Automatically opens `http://localhost:3000` in your default browser!

---

### Option B: Manual Step-by-Step Launch (Command Line)

**1. Start MongoDB Service (Windows):**
```cmd
net start MongoDB
```

**2. Terminal 1 — Backend (Django REST Framework):**
```cmd
:: 1. Create a virtual environment (only needed once)
python -m venv backend_venv

:: 2. Activate the virtual environment
backend_venv\Scripts\activate

:: 3. Install required backend libraries (only needed once)
pip install -r backend\requirements.txt

:: 4. Start the Django backend server
python backend\manage.py runserver 127.0.0.1:8000
```
*Backend runs on: `http://127.0.0.1:8000`*

**3. Terminal 2 — Frontend (Next.js):**
```cmd
:: 1. Navigate to the frontend directory
cd frontend

:: 2. Install npm dependencies (only needed once)
npm install

:: 3. Start the Next.js development server
npm run dev
```
*Frontend runs on: `http://localhost:3000`*

---

### Option C: macOS / Linux Launch
```bash
chmod +x start.sh
./start.sh
```

Or manually:
```bash
# Terminal 1 (Backend):
python3 -m venv backend_venv
source backend_venv/bin/activate
pip install -r backend/requirements.txt
python backend/manage.py runserver 127.0.0.1:8000

# Terminal 2 (Frontend):
cd frontend
npm install
npm run dev
```

---

## 🔑 Pre-Configured Demo Credentials

You can test immediately using either pre-seeded role account, or register a custom account:

| Role | Email Address | Password | Permissions & Access |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@teamtracker.local` | `Admin@12345` | Full workspace control: Create teams, add members, assign tasks to anyone, live MongoDB data inspector |
| **Team Member** | `alice.chen@techcorp.io` | `Alice@12345` | Member access: View assigned tasks, update workflow status (To-Do, In Progress, In Review, Done) |

*You can also click **"Create an account"** on the login page to register a new Admin or Member account.*

---

## 🌟 Core Features & Capabilities

### 1. Dual-Role Registration & Strict RBAC
- Users can choose to register as either an **Administrator** or a **Team Member** directly during signup.
- **Admin Privileges**: Create teams, invite/add members directly, assign tasks to any registered member, access the Live Database Inspector, view audit logs.
- **Member Privileges**: View assigned tasks, move tasks across Kanban stages, filter by priority. Protected from administrative endpoints.

### 2. Live MongoDB Data Inspector (`Storage: MongoDB`)
- Admins can click the **"Storage: MongoDB"** stat card on the dashboard to open an interactive, live JSON data explorer.
- Inspects real-time collections (`users`, `teams`, `tasks`, `activities`, `invitations`) directly from the database with live document counts, formatted JSON view, and 1-click clipboard copy.

### 3. Comprehensive Team Lifecycle Management
- **Multi-Member Team Creation**: Select multiple registered members when creating a new team.
- **Direct Member Addition**: Admins can add any registered member into an existing team via a clean modal without waiting for email confirmations.
- **Direct Email Invitations**: Send tokenized email invites with secure cryptographic join links.

### 4. Cross-Team & All-Member Task Assignment
- When creating or editing tasks, Admins are presented with all registered system members in the assignee dropdown, ensuring no member is excluded regardless of team boundaries.

### 5. Jira-Style Interactive Kanban Board
- **Workflow Columns**: `To Do`, `In Progress`, `In Review`, and `Done`.
- **Task Prioritization**: `Low`, `Medium`, `High`, and `Urgent` visual priority tags.
- **Task Details Modal**: Due date pickers, assignee selectors, priority chips, and rich description fields.

### 6. Real-Time Activity & Audit Timeline
- Comprehensive audit trail automatically tracking every system mutation:
  - Task creation, assignments, and status updates.
  - Team creation, member additions, and role updates.

### 7. Enterprise Security
- Stateless JWT authentication with signed tokens.
- Secure PBKDF2 password hashing (no plain-text passwords stored).
- Strict CORS configuration and Django REST permission decorators (`IsAdminUser`, `IsAuthenticated`).

---

## 🏛️ System Design & Architecture

For detailed architectural diagrams, MongoDB collection schemas, and sequence flows, see:  
👉 **[SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)**

```
┌────────────────────────────────────────────────────────┐
│             Next.js 16 / React 19 Frontend             │
│      (Dashboard, Kanban Board, Live Inspector, Auth)   │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (Bearer JWT)
┌───────────────────────────▼────────────────────────────┐
│         Django REST Framework Backend (Port 8000)      │
│   (Auth Service, Team Orchestration, Task Engine, RBAC)│
└───────────────────────────┬────────────────────────────┘
                            │ PyMongo Driver
┌───────────────────────────▼────────────────────────────┐
│             MongoDB Document Store (Port 27017)        │
│   (Collections: users, teams, tasks, activities)       │
└────────────────────────────────────────────────────────┘
```

---

## 🔗 Application Access Endpoints

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Health Check Endpoint**: [http://127.0.0.1:8000/api/health/](http://127.0.0.1:8000/api/health/)
- **Live Database Inspector API**: [http://127.0.0.1:8000/api/auth/database-inspector/](http://127.0.0.1:8000/api/auth/database-inspector/) *(Admin only)*

---

## 🧪 Automated Testing

Run the backend automated test suites to verify role locks, privacy, and team persistence:

```powershell
# Role verification & member privacy test
.\backend_venv\Scripts\python backend/tests/test_member_privacy_and_role_lock.py

# User registration & Admin management test
.\backend_venv\Scripts\python backend/tests/test_admin_user_management.py

# Complete role registration flow verification
.\backend_venv\Scripts\python backend/tests/verify_registration_roles.py
```
