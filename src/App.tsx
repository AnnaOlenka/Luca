import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Empresas from './pages/Empresas';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const handleNavigate = (module: string) => {
    setCurrentView(module);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'empresas':
        return <Empresas onNavigate={handleNavigate} />;
      case 'tareas':
        // Placeholder for Tareas view
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vista de Tareas</h2>
              <p className="text-gray-600">Esta vista estará disponible próximamente</p>
              <button 
                onClick={() => handleNavigate('dashboard')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        );
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
}

export default App;
