import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并Tailwind类名工具函数
 * @param {...any} inputs 要合并的类名
 * @returns {string} 合并后的类名
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化货币金额
 * @param {number} amount 金额
 * @param {string} currency 货币符号(默认为¥)
 * @returns {string} 格式化后的金额字符串
 */
export function formatCurrency(amount, currency = "¥") {
  if (amount === undefined || amount === null) return "";
  
  return `${currency}${parseFloat(amount).toFixed(2)}`;
}

/**
 * 格式化日期为字符串
 * @param {Date|string} date 日期对象或日期字符串
 * @param {Object} options 格式化选项
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, options = {}) {
  if (!date) return "";
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const defaultOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  
  return dateObj.toLocaleDateString('zh-CN', { ...defaultOptions, ...options });
}

/**
 * 计算两个日期之间的天数
 * @param {Date|string} startDate 开始日期
 * @param {Date|string} endDate 结束日期
 * @returns {number} 天数
 */
export function daysBetween(startDate, endDate) {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  // 清除时间部分，只保留日期
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // 计算毫秒差并转换为天数
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1; // 包括首尾两天
}

/**
 * 生成指定长度的随机ID
 * @param {number} length ID长度
 * @returns {string} 随机ID
 */
export function generateId(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
}