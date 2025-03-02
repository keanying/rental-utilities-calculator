import React from 'react';
import { Check, Copy, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '../../lib/utils';

const ElectricityBillResult = ({ result, onClose, onSave, onCopy, onShare }) => {
  if (!result) return null;
  
  const { quarterRange, totalAmount, roomResults, paidRooms, compensation } = result;
  
  // 计算总房间使用天数
  const totalRoomDays = roomResults.reduce((acc, room) => acc + room.days, 0);
  
  // 检查是否有已付款房间
  const hasPaidRooms = paidRooms && paidRooms.length > 0;
  
  // 检查是否有补偿信息需要显示
  const hasCompensation = compensation && compensation.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 rounded-lg p-4">
        <h2 className="font-semibold text-lg mb-2">账单概要</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">计费周期</p>
            <p className="font-medium">{quarterRange.toFormattedString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">总费用</p>
            <p className="font-medium text-xl">{formatCurrency(totalAmount)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">总房间使用天数</p>
            <p className="font-medium">{totalRoomDays} 天</p>
          </div>
          <div>
            <p className="text-muted-foreground">计算日期</p>
            <p className="font-medium">{new Date().toLocaleDateString('zh-CN')}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">分摊明细</h3>
        
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>房间电费分摊</CardTitle>
            <CardDescription>
              共 {roomResults.length} 个房间
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roomResults.map((room, index) => (
              <div key={room.roomId} className="mb-4 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">
                    {room.roomName}
                    {room.hasPaid && <span className="ml-2 text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">已缴费</span>}
                  </div>
                  <div className="font-semibold">{formatCurrency(room.amountToPay)}</div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>使用 {room.days} 天</span>
                  <span>占比 {(room.shareRatio * 100).toFixed(1)}%</span>
                </div>
                {index < roomResults.length - 1 && <Separator className="my-3" />}
              </div>
            ))}
          </CardContent>
        </Card>
        
        {hasCompensation && (
          <Card className="overflow-hidden mt-4">
            <CardHeader className="pb-2">
              <CardTitle>补偿明细</CardTitle>
              <CardDescription>
                以下是未付款房间需要向已付款房间补偿的金额
              </CardDescription>
            </CardHeader>
            <CardContent>
              {compensation.map((comp, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-medium">
                      {comp.fromRoomName} → {comp.toRoomName}
                    </div>
                    <div className="font-semibold">{formatCurrency(comp.amount)}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    重叠使用 {comp.overlapDays} 天的电费补偿
                    {comp.overlapStartDate && comp.overlapEndDate ? (
                      `（${new Date(comp.overlapStartDate).toLocaleDateString('zh-CN')} ~ ${new Date(comp.overlapEndDate).toLocaleDateString('zh-CN')}）`
                    ) : ''}
                  </div>
                  {index < compensation.length - 1 && <Separator className="my-3" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        {!hasPaidRooms && roomResults.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4 mt-2">
            <p className="text-sm">没有房间标记为已缴费，每个房间应支付上面显示的金额。</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
        <Button variant="outline" size="sm" onClick={onClose} className="gap-2">
          <X className="h-4 w-4" />
          关闭
        </Button>
        <Button variant="outline" size="sm" onClick={onCopy} className="gap-2">
          <Copy className="h-4 w-4" />
          复制结果
        </Button>
        <Button variant="outline" size="sm" onClick={onShare} className="gap-2">
          <Share2 className="h-4 w-4" />
          分享结果
        </Button>
      </div>
    </div>
  );
};

export default ElectricityBillResult;