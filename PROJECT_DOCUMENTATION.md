# 🚀 Team Task Tracker (PulseSync) — Master Project Documentation

> **A modern, enterprise-ready Jira-style Team Task Tracker featuring strict Role-Based Access Control (Admin vs. Member), Direct HTML Email Invitations, Interactive Kanban Boards, Real-Time Activity Audit Timelines, and 100% Real MongoDB Data Persistence.**

---

## 📑 Table of Contents
1. [Project Overview & Key Highlights](#project-overview--key-highlights)
2. [System Architecture & Technology Stack](#system-architecture--technology-stack)
3. [Core Functionalities & Features](#core-functionalities--features)
   - [Strict Role-Based Access Control (RBAC)](#1-strict-role-based-access-control-rbac)
   - [Member Privacy & Security Lockdown](#2-member-privacy--security-lockdown)
   - [Direct Email Invitation & Onboarding System](#3-direct-email-invitation--onboarding-system)
   - [Interactive Kanban Board & Task Management](#4-interactive-kanban-board--task-management)
   - [Admin User Management Portal](#5-admin-user-management-portal)
   - [Real-Time Activity Audit Timeline](#6-real-time-activity-audit-timeline)
4. [How to Run Locally](#how-to-run-locally)
   - [Quick Start (1-Click Auto Launcher)](#method-a-1-click-auto-launcher-recommended)
   - [Manual Terminal Execution](#method-b-manual-terminal-execution)
   - [Docker Compose Execution](#method-c-docker-compose-execution)
5. [Database Schema & Models (MongoDB)](#database-schema--models-mongodb)
6. [Complete REST API Reference](#complete-rest-api-reference)
7. [Environment Variables Guide](#environment-variables-guide)
8. [Cloud Deployment Options](#cloud-deployment-options)
9. [Project Directory Structure](#project-directory-structure)

---

## Project Overview & Key Highlights

**Team Task Tracker** is designed for modern development and product teams to collaborate, track sprints, manage workflows, and maintain transparent audit trails without prototype shortcuts or mock data.

### 🌟 Key Highlights
* **Zero Demo Data / Zero Mock Credentials**: All user authentication, tokens, passwords, workspaces, and tasks operate exclusively on live MongoDB records with PBKDF2 password hashing.
* **Hardened Security & Privacy**: Regular members cannot view the organization's user directory, cannot self-promote to Admin, and cannot view or assign tasks to unauthorized personnel.
* **Direct SMTP Email Dispatch**: Admins invite teammates directly by email; invitees receive formatted HTML emails with single-use cryptographic join tokens.
* **High-Performance Architecture**: Built with Next.js 16 (Turbopack, React 19) and Django REST Framework with MongoEngine ODM.

---

## System Architecture & Technology Stack

```mermaid
graph TD
    Client[Web Browser - Next.js 16 Client] -->|HTTPS / REST API| Backend[Django 5.0 REST Framework API]
    Backend -->|JWT Auth & RBAC| Auth[Authentication & Permissions]
    Backend -->|MongoEngine ODM| MongoDB[(MongoDB 7.0 Database)]
    Backend -->|Direct SMTP / TLS| Email[SMTP Mail Server / Gmail Inbox]
    Client -->|Auto Refresh JWT| Auth
```

### Technology Breakdown

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **Next.js 16.4.2**, **React 19**, **Tailwind CSS 4** | Ultra-responsive, dark-mode glassmorphic interface with server & client components. |
| **Icons & UI Assets**| **Lucide React**, **Tailwind Merge**, **Clsx** | Clean icons, fluid micro-interactions, responsive modals. |
| **Backend REST API** | **Django 5.0**, **Django REST Framework 3.15** | High-throughput, stateless REST API with custom JWT authentication. |
| **Database & ODM** | **MongoDB 7.0**, **MongoEngine 0.29**, **PyMongo 4.6** | High-performance NoSQL document store with strict schema validation. |
| **Security & Auth** | **PyJWT 2.8**, **PBKDF2 Password Hasher** | Secure access/refresh token rotation, salted hash persistence. |
| **Deployment** | **Docker**, **Docker Compose**, **Gunicorn**, **Procfile** | Production containerization and 1-click cloud readiness (Railway, Vercel, VPS). |

---

## Core Functionalities & Features

### 1. Strict Role-Based Access Control (RBAC)

The system enforces two distinct roles throughout the UI and API:

| Capability | Admin Role | Member Role |
| :--- | :---: | :---: |
| Create Team Workspaces | ✅ Yes | ❌ No |
| Invite Members via Email / Link | ✅ Yes | ❌ No |
| View Organization User Directory (`/users`) | ✅ Yes | ❌ No (HTTP 403) |
| Change User Roles (Promote to Admin / Demote) | ✅ Yes | ❌ No (HTTP 403) |
| Delete User Accounts | ✅ Yes | ❌ No (HTTP 403) |
| View Last Login Timestamps | ✅ Yes | ❌ No |
| View All Members in Team Stack | ✅ Yes | ❌ No (Hidden) |
| Assign Tasks to Other Members | ✅ Yes | ❌ No (Self or Unassigned only) |
| Move Tasks between Kanban Columns | ✅ Yes | ✅ Yes |
| Comment on Tasks | ✅ Yes | ✅ Yes |
| Filter Board ("All Tasks" / "Assigned to Me") | ✅ Yes | ✅ Yes |

---

### 2. Member Privacy & Security Lockdown

1. **Self-Promotion Blocked at API Level**:
   * The public registration endpoint (`POST /api/auth/register/`) strictly hardcodes `role='Member'` regardless of any payload supplied.
   * `PATCH /api/auth/users/<id>/` is guarded by `IsAuthenticatedCustom` and `IsAdminUserRole`. Any regular member attempting role elevation receives **HTTP 403 Forbidden**.
2. **Member Directory Obfuscation**:
   * The team workspace view hides other member emails and avatars from regular members to protect privacy.
   * The task assignee dropdown restricts regular members to choosing only `"Assign to Me"` or `"Unassigned"`. Only Admins can assign tasks to teammates.
3. **No Quick-Switch or Demo Cards**:
   * Prototype switcher buttons and 1-click demo login buttons have been completely removed. Authentication requires real user credentials.

---

### 3. Direct Email Invitation & Onboarding System

```
[Admin clicks "Invite Member"]
         │
         ▼
[Enter Email: teammate@company.com]
         │
         ▼
[PulseSync generates 43-character cryptographic token]
         │
         ├──► Dispatches responsive HTML email via SMTP to teammate's inbox
         │
         └──► Generates instant Join Link: http://localhost:3000/join?token=XYZ...
                 │
                 ▼
         [Invitee opens link -> Sets Password -> Joins Workspace]
                 │
                 ▼
         [Token invalidated (Single-Use Only)]
                 │
                 ▼
         [Activity Timeline records member join event]
```

* **Live SMTP Delivery**: Integrated with Gmail, Brevo, SendGrid, or any custom SMTP provider.
* **Fallback Link**: In addition to email dispatch, the modal provides a 1-click copyable join link for instant onboarding.
* **Single-Use Cryptographic Tokens**: Once an invitation is accepted, the token is permanently invalidated. Reusing tokens returns an error.

---

### 4. Interactive Kanban Board & Task Management

Each team workspace features a full-featured Kanban board:

* **3 Status Columns**:
  * `To Do` — Newly created or backlog tasks.
  * `In Progress` — Active sprint tasks.
  * `Done` — Completed tasks.
* **Status Transitions**: 1-click arrows allow moving tasks between stages smoothly.
* **Priority Badges**: `Low` (slate), `Medium` (blue), `High` (amber), `Urgent` (rose).
* **Smart Filtering**:
  * **All Tasks**: Shows all workspace tasks.
  * **Assigned to Me**: Isolates only tasks assigned to the current user.
  * **Unassigned**: Surfaces unassigned backlog items.
* **Task Detail Modal**:
  * Task description view and edit.
  * Real-time comment threads with timestamps and author details.
  * Direct task deletion (for task creators and Admins).

---

### 5. Admin User Management Portal (`/users`)

Accessible exclusively by Admins via the top navigation bar:

* **Full User Roster**: Displays every registered user with their name, email, role badge, registration date, and `last_login` timestamp.
* **Add User**: Admin can create accounts directly with custom temporary credentials.
* **Role Management**: 1-click role promotion to `Admin` or demotion to `Member`.
* **Account Deletion**: Admin can delete user accounts (with self-deletion protection to prevent orphaned workspaces).

---

### 6. Real-Time Activity Audit Timeline

An automated audit trail embedded in every team workspace:
* Records when tasks are created, renamed, or deleted.
* Records status changes (e.g. *"Alice Chen moved 'Design API' from To Do to In Progress"*).
* Records member invitations and team joins.
* Displays timestamps with human-readable relative time format.

---

## How to Run Locally

### Prerequisites
* **Python 3.12+** (Virtual environment included in `backend_venv/`)
* **Node.js 20+** and `npm`
* **MongoDB** running locally on `127.0.0.1:27017` (or MongoDB Atlas cloud URI)

---

### Method A: 1-Click Auto Launcher (Recommended)

Simply double-click **`start.bat`** in the project root folder!

```
c:\Users\...\Task\start.bat
```

What `start.bat` does automatically:
1. Verifies/starts the local MongoDB service.
2. Launches the Django REST Backend on `http://127.0.0.1:8000`.
3. Launches the Next.js Frontend on `http://localhost:3000`.
4. Opens both in clean, dedicated terminal windows.

Once started, open your browser:
👉 **[http://localhost:3000](http://localhost:3000)**

---

### Method B: Manual Terminal Execution

#### 1. Start MongoDB (if not running as a service):
```powershell
net start MongoDB
```

#### 2. Start Django Backend:
In the project root:
```powershell
.\backend_venv\Scripts\python backend\manage.py runserver 127.0.0.1:8000
```
*(Backend API is live at `http://127.0.0.1:8000/api/health/`)*

#### 3. Start Next.js Frontend:
In a new terminal window:
```powershell
cd frontend
npm run dev
```
*(Frontend UI is live at `http://localhost:3000`)*

---

### Method C: Docker Compose Execution

To run the entire stack (MongoDB + Backend + Frontend) in isolated Docker containers:

```bash
docker compose up --build -d
```

* **Frontend**: `http://localhost:3000`
* **Backend API**: `http://localhost:8000`
* **MongoDB**: `localhost:27017`

To stop:
```bash
docker compose down
```

---

## Database Schema & Models (MongoDB)

All entities are defined via MongoEngine Document models in the backend:

### 1. `User` (`authentication.models.User`)
* `name` (String, required)
* `email` (String, required, unique)
* `password` (String, PBKDF2 hashed)
* `role` (String: `'Admin'` or `'Member'`, default: `'Member'`)
* `last_login` (DateTime, updated on every sign-in)
* `created_at` (DateTime, auto-now)

### 2. `Team` (`teams.models.Team`)
* `name` (String, required)
* `description` (String)
* `created_by` (Reference to `User`)
* `members` (List of References to `User`)
* `created_at` (DateTime)

### 3. `TeamInvitation` (`teams.models.TeamInvitation`)
* `team` (Reference to `Team`)
* `invited_by` (Reference to `User`)
* `email` (String, lowercased)
* `token` (String, 43-character URL-safe cryptographic token)
* `accepted` (Boolean, default: `False`)
* `created_at` (DateTime)
* `accepted_at` (DateTime, nullable)

### 4. `Task` (`tasks.models.Task`)
* `title` (String, required)
* `description` (String)
* `status` (String: `'todo'`, `'in_progress'`, `'done'`)
* `priority` (String: `'low'`, `'medium'`, `'high'`, `'urgent'`)
* `team` (Reference to `Team`)
* `assigned_to` (Reference to `User`, nullable)
* `created_by` (Reference to `User`)
* `due_date` (DateTime, nullable)
* `comments` (EmbeddedList of `TaskComment`)
* `created_at`, `updated_at` (DateTime)

### 5. `Activity` (`activity.models.Activity`)
* `team` (Reference to `Team`)
* `actor` (Reference to `User`)
* `action` (String, e.g. `'TASK_CREATED'`, `'STATUS_CHANGED'`, `'MEMBER_JOINED'`)
* `details` (String human-readable summary)
* `created_at` (DateTime)

---

## Complete REST API Reference

### Health Check
* `GET /api/health/` — Returns server health, MongoDB connection status, and user count.

### Authentication (`/api/auth/`)
* `POST /api/auth/register/` — Public user registration (always creates `Member` role).
* `POST /api/auth/login/` — Authenticate email & password, returns JWT tokens and user profile.
* `POST /api/auth/refresh/` — Exchange valid refresh token for a new access token.
* `GET /api/auth/users/` — List all registered users *(Admin only)*.
* `POST /api/auth/users/` — Create new user directly *(Admin only)*.
* `PATCH /api/auth/users/<id>/` — Update user profile or promote/demote role *(Admin only)*.
* `DELETE /api/auth/users/<id>/` — Delete user account *(Admin only)*.

### Team Workspaces (`/api/teams/`)
* `GET /api/teams/` — List teams for authenticated user.
* `POST /api/teams/` — Create new team workspace *(Admin only)*.
* `GET /api/teams/<id>/` — Retrieve team workspace details.
* `POST /api/teams/<id>/invite/` — Dispatch email invitation with token *(Admin only)*.

### Public Join Flow (`/api/invitations/`)
* `GET /api/invitations/<token>/` — Public endpoint to validate join token and preview team details.
* `POST /api/invitations/<token>/accept/` — Accept invitation, register account, and join team.

### Tasks (`/api/`)
* `GET /api/teams/<id>/tasks/` — List all tasks for a specific team.
* `POST /api/teams/<id>/tasks/` — Create a new task in team workspace.
* `GET /api/tasks/<id>/` — Retrieve task details.
* `PATCH /api/tasks/<id>/` — Update task status, priority, description, or assignee.
* `DELETE /api/tasks/<id>/` — Delete task.
* `POST /api/tasks/<id>/comments/` — Add comment to task.

### Activity Timeline (`/api/`)
* `GET /api/teams/<id>/activity/` — Retrieve chronological audit activity log for team.

---

## Environment Variables Guide

### Backend (`backend/.env`)
```ini
# Django Secrets
SECRET_KEY=super-secret-django-mongodb-task-tracker-key-2026
DEBUG=True
ALLOWED_HOSTS=*

# MongoDB Connection (Local or Atlas)
MONGO_HOST=127.0.0.1
MONGO_PORT=27017
MONGO_DB=tasktracker_db
# OR for Cloud / Railway:
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/tasktracker_db

# Frontend Application URL (used in email invitation links)
FRONTEND_URL=http://localhost:3000

# SMTP / Direct Email Delivery (Optional for Gmail delivery)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-google-app-password
DEFAULT_FROM_EMAIL=PulseSync Team <noreply@tasktracker.io>
```

### Frontend (`frontend/.env.local`)
```ini
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

---

## Cloud Deployment Options

The project is fully pre-configured for instant cloud deployment:

| Platform | Frontend | Backend | Database | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Railway.app** | Railway (Next.js) | Railway (Python/Procfile) | MongoDB Plugin | **All-in-One single dashboard** |
| **Vercel + Render** | Vercel (1-Click) | Render Web Service | MongoDB Atlas (Free M0) | **100% Free Forever Tier** |
| **VPS / Cloud VM** | Docker Compose | Docker Compose | Docker Compose | **Self-hosted / Private cloud** |

* Detailed deployment steps are available in [hosting_deployment_guide.md](file:///C:/Users/SYED%20AFSEH%20EHSANI/.gemini/antigravity-ide/brain/2ea35442-90c1-4786-be77-8f0d78b075ab/hosting_deployment_guide.md) and [railway_deployment_walkthrough.md](file:///C:/Users/SYED%20AFSEH%20EHSANI/.gemini/antigravity-ide/brain/2ea35442-90c1-4786-be77-8f0d78b075ab/railway_deployment_walkthrough.md).

---

## Project Directory Structure

```
Task/
├── backend/                        # Django REST API Backend
│   ├── activity/                   # Audit logging & timeline models/views
│   ├── authentication/             # JWT auth, user models, serializers, permissions
│   ├── core/                       # WSGI/ASGI, URLs, settings, MongoDB connector
│   ├── tasks/                      # Tasks, comments, and Kanban workflow logic
│   ├── teams/                      # Team workspace models, email service, invitations
│   ├── tests/                      # Automated security, CRUD, and privacy test suites
│   ├── Dockerfile                  # Container definition for backend
│   ├── Procfile                    # Web process runner for cloud deployment
│   ├── manage.py                   # Django CLI management utility
│   ├── requirements.txt            # Python dependencies
│   ├── run.py                      # Bulletproof port-binding server launcher
│   └── seed_data.py                # Optional realistic initial data populator
│
├── frontend/                       # Next.js 16 Web Application
│   ├── public/                     # Static assets, icons, SVG marks
│   ├── src/
│   │   ├── app/                    # Next.js App Router pages
│   │   │   ├── dashboard/          # Team workspace selector & quick stats
│   │   │   ├── join/               # Invitation acceptance onboarding flow
│   │   │   ├── login/              # Clean user login page
│   │   │   ├── register/           # Member registration page
│   │   │   ├── teams/[id]/         # Main interactive Kanban workspace
│   │   │   ├── users/              # Admin-only user management portal
│   │   │   ├── layout.tsx          # Root layout & AuthProvider wrapper
│   │   │   └── page.tsx            # Modern product landing page
│   │   ├── components/             # KanbanBoard, TaskModal, Timeline, Navbar, etc.
│   │   ├── context/                # AuthContext (JWT storage & state)
│   │   ├── lib/                    # Axios API client with auto token refresh
│   │   └── types/                  # TypeScript interface definitions
│   ├── Dockerfile                  # Multi-stage container definition for frontend
│   └── package.json                # Frontend dependencies & scripts
│
├── docker-compose.yml              # Multi-container orchestration (Frontend + Backend + Mongo)
├── start.bat                       # 1-Click Windows Local Development Launcher
├── start_production.bat            # 1-Click Production Mode Launcher
└── PROJECT_DOCUMENTATION.md        # Comprehensive Master Documentation (This File)
```
