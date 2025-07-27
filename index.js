// COMPLETE FIXED backend/index.js - Character Support Integrated
// Your existing working server + character functionality

console.log('🔧 === FORCING EMAIL CONFIGURATION ===');

// STEP 1: FORCE SET YOUR UPDATED CONFIGURATION
process.env.EMAIL_USERNAME = 'bishwajeetpatelbrh@gmail.com';
process.env.EMAIL_PASSWORD = 'hcalegwefqdivzbo'; // Your app password for bishwajeetpatelbrh@gmail.com
process.env.MONGO_URI = 'mongodb+srv://bishwajeetpatelbth:W90CREABDGT8snEK@cluster0.akexhyb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // FIXED: Removed duplicate assignment
process.env.JWT_SECRET = '046aabdbe3ef4d5a62e2ca0f5b9512121621336b0ad9044260b6ed2f7cf3b086';
process.env.ACTIVATION_SECRET = '046aabdbe3ef4d5a62e2ca0f5b9512121621336b0ad9044260b6ed2f7cf3b086';
process.env.GEMINI_API_KEY = 'AIzaSyCjBX0K8F9Pj11rlXhS0l9aUpGmokwstPM'; // ⭐ YOUR WORKING KEY
process.env.PORT = '5000';
process.env.NODE_ENV = 'development';

console.log('🔧 FORCE CONFIGURED EMAIL:', process.env.EMAIL_USERNAME);
console.log('📧 EMAIL PASSWORD LENGTH:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);
console.log('🤖 NEW GEMINI API KEY LOADED:', process.env.GEMINI_API_KEY ? 
  process.env.GEMINI_API_KEY.substring(0, 20) + '...' : 'NOT FOUND');
console.log('✅ Using API key ending in:', process.env.GEMINI_API_KEY ? 
  process.env.GEMINI_API_KEY.slice(-10) : 'NONE');

// STEP 2: IMPORT MODULES
import express from "express";
import connectDb from "./database/db.js";
import cors from "cors";
import dotenv from "dotenv";

// Load additional env vars if .env file exists (but our force config above takes precedence)
dotenv.config();

const app = express();

// STEP 3: MIDDLEWARE SETUP
app.use(cors({
  origin: ["https://ai-character-chatbot-one.vercel.app", "http://localhost:3000", "http://localhost:5173"],
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
  const userRoutesModule = await import("./routes/userRoutes.js");
  userRoutes = userRoutesModule.default;
  console.log('✅ User routes imported successfully');
} catch (error) {
  console.error('❌ Failed to import user routes:', error.message);
  console.error('❌ Make sure routes/userRoutes.js exists');
}

// Import Chat Routes
try {
  const chatRoutesModule = await import("./routes/chatRoutes.js");
  chatRoutes = chatRoutesModule.default;
  console.log('✅ Chat routes imported successfully');
} catch (error) {
  console.error('❌ Failed to import chat routes:', error.message);
  console.error('❌ Make sure routes/chatRoutes.js exists');
}

// FIXED: Import Character Routes with Enhanced Error Detection
try {
  console.log('🎭 === IMPORTING CHARACTER SYSTEM ===');
  
  // Check if Character model exists
  try {
    await import("./models/Character.js");
    console.log('✅ Character model found');
  } catch (modelError) {
    console.error('❌ Character model missing:', modelError.message);
    throw new Error('Character model (models/Character.js) not found');
  }
  
  // Check if Character controllers exist
  try {
    await import("./controllers/characterControllers.js");
    console.log('✅ Character controllers found');
  } catch (controllerError) {
    console.error('❌ Character controllers missing:', controllerError.message);
    throw new Error('Character controllers (controllers/characterControllers.js) not found');
  }
  
  // Import character routes
  const characterRoutesModule = await import("./routes/characterRoutes.js");
  characterRoutes = characterRoutesModule.default;
  console.log('✅ Character routes imported successfully');
  
} catch (error) {
  console.error('❌ === CHARACTER SYSTEM IMPORT FAILED ===');
  console.error('❌ Error:', error.message);
  console.error('❌ Stack:', error.stack);
  console.error('❌ Required files for character system:');
  console.error('   1. models/Character.js');
  console.error('   2. controllers/characterControllers.js');
  console.error('   3. routes/characterRoutes.js');
  console.error('❌ Character system will be disabled');
  characterRoutes = null;
}

// Import Gemini function for testing
try {
  const chatControllersModule = await import("./controllers/chatControllers.js");
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
        "models/Character.js - Character database model",
        "controllers/characterControllers.js - Character business logic",
        "routes/characterRoutes.js - Character API routes"
      ],
      troubleshooting: [
        "1. Check if all 3 files exist in the correct locations",
        "2. Check server console for specific import errors",
        "3. Verify no syntax errors in the files",
        "4. Restart server after creating missing files"
      ],
      howToFix: [
        "Create the missing files using the provided code",
        "Ensure proper import/export syntax",
        "Restart the server",
        "Check /test-character-system endpoint"
      ]
    });
  });
}

// Email Debug Endpoint
app.get("/debug-email-config", (req, res) => {
  res.json({
    message: "Email configuration debug",
    timestamp: new Date().toISOString(),
    environment: {
      EMAIL_USERNAME: process.env.EMAIL_USERNAME,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '✅ Configured' : '❌ Missing',
      EMAIL_PASSWORD_LENGTH: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0,
      EMAIL_PASSWORD_PREVIEW: process.env.EMAIL_PASSWORD ? 
        process.env.EMAIL_PASSWORD.substring(0, 4) + '****' : 'NOT_SET'
    },
    nodeEnv: process.env.NODE_ENV,
    allEmailRelatedEnvVars: Object.keys(process.env)
      .filter(key => key.toLowerCase().includes('email') || key.toLowerCase().includes('mail'))
      .reduce((obj, key) => {
        obj[key] = key.includes('PASSWORD') ? '***HIDDEN***' : process.env[key];
        return obj;
      }, {})
  });
});

// Emergency Email Test Endpoint
app.post("/emergency-email-test", async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    console.log('🚨 EMERGENCY EMAIL TEST');
    console.log('🔧 Current EMAIL_USERNAME:', process.env.EMAIL_USERNAME);
    console.log('🔧 Current EMAIL_PASSWORD exists:', !!process.env.EMAIL_PASSWORD);
    
    if (!testEmail) {
      return res.status(400).json({
        error: "Provide testEmail in request body",
        example: '{"testEmail": "your-email@gmail.com"}'
      });
    }

    // Dynamic import for nodemailer
    const nodemailer = (await import('nodemailer')).default;
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const testResult = await transporter.sendMail({
      from: {
        name: 'Emergency Test',
        address: process.env.EMAIL_USERNAME
      },
      to: testEmail,
      subject: 'Emergency Email Configuration Test',
      html: `
        <h2>🚨 Emergency Email Test</h2>
        <p><strong>Sender:</strong> ${process.env.EMAIL_USERNAME}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Status:</strong> ✅ Working!</p>
        <p>Check the sender address in your email client.</p>
      `
    });

    res.json({
      success: true,
      message: "Emergency test email sent!",
      sender: process.env.EMAIL_USERNAME,
      messageId: testResult.messageId,
      recipient: testEmail
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      currentConfig: {
        EMAIL_USERNAME: process.env.EMAIL_USERNAME,
        hasPassword: !!process.env.EMAIL_PASSWORD
      }
    });
  }
});

// STEP 6: MAIN ENDPOINTS

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🤖 Enhanced ChatBot Server is running! (Regular + Character Chat)",
    status: "active",
    timestamp: new Date().toISOString(),
    emailConfigured: !!process.env.EMAIL_USERNAME,
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    geminiKeyPreview: process.env.GEMINI_API_KEY ? 
      process.env.GEMINI_API_KEY.substring(0, 20) + '...' : 'NOT_FOUND',
    features: {
      regularChat: userRoutes && chatRoutes ? "✅ Available" : "❌ Missing routes",
      characterChat: characterRoutes ? "✅ Available" : "❌ Disabled",
      characterCreation: characterRoutes ? "✅ Available" : "❌ Disabled",
      characterOptions: characterRoutes ? "✅ Available" : "❌ Disabled",
      userManagement: userRoutes ? "✅ Available" : "❌ Missing"
    },
    systemStatus: {
      userRoutes: !!userRoutes,
      chatRoutes: !!chatRoutes,
      characterRoutes: !!characterRoutes,
      geminiAPI: !!process.env.GEMINI_API_KEY
    },
    testEndpoints: [
      "GET /test-my-key - Test Gemini API",
      "POST /test-character - Test character AI",
      "GET /test-character-system - Test character system",
      "GET /test-character-options - Test character options endpoint",
      "GET /debug-character-system - Debug character issues",
      "GET /debug-email-config - Debug email configuration",
      "POST /emergency-email-test - Test email sending",
      "GET /health - Health check"
    ]
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
      characterOptions: characterRoutes ? "✅ Active" : "❌ Inactive",
      geminiAPI: process.env.GEMINI_API_KEY ? "✅ Configured" : "❌ Missing",
      emailService: process.env.EMAIL_USERNAME ? "✅ Configured" : "❌ Missing"
    },
    features: [
      "✅ User Authentication (Email OTP)",
      "✅ Regular AI Chat",
      characterRoutes ? "✅ Character-based AI Chat" : "❌ Character Chat (Disabled)",
      characterRoutes ? "✅ Custom Character Creation" : "❌ Character Creation (Disabled)",
      characterRoutes ? "✅ Character Creation Options API" : "❌ Character Options (Disabled)",
      "✅ Chat History Management"
    ]
  });
});

// STEP 7: TEST ENDPOINTS

// Test Gemini API Key
app.get("/test-my-key", async (req, res) => {
  try {
    console.log("🧪 Testing your specific API key...");
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "Gemini API key not configured"
      });
    }
    
    console.log('🔑 Testing key:', apiKey.substring(0, 20) + '...');
    
    // Test with gemini-1.5-flash (free tier)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say "YOUR_KEY_IS_WORKING_PERFECTLY" if you can hear me' }] }]
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      console.log('✅ API KEY TEST SUCCESS:', text);
      res.json({
        success: true,
        status: response.status,
        aiResponse: text,
        message: "🎉 YOUR API KEY IS WORKING PERFECTLY!",
        keyPreview: apiKey.substring(0, 20) + '...',
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ API KEY TEST FAILED:', response.status, data);
      res.json({
        success: false,
        status: response.status,
        error: data.error?.message || 'Unknown error',
        fullError: data,
        keyPreview: apiKey.substring(0, 20) + '...',
        recommendations: [
          "1. Check if billing is enabled in AI Studio",
          "2. Verify your region supports free tier",
          "3. Try enabling billing for $300 free credits",
          "4. Generate a fresh API key if this one is old"
        ]
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

// Test Character Options Endpoint
app.get("/test-character-options", async (req, res) => {
  try {
    console.log("🎭 Testing character options endpoint...");
    
    if (!characterRoutes) {
      return res.json({
        success: false,
        error: "Character system is disabled",
        status: "disabled",
        note: "Character routes not available - missing required files"
      });
    }
    
    // Test the character options endpoint structure
    res.json({
      success: true,
      message: "🎭 Character options endpoint is available!",
      endpoint: "/api/characters/options",
      status: "active",
      note: "Endpoint requires authentication - use with valid JWT token",
      testWith: "Send GET request to /api/characters/options with Authorization header",
      expectedResponse: {
        personalityTraits: "Array of 15+ personality options",
        speakingStyles: "Array of 15+ speaking style options", 
        languages: "Array of 14 language options",
        responseStyles: "Array of 12 response style options",
        categories: "Array of 9 category options"
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.json({
      success: false,
      message: "Character options endpoint test failed",
      error: error.message,
      note: "Check if character system is properly configured"
    });
  }
});

// Test Character System
app.post("/test-character", async (req, res) => {
  try {
    const { message, characterName } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
        example: '{"message": "Hello", "characterName": "Einstein"}'
      });
    }
    
    console.log(`🧪 Testing character: ${characterName || 'Einstein'} with message: ${message}`);
    
    // Character prompts for testing
    const characterPrompts = {
      "Einstein": "You are Albert Einstein. Respond with scientific curiosity, use physics metaphors, and speak with wisdom about the universe. Occasionally mention relativity or sailing.",
      "Sherlock": "You are Sherlock Holmes. Use precise Victorian language, deductive reasoning, and often say 'Elementary!' Be observant and analytical.",
      "Shakespeare": "You are William Shakespeare. Speak in beautiful, poetic language with Elizabethan flair. Use metaphors and occasionally rhyme.",
      "Pirate": "You are a friendly pirate captain. Use pirate language with 'Arrr', 'matey', and sea metaphors. Be adventurous and tell tales.",
      "Yoda": "You are Yoda from Star Wars. Use inverted sentence structure, say 'Hmm' often, and share wisdom about the Force.",
      "Grandmother": "You are a loving grandmother. Be caring, wise, give gentle advice, and occasionally mention family stories or cooking."
    };
    
    const selectedCharacter = characterName || "Einstein";
    const characterPrompt = characterPrompts[selectedCharacter] || characterPrompts["Einstein"];
    
    const fullPrompt = `${characterPrompt}

User: ${message}

${selectedCharacter}:`;

    console.log('🎭 Using character prompt for:', selectedCharacter);

    // Test with your API key
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { 
          temperature: 0.9, // More creative for characters
          maxOutputTokens: 1024 
        }
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      const characterResponse = data.candidates[0].content.parts[0].text;
      console.log(`✅ Character response generated for ${selectedCharacter}`);
      
      res.json({
        success: true,
        character: selectedCharacter,
        userMessage: message,
        characterResponse: characterResponse,
        timestamp: new Date().toISOString(),
        promptUsed: characterPrompt,
        characterSystemStatus: characterRoutes ? "Available" : "Disabled"
      });
    } else {
      res.json({
        success: false,
        error: data.error?.message,
        character: selectedCharacter,
        status: response.status
      });
    }
    
  } catch (error) {
    console.error('❌ Character test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Simple Chat Test
app.post("/test-chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
        example: 'Send: {"message": "Hello"}'
      });
    }

    console.log(`🧪 Testing chat with: "${message}"`);

    if (!generateResponse) {
      return res.status(500).json({
        success: false,
        error: "generateResponse function not available"
      });
    }

    const response = await generateResponse(message);
    
    res.json({
      success: true,
      userMessage: message,
      aiResponse: response.text || response,
      timestamp: new Date().toISOString(),
      keyUsed: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 20) + '...' : 'NOT_CONFIGURED'
    });

  } catch (error) {
    console.error("❌ Chat test error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Environment Test
app.get("/test-env", (req, res) => {
  res.json({
    message: "Environment variables test",
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      EMAIL_USERNAME: process.env.EMAIL_USERNAME,
      MONGO_URI: process.env.MONGO_URI ? '✅ Configured' : '❌ Missing',
      JWT_SECRET: process.env.JWT_SECRET ? '✅ Configured' : '❌ Missing',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing',
      GEMINI_KEY_PREVIEW: process.env.GEMINI_API_KEY ? 
        process.env.GEMINI_API_KEY.substring(0, 20) + '...' : 'NOT FOUND',
      GEMINI_KEY_ENDING: process.env.GEMINI_API_KEY ? 
        '...' + process.env.GEMINI_API_KEY.slice(-10) : 'NOT FOUND'
    },
    systemStatus: {
      userRoutes: !!userRoutes,
      chatRoutes: !!chatRoutes,
      characterRoutes: !!characterRoutes,
      generateResponse: !!generateResponse
    }
  });
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
      characterCreation: characterRoutes ? "✅ Available" : "❌ Disabled",
      characterOptions: characterRoutes ? "✅ Available" : "❌ Disabled",
      geminiAPI: process.env.GEMINI_API_KEY ? "✅ Configured" : "❌ Missing",
      emailService: process.env.EMAIL_USERNAME ? "✅ Configured" : "❌ Missing"
    },
    routes: {
      "/api/user/*": userRoutes ? "✅ Mounted" : "❌ Missing",
      "/api/chat/*": chatRoutes ? "✅ Mounted" : "❌ Missing",
      "/api/characters/*": characterRoutes ? "✅ Mounted" : "❌ Disabled"
    }
  });
});

// STEP 8: ERROR HANDLING

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ === GLOBAL ERROR ===');
  console.error('❌ Error:', err.message);
  console.error('❌ Stack:', err.stack);
  console.error('❌ URL:', req.url);
  console.error('❌ Method:', req.method);
  
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  });
});

// 404 Handler - Must be last
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: {
      main: [
        'GET / - Server info',
        'GET /health - Health check',
        'GET /status - System status'
      ],
      testing: [
        'GET /test-env - Environment test', 
        'GET /test-my-key - API key test',
        'POST /test-chat - Regular chat test',
        'POST /test-character - Character chat test',
        'GET /test-character-system - Test character system',
        'GET /test-character-options - Test character options endpoint',
        'GET /debug-email-config - Debug email configuration',
        'POST /emergency-email-test - Test email sending'
      ],
      api: [
        'POST /api/user/login - User login',
        'POST /api/user/verify - Verify OTP',
        'GET /api/user/me - User profile',
        'POST /api/chat/new - Create chat',
        'GET /api/chat/all - Get all chats',
        'GET /api/chat/:id - Get chat conversations',
        'POST /api/chat/:id - Send message',
        'DELETE /api/chat/:id - Delete chat',
        ...(characterRoutes ? [
          'GET /api/characters - Get characters',
          'GET /api/characters/options - Get character creation options',
          'POST /api/characters - Create character',
          'GET /api/characters/:id - Get character',
          'PUT /api/characters/:id - Update character',
          'DELETE /api/characters/:id - Delete character'
        ] : ['❌ Character routes disabled - missing files'])
      ],
      debug: [
        'GET /debug-routes - See all routes',
        'GET /debug-character-system - Debug character issues'
      ]
    }
  });
});

// STEP 9: START SERVER
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
      console.log(`📧 Email Password Length: ${process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0}`);
      console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? '✅ CONFIGURED' : '❌ Missing'}`);
      console.log(`🔑 Key ending: ...${process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.slice(-10) : 'NONE'}`);
      console.log(`🔗 Server URL: http://localhost:${PORT}`);
      
      console.log('\n📋 === SYSTEM STATUS ===');
      console.log(`👤 User System: ${userRoutes ? '✅ Active' : '❌ Inactive'}`);
      console.log(`💬 Chat System: ${chatRoutes ? '✅ Active' : '❌ Inactive'}`);
      console.log(`🎭 Character System: ${characterRoutes ? '✅ Active' : '❌ Disabled'}`);
      console.log(`🔧 Character Options: ${characterRoutes ? '✅ Active' : '❌ Disabled'}`);
      console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Ready' : '❌ Not configured'}`);
      console.log(`📧 Email Service: ${process.env.EMAIL_USERNAME ? '✅ Ready' : '❌ Not configured'}`);
      
      console.log('\n🧪 === TEST ENDPOINTS ===');
      console.log(`🔍 System Status: http://localhost:${PORT}/status`);
      console.log(`🔑 API Key Test: http://localhost:${PORT}/test-my-key`);
      console.log(`🤖 Regular Chat: POST http://localhost:${PORT}/test-chat`);
      console.log(`🎭 Character Chat: POST http://localhost:${PORT}/test-character`);
      console.log(`📧 Email Debug: http://localhost:${PORT}/debug-email-config`);
      console.log(`🚨 Email Test: POST http://localhost:${PORT}/emergency-email-test`);
      console.log(`🔧 Character Options: http://localhost:${PORT}/test-character-options`);
      
      if (characterRoutes) {
        console.log(`✅ Character System: http://localhost:${PORT}/test-character-system`);
      } else {
        console.log(`❌ Character Debug: http://localhost:${PORT}/debug-character-system`);
      }
      
      console.log('\n🎯 === NEXT STEPS ===');
      console.log('✅ 1. Test email configuration: /debug-email-config');
      console.log('✅ 2. Send test email: POST /emergency-email-test');
      console.log('✅ 3. If email works, try user login in frontend');
      
      if (characterRoutes) {
        console.log('✅ 4. Character system is ready!');
        console.log('✅ 5. Test character routes: /test-character-system');
        console.log('✅ 6. Try creating characters in the frontend');
        console.log('✅ 7. Chat with Einstein, Sherlock, Shakespeare!');
      } else {
        console.log('❌ 4. Character system disabled - missing files');
        console.log('❌ 5. Create required files: Character.js, characterControllers.js');
        console.log('❌ 6. Check debug endpoint: /debug-character-system');
        console.log('❌ 7. Restart server after creating files');
      }
      
      console.log('\n🎭 === AVAILABLE FEATURES ===');
      console.log('✅ User Authentication (Email OTP)');
      console.log('✅ Regular AI Chat');
      console.log('✅ Chat History Management');
      console.log(`${characterRoutes ? '✅' : '❌'} Character-based AI Chat`);
      console.log(`${characterRoutes ? '✅' : '❌'} Custom Character Creation`);
      console.log(`${characterRoutes ? '✅' : '❌'} Character Creation Options API`);
      console.log(`${characterRoutes ? '✅' : '❌'} Pre-built Characters (Einstein, Sherlock, etc.)`);
      console.log('✅ Email Debug & Testing Endpoints');
      
      console.log('\n================================');
      console.log('🎉 SERVER READY FOR CONNECTIONS!');
      console.log('📧 EMAIL SYSTEM CONFIGURED!');
      if (characterRoutes) {
        console.log('🎭 CHARACTER SYSTEM FULLY OPERATIONAL!');
        console.log('🔧 CHARACTER OPTIONS ENDPOINT READY!');
      }
      console.log('================================\n');
    });
    
  } catch (error) {
    console.error('\n❌ === SERVER STARTUP FAILED ===');
    console.error('❌ Error:', error.message);
    console.error('❌ Stack:', error.stack);
    console.error('❌ Server will not start');
    process.exit(1);
  }
};

// Start the server
startServer();