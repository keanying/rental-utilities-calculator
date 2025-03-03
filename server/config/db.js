/**
 * MongoDB configuration and connection management
 */
const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB connection URI
const uri = "mongodb://root:CydubPI3ZaKGjPM2@192.168.0.17:27017";

// Database name
const dbName = 'rental_utilities_calculator';

// MongoDB client instance
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database connection reference
let db;

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
async function connectToMongoDB() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('✅ MongoDB connection test successful');
    
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Get the database instance
 * @returns {Db} MongoDB database instance
 */
function getDb() {
  if (!db) {
    throw new Error('No database connection established. Call connectToMongoDB first.');
  }
  return db;
}

/**
 * Close the MongoDB connection
 * @returns {Promise<void>}
 */
async function closeConnection() {
  if (client) {
    await client.close();
    console.log('✅ MongoDB connection closed');
  }
}

// Handle application termination
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});

module.exports = {
  connectToMongoDB,
  getDb,
  closeConnection
};