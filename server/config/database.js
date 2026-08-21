import mongoose from "mongoose";

// Connection state tracking
let connectionState = {
  isConnected: false,
  error: null,
  retryCount: 0,
  lastAttempt: null,
  retryDelay: 5000, // Initial retry delay in milliseconds
  maxRetries: 5
};

// Validate MongoDB URI
const validateMongoURI = (uri) => {
  if (!uri) {
    throw new Error("MONGO_URI environment variable is not set");
  }
  
  if (typeof uri !== 'string') {
    throw new Error("MONGO_URI must be a string");
  }
  
  // Basic URI format validation
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error("MONGO_URI must start with 'mongodb://' or 'mongodb+srv://'");
  }
  
  return true;
};

// Connection event listeners
const setupConnectionListeners = () => {
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
    connectionState.isConnected = true;
    connectionState.error = null;
    connectionState.retryCount = 0;
    
    // Log connection details
    const db = mongoose.connection.db;
    if (db) {
      console.log(`📊 Database: ${db.databaseName}`);
      console.log(`🌐 Host: ${mongoose.connection.host}`);
      console.log(`🔌 Port: ${mongoose.connection.port}`);
    }
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
    connectionState.error = err.message;
    connectionState.isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
    connectionState.isConnected = false;
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
    connectionState.isConnected = true;
    connectionState.error = null;
  });

  mongoose.connection.on('close', () => {
    console.log('🔒 MongoDB connection closed');
    connectionState.isConnected = false;
  });
};

// Exponential backoff retry logic
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const connectWithRetry = async (uri, options = {}) => {
  validateMongoURI(uri);
  
  setupConnectionListeners();
  
  while (connectionState.retryCount < connectionState.maxRetries) {
    connectionState.lastAttempt = new Date();
    connectionState.retryCount++;
    
    try {
      console.log(`🔄 MongoDB connection attempt ${connectionState.retryCount}/${connectionState.maxRetries}...`);
      
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
        socketTimeoutMS: 45000, // Socket timeout after 45 seconds
        connectTimeoutMS: 10000, // Connection timeout after 10 seconds
        ...options
      });
      
      // If we get here, connection was successful
      return mongoose.connection;
      
    } catch (error) {
      console.error(`❌ Connection attempt ${connectionState.retryCount} failed:`, error.message);
      connectionState.error = error.message;
      
      // Check if we should retry
      if (connectionState.retryCount < connectionState.maxRetries) {
        const delay = connectionState.retryDelay * Math.pow(2, connectionState.retryCount - 1);
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
        await sleep(delay);
      }
    }
  }
  
  // If we've exhausted all retries
  throw new Error(`Failed to connect to MongoDB after ${connectionState.maxRetries} attempts. Last error: ${connectionState.error}`);
};

// Graceful shutdown handler
const handleGracefulShutdown = async () => {
  console.log('🛑 Closing MongoDB connection...');
  
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed gracefully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    process.exit(1);
  }
};

// Setup graceful shutdown listeners
const setupGracefulShutdown = () => {
  process.on('SIGTERM', handleGracefulShutdown);
  process.on('SIGINT', handleGracefulShutdown);
};

// Get connection status
const getConnectionStatus = () => {
  const readyState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    state: states[readyState] || 'unknown',
    isConnected: connectionState.isConnected,
    error: connectionState.error,
    retryCount: connectionState.retryCount,
    lastAttempt: connectionState.lastAttempt,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    database: mongoose.connection.db?.databaseName || null
  };
};

// Main connection function
const connectDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error("MONGO_URI environment variable is not set");
    }
    
    console.log('🚀 Initializing MongoDB connection...');
    console.log(`📍 URI: ${mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Hide credentials
    
    await connectWithRetry(mongoURI);
    setupGracefulShutdown();
    
    console.log('✅ Database connection established successfully');
    return mongoose.connection;
    
  } catch (error) {
    console.error('💥 Fatal database connection error:', error.message);
    console.error('🔧 Please check:');
    console.error('   1. MONGO_URI is set in .env file');
    console.error('   2. MongoDB server is running and accessible');
    console.error('   3. Network connectivity to MongoDB server');
    console.error('   4. MongoDB credentials are correct');
    
    // In development, we might want to continue even if DB fails
    // In production, we should exit
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    
    throw error;
  }
};

export { connectDatabase, getConnectionStatus, handleGracefulShutdown };