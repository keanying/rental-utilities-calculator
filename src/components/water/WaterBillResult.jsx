import React from 'react';
import { Check, Copy, Share2, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '../../lib/utils';

const WaterBillResult = ({ result, onClose, onSave, onCopy, onShare }) => {
  if (!result) return null;
  
  const { quarterRange, totalAmount, roomResults } = result;
  
  // 计算总居住天数
  const totalResidentDays = roomResults.reduce((acc, room) => {
    return acc + room.residentResults.reduce((roomAcc, resident) => roomAcc + resident.days, 0);
  }, 0);

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
            <p className="text-muted-foreground">总居住天数</p>
            <p className="font-medium">{totalResidentDays} 天</p>
          </div>
          <div>
            <p className="text-muted-foreground">计算日期</p>
            <p className="font-medium">{new Date().toLocaleDateString('zh-CN')}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">分摊明细</h3>
        
        {roomResults.map((room) => (
          <Card key={room.roomId} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle>{room.roomName}</CardTitle>
              <CardDescription>
                共 {room.residentResults.length} 位住户
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              {room.residentResults.map((resident, index) => (
                <div key={resident.residentId} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-medium">{resident.residentName}</div>
                    <div className="font-semibold">{formatCurrency(resident.amountToPay)}</div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>居住 {resident.days} 天</span>
                    <span>占比 {(resident.shareRatio * 100).toFixed(1)}%</span>
                  </div>
                  {index < room.residentResults.length - 1 && <Separator className="my-3" />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
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

export default WaterBillResult;