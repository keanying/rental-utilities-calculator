/**
 * Resident.js
 * 住户模型，表示租房的居住者
 */
import { v4 as uuidv4 } from 'uuid';
import { DateRange } from './DateRange';

export class Resident {
  /**
   * 创建住户对象
   * @param {string} id - 住户ID，如未提供则自动生成
   * @param {string} name - 住户姓名
   * @param {DateRange} dateRange - 住户居住日期范围
   */
  constructor(id, name, dateRange) {
    this.id = id || uuidv4();
    this.name = name;
    this.dateRange = dateRange instanceof DateRange ? dateRange : new DateRange(dateRange.startDate, dateRange.endDate);
  }

  /**
   * 获取住户居住天数
   * @returns {number} 居住天数
   */
  getDays() {
    return this.dateRange.getDays();
  }

  /**
   * 计算住户在指定日期范围内的居住天数
   * @param {DateRange} billRange - 账单日期范围
   * @returns {number} 指定范围内的居住天数
   */
  getDaysInRange(billRange) {
    return this.dateRange.getOverlapDays(billRange);
  }

  /**
   * 计算住户在指定账单日期范围内的分摊比例
   * @param {DateRange} billRange - 账单日期范围
   * @param {number} totalResidentDays - 所有住户的总居住天数
   * @returns {number} 分摊比例(0-1)
   */
  calculateShareRatio(billRange, totalResidentDays) {
    if (totalResidentDays <= 0) return 0;
    
    const daysInBillRange = this.getDaysInRange(billRange);
    return daysInBillRange / totalResidentDays;
  }

  /**
   * 将对象转换为JSON
   * @returns {Object} 对象的JSON表示
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      dateRange: this.dateRange.toJSON()
    };
  }

  /**
   * 从JSON创建Resident对象
   * @param {Object} json - JSON对象
   * @returns {Resident} Resident实例
   */
  static fromJSON(json) {
    return new Resident(
      json.id,
      json.name,
      DateRange.fromJSON(json.dateRange)
    );
  }
}