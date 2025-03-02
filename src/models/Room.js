/**
 * Room.js
 * 房间模型，包含房间信息及其住户
 */
import { v4 as uuidv4 } from 'uuid';
import { DateRange } from './DateRange';
import { Resident } from './Resident';

export class Room {
  /**
   * 创建房间对象
   * @param {string} id - 房间ID，如未提供则自动生成
   * @param {string} name - 房间名称
   * @param {Array<Resident>} residents - 住户列表
   * @param {DateRange} [dateRange=null] - 房间使用日期范围，如未提供则根据住户计算
   */
  constructor(id, name, residents = [], dateRange = null) {
    this.id = id || uuidv4();
    this.name = name;
    this.residents = residents.map(resident => 
      resident instanceof Resident ? resident : new Resident(resident.id, resident.name, resident.dateRange)
    );
    
    // 如果提供了日期范围，使用提供的范围；否则根据住户计算日期范围
    if (dateRange) {
      this.dateRange = dateRange instanceof DateRange ? dateRange : new DateRange(dateRange.startDate, dateRange.endDate);
    } else if (residents.length > 0) {
      this.calculateDateRangeFromResidents();
    } else {
      // 如果没有住户且没有提供日期范围，创建一个默认范围
      const today = new Date();
      this.dateRange = new DateRange(today, today);
    }
  }

  /**
   * 根据住户计算房间使用日期范围
   */
  calculateDateRangeFromResidents() {
    if (this.residents.length === 0) return;
    
    // 找到最早的入住日期和最晚的退房日期
    let earliestDate = new Date(this.residents[0].dateRange.startDate);
    let latestDate = new Date(this.residents[0].dateRange.endDate);
    
    for (const resident of this.residents) {
      const startDate = new Date(resident.dateRange.startDate);
      const endDate = new Date(resident.dateRange.endDate);
      
      if (startDate < earliestDate) {
        earliestDate = startDate;
      }
      
      if (endDate > latestDate) {
        latestDate = endDate;
      }
    }
    
    this.dateRange = new DateRange(earliestDate, latestDate);
  }

  /**
   * 获取房间使用天数
   * @returns {number} 使用天数
   */
  getDays() {
    return this.dateRange.getDays();
  }

  /**
   * 计算房间在指定日期范围内的使用天数
   * @param {DateRange} billRange - 账单日期范围
   * @returns {number} 指定范围内的使用天数
   */
  getDaysInRange(billRange) {
    return this.dateRange.getOverlapDays(billRange);
  }

  /**
   * 添加住户
   * @param {Resident} resident - 要添加的住户
   */
  addResident(resident) {
    this.residents.push(resident instanceof Resident ? resident : new Resident(resident.id, resident.name, resident.dateRange));
    this.calculateDateRangeFromResidents();
  }

  /**
   * 移除住户
   * @param {string} residentId - 要移除的住户ID
   * @returns {boolean} 是否成功移除
   */
  removeResident(residentId) {
    const initialLength = this.residents.length;
    this.residents = this.residents.filter(resident => resident.id !== residentId);
    
    if (this.residents.length !== initialLength) {
      this.calculateDateRangeFromResidents();
      return true;
    }
    
    return false;
  }

  /**
   * 将对象转换为JSON
   * @returns {Object} 对象的JSON表示
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      residents: this.residents.map(resident => resident.toJSON()),
      dateRange: this.dateRange.toJSON()
    };
  }

  /**
   * 从JSON创建Room对象
   * @param {Object} json - JSON对象
   * @returns {Room} Room实例
   */
  static fromJSON(json) {
    return new Room(
      json.id,
      json.name,
      json.residents.map(residentJson => Resident.fromJSON(residentJson)),
      DateRange.fromJSON(json.dateRange)
    );
  }
}