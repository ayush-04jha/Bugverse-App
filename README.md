
# 🐞 BugVerse - Real-Time Bug Reporting System

🌐 **Live Demo:** https://bugverse-app-1.onrender.com (Frontend)
🔧 **Backend API:** https://bugverse-app.onrender.com

BugVerse is a real-time bug reporting and tracking system for efficient team collaboration. Built using React, Express, MongoDB, and Socket.IO.

---

## 🚀 Features

- Testers can report bugs
- Developers can view/update assigned bugs
- Admins have full control over bugs and users
- Real-time updates using Socket.IO
- Role-based authentication
- Dashboard with bug status filters

---

## 🛠️ Tech Stack

- Frontend: React, Tailwind CSS, Axios
- Backend: Node.js, Express.js, MongoDB, Mongoose, Socket.IO
- Auth: JWT + Role-based access control (RBAC)

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/bugverse.git
cd bugverse
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

---

## 👥 User Roles

- **tester**: Can create/view bugs reported by them
- **developer**: Can view/update bugs assigned to them
- **admin**: Has full access to bugs and user management

---

## 🔄 Real-Time with Socket.IO

- All users get real-time updates on bug creation, updates, or deletion
- No need to refresh manually

---

## 📂 Folder Structure

```text
/frontend      -> React frontend (Vite)
/backend       -> Express + MongoDB + Socket.IO backend
```

---

## 📸 Screenshots

(Add screenshots of dashboard, bug report form, and real-time update views here)

---

## 👨‍💻 Developed By

Team BugVerse  
[Ayush Jha]

---



