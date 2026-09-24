<div align="center">

# GigConnect

**A full-stack gig marketplace connecting clients who post jobs with workers who apply for them.**
Real-time chat · Live notifications · Razorpay payments · Admin moderation

[![CI](https://github.com/AxelCell/Gig-Connect/actions/workflows/ci.yml/badge.svg)](https://github.com/AxelCell/Gig-Connect/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?logo=razorpay&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Live demo](https://gigconnect-avrh.onrender.com/)** · **[Documentation](PROJECT_DOCUMENTATION.md)** · **[Report a bug](https://github.com/AxelCell/Gig-Connect/issues)**

</div>

> **Note:** The demo runs on Render's free tier, so the first request after a period of inactivity may take up to a minute while the server wakes up.

---

## Table of contents

- [About](#about)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Security](#security)
- [Project structure](#project-structure)
- [Roadmap](#roadmap)
- [Team](#team)
- [License](#license)

---

## About

GigConnect is a marketplace for short-term work. It covers everything from web development and design to local services like plumbing and delivery. It supports three roles:

- **Clients** post gigs, review applicants, negotiate over chat, hire a worker and pay through Razorpay.
- **Workers** browse and filter gigs, apply with a proposal and price, track their working time and download invoices.
- **Admins** moderate the platform: they view statistics, manage users, handle reports and remove abusive content.

### Gig lifecycle

```text
 open ──apply──▶ pending ──hire worker──▶ accepted ──pay──▶ in-progress ──complete──▶ completed
```

Every status change is checked on the server against an allowed-transitions table, so a gig can't skip a step. For example, a job can't be marked complete before it's paid.

---

## Features

| | Feature | Details |
| --- | --- | --- |
| 🔐 | **Authentication** | JWT login and registration, bcrypt password hashing, role-based route guards |
| 📋 | **Gig management** | Create, edit and delete gigs with category and subcategory, budget, deadline, location and required skills |
| 🔎 | **Search & filters** | Keyword search plus filters by category, subcategory and budget range |
| 📨 | **Applications** | Proposal and price per application; hiring one worker auto-rejects the others and notifies everyone |
| 💬 | **Real-time chat** | Per-gig Socket.IO rooms with text, price-offer and system messages |
| 🔔 | **Notifications** | Instant push notifications with unread badges and mark-as-read |
| 💳 | **Payments** | Razorpay checkout with HMAC-SHA256 signature verification on the server |
| ⏱️ | **Work tracking** | Start/stop timer, automatic hour calculation and a downloadable invoice |
| ⭐ | **Reviews** | Two-way 1–5 star ratings after a job is completed |
| 🚩 | **Reports** | Users can report gigs, users or reviews for admin action |
| 🛠️ | **Admin panel** | Platform stats, user activation and deletion, report resolution, payments overview |

---

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router 7, Axios, Socket.IO client |
| Backend | Node.js, Express 5, Socket.IO, JSON Web Tokens, bcryptjs |
| Database | MongoDB with Mongoose ODM |
| Payments | Razorpay Orders API |
| CI | GitHub Actions (backend syntax check + frontend production build) |

---

## Architecture

```text
┌──────────────────────┐   REST (Axios + JWT)    ┌───────────────────────┐   Mongoose   ┌───────────┐
│  React + Vite (SPA)  │ ──────────────────────▶ │  Express API          │ ───────────▶ │  MongoDB  │
│                      │ ◀────────────────────── │  controllers/services │              └───────────┘
│                      │   Socket.IO (JWT auth)  │                       │
│                      │ ◀═════════════════════▶ │  Socket.IO server     │   Orders / verify
└──────────────────────┘                         └───────────┬───────────┘ ────────────▶ Razorpay
```

- **Auth:** an Axios interceptor attaches `Authorization: Bearer <token>` to every request. The `protect` middleware verifies the token and loads the user.
- **Real time:** socket connections authenticate with the same JWT. Each user joins a private `user:<id>` room, and gig participants join a `gig:<id>` room after an access check.
- **Payments:** the server creates a Razorpay order. After checkout, it recomputes `HMAC_SHA256(order_id|payment_id)` with the secret key, and marks the payment as paid only if that matches Razorpay's signature.

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- A MongoDB database: local, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- *(Optional)* [Razorpay](https://dashboard.razorpay.com/) test keys, for payments

### 1. Clone

```bash
git clone https://github.com/AxelCell/Gig-Connect.git
cd Gig-Connect
```

### 2. Run the backend

```bash
cd gig-platform-backend
cp .env.example .env        # Windows: copy .env.example .env
# edit .env and set at least MONGODB_URI and JWT_SECRET
npm install
npm run dev                 # → http://localhost:5000
```

### 3. Run the frontend

In a second terminal:

```bash
cd gig-platform-frontend
npm install
npm run dev                 # → http://localhost:5173
```

In development the frontend automatically uses `http://localhost:5000/api`.

### 4. Create an admin (optional)

For security, admin accounts can't be self-registered. Register a normal account, then promote it in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

---

## Environment variables

**Backend:** `gig-platform-backend/.env`

| Variable | Required | Description |
| --- | :---: | --- |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Long random string used to sign tokens |
| `PORT` | | API port (default `5000`) |
| `CLIENT_URL` | | Allowed frontend origin(s), comma-separated |
| `RAZORPAY_KEY_ID` | for payments | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | for payments | Razorpay key secret |
| `ALLOW_TEST_PAYMENT_BYPASS` | | `true` lets failed *test* payments be marked paid; for demos only |

**Frontend:** `gig-platform-frontend/.env` (optional)

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend API URL (defaults to localhost in dev, the hosted API in production builds) |
| `VITE_SOCKET_URL` | Socket.IO server URL, if it differs from the API host |

---

## API overview

| Method | Endpoint | Description | Auth |
| --- | --- | --- | :---: |
| `POST` | `/api/users/register` | Create an account | |
| `POST` | `/api/users/login` | Log in and receive a JWT | |
| `GET` | `/api/gigs` | List and search gigs | |
| `POST` | `/api/gigs` | Create a gig | Client |
| `POST` | `/api/applications/:gigId` | Apply to a gig | Worker |
| `PUT` | `/api/applications/:id/status` | Accept or reject an application | Client |
| `GET` / `POST` | `/api/chat/:gigId` | Read and send gig messages | ✅ |
| `POST` | `/api/payments/create-order` | Create a Razorpay order | Client |
| `POST` | `/api/payments/verify` | Verify the payment signature | Client |
| `PUT` | `/api/gigs/:id/start` · `/stop` | Work timer | Worker |
| `GET` | `/api/gigs/:id/invoice` | Download an invoice | ✅ |
| `POST` | `/api/reviews/:gigId` | Review the other party | ✅ |
| `GET` | `/api/notifications` | List notifications | ✅ |
| `GET` | `/api/admin/stats` | Platform statistics | Admin |
| `GET` | `/api/health` | Health check | |

The full route list is in [`gig-platform-backend/routes/`](gig-platform-backend/routes).

---

## Security

- Passwords are hashed with **bcrypt**. JWTs expire, and deactivated users are rejected on every request and socket connection.
- **Role checks happen on the server**. Users can't register themselves as admin.
- Razorpay payments are **verified on the server** with a constant-time HMAC signature comparison. Only the paying client can verify an order.
- Search input is **regex-escaped** before querying MongoDB, which prevents ReDoS and query errors.
- Chat rooms and messages go through an **access check**, so only a gig's participants can read or join them.
- Secrets live in `.env` files and are never committed; `.env.example` documents them.

---

## Project structure

```text
Gig-Connect/
├── .github/workflows/ci.yml   # CI: backend syntax check + frontend build
├── gig-platform-backend/
│   ├── config/                # MongoDB connection
│   ├── constants/             # Job categories, allowed status transitions
│   ├── controllers/           # Route handlers (business logic)
│   ├── middleware/            # JWT auth, admin guard
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express routers
│   ├── services/              # Notification service
│   ├── utils/                 # Socket.IO helpers, chat access checks
│   └── server.js              # App + Socket.IO entry point
├── gig-platform-frontend/
│   └── src/
│       ├── components/        # Navbar, GigCard, Modal, StarRating
│       ├── context/           # Auth, Socket, Toast providers
│       ├── pages/             # Home, GigList, GigDetail, Dashboard, Admin, …
│       └── services/api.js    # Axios client + API calls
└── PROJECT_DOCUMENTATION.md   # Detailed design write-up
```

---

## Roadmap

- [ ] API tests with Jest + Supertest, run in CI
- [ ] Rate limiting on authentication routes
- [ ] Pagination for gigs and notifications
- [ ] Database indexes for common gig queries
- [ ] MongoDB transactions for multi-step operations such as hiring a worker
- [ ] PDF invoices
- [ ] Docker Compose for one-command local setup

---

## Team

| Name | GitHub |
| --- | --- |
| Harshit Suyal | [@Harshit-Suyal](https://github.com/Harshit-Suyal) |
| Manas Joshi | [@itsmnx](https://github.com/itsmnx) |
| Aishwary Bisht | [@AxelCell](https://github.com/AxelCell) |
| Saumya Pratap Singh | – |

Built as a Full-Stack Development project-based learning (PBL) project.

---

## License

Released under the [MIT License](LICENSE).
