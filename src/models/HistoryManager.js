/**
 * HistoryManager.js
 * 历史记录管理器，用于保存和管理计算结果
 * 更新: 使用API服务与后端MongoDB交互
 */
import { WaterBill } from './WaterBill';
import { ElectricityBill } from './ElectricityBill';
import { DateRange } from './DateRange';
import { v4 as uuidv4 } from 'uuid';
import * as APIService from '../services/api';

export class HistoryManager {
  /**
   * 创建历史记录管理器
   */
  constructor() {
    this.waterBillHistory = [];
    this.electricityBillHistory = [];
    this.isLoading = true;
    this.isInitialized = false;
    this.useCloud = false;

    // 初始化连接并加载数据
    this.initialize();
  }

  /**
   * 初始化并加载历史数据
   */
  async initialize() {
    try {
      this.isLoading = true;

      // 检查API健康状况
      const isApiHealthy = await APIService.checkApiHealth();
      this.useCloud = isApiHealthy;
      
      if (isApiHealthy) {
        // 如果API可用，从云端加载数据
        console.log('✅ API connection established, loading data from cloud');
        await this.loadHistoryFromAPI();
        this.isInitialized = true;
      } else {
        // 如果API不可用，从本地加载数据
        console.log('⚠️ API not available, loading data from localStorage');
        this.loadHistoryFromLocalStorage();
      }
      
      this.isLoading = false;
    } catch (error) {
      console.error('❌ HistoryManager initialization failed:', error);
      this.isLoading = false;
      
      // 如果API初始化失败，尝试从localStorage加载
      console.log('⚠️ Falling back to localStorage');
      this.loadHistoryFromLocalStorage();
    }
  }

  /**
   * 从API加载历史数据
   */
  async loadHistoryFromAPI() {
    try {
      // 获取水费历史记录
      const waterHistory = await APIService.fetchWaterBillHistory();
      this.waterBillHistory = waterHistory;
      
      // 获取电费历史记录
      const electricityHistory = await APIService.fetchElectricityBillHistory();
      this.electricityBillHistory = electricityHistory;
      
      console.log(`✅ Loaded ${this.waterBillHistory.length} water bills and ${this.electricityBillHistory.length} electricity bills from API`);
    } catch (error) {
      console.error('❌ Failed to load history from API:', error);
      throw error;
    }
  }

  /**
   * 从本地存储加载历史记录
   */
  loadHistoryFromLocalStorage() {
    try {
      this.waterBillHistory = this.loadHistoryFromStorage('waterBillHistory');
      this.electricityBillHistory = this.loadHistoryFromStorage('electricityBillHistory');
      console.log(`✅ Loaded ${this.waterBillHistory.length} water bills and ${this.electricityBillHistory.length} electricity bills from localStorage`);
    } catch (error) {
      console.error('❌ Failed to load history from localStorage:', error);
      this.waterBillHistory = [];
      this.electricityBillHistory = [];
    }
  }

  /**
   * 从本地存储加载特定类型的历史记录
   * @param {string} storageKey - 存储键名
   * @returns {Array} 历史记录列表
   */
  loadHistoryFromStorage(storageKey) {
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
      return this.processHistoryItems(validItems);
    } catch (error) {
      console.error(`❌ 从本地存储加载${storageKey}失败:`, error);
      return [];
    }
  }

  /**
   * 处理历史记录项，转换日期范围等
   * @param {Array} items - 历史记录项列表
   * @returns {Array} 处理后的历史记录列表
   */
  processHistoryItems(items) {
    if (!Array.isArray(items)) return [];
    
    return items.map(item => {
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
  }

  /**
   * 保存历史记录到本地存储
   */
  saveToLocalStorage() {
    try {
      localStorage.setItem('waterBillHistory', JSON.stringify(this.waterBillHistory));
      localStorage.setItem('electricityBillHistory', JSON.stringify(this.electricityBillHistory));
      console.log("✅ History saved to localStorage");
    } catch (error) {
      console.error('❌ 保存历史记录到本地存储失败:', error);
    }
  }

  /**
   * 保存历史记录（选择API或localStorage）
   */
  async saveHistory() {
    // If using localStorage mode, always save to localStorage regardless of other operations
    if (!this.useCloud) {
      this.saveToLocalStorage();
      return;
    }
    
    // If we're here, we're in cloud mode - but we'll still save to localStorage as backup
    try {
      this.saveToLocalStorage();
    } catch (error) {
      console.error('Failed to save backup to localStorage:', error);
    }
  }

  /**
   * 添加水费记录
   * @param {Object} waterBillResult - 水费计算结果
   * @returns {Object} 添加的记录
   */
  async addWaterBillHistory(waterBillResult) {
    // 确保记录有唯一ID
    if (!waterBillResult.id) {
      waterBillResult.id = uuidv4();
    }
    
    // 确保记录有时间戳
    if (!waterBillResult.date) {
      waterBillResult.date = new Date().toISOString();
    }
    
    // 添加记录到本地数组
    this.waterBillHistory.unshift(waterBillResult);
    
    // 如果使用云端API，则调用API添加记录
    if (this.useCloud) {
      try {
        await APIService.addWaterBillRecord(waterBillResult);
      } catch (error) {
        console.error('Failed to add water bill to API:', error);
        // API失败不影响本地存储，继续执行
      }
    }
    
    // 无论如何都保存到本地存储作为备份
    await this.saveHistory();
    
    return waterBillResult;
  }

  /**
   * 添加电费记录
   * @param {Object} electricityBillResult - 电费计算结果
   * @returns {Object} 添加的记录
   */
  async addElectricityBillHistory(electricityBillResult) {
    // 确保记录有唯一ID
    if (!electricityBillResult.id) {
      electricityBillResult.id = uuidv4();
    }
    
    // 确保记录有时间戳
    if (!electricityBillResult.date) {
      electricityBillResult.date = new Date().toISOString();
    }
    
    // 添加记录到本地数组
    this.electricityBillHistory.unshift(electricityBillResult);
    
    // 如果使用云端API，则调用API添加记录
    if (this.useCloud) {
      try {
        await APIService.addElectricityBillRecord(electricityBillResult);
      } catch (error) {
        console.error('Failed to add electricity bill to API:', error);
        // API失败不影响本地存储，继续执行
      }
    }
    
    // 无论如何都保存到本地存储作为备份
    await this.saveHistory();
    
    return electricityBillResult;
  }

  /**
   * 删除水费记录
   * @param {string} id - 记录ID
   * @returns {boolean} 是否成功删除
   */
  async deleteWaterBillHistory(id) {
    const initialLength = this.waterBillHistory.length;
    
    // 从本地数组中删除
    this.waterBillHistory = this.waterBillHistory.filter(bill => bill.id !== id);
    
    if (this.waterBillHistory.length !== initialLength) {
      // 如果使用云端API，则调用API删除记录
      if (this.useCloud) {
        try {
          await APIService.deleteWaterBillRecord(id);
        } catch (error) {
          console.error(`Failed to delete water bill record ${id} from API:`, error);
          // API失败不影响本地操作，继续执行
        }
      }
      
      // 保存更新后的历史记录
      await this.saveHistory();
      return true;
    }
    
    return false;
  }

  /**
   * 删除电费记录
   * @param {string} id - 记录ID
   * @returns {boolean} 是否成功删除
   */
  async deleteElectricityBillHistory(id) {
    const initialLength = this.electricityBillHistory.length;
    
    // 从本地数组中删除
    this.electricityBillHistory = this.electricityBillHistory.filter(bill => bill.id !== id);
    
    if (this.electricityBillHistory.length !== initialLength) {
      // 如果使用云端API，则调用API删除记录
      if (this.useCloud) {
        try {
          await APIService.deleteElectricityBillRecord(id);
        } catch (error) {
          console.error(`Failed to delete electricity bill record ${id} from API:`, error);
          // API失败不影响本地操作，继续执行
        }
      }
      
      // 保存更新后的历史记录
      await this.saveHistory();
      return true;
    }
    
    return false;
  }

  /**
   * 清空所有历史记录
   */
  async clearAllHistory() {
    this.waterBillHistory = [];
    this.electricityBillHistory = [];
    
    // 如果使用云端API，则调用API清空所有记录
    if (this.useCloud) {
      try {
        await APIService.clearAllHistory();
      } catch (error) {
        console.error('Failed to clear history in API:', error);
        // API失败不影响本地操作，继续执行
      }
    }
    
    // 保存空历史记录
    await this.saveHistory();
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

  /**
   * 检查是否正在加载数据
   * @returns {boolean} 是否正在加载
   */
  isLoadingData() {
    return this.isLoading;
  }

  /**
   * 检查是否使用云端数据存储
   * @returns {boolean} 是否使用云端存储
   */
  isUsingCloud() {
    return this.useCloud;
  }
}