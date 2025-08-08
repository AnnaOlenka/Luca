import React from 'react';
import { Building2, Search, CheckSquare, BarChart3, Bell, Moon, Crown } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentModule?: string;
  onNavigate?: (module: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentModule = 'dashboard', onNavigate }) => {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Luca</span>
            </div>
            
            {/* Empresas button */}
            <button 
              onClick={() => onNavigate?.('empresas')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentModule === 'empresas' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Empresas</span>
            </button>
            
            {/* Search bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="        Buscar..."
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onNavigate?.('tareas')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentModule === 'tareas' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tareas</span>
            </button>
            
            <button 
              onClick={() => onNavigate?.('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentModule === 'dashboard' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Notificaciones">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Cambiar tema">
              <Moon className="w-5 h-5" />
            </button>
            
            <button className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-yellow-700">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Mejorar Plan</span>
            </button>
            
            <button className="p-1 rounded-full hover:bg-gray-50 transition-colors" title="Perfil">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">MG</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;