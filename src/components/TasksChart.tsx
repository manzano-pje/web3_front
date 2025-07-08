import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CheckCircle2, Clock, BarChart3 } from 'lucide-react';

interface TasksChartProps {
  completedTasks: number;
  pendingTasks: number;
}

const TasksChart: React.FC<TasksChartProps> = ({ completedTasks, pendingTasks }) => {
  const data = [
    { name: 'Concluídas', value: completedTasks, color: '#10b981' },
    { name: 'Pendentes', value: pendingTasks, color: '#f59e0b' }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-cyan-400">{data.value} tarefas</p>
          <p className="text-slate-400 text-sm">
            {((data.value / (completedTasks + pendingTasks)) * 100).toFixed(1)}%
          </p>
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
            {entry.value === 'Concluídas' ? (
              <CheckCircle2 className="h-4 w-4" style={{ color: entry.color }} />
            ) : (
              <Clock className="h-4 w-4" style={{ color: entry.color }} />
            )}
            <span className="text-slate-300 text-sm">{entry.value}</span>
            <span className="text-slate-400 text-sm">({entry.payload.value})</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Distribuição de Tarefas</h3>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
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
          Total: {completedTasks + pendingTasks} tarefas
        </p>
      </div>
    </div>
  );
};

export default TasksChart;