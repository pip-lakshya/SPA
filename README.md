# 🎓 Student Performance Analyzer (SPA)

🔗 Live Demo: https://spa-analyzer.vercel.app

A full-stack web application that helps students analyze their academic performance across semesters using structured data, domain-based classification, and visual insights.

---

## 🚀 Overview

Student Performance Analyzer (SPA) is designed to transform raw academic marks into meaningful insights.
Instead of just storing marks, the system intelligently groups subjects into domains and provides a clear picture of strengths, weaknesses, and trends.

This project is built with scalability in mind, enabling future integration of machine learning for predictive analytics and risk classification.

---

## ✨ Key Features

### 🔐 Authentication

* User registration and login
* Secure authentication system
* Google OAuth integration (optional)

### 📥 Smart Data Input

* Semester-wise dynamic input system
* Add unlimited semesters
* Subject-wise marks entry
* Dropdown + custom subject support

### 🧠 Intelligent Domain Classification

Subjects are automatically mapped into domains:

* Mathematics
* Programming
* Core Computer Science
* Electronics
* Science
* Mechanical
* Soft Skills
* General

Ensures:

* Consistent categorization
* Clean data for analytics
* ML-ready structure

---

### 📊 Analytics Dashboard

* Domain-wise performance analysis
* Semester-wise comparison
* Strength & weakness identification
* Clean and intuitive UI

---

### 🏆 Leaderboard System

* Students ranked based on overall performance
* Encourages relative ranking and peer based learning

---

### 📈 Data Visualization

* Bar graphs (domain performance)
* Semester trends
* Comparative insights
* (Planned) Heatmaps

---

### 📄 Marksheet Upload (OCR - Coming Soon 🚧)

* Upload semester marksheet
* Auto-extract subjects & marks
* Autofill form for editing

---

### 🤖 Machine Learning (Planned 🚀)

* Risk prediction (low performance detection)
* Student clustering (peer learning groups)
* Domain-based future performance prediction

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Mongoose)

### Deployment

* Frontend: Vercel
* Backend: Render

---

## 📂 Project Structure

```
SPA/
├── frontend/       # React application
├── backend/        # Express server
├── README.md
```

---

## ⚙️ Environment Variables

### Frontend (.env)

```
VITE_API_URL=https://your-backend-url
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Backend (.env)

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

---

## 🧪 Local Setup

### 1️⃣ Clone the repository

```
git clone https://github.com/your-username/spa.git
cd spa
```

### 2️⃣ Install dependencies

```
cd frontend
npm install

cd ../backend
npm install
```

### 3️⃣ Run project

Frontend:

```
npm run dev
```

Backend:

```
npm start
```

---

## 📌 Future Improvements

* Full ML integration
* Advanced analytics dashboard
* Personalized recommendations
* Peer comparison system
* Resume insights based on performance

---

## 💡 Inspiration

Most students only see marks — not patterns.

SPA was built to:

* Convert marks → insights
* Help students understand their strengths
* Enable data-driven academic growth

---

## 👨‍💻 Author

Lakshya Bhandari

---

## 📜 License

This project is open-source and available under the MIT License.
