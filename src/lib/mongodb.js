/**
 * MongoDB connection module for the rental utilities calculator application
 * Handles database connection and provides CRUD operations for water and electricity bills
 */
import { MongoClient, ServerApiVersion } from 'mongodb';

// MongoDB connection string and configuration
const uri = "mongodb://root:CydubPI3ZaKGjPM2@124.221.58.17:27017";

// MongoDB client instance with connection options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database and collections names
const DB_NAME = 'rental_utilities_calculator';
const WATER_COLLECTION = 'water_bill_history';
const ELECTRICITY_COLLECTION = 'electricity_bill_history';

// Connection status flag
let isConnected = false;

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
export async function connect() {
  if (!isConnected) {
    try {
      await client.connect();
      console.log("✅ Connected to MongoDB successfully");
      isConnected = true;
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error);
      throw error;
    }
  }
}

/**
 * Ensure connection to MongoDB before performing operations
 * @returns {Promise<void>}
 */
async function ensureConnected() {
  if (!isConnected) {
    await connect();
  }
}

/**
 * Get reference to a specific collection
 * @param {string} collectionName - Name of the collection
 * @returns {Collection} MongoDB collection object
 */
function getCollection(collectionName) {
  const db = client.db(DB_NAME);
  return db.collection(collectionName);
}

/**
 * Prepare bill object for MongoDB storage by converting objects to plain JSON
 * @param {Object} bill - Bill object from the application
 * @returns {Object} - Processed bill object safe for MongoDB storage
 */
function prepareBillForStorage(bill) {
  const processedBill = { ...bill };
  
  // Convert DateRange objects to plain JSON
  if (processedBill.quarterRange) {
    processedBill.quarterRange = processedBill.quarterRange.toJSON();
  }
  
  // Process room results
  if (processedBill.roomResults && Array.isArray(processedBill.roomResults)) {
    processedBill.roomResults = processedBill.roomResults.map(room => {
      const processedRoom = { ...room };
      
      // Convert room dateRange
      if (processedRoom.dateRange) {
        processedRoom.dateRange = processedRoom.dateRange.toJSON();
      }
      
      // Process resident results
      if (processedRoom.residentResults && Array.isArray(processedRoom.residentResults)) {
        processedRoom.residentResults = processedRoom.residentResults.map(resident => {
          const processedResident = { ...resident };
          
          // Convert resident dateRange
          if (processedResident.dateRange) {
            processedResident.dateRange = processedResident.dateRange.toJSON();
          }
          
          return processedResident;
        });
      }
      
      return processedRoom;
    });
  }
  
  return processedBill;
}

/**
 * Save water bill history to MongoDB
 * @param {Array} history - Array of water bill history items
 * @returns {Promise<void>}
 */
export async function saveWaterBillHistory(history) {
  try {
    await ensureConnected();
    const collection = getCollection(WATER_COLLECTION);
    
    // Clear existing collection data and insert new history
    await collection.deleteMany({});
    
    if (history.length > 0) {
      const processedHistory = history.map(prepareBillForStorage);
      await collection.insertMany(processedHistory);
    }
    
    console.log("✅ Water bill history saved to MongoDB");
  } catch (error) {
    console.error("❌ Failed to save water bill history:", error);
    throw error;
  }
}

/**
 * Load water bill history from MongoDB
 * @returns {Promise<Array>} Array of water bill history items
 */
export async function loadWaterBillHistory() {
  try {
    await ensureConnected();
    const collection = getCollection(WATER_COLLECTION);
    
    const history = await collection.find({}).sort({ date: -1 }).toArray();
    console.log(`✅ Loaded ${history.length} water bill history records from MongoDB`);
    
    return history;
  } catch (error) {
    console.error("❌ Failed to load water bill history:", error);
    throw error;
  }
}

/**
 * Save electricity bill history to MongoDB
 * @param {Array} history - Array of electricity bill history items
 * @returns {Promise<void>}
 */
export async function saveElectricityBillHistory(history) {
  try {
    await ensureConnected();
    const collection = getCollection(ELECTRICITY_COLLECTION);
    
    // Clear existing collection data and insert new history
    await collection.deleteMany({});
    
    if (history.length > 0) {
      const processedHistory = history.map(prepareBillForStorage);
      await collection.insertMany(processedHistory);
    }
    
    console.log("✅ Electricity bill history saved to MongoDB");
  } catch (error) {
    console.error("❌ Failed to save electricity bill history:", error);
    throw error;
  }
}

/**
 * Load electricity bill history from MongoDB
 * @returns {Promise<Array>} Array of electricity bill history items
 */
export async function loadElectricityBillHistory() {
  try {
    await ensureConnected();
    const collection = getCollection(ELECTRICITY_COLLECTION);
    
    const history = await collection.find({}).sort({ date: -1 }).toArray();
    console.log(`✅ Loaded ${history.length} electricity bill history records from MongoDB`);
    
    return history;
  } catch (error) {
    console.error("❌ Failed to load electricity bill history:", error);
    throw error;
  }
}

/**
 * Add water bill record to MongoDB
 * @param {Object} record - Water bill record to add
 * @returns {Promise<Object>} Added record with MongoDB _id
 */
export async function addWaterBillRecord(record) {
  try {
    await ensureConnected();
    const collection = getCollection(WATER_COLLECTION);
    
    const processedRecord = prepareBillForStorage(record);
    const result = await collection.insertOne(processedRecord);
    
    console.log(`✅ Water bill record added with ID: ${result.insertedId}`);
    return { ...record, _id: result.insertedId };
  } catch (error) {
    console.error("❌ Failed to add water bill record:", error);
    throw error;
  }
}

/**
 * Add electricity bill record to MongoDB
 * @param {Object} record - Electricity bill record to add
 * @returns {Promise<Object>} Added record with MongoDB _id
 */
export async function addElectricityBillRecord(record) {
  try {
    await ensureConnected();
    const collection = getCollection(ELECTRICITY_COLLECTION);
    
    const processedRecord = prepareBillForStorage(record);
    const result = await collection.insertOne(processedRecord);
    
    console.log(`✅ Electricity bill record added with ID: ${result.insertedId}`);
    return { ...record, _id: result.insertedId };
  } catch (error) {
    console.error("❌ Failed to add electricity bill record:", error);
    throw error;
  }
}

/**
 * Delete water bill record from MongoDB
 * @param {string} id - Record ID to delete
 * @returns {Promise<boolean>} True if deletion was successful
 */
export async function deleteWaterBillRecord(id) {
  try {
    await ensureConnected();
    const collection = getCollection(WATER_COLLECTION);
    
    const result = await collection.deleteOne({ id: id });
    const success = result.deletedCount > 0;
    
    if (success) {
      console.log(`✅ Water bill record with ID ${id} deleted successfully`);
    } else {
      console.log(`⚠️ No water bill record found with ID ${id}`);
    }
    
    return success;
  } catch (error) {
    console.error(`❌ Failed to delete water bill record with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete electricity bill record from MongoDB
 * @param {string} id - Record ID to delete
 * @returns {Promise<boolean>} True if deletion was successful
 */
export async function deleteElectricityBillRecord(id) {
  try {
    await ensureConnected();
    const collection = getCollection(ELECTRICITY_COLLECTION);
    
    const result = await collection.deleteOne({ id: id });
    const success = result.deletedCount > 0;
    
    if (success) {
      console.log(`✅ Electricity bill record with ID ${id} deleted successfully`);
    } else {
      console.log(`⚠️ No electricity bill record found with ID ${id}`);
    }
    
    return success;
  } catch (error) {
    console.error(`❌ Failed to delete electricity bill record with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Clear all history records from MongoDB
 * @returns {Promise<void>}
 */
export async function clearAllHistory() {
  try {
    await ensureConnected();
    const waterCollection = getCollection(WATER_COLLECTION);
    const electricityCollection = getCollection(ELECTRICITY_COLLECTION);
    
    await waterCollection.deleteMany({});
    await electricityCollection.deleteMany({});
    
    console.log("✅ All history records cleared from MongoDB");
  } catch (error) {
    console.error("❌ Failed to clear history records:", error);
    throw error;
  }
}

/**
 * Close MongoDB connection
 * @returns {Promise<void>}
 */
export async function closeConnection() {
  if (isConnected) {
    try {
      await client.close();
      isConnected = false;
      console.log("✅ MongoDB connection closed");
    } catch (error) {
      console.error("❌ Failed to close MongoDB connection:", error);
      throw error;
    }
  }
}