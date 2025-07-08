import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Coins, TrendingUp, Clock } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'completed';
  createdAt: string;
  completedAt?: string;
  weiValue: string;
}

interface ValuesChartProps {
  tasks: Task[];
}

const ValuesChart: React.FC<ValuesChartProps> = ({ tasks }) => {
  const completedValue = tasks
    .filter(task => task.status === 'completed')
    .reduce((sum, task) => sum + parseInt(task.weiValue), 0);
    
  const pendingValue = tasks
    .filter(task => task.status === 'pending')
    .reduce((sum, task) => sum + parseInt(task.weiValue), 0);

  const totalValue = completedValue + pendingValue;

  const pieData = [
    { name: 'Recebido', value: completedValue, color: '#10b981' },
    { name: 'Pendente', value: pendingValue, color: '#f59e0b' }
  ];

  const barData = [
    {
      name: 'Valores em Wei',
      recebido: completedValue,
      pendente: pendingValue
    }
  ];

  const formatWei = (value: number) => {
    if (value >= 1e18) {
      return `${(value / 1e18).toFixed(2)} ETH`;
    }
    return value.toLocaleString() + ' Wei';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-cyan-400">{formatWei(data.value)}</p>
          <p className="text-slate-400 text-sm">
            {((data.value / totalValue) * 100).toFixed(1)}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-300 capitalize">{entry.dataKey}</span>
              </div>
              <span className="text-cyan-400 font-medium">
                {formatWei(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center space-x-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            {entry.value === 'Recebido' ? (
              <TrendingUp className="h-4 w-4" style={{ color: entry.color }} />
            ) : (
              <Clock className="h-4 w-4" style={{ color: entry.color }} />
            )}
            <span className="text-slate-300 text-sm">{entry.value}</span>
            <span className="text-slate-400 text-sm">({formatWei(entry.payload.value)})</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Pizza - Distribuição de Valores */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg">
            <Coins className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Distribuição de Valores</h3>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-slate-400 text-sm">
            Total: {formatWei(totalValue)}
          </p>
        </div>
      </div>

      {/* Gráfico de Barras - Comparação de Valores */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Comparação de Valores</h3>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => {
                  if (value >= 1e18) return `${(value / 1e18).toFixed(1)}E`;
                  if (value >= 1e15) return `${(value / 1e15).toFixed(1)}P`;
                  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
                  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}G`;
                  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
                  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="recebido" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pendente" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-slate-300 text-sm">Recebido</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-slate-300 text-sm">Pendente</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuesChart;