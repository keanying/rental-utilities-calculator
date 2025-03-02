/**
 * DateRange.js
 * 日期范围模型，用于处理和计算日期区间
 */
export class DateRange {
  /**
   * 创建日期范围对象
   * @param {Date|string} startDate - 开始日期
   * @param {Date|string} endDate - 结束日期
   */
  constructor(startDate, endDate) {
    this.startDate = startDate instanceof Date ? startDate : new Date(startDate);
    this.endDate = endDate instanceof Date ? endDate : new Date(endDate);
    
    // 确保开始日期不晚于结束日期
    if (this.startDate > this.endDate) {
      throw new Error('开始日期不能晚于结束日期');
    }
  }

  /**
   * 计算日期范围内的天数
   * @returns {number} 天数
   */
  getDays() {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    // return Math.round((this.endDate - this.startDate) / millisecondsPerDay) + 1; // 包含首尾两天
    return Math.round((this.endDate - this.startDate) / millisecondsPerDay);
  }

  /**
   * 格式化日期范围为字符串
   * @returns {string} 格式化的日期范围字符串
   */
  toFormattedString() {
    const formatDate = (date) => {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return `${formatDate(this.startDate)} 至 ${formatDate(this.endDate)}`;
  }

  /**
   * 检查指定日期是否在此范围内
   * @param {Date} date - 要检查的日期
   * @returns {boolean} 是否在范围内
   */
  containsDate(date) {
    const checkDate = date instanceof Date ? date : new Date(date);
    return checkDate >= this.startDate && checkDate <= this.endDate;
  }

  /**
   * 计算两个日期范围的重叠天数
   * @param {DateRange} otherRange - 另一个日期范围
   * @returns {number} 重叠天数，如果没有重叠则返回0
   */
  getOverlapDays(otherRange) {
    // 如果没有重叠，则返回0
    if (this.endDate < otherRange.startDate || this.startDate > otherRange.endDate) {
      return 0;
    }
    
    // 计算重叠部分的开始和结束日期
    const overlapStart = this.startDate > otherRange.startDate ? this.startDate : otherRange.startDate;
    const overlapEnd = this.endDate < otherRange.endDate ? this.endDate : otherRange.endDate;
    
    // 计算重叠天数
    const overlapRange = new DateRange(overlapStart, overlapEnd);
    return overlapRange.getDays();
  }

  /**
   * 将对象转换为JSON
   * @returns {Object} 对象的JSON表示
   */
  toJSON() {
    return {
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString()
    };
  }

  /**
   * 从JSON创建DateRange对象
   * @param {Object} json - JSON对象
   * @returns {DateRange} DateRange实例
   */
  static fromJSON(json) {
    return new DateRange(new Date(json.startDate), new Date(json.endDate));
  }
}