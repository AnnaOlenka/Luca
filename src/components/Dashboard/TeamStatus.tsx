import React from 'react';
import { Users, CheckCircle, AlertCircle, User } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  workload: number;
  efficiency: number;
  companiesAssigned: number;
  tasksCompleted: number;
  tasksPending: number;
  lastActivity: string;
  performance: {
    thisMonth: number;
    lastMonth: number;
    trend: 'up' | 'down' | 'stable';
  };
}

interface TeamStatusProps {
  teamMembers: TeamMember[];
  onMemberClick?: (member: TeamMember) => void;
}

const TeamStatus: React.FC<TeamStatusProps> = ({ teamMembers, onMemberClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-success-500';
      case 'busy':
        return 'bg-warning-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'En línea';
      case 'busy':
        return 'Ocupado';
      case 'offline':
        return 'Desconectado';
      default:
        return 'Desconocido';
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'text-danger-600 bg-danger-50';
    if (workload >= 75) return 'text-warning-600 bg-warning-50';
    return 'text-success-600 bg-success-50';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  const formatLastActivity = (lastActivity: string) => {
    const date = new Date(lastActivity);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 60) return `Hace ${Math.floor(diffInMinutes)} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    return date.toLocaleDateString('es-ES');
  };

  const totalOnline = teamMembers.filter(m => m.status === 'online').length;
  const avgEfficiency = teamMembers.reduce((acc, m) => acc + m.efficiency, 0) / teamMembers.length;
  const totalTasks = teamMembers.reduce((acc, m) => acc + m.tasksCompleted + m.tasksPending, 0);
  const completedTasks = teamMembers.reduce((acc, m) => acc + m.tasksCompleted, 0);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Estado del Equipo</h3>
            <p className="text-sm text-gray-600">{totalOnline} de {teamMembers.length} en línea</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="text-center">
            <p className="font-semibold text-gray-900">{avgEfficiency.toFixed(0)}%</p>
            <p className="text-gray-600">Eficiencia</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">{completedTasks}/{totalTasks}</p>
            <p className="text-gray-600">Tareas</p>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-4">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer"
            onClick={() => onMemberClick?.(member)}
          >
            <div className="flex items-center space-x-4">
              {/* Avatar with Status */}
              <div className="relative">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
              </div>
              
              {/* Member Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <span className="text-xs text-gray-500">• {getStatusText(member.status)}</span>
                </div>
                <p className="text-sm text-gray-600">{member.role}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-500">
                    {member.companiesAssigned} empresas
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatLastActivity(member.lastActivity)}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="flex items-center space-x-6">
              {/* Workload */}
              <div className="text-center">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkloadColor(member.workload)}`}>
                  {member.workload}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Carga</p>
              </div>

              {/* Tasks */}
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-success-500" />
                  <span className="text-sm font-medium text-gray-900">{member.tasksCompleted}</span>
                  {member.tasksPending > 0 && (
                    <>
                      <AlertCircle className="w-3 h-3 text-warning-500" />
                      <span className="text-sm font-medium text-gray-900">{member.tasksPending}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Tareas</p>
              </div>

              {/* Performance Trend */}
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium text-gray-900">{member.efficiency}%</span>
                  <span className="text-xs">{getTrendIcon(member.performance.trend)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Rendimiento</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Actions */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Ver detalles del equipo
        </button>
        
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Agregar miembro
          </button>
          <button className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-lg hover:bg-primary-200 transition-colors">
            Gestionar roles
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamStatus;