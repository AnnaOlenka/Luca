import React, { useState, useEffect, useRef } from 'react';
import { X, Users, AlertCircle, Save, UserPlus, Search, Trash2, UserCheck, Crown, Calculator, Plus, ChevronDown, Settings, FileText, User as UserIcon, Edit, CheckCircle, Shield } from 'lucide-react';
import RelatedCompaniesModal from './RelatedCompaniesModal';

interface User {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  documento: string;
  avatar?: string;
  role?: string;
}

interface RoleOption {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
  required: boolean;
}

interface CompanyPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: {
    id: string;
    nombre: string;
    ruc: string;
  };
  availableUsers: User[];
  assignedUsers: User[];
  savedRolePermissions?: any[];
  onSave: (users: User[], rolePermissions: any[]) => Promise<void>;
}

// =========================================================
// NUEVO COMPONENTE: GeneralPermissionsEditor : Maneja la lógica del desplegable de permisos y el CSS para la superposición
// =========================================================
interface GeneralPermissionsEditorProps {
  currentPermissions: string;
  onSave: (newPermissions: string) => void;
  onCancel: () => void;
}

const GeneralPermissionsEditor: React.FC<GeneralPermissionsEditorProps> = ({
  currentPermissions,
  onSave,
  onCancel
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState(currentPermissions.split(', ').filter(Boolean));
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const [maxHeight, setMaxHeight] = useState(350);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  
  const permissionOptions = [
    'all',
    'system_admin',
    'reports',
    'preliquidaciones',
    'libros_contables',
    'declaraciones',
    'reception',
    'clients',
    'data_entry',
    'tributario',
    'readonly',
    'own_data',
  ];

  const handleCheckboxChange = (permission: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPermissions.length === permissionOptions.length) {
      // Si todos están seleccionados, deseleccionar todos
      setSelectedPermissions([]);
    } else {
      // Si no todos están seleccionados, seleccionar todos
      setSelectedPermissions([...permissionOptions]);
    }
  };

  const handleSaveClick = () => {
    onSave(selectedPermissions.join(', '));
  };
  
  const handleCancelClick = () => {
    onCancel();
  };

  // Estado para forzar re-render cuando cambie la posición
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  // Configuración y cálculo de posición al montar y cuando cambie el trigger
  useEffect(() => {
    setMaxHeight(350);
    setPosition('bottom');
    
    const findAndSetTriggerRect = () => {
      const triggerElement = document.querySelector('[data-editing-permissions="true"]') as HTMLElement;
      
      if (triggerElement) {
        const rect = triggerElement.getBoundingClientRect();
        console.log('🎯 Found trigger element, rect:', rect, 'Text:', triggerElement.textContent);
        setTriggerRect(rect);
      } else {
        console.log('❌ Trigger element not found');
        setTriggerRect(null);
      }
    };

    // Ejecutar inmediatamente y luego en el siguiente frame para asegurar el DOM
    findAndSetTriggerRect();
    requestAnimationFrame(() => {
      findAndSetTriggerRect();
    });
  }, []); // Se ejecuta solo al montar porque este componente se crea/destruye cada vez

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  const allSelected = selectedPermissions.length === permissionOptions.length;
  const someSelected = selectedPermissions.length > 0 && selectedPermissions.length < permissionOptions.length;
  
  // Calcular altura de la lista de opciones
  const listMaxHeight = Math.max(120, maxHeight - 120); // Restar header + footer

  // Posición basada en el estado triggerRect con visibilidad controlada
  const getDropdownStyle = () => {
    console.log('🎨 Getting dropdown style, triggerRect:', triggerRect);
    
    if (!triggerRect) {
      console.log('⚠️ No triggerRect available, hiding dropdown');
      return {
        width: '320px',
        maxHeight: '350px',
        top: '280px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'white',
        opacity: 0, // Ocultar hasta tener la posición correcta
        visibility: 'hidden' as const, // Doble seguridad para evitar el flash
      };
    }
    
    // Posición vertical dinámica basada en la fila
    const verticalPosition = triggerRect.bottom + 8;
    
    console.log('🎯 Final position calculated:', {
      top: verticalPosition,
      triggerBottom: triggerRect.bottom,
      triggerRect
    });

    return {
      width: '320px',
      maxHeight: '350px',
      top: `${verticalPosition}px`, // Dinámico según la fila
      left: '50%', // Centrado horizontalmente (funciona bien)
      transform: 'translateX(-50%)',
      backgroundColor: 'white',
      opacity: 1,
      visibility: 'visible' as const, // Mostrar solo cuando tengamos la posición correcta
    };
  };

  return (
    <div
      ref={dropdownRef}
      className={`fixed bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden transition-opacity duration-150`}
      style={{
        ...getDropdownStyle(),
        zIndex: 9999, // Z-index muy alto para estar por encima del modal
      }}
    >
      {/* Header con Seleccionar Todo */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <label className="flex items-center space-x-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected;
              }}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
          </div>
          <span className="text-sm font-medium text-gray-900">
            {allSelected ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
          </span>
          <span className="text-xs text-gray-500 ml-auto">
            ({selectedPermissions.length}/{permissionOptions.length})
          </span>
        </label>
      </div>

      {/* Lista de opciones con scroll dinámico */}
      <div 
        className="overflow-y-auto overflow-x-hidden"
        style={{ maxHeight: `${listMaxHeight}px` }}
      >
        <div className="py-1">
          {permissionOptions.map((permission, index) => (
            <label 
              key={permission} 
              className="flex items-center space-x-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedPermissions.includes(permission)}
                onChange={() => handleCheckboxChange(permission)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700 select-none">
                {permission}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Footer con botones */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {selectedPermissions.length} seleccionado{selectedPermissions.length !== 1 ? 's' : ''}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handleCancelClick}
              className="px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveClick}
              className="px-3 py-1.5 text-xs text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// FIN DEL COMPONENTE GeneralPermissionsEditor
// =========================================================


const CompanyPermissionsModal: React.FC<CompanyPermissionsModalProps> = ({
  isOpen,
  onClose,
  empresa,
  availableUsers,
  assignedUsers: initialAssignedUsers,
  savedRolePermissions,
  onSave
}) => {
  // Estilos CSS responsivos
  const styles = `
    .permissions-modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem; overflow-y: auto; }
    .permissions-modal-container { background-color: white; border-radius: 0.75rem; width: 100%; max-width: 56rem; max-height: 90vh; height: 37.5rem; min-height: 37.5rem; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); position: relative; }
    .permissions-modal-header { background-color: white; color: #1f2937; padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .permissions-modal-title { font-size: 1.25rem; font-weight: 600; color: #111827; }
    .permissions-modal-subtitle { font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem; }
    .permissions-modal-close-btn { color: #9ca3af; padding: 0.5rem; border-radius: 0.5rem; transition: all 0.2s; border: none; background: none; cursor: pointer; position: absolute; top: 1rem; right: 1rem; }
    .permissions-modal-close-btn:hover { color: #4b5563; background-color: #f3f4f6; }
    .permissions-modal-tabs { background-color: #f9fafb; padding: 0.75rem;}
    .permissions-modal-tab-list { display: flex; gap: 0.5rem; }
    .permissions-modal-tab { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; background: none; }
    .permissions-modal-tab.active { background-color: white; color: #2563eb; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
    .permissions-modal-tab:not(.active) { color: #6b7280; }
    .permissions-modal-tab:not(.active):hover { background-color: rgba(255, 255, 255, 0.5); }
    .permissions-modal-content { flex: 1; overflow-y: auto; }
    .permissions-modal-search-section { background-color: #f9fafb; padding: 1.3rem; border-bottom: 1px solid #e5e7eb; }
    .permissions-modal-search-container { display: flex; align-items: center; justify-content: space-between; }
    .permissions-modal-search-filters { display: flex; align-items: center; gap: 1rem; }
    .permissions-modal-search-input-wrapper { position: relative; }
    .permissions-modal-search-input { padding: 0.45rem 1rem; padding-left: 2.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; transition: all 0.2s; }
    .permissions-modal-search-input:focus { outline: none; border-color: transparent; box-shadow: 0 0 0 2px #3b82f6; }
    .permissions-modal-select { border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.45rem; font-size: 0.875rem; transition: all 0.2s; }
    .permissions-modal-select:focus { outline: none; border-color: transparent; box-shadow: 0 0 0 2px #3b82f6; }
    .permissions-modal-add-btn { background-color: #06b6d4; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; transition: background-color 0.2s; border: none; cursor: pointer; }
    .permissions-modal-add-btn:hover { background-color: #0891b2; }
    .permissions-modal-edit-btn { background-color: #3b82f6; color: white; padding: 0.45rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; display: flex; align-items: center; gap: 0.25rem; transition: background-color 0.2s; border: none; cursor: pointer; }
    .permissions-modal-edit-btn:hover { background-color: #2563eb; }
    .permissions-modal-delete-btn { background-color: #ef4444; color: white; padding: 0.5rem; border-radius: 0.375rem; transition: background-color 0.2s; border: none; cursor: pointer; }
    .permissions-modal-delete-btn:hover { background-color: #dc2626; }
    .permissions-modal-footer { background-color: #f9fafb; padding: 1.5rem; border-top: 1px solid #e5e7eb; }
    .permissions-modal-cancel-btn:hover { background-color: #e5e7eb; }
    @media (max-width: 48rem) {
      .permissions-modal-backdrop { padding: 0.5rem; }
      .permissions-modal-container { height: 90vh; min-height: 90vh; }
      .permissions-modal-header { padding: 1rem; }
      .permissions-modal-title { font-size: 1.125rem; }
      .permissions-modal-tabs { padding: 0.75rem; }
      .permissions-modal-tab { padding: 0.5rem 0.75rem; font-size: 0.8125rem; width: auto; }
      .permissions-modal-search-section { padding: 1rem; }
      .permissions-modal-search-container { flex-direction: column; gap: 1rem; align-items: stretch; }
      .permissions-modal-search-filters { flex-direction: column; gap: 0.75rem; }
    }
    @media (max-width: 30rem) {
      .permissions-modal-container { max-width: 95vw; }
      .permissions-modal-search-filters { gap: 0.5rem; }
    }
  `;

  const [assignedUsers, setAssignedUsers] = useState<User[]>(initialAssignedUsers);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  const [editingGeneralPermissions, setEditingGeneralPermissions] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [showRelatedCompaniesModal, setShowRelatedCompaniesModal] = useState(false);

  const roleOptions: RoleOption[] = [
    {
      id: 'gerente_apoderado',
      name: 'Gerente/Apoderado',
      color: 'yellow',
      icon: <Crown className="w-4 h-4" />,
      required: false
    },
    {
      id: 'admin_sistema',
      name: 'Admin Sistema',
      color: 'indigo',
      icon: <Settings className="w-4 h-4" />,
      required: false
    },
    {
      id: 'contador_senior',
      name: 'Contador Senior',
      color: 'blue',
      icon: <Calculator className="w-4 h-4" />,
      required: false
    },
    {
      id: 'contador',
      name: 'Contador',
      color: 'green',
      icon: <Calculator className="w-4 h-4" />,
      required: false
    },
    {
      id: 'tecnico_contable',
      name: 'Técnico Contable',
      color: 'orange',
      icon: <FileText className="w-4 h-4" />,
      required: false
    },
    {
      id: 'auxiliar',
      name: 'Auxiliar',
      color: 'gray',
      icon: <UserIcon className="w-4 h-4" />,
      required: false
    },
    {
      id: 'auditor',
      name: 'Auditor',
      color: 'purple',
      icon: <Search className="w-4 h-4" />,
      required: false
    },
    {
      id: 'analista_tributario',
      name: 'Analista Tributario',
      color: 'red',
      icon: <FileText className="w-4 h-4" />,
      required: false
    },
    {
      id: 'cliente',
      name: 'Cliente',
      color: 'pink',
      icon: <UserIcon className="w-4 h-4" />,
      required: false
    }
  ];

  const initialRolePermissions = [
    {
      roleId: 'gerente_apoderado',
      generalAccess: 'all',
      specificAccess: {
        recepcion_documentos: 'total',
        presentar_sunat: 'total',
        configuracion_sistema: 'parcial'
      }
    },
    {
      roleId: 'admin_sistema',
      generalAccess: 'system_admin',
      specificAccess: {
        configuracion_sistema: 'total',
        presentar_sunat: 'none',
        procesamiento_contable: 'none'
      }
    },
    {
      roleId: 'contador_senior',
      generalAccess: 'clients, reports, preliquidaciones, libros_contables',
      specificAccess: {
        procesamiento_contable: 'total',
        libros_contables: 'total',
        presentar_sunat: 'none'
      }
    },
    {
      roleId: 'contador',
      generalAccess: 'clients, data_entry, declaraciones',
      specificAccess: {
        procesamiento_contable: 'parcial',
        declaraciones_tributarias: 'parcial'
      }
    },
    {
      roleId: 'tecnico_contable',
      generalAccess: 'data_entry',
      specificAccess: {
        recepcion_documentos: 'parcial',
        procesamiento_contable: 'parcial'
      }
    },
    {
      roleId: 'auxiliar',
      generalAccess: 'reception',
      specificAccess: {
        recepcion_documentos: 'parcial'
      }
    },
    {
      roleId: 'auditor',
      generalAccess: 'readonly',
      specificAccess: {
        auditoria: 'readonly'
      }
    },
    {
      roleId: 'analista_tributario',
      generalAccess: 'clients, reports, tributario',
      specificAccess: {
        seguimiento_control: 'total'
      }
    },
    {
      roleId: 'cliente',
      generalAccess: 'own_data',
      specificAccess: {
        gestion_cliente: 'own_data',
        presentar_sunat: 'parcial'
      }
    }
  ];

  const [rolePermissions, setRolePermissions] = useState(savedRolePermissions || initialRolePermissions);

  useEffect(() => {
    if (isOpen) {
      setAssignedUsers(initialAssignedUsers);
      setRolePermissions(savedRolePermissions || initialRolePermissions); // Usar permisos recibidos o por defecto
      setHasChanges(false);
      setErrors([]);
      setShowSuccessMessage(false); // Solo ocultar cuando se abre el modal
    }
  }, [isOpen]); // Solo depender de isOpen para evitar reseteos prematuros

  // Efecto separado para actualizar datos cuando cambian las props sin afectar el mensaje
  useEffect(() => {
    if (isOpen) {
      setAssignedUsers(initialAssignedUsers);
      setRolePermissions(savedRolePermissions || initialRolePermissions);
    }
  }, [initialAssignedUsers, savedRolePermissions]);

  // Función para actualizar permisos generales de un rol
  const updateRoleGeneralPermissions = (roleId: string, newPermissions: string) => {
    setRolePermissions(prev => prev.map(roleConfig => 
      roleConfig.roleId === roleId 
        ? { ...roleConfig, generalAccess: newPermissions }
        : roleConfig
    ));
    setHasChanges(true);
    setEditingGeneralPermissions(null);
  };

  const validateUsers = (): string[] => {
    const validationErrors: string[] = [];
    
    const requiredRoles = roleOptions.filter(role => role.required);
    
    requiredRoles.forEach(requiredRole => {
      const hasUserWithRole = assignedUsers.some(user => user.role === requiredRole.id);
      if (!hasUserWithRole) {
        validationErrors.push(`El rol ${requiredRole.name} es obligatorio y debe ser asignado`);
      }
    });

    // Removido: Ya no hay roles únicos obligatorios

    return validationErrors;
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setAssignedUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    setHasChanges(true);
    setErrors([]);
    setEditingRole(null);
  };

  const handleRemoveUser = (userId: string) => {
    setAssignedUsers(prev => prev.filter(user => user.id !== userId));
    setHasChanges(true);
    setErrors([]);
  };

  const handleAddUsers = async (users: User[]) => {
    // Añadir usuarios sin rol asignado (se asignará en la tabla)
    const newUsers = users.map(user => ({ ...user, role: '' }));
    setAssignedUsers(prev => [...prev, ...newUsers]);
    setHasChanges(true);
    setErrors([]);
    setShowAddUserModal(false);
  };



  const handleSave = async () => {
    const validationErrors = validateUsers();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    setErrors([]);
    
    try {
      // Preparar datos para guardar (usuarios asignados + permisos por rol)
      const dataToSave = {
        assignedUsers: assignedUsers,
        rolePermissions: rolePermissions,
        empresa: empresa
      };
      
      console.log('💾 Guardando cambios completos:', dataToSave);
      
      // Guardar ambos: usuarios asignados y permisos por rol
      await onSave(assignedUsers, rolePermissions);
      
      // Mostrar mensaje de éxito
      setSuccessMessage('Cambios guardados correctamente');
      setShowSuccessMessage(true);
      setHasChanges(false);
      
      // Ocultar mensaje después de 4 segundos
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 4000);
      
    } catch (error) {
      setErrors(['Error al guardar los cambios. Inténtelo nuevamente.']);
      console.error('Error guardando permisos:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleOption = (roleId: string) => {
    return roleOptions.find(role => role.id === roleId);
  };

  const getRoleBadgeClass = (roleId: string) => {
    const role = getRoleOption(roleId);
    if (!role) return 'bg-gray-100 text-gray-500';
    
    const colorMap = {
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      orange: 'bg-orange-100 text-orange-800',
      pink: 'bg-pink-100 text-pink-800',
      gray: 'bg-gray-100 text-gray-800',
      red: 'bg-red-100 text-red-800'
    };
    
    return colorMap[role.color as keyof typeof colorMap] || 'bg-gray-100 text-gray-500';
  };

  const filteredUsers = assignedUsers.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterRole === 'all') return matchesSearch;
    return matchesSearch && user.role === filterRole;
  });

  const unassignedUsers = availableUsers.filter(user => 
    !assignedUsers.some(assigned => assigned.id === user.id)
  );

  if (!isOpen) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="permissions-modal-backdrop">
        <div className="permissions-modal-container">
          
          <div className="permissions-modal-header">
            <div>
              <h2 className="permissions-modal-title">Gestión de Permisos</h2>
              <p className="permissions-modal-subtitle">{empresa.nombre} - RUC {empresa.ruc}</p>
            </div>
            <button 
              onClick={onClose}
              className="permissions-modal-close-btn"
              disabled={isSaving}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="permissions-modal-tabs">
              <nav className="permissions-modal-tab-list">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`permissions-modal-tab ${activeTab === 'users' ? 'active' : ''}`}
                >
                  <Users className="w-4 h-4" />
                  Usuarios y Roles
                </button>
                <button
                  onClick={() => setActiveTab('permissions')}
                  className={`permissions-modal-tab ${activeTab === 'permissions' ? 'active' : ''}`}
                >
                  <Shield className="w-4 h-4" />
                  Permisos por Rol
                </button>
              </nav>
            </div>
          </div>

          <div className="permissions-modal-content">
          {activeTab === 'users' && (
            <>
              <div className="permissions-modal-search-section">
                <div className="permissions-modal-search-container">
                  <div className="permissions-modal-search-filters">
                    <div className="permissions-modal-search-input-wrapper">
                      <Search 
                        className="w-5 h-5 text-gray-400" 
                        style={{
                          position: 'absolute',
                          left: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Buscar usuarios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="permissions-modal-search-input"
                      />
                    </div>

                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="permissions-modal-select"
                    >
                      <option value="all">Todos los roles</option>
                      {roleOptions.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-3 relative">
                    <span className="text-sm text-gray-500">
                      {filteredUsers.length} usuarios
                    </span>
                    <div className="relative">
                      <button
                        ref={(el) => {
                          // Pass the ref to the AddUserPopover component
                          if (showAddUserModal && el) {
                            // Store reference for position calculation
                            (window as any).addUserButtonRef = el;
                          }
                        }}
                        onClick={() => setShowAddUserModal(true)}
                        className="permissions-modal-add-btn"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Añadir Usuario</span>
                      </button>
                      
                      {showAddUserModal && (
                        <AddUserPopover
                          isOpen={showAddUserModal}
                          onClose={() => setShowAddUserModal(false)}
                          availableUsers={unassignedUsers}
                          roleOptions={roleOptions}
                          onAddUsers={handleAddUsers}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 260px)' }}>
                
                {errors.length > 0 && (
                  <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-800 mb-1">Errores de validación:</h4>
                        <ul className="text-sm text-red-700 list-disc list-inside">
                          {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => {
                        const roleOption = getRoleOption(user.role || '');

                        return (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-9 w-10 " style={{ width: "40px" }}>
                                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">
                                      {user.nombre.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className="text-center text-sm font-medium text-gray-900">
                                    {user.nombre}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    DNI: {user.documento || 'Falta dato'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editingRole === user.id ? (
                                <select
                                  value={user.role || ''}
                                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                  onBlur={() => setEditingRole(null)}
                                  autoFocus
                                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="">Seleccionar rol...</option>
                                  {roleOptions.map(role => (
                                    <option key={role.id} value={role.id}>
                                      {role.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div 
                                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
                                  onClick={() => setEditingRole(user.id)}
                                >
                                  {roleOption && (
                                    <>
                                      {roleOption.icon}
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeClass(user.role || '')}`}>
                                        {roleOption.name}
                                      </span>
                                    </>
                                  )}
                                  <ChevronDown className="w-3 h-3 text-gray-400" />
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Activo
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleRemoveUser(user.id)}
                                className="permissions-modal-delete-btn"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Intenta ajustar los filtros de búsqueda o añade nuevos usuarios
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'permissions' && (
            <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 220px)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permisos Generales
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roleOptions.map((role) => {
                      const roleConfig = rolePermissions.find(r => r.roleId === role.id);
                      
                      const getAccessBadge = (access?: string) => {
                        switch (access) {
                          case 'total':
                            return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Total</span>;
                          case 'parcial':
                            return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Parcial</span>;
                          case 'readonly':
                            return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Solo Lectura</span>;
                          case 'own_data':
                            return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Datos Propios</span>;
                          case 'none':
                            return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Sin Acceso</span>;
                          default:
                            return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">-</span>;
                        }
                      };

                      return (
                        <tr key={role.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {role.icon}
                              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeClass(role.id)}`}>
                                {role.name}
                              </span>
                            </div>
                          </td>
                          {/* ========================================================= */}
                          {/* APLICACIÓN DE LA CORRECCIÓN A LA CELDA DE PERMISOS */}
                          {/* ========================================================= */}
                          <td 
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 relative"
                            data-editing-permissions={editingGeneralPermissions === role.id ? "true" : "false"}
                          >
                            {editingGeneralPermissions === role.id ? (
                              <div className="text-blue-600 font-medium">Editando...</div>
                            ) : (
                              <div 
                                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
                                onClick={() => setEditingGeneralPermissions(role.id)}
                              >
                                <span>{roleConfig?.generalAccess || '-'}</span>
                                <Edit className="w-3 h-3 text-gray-400" />
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        
        {/* Mensaje de éxito */}
        {showSuccessMessage && (
          <div className="mx-6 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm text-green-800">{successMessage}</span>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="text-green-400 hover:text-green-600 ml-2"
              >
              </button>
            </div>
          </div>
        )}
        
        {/* Footer fijo del modal */}
        <div className="permissions-modal-footer">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                {hasChanges && (
                  <span className="text-amber-600 font-medium">• Cambios no guardados</span>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="permissions-modal-cancel-btn"
                disabled={isSaving}
                style={{ padding: '0.5rem 1rem', color: '#6b7280', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', transition: 'background-color 0.2s' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="permissions-modal-save-btn"
                disabled={isSaving || !hasChanges}
                style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background-color 0.2s', border: 'none', cursor: 'pointer', opacity: (isSaving || !hasChanges) ? 0.5 : 1 }}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    
      {/* GeneralPermissionsEditor como overlay */}
      {editingGeneralPermissions && (
        <GeneralPermissionsEditor
          currentPermissions={rolePermissions.find(r => r.roleId === editingGeneralPermissions)?.generalAccess || ''}
          onSave={(newPermissions) => updateRoleGeneralPermissions(editingGeneralPermissions, newPermissions)}
          onCancel={() => setEditingGeneralPermissions(null)}
        />
      )}

      <RelatedCompaniesModal
        isOpen={showRelatedCompaniesModal}
        onClose={() => setShowRelatedCompaniesModal(false)}
        personName=""
        relatedCompanies={[]}
        onAddSelected={() => {}}
        onAddAll={() => {}}
      />
    </>
  );
};

interface AddUserPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  availableUsers: User[];
  roleOptions: RoleOption[];
  onAddUsers: (users: User[]) => void;
}

const AddUserPopover: React.FC<AddUserPopoverProps> = ({
  isOpen,
  onClose,
  availableUsers,
  roleOptions,
  onAddUsers
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const popoverRef = useRef<HTMLDivElement>(null);

  const filteredUsers = availableUsers.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    const users = availableUsers.filter(u => selectedUsers.includes(u.id));
    if (users.length > 0) {
      onAddUsers(users);
      setSelectedUsers([]);
      setSearchTerm('');
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  // Calculate optimal position based on available space
  useEffect(() => {
    if (isOpen) {
      const calculatePosition = () => {
        const button = (window as any).addUserButtonRef;
        if (!button) return;

        const buttonRect = button.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const popoverHeight = 600; // Estimated max height
        
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        
        // If there's not enough space below and more space above, position above
        if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
          setPosition('top');
        } else {
          setPosition('bottom');
        }
      };

      // Calculate position initially and on scroll/resize
      calculatePosition();
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);

      return () => {
        window.removeEventListener('scroll', calculatePosition);
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getPositionClasses = () => {
    const baseClasses = "absolute right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[70]";
    
    if (position === 'top') {
      return `${baseClasses} bottom-full mb-2`;
    } else {
      return `${baseClasses} top-full mt-2`;
    }
  };


  return (
    <div 
      ref={popoverRef}
      className={getPositionClasses()}
      style={{ maxHeight: '600px' }}
    >
      <div className="flex flex-col h-full max-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Añadir Usuarios</h3>
            {selectedUsers.length > 0 && (
              <p className="text-xs text-blue-600 mt-1">{selectedUsers.length} usuario{selectedUsers.length !== 1 ? 's' : ''} seleccionado{selectedUsers.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 pb-3 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Seleccionar Todo */}
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between">
              <button
                onClick={handleSelectAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectedUsers.length === filteredUsers.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
              </button>
              <span className="text-xs text-gray-500">
                {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} disponible{filteredUsers.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* User List with improved scrolling */}
        <div className="flex-1 overflow-y-auto px-4 pb-3" style={{ maxHeight: '300px' }}>
          {filteredUsers.length > 0 ? (
            <div className="space-y-1">
              {filteredUsers.map(user => (
                <div 
                  key={user.id}
                  onClick={() => handleUserToggle(user.id)}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                    selectedUsers.includes(user.id) ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserToggle(user.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">
                      {user.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{user.nombre}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-500 text-center">No se encontraron usuarios</p>
            </div>
          )}
        </div>

        {/* Add Button */}
        <div className="p-4 pt-3 border-t border-gray-100">
          <button
            onClick={handleAdd}
            disabled={selectedUsers.length === 0}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>
              Añadir {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''} Usuario{selectedUsers.length !== 1 ? 's' : ''}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};


export default CompanyPermissionsModal;