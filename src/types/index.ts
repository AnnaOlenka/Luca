export interface Notification {
  id: number;
  type: 'critical' | 'warning' | 'info' | 'success' | 'ai';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  urgent: boolean;
  companyId?: number;
  actionRequired: boolean;
  module: string;
}

export interface Obligation {
  type: string;
  dueDate: string;
  status: 'pending' | 'overdue' | 'critical';
  amount: number;
}

export interface Company {
  id: number;
  ruc: string;
  businessName: string;
  status: 'valid' | 'invalid' | 'inactive';
  isValid: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  taxRegime: string;
  obligations: Obligation[];
}

export interface TeamMember {
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

export interface KPICard {
  id: string;
  title: string;
  value: number;
  total?: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  change: string;
  critical: boolean;
  icon: string;
}