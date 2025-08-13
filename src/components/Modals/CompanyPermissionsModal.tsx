import React, { useState, useEffect, useRef } from 'react';
import { X, Users, AlertCircle, Save, UserPlus, Search, Trash2, UserCheck, Crown, Calculator, Plus, ChevronDown, Settings, FileText, User as UserIcon, Edit } from 'lucide-react';

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
  onSave: (users: User[]) => Promise<void>;
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

  // Mejorada detección de posición y altura dinámica
  useEffect(() => {
    const calculatePositionAndSize = () => {
      // Encontrar el elemento trigger (la celda que contiene este editor)
      const triggerElement = document.querySelector('[data-editing-permissions="true"]') as HTMLElement;
      if (!triggerElement) return;

      triggerElementRef.current = triggerElement;
      
      const triggerRect = triggerElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calcular espacios disponibles
      const spaceBelow = viewportHeight - triggerRect.bottom - 20; // 20px de margen
      const spaceAbove = triggerRect.top - 20; // 20px de margen
      const spaceLeft = triggerRect.left;
      const spaceRight = viewportWidth - triggerRect.right;
      
      // Altura mínima del dropdown (header + 3 items + footer)
      const minHeight = 120 + 3 * 40 + 60; // ~300px
      
      // Determinar posición vertical
      let newPosition: 'bottom' | 'top' = 'bottom';
      let availableHeight = spaceBelow;
      
      if (spaceBelow < minHeight && spaceAbove > spaceBelow) {
        newPosition = 'top';
        availableHeight = spaceAbove;
      }
      
      // Calcular altura máxima permitida
      const headerFooterHeight = 120; // Header + Footer
      const maxListHeight = Math.max(160, availableHeight - headerFooterHeight); // Mínimo 4 items
      const calculatedMaxHeight = Math.min(450, headerFooterHeight + maxListHeight);
      
      setPosition(newPosition);
      setMaxHeight(calculatedMaxHeight);
    };

    // Ejecutar cálculo inicial
    setTimeout(calculatePositionAndSize, 10);
    
    // Agregar listeners para recálculo
    window.addEventListener('scroll', calculatePositionAndSize);
    window.addEventListener('resize', calculatePositionAndSize);

    return () => {
      window.removeEventListener('scroll', calculatePositionAndSize);
      window.removeEventListener('resize', calculatePositionAndSize);
    };
  }, []);

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

  return (
    <div
      ref={dropdownRef}
      className={`fixed bg-white border border-gray-200 rounded-lg shadow-2xl z-[70] overflow-hidden`}
      style={{ 
        width: '320px',
        maxHeight: `${maxHeight}px`,
        [position === 'top' ? 'bottom' : 'top']: position === 'top' 
          ? `${window.innerHeight - (triggerElementRef.current?.getBoundingClientRect().top || 0) + 8}px`
          : `${(triggerElementRef.current?.getBoundingClientRect().bottom || 0) + 8}px`,
        left: `${Math.max(10, (triggerElementRef.current?.getBoundingClientRect().left || 0))}px`,
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
  onSave
}) => {
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

  const roleOptions: RoleOption[] = [
    {
      id: 'gerente_apoderado',
      name: 'Gerente/Apoderado',
      color: 'yellow',
      icon: <Crown className="w-4 h-4" />,
      required: true
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

  const [rolePermissions, setRolePermissions] = useState(initialRolePermissions);

  useEffect(() => {
    setAssignedUsers(initialAssignedUsers);
    setHasChanges(false);
    setErrors([]);
  }, [initialAssignedUsers, isOpen]);

  const validateUsers = (): string[] => {
    const validationErrors: string[] = [];
    
    const requiredRoles = roleOptions.filter(role => role.required);
    
    requiredRoles.forEach(requiredRole => {
      const hasUserWithRole = assignedUsers.some(user => user.role === requiredRole.id);
      if (!hasUserWithRole) {
        validationErrors.push(`El rol ${requiredRole.name} es obligatorio y debe ser asignado`);
      }
    });

    const uniqueRoles = ['gerente_apoderado'];
    uniqueRoles.forEach(roleId => {
      const usersWithRole = assignedUsers.filter(user => user.role === roleId);
      if (usersWithRole.length > 1) {
        const roleName = roleOptions.find(r => r.id === roleId)?.name;
        validationErrors.push(`Solo puede haber un usuario con el rol ${roleName}`);
      }
    });

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

  const handleAddUsers = (users: User[]) => {
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
    try {
      await onSave(assignedUsers);
      setHasChanges(false);
      onClose();
    } catch (error) {
      setErrors(['Error al guardar los cambios. Inténtelo nuevamente.']);
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl min-h-[75vh] max-h-[90vh] overflow-hidden flex flex-col">
          
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Gestión de Permisos</h2>
                <p className="text-sm text-gray-500 mt-1">{empresa.nombre} - RUC {empresa.ruc}</p>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isSaving}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'users'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    style={{ width: "150px" }}
                  >
                    Usuarios y Roles
                  </button>
                  <button
                    onClick={() => setActiveTab('permissions')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'permissions'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    style={{ width: "150px" }}
                  >
                    Permisos por Rol
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Contenedor principal con flex-1 */}
          <div className="flex-1 flex flex-col">
          {activeTab === 'users' && (
            <>
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between ">
                  <div className="flex items-center space-x-4">
                    <div className="relative ">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar usuarios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
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
                                    DNI: {user.documento}
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
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
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
                              <GeneralPermissionsEditor
                                currentPermissions={roleConfig?.generalAccess || ''}
                                onSave={(newPermissions) => {
                                  setRolePermissions(prev => prev.map(r => 
                                    r.roleId === role.id 
                                      ? { ...r, generalAccess: newPermissions }
                                      : r
                                  ));
                                  setEditingGeneralPermissions(null);
                                  setHasChanges(true);
                                }}
                                onCancel={() => setEditingGeneralPermissions(null)}
                              />
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
        
        {/* Footer fijo del modal */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>
                  Requerido: <strong>Gerente/Apoderado</strong>
                </span>
                {hasChanges && (
                  <span className="text-amber-600 font-medium">• Cambios no guardados</span>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                disabled={isSaving || !hasChanges}
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
    </div>
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