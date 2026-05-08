# FSD-PBL: GigConnect Platform

** Full-Stack Gig Marketplace**  
**Status:** Phase 3 complete and pushed to GitHub  
**Team:** Harshit Suyal, Manas Joshi, Aishwary Bisht, Saumya Pratap Singh

**Live Demo:** https://gigconnect-avrh.onrender.com/

---

## Overview

GigConnect is a MERN-based gig marketplace that connects clients, workers, and admins in one platform. It supports user onboarding, gig posting and applications, real-time chat, notifications, Razorpay payments, work tracking, reviews, reports, and an admin dashboard.

For the full architecture breakdown, database design, payment flow, and diagrams, see [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md). For a shorter reference version, see [README_COMPREHENSIVE.md](README_COMPREHENSIVE.md).



---

## Highlights

- User registration, login, and profile management with JWT authentication
- Gig CRUD, filtering, applications, and status lifecycle management
- Socket.io real-time chat with message, offer, and system message support
- Real-time notifications with unread badges and mark-as-read actions
- Razorpay payment integration with backend signature verification
- Work timer, total hour tracking, and invoice generation
- Reviews, reporting, moderation, and admin analytics

---

## Tech Stack

- Frontend: React 19, Vite, React Router, Axios, Socket.io client
- Backend: Node.js, Express, Mongoose, Socket.io, JWT, bcryptjs
- Payments: Razorpay
- Database: MongoDB

---

## Project Structure

```text
FSD-PBL/
├── gig-platform-backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── gig-platform-frontend/
│   └── src/
├── PROJECT_DOCUMENTATION.md
├── README_COMPREHENSIVE.md
└── .gitignore
```

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Harshit-Suyal/FSD-PBL.git
cd FSD-PBL
```

### 2. Start the backend

```bash
cd gig-platform-backend
npm install
npm start
```

### 3. Start the frontend

Open a new terminal:

```bash
cd gig-platform-frontend
npm install
npm start
```

By default, the backend runs on http://localhost:5000 and the frontend runs on http://localhost:5173.

---

## Environment Setup

Create a `.env` file in `gig-platform-backend/`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLIENT_URL=http://localhost:5173
```

Keep environment files out of Git. The root `.gitignore` already excludes the common local and secret files for this project.

---

## How It Works

- The frontend calls backend APIs from `gig-platform-frontend/src/services/api.js` using Axios.
- JWT is attached to protected requests automatically through the auth interceptor.
- The backend receives requests in `gig-platform-backend/server.js`, routes them through Express, and uses controllers and Mongoose models for database operations.
- Socket.io handles live chat, notification updates, and payment-related UI refreshes.
- Razorpay handles payment checkout, while the backend verifies the signature before marking a payment as valid.

---

## Key Workflows

### Worker applies for a gig

Worker browses gigs → opens gig details → submits application → client receives notification.

### Client accepts a worker

Client reviews applications → accepts one worker → system creates a chat message and notification → other applicants are rejected.

### Payment flow

Client pays through Razorpay → backend creates the order and verifies the signature → payment is marked paid → gig moves to in-progress → both users receive updates.

### Real-time messaging

Participants join the gig room → messages are saved to MongoDB → Socket.io broadcasts updates instantly to the gig room and recipient room.

---

## Documentation

- [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) for the full phase-by-phase write-up
- [README_COMPREHENSIVE.md](README_COMPREHENSIVE.md) for a compact project reference

---

## Notes

- This project uses `master` as the Git branch name in GitHub.
- All main features from Phase 1, Phase 2, and Phase 3 are implemented.
- The repository is ready for review, demo, and submission.

---

##  Summary
- **Unique Account Enforcement:** Duplicate registrations by email blocked.
- **Data Validation:** Forms validate required fields and basic input types.
- **API Error Guarding:** Graceful messages for failed API calls (e.g., offline DB).
- **Unauthorized Redirects:** Protected pages reroute unauthenticated visitors.
- **Basic Proposal Restrictions:** No double submissions on same gig.

---

## Known Limitations / Next Challenges

- **Real payments added:** Razorpay handles order creation and verification.
- **Real-time communication added:** chat and notifications now use Socket.IO.

---

**Last updated:** March 2026
