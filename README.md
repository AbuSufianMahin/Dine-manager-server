# 🍽️ Dine Manager - Restaurant Management Website

A full-stack restaurant management web application built using the **MERN** stack. This platform enables customers to explore and purchase food, while allowing restaurant owners to manage food items and track customer orders with ease.

---

## 🔗 Live Site

🌐 [Visit Live Website](https://restaurant-management-sy-6dee9.web.app/)

---

## 📂 Repositories

- 🔧 [Client Side](https://github.com/AbuSufianMahin/Dine-manager-client)

---

## 🎯 Project Purpose

This project was developed as part of **Assignment-11** to:
- Build a responsive and interactive MERN-based web app
- Apply authentication, authorization, and secure data handling
- Implement CRUD operations with real-time feedback
- Create recruiter-friendly UI with animations and visual appeal

---

## 🚀 Key Features

### 🏠 Public Pages
- **Home**: Banner, top-selling foods, and extra feature sections
- **All Foods**: Complete list with search & quantity display
- **Gallery**: Static gallery with image zoom/lightbox
- **Food Details**: Full food info with purchase option

### 🔒 Private Pages (JWT Protected)
- **Purchase Page**: Quantity-aware order form with restrictions
- **My Orders**: User's order history with delete options
- **My Foods**: Foods added by logged-in user with update option
- **Add Food**: Secure form to post new food items

### 🛠️ General
- Theme toggle (light/dark)
- Fully responsive (mobile, tablet, desktop)
- SweetAlert2 & React Toastify for feedback
- Framer Motion animations
- Lottie-based animations for better UX

---

## 🔐 Authentication & Security

- Firebase email/password login and Google login
- JWT issued upon login and stored client-side
- Token verified for all private route API requests
- MongoDB & Firebase credentials secured using `.env` files
- User-based access control for food CRUD operations

---

## 🧰 Technologies Used

### 🌐 Server
- Node.js, Express.js
- MongoDB
- Firebase Admin SDK
- CORS, dotenv
- JSON Web Token (JWT)

---

## 🔍 Challenge Implementations

- 🔄 Purchase quantity checks: prevents over-ordering & buying unavailable items
- ⛔ Cannot purchase own items
- 🔐 JWT authentication and route protection
- 🔎 Search food items by name
- ⚙️ Secure deployment: all routes, auth, and refreshes work smoothly

---

## 📦 NPM Packages Used

### 🖥️ Server:
```json
"axios": "^1.10.0",
"body-parser": "^2.2.0",
"cors": "^2.8.5",
"dotenv": "^16.5.0",
"express": "^5.1.0",
"firebase-admin": "^13.4.0",
"mongodb": "^6.17.0",
"nodemon": "^3.1.10"
