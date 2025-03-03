/**
 * API routes for the rental utilities calculator MongoDB backend
 * Handles CRUD operations for water and electricity bill history
 */
const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Collection names
const WATER_COLLECTION = 'water_bill_history';
const ELECTRICITY_COLLECTION = 'electricity_bill_history';

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

/**
 * Get all water bill history records
 */
router.get('/water-bills', async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection(WATER_COLLECTION);
    const bills = await collection.find({}).sort({ date: -1 }).toArray();
    
    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    console.error('Failed to fetch water bills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch water bills',
      error: error.message
    });
  }
});

/**
 * Get all electricity bill history records
 */
router.get('/electricity-bills', async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection(ELECTRICITY_COLLECTION);
    const bills = await collection.find({}).sort({ date: -1 }).toArray();
    
    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    console.error('Failed to fetch electricity bills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch electricity bills',
      error: error.message
    });
  }
});

/**
 * Add a new water bill record
 */
router.post('/water-bills', async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection(WATER_COLLECTION);
    const newBill = req.body;
    
    // Ensure required fields
    if (!newBill || !newBill.id || !newBill.quarterRange) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Add timestamp if not present
    if (!newBill.date) {
      newBill.date = new Date().toISOString();
    }
    
    const result = await collection.insertOne(newBill);
    
    res.status(201).json({
      success: true,
      data: {
        ...newBill,
        _id: result.insertedId
      }
    });
  } catch (error) {
    console.error('Failed to add water bill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add water bill',
      error: error.message
    });
  }
});

/**
 * Add a new electricity bill record
 */
router.post('/electricity-bills', async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection(ELECTRICITY_COLLECTION);
    const newBill = req.body;
    
    // Ensure required fields
    if (!newBill || !newBill.id || !newBill.quarterRange) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Add timestamp if not present
    if (!newBill.date) {
      newBill.date = new Date().toISOString();
    }
    
    const result = await collection.insertOne(newBill);
    
    res.status(201).json({
      success: true,
      data: {
        ...newBill,
        _id: result.insertedId
      }
    });
  } catch (error) {
    console.error('Failed to add electricity bill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add electricity bill',
      error: error.message
    });
  }
});

/**
 * Delete a water bill record
 */
router.delete('/water-bills/:id', async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection(WATER_COLLECTION);
    const { id } = req.params;
    
    const result = await collection.deleteOne({ id: id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: `Water bill with id ${id} not found`
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Water bill with id ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Failed to delete water bill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete water bill',
      error: error.message
    });
  }
});

/**
 * Delete an electricity bill record
 */
router.delete('/electricity-bills/:id', async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection(ELECTRICITY_COLLECTION);
    const { id } = req.params;
    
    const result = await collection.deleteOne({ id: id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: `Electricity bill with id ${id} not found`
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Electricity bill with id ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Failed to delete electricity bill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete electricity bill',
      error: error.message
    });
  }
});

/**
 * Clear all history records
 */
router.delete('/clear-all', async (req, res) => {
  try {
    const db = getDb();
    const waterCollection = db.collection(WATER_COLLECTION);
    const electricityCollection = db.collection(ELECTRICITY_COLLECTION);
    
    // Delete all records from both collections
    const waterResult = await waterCollection.deleteMany({});
    const electricityResult = await electricityCollection.deleteMany({});
    
    res.status(200).json({
      success: true,
      message: 'All history records cleared successfully',
      deleted: {
        waterBills: waterResult.deletedCount,
        electricityBills: electricityResult.deletedCount
      }
    });
  } catch (error) {
    console.error('Failed to clear history records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear history records',
      error: error.message
    });
  }
});

module.exports = router;