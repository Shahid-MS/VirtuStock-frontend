📊 VirtuStock Frontend

VirtuStock Frontend is a React (Vite) based user interface for a stock market simulation platform.
It allows users to securely authenticate, explore IPO listings, manage virtual portfolios, and visualize performance through an interactive UI.

This frontend communicates with a Spring Boot backend via RESTful APIs.

🚀 Tech Stack

React.js (Vite)

JavaScript (ES6+)

React Router

Axios

JWT Authentication

Chart Library (for portfolio analysis)

HTML5, CSS3

✨ Features

🔐 JWT-based authentication & protected routes

📈 IPO listing and application flow

💼 Virtual portfolio management

📊 Profit/Loss visualization using charts

🔄 REST API integration with backend

⚡ Fast development & build using Vite

📱 Responsive UI

🧩 Project Structure
src/
 ├── components/     # Reusable UI components
 ├── pages/          # Page-level views
 ├── services/       # API calls (Axios)
 ├── routes/         # Route guards & navigation
 ├── utils/          # Helper functions
 ├── App.jsx
 └── main.jsx

⚙️ Setup & Run Locally (Vite)
Prerequisites

Node.js (v16+)

npm or yarn

Steps
npm install
npm run dev


App will run on:

http://localhost:5173

🌐 Environment Variables (Vite)

Create a .env file in the root directory:

VITE_API_BASE_URL=http://localhost:8080


Usage example:

import.meta.env.VITE_API_BASE_URL

🔗 Backend Repository

👉 VirtuStock Backend
https://github.com/Shahid-MS/virtu-stock-backend

📌 Live Demo (Optional)

🌍 https://virtustock.in

📬 Contact

Md Shahid Alam
📧 ms2.o.edu@gmail.com

🔗 LinkedIn: https://www.linkedin.com/in/ms20/

🐙 GitHub: https://github.com/Shahid-MS
