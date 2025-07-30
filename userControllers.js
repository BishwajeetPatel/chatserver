// userControllers.js - User Authentication Controllers
import User from "./User.js"; // FIXED: Changed from "../models/User.js"
import jwt from "jsonwebtoken";
import { sendMail } from "./sendMail.js"; // FIXED: Changed from "../middlewares/sendMail.js"

console.log('👤 User Controllers Loading...');

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Login User (Send OTP)
export const loginUser = async (req, res) => {
  try {
    console.log("👤 LOGIN REQUEST - Starting...");
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    console.log(`👤 Processing login for: ${email}`);

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`👤 Creating new user: ${email}`);
      user = await User.create({
        email: email.toLowerCase()
      });
      console.log(`✅ New user created with ID: ${user._id}`);
    } else {
      console.log(`✅ Existing user found with ID: ${user._id}`);
    }

    // Generate OTP
    const otp = generateOTP();
    console.log(`🔢 Generated OTP: ${otp} for ${email}`);

    // Store OTP with expiration (10 minutes)
    otpStore.set(email.toLowerCase(), {
      otp: otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      userId: user._id
    });

    try {
      // Send OTP via email
      console.log(`📧 Sending OTP to: ${email}`);
      const emailResult = await sendMail(email, otp);
      
      console.log(`✅ OTP sent successfully to ${email}`);
      console.log(`📨 Email result:`, emailResult);

      res.status(200).json({
        message: "OTP sent to your email successfully",
        email: email,
        otpSent: true,
        expiresIn: "10 minutes",
        debug: {
          userId: user._id,
          isNewUser: !user.createdAt || (Date.now() - user.createdAt.getTime()) < 5000,
          emailSentFrom: emailResult.sentFrom
        }
      });

    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError.message);
      
      // Clear stored OTP if email fails
      otpStore.delete(email.toLowerCase());
      
      res.status(500).json({
        message: "Failed to send OTP email",
        error: emailError.message,
        suggestion: "Please check your email address and try again"
      });
    }

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
};

// Verify OTP and Login
export const verifyUser = async (req, res) => {
  try {
    console.log("👤 VERIFY OTP REQUEST - Starting...");
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required"
      });
    }

    console.log(`👤 Verifying OTP for: ${email}`);
    console.log(`🔢 Provided OTP: ${otp}`);

    // Check if OTP exists and is valid
    const storedData = otpStore.get(email.toLowerCase());
    
    if (!storedData) {
      console.log(`❌ No OTP found for: ${email}`);
      return res.status(400).json({
        message: "OTP not found. Please request a new OTP.",
        suggestion: "Click 'Send OTP' to get a new verification code"
      });
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expires) {
      console.log(`❌ OTP expired for: ${email}`);
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
        suggestion: "Click 'Send OTP' to get a new verification code"
      });
    }

    // Verify OTP
    if (storedData.otp !== otp.toString()) {
      console.log(`❌ Invalid OTP for: ${email}`);
      console.log(`❌ Expected: ${storedData.otp}, Got: ${otp}`);
      return res.status(400).json({
        message: "Invalid OTP. Please check and try again.",
        suggestion: "Make sure you entered the 6-digit code correctly"
      });
    }

    console.log(`✅ OTP verified successfully for: ${email}`);

    // Find user
    const user = await User.findById(storedData.userId);
    
    if (!user) {
      console.log(`❌ User not found for ID: ${storedData.userId}`);
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({
        message: "User not found. Please try logging in again."
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);
    console.log(`🎫 JWT token generated for user: ${user._id}`);

    // Clear OTP from store
    otpStore.delete(email.toLowerCase());
    console.log(`🧹 OTP cleared for: ${email}`);

    // Import and create default characters for new users
    try {
      const { createDefaultCharacters } = await import("./characterControllers.js");
      const createdCount = await createDefaultCharacters(user._id);
      console.log(`🎭 Created ${createdCount} default characters for user`);
    } catch (characterError) {
      console.log(`⚠️ Could not create default characters:`, characterError.message);
      // Don't fail login if character creation fails
    }

    res.status(200).json({
      message: "Login successful",
      success: true,
      token: token,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt
      },
      expiresIn: "30 days"
    });

  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({
      message: "OTP verification failed",
      error: error.message
    });
  }
};

// Get User Profile
export const getMyProfile = async (req, res) => {
  try {
    console.log(`👤 GET PROFILE REQUEST for user: ${req.user._id}`);
    
    const user = req.user;
    
    res.status(200).json({
      message: "Profile retrieved successfully",
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error("❌ Get profile error:", error);
    res.status(500).json({
      message: "Failed to retrieve profile",
      error: error.message
    });
  }
};

// Cleanup expired OTPs (run periodically)
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expires) {
      otpStore.delete(email);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} expired OTPs`);
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

console.log('✅ User Controllers Loaded Successfully');
