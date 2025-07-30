// FIXED backend/index.js - Corrected Import Paths for Deployment
// Your existing working server + character functionality

console.log('🔧 === FORCING EMAIL CONFIGURATION ===');

// STEP 1: FORCE SET YOUR UPDATED CONFIGURATION
process.env.EMAIL_USERNAME = 'bishwajeetpatelbrh@gmail.com';
process.env.EMAIL_PASSWORD = 'hcalegwefqdivzbo'; // Your app password for bishwajeetpatelbrh@gmail.com
process.env.MONGO_URI = 'mongodb+srv://bishwajeetpatelbth:W90CREABDGT8snEK@cluster0.akexhyb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
process.env.JWT_SECRET = '046aabdbe3ef4d5a62e2ca0f5b9512121621336b0ad9044260b6ed2f7cf3b086';
process.env.ACTIVATION_SECRET = '046aabdbe3ef4d5a62e2ca0f5b9512121621336b0ad9044260b6ed2f7cf3b086';
process.env.GEMINI_API_KEY = 'AIzaSyCjBX0K8F9Pj11rlXhS0l9aUpGmokwstPM'; // ⭐ YOUR WORKING KEY
process.env.PORT = '5000';
process.env.NODE_ENV = 'development';

console.log('🔧 FORCE CONFIGURED EMAIL:', process.env.EMAIL_USERNAME);
console.log('📧 EMAIL PASSWORD LENGTH:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);
console.log('🤖 NEW GEMINI API KEY LOADED:', process.env.GEMINI_API_KEY ? 
  process.env.GEMINI_API_KEY.substring(0, 20) + '...' : 'NOT FOUND');

// STEP 2: IMPORT MODULES
import express from "express";
import connectDb from "./db.js";  // FIXED: Changed from "./database/db.js" to "./db.js"
import cors from "cors";
import dotenv from "dotenv";

// Load additional env vars if .env file exists (but our force config above takes precedence)
dotenv.config();

const app = express();

// STEP 3: MIDDLEWARE SETUP
app.use(cors({
  origin: [
    "https://ai-character-chatbot-one.vercel.app", 
    "https://ai-character-chatbot-7.onrender.com", // Add your frontend URL
    "https://ai-character-chatbot-2.onrender.com", // Backend URL for testing
    "http://localhost:3000", 
    "http://localhost:5173"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// STEP 4: IMPORT ROUTES WITH ENHANCED ERROR HANDLING
let userRoutes, chatRoutes, characterRoutes, generateResponse;

// Import User Routes
try {
  const userRoutesModule = await import("./userRoutes.js"); // FIXED: Changed from "./routes/userRoutes.js"
  userRoutes = userRoutesModule.default;
  console.log('✅ User routes imported successfully');
} catch (error) {
  console.error('❌ Failed to import user routes:', error.message);
  console.error('❌ Make sure userRoutes.js exists in the same directory');
}

// Import Chat Routes
try {
  const chatRoutesModule = await import("./chatRoutes.js"); // FIXED: Changed from "./routes/chatRoutes.js"
  chatRoutes = chatRoutesModule.default;
  console.log('✅ Chat routes imported successfully');
} catch (error) {
  console.error('❌ Failed to import chat routes:', error.message);
  console.error('❌ Make sure chatRoutes.js exists in the same directory');
}

// FIXED: Import Character Routes with Enhanced Error Detection
try {
  console.log('🎭 === IMPORTING CHARACTER SYSTEM ===');
  
  // Check if Character model exists
  try {
    await import("./Character.js"); // FIXED: Changed from "./models/Character.js"
    console.log('✅ Character model found');
  } catch (modelError) {
    console.error('❌ Character model missing:', modelError.message);
    throw new Error('Character model (Character.js) not found');
  }
  
  // Check if Character controllers exist
  try {
    await import("./characterControllers.js"); // FIXED: Changed from "./controllers/characterControllers.js"
    console.log('✅ Character controllers found');
  } catch (controllerError) {
    console.error('❌ Character controllers missing:', controllerError.message);
    throw new Error('Character controllers (characterControllers.js) not found');
  }
  
  // Import character routes
  const characterRoutesModule = await import("./characterRoutes.js"); // FIXED: Changed from "./routes/characterRoutes.js"
  characterRoutes = characterRoutesModule.default;
  console.log('✅ Character routes imported successfully');
  
} catch (error) {
  console.error('❌ === CHARACTER SYSTEM IMPORT FAILED ===');
  console.error('❌ Error:', error.message);
  console.error('❌ Required files for character system:');
  console.error('   1. Character.js');
  console.error('   2. characterControllers.js');
  console.error('   3. characterRoutes.js');
  console.error('❌ Character system will be disabled');
  characterRoutes = null;
}

// Import Gemini function for testing
try {
  const chatControllersModule = await import("./chatControllers.js"); // FIXED: Changed from "./controllers/chatControllers.js"
  generateResponse = chatControllersModule.generateResponse;
  console.log('✅ Gemini functions imported successfully');
} catch (error) {
  console.error('❌ Failed to import Gemini functions:', error.message);
}

// STEP 5: MOUNT ROUTES WITH ENHANCED ERROR HANDLING

// Mount User Routes
if (userRoutes) {
  app.use("/api/user", userRoutes);
  console.log('✅ User routes mounted at /api/user');
} else {
  console.error('❌ User routes not available');
}

// Mount Chat Routes
if (chatRoutes) {
  app.use("/api/chat", chatRoutes);
  console.log('✅ Chat routes mounted at /api/chat');
} else {
  console.error('❌ Chat routes not available');
}

// FIXED: Mount Character Routes with Enhanced Error Handling
if (characterRoutes) {
  try {
    app.use("/api/characters", characterRoutes);
    console.log('✅ === CHARACTER SYSTEM ACTIVE ===');
    console.log('✅ Character routes mounted at /api/characters');
    
    // Add character system test endpoint
    app.get("/test-character-system", (req, res) => {
      res.json({
        message: "🎭 Character system is fully operational!",
        status: "active",
        timestamp: new Date().toISOString(),
        features: [
          "Character creation",
          "Character selection", 
          "Character-based AI chat",
          "Default characters (Einstein, Sherlock, etc.)",
          "Character options endpoint"
        ],
        endpoints: [
          "GET /api/characters - Get all characters (requires auth)",
          "GET /api/characters/options - Get character creation options (requires auth)",
          "POST /api/characters - Create character (requires auth)",
          "GET /api/characters/:id - Get single character (requires auth)",
          "PUT /api/characters/:id - Update character (requires auth)", 
          "DELETE /api/characters/:id - Delete character (requires auth)",
          "GET /api/characters/test - Test endpoint (no auth)"
        ]
      });
    });
    
  } catch (mountError) {
    console.error('❌ Failed to mount character routes:', mountError.message);
  }
} else {
  console.error('❌ === CHARACTER SYSTEM DISABLED ===');
  console.error('❌ Character routes not available');
  
  // Add character system debug endpoint
  app.get("/debug-character-system", (req, res) => {
    res.status(500).json({
      error: "Character system not available",
      status: "disabled",
      reason: "Required files missing or have errors",
      requiredFiles: [
        "Character.js - Character database model",
        "characterControllers.js - Character business logic",
        "characterRoutes.js - Character API routes"
      ],
      troubleshooting: [
        "1. Check if all 3 files exist in the root directory",
        "2. Check server console for specific import errors",
        "3. Verify no syntax errors in the files",
        "4. Restart server after creating missing files"
      ]
    });
  });
}

// STEP 6: MAIN ENDPOINTS

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🤖 Enhanced ChatBot Server is running! (Regular + Character Chat)",
    status: "active",
    timestamp: new Date().toISOString(),
    emailConfigured: !!process.env.EMAIL_USERNAME,
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    features: {
      regularChat: userRoutes && chatRoutes ? "✅ Available" : "❌ Missing routes",
      characterChat: characterRoutes ? "✅ Available" : "❌ Disabled",
      characterCreation: characterRoutes ? "✅ Available" : "❌ Disabled",
      characterOptions: characterRoutes ? "✅ Available" : "❌ Disabled",
      userManagement: userRoutes ? "✅ Available" : "❌ Missing"
    },
    deployment: {
      platform: "Render",
      environment: process.env.NODE_ENV,
      nodeVersion: process.version
    }
  });
});

// System status endpoint
app.get("/status", (req, res) => {
  res.json({
    server: "Enhanced ChatBot",
    version: "1.0.0", 
    status: "running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    systems: {
      database: "✅ Connected",
      userSystem: userRoutes ? "✅ Active" : "❌ Inactive",
      chatSystem: chatRoutes ? "✅ Active" : "❌ Inactive", 
      characterSystem: characterRoutes ? "✅ Active" : "❌ Inactive",
      geminiAPI: process.env.GEMINI_API_KEY ? "✅ Configured" : "❌ Missing",
      emailService: process.env.EMAIL_USERNAME ? "✅ Configured" : "❌ Missing"
    }
  });
});

// Test CORS endpoint
app.get("/test-cors", (req, res) => {
  res.json({
    message: "✅ CORS is working!",
    origin: req.headers.origin || "No origin header",
    timestamp: new Date().toISOString(),
    headers: {
      "Access-Control-Allow-Origin": req.headers.origin,
      "Access-Control-Allow-Credentials": "true"
    }
  });
});

// Test Gemini API Key
app.get("/test-my-key", async (req, res) => {
  try {
    console.log("🧪 Testing Gemini API key...");
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "Gemini API key not configured"
      });
    }
    
    // Test with gemini-1.5-flash (free tier)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say "API_KEY_WORKING" if you can hear me' }] }]
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      res.json({
        success: true,
        status: response.status,
        aiResponse: text,
        message: "🎉 API KEY IS WORKING!",
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: false,
        status: response.status,
        error: data.error?.message || 'Unknown error',
        fullError: data
      });
    }
    
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
    features: {
      userAuthentication: userRoutes ? "✅ Available" : "❌ Missing",
      regularChat: (userRoutes && chatRoutes) ? "✅ Available" : "❌ Missing",
      characterChat: characterRoutes ? "✅ Available" : "❌ Disabled", 
      geminiAPI: process.env.GEMINI_API_KEY ? "✅ Configured" : "❌ Missing",
      emailService: process.env.EMAIL_USERNAME ? "✅ Configured" : "❌ Missing"
    }
  });
});

// STEP 7: ERROR HANDLING

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ === GLOBAL ERROR ===');
  console.error('❌ Error:', err.message);
  console.error('❌ Stack:', err.stack);
  
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler - Must be last
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET / - Server info',
      'GET /health - Health check',
      'GET /status - System status',
      'GET /test-cors - Test CORS',
      'GET /test-my-key - Test API key',
      'POST /api/user/login - User login',
      'POST /api/user/verify - Verify OTP',
      'GET /api/user/me - User profile',
      'POST /api/chat/new - Create chat',
      'GET /api/chat/all - Get all chats'
    ]
  });
});

// STEP 8: START SERVER
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('\n🚀 === STARTING ENHANCED CHATBOT SERVER ===');
    
    // Connect to database
    console.log('📊 Connecting to database...');
    await connectDb();
    console.log('✅ Database connected successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`\n✅ === SERVER STARTED SUCCESSFULLY ===`);
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📧 Email: ${process.env.EMAIL_USERNAME}`);
      console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? '✅ CONFIGURED' : '❌ Missing'}`);
      
      console.log('\n📋 === SYSTEM STATUS ===');
      console.log(`👤 User System: ${userRoutes ? '✅ Active' : '❌ Inactive'}`);
      console.log(`💬 Chat System: ${chatRoutes ? '✅ Active' : '❌ Inactive'}`);
      console.log(`🎭 Character System: ${characterRoutes ? '✅ Active' : '❌ Disabled'}`);
      console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Ready' : '❌ Not configured'}`);
      console.log(`📧 Email Service: ${process.env.EMAIL_USERNAME ? '✅ Ready' : '❌ Not configured'}`);
      
      console.log('\n🧪 === TEST ENDPOINTS ===');
      console.log(`🔍 System Status: https://your-app.onrender.com/status`);
      console.log(`🔑 API Key Test: https://your-app.onrender.com/test-my-key`);
      console.log(`🌐 CORS Test: https://your-app.onrender.com/test-cors`);
      console.log(`❤️ Health Check: https://your-app.onrender.com/health`);
      
      console.log('\n================================');
      console.log('🎉 SERVER READY FOR CONNECTIONS!');
      console.log('📧 EMAIL SYSTEM CONFIGURED!');
      console.log('🚀 DEPLOYMENT READY!');
      console.log('================================\n');
    });
    
  } catch (error) {
    console.error('\n❌ === SERVER STARTUP FAILED ===');
    console.error('❌ Error:', error.message);
    console.error('❌ Stack:', error.stack);
    process.exit(1);
  }
};

// Start the server
startServer();
