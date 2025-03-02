/**
 * ElectricityBill.js
 * 电费账单模型，用于计算电费分摊
 */
import { v4 as uuidv4 } from 'uuid';
import { DateRange } from './DateRange';
import { Room } from './Room';

export class ElectricityBill {
  /**
   * 创建电费账单对象
   * @param {DateRange} quarterRange - 季度日期范围
   * @param {number} totalAmount - 总金额
   * @param {Array<Room>} rooms - 房间列表
   * @param {Array<String>} paidRooms - 已经缴费的房间ID列表
   */
  constructor(quarterRange, totalAmount, rooms = [], paidRooms = []) {
    this.id = uuidv4();
    this.quarterRange = quarterRange instanceof DateRange ? quarterRange : new DateRange(quarterRange.startDate, quarterRange.endDate);
    this.totalAmount = parseFloat(totalAmount);
    this.rooms = rooms.map(room => 
      room instanceof Room ? room : new Room(room.id, room.name, room.residents, room.dateRange)
    );
    this.paidRooms = paidRooms;
    this.date = new Date();
  }

  /**
   * 计算电费分摊
   * @returns {Object} 计算结果
   */
  calculate() {
    // 获取计费季度的总天数
    const billTotalDays = this.quarterRange.getDays();
    
    // 计算所有房间在季度内的总使用天数
    let totalRoomDays = 0;
    
    this.rooms.forEach(room => {
      room.days = room.getDaysInRange(this.quarterRange);
      totalRoomDays += room.days;
    });

    // 计算每个房间的分摊比例和应付金额
    const roomResults = this.rooms.map(room => {
      const shareRatio = totalRoomDays > 0 ? room.days / totalRoomDays : 0;
      const amountToPay = this.totalAmount * shareRatio;
      const hasPaid = this.paidRooms.includes(room.id);
      
      return {
        roomId: room.id,
        roomName: room.name,
        dateRange: room.dateRange,
        days: room.days,
        shareRatio: shareRatio,
        amountToPay: parseFloat(amountToPay.toFixed(2)),
        hasPaid: hasPaid
      };
    });

    // 计算需要补偿的金额
    // 如果有已付款房间，其他房间需要向已付款房间补偿
    const compensation = [];
    
    if (this.paidRooms.length > 0 && this.paidRooms.length < this.rooms.length) {
      // 找出所有已付款房间
      const paidRoomResults = roomResults.filter(r => r.hasPaid);
      const unpaidRoomResults = roomResults.filter(r => !r.hasPaid);
      
      // 对于每个未付款的房间，按其应付金额向已付款房间进行补偿
      unpaidRoomResults.forEach(unpaidRoom => {
        // 获取未付款房间的应付金额
        const amountToPay = unpaidRoom.amountToPay;
        
        // 计算每个已付款房间应得到的补偿金额（未付款房间的金额平均分配）
        const compensationPerPaidRoom = amountToPay / paidRoomResults.length;
        
        // 获取未付款房间的日期范围
        const unpaidRoomObj = this.rooms.find(r => r.id === unpaidRoom.roomId);
        const unpaidRoomDateRange = unpaidRoomObj.dateRange;
        
        // 对每个已付款的房间进行补偿
        paidRoomResults.forEach(paidRoom => {
          // 获取已付款房间的日期范围
          const paidRoomObj = this.rooms.find(r => r.id === paidRoom.roomId);
          const paidRoomDateRange = paidRoomObj.dateRange;
          
          // 计算两个日期范围的重叠部分
          const overlapStart = new Date(Math.max(
            unpaidRoomDateRange.startDate.getTime(),
            paidRoomDateRange.startDate.getTime()
          ));
          
          const overlapEnd = new Date(Math.min(
            unpaidRoomDateRange.endDate.getTime(),
            paidRoomDateRange.endDate.getTime()
          ));
          
          // 如果存在重叠
          if (overlapStart <= overlapEnd) {
            // 计算重叠天数
            const overlapDays = Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
            
            // 计算需要补偿的金额
            const compensationAmount = compensationPerPaidRoom;
            
            if (compensationAmount > 0) {
              compensation.push({
                fromRoomId: unpaidRoom.roomId,
                fromRoomName: unpaidRoom.roomName,
                toRoomId: paidRoom.roomId,
                toRoomName: paidRoom.roomName,
                amount: parseFloat(compensationAmount.toFixed(2)),
                overlapDays: overlapDays,
                overlapStartDate: overlapStart,
                overlapEndDate: overlapEnd
              });
            }
          }
        });
      });
    }

    return {
      id: this.id,
      date: this.date,
      quarterRange: this.quarterRange,
      totalAmount: this.totalAmount,
      roomResults: roomResults,
      paidRooms: this.paidRooms,
      compensation: compensation
    };
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
      rooms: this.rooms.map(room => room.toJSON()),
      paidRooms: this.paidRooms
    };
  }

  /**
   * 从JSON创建ElectricityBill对象
   * @param {Object} json - JSON对象
   * @returns {ElectricityBill} ElectricityBill实例
   */
  static fromJSON(json) {
    const bill = new ElectricityBill(
      DateRange.fromJSON(json.quarterRange),
      json.totalAmount,
      json.rooms.map(roomJson => Room.fromJSON(roomJson)),
      json.paidRooms || []
    );
    
    bill.id = json.id;
    bill.date = new Date(json.date);
    
    return bill;
  }
}