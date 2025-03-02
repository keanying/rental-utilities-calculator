import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '../contexts/AppContext';
import ElectricityBillForm from '../components/electricity/ElectricityBillForm';
import ElectricityBillResult from '../components/electricity/ElectricityBillResult';
import Modal from '../components/common/Modal';

const ElectricityBillPage = () => {
  const { addElectricityBillHistory } = useAppContext();
  const navigate = useNavigate();
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  
  const handleCalculate = async (result) => {
    setIsCalculating(true);
    
    try {
      // 在实际应用中可能需要进行更多处理
      setCalculationResult(result);
      
      // 自动保存到历史记录
      addElectricityBillHistory(result);
      toast.success('已保存计算结果到历史记录');
      
      // 显示结果模态框
      setShowResultModal(true);
    } catch (error) {
      console.error('计算电费出错：', error);
      toast.error('计算电费时出错，请检查输入数据');
    } finally {
      setIsCalculating(false);
    }
  };
  
  const handleSaveResult = () => {
    if (calculationResult) {
      // 关闭模态框并跳转到历史记录页
      setShowResultModal(false);
      navigate('/history');
    }
  };
  
  const handleShareResult = () => {
    // 这里可以实现分享功能，例如复制链接、生成图片等
    toast.info('分享功能正在开发中');
  };
  
  const handleCopyResult = () => {
    // 这里可以实现复制功能
    if (!calculationResult) return;
    
    const { quarterRange, totalAmount, roomResults } = calculationResult;
    
    let textResult = `【电费计算结果】\n`;
    textResult += `计费季度：${quarterRange.toFormattedString()}\n`;
    textResult += `总金额：${totalAmount.toFixed(2)}元\n\n`;
    
    roomResults.forEach(room => {
      textResult += `${room.roomName}: ${room.amountToPay.toFixed(2)}元 (${room.days}天)\n`;
    });
    
    navigator.clipboard.writeText(textResult)
      .then(() => toast.success('已复制计算结果到剪贴板'))
      .catch(() => toast.error('复制失败，请手动复制'));
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">电费计算</h1>
            <p className="text-muted-foreground">
              根据房间使用情况计算电费分摊
            </p>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <ElectricityBillForm onSubmit={handleCalculate} isCalculating={isCalculating} />
          </div>
        </div>
      </div>
      
      {/* 结果展示模态框 */}
      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title="电费计算结果"
      >
        <ElectricityBillResult
          result={calculationResult}
          onClose={() => setShowResultModal(false)}
          onSave={handleSaveResult}
          onShare={handleShareResult}
          onCopy={handleCopyResult}
        />
      </Modal>
    </>
  );
};

export default ElectricityBillPage;