import React from 'react';
import { CheckCircle2, Clock, Calendar, Coins } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'completed';
  createdAt: string;
  completedAt?: string;
  weiValue: string;
}

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete }) => {
  const isCompleted = task.status === 'completed';
  
  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${
      isCompleted 
        ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-700/50' 
        : 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className={`text-xl font-semibold ${
              isCompleted ? 'text-green-300' : 'text-white'
            }`}>
              {task.name}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isCompleted 
                ? 'bg-green-600 text-white' 
                : 'bg-yellow-600 text-white'
            }`}>
              {isCompleted ? 'Concluído' : 'Pendente'}
            </span>
          </div>
          <p className="text-slate-300 mb-4">{task.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Calendar className="h-4 w-4" />
              <span>Criado: {task.createdAt}</span>
            </div>
            
            {task.completedAt && (
              <div className="flex items-center space-x-2 text-sm text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Concluído: {task.completedAt}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-sm text-cyan-400">
              <Coins className="h-4 w-4" />
              <span>{task.weiValue} Wei</span>
            </div>
          </div>
        </div>
        
        {!isCompleted && (
          <button
            onClick={() => onComplete(task.id)}
            className="ml-4 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 group"
          >
            <CheckCircle2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>Concluir</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;