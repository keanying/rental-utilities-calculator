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
  
  // 初始化历史记录管理器
  useEffect(() => {
    const manager = new HistoryManager();
    setHistoryManager(manager);
    setWaterBillHistory(manager.getWaterBillHistory());
    setElectricityBillHistory(manager.getElectricityBillHistory());
  }, []);
  
  /**
   * 添加水费计算结果到历史记录
   * @param {Object} result - 水费计算结果
   */
  const addWaterBillHistory = (result) => {
    if (!historyManager) return;
    
    try {
      const addedResult = historyManager.addWaterBillHistory(result);
      setWaterBillHistory(historyManager.getWaterBillHistory());
      return addedResult;
    } catch (error) {
      console.error('添加水费历史记录失败:', error);
      toast.error('保存历史记录失败');
    }
  };
  
  /**
   * 添加电费计算结果到历史记录
   * @param {Object} result - 电费计算结果
   */
  const addElectricityBillHistory = (result) => {
    if (!historyManager) return;
    
    try {
      const addedResult = historyManager.addElectricityBillHistory(result);
      setElectricityBillHistory(historyManager.getElectricityBillHistory());
      return addedResult;
    } catch (error) {
      console.error('添加电费历史记录失败:', error);
      toast.error('保存历史记录失败');
    }
  };
  
  /**
   * 删除水费历史记录
   * @param {string} id - 记录ID
   */
  const deleteWaterBillHistory = (id) => {
    if (!historyManager) return;
    
    try {
      const success = historyManager.deleteWaterBillHistory(id);
      if (success) {
        setWaterBillHistory(historyManager.getWaterBillHistory());
      }
      return success;
    } catch (error) {
      console.error('删除水费历史记录失败:', error);
      toast.error('删除历史记录失败');
    }
  };
  
  /**
   * 删除电费历史记录
   * @param {string} id - 记录ID
   */
  const deleteElectricityBillHistory = (id) => {
    if (!historyManager) return;
    
    try {
      const success = historyManager.deleteElectricityBillHistory(id);
      if (success) {
        setElectricityBillHistory(historyManager.getElectricityBillHistory());
      }
      return success;
    } catch (error) {
      console.error('删除电费历史记录失败:', error);
      toast.error('删除历史记录失败');
    }
  };
  
  /**
   * 清空所有历史记录
   */
  const clearAllHistory = () => {
    if (!historyManager) return;
    
    try {
      historyManager.clearAllHistory();
      setWaterBillHistory([]);
      setElectricityBillHistory([]);
      toast.success('已清空所有历史记录');
    } catch (error) {
      console.error('清空历史记录失败:', error);
      toast.error('清空历史记录失败');
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
    clearAllHistory
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