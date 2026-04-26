# 🌾 AgroInsight Frontend

A modern, responsive dashboard UI for **AgroInsight** — an agricultural analytics platform that visualizes land holding, irrigation, and cropping patterns across India.

---

## 🚀 Tech Stack

* ⚛️ React (Vite)
* 🎨 Tailwind CSS
* 🌍 React Leaflet (Map)
* 📊 Recharts (Charts)
* 🔗 Axios (API communication)

---

## 🎯 Features

* 📊 Interactive Dashboard
* 🌍 India Map with State-level Insights
* 📈 Data Visualization (Charts & Stats)
* 💧 Irrigation Analysis
* 🌾 Crop Distribution View
* 🧠 Smart Insights Panel (AI-ready)
* ⚡ Fast & Responsive UI

---

## 📂 Project Structure

```
src/
 ├── components/
 │   ├── Dashboard.jsx
 │   ├── MapSection.jsx
 │   ├── InfoPanel.jsx
 │   ├── StatsCards.jsx
 │
 ├── api.js
 ├── App.jsx
 ├── main.jsx
```

---

## ⚙️ Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

---

## 🔗 API Configuration

Update API base URL in:

```
src/api.js
```

```js
baseURL: "http://127.0.0.1:8000/api"
```

---

## 🌍 Map Integration

* Uses GeoJSON for India map
* States are clickable & interactive
* Dynamic data fetched from backend

---

## 📊 Dashboard Data

Data is fetched from backend APIs:

* `/api/analytics`
* `/api/regions`
* `/api/regions/{id}`

---

## 🎨 UI Highlights

* Clean SaaS dashboard design
* Responsive layout
* Tailwind-based styling
* Smooth interactions

---

## 🔮 Future Enhancements

* 🧠 AI-based recommendations
* 📄 Export reports (PDF)
* 📊 Advanced analytics charts
* 🌡️ Weather integration

---

## 👨‍💻 Author

Developed as part of a full-stack project combining **data analytics + agriculture + visualization**

---
