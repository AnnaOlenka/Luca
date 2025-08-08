import React from 'react';
import { Calendar, Clock, AlertTriangle, ExternalLink } from 'lucide-react';

interface Obligation {
  type: string;
  dueDate: string;
  status: 'pending' | 'overdue' | 'critical';
  amount: number;
}

interface Company {
  id: number;
  ruc: string;
  businessName: string;
  obligations: Obligation[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface UpcomingDeadlinesProps {
  companies: Company[];
  onObligationClick?: (companyId: number, obligation: Obligation) => void;
}

const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ 
  companies, 
  onObligationClick 
}) => {
  // Flatten and sort all obligations by due date
  const allObligations = companies.flatMap(company => 
    company.obligations.map(obligation => ({
      ...obligation,
      company
    }))
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
      case 'overdue':
        return 'text-danger-600 bg-danger-50 border-danger-200';
      case 'pending':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-danger-500" />;
      default:
        return <Clock className="w-4 h-4 text-warning-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Venció hace ${Math.abs(diffDays)} días`;
    } else if (diffDays === 0) {
      return 'Vence hoy';
    } else if (diffDays === 1) {
      return 'Vence mañana';
    } else {
      return `En ${diffDays} días`;
    }
  };

  const getDaysUntilDue = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const criticalCount = allObligations.filter(o => o.status === 'critical' || o.status === 'overdue').length;
  const upcomingCount = allObligations.filter(o => {
    const days = getDaysUntilDue(o.dueDate);
    return days >= 0 && days <= 7 && o.status === 'pending';
  }).length;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-warning-50 rounded-lg">
            <Calendar className="w-5 h-5 text-warning-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Próximos Vencimientos</h3>
            <p className="text-sm text-gray-600">
              {criticalCount} críticos • {upcomingCount} próximos
            </p>
          </div>
        </div>
        
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Ver cronograma completo
        </button>
      </div>

      {/* Obligations List */}
      <div className="space-y-3">
        {allObligations.slice(0, 8).map((obligation, index) => {
          const isCritical = obligation.status === 'critical' || obligation.status === 'overdue';
          
          return (
            <div
              key={`${obligation.company.id}-${obligation.type}-${index}`}
              className={`p-4 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${getStatusColor(obligation.status)}`}
              onClick={() => onObligationClick?.(obligation.company.id, obligation)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(obligation.status)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 truncate">
                        {obligation.type}
                      </p>
                      <span className="text-xs text-gray-500">•</span>
                      <p className="text-sm text-gray-600 truncate">
                        {obligation.company.businessName}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        RUC: {obligation.company.ruc}
                      </span>
                      <span className="text-xs font-medium text-gray-900">
                        {formatAmount(obligation.amount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      isCritical ? 'text-danger-700' : 'text-warning-700'
                    }`}>
                      {formatDate(obligation.dueDate)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(obligation.dueDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {isCritical && (
                <div className="mt-3 pt-3 border-t border-danger-200">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-danger-700 font-medium">
                      ⚠️ Acción inmediata requerida
                    </p>
                    <button className="px-2 py-1 text-xs font-medium text-danger-700 bg-danger-100 rounded hover:bg-danger-200 transition-colors">
                      Procesar ahora
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allObligations.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No hay vencimientos próximos</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-lg hover:bg-primary-200 transition-colors">
            Nueva preliquidación
          </button>
          <button className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Configurar recordatorios
          </button>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">
            Último actualizado: hace 5 min
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpcomingDeadlines;