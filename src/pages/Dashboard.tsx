import React, { useState } from 'react';

import { TrendingUp, Brain, Building2, Calendar, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import KPICard from '../components/Dashboard/KPICard';
import TeamStatus from '../components/Dashboard/TeamStatus';
import UpcomingDeadlines from '../components/Dashboard/UpcomingDeadlines';
import CompaniesGrid from '../components/Dashboard/CompaniesGrid';
import OnboardingModal from '../components/Onboarding/OnboardingModal';
import { Company, TeamMember, KPICard as KPICardType } from '../types';

// Import mock data
import kpisData from '../data/kpis.json';
import companiesData from '../data/companies.json';
import teamData from '../data/teamData.json';

interface DashboardProps {
  onNavigate?: (module: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [showOnboardingModal, setShowOnboardingModal] = useState(true);

  const handleKPIClick = (kpiId: string) => {
    console.log('KPI clicked:', kpiId);
    // Navigate based on KPI type
    switch (kpiId) {
      case 'companies':
        console.log('Navigate to clientes module');
        break;
      case 'obligations':
      case 'overdue':
        console.log('Navigate to preliquidaciones module');
        break;
      case 'efficiency':
        console.log('Navigate to equipo module');
        break;
      default:
        break;
    }
  };

  const handleCompanyClick = (company: any) => {
    console.log('Company clicked:', company);
    // Navigate to company details or preliquidaciones
  };

  const handleObligationClick = (companyId: number, obligation: any) => {
    console.log('Obligation clicked:', { companyId, obligation });
    // Navigate to preliquidaciones with specific company and obligation
  };

  const handleTeamMemberClick = (member: any) => {
    console.log('Team member clicked:', member);
    // Show member details or navigate to team management
  };

  const handleAddCompany = () => {
    setShowOnboardingModal(true);
  };

  const handleCloseOnboarding = () => {
    setShowOnboardingModal(false);
  };

  const handleNavigateToBandeja = () => {
    setShowOnboardingModal(false);
    alert('¡Navegando a la bandeja! (Demo)');
  };


  return (
    <DashboardLayout currentModule="dashboard" onNavigate={onNavigate}>
      <div className="space-y-8">
        {/* Header with Quick Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Bienvenido de vuelta, María</p>
          </div>

        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(kpisData.kpiCards as KPICardType[]).map((kpi) => (
            <KPICard
              key={kpi.id}
              {...kpi}
              icon={
                kpi.icon === 'building' ? Building2 :
                kpi.icon === 'calendar' ? Calendar :
                kpi.icon === 'alert-triangle' ? AlertTriangle :
                TrendingUp
              }
              onClick={() => handleKPIClick(kpi.id)}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Companies Grid */}
            <CompaniesGrid
              companies={companiesData as Company[]}
              onCompanyClick={handleCompanyClick}
              onAddCompany={handleAddCompany}
            />

            {/* Upcoming Deadlines */}
            <UpcomingDeadlines
              companies={companiesData as Company[]}
              onObligationClick={handleObligationClick}
            />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Team Status */}
            <TeamStatus
              teamMembers={teamData as TeamMember[]}
              onMemberClick={handleTeamMemberClick}
            />

            {/* AI Insights Widget */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Insights IA</h3>
                  <p className="text-sm text-gray-600">Recomendaciones inteligentes</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-white/60 rounded-lg border border-purple-100">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    🎯 Optimización detectada
                  </p>
                  <p className="text-xs text-gray-600">
                    Se pueden reducir 2 días en el procesamiento de IGV automatizando validaciones
                  </p>
                </div>

                <div className="p-3 bg-white/60 rounded-lg border border-purple-100">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    ⚠️ Riesgo identificado
                  </p>
                  <p className="text-xs text-gray-600">
                    2 empresas muestran patrones de retraso en pagos. Revisar historial.
                  </p>
                </div>

                <button className="w-full px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors">
                  Ver dashboard completo IA
                </button>
              </div>
            </div>

            {/* Performance Chart Widget */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-success-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Rendimiento</h3>
                    <p className="text-sm text-gray-600">Último mes</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-success-600">+12.5%</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tareas completadas</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                      <div className="bg-success-500 h-2 rounded-full" style={{ width: '87%' }} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">87%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Eficiencia promedio</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: '92%' }} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">92%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Satisfacción cliente</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                      <div className="bg-warning-500 h-2 rounded-full" style={{ width: '94%' }} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">94%</span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                Ver reportes detallados
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={handleCloseOnboarding}
        onNavigateToBandeja={handleNavigateToBandeja}
      />
    </DashboardLayout>
  );
};

export default Dashboard;