# 🚀 Team Task Tracker — Fresh Setup & Run Guide

This plain guide provides step-by-step instructions to run both the **Backend** and **Frontend** on any new computer (whether you received the project as a **ZIP file** or cloned it via **Git**).

---

## 📋 System Prerequisites

Before starting, ensure the computer has these 3 tools installed:

| Tool | Recommended Version | Download Link / Command |
| :--- | :---: | :--- |
| **Python** | 3.10, 3.11, or 3.12 | [python.org/downloads](https://www.python.org/downloads/) *(Check "Add Python to PATH")* |
| **Node.js & npm** | Node 18+ or 20+ | [nodejs.org](https://nodejs.org/) |
| **MongoDB** | 6.0+ or 7.0+ | [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) |

---

## ⚡ Method 1: The 1-Click Way (Windows) — Recommended

If you are on Windows, you don't need to type commands manually.

1. Open the project folder (`Task/`).
2. Double-click **`start.bat`**.

### What `start.bat` does automatically:
* Verifies local MongoDB service is running.
* Creates `backend_venv` and installs all backend Python libraries if it is the first time.
* Runs `npm install` in `frontend/` if it is the first time.
* Starts the **Django REST Backend** on `http://127.0.0.1:8000`.
* Starts the **Next.js Frontend** on `http://localhost:3000`.
* Automatically launches your default web browser directly to:
  👉 **[http://localhost:3000](http://localhost:3000)**

---

## 💻 Method 2: Manual Setup via Command Prompt (CMD)

If you prefer to run commands manually in your terminal or CMD, follow these simple steps:

### Step 1: Open Terminal & Start MongoDB
Open Command Prompt (CMD) as Administrator or regular user:
```cmd
net start MongoDB
```
*(If MongoDB runs as a background Windows service, it is already running).*

---

### Step 2: Setup & Run the Backend (Django)

Open a **new CMD terminal window** inside the project root folder (`Task/`):

1. **Create Python virtual environment (Only first time):**
   ```cmd
   python -m venv backend_venv
   ```

2. **Install backend dependencies (Only first time):**
   ```cmd
   .\backend_venv\Scripts\pip install -r backend\requirements.txt
   ```

3. **(Optional) Seed initial demo data (Only if database is empty):**
   ```cmd
   .\backend_venv\Scripts\python backend\seed_data.py
   ```

4. **Start the Backend Server:**
   ```cmd
   .\backend_venv\Scripts\python backend\manage.py runserver 127.0.0.1:8000
   ```
   *(Or simply `python backend\manage.py runserver 127.0.0.1:8000`)*

✅ **Backend is now live at:** **[http://127.0.0.1:8000](http://127.0.0.1:8000)**  
Verify health: [http://127.0.0.1:8000/api/health/](http://127.0.0.1:8000/api/health/)

---

### Step 3: Setup & Run the Frontend (Next.js)

Open a **second CMD terminal window** inside the project root folder:

1. **Navigate to frontend folder:**
   ```cmd
   cd frontend
   ```

2. **Install frontend npm packages (Only first time):**
   ```cmd
   npm install
   ```

3. **Start the Frontend Development Server:**
   ```cmd
   npm run dev
   ```

✅ **Frontend is now live at:** **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Login & Account Credentials

Once you open [http://localhost:3000](http://localhost:3000), you will see the Login screen with **Dual 1-Click Quick Sign-In Presets**:

### Ready-to-Use Accounts:
* **System Administrator (Full Access):**
  * Email: `admin@tasktracker.io`
  * Password: `Password123!`
  * *(Or simply click the **"Login as Admin"** button on the login screen)*

* **Team Member / User (Task Board Access):**
  * Email: `alice@tasktracker.io`
  * Password: `Password123!`
  * *(Or simply click the **"Login as User"** button on the login screen)*

### Creating Your Own Account:
* Anyone can click **"Register here"** ([http://localhost:3000/register](http://localhost:3000/register)).
* You can choose your role during registration: **Admin** or **User / Member**.
* All accounts and tasks are permanently stored in the local MongoDB database.

---

## 🔍 How to Access Live MongoDB Data (JSON Inspector)

As requested, Admins can inspect the entire database in formatted JSON directly from the UI:

1. Log in with an **Admin** account (`admin@tasktracker.io` or your newly created Admin).
2. Go to the Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard).
3. Look at the top stats row — the 4th card says **`Storage: MongoDB (Inspect JSON)`**.
4. **Click / tap that card!**
5. A modal will open displaying all database documents in JSON format:
   * **Users Collection**: Names, emails, roles, last login timestamps.
   * **Teams Collection**: Workspaces, members, descriptions.
   * **Tasks Collection**: Titles, statuses, assigned members, comments.
   * **Activities Collection**: Audit chronologies.
   * **Invitations Collection**: Direct invite tokens.
6. You can switch between **JSON Syntax**, **Cards**, or **Raw** views, filter by text, copy JSON to clipboard, or click **"Export Dump"** to download the database snapshot as a `.json` file.

---

## 🛠️ Common Troubleshooting

### 1. `net start MongoDB` says "Access is denied"
* Open Command Prompt as **Administrator** (Right click CMD -> Run as Administrator) and run `net start MongoDB`.
* Or open Windows **Services** (`services.msc`), find **MongoDB Server**, right-click, and select **Start**.

### 2. Port 3000 or 8000 is already in use
If another process is occupying the port:
```cmd
# To free port 3000:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# To free port 8000:
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

### 3. "python: command not found"
* Install Python from [python.org](https://www.python.org/downloads/) and make sure to tick the checkbox **"Add Python to PATH"** during installation.

---

## 📌 Summary of Active URLs

| Application | Address | Role |
| :--- | :--- | :--- |
| **Frontend Web UI** | **[http://localhost:3000](http://localhost:3000)** | Web App, Dashboard, Kanban Boards |
| **Backend API** | **[http://127.0.0.1:8000](http://127.0.0.1:8000)** | Django REST Framework API |
| **API Health Check** | **[http://127.0.0.1:8000/api/health/](http://127.0.0.1:8000/api/health/)** | Database & Server Status |
| **MongoDB Database** | **`127.0.0.1:27017/tasktracker_db`** | Local Document Store |
