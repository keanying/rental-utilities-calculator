import React, { createContext, useContext, useState, useEffect } from 'react';
import { HistoryManager } from '../models/HistoryManager';
import { toast } from 'sonner';

// 创建应用上下文
const AppContext = createContext();

// 上下文提供者组件
export const AppProvider = ({ children }) => {
  // 初始化历史记录管理器
  const [historyManager, setHistoryManager] = useState(null);
  
  // 水费和电费历史记录
  const [waterBillHistory, setWaterBillHistory] = useState([]);
  const [electricityBillHistory, setElectricityBillHistory] = useState([]);
  
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  // 数据源状态（本地存储或云端API）
  const [dataSource, setDataSource] = useState('loading');
  
  // 初始化历史记录管理器
  useEffect(() => {
    const initializeHistoryManager = async () => {
      setIsLoading(true);
      try {
        const manager = new HistoryManager();
        setHistoryManager(manager);
        
        // 等待初始化完成
        const checkInitStatus = () => {
          if (!manager.isLoadingData()) {
            setWaterBillHistory(manager.getWaterBillHistory());
            setElectricityBillHistory(manager.getElectricityBillHistory());
            setIsLoading(false);
            
            const usingCloud = manager.isUsingCloud();
            setDataSource(usingCloud ? 'cloud' : 'localStorage');
            
            // if (usingCloud) {
            //   toast.success('已连接到云端数据库');
            // } else {
            //   toast.warning('使用本地存储模式');
            // }
            return;
          }
          
          // 如果还在加载，稍后再检查
          setTimeout(checkInitStatus, 500);
        };
        
        checkInitStatus();
      } catch (error) {
        console.error('初始化历史记录管理器失败:', error);
        setIsLoading(false);
        setDataSource('localStorage');
        toast.error('连接云端数据库失败，使用本地存储模式');
      }
    };
    
    initializeHistoryManager();
  }, []);
  
  /**
   * 添加水费计算结果到历史记录
   * @param {Object} result - 水费计算结果
   */
  const addWaterBillHistory = async (result) => {
    if (!historyManager) return;
    
    try {
      setIsLoading(true);
      const addedResult = await historyManager.addWaterBillHistory(result);
      setWaterBillHistory(historyManager.getWaterBillHistory());
      setIsLoading(false);
      toast.success('水费记录已保存');
      return addedResult;
    } catch (error) {
      console.error('添加水费历史记录失败:', error);
      toast.error('保存历史记录失败');
      setIsLoading(false);
    }
  };
  
  /**
   * 添加电费计算结果到历史记录
   * @param {Object} result - 电费计算结果
   */
  const addElectricityBillHistory = async (result) => {
    if (!historyManager) return;
    
    try {
      setIsLoading(true);
      const addedResult = await historyManager.addElectricityBillHistory(result);
      setElectricityBillHistory(historyManager.getElectricityBillHistory());
      setIsLoading(false);
      toast.success('电费记录已保存');
      return addedResult;
    } catch (error) {
      console.error('添加电费历史记录失败:', error);
      toast.error('保存历史记录失败');
      setIsLoading(false);
    }
  };
  
  /**
   * 删除水费历史记录
   * @param {string} id - 记录ID
   */
  const deleteWaterBillHistory = async (id) => {
    if (!historyManager) return;
    
    try {
      setIsLoading(true);
      const success = await historyManager.deleteWaterBillHistory(id);
      if (success) {
        setWaterBillHistory(historyManager.getWaterBillHistory());
        toast.success('删除记录成功');
      } else {
        toast.error('删除记录失败');
      }
      setIsLoading(false);
      return success;
    } catch (error) {
      console.error('删除水费历史记录失败:', error);
      toast.error('删除历史记录失败');
      setIsLoading(false);
    }
  };
  
  /**
   * 删除电费历史记录
   * @param {string} id - 记录ID
   */
  const deleteElectricityBillHistory = async (id) => {
    if (!historyManager) return;
    
    try {
      setIsLoading(true);
      const success = await historyManager.deleteElectricityBillHistory(id);
      if (success) {
        setElectricityBillHistory(historyManager.getElectricityBillHistory());
        toast.success('删除记录成功');
      } else {
        toast.error('删除记录失败');
      }
      setIsLoading(false);
      return success;
    } catch (error) {
      console.error('删除电费历史记录失败:', error);
      toast.error('删除历史记录失败');
      setIsLoading(false);
    }
  };
  
  /**
   * 清空所有历史记录
   */
  const clearAllHistory = async () => {
    if (!historyManager) return;
    
    try {
      setIsLoading(true);
      await historyManager.clearAllHistory();
      setWaterBillHistory([]);
      setElectricityBillHistory([]);
      setIsLoading(false);
      toast.success('已清空所有历史记录');
    } catch (error) {
      console.error('清空历史记录失败:', error);
      toast.error('清空历史记录失败');
      setIsLoading(false);
    }
  };
  
  // 提供的上下文值
  const contextValue = {
    waterBillHistory,
    electricityBillHistory,
    addWaterBillHistory,
    addElectricityBillHistory,
    deleteWaterBillHistory,
    deleteElectricityBillHistory,
    clearAllHistory,
    isLoading,
    dataSource
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// 自定义Hook，用于在组件中访问上下文
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;