/**
 * API service for interacting with the backend MongoDB API
 * Handles all HTTP requests to the server endpoints
 */
import { toast } from 'sonner';
import { DateRange } from '../models/DateRange';

// Base API URL - changes based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://dgr.wisincrease.com/rentApi'
  : 'http://localhost:3001/api';

/**
 * Process history items from API response, converting date ranges
 * @param {Array} items - History items from API
 * @returns {Array} - Processed history items with proper objects
 */
const processHistoryItems = (items) => {
  if (!Array.isArray(items)) return [];
  
  return items.map(item => {
    try {
      // Convert quarterRange
      if (item.quarterRange) {
        item.quarterRange = DateRange.fromJSON(item.quarterRange);
      }
      
      // Convert room dateRanges
      if (item.roomResults && Array.isArray(item.roomResults)) {
        item.roomResults = item.roomResults.map(room => {
          if (!room) return {};
          
          try {
            if (room.dateRange) {
              room.dateRange = DateRange.fromJSON(room.dateRange);
            }
            
            // Convert resident dateRanges
            if (room.residentResults && Array.isArray(room.residentResults)) {
              room.residentResults = room.residentResults.map(resident => {
                if (!resident) return {};
                
                try {
                  if (resident.dateRange) {
                    resident.dateRange = DateRange.fromJSON(resident.dateRange);
                  }
                  return resident;
                } catch (e) {
                  console.error('Error converting resident dateRange:', e);
                  return resident || {};
                }
              });
            }
            
            return room;
          } catch (e) {
            console.error('Error converting room:', e);
            return room || {};
          }
        });
      }
      
      return item;
    } catch (error) {
      console.error('Error processing history item:', error);
      return null;
    }
  }).filter(Boolean);
};

/**
 * Check the health status of the API
 * @returns {Promise<boolean>} - True if API is healthy
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

/**
 * Fetch all water bill history records
 * @returns {Promise<Array>} - Water bill history records
 */
export const fetchWaterBillHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/water-bills`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch water bills');
    }
    
    return processHistoryItems(data.data);
  } catch (error) {
    console.error('Failed to fetch water bill history:', error);
    throw error;
  }
};

/**
 * Fetch all electricity bill history records
 * @returns {Promise<Array>} - Electricity bill history records
 */
export const fetchElectricityBillHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/electricity-bills`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch electricity bills');
    }
    
    return processHistoryItems(data.data);
  } catch (error) {
    console.error('Failed to fetch electricity bill history:', error);
    throw error;
  }
};

/**
 * Process bill object for API sending by converting DateRange objects to JSON
 * @param {Object} bill - Bill object with DateRange instances
 * @returns {Object} - Processed bill ready for API
 */
const prepareBillForAPI = (bill) => {
  const processedBill = { ...bill };
  
  // Convert DateRange objects to JSON
  if (processedBill.quarterRange && typeof processedBill.quarterRange.toJSON === 'function') {
    processedBill.quarterRange = processedBill.quarterRange.toJSON();
  }
  
  // Process room results
  if (processedBill.roomResults && Array.isArray(processedBill.roomResults)) {
    processedBill.roomResults = processedBill.roomResults.map(room => {
      const processedRoom = { ...room };
      
      // Convert room dateRange
      if (processedRoom.dateRange && typeof processedRoom.dateRange.toJSON === 'function') {
        processedRoom.dateRange = processedRoom.dateRange.toJSON();
      }
      
      // Process resident results
      if (processedRoom.residentResults && Array.isArray(processedRoom.residentResults)) {
        processedRoom.residentResults = processedRoom.residentResults.map(resident => {
          const processedResident = { ...resident };
          
          // Convert resident dateRange
          if (processedResident.dateRange && typeof processedResident.dateRange.toJSON === 'function') {
            processedResident.dateRange = processedResident.dateRange.toJSON();
          }
          
          return processedResident;
        });
      }
      
      return processedRoom;
    });
  }
  
  return processedBill;
};

/**
 * Add a water bill record
 * @param {Object} record - Water bill record to add
 * @returns {Promise<Object>} - Added record with API ID
 */
export const addWaterBillRecord = async (record) => {
  try {
    const processedRecord = prepareBillForAPI(record);
    
    const response = await fetch(`${API_BASE_URL}/water-bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processedRecord),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to add water bill');
    }
    
    // Return the processed record with its DateRange objects intact
    return { ...record, _id: data.data._id };
  } catch (error) {
    console.error('Failed to add water bill record:', error);
    throw error;
  }
};

/**
 * Add an electricity bill record
 * @param {Object} record - Electricity bill record to add
 * @returns {Promise<Object>} - Added record with API ID
 */
export const addElectricityBillRecord = async (record) => {
  try {
    const processedRecord = prepareBillForAPI(record);
    
    const response = await fetch(`${API_BASE_URL}/electricity-bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processedRecord),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to add electricity bill');
    }
    
    // Return the processed record with its DateRange objects intact
    return { ...record, _id: data.data._id };
  } catch (error) {
    console.error('Failed to add electricity bill record:', error);
    throw error;
  }
};

/**
 * Delete a water bill record
 * @param {string} id - Record ID to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export const deleteWaterBillRecord = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/water-bills/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error(`Failed to delete water bill record with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an electricity bill record
 * @param {string} id - Record ID to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export const deleteElectricityBillRecord = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/electricity-bills/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error(`Failed to delete electricity bill record with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Clear all history records
 * @returns {Promise<Object>} - Result with counts of deleted records
 */
export const clearAllHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/clear-all`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to clear history');
    }
    
    return data.deleted;
  } catch (error) {
    console.error('Failed to clear all history:', error);
    throw error;
  }
};