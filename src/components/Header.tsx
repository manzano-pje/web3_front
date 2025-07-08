import React from 'react';
import { Wallet, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  onConnect: () => void;
  walletAddress?: string;
}

const Header: React.FC<HeaderProps> = ({ isConnected, onConnect, walletAddress }) => {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">WEB3 TODO</h1>
          </div>
          <button
            onClick={onConnect}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
              isConnected
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isConnected ? (
              <LogOut className="h-5 w-5" />
            ) : (
              <Wallet className="h-5 w-5" />
            )}
            <span>
              {isConnected 
                ? 'Desconectar'
                : 'Conectar Carteira'
              }
            </span>
          </button>
        </div>
        
        {isConnected && (
          <div className="mb-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Carteira Conectada:</span>
              <span className="text-sm font-mono text-cyan-400">
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </span>
            </div>
          </div>
        )}
        
        <div className={`p-4 rounded-lg border-l-4 flex items-center space-x-3 transition-all duration-300 ${
          isConnected 
            ? 'bg-green-900/20 border-green-500 text-green-300'
            : 'bg-yellow-900/20 border-yellow-500 text-yellow-300'
        }`}>
          {isConnected ? (
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          )}
          <span className="text-sm">
            {isConnected 
              ? 'Carteira conectada! Suas tarefas são específicas desta carteira e armazenadas na blockchain.'
              : 'Conecte sua carteira Web3 para acessar suas tarefas pessoais na blockchain.'
            }
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;