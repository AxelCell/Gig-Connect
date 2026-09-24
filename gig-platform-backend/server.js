import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import userRoutes from "./routes/userRoutes.js";
import gigRoutes from "./routes/gigRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { setSocketIO } from "./utils/socket.js";
import { canAccessGigChat } from "./utils/chatAccess.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("Error: JWT_SECRET is not set. Add it to gig-platform-backend/.env");
  process.exit(1);
}

// CLIENT_URL may be a comma-separated list of allowed frontend origins.
// When it is not set, any origin is allowed (handy for local development).
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOptions = {
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true,
};

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: corsOptions });

setSocketIO(io);

io.use(async (socket, next) => {
  try {
    const authHeader = socket.handshake.auth?.token || socket.handshake.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return next(new Error("User not found or deactivated"));
    }

    socket.user = user;
    return next();
  } catch (error) {
    return next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.user._id.toString();
  socket.join(`user:${userId}`);

  socket.on("join:gig", async ({ gigId }) => {
    if (!gigId) return;

    try {
      const access = await canAccessGigChat(gigId, userId, socket.user.role);
      if (!access.ok) {
        socket.emit("socket:error", { message: access.message });
        return;
      }

      socket.join(`gig:${gigId}`);
      socket.emit("gig:joined", { gigId });
    } catch (error) {
      socket.emit("socket:error", { message: error.message });
    }
  });

  socket.on("leave:gig", ({ gigId }) => {
    if (gigId) {
      socket.leave(`gig:${gigId}`);
    }
  });
});

// Security headers (X-Content-Type-Options, HSTS, X-Frame-Options, ...).
// The API is called from a different origin, so allow cross-origin reads of its responses.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

app.use("/api/users", userRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("GigConnect API is running");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  // Malformed JSON bodies are a client error, not a server crash
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON in request body" });
  }
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();