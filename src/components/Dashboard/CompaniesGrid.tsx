import React from 'react';
import { Building2, CheckCircle, AlertTriangle, Plus, Settings } from 'lucide-react';

interface Company {
  id: number;
  ruc: string;
  businessName: string;
  status: 'valid' | 'invalid' | 'inactive';
  isValid: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  taxRegime: string;
  obligations: Array<{
    type: string;
    dueDate: string;
    status: string;
    amount: number;
  }>;
}

interface CompaniesGridProps {
  companies: Company[];
  onCompanyClick?: (company: Company) => void;
  onAddCompany?: () => void;
  showAddButton?: boolean;
}

const CompaniesGrid: React.FC<CompaniesGridProps> = ({
  companies,
  onCompanyClick,
  onAddCompany,
  showAddButton = true
}) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'medium':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'high':
        return 'text-danger-600 bg-danger-50 border-danger-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'Bajo riesgo';
      case 'medium': return 'Riesgo medio';
      case 'high': return 'Alto riesgo';
      default: return 'Sin evaluar';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'text-success-600';
      case 'invalid':
        return 'text-danger-600';
      case 'inactive':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPendingObligations = (obligations: Company['obligations']) => {
    return obligations.filter(o => o.status === 'pending' || o.status === 'overdue').length;
  };

  const getCriticalObligations = (obligations: Company['obligations']) => {
    return obligations.filter(o => o.status === 'overdue' || o.status === 'critical').length;
  };

  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200 text-center">
        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No tienes empresas conectadas
        </h3>
        <p className="text-gray-600 mb-6">
          Conecta tu primera empresa para comenzar a gestionar sus obligaciones tributarias
        </p>
        {showAddButton && (
          <button
            onClick={onAddCompany}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Primera Empresa</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Mis Empresas</h2>
          <p className="text-gray-600">{companies.length} empresas conectadas</p>
        </div>
        
        {showAddButton && (
          <button
            onClick={onAddCompany}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Empresa</span>
          </button>
        )}
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => {
          const pendingCount = getPendingObligations(company.obligations);
          const criticalCount = getCriticalObligations(company.obligations);
          
          return (
            <div
              key={company.id}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
              onClick={() => onCompanyClick?.(company)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      Empresa {company.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      RUC: {company.ruc}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {company.isValid && (
                    <CheckCircle className="w-5 h-5 text-success-500" />
                  )}
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Business Name */}
              <div className="mb-4">
                <p className="font-medium text-gray-900 leading-tight">
                  {company.businessName}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`text-xs font-medium ${getStatusColor(company.status)}`}>
                    {company.status === 'valid' ? 'Activa' : 
                     company.status === 'inactive' ? 'Inactiva' : 'Inválida'}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-600">{company.taxRegime}</span>
                </div>
              </div>

              {/* Risk Level */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(company.riskLevel)}`}>
                  {getRiskLabel(company.riskLevel)}
                </span>
              </div>

              {/* Obligations Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Obligaciones pendientes</span>
                  <span className="text-sm font-medium text-gray-900">
                    {pendingCount}
                  </span>
                </div>
                
                {criticalCount > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-danger-500" />
                      <span className="text-sm text-danger-600">Vencimientos críticos</span>
                    </div>
                    <span className="text-sm font-medium text-danger-600">
                      {criticalCount}
                    </span>
                  </div>
                )}

                {/* Next Obligation */}
                {company.obligations.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Próximo vencimiento</span>
                      <span className="text-xs font-medium text-gray-700">
                        {new Date(company.obligations[0].dueDate).toLocaleDateString('es-ES', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {company.obligations[0].type}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                    Ver detalles
                  </button>
                  <button className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    Preliquidar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompaniesGrid;