// FIXED chatRoutes.js - Corrected Import Paths
import express from "express";
import isAuth from "./isAuth.js"; // FIXED: Changed from "../middlewares/isAuth.js"
import {
  createChat,
  getAllChats,
  addConversation,
  getConversation,
  deleteChat
} from "./chatControllers.js"; // FIXED: Changed from "../controllers/chatControllers.js"

console.log("💬 CHAT ROUTES MODULE LOADING...");

const router = express.Router();

// Debug middleware to track route hits
router.use((req, res, next) => {
  console.log(`💬 CHAT ROUTE HIT: ${req.method} ${req.originalUrl}`);
  console.log(`💬 User: ${req.user ? req.user._id : 'Not authenticated'}`);
  next();
});

// Test endpoint
router.get("/test", (req, res) => {
  console.log("💬 Chat test route hit");
  res.json({
    message: "💬 Chat routes are working!",
    timestamp: new Date().toISOString(),
    status: "active",
    routes: [
      "POST /api/chat/new - Create new chat",
      "GET /api/chat/all - Get all chats for user",
      "GET /api/chat/:id - Get conversations for specific chat",
      "POST /api/chat/:id - Add conversation to chat (send message)",
      "DELETE /api/chat/:id - Delete chat"
    ],
    debug: {
      authenticated: !!req.user,
      userId: req.user?._id
    }
  });
});

// All chat routes require authentication
router.use(isAuth);

// Create new chat
router.post("/new", (req, res) => {
  console.log("💬 CREATE CHAT route");
  console.log("💬 Request body:", req.body);
  createChat(req, res);
});

// Get all chats for user
router.get("/all", (req, res) => {
  console.log("💬 GET ALL CHATS route");
  getAllChats(req, res);
});

// Get conversations for a specific chat
router.get("/:id", (req, res) => {
  console.log(`💬 GET CONVERSATIONS route: ${req.params.id}`);
  getConversation(req, res);
});

// Add conversation to chat (send message)
router.post("/:id", (req, res) => {
  console.log(`💬 ADD CONVERSATION route: ${req.params.id}`);
  console.log("💬 Request body:", req.body);
  addConversation(req, res);
});

// Delete chat
router.delete("/:id", (req, res) => {
  console.log(`💬 DELETE CHAT route: ${req.params.id}`);
  deleteChat(req, res);
});

console.log("✅ CHAT ROUTES MODULE LOADED SUCCESSFULLY");

export default router;
