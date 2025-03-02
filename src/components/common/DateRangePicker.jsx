import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  className 
}) => {
  // 转换字符串日期为Date对象
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    return new Date(dateStr);
  };

  const formattedStartDate = parseDate(startDate);
  const formattedEndDate = parseDate(endDate);

  const formatDate = (date) => {
    if (!date) return '';
    return format(date, 'yyyy年MM月dd日', { locale: zhCN });
  };

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-2", className)}>
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? formatDate(formattedStartDate) : "选择开始日期"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formattedStartDate}
              onSelect={(date) => {
                if (date) {
                  // Using setHours to ensure we're working with the full day
                  const fullDay = new Date(date);
                  fullDay.setHours(12, 0, 0, 0);
                  // Make sure we're handling the date properly for consumers
                  try {
                    onStartDateChange(fullDay);
                  } catch (error) {
                    console.error('Error in onStartDateChange:', error);
                    // Fallback to string format if handler expects it
                    onStartDateChange(fullDay.toISOString().split('T')[0]);
                  }
                } else {
                  onStartDateChange(date);
                }
              }}
              initialFocus
              locale={zhCN}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? formatDate(formattedEndDate) : "选择结束日期"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formattedEndDate}
              onSelect={(date) => {
                if (date) {
                  // Using setHours to ensure we're working with the full day
                  const fullDay = new Date(date);
                  fullDay.setHours(12, 0, 0, 0);
                  // Make sure we're handling the date properly for consumers
                  try {
                    onEndDateChange(fullDay);
                  } catch (error) {
                    console.error('Error in onEndDateChange:', error);
                    // Fallback to string format if handler expects it
                    onEndDateChange(fullDay.toISOString().split('T')[0]);
                  }
                } else {
                  onEndDateChange(date);
                }
              }}
              initialFocus
              locale={zhCN}
              disabled={(date) => {
                // 禁用早于开始日期的所有日期
                return startDate ? date < new Date(startDate) : false;
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DateRangePicker;