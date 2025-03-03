import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, Droplets, Zap, Trash2, ExternalLink, 
  Search, Loader2 
} from 'lucide-react';
import DataSourceIndicator from '../components/common/DataSourceIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '../contexts/AppContext';
import { formatCurrency } from '../lib/utils';
import WaterBillResult from '../components/water/WaterBillResult';
import ElectricityBillResult from '../components/electricity/ElectricityBillResult';
import Modal from '../components/common/Modal';

const HistoryPage = () => {
  const { 
    waterBillHistory, 
    electricityBillHistory, 
    deleteWaterBillHistory, 
    deleteElectricityBillHistory,
    isLoading,
    dataSource
  } = useAppContext();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('water');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // 过滤和排序历史记录
  const filteredHistory = useMemo(() => {
    const history = activeTab === 'water' ? waterBillHistory : electricityBillHistory;
    
    // Ensure history is valid and all items have required properties
    const validHistory = history.filter(bill => bill && bill.quarterRange && typeof bill.quarterRange.toFormattedString === 'function');
    
    // 过滤
    const filtered = validHistory.filter(bill => {
      try {
        const quarterString = bill.quarterRange.toFormattedString().toLowerCase();
        const dateString = bill.date ? new Date(bill.date).toLocaleDateString('zh-CN').toLowerCase() : '';
        const searchTermLower = searchTerm.toLowerCase();
        
        return quarterString.includes(searchTermLower) || 
               dateString.includes(searchTermLower);
      } catch (error) {
        console.error('Error filtering bill:', error, bill);
        return false;
      }
    });
    
    // 排序
    return filtered.sort((a, b) => {
      try {
        switch (sortBy) {
          case 'date-desc':
            return new Date(b.date || 0) - new Date(a.date || 0);
          case 'date-asc':
            return new Date(a.date || 0) - new Date(b.date || 0);
          case 'amount-desc':
            return (b.totalAmount || 0) - (a.totalAmount || 0);
          case 'amount-asc':
            return (a.totalAmount || 0) - (b.totalAmount || 0);
          default:
            return 0;
        }
      } catch (error) {
        console.error('Error sorting bills:', error);
        return 0;
      }
    });
  }, [activeTab, waterBillHistory, electricityBillHistory, searchTerm, sortBy]);
  
  const handleViewDetail = (bill) => {
    setSelectedBill(bill);
    setShowDetailModal(true);
  };
  
  const handleDeleteBill = async (billId, billType) => {
    if (billType === 'water') {
      await deleteWaterBillHistory(billId);
    } else {
      await deleteElectricityBillHistory(billId);
    }
  };
  
  const handleCopy = () => {
    toast.info('已复制到剪贴板');
    // 实现复制功能
  };
  
  const handleShare = () => {
    toast.info('分享功能开发中');
    // 实现分享功能
  };
  

  
  const renderEmptyState = () => (
    <div className="text-center py-16 space-y-4">
      <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground" />
      <h3 className="text-xl font-medium">暂无历史记录</h3>
      <p className="text-muted-foreground">
        {activeTab === 'water' 
          ? '您还没有保存过水费计算结果' 
          : '您还没有保存过电费计算结果'}
      </p>
      <Button 
        onClick={() => navigate(activeTab === 'water' ? '/water-bill' : '/electricity-bill')}
        className="mt-4"
      >
        创建{activeTab === 'water' ? '水费' : '电费'}计算
      </Button>
    </div>
  );
  
  const renderHistoryItem = (bill, type) => {
    try {
      if (!bill || !bill.id || !bill.quarterRange || typeof bill.quarterRange.toFormattedString !== 'function') {
        console.error('Invalid bill data:', bill);
        return null;
      }
      
      const isWaterBill = type === 'water';
      const Icon = isWaterBill ? Droplets : Zap;
      const iconColor = isWaterBill ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400';
      const bgColor = isWaterBill ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30';
      
      // Safe access to roomResults
      const roomResults = Array.isArray(bill.roomResults) ? bill.roomResults : [];
      
      return (
        <Card key={bill.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-full ${bgColor}`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <CardTitle className="text-lg">
                  {bill.quarterRange.toFormattedString()} {isWaterBill ? '水费' : '电费'}
                </CardTitle>
              </div>
              <CardDescription>
                {bill.date ? new Date(bill.date).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '无日期'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-muted-foreground">总金额</span>
                <p className="text-xl font-semibold">{formatCurrency(bill.totalAmount || 0)}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">
                  {isWaterBill 
                    ? `${roomResults.reduce((acc, room) => acc + (Array.isArray(room.residentResults) ? room.residentResults.length : 0), 0)}位住户` 
                    : `${roomResults.length}个房间`}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleDeleteBill(bill.id, type)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              删除
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewDetail(bill)}
              className="gap-1"
            >
              <ExternalLink className="h-4 w-4" />
              查看详情
            </Button>
          </CardFooter>
        </Card>
      );
    } catch (error) {
      console.error('Error rendering bill item:', error, bill);
      return null;
    }
  };
  
  // 加载中状态显示
  if (isLoading && (!waterBillHistory.length && !electricityBillHistory.length)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h3 className="text-xl font-medium">正在加载历史数据...</h3>
        <p className="text-muted-foreground mt-2">
          正在从{dataSource === 'cloud' ? '云端数据库' : '本地存储'}获取历史记录
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
            <ClipboardList className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              历史记录
              <DataSourceIndicator />
            </h1>
            <p className="text-muted-foreground">
              查看和管理您保存的水电费计算记录 - {dataSource === 'cloud' ? '数据已同步至云端' : '数据仅保存在本地设备'}
            </p>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="water" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="water" className="gap-2" disabled={isLoading}>
              <Droplets className="h-4 w-4" />
              水费记录
            </TabsTrigger>
            <TabsTrigger value="electricity" className="gap-2" disabled={isLoading}>
              <Zap className="h-4 w-4" />
              电费记录
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center w-full sm:w-auto gap-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索记录..."
                className="pl-8 w-full sm:w-auto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy} disabled={isLoading}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">最新优先</SelectItem>
                <SelectItem value="date-asc">最早优先</SelectItem>
                <SelectItem value="amount-desc">金额从高到低</SelectItem>
                <SelectItem value="amount-asc">金额从低到高</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <TabsContent value="water" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredHistory.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHistory.map(bill => {
                // Make sure bill has all required properties before rendering
                if (bill && bill.id && bill.quarterRange && bill.totalAmount) {
                  return renderHistoryItem(bill, 'water')
                }
                return null;
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="electricity" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredHistory.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHistory.map(bill => {
                // Make sure bill has all required properties before rendering
                if (bill && bill.id && bill.quarterRange && bill.totalAmount) {
                  return renderHistoryItem(bill, 'electricity')
                }
                return null;
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* 详情模态框 */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`${selectedBill?.quarterRange?.toFormattedString() || ''} ${activeTab === 'water' ? '水费' : '电费'}详情`}
      >
        {selectedBill && activeTab === 'water' ? (
          <WaterBillResult
            result={selectedBill}
            onClose={() => setShowDetailModal(false)}
            onCopy={handleCopy}
            onShare={handleShare}
            onSave={() => {}}
          />
        ) : selectedBill && (
          <ElectricityBillResult
            result={selectedBill}
            onClose={() => setShowDetailModal(false)}
            onCopy={handleCopy}
            onShare={handleShare}
            onSave={() => {}}
          />
        )}
      </Modal>
    </div>
  );
};

export default HistoryPage;