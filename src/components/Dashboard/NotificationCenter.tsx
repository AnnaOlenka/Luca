import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Brain,
  X,
  ExternalLink
} from 'lucide-react';

interface Notification {
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

interface NotificationCenterProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.urgent && !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-danger-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-warning-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-primary-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'ai':
        return <Brain className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationBg = (notification: Notification) => {
    if (!notification.read) {
      if (notification.urgent) return 'bg-danger-50 border-l-4 border-l-danger-500';
      return 'bg-blue-50 border-l-4 border-l-primary-500';
    }
    return 'bg-white hover:bg-gray-50';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${Math.floor(diffInHours)} horas`;
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center">
            <span className={`w-5 h-5 text-xs font-bold text-white rounded-full flex items-center justify-center ${
              urgentCount > 0 ? 'bg-danger-500 animate-pulse' : 'bg-primary-500'
            }`}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <div className="px-4 py-2 border-b border-gray-200">
              <button
                onClick={onMarkAllAsRead}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Marcar todas como leídas
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${getNotificationBg(notification)}`}
                  onClick={() => {
                    onNotificationClick(notification);
                    if (!notification.read) {
                      onMarkAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.actionRequired && (
                              <span className="text-xs text-warning-600 font-medium flex items-center space-x-1">
                                <ExternalLink className="w-3 h-3" />
                                <span>Acción requerida</span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter;