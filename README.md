# GigConnect

A full-stack gig marketplace, built with the MERN stack, that connects **clients** who post jobs with **workers** who apply for them. It includes real-time chat, live notifications, Razorpay payments and an admin moderation panel.

**Live demo:** https://gigconnect-avrh.onrender.com/
**Team:** Harshit Suyal, Manas Joshi, Aishwary Bisht, Saumya Pratap Singh

![CI](https://github.com/AxelCell/Gig-Connect/actions/workflows/ci.yml/badge.svg)

---

## Features

| Area | What it does |
| --- | --- |
| Auth | JWT login and registration with bcrypt-hashed passwords and role-based access (worker / client / admin) |
| Gigs | Create, edit and delete gigs, with category and subcategory, budget, deadline and location. Search and filter too |
| Applications | Workers apply with a proposal and price; clients accept one and the rest are auto-rejected and notified |
| Chat | Per-gig Socket.IO chat rooms with text, price-offer and system messages |
| Notifications | Real-time push with unread badges, mark-as-read and mark-all-read |
| Payments | Razorpay orders with server-side HMAC signature verification |
| Work tracking | Start/stop work timer, total hours and a downloadable invoice |
| Trust & safety | Reviews and ratings, reports, plus admin tools to remove gigs or reviews and block users |
| Admin | Platform stats, user management, payments overview |

## Tech stack

- **Frontend:** React 19, Vite, React Router, Axios, Socket.IO client
- **Backend:** Node.js, Express 5, Mongoose, Socket.IO, JWT, bcryptjs
- **Database:** MongoDB
- **Payments:** Razorpay

## Architecture

```text
React (Vite) ──HTTP/Axios──▶ Express REST API ──Mongoose──▶ MongoDB
     ▲                             │
     └──────── Socket.IO ◀─────────┘   (chat, notifications, payment updates)
                                   │
                                   └──▶ Razorpay (orders + signature verification)
```

- Every protected request carries `Authorization: Bearer <jwt>` (added by an Axios interceptor).
- Socket connections authenticate with the same JWT. Each user joins a `user:<id>` room, and gig participants join a `gig:<id>` room.
- A payment is only marked `paid` after the backend recomputes the Razorpay HMAC-SHA256 signature and it matches.

## Project structure

```text
Gig-Connect/
├── gig-platform-backend/
│   ├── config/          # MongoDB connection
│   ├── constants/       # Categories, gig status transitions
│   ├── controllers/     # Route handlers
│   ├── middleware/      # JWT auth + admin guard
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── services/        # Notification service
│   ├── utils/           # Socket helpers, chat access checks
│   └── server.js
├── gig-platform-frontend/
│   └── src/
│       ├── components/
│       ├── context/     # Auth, Socket, Toast providers
│       ├── pages/
│       └── services/api.js
└── PROJECT_DOCUMENTATION.md
```

## Getting started

**Prerequisites:** Node.js 18 or later, and a MongoDB database (local or [Atlas](https://www.mongodb.com/atlas)). Razorpay test keys are optional and only needed for payments.

```bash
git clone https://github.com/AxelCell/Gig-Connect.git
cd Gig-Connect
```

### Backend

```bash
cd gig-platform-backend
cp .env.example .env      # then fill in your values
npm install
npm run dev               # http://localhost:5000
```

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Secret used to sign login tokens |
| `PORT` | no | Defaults to `5000` |
| `CLIENT_URL` | no | Allowed frontend origin(s), comma-separated |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | for payments | Razorpay test or live keys |
| `ALLOW_TEST_PAYMENT_BYPASS` | no | `true` lets failed test payments be marked paid (demo only) |

### Frontend

In a new terminal:

```bash
cd gig-platform-frontend
npm install
npm run dev               # http://localhost:5173
```

In development the frontend talks to `http://localhost:5000/api`. To use another backend, set `VITE_API_URL` in `gig-platform-frontend/.env` (see `.env.example`).

### Creating an admin

For security, admin accounts cannot be self-registered. To make one, register a normal account and then promote it in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## API overview

| Resource | Base route |
| --- | --- |
| Users & auth | `/api/users` |
| Gigs | `/api/gigs` |
| Applications | `/api/applications` |
| Chat | `/api/chat` |
| Payments | `/api/payments` |
| Reviews | `/api/reviews` |
| Reports | `/api/reports` |
| Notifications | `/api/notifications` |
| Admin | `/api/admin` |
| Health check | `/api/health` |

For the full phase-by-phase write-up, database design and diagrams, see [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).

## Gig lifecycle

```text
open ──apply──▶ pending ──accept worker──▶ accepted ──pay──▶ in-progress ──complete──▶ completed
```
