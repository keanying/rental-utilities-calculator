/**
 * WaterBill.js
 * 水费账单模型，用于计算水费分摊
 */
import { v4 as uuidv4 } from 'uuid';
import { DateRange } from './DateRange';
import { Room } from './Room';

export class WaterBill {
  /**
   * 创建水费账单对象
   * @param {DateRange} quarterRange - 季度日期范围
   * @param {number} totalAmount - 总金额
   * @param {Array<Room>} rooms - 房间列表
   */
  constructor(quarterRange, totalAmount, rooms = []) {
    this.id = uuidv4();
    this.quarterRange = quarterRange instanceof DateRange ? quarterRange : new DateRange(quarterRange.startDate, quarterRange.endDate);
    this.totalAmount = parseFloat(totalAmount);
    this.rooms = rooms.map(room => 
      room instanceof Room ? room : new Room(room.id, room.name, room.residents, room.dateRange)
    );
    this.date = new Date();
  }

  /**
   * 计算水费分摊
   * @returns {Object} 计算结果
   */
  calculate() {
    // 获取计费季度的总天数
    const billTotalDays = this.quarterRange.getDays();
    
    // 计算所有住户在季度内的总居住天数
    let totalResidentDays = 0;
    const allResidents = this.getAllResidents();
    
    allResidents.forEach(resident => {
      resident.days = resident.getDaysInRange(this.quarterRange);
      totalResidentDays += resident.days;
    });

    // 计算每个住户的分摊比例和应付金额
    const roomResults = [];
    
    this.rooms.forEach(room => {
      const residentResults = [];
      
      room.residents.forEach(resident => {
        const days = resident.getDaysInRange(this.quarterRange);
        const shareRatio = totalResidentDays > 0 ? days / totalResidentDays : 0;
        const amountToPay = this.totalAmount * shareRatio;
        
        residentResults.push({
          residentId: resident.id,
          residentName: resident.name,
          dateRange: resident.dateRange,
          days: days,
          shareRatio: shareRatio,
          amountToPay: parseFloat(amountToPay.toFixed(2))
        });
      });
      
      if (residentResults.length > 0) {
        roomResults.push({
          roomId: room.id,
          roomName: room.name,
          residentResults: residentResults
        });
      }
    });

    return {
      id: this.id,
      date: this.date,
      quarterRange: this.quarterRange,
      totalAmount: this.totalAmount,
      roomResults: roomResults
    };
  }

  /**
   * 获取所有住户列表
   * @returns {Array<Resident>} 所有住户
   */
  getAllResidents() {
    const residents = [];
    this.rooms.forEach(room => {
      room.residents.forEach(resident => {
        residents.push(resident);
      });
    });
    return residents;
  }

  /**
   * 将对象转换为JSON
   * @returns {Object} 对象的JSON表示
   */
  toJSON() {
    return {
      id: this.id,
      date: this.date.toISOString(),
      quarterRange: this.quarterRange.toJSON(),
      totalAmount: this.totalAmount,
      rooms: this.rooms.map(room => room.toJSON())
    };
  }

  /**
   * 从JSON创建WaterBill对象
   * @param {Object} json - JSON对象
   * @returns {WaterBill} WaterBill实例
   */
  static fromJSON(json) {
    const bill = new WaterBill(
      DateRange.fromJSON(json.quarterRange),
      json.totalAmount,
      json.rooms.map(roomJson => Room.fromJSON(roomJson))
    );
    
    bill.id = json.id;
    bill.date = new Date(json.date);
    
    return bill;
  }
}