import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MetricsCard from './components/MetricsCard';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import TasksChart from './components/TasksChart';
import ValuesChart from './components/ValuesChart';
import { 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  Coins, 
  Plus,
  Wallet
} from 'lucide-react';

interface Task {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'completed';
  createdAt: string;
  completedAt?: string;
  weiValue: string;
}

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Dados de exemplo que são carregados quando a carteira é conectada
  const loadWalletTasks = () => {
    return [
      {
        id: '1',
        name: 'Implementar Smart Contract',
        description: 'Desenvolver e fazer deploy do smart contract para gerenciamento de tarefas',
        status: 'completed' as const,
        createdAt: '2024-01-15',
        completedAt: '2024-01-20',
        weiValue: '1000000000000000000'
      },
      {
        id: '2',
        name: 'Configurar MetaMask',
        description: 'Configurar integração com MetaMask para autenticação Web3',
        status: 'pending' as const,
        createdAt: '2024-01-18',
        weiValue: '500000000000000000'
      },
      {
        id: '3',
        name: 'Testes de Segurança',
        description: 'Realizar auditoria de segurança em todos os contratos',
        status: 'pending' as const,
        createdAt: '2024-01-20',
        weiValue: '2000000000000000000'
      }
    ];
  };

  const handleConnect = () => {
    if (!isConnected) {
      // Simular conexão com carteira
      setIsConnected(true);
      setWalletAddress('0xA1B2C3D4E5F6789012345678901234567890ABCD');
      // Carregar tarefas da carteira conectada
      setTasks(loadWalletTasks());
    } else {
      // Desconectar carteira
      setIsConnected(false);
      setWalletAddress('');
      // Limpar dados da carteira
      setTasks([]);
      setIsModalOpen(false);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed' as const, completedAt: new Date().toISOString().split('T')[0] }
        : task
    ));
  };

  const handleCreateTask = (taskData: { name: string; description: string; weiValue: string }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      name: taskData.name,
      description: taskData.description,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      weiValue: taskData.weiValue
    };
    
    setTasks(prev => [...prev, newTask]);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const totalWeiStaked = tasks.reduce((sum, task) => sum + parseInt(task.weiValue), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header 
        isConnected={isConnected}
        onConnect={handleConnect}
        walletAddress={walletAddress}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Métricas */}
        {isConnected && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricsCard
                title="Total de Tarefas"
                value={totalTasks}
                icon={CheckSquare}
                color="from-blue-600 to-blue-700"
                description="Tarefas criadas no sistema"
              />
              <MetricsCard
                title="Tarefas Concluídas"
                value={completedTasks}
                icon={TrendingUp}
                color="from-green-600 to-emerald-600"
                description="Tarefas finalizadas com sucesso"
              />
              <MetricsCard
                title="Tarefas Pendentes"
                value={pendingTasks}
                icon={Clock}
                color="from-yellow-600 to-orange-600"
                description="Tarefas aguardando conclusão"
              />
              <MetricsCard
                title="Wei em Stake"
                value={totalWeiStaked.toLocaleString()}
                icon={Coins}
                color="from-purple-600 to-violet-600"
                description="Total em wei das tarefas"
              />
            </div>
          </section>
        )}

        {/* Gráficos */}
        {isConnected && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Análise Visual</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <TasksChart 
                completedTasks={completedTasks}
                pendingTasks={pendingTasks}
              />
              <div className="lg:col-span-1">
                <ValuesChart tasks={tasks} />
              </div>
            </div>
          </section>
        )}

        {/* Tarefas */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Tarefas</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!isConnected}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                isConnected
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="h-5 w-5" />
              <span>Nova Tarefa</span>
            </button>
          </div>

          {!isConnected ? (
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 text-center border border-slate-700">
              <div className="max-w-md mx-auto">
                <Wallet className="h-16 w-16 text-slate-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-white mb-3">Carteira Não Conectada</h3>
                <p className="text-slate-300 mb-4">
                  Para visualizar e gerenciar suas tarefas na blockchain, você precisa conectar sua carteira Web3.
                </p>
                <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Por que conectar?</h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Suas tarefas são vinculadas ao seu endereço</li>
                    <li>• Segurança e propriedade dos dados</li>
                    <li>• Transações em Wei são específicas da carteira</li>
                  </ul>
                </div>
                <button
                  onClick={handleConnect}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 mx-auto"
                >
                  <Wallet className="h-5 w-5" />
                  <span>Conectar Carteira</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {tasks.length === 0 ? (
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 text-center border border-slate-700">
                  <CheckSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300 text-lg mb-2">Nenhuma tarefa encontrada</p>
                  <p className="text-slate-500 mb-4">
                    Esta carteira ainda não possui tarefas. Crie sua primeira tarefa para começar!
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Criar Primeira Tarefa</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleCompleteTask}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}

export default App;