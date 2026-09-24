# 🎯 GigConnect Platform – Full-Stack Gig Marketplace

**Semester 6 PBL Project | Complete Implementation**  
**Team:** Harshit Suyal, Manas Joshi, Aishwary Bisht, Saumya Pratap Singh

---

## 📚 Documentation

For comprehensive documentation including:
- ✅ All 3 phases breakdown (Foundation → Marketplace → Communication & Payments)
- ✅ Complete system architecture with diagrams
- ✅ Database design (MongoDB vs SQL comparison)
- ✅ Payment integration (Razorpay)
- ✅ Real-time communication (Socket.io)
- ✅ Complete user journey flows

**→ See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)**

---

## 🚀 Quick Start

### Installation

```bash
# Backend Setup
cd gig-platform-backend
npm install
npm start

# Frontend Setup (new terminal)
cd gig-platform-frontend
npm install
npm run dev
```

### Environment Setup

Create `.env` in `gig-platform-backend/`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gigconnect
JWT_SECRET=your_secret_key_here
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

## 📊 Project Overview

### Tech Stack
- **Frontend:** React 19, Vite, Socket.io-client, Axios
- **Backend:** Node.js, Express.js, MongoDB, Socket.io
- **Payments:** Razorpay
- **Authentication:** JWT + bcryptjs

### Key Features
✅ User authentication with role-based access (Client/Worker/Admin)  
✅ Gig posting & browsing with filtering  
✅ Real-time chat with price offers  
✅ Instant notifications  
✅ Secure Razorpay payment integration  
✅ Work hour tracking & invoice generation  
✅ Reviews & rating system  
✅ Admin dashboard with analytics  
✅ Content moderation & reporting  

---

## 🏗️ Architecture Highlights

### Database (MongoDB)
- 9 collections with 15+ relationships
- Flexible schema for rapid feature development
- Native support for nested arrays (skills, applications)
- Optimized indexing for fast queries

**Why MongoDB?**
- Gig marketplace needs flexible fields
- No junction tables needed for skill arrays
- Scales horizontally with sharding
- JSON-native matches JavaScript stack

### Real-time Communication (Socket.io)
- User rooms: `user:{userId}` for personal notifications
- Gig rooms: `gig:{gigId}` for multi-user chat
- 10+ event types (messages, notifications, payment updates)
- Real-time badge updates on navbar

### Payment Integration (Razorpay)
- Secure HMAC-SHA256 signature verification
- Order creation → Payment processing → Signature verification
- Automatic status updates on completion
- Fallback test mode for development

---

## 📁 Project Structure

```
Gig-Connect/
├── gig-platform-backend/
│   ├── controllers/          # Business logic
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   ├── middleware/          # Auth, validation
│   ├── services/            # Notification service
│   ├── utils/               # Socket, chat access
│   ├── config/              # DB connection
│   └── server.js            # Entry point
│
├── gig-platform-frontend/
│   ├── src/
│   │   ├── pages/           # Main pages
│   │   ├── components/      # UI components
│   │   ├── context/         # Auth, Socket, Toast
│   │   ├── services/        # API client
│   │   ├── constants/       # Config
│   │   └── App.jsx          # Root
│   └── index.html
│
└── PROJECT_DOCUMENTATION.md # Comprehensive docs
```

---

## 📡 API Endpoints Summary

### Users
- `POST /api/users/register` – Register
- `POST /api/users/login` – Login
- `GET/PUT /api/users/profile` – Profile management
- `GET /api/users/worker-updates` – Worker activity feed

### Gigs
- `GET/POST /api/gigs` – Browse & create
- `GET/PUT/DELETE /api/gigs/:id` – Gig management
- `PUT /api/gigs/:id/start|stop|complete` – Work tracking

### Applications
- `POST /api/applications/:gigId` – Apply for gig
- `PUT /api/applications/:id/status` – Accept/reject

### Chat
- `GET /api/chat/:gigId` – Get messages
- `POST /api/chat/:gigId` – Send message

### Notifications
- `GET /api/notifications` – Get all
- `PUT /api/notifications/:id/read` – Mark read
- `PUT /api/notifications/read-all` – Bulk mark read

### Payments
- `POST /api/payments/create-order` – Razorpay order
- `POST /api/payments/verify` – Verify payment
- `POST /api/payments/test-mark-paid` – Test mode (disabled unless `ALLOW_TEST_PAYMENT_BYPASS=true`)

### Admin
- `GET /api/admin/stats` – Dashboard stats
- `GET/DELETE /api/admin/gigs` – Gig management
- `PUT /api/admin/reports/:id/resolve` – Resolve reports

---

## 🔐 Security Features

✅ **JWT Authentication** – 30-day token expiry  
✅ **Password Hashing** – bcryptjs salt rounds  
✅ **Role-based Access** – Client/Worker/Admin differentiation  
✅ **Chat Access Control** – Only gig participants can message  
✅ **Payment Verification** – HMAC-SHA256 signature check  
✅ **Admin Protection** – Minimum 1 admin must exist  
✅ **Input Validation** – Phone format, email, password length, budget > 0, date validation  
✅ **No Admin Self-Registration** – Admins are promoted in the database only  
✅ **Private Contact Details** – Email/phone visible only to the client, hired worker and admins  
✅ **Safe Search** – User input is regex-escaped before MongoDB queries  
✅ **Security Headers** – helmet (HSTS, nosniff, frame protection)  

---

## 💡 Key Workflows

### 1. Worker Applies for Gig
```
Worker browses gigs 
→ Finds matching gig 
→ Clicks "Apply" 
→ Fills experience & price 
→ Application saved
→ Client gets notified (real-time)
```

### 2. Client Accepts Worker
```
Client views applications 
→ Clicks "Accept" on worker 
→ Enters negotiated amount 
→ System creates:
   • System message (chat)
   • Notification (alert)
   • Updates gig status
   • Rejects other applicants
→ Worker gets 🔔 badge notification
```

### 3. Payment Flow
```
Client clicks "Pay Now"
→ Razorpay modal opens
→ User enters payment details
→ Razorpay processes (bank/PSP)
→ Returns paymentId & signature
→ Backend verifies HMAC signature
→ If valid: Payment marked paid
→ Gig moves to "in-progress"
→ Both get notifications
→ Real-time UI updates via Socket.io
```

### 4. Real-time Chat
```
Worker joins gig
→ Socket joins "gig:{gigId}" room
→ Types message
→ Message saved to DB
→ Socket emits "message:new"
→ All participants see it instantly
→ Receiver also gets direct socket event
```

---

## 📊 Development Phases

| Phase | Duration | Focus | Status |
|-------|----------|-------|--------|
| **Phase 1** | Weeks 1-3 | User auth, profiles, role-based access | ✅ Complete |
| **Phase 2** | Weeks 4-6 | Gig CRUD, applications, browsing | ✅ Complete |
| **Phase 3A** | Weeks 7-8 | Real-time chat, notifications, Socket.io | ✅ Complete |
| **Phase 3B** | Weeks 9-10 | Razorpay integration, work tracking | ✅ Complete |
| **Phase 3C** | Week 10+ | Admin panel, reviews, reporting | ✅ Complete |

---

## 📈 Performance Metrics

- **Database:** 9 collections, 1000+ documents
- **API:** 25+ endpoints, avg response <200ms
- **Real-time:** 10+ Socket events, <100ms latency
- **Frontend:** 8+ pages, component-based architecture
- **Code:** 5000+ lines across backend & frontend

---

## 🎓 Learning Outcomes

By building this project, we gained expertise in:
- ✅ Full-stack MERN development
- ✅ Real-time WebSocket communication
- ✅ Payment gateway integration
- ✅ JWT authentication & authorization
- ✅ NoSQL database design
- ✅ RESTful API design patterns
- ✅ React Context API state management
- ✅ Production deployment practices

---

## 📖 Related Documentation

- **Detailed Docs:** [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)
- **Backend README:** [gig-platform-backend/](./gig-platform-backend/)
- **Frontend README:** [gig-platform-frontend/](./gig-platform-frontend/)

---

## 🔄 Data Flow Overview

```
User Registration
  → JWT token generation
  → Session management
     ↓
Browse Gigs
  → Filter by category/budget
  → Real-time search
     ↓
Apply for Gig
  → Submit application
  → Client notification
     ↓
Client Accepts Worker
  → System message created
  → Notification sent
  → Gig status updated
     ↓
Chat & Offers
  → Real-time messages
  → Price negotiation
  → Socket.io broadcasts
     ↓
Payment
  → Razorpay order created
  → Payment processed
  → Signature verified
  → Notifications sent
     ↓
Work Execution
  → Timer starts/stops
  → Hours tracked
  → Gig completed
     ↓
Review & Rating
  → Both submit reviews
  → Profile ratings updated
```

---

## 🚀 Future Enhancements

- Advanced search with full-text search
- Video profile verification
- Escrow payment system
- Dispute resolution module
- Skill verification badges
- Mobile app (React Native)
- Analytics dashboard for workers
- Automated payment settlements

---

## 📞 Contact & Support

**Team:** Harshit Suyal, Manas Joshi, Aishwary Bisht, Saumya Pratap Singh  
**Project:** GigConnect - Full-Stack Gig Marketplace  
**Status:** Production Ready (Phase 3 Complete)

---

**© 2026 GigConnect Platform | Semester 6 PBL Project**
