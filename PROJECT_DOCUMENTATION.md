# 🎯 GigConnect Platform – Complete Project Documentation

**Semester 6 PBL Project | Full-Stack Gig Marketplace**

**Team:** Harshit Suyal, Manas Joshi, Aishwary Bisht, Saumya Pratap Singh  
**Current Status:** Phase 3 Complete (100%) | Production Ready

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Development Phases](#development-phases)
3. [Technology Stack](#technology-stack)
4. [Database Architecture](#database-architecture)
5. [System Architecture](#system-architecture)
6. [Payment Integration](#payment-integration)
7. [Real-time Communication](#real-time-communication)
8. [Data Flow & Connections](#data-flow--connections)
9. [Why MongoDB Over SQL](#why-mongodb-over-sql)
10. [Deployment & Setup](#deployment--setup)

---

## 🎯 Project Overview

**GigConnect** is a full-stack gig marketplace platform that connects:
- **Clients** – Post jobs and hire freelancers
- **Workers** – Browse, apply, and earn from gigs
- **Admins** – Manage platform, content, users, and revenue

The platform features real-time chat, instant notifications, secure payments, and comprehensive role-based access control.

**Key Metrics:**
- 9 MongoDB collections with 15+ relationships
- 10+ real-time Socket.io events
- 25+ REST API endpoints
- 8+ user-facing pages
- Razorpay payment gateway integration
- Admin analytics dashboard

---

## 📅 Development Phases

### **Phase 1: Foundation & Core User Features (Weeks 1-3)**

**Objectives:** Establish basic user ecosystem and gig browsing

#### ✅ Completed Features:

**Backend:**
- User authentication (Register/Login with JWT)
- User profile management
- Role-based access control (client/worker/admin)
- Password hashing with bcryptjs
- Middleware authentication layer
- Basic error handling

**Frontend:**
- Login & Registration pages
- Home landing page
- Responsive navigation
- Context-based auth state management
- Toast notifications system

**Database:**
- User collection with fields: name, email, password, role, phone, location, skills, bio, workType
- JWT token generation & verification

**Deliverables:**
- Secure user onboarding flow
- Role differentiation (client vs worker)
- Session persistence via JWT

---

### **Phase 2: Gig Marketplace & Applications (Weeks 4-6)**

**Objectives:** Enable job posting, browsing, and worker proposals

#### ✅ Completed Features:

**Backend:**
- Gig CRUD operations (Create, Read, Update, Delete)
- Gig status lifecycle (open → pending → accepted → in-progress → completed)
- Application/Proposal system with worker proposals
- Application acceptance/rejection workflow
- Gig filtering by category, budget, status
- Skill-based gig tagging
- Worker experience capture in applications
- Negotiated amount setting during acceptance

**Frontend:**
- Gig List page with search & filters
- Gig Detail page with full information
- Application modal for workers
- Client application management view
- Gig browsing interface for workers
- Status badge system

**Database:**
- Gig collection with: title, description, budget, category, skills[], status, deadline, location, requiredWorkers, applications[]
- Application collection with: worker, gig, proposedPrice, workerExperience, status

**Key Workflows:**
- Client posts gig → Workers browse & apply → Client accepts worker → Gig status changes

**Deliverables:**
- Functional job marketplace
- Proposal management system
- Multi-worker application handling

---

### **Phase 3A: Real-time Chat & Notifications (Weeks 7-8)**

**Objectives:** Enable direct communication and alert system

#### ✅ Completed Features:

**Backend:**
- Real-time chat within gig context
- Message types: text, offer, system
- Price offer system with amount field
- Chat access control (only gig participants)
- Message persistence in MongoDB
- Notification system with types (selection, rejection, payment, chat, application, general)
- Socket.io room management (user:{userId}, gig:{gigId})
- Notification service for event-driven alerts
- Mark notification as read/unread

**Frontend:**
- GigDetail chat interface (messages thread, receiver dropdown)
- Dashboard notifications panel
- Navbar notification badge with unread count
- Real-time message updates
- Socket.io connection & event listeners
- Notification read status UI

**Database:**
- Message collection with: gig, sender, receiver, message, messageType, amountOffer, timestamps
- Notification collection with: recipient, sender, type, title, message, relatedGig, isRead

**Real-time Events:**
- `message:new` – Broadcast to gig participants
- `notification:new` – Direct to recipient user room
- `notification:updated` – Update notification status

**Deliverables:**
- Real-time chat system with offer feature
- Event-driven notification system
- Persistent message storage

---

### **Phase 3B: Payment Integration & Work Tracking (Weeks 9-10)**

**Objectives:** Enable secure transactions and job completion tracking

#### ✅ Completed Features:

**Backend:**
- Razorpay payment gateway integration
- Payment order creation
- HMAC-SHA256 signature verification
- Payment status tracking (created → pending → paid)
- Test mode fallback for development
- Gig state transition on payment (→ in-progress)
- Automatic notification on payment verification
- Work timer start/stop
- Total work hours calculation
- Invoice generation (JSON export)
- Gig completion workflow

**Frontend:**
- Razorpay checkout modal
- Test payment fallback option
- Payment status display
- Work timer UI (start/stop buttons)
- Work hours tracking display
- Invoice download button
- Payment history in Dashboard

**Database:**
- Payment collection with: gig, client, worker, amount, status, razorpayOrderId, razorpayPaymentId, razorpaySignature, paidAt
- Gig fields updated: paymentStatus, paidAt, totalWorkHours, workStartedAt, workEndedAt

**Payment Flow:**
1. Client initiates payment → Razorpay order creation
2. Worker completes payment → Signature verification
3. Payment marked paid → Gig moves to in-progress
4. Notifications sent to both parties
5. Real-time UI updates via Socket.io

**Deliverables:**
- Secure payment processing
- Work tracking system
- Job completion workflow
- Automatic settlement notifications

---

### **Phase 3C: Advanced Features & Admin Panel (Week 10+)**

**Objectives:** Platform governance and analytics

#### ✅ Completed Features:

**Backend:**
- Admin dashboard stats (users, gigs, revenue, applications)
- Reviews & ratings (1-5 stars with comments)
- Reporting system (report users/gigs with reasons)
- Admin resolution workflow (ban, warning, delete)
- Admin user management (view, toggle status, delete with cascade)
- Worker updates feed (applications, payments, invoices, chat)

**Frontend:**
- Admin dashboard with KPIs
- Gig management (view, delete)
- Review management (view, delete)
- Payment overview
- Report resolution interface
- User management

**Database:**
- Review collection with: gig, reviewer, reviewee, rating, comment
- Report collection with: reporter, reportedUser/reportedGig, reason, status, resolvedBy, resolution

**Deliverables:**
- Content moderation system
- Admin governance tools
- Platform analytics
- User trust & safety features

---

## 🛠️ Technology Stack

### **Backend**
```
┌─────────────────────────────────────┐
│ Node.js + Express.js (v5.2.1)       │
│ ────────────────────────────────    │
│ • HTTP Server & RESTful APIs        │
│ • Middleware (Auth, CORS)           │
│ • Error handling & validation       │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ MongoDB (v9.2.3) + Mongoose         │
│ ────────────────────────────────    │
│ • Document-based NoSQL database     │
│ • Schema validation                 │
│ • Relationship management           │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ Socket.io (v4.8.3)                  │
│ ────────────────────────────────    │
│ • Real-time bidirectional events    │
│ • Room-based broadcasting           │
│ • JWT authentication for sockets    │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ Razorpay (v2.9.6)                   │
│ ────────────────────────────────    │
│ • Payment gateway integration       │
│ • Order creation & verification     │
│ • HMAC-SHA256 signature validation  │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ Security & Authentication           │
│ ────────────────────────────────    │
│ • bcryptjs (password hashing)       │
│ • jsonwebtoken (JWT auth)           │
│ • CORS configuration                │
└─────────────────────────────────────┘
```

### **Frontend**
```
┌─────────────────────────────────────┐
│ React 19 + Vite                     │
│ ────────────────────────────────    │
│ • Component-driven UI               │
│ • Context API state management      │
│ • Vite build optimization           │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ React Router DOM (v7.13.1)          │
│ ────────────────────────────────    │
│ • Client-side routing               │
│ • Protected routes                  │
│ • Navigation management             │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ Axios (v1.13.6)                     │
│ ────────────────────────────────    │
│ • HTTP client                       │
│ • JWT interceptor                   │
│ • Error handling                    │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ Socket.io Client (v4.8.3)           │
│ ────────────────────────────────    │
│ • Real-time event listener          │
│ • Automatic reconnection            │
│ • Event emission to backend         │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ CSS3 + Responsive Design            │
│ ────────────────────────────────    │
│ • Mobile-first approach             │
│ • CSS Grid & Flexbox                │
│ • DaisyUI styling                   │
└─────────────────────────────────────┘
```

---

## 💾 Database Architecture

### **Why MongoDB Over SQL?**

| Factor | MongoDB | SQL (MySQL/PostgreSQL) | GigConnect Choice |
|--------|---------|----------------------|------------------|
| **Schema Flexibility** | Dynamic schemas, evolve over time | Fixed schema, rigid | ✅ MongoDB |
| **Nested Data** | Native support for arrays & objects | Requires joins | ✅ MongoDB |
| **Horizontal Scaling** | Built-in sharding | Complex replication | ✅ MongoDB |
| **Query Performance** | Document-level queries are fast | Multiple joins slower | ✅ MongoDB |
| **Development Speed** | Rapid prototyping, schema changes | Schema migrations needed | ✅ MongoDB |
| **Relationship Handling** | Document references & embedding | Strong ACID compliance | ⚖️ Depends on use case |
| **Data Structure** | Perfect for gigs with varied skills[] | All skills require separate table | ✅ MongoDB |
| **Scalability** | Automatic sharding across servers | Manual partitioning | ✅ MongoDB |

**Decision Rationale for GigConnect:**
1. **Flexible Gig Fields** – Different gigs need different skills, categories, metadata → MongoDB's flexible schema wins
2. **Nested Applications** – Gigs store multiple applications as array → No need for join tables
3. **Real-time Events** – Socket.io + MongoDB change streams scale better with sharding
4. **Rapid Feature Development** – Phase 1→2→3 evolution with schema changes easier in MongoDB
5. **Developer Productivity** – JSON-like structure matches JavaScript/Node.js development

**MongoDB Usage in GigConnect:**

```javascript
// Example: A Gig document with nested arrays
{
  _id: ObjectId,
  title: "Build React Dashboard",
  client: ObjectId (ref User),
  category: "Development",
  skills: ["React", "Node.js", "MongoDB"],  ← Array embedded
  applications: [
    {
      _id: ObjectId,
      worker: ObjectId (ref User),
      proposedPrice: 15000,
      status: "pending"
    }
  ],
  messages: [...],  ← Could be stored as refs or embedded
  status: "open",
  createdAt: ISODate
}
```

With SQL, this would need:
- Users table
- Gigs table
- GigSkills table (join)
- Applications table
- ApplicationWorkers table (if multiple workers)
- Messages table
→ **6+ tables vs 1 MongoDB collection**

---

### **Data Model Schema**

```
┌──────────────────────────────────────────────────────────────┐
│                     MONGODB COLLECTIONS                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1️⃣  USERS                                                   │
│   ├─ _id: ObjectId (PK)                                    │
│   ├─ name, email (unique), password (hashed)              │
│   ├─ role: "client" | "worker" | "admin"                 │
│   ├─ bio, skills[], phone, location, workType            │
│   ├─ avatar, isActive (boolean)                           │
│   └─ timestamps                                            │
│                                                              │
│  2️⃣  GIGS                                                    │
│   ├─ _id: ObjectId (PK)                                    │
│   ├─ title, description, budget                           │
│   ├─ client: ObjectId (FK → Users)                        │
│   ├─ category, subcategory, skills[]                      │
│   ├─ status, paymentStatus, deadline, location            │
│   ├─ worker: ObjectId (FK → Users)  [after accept]       │
│   ├─ assignedWorkers: [ObjectId]    [multiple workers]   │
│   ├─ totalWorkHours, workStartedAt, workEndedAt         │
│   └─ timestamps                                            │
│                                                              │
│  3️⃣  APPLICATIONS                                             │
│   ├─ _id: ObjectId (PK)                                    │
│   ├─ worker: ObjectId (FK → Users)                        │
│   ├─ gig: ObjectId (FK → Gigs)                            │
│   ├─ client: ObjectId (FK → Users)                        │
│   ├─ proposedPrice, workerExperience, workerSkills       │
│   ├─ status: "pending" | "accepted" | "rejected"        │
│   └─ timestamps                                            │
│                                                              │
│  4️⃣  MESSAGES                                                │
│   ├─ _id: ObjectId (PK)                                    │
│   ├─ gig: ObjectId (FK → Gigs) [indexed]                 │
│   ├─ sender: ObjectId (FK → Users)                        │
│   ├─ receiver: ObjectId (FK → Users)                      │
│   ├─ message: String, messageType: "text"|"offer"|"system"│
│   ├─ amountOffer: Number (for price offers)              │
│   └─ timestamps                                            │
│                                                              │
│  5️⃣  NOTIFICATIONS                                            │
│   ├─ _id: ObjectId (PK)                                    │
│   ├─ recipient: ObjectId (FK → Users) [indexed]          │
│   ├─ sender: ObjectId (FK → Users)                        │
│   ├─ type: "selection"|"rejection"|"payment"|"chat"...  │
│   ├─ title, message, relatedGig: ObjectId                │
│   ├─ isRead: Boolean [indexed for unread queries]        │
│   └─ timestamps                                            │
│                                                              │
│  6️⃣  PAYMENTS                                                │
│   ├─ _id: ObjectId (PK)                                    │
│   ├─ gig: ObjectId (FK → Gigs)                            │
│   ├─ client, worker: ObjectId (FK → Users)               │
│   ├─ amount, currency                                      │
│   ├─ razorpayOrderId, razorpayPaymentId, razorpaySignature│
│   ├─ status: "created"|"pending"|"paid"|"failed"         │
│   ├─ paidAt: ISODate                                       │
│   └─ timestamps                                            │
│                                                              │
│  7️⃣  REVIEWS                                                 │
│   ├─ _id: ObjectId (PK)                                    │
│   ├─ gig: ObjectId (FK → Gigs)                            │
│   ├─ reviewer, reviewee: ObjectId (FK → Users)           │
│   ├─ rating: Number (1-5)                                │
│   ├─ comment: String                                       │
│   └─ timestamps                                            │
│                                                              │
│  8️⃣  REPORTS                                                 │
│   ├─ _id: ObjectId (PK)                                    │
│   ├─ reporter: ObjectId (FK → Users)                      │
│   ├─ reportedUser | reportedGig: ObjectId               │
│   ├─ reason: String, status: "pending"|"resolved"       │
│   ├─ resolvedBy: ObjectId (FK → Users/Admins)           │
│   ├─ resolution: String                                    │
│   └─ timestamps                                            │
│                                                              │
│  9️⃣  ADMIN ANALYTICS (Optional)                              │
│   ├─ totalUsers, totalGigs, totalRevenue                 │
│   ├─ activeGigs, completedGigs, avgRating                │
│   └─ monthly/daily metrics                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### **Indexing Strategy for Performance**

```javascript
// Critical indexes for fast queries
Users.index({ email: 1 })              // For login queries
Gigs.index({ client: 1 })              // Filter by client
Gigs.index({ status: 1 })              // Filter by status
Messages.index({ gig: 1 })             // Query messages by gig
Notifications.index({ recipient: 1, isRead: 1 })  // Unread alerts
Applications.index({ worker: 1, gig: 1 })  // Unique application check
Payments.index({ gig: 1 })             // Payment by gig
```

---

## 🏗️ System Architecture

### **High-Level Architecture Diagram**

```
┌────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────┐         ┌──────────────────────┐            │
│  │   React App     │◄────────┤  Context API State   │            │
│  │  (Vite build)   │         │  • Auth Context      │            │
│  │                 │         │  • Socket Context    │            │
│  │ Pages:          │         │  • Toast Context     │            │
│  │ • Login         │         └──────────────────────┘            │
│  │ • GigList       │                                              │
│  │ • GigDetail     │         ┌──────────────────────┐            │
│  │ • Dashboard     │◄────────┤  Axios API Client    │            │
│  │ • Admin         │         │  • JWT Interceptor   │            │
│  │                 │         │  • Error Handling    │            │
│  └─────────────────┘         └──────────────────────┘            │
│          ▲                                                         │
│          │ HTTP/HTTPS (REST API)                                 │
│          │ WebSocket (Socket.io)                                 │
│          ▼                                                         │
└────────────────────────────────────────────────────────────────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
           ▼                ▼                ▼
    ┌────────────┐  ┌─────────────────┐  ┌──────────────┐
    │  REST API  │  │ Socket.io Server│  │ Auth Middleware
    │ Requests   │  │ Real-time Events│  │ JWT Verify
    │            │  │                 │  │
    └────────────┘  └─────────────────┘  └──────────────┘
           │                │                │
           └────────────────┼────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌─────────────────────────┐        ┌────────────────────────┐
│   Express.js Server     │        │  Payment Gateway       │
│   (Node.js)             │        │  (Razorpay)            │
│                         │        │                        │
│ 10+ Route Handlers:     │        │ • Order Creation       │
│ • /api/users/*          │        │ • Signature Verify     │
│ • /api/gigs/*           │        │ • Payment Status       │
│ • /api/applications/*   │        │                        │
│ • /api/chat/*           │        └────────────────────────┘
│ • /api/notifications/*  │
│ • /api/payments/*       │
│ • /api/reviews/*        │
│ • /api/admin/*          │
│ • /api/reports/*        │
│                         │
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│   MongoDB Database      │
│   (NoSQL)               │
│                         │
│ 9 Collections:          │
│ • Users                 │
│ • Gigs                  │
│ • Applications          │
│ • Messages              │
│ • Notifications         │
│ • Payments              │
│ • Reviews               │
│ • Reports               │
│ • Sessions (optional)   │
│                         │
│ Indexes:                │
│ • Email (unique)        │
│ • Gig status            │
│ • User role             │
│ • Recipient (notif)     │
│ • isRead (notif)        │
│                         │
└─────────────────────────┘
```

### **Socket.io Real-time Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    SOCKET.IO SERVER                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Socket Middleware Authentication           │  │
│  │  • Verify JWT token from client                      │  │
│  │  • Load user from database                           │  │
│  │  • Attach user object to socket                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Socket Rooms & Broadcasting                 │  │
│  │                                                      │  │
│  │  User Rooms (1-to-1 messaging):                     │  │
│  │  ├─ user:userId1                                    │  │
│  │  ├─ user:userId2                                    │  │
│  │  └─ user:userId3                                    │  │
│  │                                                      │  │
│  │  Gig Rooms (Broadcast to participants):             │  │
│  │  ├─ gig:gigId1 (client + all applicants)           │  │
│  │  ├─ gig:gigId2                                      │  │
│  │  └─ gig:gigId3                                      │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│         ┌───────────────┼───────────────┐                   │
│         │               │               │                   │
│         ▼               ▼               ▼                   │
│    ┌─────────┐    ┌────────────┐   ┌─────────────┐        │
│    │ Events  │    │  Listeners │   │ Broadcasting│        │
│    │         │    │            │   │             │        │
│    │ Emitted │    │ Respond to │   │ To rooms:   │        │
│    │ From:   │    │ events     │   │ • message   │        │
│    │ • Chat  │    │ from:      │   │ • notif     │        │
│    │ • Pay   │    │ • Messages │   │ • gig upd   │        │
│    │ • App   │    │ • Payments │   │ • payment   │        │
│    │ • Notif │    │ • Apps     │   │             │        │
│    │         │    │            │   │             │        │
│    └─────────┘    └────────────┘   └─────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
        │
        │ Events Flow Back to Clients
        ▼
┌──────────────────────────────────────┐
│   Socket Client (Frontend)           │
│                                      │
│ Listeners:                           │
│ • socket.on('message:new')           │
│ • socket.on('notification:new')      │
│ • socket.on('gig:updated')           │
│ • socket.on('payment:updated')       │
│ • socket.on('notification:updated')  │
│                                      │
│ Event Handlers Update:               │
│ • Chat UI (add message)              │
│ • Notifications (add alert)          │
│ • Gig state (refresh data)           │
│ • Navbar badge (unread count)        │
│                                      │
└──────────────────────────────────────┘
```

---

## 💳 Payment Integration

### **Razorpay Payment Flow**

```
┌────────────────────────────────────────────────────────────────┐
│                   PAYMENT WORKFLOW                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  STEP 1: Payment Initiation (Frontend)                        │
│  ────────────────────────────────────                         │
│                                                                │
│  Client clicks "Pay" on GigDetail page                        │
│          │                                                     │
│          ▼                                                     │
│  Loads Razorpay SDK dynamically:                              │
│  ┌────────────────────────────────────┐                      │
│  │ const script = document.createElement│                      │
│  │ script.src = 'razorpay checkout.js'│                      │
│  │ document.body.appendChild(script)   │                      │
│  └────────────────────────────────────┘                      │
│                                                                │
│  ────────────────────────────────────────────────────────────│
│                                                                │
│  STEP 2: Order Creation (Frontend → Backend)                 │
│  ──────────────────────────────────────────                  │
│                                                                │
│  POST /api/payments/create-order                             │
│  Body: {gigId, workerId}                                      │
│                                                                │
│          ▼                                                     │
│                                                                │
│  ┌──────────────────────────────────────┐                    │
│  │  Backend (paymentController.js)      │                    │
│  │  ──────────────────────────────      │                    │
│  │  1. Validate gig exists & user auth  │                    │
│  │  2. Get amount from gig.budget       │                    │
│  │  3. Create Razorpay instance:        │                    │
│  │     new Razorpay({                   │                    │
│  │       key_id: process.env.RPY_KEY,   │                    │
│  │       key_secret: process.env.RPY_SEC│                    │
│  │     })                               │                    │
│  │  4. Call razorpay.orders.create({    │                    │
│  │       amount: (budget * 100),        │                    │
│  │       currency: 'INR',               │                    │
│  │       receipt: 'gig_${id}_${ts}',    │                    │
│  │       notes: {gigId, clientId, ...}  │                    │
│  │     })                               │                    │
│  │  5. Save Payment document:           │                    │
│  │     {                                │                    │
│  │       gig, client, worker,           │                    │
│  │       razorpayOrderId: order.id,     │                    │
│  │       status: 'created'              │                    │
│  │     }                                │                    │
│  │  6. Return: {order, keyId}           │                    │
│  └──────────────────────────────────────┘                    │
│          │                                                     │
│          ▼                                                     │
│  Response: {order: {id, amount, ...}, keyId}                │
│                                                                │
│  ────────────────────────────────────────────────────────────│
│                                                                │
│  STEP 3: Razorpay Checkout Modal (Frontend)                  │
│  ──────────────────────────────────────────                  │
│                                                                │
│  ┌────────────────────────────────────┐                      │
│  │  new Razorpay({                    │                      │
│  │    key: keyId,                     │                      │
│  │    amount: order.amount (paise),   │                      │
│  │    currency: 'INR',                │                      │
│  │    order_id: order.id,             │                      │
│  │    name: 'GigConnect',             │                      │
│  │    description: 'Payment for Gig', │                      │
│  │    prefill: {                      │                      │
│  │      name: user.name,              │                      │
│  │      email: user.email,            │                      │
│  │      contact: user.phone           │                      │
│  │    },                              │                      │
│  │    handler: (response) => {        │                      │
│  │      // Payment successful         │                      │
│  │      verifyPayment(response)       │                      │
│  │    }                               │                      │
│  │  })                                │                      │
│  │  razorpay.open()                   │                      │
│  └────────────────────────────────────┘                      │
│                                                                │
│  User sees: ┌─────────────────────────┐                      │
│             │  Razorpay Modal         │                      │
│             │  ├─ Card Payment        │                      │
│             │  ├─ UPI Payment         │                      │
│             │  ├─ Net Banking         │                      │
│             │  └─ Wallet Payment      │                      │
│             └─────────────────────────┘                      │
│                                                                │
│  ────────────────────────────────────────────────────────────│
│                                                                │
│  STEP 4: Payment Processing (Razorpay Server)                │
│  ───────────────────────────────────────────                 │
│                                                                │
│  ┌────────────────────────────────────────┐                  │
│  │  Razorpay Payment Gateway (External)   │                  │
│  │                                        │                  │
│  │  1. Process payment via bank/PSP       │                  │
│  │  2. Verify with payment processor      │                  │
│  │  3. Generate payment ID                │                  │
│  │  4. Create HMAC signature:             │                  │
│  │     SHA256(orderId|paymentId, secret)  │                  │
│  │  5. Return to frontend:                │                  │
│  │     {                                  │                  │
│  │       razorpay_order_id,               │                  │
│  │       razorpay_payment_id,             │                  │
│  │       razorpay_signature                │                  │
│  │     }                                  │                  │
│  └────────────────────────────────────────┘                  │
│                                                                │
│  ────────────────────────────────────────────────────────────│
│                                                                │
│  STEP 5: Payment Verification (Frontend → Backend)           │
│  ──────────────────────────────────────────────             │
│                                                                │
│  POST /api/payments/verify                                   │
│  Body: {                                                      │
│    razorpayOrderId,                                           │
│    razorpayPaymentId,                                         │
│    razorpaySignature                                          │
│  }                                                            │
│          │                                                     │
│          ▼                                                     │
│                                                                │
│  ┌──────────────────────────────────────────┐               │
│  │  Backend Verification Logic              │               │
│  │  ──────────────────────────────────      │               │
│  │                                          │               │
│  │  1. Fetch Payment doc from DB:           │               │
│  │     Payment.findOne({                    │               │
│  │       razorpayOrderId: orderId           │               │
│  │     })                                   │               │
│  │                                          │               │
│  │  2. Regenerate signature locally:        │               │
│  │     const generatedSig = crypto          │               │
│  │       .createHmac('sha256', SECRET)      │               │
│  │       .update(orderId|paymentId)         │               │
│  │       .digest('hex')                     │               │
│  │                                          │               │
│  │  3. Compare signatures:                  │               │
│  │     if (generatedSig === providedSig) {  │               │
│  │       // Signature valid ✓              │               │
│  │     } else {                             │               │
│  │       // Fraud attempt ✗                │               │
│  │       return error 400                   │               │
│  │     }                                    │               │
│  │                                          │               │
│  │  4. Update Payment status:               │               │
│  │     payment.status = 'paid'              │               │
│  │     payment.razorpayPaymentId = payId    │               │
│  │     payment.razorpaySignature = sig      │               │
│  │     payment.paidAt = new Date()          │               │
│  │     payment.save()                       │               │
│  │                                          │               │
│  │  5. Update Gig status:                   │               │
│  │     gig.paymentStatus = 'paid'           │               │
│  │     gig.status = 'in-progress'           │               │
│  │     gig.paidAt = payment.paidAt          │               │
│  │     gig.save()                           │               │
│  │                                          │               │
│  │  6. Send notifications (both parties):   │               │
│  │     await createNotification({           │               │
│  │       recipientId: worker,               │               │
│  │       type: 'payment',                   │               │
│  │       title: 'Payment received',         │               │
│  │       message: `₹${amount} verified`     │               │
│  │     })                                   │               │
│  │                                          │               │
│  │  7. Socket.io emit to both parties:      │               │
│  │     emitToUser(worker, 'notif:new')      │               │
│  │     emitToUser(client, 'gig:updated')    │               │
│  │     emitToGig(gigId, 'payment:updated')  │               │
│  │                                          │               │
│  │  8. Return response to frontend:         │               │
│  │     {                                    │               │
│  │       payment: {...populated},           │               │
│  │       gig: {...updated}                  │               │
│  │     }                                    │               │
│  └──────────────────────────────────────────┘               │
│          │                                                    │
│          ▼                                                    │
│  Frontend updates UI:                                         │
│  • Payment status → "Paid ✓"                                 │
│  • Gig status → "In Progress"                                │
│  • Show success toast                                         │
│  • Trigger confetti animation                                │
│                                                                │
│  ────────────────────────────────────────────────────────────│
│                                                                │
│  STEP 6: Failure Handling (Test Mode, opt-in only)           │
│  ───────────────────────────────────                         │
│                                                                │
│  If payment fails:                                            │
│  1. Razorpay emits payment.failed event                       │
│  2. Fallback handler triggers (only if the server has       │
│     ALLOW_TEST_PAYMENT_BYPASS=true; otherwise 403):          │
│     POST /api/payments/test-mark-paid                        │
│  3. Backend marks payment as paid manually                    │
│  4. Same notification flow as success                        │
│  5. Frontend shows: "Test mode: Payment marked done"         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### **Payment Data Model**

```javascript
// Payment Collection Schema
{
  _id: ObjectId,
  
  // Gig & Participants
  gig: ObjectId (ref Gig),           // Which gig this payment is for
  client: ObjectId (ref User),       // Who's paying
  worker: ObjectId (ref User),       // Who's receiving
  
  // Amount Details
  amount: Number,                    // In base currency (₹)
  currency: String,                  // e.g., "INR"
  
  // Razorpay Order Details
  razorpayOrderId: String,          // Order ID from Razorpay
  razorpayPaymentId: String,        // Payment ID (after payment)
  razorpaySignature: String,        // HMAC signature for verification
  
  // Payment Status
  status: String,                    // "created" → "pending" → "paid" → "failed"
  paidAt: ISODate,                   // Timestamp when marked paid
  
  // Timestamps
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### **Security Measures**

1. **Signature Verification** – HMAC-SHA256 prevents tampering
2. **Amount Validation** – Backend validates amount matches gig budget
3. **User Authorization** – Only clients can initiate payment for their gigs
4. **Test Mode** – Development fallback doesn't charge real money
5. **Error Handling** – Failed payments rollback Gig status

---

## 📡 Real-time Communication

### **Chat & Messaging System**

```
┌─────────────────────────────────────────────────────────────┐
│          HOW MESSAGES & NOTIFICATIONS WORK                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PARTICIPANTS:                                              │
│  • Client (Job poster)                                     │
│  • Worker (Applicant)                                      │
│  • Admin (Super user)                                      │
│                                                             │
│  ┌────────────────────────────────────────────────┐        │
│  │         MESSAGE vs NOTIFICATION                │        │
│  ├────────────────────────────────────────────────┤        │
│  │                                                │        │
│  │  MESSAGES:                                     │        │
│  │  └─ Direct conversation in gig context       │        │
│  │     • One gig → One chat thread              │        │
│  │     • Sender → Receiver (1-to-1)             │        │
│  │     • Types: text, offer (price), system     │        │
│  │     • Stored in: Messages collection          │        │
│  │     • View: GigDetail → Chat panel            │        │
│  │     • Broadcast: Only gig participants       │        │
│  │                                                │        │
│  │  NOTIFICATIONS:                                │        │
│  │  └─ Alert feed about events                  │        │
│  │     • One recipient → Many events            │        │
│  │     • Sender is system/user                  │        │
│  │     • Types: selection, rejection, payment   │        │
│  │     • Stored in: Notifications collection     │        │
│  │     • View: Dashboard → Notifications tab    │        │
│  │     • Broadcast: To specific user room       │        │
│  │                                                │        │
│  └────────────────────────────────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Example: Worker Accepted - Message + Notification Flow**

```
SCENARIO: Client accepts worker application

┌──────────────────────────────────────────────────────────────┐
│  TRIGGER: Client clicks "Accept" on application             │
│  ENDPOINT: PUT /api/applications/:appId/status               │
└──────────────────────────────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌──────────────────┐    ┌────────────────────┐
        │ CREATE MESSAGE   │    │ CREATE NOTIFICATION│
        │ (for chat)       │    │ (for alert)        │
        └──────────────────┘    └────────────────────┘
                │                         │
                ▼                         ▼
        Message.create({        Notification.create({
          gig: gigId,             recipient: workerId,
          sender: clientId,        senderId: clientId,
          receiver: workerId,      type: "selection",
          message: "...            title: "You have been selected",
            multiline with         message: "Congratulations!...",
            full gig details...",  relatedGig: gigId,
          messageType: "system"    isRead: false
        })                       })
                │                         │
                ▼                         ▼
        Stored in DB         Stored in DB
        ┌──────────┐         ┌──────────────┐
        │ MESSAGES │         │NOTIFICATIONS │
        │ collection│        │ collection   │
        └──────────┘         └──────────────┘
                │                         │
                ▼                         ▼
        Socket Emit:         Socket Emit:
        emitToGig(            emitToUser(
          gigId,              workerId,
          "message:new",      "notification:new",
          messageObj          notificationObj
        )                    )
                │                         │
                └────────────┬────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
        Frontend:      Frontend:           Frontend:
        GigDetail      Dashboard           Navbar
        Chat Box       Notifications       Badge
        
        "System:       Shows:              Unread
        You have       • Title:            count
        been           'You have been      increments
        selected"      selected'           "+1"
                       • Message: Full
                       • Unread badge
                       • Read/Unread
                         toggle
```

### **Socket.io Event Documentation**

```javascript
// REAL-TIME EVENTS IN GIGCONNECT

// 1. MESSAGE EVENTS
socket.on('join:gig', ({ gigId }) => {
  // Worker/Client joins gig chat room
  // Action: User enters GigDetail page
  socket.join(`gig:${gigId}`)
})

socket.emit('message:new', messageObject)
// Broadcast: To gig room + direct to receiver
// Data: {_id, gig, sender, receiver, message, messageType, amountOffer, timestamps}

// 2. NOTIFICATION EVENTS
socket.on('notification:new', (notificationObject) => {
  // New event-based alert received
  // Triggered by: Application decision, payment, system event
  // Data: {_id, recipient, type, title, message, relatedGig, isRead, timestamps}
})

socket.on('notification:updated', (notificationObject) => {
  // Notification status changed (read/unread)
  // Action: User clicks "Mark as read"
  // Data: Updated notification with isRead: true
})

// 3. GIG STATE EVENTS
socket.on('gig:updated', (gigObject) => {
  // Gig status changed
  // Triggers: Status update, worker assignment, payment
  // Data: Full updated gig object with new status
})

socket.on('payment:updated', ({ payment, gig }) => {
  // Payment status changed
  // Triggers: Order creation, payment verification
  // Data: {payment: Payment doc, gig: Updated Gig}
})

// 4. ERROR HANDLING
socket.on('socket:error', (error) => {
  // Authorization or access control error
  // Triggers: Unauthorized chat access, invalid gigId
  // Data: {message: "Unauthorized chat access"}
})

// 5. ROOM MANAGEMENT
socket.emit('leave:gig', ({ gigId }) => {
  // Leave gig room when exiting page
  socket.leave(`gig:${gigId}`)
})
```

---

## 🔗 Data Flow & Connections

### **Complete User Journey: From Browsing to Payment**

```
┌─────────────────────────────────────────────────────────────────┐
│             COMPLETE USER WORKFLOW                              │
└─────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────┐
  │ 1. USER REGISTRATION                                    │
  ├─────────────────────────────────────────────────────────┤
  │                                                         │
  │ Frontend: POST /api/users/register                     │
  │ Body: {name, email, password, role, phone, gender}    │
  │                                                         │
  │ ↓                                                       │
  │                                                         │
  │ Backend: userController.registerUser()                │
  │ • Hash password with bcryptjs                         │
  │ • Create User document                                │
  │ • Generate JWT token (30-day expiry)                  │
  │ • Return: {_id, name, email, token, role}            │
  │                                                         │
  │ ↓                                                       │
  │                                                         │
  │ Frontend: Store token in sessionStorage               │
  │           Update AuthContext (logged in)              │
  │                                                         │
  └─────────────────────────────────────────────────────────┘
                            │
  ┌─────────────────────────┴─────────────────────────────┐
  │                                                       │
  └─ If WORKER Role ────→ 2. BROWSE GIGS                 │
  │                                                       │
  ├─────────────────────────────────────────────────────┤
  │                                                     │
  │ Frontend: GET /api/gigs?category=...&budget=...   │
  │                                                     │
  │ ↓                                                   │
  │                                                     │
  │ Backend: gigController.getGigs()                  │
  │ • Query Gigs collection with filters              │
  │ • Populate client details                         │
  │ • Return: [gig1, gig2, gig3, ...]                │
  │                                                     │
  │ ↓                                                   │
  │                                                     │
  │ Frontend: Display GigList with cards              │
  │           User clicks on gig                       │
  │                                                     │
  └─────────────────────────────────────────────────────┘
                            │
  ┌─────────────────────────┴─────────────────────────────┐
  │  3. VIEW GIG DETAIL & APPLY                           │
  ├──────────────────────────────────────────────────────┤
  │                                                      │
  │ Frontend: GET /api/gigs/:gigId                      │
  │           GET /api/chat/:gigId                      │
  │                                                      │
  │ ↓                                                    │
  │                                                      │
  │ Backend: gigController.getGigById()                │
  │          chatController.getGigMessages()           │
  │ • Fetch gig details                                │
  │ • Load applications list                           │
  │ • Load chat messages (if authorized)               │
  │ • Return gig + messages                            │
  │                                                      │
  │ ↓                                                    │
  │                                                      │
  │ Frontend: Render GigDetail page                    │
  │           Socket: joinGigRoom(gigId)               │
  │           Listen for: message:new, gig:updated    │
  │                                                      │
  │ User fills application form:                        │
  │ • Experience                                        │
  │ • Skills                                            │
  │ • Proposed Price                                    │
  │                                                      │
  │ POST /api/applications/:gigId                      │
  │ Body: {proposedPrice, workerExperience, ...}      │
  │                                                      │
  │ ↓                                                    │
  │                                                      │
  │ Backend: applicationController.applyForGig()      │
  │ • Create Application document                      │
  │ • Link to Worker & Gig                             │
  │ • Return created application                       │
  │                                                      │
  │ ↓                                                    │
  │                                                      │
  │ Frontend: Show "Applied ✓" status                 │
  │           Application appears in Dashboard        │
  │                                                      │
  └──────────────────────────────────────────────────────┘
                            │
  ┌─────────────────────────┴──────────────────────────────┐
  │                                                        │
  └─ If CLIENT Role ────→ 4. CLIENT ACCEPTS WORKER        │
  │                                                        │
  ├────────────────────────────────────────────────────┤
  │                                                    │
  │ Frontend: Dashboard → View applications          │
  │           Click "Accept" on worker application   │
  │           Prompt: Enter negotiated amount        │
  │                                                    │
  │ ↓                                                  │
  │                                                    │
  │ PUT /api/applications/:appId/status              │
  │ Body: {status: 'accepted', finalAmount: 15000}  │
  │                                                    │
  │ ↓                                                  │
  │                                                    │
  │ Backend: applicationController.updateAppStatus() │
  │                                                    │
  │ PARALLEL OPERATIONS:                              │
  │                                                    │
  │ A) Reject other applications                      │
  │    await Application.updateMany({...rejected})   │
  │                                                    │
  │ B) Create system message (chat):                  │
  │    Message.create({                              │
  │      gig, sender: clientId,                       │
  │      receiver: workerId,                          │
  │      message: "You have been selected...",        │
  │      messageType: "system"                        │
  │    })                                              │
  │                                                    │
  │ C) Create notification:                           │
  │    await createNotification({                     │
  │      recipientId: workerId,                       │
  │      type: "selection",                           │
  │      title: "You have been selected",             │
  │      message: "[Full details]",                   │
  │      relatedGigId: gigId                          │
  │    })                                              │
  │                                                    │
  │ D) Update Gig document:                           │
  │    gig.worker = workerId                          │
  │    gig.status = "accepted"                        │
  │    gig.save()                                      │
  │                                                    │
  │ ↓                                                  │
  │                                                    │
  │ Socket Emissions (Real-time):                     │
  │ • emitToGig(gigId, "gig:updated", gig)           │
  │ • emitToUser(workerId, "notification:new", ...)  │
  │ • emitToGig(gigId, "message:new", ...)           │
  │                                                    │
  │ ↓                                                  │
  │                                                    │
  │ Frontend (Worker):                                 │
  │ • Dashboard notification appears                  │
  │ • Badge shows "+1 unread"                         │
  │ • GigDetail chat shows system message             │
  │ • Application status → "accepted"                 │
  │                                                    │
  │ Frontend (Client):                                 │
  │ • Gig status changes to "accepted"                │
  │ • Ready for payment                               │
  │                                                    │
  └────────────────────────────────────────────────────┘
                            │
  ┌─────────────────────────┴──────────────────────────────┐
  │  5. COMMUNICATION (Both parties can chat now)          │
  ├────────────────────────────────────────────────────┤
  │                                                    │
  │ Worker sends message:                             │
  │ POST /api/chat/:gigId                            │
  │ Body: {receiverId, message, messageType: 'text'} │
  │                                                    │
  │ Client sends price offer:                         │
  │ POST /api/chat/:gigId                            │
  │ Body: {receiverId, message, amountOffer: 12000}  │
  │                                                    │
  │ Backend: chatController.sendGigMessage()          │
  │ • Validate both in gig participants               │
  │ • Create Message document                         │
  │ • Socket emit: message:new to gig room           │
  │                                                    │
  │ Frontend: Real-time message appears              │
  │           in chat thread                          │
  │                                                    │
  └────────────────────────────────────────────────────┘
                            │
  ┌─────────────────────────┴──────────────────────────────┐
  │  6. PAYMENT PROCESSING                                 │
  ├────────────────────────────────────────────────────┤
  │                                                    │
  │ Client clicks "Pay Now" on GigDetail              │
  │                                                    │
  │ ↓ Step 1: Create Razorpay Order                   │
  │                                                    │
  │ POST /api/payments/create-order                   │
  │ Body: {gigId, workerId}                           │
  │                                                    │
  │ Backend: paymentController.createPaymentOrder()  │
  │ • Validate client owns gig                        │
  │ • Get amount from gig.budget                      │
  │ • Call Razorpay API:                              │
  │   razorpay.orders.create({                        │
  │     amount: 1500000,  // ₹15,000 in paise         │
  │     currency: 'INR',                              │
  │     receipt: unique_id                            │
  │   })                                               │
  │ • Store Payment doc: status = 'created'           │
  │ • Return: {order, keyId}                          │
  │                                                    │
  │ Frontend: Razorpay Checkout modal opens           │
  │           User chooses payment method:            │
  │           • Credit/Debit Card                     │
  │           • UPI                                   │
  │           • Net Banking                           │
  │           • Wallet                                │
  │                                                    │
  │ ↓ Step 2: Process Payment (Razorpay Server)       │
  │                                                    │
  │ Razorpay verifies with bank/PSP                   │
  │ Generates: paymentId & signature                  │
  │                                                    │
  │ ↓ Step 3: Verify Signature (Backend)              │
  │                                                    │
  │ POST /api/payments/verify                         │
  │ Body: {razorpayOrderId, paymentId, signature}    │
  │                                                    │
  │ Backend: paymentController.verifyRazorpayPayment()│
  │ • Regenerate signature locally:                   │
  │   hmac = crypto.createHmac('sha256', SECRET)      │
  │   .update(orderId|paymentId).digest('hex')        │
  │ • Compare: generated === received                 │
  │ • If match: Payment valid ✓                       │
  │ • If not: Payment fraud ✗                         │
  │                                                    │
  │ • Update Payment.status = 'paid'                  │
  │ • Update Gig.status = 'in-progress'              │
  │ • Update Gig.paymentStatus = 'paid'              │
  │                                                    │
  │ CREATE NOTIFICATIONS (both parties):              │
  │ • Worker: "Payment received: ₹15,000"             │
  │ • Client: "Payment completed"                     │
  │                                                    │
  │ SOCKET EMISSIONS:                                 │
  │ • emitToUser(worker, 'notification:new', ...)    │
  │ • emitToUser(client, 'gig:updated', ...)         │
  │ • emitToGig(gigId, 'payment:updated', ...)       │
  │                                                    │
  │ Frontend: Payment successful toast                │
  │           Gig status → "In Progress"              │
  │           Both see updated state                  │
  │                                                    │
  └────────────────────────────────────────────────────┘
                            │
  ┌─────────────────────────┴──────────────────────────────┐
  │  7. WORK EXECUTION                                     │
  ├────────────────────────────────────────────────────┤
  │                                                    │
  │ Worker: Click "Start Work" button                 │
  │ PUT /api/gigs/:gigId/start                        │
  │                                                    │
  │ Backend: gigController.startGigWork()             │
  │ • Set gig.workStartedAt = now                     │
  │                                                    │
  │ Frontend: Timer starts showing elapsed time       │
  │           "Work in progress..."                   │
  │                                                    │
  │ Worker completes work → Click "Stop Work"         │
  │ PUT /api/gigs/:gigId/stop                         │
  │                                                    │
  │ Backend: gigController.stopGigWork()              │
  │ • Calculate workEndedAt                           │
  │ • Compute totalWorkHours                          │
  │                                                    │
  │ ↓                                                  │
  │                                                    │
  │ Client: Click "Mark Complete"                     │
  │ PUT /api/gigs/:gigId/complete                     │
  │                                                    │
  │ Backend: gigController.completeGig()              │
  │ • Set gig.status = 'completed'                    │
  │ • Create notifications to both                    │
  │                                                    │
  │ ↓ Step 8: REVIEW & SETTLEMENT                     │
  │                                                    │
  │ Both can submit reviews:                          │
  │ POST /api/reviews/:gigId                          │
  │ Body: {rating: 5, comment: "Great work!"}        │
  │                                                    │
  │ Backend: reviewController.addReview()             │
  │ • Create Review document                          │
  │ • Can view on user profiles                       │
  │                                                    │
  │ Frontend: Both can see:                           │
  │ • Completed gig in Dashboard                      │
  │ • Review section with ratings                     │
  │ • Payment confirmation                            │
  │ • Invoice download button                         │
  │                                                    │
  │ Worker can:                                        │
  │ GET /api/gigs/:gigId/invoice                      │
  │ → Download JSON invoice with hours, amount, etc.  │
  │                                                    │
  └────────────────────────────────────────────────────┘

```

---

## 📊 Why MongoDB Over SQL

### **Detailed Comparison Table**

| Aspect | MongoDB | SQL (MySQL/PostgreSQL) | GigConnect Reason |
|--------|---------|----------------------|------------------|
| **Schema Type** | Document-based, flexible | Table-based, fixed schema | ✅ Skills array, varied gig metadata |
| **Query Speed** | Single collection query | Multiple JOINs | ✅ Faster for gig + apps + messages |
| **Scaling** | Automatic sharding | Complex replication setup | ✅ Future-proof for user growth |
| **Learning Curve** | JSON-like, intuitive | Complex SQL syntax | ✅ JavaScript-centric team |
| **Data Nesting** | Native arrays & objects | Requires normalization | ✅ Gigs with embedded applications |
| **ACID Transactions** | Multi-document transactions (4.0+) | Native ACID | ⚖️ Not critical for this use case |
| **Relationships** | References + embedding | Foreign keys | ✅ Both approaches supported |
| **Deployment** | MongoDB Atlas cloud | Managed services available | ✅ Easy cloud deployment |
| **Real-time** | Change streams + indexing | Polling or triggers | ✅ Socket.io + MongoDB scales |
| **Cost** | Free community edition | Free but more infrastructure | ✅ Lower TCO |

### **MongoDB vs SQL: Real Example in GigConnect**

**Storing a Gig with Applications:**

**MongoDB Approach (1 collection, nested docs):**
```javascript
db.gigs.insertOne({
  _id: ObjectId("..."),
  title: "Build React App",
  client: ObjectId("..."),  // Reference to User
  budget: 50000,
  skills: ["React", "Node.js"],  // Array (can grow)
  applications: [
    {
      _id: ObjectId("..."),
      worker: ObjectId("..."),
      proposedPrice: 45000,
      status: "pending"
    },
    {
      _id: ObjectId("..."),
      worker: ObjectId("..."),
      proposedPrice: 40000,
      status: "accepted"
    }
  ],
  messages: [ObjectId("..."), ObjectId("...")],  // References or embedded
  status: "in-progress",
  createdAt: ISODate("...")
})
```

**SQL Approach (6+ normalized tables):**
```sql
-- Table: gigs
CREATE TABLE gigs (
  id INT PRIMARY KEY,
  title VARCHAR(255),
  client_id INT FOREIGN KEY REFERENCES users(id),
  budget DECIMAL(10,2),
  status VARCHAR(50),
  created_at TIMESTAMP
);

-- Table: gig_skills (JOIN TABLE)
CREATE TABLE gig_skills (
  id INT PRIMARY KEY,
  gig_id INT FOREIGN KEY REFERENCES gigs(id),
  skill_name VARCHAR(100)
);

-- Table: applications
CREATE TABLE applications (
  id INT PRIMARY KEY,
  gig_id INT FOREIGN KEY REFERENCES gigs(id),
  worker_id INT FOREIGN KEY REFERENCES users(id),
  proposed_price DECIMAL(10,2),
  status VARCHAR(50),
  created_at TIMESTAMP
);

-- Table: messages
CREATE TABLE messages (
  id INT PRIMARY KEY,
  gig_id INT FOREIGN KEY REFERENCES gigs(id),
  sender_id INT FOREIGN KEY REFERENCES users(id),
  receiver_id INT FOREIGN KEY REFERENCES users(id),
  message TEXT,
  created_at TIMESTAMP
);

-- Fetching data requires JOINS:
SELECT g.*, 
       u.name as client_name,
       JSON_ARRAYAGG(gs.skill_name) as skills,
       (SELECT COUNT(*) FROM applications WHERE gig_id = g.id) as app_count
FROM gigs g
JOIN users u ON g.client_id = u.id
LEFT JOIN gig_skills gs ON g.id = gs.gig_id
WHERE g.id = 123
GROUP BY g.id;
```

**Winner for GigConnect:** ✅ **MongoDB**
- Fewer tables = simpler queries
- Flexible schema = easier feature addition
- Native array support = skills don't need junction table
- JSON response = direct serialization to REST API

---

## 🚀 Deployment & Setup

### **Environment Configuration**

Create `.env` file in `gig-platform-backend/`:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gigconnect

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

# Server
PORT=5000
NODE_ENV=development

# Demo only: let failed Razorpay TEST payments be marked paid
ALLOW_TEST_PAYMENT_BYPASS=false

# CORS
CLIENT_URL=http://localhost:5173
```

### **Installation & Running**

```bash
# Backend Setup
cd gig-platform-backend
npm install
npm start  # Production
npm run dev  # Development (with nodemon)

# Frontend Setup (new terminal)
cd gig-platform-frontend
npm install
npm run dev  # Development server (Vite)
npm run build  # Production build
```

### **Database Setup**

```bash
# 1. Create MongoDB Atlas Account
#    - Go to https://www.mongodb.com/cloud/atlas
#    - Create free cluster

# 2. Get Connection String
#    - Copy from Atlas dashboard
#    - Paste into .env MONGODB_URI

# 3. Mongoose auto-creates collections on first use
#    - No manual schema creation needed
```

### **Production Deployment**

**Backend (Heroku/Railway/Render):**
```bash
# Set environment variables
# Push code to Git
# Platform auto-deploys
```

**Frontend (Vercel/Netlify):**
```bash
npm run build
# Deploy dist/ folder
```

---

## 📈 Project Statistics

| Metric | Count |
|--------|-------|
| **MongoDB Collections** | 8 |
| **REST API Endpoints** | 47 (across 9 route modules) |
| **Socket.io Events** | 10+ |
| **Frontend Pages** | 8+ |
| **React Components** | 15+ |
| **Authentication Method** | JWT (30-day) |
| **Payment Gateway** | Razorpay |
| **Real-time Rooms** | user + gig based |
| **Total Lines of Code** | 5000+ |
| **Development Time** | 10 weeks (3 phases) |

---

## 🎓 Learning Outcomes

✅ Full-stack MERN development  
✅ Real-time WebSocket communication  
✅ Payment gateway integration (Razorpay)  
✅ JWT authentication & authorization  
✅ MongoDB schema design  
✅ RESTful API design patterns  
✅ React Context API state management  
✅ Socket.io room-based broadcasting  
✅ HMAC signature verification  
✅ Production deployment practices  

---

## 📞 Support & Contact

**Team:** Harshit Suyal, Manas Joshi, Aishwary Bisht, Saumya Pratap Singh  
**Project:** GigConnect - Full-Stack Gig Marketplace  
**Status:** Phase 3 Complete | Production Ready  
**Last Updated:** September 2026

---

**© 2026 GigConnect Team. Released under the MIT License.**
