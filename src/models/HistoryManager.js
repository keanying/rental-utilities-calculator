/**
 * HistoryManager.js
 * 历史记录管理器，用于保存和管理计算结果
 */
import { WaterBill } from './WaterBill';
import { ElectricityBill } from './ElectricityBill';
import { DateRange } from './DateRange';
import { v4 as uuidv4 } from 'uuid';

export class HistoryManager {
  /**
   * 创建历史记录管理器
   */
  constructor() {
    this.waterBillHistory = this.loadHistory('waterBillHistory');
    this.electricityBillHistory = this.loadHistory('electricityBillHistory');
  }

  /**
   * 从本地存储加载历史记录
   * @param {string} storageKey - 存储键名
   * @returns {Array} 历史记录列表
   */
  loadHistory(storageKey) {
    try {
      const storedData = localStorage.getItem(storageKey);
      if (!storedData) return [];
      
      const parsedData = JSON.parse(storedData);
      
      if (!Array.isArray(parsedData)) return [];
      
      // Filter out invalid items first
      const validItems = parsedData.filter(item => {
        return item && typeof item === 'object' && item.quarterRange !== undefined;
      });
      
      // 转换日期范围对象
      return validItems.map(item => {
        try {
          // Handle quarterRange conversion safely
          if (item.quarterRange) {
            try {
              item.quarterRange = DateRange.fromJSON(item.quarterRange);
            } catch (e) {
              console.error('Error converting quarterRange:', e);
              // Create a fallback date range if conversion fails
              item.quarterRange = new DateRange(new Date(), new Date());
            }
          } else {
            // Provide default quarterRange if missing
            item.quarterRange = new DateRange(new Date(), new Date());
          }
          
          // Handle roomResults conversion safely
          if (item.roomResults && Array.isArray(item.roomResults)) {
            item.roomResults = item.roomResults.map(room => {
              if (!room) return {};
              
              try {
                if (room.dateRange) {
                  room.dateRange = DateRange.fromJSON(room.dateRange);
                }
                
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
                } else {
                  room.residentResults = [];
                }
                
                return room;
              } catch (e) {
                console.error('Error converting room:', e);
                return room || {};
              }
            });
          } else {
            item.roomResults = [];
          }
          
          // Ensure other required properties exist
          if (!item.id) item.id = uuidv4();
          if (!item.date) item.date = new Date().toISOString();
          if (!item.totalAmount) item.totalAmount = 0;
          
          return item;
        } catch (itemError) {
          console.error('Error processing history item:', itemError);
          return null;
        }
      }).filter(Boolean); // Remove any null items
    } catch (error) {
      console.error('加载历史记录失败:', error);
      return [];
    }
  }

  /**
   * 保存历史记录到本地存储
   */
  saveToStorage() {
    try {
      localStorage.setItem('waterBillHistory', JSON.stringify(this.waterBillHistory));
      localStorage.setItem('electricityBillHistory', JSON.stringify(this.electricityBillHistory));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }

  /**
   * 添加水费记录
   * @param {Object} waterBillResult - 水费计算结果
   * @returns {Object} 添加的记录
   */
  addWaterBillHistory(waterBillResult) {
    this.waterBillHistory.unshift(waterBillResult);
    this.saveToStorage();
    return waterBillResult;
  }

  /**
   * 添加电费记录
   * @param {Object} electricityBillResult - 电费计算结果
   * @returns {Object} 添加的记录
   */
  addElectricityBillHistory(electricityBillResult) {
    this.electricityBillHistory.unshift(electricityBillResult);
    this.saveToStorage();
    return electricityBillResult;
  }

  /**
   * 删除水费记录
   * @param {string} id - 记录ID
   * @returns {boolean} 是否成功删除
   */
  deleteWaterBillHistory(id) {
    const initialLength = this.waterBillHistory.length;
    this.waterBillHistory = this.waterBillHistory.filter(bill => bill.id !== id);
    
    if (this.waterBillHistory.length !== initialLength) {
      this.saveToStorage();
      return true;
    }
    
    return false;
  }

  /**
   * 删除电费记录
   * @param {string} id - 记录ID
   * @returns {boolean} 是否成功删除
   */
  deleteElectricityBillHistory(id) {
    const initialLength = this.electricityBillHistory.length;
    this.electricityBillHistory = this.electricityBillHistory.filter(bill => bill.id !== id);
    
    if (this.electricityBillHistory.length !== initialLength) {
      this.saveToStorage();
      return true;
    }
    
    return false;
  }

  /**
   * 清空所有历史记录
   */
  clearAllHistory() {
    this.waterBillHistory = [];
    this.electricityBillHistory = [];
    this.saveToStorage();
  }

  /**
   * 获取水费历史记录
   * @returns {Array} 水费历史记录列表
   */
  getWaterBillHistory() {
    return this.waterBillHistory;
  }

  /**
   * 获取电费历史记录
   * @returns {Array} 电费历史记录列表
   */
  getElectricityBillHistory() {
    return this.electricityBillHistory;
  }
}