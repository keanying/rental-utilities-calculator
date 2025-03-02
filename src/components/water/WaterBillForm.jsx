import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, PlusCircle, User } from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import DateRangePicker from '../common/DateRangePicker';
import { cn } from '../../lib/utils';
import { DateRange } from '../../models/DateRange';
import { WaterBill } from '../../models/WaterBill';
import { Room } from '../../models/Room';
import { Resident } from '../../models/Resident';

const WaterBillForm = ({ onSubmit, isCalculating }) => {
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
          residents: [
            {
              id: uuidv4(),
              name: '住户1',
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0]
            }
          ]
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
      residents: [
        {
          id: uuidv4(),
          name: '住户1',
          startDate: watch('startDate'),
          endDate: watch('endDate')
        }
      ]
    });
  };

  const handleAddResident = (roomIndex) => {
    // 使用 useFieldArray 的API添加住户
    const residents = watch(`rooms.${roomIndex}.residents`) || [];
    const residentCount = residents.length + 1;
    
    // 使用数组操作插入新的居民
    const newResident = {
      id: uuidv4(),
      name: `住户${residentCount}`,
      startDate: watch('startDate'),
      endDate: watch('endDate')
    };
    
    // 更新表单数据
    const updatedResidents = [...residents, newResident];
    
    // 直接设置新值
    const path = `rooms.${roomIndex}.residents`;
    
    // 使用上面已经定义的 setValue 方法更新数组
    setValue(path, updatedResidents);
  };

  const handleRemoveResident = (roomIndex, residentIndex) => {
    const residents = watch(`rooms.${roomIndex}.residents`);
    
    if (residents.length <= 1) {
      toast.error('每个房间至少需要一位住户');
      return;
    }
    
    const updatedResidents = residents.filter((_, i) => i !== residentIndex);
    
    // 使用 setValue 正确更新表单数据
    setValue(`rooms.${roomIndex}.residents`, updatedResidents);
  };

  const onSubmitForm = (data) => {
    try {
      // 验证总金额
      const totalAmount = parseFloat(data.totalAmount);
      if (isNaN(totalAmount) || totalAmount <= 0) {
        toast.error('请输入有效的水费总金额');
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
      
      // 构建房间和住户对象
      const rooms = data.rooms.map(roomData => {
        // 验证住户
        if (!roomData.residents || roomData.residents.length === 0) {
          throw new Error(`房间 ${roomData.name} 没有住户`);
        }
        
        const residents = roomData.residents.map(residentData => {
          const startDate = new Date(residentData.startDate);
          const endDate = new Date(residentData.endDate);
          
          if (startDate > endDate) {
            throw new Error(`住户 ${residentData.name} 的入住日期不能晚于退房日期`);
          }
          
          // 检查住户日期是否在账单日期范围内
          if (startDate < billStartDate) {
            toast.warning(`住户 ${residentData.name} 的入住日期早于账单开始日期，将使用账单开始日期计算`);
          }
          
          if (endDate > billEndDate) {
            toast.warning(`住户 ${residentData.name} 的退房日期晚于账单结束日期，将使用账单结束日期计算`);
          }
          
          const effectiveStartDate = startDate < billStartDate ? billStartDate : startDate;
          const effectiveEndDate = endDate > billEndDate ? billEndDate : endDate;
          
          const dateRange = new DateRange(effectiveStartDate, effectiveEndDate);
          return new Resident(residentData.id, residentData.name, dateRange);
        });
        
        return new Room(roomData.id, roomData.name, residents);
      });
      
      // 创建水费账单对象
      const waterBill = new WaterBill(quarterRange, totalAmount, rooms);
      
      // 计算结果
      const result = waterBill.calculate();
      
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
          <Label htmlFor="totalAmount">水费总金额 (元)</Label>
          <Input
            id="totalAmount"
            type="number"
            step="0.01"
            min="0"
            {...register('totalAmount', { 
              required: '请输入水费总金额',
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
          <h3 className="text-lg font-medium">房间和住户信息</h3>
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
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddResident(roomIndex)}
                    className="gap-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    添加住户
                  </Button>
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
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                {watch(`rooms.${roomIndex}.residents`)?.map((resident, residentIndex) => (
                  <div key={resident.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <Label htmlFor={`rooms.${roomIndex}.residents.${residentIndex}.name`} className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        住户姓名
                      </Label>
                      <Input
                        id={`rooms.${roomIndex}.residents.${residentIndex}.name`}
                        {...register(`rooms.${roomIndex}.residents.${residentIndex}.name`, { required: true })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label>居住日期范围</Label>
                      <Controller
                        control={control}
                        name={`rooms.${roomIndex}.residents.${residentIndex}.startDate`}
                        render={({ field }) => (
                          <Controller
                            control={control}
                            name={`rooms.${roomIndex}.residents.${residentIndex}.endDate`}
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
                    
                    <div className="flex justify-end">
                      {watch(`rooms.${roomIndex}.residents`)?.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveResident(roomIndex, residentIndex)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          删除
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
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

export default WaterBillForm;