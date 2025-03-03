import React from 'react';
import { Cloud, HardDrive, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useAppContext } from '../../contexts/AppContext';

/**
 * Component that displays the current data source status (cloud or local)
 * Shows a visual indicator next to the app logo
 */
const DataSourceIndicator = () => {
  // Get data source from app context
  const { dataSource } = useAppContext();

  // Render different indicators based on data source
  switch (dataSource) {
    case 'cloud':
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="ml-2 px-1.5 py-0.5 bg-green-50 border-green-200 flex items-center">
                <Cloud className="h-3 w-3 text-green-600" />
                <span className="sr-only">云端存储</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>使用云端存储</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

    case 'localStorage':
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="ml-2 px-1.5 py-0.5 bg-amber-50 border-amber-200 flex items-center">
                <HardDrive className="h-3 w-3 text-amber-600" />
                <span className="sr-only">本地存储</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>使用本地存储</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

    case 'loading':
      return (
        <Badge variant="outline" className="ml-2 px-1.5 py-0.5 bg-slate-50 border-slate-200 flex items-center">
          <Loader2 className="h-3 w-3 text-slate-400 animate-spin" />
          <span className="sr-only">加载中</span>
        </Badge>
      );

    default:
      return null;
  }
};

export default DataSourceIndicator;