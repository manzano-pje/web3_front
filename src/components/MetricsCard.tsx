import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  description?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, icon: Icon, color, description }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-xl group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors">
            {value}
          </div>
          <div className="text-sm text-slate-400">{title}</div>
        </div>
      </div>
      {description && (
        <div className="text-xs text-slate-500 mt-2">{description}</div>
      )}
    </div>
  );
};

export default MetricsCard;