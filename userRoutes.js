// FIXED userRoutes.js - Corrected Import Paths
import express from "express";
import { loginUser, verifyUser, getMyProfile } from "./userControllers.js"; // FIXED: Changed from "../controllers/userControllers.js"
import isAuth from "./isAuth.js"; // FIXED: Changed from "../middlewares/isAuth.js"

console.log("👤 USER ROUTES MODULE LOADING...");

const router = express.Router();

// Debug middleware to track route hits
router.use((req, res, next) => {
  console.log(`👤 USER ROUTE HIT: ${req.method} ${req.originalUrl}`);
  console.log(`👤 User: ${req.user ? req.user._id : 'Not authenticated'}`);
  next();
});

// Test route (no auth required for debugging)
router.get("/test", (req, res) => {
  console.log("👤 User test route hit");
  res.json({
    message: "👤 User routes are working!",
    timestamp: new Date().toISOString(),
    routes: [
      "POST /api/user/login - Send OTP to email",
      "POST /api/user/verify - Verify OTP and login", 
      "GET /api/user/me - Get user profile (requires auth)"
    ],
    debug: {
      authenticated: !!req.user,
      userId: req.user?._id
    }
  });
});

// Public routes - No authentication required
router.post("/login", (req, res) => {
  console.log("👤 LOGIN route");
  console.log("👤 Request body:", req.body);
  loginUser(req, res);
});

router.post("/verify", (req, res) => {
  console.log("👤 VERIFY route");
  console.log("👤 Request body:", req.body);
  verifyUser(req, res);
});

// Protected routes - Authentication required
router.get("/me", isAuth, (req, res) => {
  console.log("👤 GET PROFILE route");
  getMyProfile(req, res);
});

console.log("✅ USER ROUTES MODULE LOADED SUCCESSFULLY");

export default router;
