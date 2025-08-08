import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  id: string;
  title: string;
  value: number;
  total?: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  change: string;
  critical: boolean;
  icon: LucideIcon;
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({
  id,
  title,
  value,
  total,
  percentage,
  trend,
  change,
  critical,
  icon: Icon,
  onClick
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    if (critical) return 'text-danger-600';
    switch (trend) {
      case 'up':
        return 'text-success-600';
      case 'down':
        return 'text-danger-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCardBorder = () => {
    if (critical) return 'border-l-4 border-l-danger-500';
    return 'border border-gray-200';
  };

  return (
    <div 
      className={`bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${getCardBorder()}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${critical ? 'bg-danger-50' : 'bg-primary-50'}`}>
            <Icon className={`w-5 h-5 ${critical ? 'text-danger-600' : 'text-primary-600'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-gray-900">
                {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}
              </p>
              {total && (
                <p className="text-sm text-gray-500">/ {total}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">{change}</span>
          </div>
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    critical ? 'bg-danger-500' : 'bg-primary-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{percentage.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {critical && (
        <div className="mt-4 px-3 py-2 bg-danger-50 rounded-lg">
          <p className="text-xs text-danger-700 font-medium">⚠️ Requiere atención inmediata</p>
        </div>
      )}
    </div>
  );
};

export default KPICard;