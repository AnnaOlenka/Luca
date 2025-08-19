import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Building, ExternalLink, Check, Plus } from 'lucide-react';

interface RelatedCompany {
  id: string;
  nombre: string;
  ruc: string;
  relacion: string;
  confidence: number;
  sector?: string;
  estado?: string;
}

interface AutoDiscoveryNotificationProps {
  isVisible: boolean;
  personName: string;
  relatedCompanies: RelatedCompany[];
  onClose: () => void;
  onViewDetails: () => void;
  onAddAll: (companies: RelatedCompany[]) => void;
}

const AutoDiscoveryNotification: React.FC<AutoDiscoveryNotificationProps> = ({
  isVisible,
  personName,
  relatedCompanies,
  onClose,
  onViewDetails,
  onAddAll
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible, onClose, personName, relatedCompanies.length]);

  if (!isVisible && !isAnimating) return null;

  const styles = `
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999999;
      width: 380px;
      max-width: calc(100vw - 40px);
      transition: all 0.3s ease;
      transform: translateX(100%);
      opacity: 0;
    }

    .notification-container.notification-visible {
      transform: translateX(0);
      opacity: 1;
    }

    .notification-container.notification-hidden {
      transform: translateX(100%);
      opacity: 0;
    }

    .notification-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border-left: 4px solid #3b82f6;
      overflow: hidden;
      max-width: 100%;
    }

    .header-section {
      background: linear-gradient(to right, #eff6ff, #eef2ff);
      padding: 12px 16px;
      border-radius: 8px 8px 0 0;
      border-bottom: 1px solid #dbeafe;
    }

    .header-flex {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1;
    }

    .icon-container {
      background-color: #3b82f6;
      border-radius: 50%;
      padding: 4px;
    }

    .icon-search {
      width: 16px;
      height: 16px;
      color: white;
    }

    .header-text {
      min-width: 0;
      flex: 1;
    }

    .header-title {
      font-size: 12px;
      font-weight: 600;
      color: #1e3a8a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
    }

    .header-subtitle {
      font-size: 12px;
      color: #2563eb;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
    }

    .close-btn {
      color: #60a5fa;
      background: transparent;
      border: none;
      padding: 4px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      color: #2563eb;
      background-color: #dbeafe;
    }

    .icon-close {
      width: 16px;
      height: 16px;
    }

    .content-section {
      padding: 12px;
    }

    .content-flex {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 12px;
    }

    .building-icon-container {
      background-color: #dbeafe;
      border-radius: 50%;
      padding: 6px;
      flex-shrink: 0;
    }

    .building-icon {
      width: 16px;
      height: 16px;
      color: #2563eb;
    }

    .content-text {
      flex: 1;
      min-width: 0;
    }

    .main-text {
      font-size: 12px;
      color: #1f2937;
      line-height: 1.5;
      margin: 0;
    }

    .person-name {
      font-weight: 600;
      color: #1d4ed8;
      word-wrap: break-word;
    }

    .companies-list {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .company-item {
      background-color: #f9fafb;
      border-radius: 6px;
      padding: 8px;
      border: 1px solid #e5e7eb;
    }

    .company-flex {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }

    .company-info {
      flex: 1;
      min-width: 0;
    }

    .company-name {
      font-size: 12px;
      font-weight: 500;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
    }

    .company-details {
      font-size: 12px;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
    }

    .confidence-badge {
      background-color: #dcfce7;
      color: #15803d;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 9999px;
      font-weight: 500;
      flex-shrink: 0;
    }

    .more-companies {
      font-size: 12px;
      color: #6b7280;
      text-align: center;
      padding: 4px 0;
    }

    .buttons-container {
      display: flex;
      gap: 8px;
    }

    .btn-primary {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 6px 10px;
      background-color: #2563eb;
      color: white;
      font-size: 12px;
      font-weight: 500;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary:hover {
      background-color: #1d4ed8;
      border: 1px solid #1e40af;
    }

    .btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 6px 10px;
      background-color: #16a34a;
      color: white;
      font-size: 12px;
      font-weight: 500;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover {
      background-color: #15803d;
      border: 1px solid #166534;
    }

    .btn-icon {
      width: 12px;
      height: 12px;
    }

    .btn-icon-plus {
      width: 14px;
      height: 14px;
    }

    .progress-container {
      margin-top: 10px;
      background-color: #e5e7eb;
      border-radius: 9999px;
      height: 4px;
    }

    .progress-bar {
      background-color: #3b82f6;
      height: 4px;
      border-radius: 9999px;
      transition: width 10s linear;
    }

    .progress-bar.progress-animate {
      width: 0%;
    }

    .progress-bar.progress-full {
      width: 100%;
    }
  `;
  
  const notificationContent = (
    <>
      <style>{styles}</style>
      <div 
        className={`notification-container ${
          isVisible && isAnimating 
            ? 'notification-visible' 
            : 'notification-hidden'
        }`}
      >
        <div className="notification-card">
          {/* Header */}
          <div className="header-section">
            <div className="header-flex">
              <div className="header-left">
                <div className="icon-container">
                  <Search className="icon-search" />
                </div>
                <div className="header-text">
                  <h3 className="header-title">
                    Auto-descubrimiento
                  </h3>
                  <p className="header-subtitle">
                    Empresas Relacionadas
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="close-btn">
                <X className="icon-close" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="content-section">
            <div className="content-flex">
              <div className="building-icon-container">
                <Building className="building-icon" />
              </div>
              <div className="content-text">
                <p className="main-text">
                  🔍 <strong>Detectamos {relatedCompanies.length} empresas adicionales</strong> vinculadas a{' '}
                  <span className="person-name">{personName}</span>
                </p>
                
                {/* Preview of companies */}
                <div className="companies-list">
                  {relatedCompanies.slice(0, 2).map((company, index) => (
                    <div key={company.id} className="company-item">
                      <div className="company-flex">
                        <div className="company-info">
                          <p className="company-name">
                            {company.nombre}
                          </p>
                          <p className="company-details">
                            RUC: {company.ruc} • {company.relacion}
                          </p>
                        </div>
                        <div className="confidence-badge">
                          {company.confidence}%
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {relatedCompanies.length > 2 && (
                    <div className="more-companies">
                      +{relatedCompanies.length - 2} empresas más...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="buttons-container">
              <button onClick={onViewDetails} className="btn-primary">
                <span>Ver Detalles</span>
                <ExternalLink className="btn-icon" />
              </button>
              <button
                onClick={() => onAddAll(relatedCompanies)}
                className="btn-secondary"
                title="Agregar todas las empresas"
              >
                <Plus className="btn-icon-plus" />
                <span>Todas</span>
              </button>
            </div>

            {/* Progress indicator */}
            <div className="progress-container">
              <div 
                className={`progress-bar ${isAnimating ? 'progress-animate' : 'progress-full'}`}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Usar portal para renderizar fuera del modal padre
  return createPortal(notificationContent, document.body);
};

export default AutoDiscoveryNotification;