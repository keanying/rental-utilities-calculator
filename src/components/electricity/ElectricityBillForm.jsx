import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, PlusCircle } from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import DateRangePicker from '../common/DateRangePicker';
import { cn } from '../../lib/utils';
import { DateRange } from '../../models/DateRange';
import { ElectricityBill } from '../../models/ElectricityBill';
import { Room } from '../../models/Room';

const ElectricityBillForm = ({ onSubmit, isCalculating }) => {
  const { register, control, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    defaultValues: {
      quarterName: formatCurrentQuarter(),
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      totalAmount: '',
      rooms: [
        {
          id: uuidv4(),
          name: '房间A',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          hasPaid: false
        }
      ]
    }
  });

  const { fields: roomFields, append: appendRoom, remove: removeRoom } = useFieldArray({
    control,
    name: 'rooms'
  });

  // 格式化当前季度名称
  function formatCurrentQuarter() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    let quarter = '';
    
    if (month <= 3) quarter = `${year}年第一季度`;
    else if (month <= 6) quarter = `${year}年第二季度`;
    else if (month <= 9) quarter = `${year}年第三季度`;
    else quarter = `${year}年第四季度`;
    
    return quarter;
  }

  const handleAddRoom = () => {
    appendRoom({
      id: uuidv4(),
      name: `房间${String.fromCharCode(65 + roomFields.length % 26)}`,
      startDate: watch('startDate'),
      endDate: watch('endDate'),
      hasPaid: false
    });
  };

  const onSubmitForm = (data) => {
    try {
      // 验证总金额
      const totalAmount = parseFloat(data.totalAmount);
      if (isNaN(totalAmount) || totalAmount <= 0) {
        toast.error('请输入有效的电费总金额');
        return;
      }
      
      // 验证日期范围
      const billStartDate = new Date(data.startDate);
      const billEndDate = new Date(data.endDate);
      
      if (billStartDate > billEndDate) {
        toast.error('账单开始日期不能晚于结束日期');
        return;
      }
      
      // 创建季度日期范围对象
      const quarterRange = new DateRange(billStartDate, billEndDate);
      
      // 构建房间对象
      const rooms = data.rooms.map(roomData => {
        const startDate = new Date(roomData.startDate);
        const endDate = new Date(roomData.endDate);
        
        if (startDate > endDate) {
          throw new Error(`房间 ${roomData.name} 的使用起始日期不能晚于结束日期`);
        }
        
        // 检查房间日期是否在账单日期范围内
        if (startDate < billStartDate) {
          toast.warning(`房间 ${roomData.name} 的使用起始日期早于账单开始日期，将使用账单开始日期计算`);
        }
        
        if (endDate > billEndDate) {
          toast.warning(`房间 ${roomData.name} 的使用结束日期晚于账单结束日期，将使用账单结束日期计算`);
        }
        
        const effectiveStartDate = startDate < billStartDate ? billStartDate : startDate;
        const effectiveEndDate = endDate > billEndDate ? billEndDate : endDate;
        
        const dateRange = new DateRange(effectiveStartDate, effectiveEndDate);
        return new Room(roomData.id, roomData.name, [], dateRange);
      });
      
      // 获取已缴费的房间ID列表
      const paidRooms = data.rooms
        .filter(roomData => roomData.hasPaid)
        .map(roomData => roomData.id);
        
      // 创建电费账单对象
      const electricityBill = new ElectricityBill(quarterRange, totalAmount, rooms, paidRooms);
      
      // 计算结果
      const result = electricityBill.calculate();
      
      // 提交计算结果
      onSubmit(result);
    } catch (error) {
      toast.error(`计算错误: ${error.message}`);
      console.error('计算错误:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="quarterName">季度名称</Label>
            <Input
              id="quarterName"
              {...register('quarterName', { required: '请输入季度名称' })}
              placeholder="例如：2023年第一季度"
              className="mt-1"
            />
            {errors.quarterName && (
              <p className="text-sm font-medium text-destructive mt-1">{errors.quarterName.message}</p>
            )}
          </div>
          
          <div>
            <Label>账单日期范围</Label>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field: endDateField }) => (
                    <DateRangePicker
                      startDate={field.value}
                      endDate={endDateField.value}
                      onStartDateChange={(date) => field.onChange(date.toISOString().split('T')[0])}
                      onEndDateChange={(date) => endDateField.onChange(date.toISOString().split('T')[0])}
                      className="mt-1"
                    />
                  )}
                />
              )}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="totalAmount">电费总金额 (元)</Label>
          <Input
            id="totalAmount"
            type="number"
            step="0.01"
            min="0"
            {...register('totalAmount', { 
              required: '请输入电费总金额',
              min: { value: 0, message: '金额必须大于0' }
            })}
            placeholder="例如：120.50"
            className="mt-1"
          />
          {errors.totalAmount && (
            <p className="text-sm font-medium text-destructive mt-1">{errors.totalAmount.message}</p>
          )}
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">房间使用情况</h3>
          <Button type="button" variant="outline" onClick={handleAddRoom} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            添加房间
          </Button>
        </div>
        
        {roomFields.map((room, roomIndex) => (
          <Card key={room.id} className="overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`rooms.${roomIndex}.name`}>房间名称</Label>
                  <Input
                    id={`rooms.${roomIndex}.name`}
                    {...register(`rooms.${roomIndex}.name`, { required: true })}
                    className="w-32 sm:w-64"
                  />
                </div>
                {roomFields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeRoom(roomIndex)}
                    className="gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    删除房间
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>房间使用日期范围</Label>
                  <Controller
                    control={control}
                    name={`rooms.${roomIndex}.startDate`}
                    render={({ field }) => (
                      <Controller
                        control={control}
                        name={`rooms.${roomIndex}.endDate`}
                        render={({ field: endDateField }) => (
                          <DateRangePicker
                            startDate={field.value}
                            endDate={endDateField.value}
                            onStartDateChange={(date) => field.onChange(date.toISOString().split('T')[0])}
                            onEndDateChange={(date) => endDateField.onChange(date.toISOString().split('T')[0])}
                            className="mt-1"
                          />
                        )}
                      />
                    )}
                  />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Controller
                    control={control}
                    name={`rooms.${roomIndex}.hasPaid`}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`rooms.${roomIndex}.hasPaid`}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor={`rooms.${roomIndex}.hasPaid`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          此房间已缴纳电费
                        </Label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <Button 
          type="button" 
          onClick={handleSubmit(onSubmitForm)}
          disabled={isCalculating} 
          className="gap-2 w-full md:w-1/2 py-4 text-lg font-bold bg-blue-100 hover:bg-blue-200 text-black rounded-full shadow-md hover:scale-105 transition-transform duration-200"
        >
          {isCalculating ? '计算中...' : '立即计算'}
        </Button>
      </div>
    </div>
  );
};

export default ElectricityBillForm;