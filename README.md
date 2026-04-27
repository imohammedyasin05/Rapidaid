# 🚨 RapidAid: AI-Powered Real-Time Emergency Response Platform

> **Revolutionizing emergency services with AI-driven severity prediction and real-time coordination.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tech Stack: MERN](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://www.mongodb.com/mern-stack)
[![AI: Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)](https://deepmind.google/technologies/gemini/)

---

## 📖 Overview

**RapidAid** is a cutting-edge, full-stack emergency response platform designed to minimize response times during critical incidents. By leveraging **Google Gemini AI**, RapidAid automatically analyzes incident reports to predict severity and priority, ensuring that first responders and volunteers are dispatched where they are needed most. 

Our mission is to bridge the gap between accident occurrence and professional medical arrival through a coordinated network of local volunteers and real-time data visualization.

---

## ⚠️ Problem Statement

In emergency situations, every second counts. Traditional emergency response systems often suffer from:
- **Delayed reporting**: Critical time lost before emergency services are notified.
- **Resource misallocation**: Difficulty in assessing the severity of multiple simultaneous incidents.
- **Volunteer underutilization**: Willing and qualified bystanders often lack a mechanism to help effectively.
- **Communication gaps**: Fragmented information flow between witnesses, dispatchers, and responders.

---

## ✅ Solution

RapidAid provides a unified ecosystem that:
1. **Automates Severity Assessment**: Uses AI to categorize incidents (Low, Medium, High, Critical) based on textual or visual descriptions.
2. **Real-Time Geospatial Tracking**: Maps incidents instantly for immediate visual context.
3. **Smart Volunteer Dispatching**: Notifies nearby registered volunteers to provide immediate first aid while professional services are en route.
4. **Centralized Command & Control**: Offers an intuitive dashboard for administrators to monitor city-wide emergency status.

---

## ✨ Key Features

- 🛡️ **AI Severity Prediction**: Powered by Gemini AI to evaluate incident descriptions and predict urgency.
- 📍 **Real-Time Incident Mapping**: Interactive map interface for witnesses and responders.
- 👥 **Volunteer Management System**: Dedicated portal for volunteers to receive alerts and manage their status.
- 📊 **Admin Dashboard**: Comprehensive analytics and incident management for emergency service operators.
- 🔔 **Instant Notifications**: Socket-based real-time alerts for new incidents.
- 🔐 **Secure Authentication**: JWT-based secure login and registration for users, volunteers, and admins.
- 🚑 **First Aid Guides**: Integrated AI-curated first aid instructions for on-site bystanders.

---

## 📸 Interface Previews

### 🏠 Dashboard
<img src="public/dashboard.png" width="600" alt="Dashboard">

### 📍 Incident Mapping
<img src="public/incident-mapping.png" width="600" alt="Incident Mapping">

### 👥 Volunteer Panel
<img src="public/volunteer-panel.png" width="600" alt="Volunteer Panel">

### 📊 Admin Analytics
<img src="public/admin-analytics.png" width="600" alt="Admin Analytics">

---

## 🤖 AI Integration (Google Gemini)

RapidAid utilizes the **Google Gemini Pro API** to power its intelligent core:

- **Incident Classification**: When a report is filed, the description is processed by Gemini to extract key information and assign a severity score (1-10).
- **First Aid Assistance**: Generates context-aware first aid instructions based on the specific type of emergency reported.
- **Data Structuring**: Converts messy user-generated descriptions into structured data for the backend models.

---

## 💻 Tech Stack

### Frontend
- **Framework**: React.js 18 (with Vite)
- **Styling**: Tailwind CSS / Lucide Icons
- **State Management**: React Context API
- **Maps**: Leaflet.js / React-Leaflet
- **Real-time**: Socket.io-client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: Passport.js / JWT
- **Real-time**: Socket.io

### Database
- **Primary**: MongoDB (via Mongoose)
- **Caching/Storage**: Firebase (Optional/Integrated for media)

---

## 🏗️ System Architecture

RapidAid follows a modern **MERN** architecture with a focus on real-time event-driven communication:

1. **Client Layer**: React-based SPA providing interfaces for Citizens, Volunteers, and Admins.
2. **API Layer**: Express REST endpoints for CRUD operations and authentication.
3. **Intelligence Layer**: Gemini AI integration for processing and prediction.
4. **Real-time Layer**: Socket.io server for broadcasting emergency events instantly.
5. **Data Layer**: MongoDB for persistent storage of users and incident history.

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/imohammedyasin05/Rapidaid.git
cd Rapidaid
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add the following:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_google_gemini_key
```

### 4. Run the Application
```bash
# Start the development server (Frontend & Backend)
npm run dev
```

---

## 🛠️ Usage

## 🔗 Links

- **Live Demo**: [https://rapidaid-eight.vercel.app/login](https://rapidaid-eight.vercel.app/login)
- **Demo Video**: [https://youtu.be/zGUdkLrNclk](https://youtu.be/zGUdkLrNclk)

---

## 🔮 Future Improvements

- [ ] **Mobile App**: Develop dedicated iOS/Android apps using Flutter.
- [ ] **Image Recognition**: Use Gemini Vision to detect accidents from live CCTV feeds.
- [ ] **Drones Integration**: Automated drone dispatch for initial visual reconnaissance.
- [ ] **Multilingual Support**: Support for local languages in incident reporting.

---

## 👤 Author

**Mohammed Yasin**
- GitHub: [@imohammedyasin05](https://github.com/imohammedyasin05)
- LinkedIn: [https://www.linkedin.com/in/shaikmohammedyasin/](https://www.linkedin.com/in/shaikmohammedyasin/)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 Conclusion

RapidAid is more than just an app; it's a commitment to using technology for social good. By combining the power of AI with a community-driven volunteer network, we aim to build safer, more resilient cities where help is always just a notification away.