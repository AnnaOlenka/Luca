import React, { useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import RucModal from '../components/Modals/RucModal';
import ImportCsvModal from '../components/Modals/ImportCsvModal';
import DeleteConfirmModal from '../components/Modals/DeleteConfirmModal';
import EditCompanyModal from '../components/Modals/EditCompanyModal';
import { 
  Building2, 
  Search, 
  Plus, 
  Upload, 
  Shield, 
  FileText, 
  Edit3, 
  Trash2,
  X,
  MoreVertical,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import empresasData from '../data/empresasData.json';
import validCredentialsData from '../data/validCredentials.json';

interface EmpresasProps {
  onNavigate?: (module: string) => void;
}

interface Empresa {
  id: string;
  nombre: string;
  ruc: string;
  estado: string;
  condicion: string;
  completitud: number;
  logo?: string | null;
  personas?: Array<{
    id: number;
    nombre: string;
    iniciales: string;
    cargo: string;
    estado: 'activo' | 'pendiente' | 'inactivo';
  }>;
  tendencia?: {
    porcentaje: number;
    direccion: 'up' | 'down';
    datos: number[];
  };
  semaforoTributario?: {
    estado: 'green' | 'yellow' | 'red';
    texto: string;
  };
  proximaObligacion?: {
    tipo: string;
    mes: string;
    diasRestantes: number;
    vencido: boolean;
  };
}

const PersonasAsignadas: React.FC<{ personas?: Empresa['personas'] }> = ({ personas = [] }) => {
  const [showTooltip, setShowTooltip] = useState<number | null>(null);
  const visiblePersonas = personas.slice(0, 2); // Mostrar solo 2 personas
  const extraCount = personas.length > 2 ? personas.length - 2 : 0;

  
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'border-green-500 bg-green-100';
      case 'pendiente': return 'border-yellow-500 bg-yellow-100';
      case 'inactivo': return 'border-gray-500 bg-gray-100';
      default: return 'border-gray-300 bg-gray-100';
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {visiblePersonas.map((persona, index) => (
        <div 
          key={persona.id}
          className="relative"
          onMouseEnter={() => setShowTooltip(index)}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <div className={`w-12 h-12 rounded-full border-2 ${getEstadoColor(persona.estado)} flex items-center justify-center cursor-pointer transition-transform hover:scale-110`}>
            <span className="text-sm font-semibold text-gray-700">
              {persona.iniciales}
            </span>
          </div>
          
          {showTooltip === index && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-20">
              <div>{persona.nombre}</div>
              <div className="text-gray-300">{persona.cargo}</div>
            </div>
          )}
        </div>
      ))}
      
      {extraCount > 0 && (
        <div className="w-12 h-12 rounded-full border-2 border-blue-500 bg-blue-100 flex items-center justify-center cursor-pointer">
          <span className="text-sm font-semibold text-blue-700">
            +{extraCount}
          </span>
        </div>
      )}
    </div>
  );
};

const MiniChart: React.FC<{ 
  label: string; 
  porcentaje: number; 
  direccion: 'up' | 'down';
  datos: number[];
  color: string;
  isInverted?: boolean;
}> = ({ label, porcentaje, direccion, datos, color, isInverted = false }) => {
  const isPositive = isInverted ? direccion === 'down' : direccion === 'up';
  
  const max = Math.max(...datos);
  const min = Math.min(...datos);
  const range = max - min || 1;
  
  const points = datos.map((value, index) => {
    const x = (index * 32) / (datos.length - 1);
    const y = 12 - ((value - min) / range) * 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="text-center">
      {/* TÍTULO ARRIBA */}
      <div className="text-xs text-gray-500 font-medium mb-1 truncate">{label}</div>
      
      {/* GRÁFICO EN EL MEDIO */}
      <div className="flex justify-center mb-1">
        <svg width="32" height="12" className="flex-shrink-0">
          <polyline
            points={points}
            fill="none"
            stroke={color.includes('green-600') ? "#10b981" : color.includes('red-600') ? "#ef4444" : color.includes('blue-600') ? "#2563eb" : "#9333ea"}
            strokeWidth="1"
          />
          {datos.map((value, index) => {
            const x = (index * 32) / (datos.length - 1);
            const y = 12 - ((value - min) / range) * 10;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="0.5"
                fill={color.includes('green-600') ? "#10b981" : color.includes('red-600') ? "#ef4444" : color.includes('blue-600') ? "#2563eb" : "#9333ea"}
              />
            );
          })}
        </svg>
      </div>

      {/* PORCENTAJE Y FLECHA ABAJO */}
      <div className="flex items-center justify-center space-x-1">
        <span className={`font-bold text-xs ${color}`}>
          {isPositive && !isInverted ? '+' : ''}{porcentaje}%
        </span>
        {isPositive ? (
          <ArrowUp className={`w-3 h-3 ${color.includes('green') ? 'text-green-600' : color.includes('red') ? 'text-red-600' : color.includes('blue') ? 'text-blue-600' : 'text-purple-600'}`} />
        ) : (
          <ArrowDown className={`w-3 h-3 ${color.includes('green') ? 'text-green-600' : color.includes('red') ? 'text-red-600' : color.includes('blue') ? 'text-blue-600' : 'text-purple-600'}`} />
        )}
      </div>
    </div>
  );
};
const SemaforoTributario: React.FC<{ semaforo?: Empresa['semaforoTributario'] }> = ({ semaforo }) => {
  if (!semaforo) return <div className="text-xs text-gray-400">Sin datos</div>;

  const { estado, texto } = semaforo;
  
  const getColor = () => {
    switch (estado) {
      case 'green': return { bg: 'bg-green-500', text: 'text-green-700' };
      case 'yellow': return { bg: 'bg-yellow-500', text: 'text-yellow-700' };
      case 'red': return { bg: 'bg-red-500', text: 'text-red-700' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-700' };
    }
  };

  const colors = getColor();

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${colors.bg}`}></div>
      <span className={`text-xs font-medium ${colors.text} truncate`}>
        {texto}
      </span>
    </div>
  );
};

const ProximaObligacion: React.FC<{ obligacion?: Empresa['proximaObligacion'] }> = ({ obligacion }) => {
  if (!obligacion) return <div className="text-xs text-gray-400">Sin datos</div>;

  const { tipo, mes, diasRestantes, vencido } = obligacion;
  
  const getStyles = () => {
    if (vencido) return { 
      bg: 'bg-red-50', 
      border: 'border-red-200', 
      text: 'text-red-700',
      icon: 'text-red-600'
    };
    if (diasRestantes <= 7) return { 
      bg: 'bg-yellow-50', 
      border: 'border-yellow-200', 
      text: 'text-yellow-700',
      icon: 'text-yellow-600'
    };
    return { 
      bg: 'bg-blue-50', 
      border: 'border-blue-200', 
      text: 'text-blue-700',
      icon: 'text-blue-600'
    };
  };

  const styles = getStyles();

  const getTexto = () => {
    if (vencido) return `Vencido hace ${Math.abs(diasRestantes)} días`;
    return `Faltan ${diasRestantes} días`;
  };

  return (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded-md ${styles.bg} ${styles.border} border`}>
      <Calendar className={`w-3 h-3 ${styles.icon} flex-shrink-0`} />
      <div className="text-xs overflow-hidden">
        <div className={`font-medium ${styles.text} truncate`}>{tipo} {mes}</div>
        <div className={`text-xs ${styles.text} truncate`}>
          {getTexto()}
        </div>
      </div>
    </div>
  );
};

const Empresas: React.FC<EmpresasProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [isRucModalOpen, setIsRucModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | null>(null);
  const [empresaToEdit, setEmpresaToEdit] = useState<Empresa | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompanyForm, setNewCompanyForm] = useState({
    ruc: '',
    usuarioSol: '',
    claveSol: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [validationState, setValidationState] = useState({
    ruc: null as 'valid' | 'invalid' | 'duplicate' | 'inactive' | 'validating' | null,
    credentials: null as 'valid' | 'invalid' | 'validating' | null
  });
  const [businessName, setBusinessName] = useState('');
  const [sunatInfo, setSunatInfo] = useState({ status: '', condition: '' });
  const [empresasList, setEmpresasList] = useState<Empresa[]>([
    ...(empresasData.empresas as Empresa[]).map((empresa, index) => ({
      ...empresa,
      personas: [
        { id: 1, nombre: "Carlos Rodriguez", iniciales: "CR", cargo: "Representante Legal", estado: "activo" as const },
        { id: 2, nombre: "Ana Martinez", iniciales: "AM", cargo: "Contador", estado: "activo" as const },
        { id: 3, nombre: "Luis Gonzalez", iniciales: "LG", cargo: "Asistente", estado: index === 0 ? "pendiente" as const : "activo" as const },
        { id: 4, nombre: "Maria Silva", iniciales: "MS", cargo: "Auditor", estado: "activo" as const }
      ],
      tendencia: { 
        porcentaje: index === 0 ? 12.5 : index === 1 ? -3.2 : 8.7, 
        direccion: index === 1 ? "down" as const : "up" as const, 
        datos: index === 0 ? [65, 78, 85, 92, 88, 95] : index === 1 ? [45, 52, 48, 41, 38, 42] : [30, 35, 40, 45, 50, 48]
      },
      semaforoTributario: { 
        estado: index === 0 ? "yellow" as const : index === 1 ? "green" as const : "red" as const,
        texto: index === 0 ? "2 obligaciones próximas" : index === 1 ? "Sin riesgos" : "1 obligación vencida"
      },
      proximaObligacion: { 
        tipo: index === 0 ? "IGV" : index === 1 ? "Renta" : "IGV", 
        mes: index === 0 ? "Agosto" : index === 1 ? "Setiembre" : "Julio", 
        diasRestantes: index === 0 ? 5 : index === 1 ? 15 : -5, 
        vencido: index === 2 ? true : false
      }
    }))
  ]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  const empresas = empresasList;

// Agregar esta función aquí:
const getCompletitudColor = (completitud: number) => {
  if (completitud <= 25) return '#ef4444'; // red-500
  if (completitud <= 50) return '#eab308'; // yellow-500  
  if (completitud <= 75) return '#f97316'; // orange-500
  return '#22c55e'; // green-500
};
  // Filter empresas based on search term and estado
  const filteredEmpresas = empresas.filter(empresa => {
    const matchesSearch = empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         empresa.ruc.includes(searchTerm);
    const matchesFilter = !filterEstado || empresa.estado.toLowerCase().includes(filterEstado.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'baja provisional por oficio':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'suspendido temporalmente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCondicionColor = (condicion: string) => {
    switch (condicion.toLowerCase()) {
      case 'habido':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'no habido':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'por verificar':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'no hallado se mudo de domicilio':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };



  const toggleDropdown = (empresaId: string) => {
    setOpenDropdownId(openDropdownId === empresaId ? null : empresaId);
  };

  const handleAction = (action: string, empresaId: string, empresaNombre: string) => {
    // Close dropdown after action
    setOpenDropdownId(null);
    
    switch (action) {
      case 'permisos':
        alert(`Gestionar permisos para: ${empresaNombre}`);
        break;
      case 'ficha':
        const empresa = empresas.find(e => e.id === empresaId);
        if (empresa) {
          setSelectedEmpresa(empresa);
          setIsRucModalOpen(true);
        }
        break;
      case 'editar':
        const empresaToEdit = empresas.find(e => e.id === empresaId);
        if (empresaToEdit) {
          setEmpresaToEdit(empresaToEdit);
          setIsEditModalOpen(true);
        }
        break;
      case 'eliminar':
        const empresaToDelete = empresas.find(e => e.id === empresaId);
        if (empresaToDelete) {
          setEmpresaToDelete(empresaToDelete);
          setIsDeleteModalOpen(true);
        }
        break;
      default:
        break;
    }
  };

  const closeRucModal = () => {
    setIsRucModalOpen(false);
    setSelectedEmpresa(null);
  };

  const handleImportCsv = () => {
    setIsImportModalOpen(true);
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
  };

  const handleImportSuccess = (importedCompanies: Empresa[]) => {
    setEmpresasList(prevList => [...prevList, ...importedCompanies]);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEmpresaToDelete(null);
    setIsDeleting(false);
  };

  const handleDeleteConfirm = async () => {
    if (!empresaToDelete) return;
    
    setIsDeleting(true);
    
    // Simulate deletion process with delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Remove company from list
    setEmpresasList(prevList => 
      prevList.filter(empresa => empresa.id !== empresaToDelete.id)
    );
    
    setIsDeleting(false);
    closeDeleteModal();
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEmpresaToEdit(null);
  };

  const handleEditSave = (updatedEmpresa: Empresa) => {
    setEmpresasList(prevList =>
      prevList.map(empresa =>
        empresa.id === updatedEmpresa.id ? updatedEmpresa : empresa
      )
    );
    closeEditModal();
  };

  const handleShowAddForm = () => {
    setShowAddForm(true);
  };

  const handleCancelAddForm = () => {
    setShowAddForm(false);
    setNewCompanyForm({
      ruc: '',
      usuarioSol: '',
      claveSol: ''
    });
    setFormErrors({});
    setValidationState({
      ruc: null,
      credentials: null
    });
    setBusinessName('');
    setSunatInfo({ status: '', condition: '' });
  };

  const validateRuc = (ruc: string) => {
    // Check for duplicates in existing companies
    const isDuplicate = empresasList.some(company => company.ruc === ruc);
    if (isDuplicate) {
      return 'duplicate';
    }

    // Find RUC in valid data
    const rucData = validCredentialsData.validRucs.find(r => r.ruc === ruc);
    
    if (!rucData) {
      return 'invalid';
    }

    if (rucData.status === 'inactive' || rucData.status === 'suspended') {
      return 'inactive';
    }

    return 'valid';
  };

  const validateCredentials = (solUser: string, solPassword: string) => {
    const validCred = validCredentialsData.validCredentials.find(
      cred => cred.solUser === solUser && cred.solPassword === solPassword
    );
    
    return validCred ? 'valid' : 'invalid';
  };

  const validateForm = () => {
    const hasValidRuc = validationState.ruc === 'valid' || validationState.ruc === 'inactive';
    const hasValidCredentials = validationState.credentials === 'valid';
    
    return hasValidRuc && hasValidCredentials && 
           newCompanyForm.ruc.trim() && 
           newCompanyForm.usuarioSol.trim() && 
           newCompanyForm.claveSol.trim();
  };

  const handleSubmitNewCompany = async () => {
    if (!validateForm()) return;
    
    const newCompany: Empresa = {
      id: `new-${Date.now()}`,
      nombre: businessName || `Empresa ${newCompanyForm.ruc}`,
      ruc: newCompanyForm.ruc,
      estado: 'Activo',
      condicion: 'Habido',
      completitud: 25,
      logo: null
    };
    
    setEmpresasList(prevList => [...prevList, newCompany]);
    handleCancelAddForm();
  };

  const handleFormInputChange = (field: string, value: string) => {
    setNewCompanyForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Handle RUC validation
    if (field === 'ruc') {
      if (!value.trim()) {
        setValidationState(prev => ({ ...prev, ruc: null }));
        setBusinessName('');
        setSunatInfo({ status: '', condition: '' });
        setFormErrors(prev => ({ ...prev, ruc: '' }));
      } else if (value.length === 11) {
        setValidationState(prev => ({ ...prev, ruc: 'validating' }));
        setFormErrors(prev => ({ ...prev, ruc: 'Validando RUC...' }));
        
        // Simulate validation delay
        setTimeout(() => {
          const rucValidation = validateRuc(value);
          setValidationState(prev => ({ ...prev, ruc: rucValidation }));
          
          if (rucValidation === 'valid' || rucValidation === 'inactive') {
            const rucData = validCredentialsData.validRucs.find(r => r.ruc === value);
            setBusinessName(rucData?.businessName || '');
            setSunatInfo({
              status: rucData?.sunatStatus || '',
              condition: rucData?.sunatCondition || ''
            });
            setFormErrors(prev => ({ ...prev, ruc: '' }));
          } else if (rucValidation === 'duplicate') {
            setFormErrors(prev => ({ ...prev, ruc: 'Este RUC ya está registrado' }));
          } else if (rucValidation === 'invalid') {
            setFormErrors(prev => ({ ...prev, ruc: 'RUC no encontrado en SUNAT' }));
          }
          
          // Auto-validate credentials if they exist and RUC is valid
          if ((rucValidation === 'valid' || rucValidation === 'inactive') && 
              newCompanyForm.usuarioSol.trim() && newCompanyForm.claveSol.trim()) {
            setTimeout(() => {
              const credValidation = validateCredentials(newCompanyForm.usuarioSol, newCompanyForm.claveSol);
              setValidationState(prev => ({ ...prev, credentials: credValidation }));
              
              if (credValidation === 'invalid') {
                setFormErrors(prev => ({ 
                  ...prev, 
                  usuarioSol: 'Credenciales incorrectas',
                  claveSol: 'Credenciales incorrectas'
                }));
              } else {
                setFormErrors(prev => ({ 
                  ...prev, 
                  usuarioSol: '',
                  claveSol: ''
                }));
              }
            }, 1000);
          }
        }, 1500);
      } else {
        setValidationState(prev => ({ ...prev, ruc: null }));
        setBusinessName('');
        setSunatInfo({ status: '', condition: '' });
        if (value.length > 0 && value.length < 11) {
          setFormErrors(prev => ({ ...prev, ruc: 'El RUC debe tener 11 dígitos' }));
        } else {
          setFormErrors(prev => ({ ...prev, ruc: '' }));
        }
      }
    }

    // Handle credentials validation
    if (field === 'usuarioSol' || field === 'claveSol') {
      const updatedForm = { ...newCompanyForm, [field]: value };
      
      // Clear previous credential errors
      setFormErrors(prev => ({ 
        ...prev, 
        usuarioSol: prev.usuarioSol === 'Credenciales incorrectas' ? '' : prev.usuarioSol,
        claveSol: prev.claveSol === 'Credenciales incorrectas' ? '' : prev.claveSol
      }));
      
      // If both fields are empty, clear validation state
      if (!updatedForm.usuarioSol.trim() && !updatedForm.claveSol.trim()) {
        setValidationState(prev => ({ ...prev, credentials: null }));
      }
      // If one field is empty, don't validate yet
      else if (!updatedForm.usuarioSol.trim() || !updatedForm.claveSol.trim()) {
        setValidationState(prev => ({ ...prev, credentials: null }));
      }
      // If both fields have content and RUC is valid, validate
      else if (updatedForm.usuarioSol.trim() && updatedForm.claveSol.trim() && 
               (validationState.ruc === 'valid' || validationState.ruc === 'inactive')) {
        setValidationState(prev => ({ ...prev, credentials: 'validating' }));
        
        // Set validating message immediately
        setFormErrors(prev => ({ 
          ...prev, 
          usuarioSol: 'Validando credenciales...',
          claveSol: 'Validando credenciales...'
        }));

        setTimeout(() => {
          const credValidation = validateCredentials(updatedForm.usuarioSol, updatedForm.claveSol);
          setValidationState(prev => ({ ...prev, credentials: credValidation }));
          
          if (credValidation === 'invalid') {
            setFormErrors(prev => ({ 
              ...prev, 
              usuarioSol: 'Credenciales incorrectas',
              claveSol: 'Credenciales incorrectas'
            }));
          } else {
            setFormErrors(prev => ({ 
              ...prev, 
              usuarioSol: '',
              claveSol: ''
            }));
          }
        }, 1500);
      }
    }
  };

  return (
    <DashboardLayout currentModule="empresas" onNavigate={onNavigate}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 text-left">Gestionar Empresas</h1>
            <p className="text-gray-600 text-left">Administra todas tus empresas y sus datos</p>
          </div>
        </div>

        {/* Search Bar and Action Buttons */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar and Filter */}
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre o RUC de empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Filter */}
              <select 
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="baja provisional por oficio">Baja Provisional por Oficio</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleImportCsv}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Importar por CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Add Company Button/Form */}
        <div className="max-w-4xl mx-auto">
          {!showAddForm ? (
            <div className="mb-6 w-full">
              <button
                onClick={handleShowAddForm}
                className="w-full flex items-center justify-center py-3 px-6 border-2 border-dashed border-gray-200 text-gray-500 rounded-lg hover:border-blue-400 hover:text-blue-500 transition-all duration-200 bg-white"
              >
                <Plus className="w-5 h-4 mr-2" />
                <span className="font-medium">Agregar otra empresa</span>
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="bg-white border-2 border-blue-200 rounded-lg p-6 mb-6 w-full max-w-2xl">
                <div className="flex items-center justify-center mb-6 relative">
                  <h3 className="text-lg font-semibold text-gray-900">Agrega nueva empresa</h3>
                  <button
                    onClick={handleCancelAddForm}
                    className="absolute right-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* RUC Input */}
                  <div className="max-w-md mx-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                      RUC *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newCompanyForm.ruc}
                        onChange={(e) => handleFormInputChange('ruc', e.target.value.replace(/\D/g, '').slice(0, 11))}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationState.ruc === 'invalid' || validationState.ruc === 'duplicate' ? 'border-red-500' :
                          validationState.ruc === 'valid' ? 'border-green-500' :
                          validationState.ruc === 'inactive' ? 'border-yellow-500' :
                          validationState.ruc === 'validating' ? 'border-blue-500' : 'border-gray-300'
                        }`}
                        placeholder="20123456789"
                        maxLength={11}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {validationState.ruc === 'validating' && (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {validationState.ruc === 'valid' && (
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                        {validationState.ruc === 'inactive' && (
                          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">⚠</span>
                          </div>
                        )}
                        {(validationState.ruc === 'invalid' || validationState.ruc === 'duplicate') && (
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✕</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {businessName && (
                      <p className="text-sm text-gray-600 mt-2 text-center">{businessName}</p>
                    )}
                    {formErrors.ruc && (
                      <p className={`text-sm mt-1 text-center ${
                        validationState.ruc === 'validating' ? 'text-blue-500' : 'text-red-500'
                      }`}>
                        {formErrors.ruc}
                      </p>
                    )}
                    {sunatInfo.status && (
                      <div className="mt-2 text-xs text-center">
                        <span className={`px-2 py-1 rounded-full ${
                          sunatInfo.status === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {sunatInfo.status}
                        </span>
                        <span className={`ml-2 px-2 py-1 rounded-full ${
                          sunatInfo.condition === 'HABIDO' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {sunatInfo.condition}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Credentials Section */}
                  <div className="max-w-md mx-auto">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">Credenciales SUNAT</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                          Usuario SOL *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={newCompanyForm.usuarioSol}
                            onChange={(e) => handleFormInputChange('usuarioSol', e.target.value)}
                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                              validationState.credentials === 'invalid' ? 'border-red-500' :
                              validationState.credentials === 'valid' ? 'border-green-500' :
                              validationState.credentials === 'validating' ? 'border-blue-500' : 'border-gray-300'
                            }`}
                            placeholder="USUARIO01"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                            {validationState.credentials === 'validating' && (
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            )}
                            {validationState.credentials === 'valid' && (
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                            {validationState.credentials === 'invalid' && (
                              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✕</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {formErrors.usuarioSol && (
                          <p className="text-red-500 text-xs mt-1 text-center">{formErrors.usuarioSol}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                          Clave SOL *
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            value={newCompanyForm.claveSol}
                            onChange={(e) => handleFormInputChange('claveSol', e.target.value)}
                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                              validationState.credentials === 'invalid' ? 'border-red-500' :
                              validationState.credentials === 'valid' ? 'border-green-500' :
                              validationState.credentials === 'validating' ? 'border-blue-500' : 'border-gray-300'
                            }`}
                            placeholder="••••••••"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                            {validationState.credentials === 'validating' && (
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            )}
                            {validationState.credentials === 'valid' && (
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                            {validationState.credentials === 'invalid' && (
                              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✕</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {formErrors.claveSol && (
                          <p className="text-red-500 text-xs mt-1 text-center">{formErrors.claveSol}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-3 mt-6">
                  <button
                    onClick={handleCancelAddForm}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleSubmitNewCompany}
                    disabled={!validateForm()}
                    className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                      validateForm()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Empresa
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

       {/* Empresas List - LAYOUT HORIZONTAL OPTIMIZADO */}
        <div className="w-[80%] max-w-5xl mx-auto space-y-2">
          {filteredEmpresas.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterEstado
                    ? 'No se encontraron empresas'
                    : 'No hay empresas registradas'}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm || filterEstado
                    ? 'Intenta ajustar los criterios de búsqueda'
                    : 'Comienza agregando tu primera empresa para gestionar sus obligaciones tributarias.'}
                </p>
                {!searchTerm && !filterEstado && (
                  <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors mx-auto">
                    <Plus className="w-5 h-5" />
                    <span>Agregar Primera Empresa</span>
                  </button>
                )}
              </div>
            </div>
  ) : (
    <div className="space-y-2">
      {filteredEmpresas.map((empresa) => (
        <div
          key={empresa.id}
          className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-gray-300 p-4"
        >
          {/* Contenedor fila optimizado */}
          <div className="flex items-center justify-between w-full">

            {/* 1️⃣ Columna Empresa */}
            <div
              style={{ width: '230px', minWidth: '230px', maxWidth: '230px' }}
              className="flex-shrink-0 flex items-center space-x-2 overflow-hidden"
            >
              {/* Logo */}
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-white" />
              </div>

              {/* Card interna */}
              <div
                style={{ width: '168px', minWidth: '168px', maxWidth: '168px' }}
                className="overflow-hidden"
              >
                {/* Progress bar */}
              <span className="text-xs font-medium text-gray-600 mb-1 text-left">Datos completados </span>
              <div className="flex items-center mb-2">
                <div
                  className="flex-1 bg-gray-200 rounded-full h-1.5 mr-2"
                  style={{ maxWidth: '130px' }}
                >
                  
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                    width: `${empresa.completitud}%`,
                    backgroundColor: getCompletitudColor(empresa.completitud)
                  }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-8 text-right">
                  {empresa.completitud}%
                </span>
              </div>

                {/* Nombre */}
                <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                  {empresa.nombre}
                </h3>

                {/* RUC */}
                <p className="text-xs text-gray-500 mb-2 truncate">
                  RUC: {empresa.ruc}
                </p>

                {/* Estados con flex-wrap mejorado */}
                <div className="flex flex-wrap justify-between">
                  <span
                    className={`text-xs rounded border font-medium text-center ${getEstadoColor(empresa.estado)}`}
                    style={{
                      padding: '2px 6px',
                      maxWidth: '100%',
                      wordBreak: 'break-word',
                      lineHeight: '1.2',
                    }}
                  >
                    {empresa.estado}
                  </span>
                  <span
                    className={`text-xs rounded border font-medium text-center ${getCondicionColor(empresa.condicion)}`}
                    style={{
                      padding: '2px 6px',
                      maxWidth: '100%',
                      wordBreak: 'break-word',
                      lineHeight: '1.2',
                    }}
                  >
                    {empresa.condicion}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 3️⃣ Estado de la Empresa */}
            <div style={{ width: '90px' }} className="flex-shrink-0 overflow-hidden">
              <div className="text-center">
                <div className="text-xs text-gray-500 font-medium mb-1">Estado</div>
                <span 
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    empresa.estado.toLowerCase() === 'activo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {empresa.estado.toLowerCase() === 'activo' ? 'Activo' : 'No Activo'}
                </span>
              </div>
            </div>

            {/* 2️⃣ Personas Asignadas */}
            <div
              style={{ width: '100px', minWidth: '100px', maxWidth: '0px' }}
              className="flex-shrink-0 overflow-hidden"
            >
               {/* TÍTULO */}
              <div className="text-xs text-gray-500 font-medium mb-1 text-center">Asignados</div>
              <PersonasAsignadas personas={empresa.personas} />
            </div>

            {/* 3️⃣ Ingresos */}
            <div style={{ width: '80px' }} className="flex-shrink-0 overflow-hidden">
              <MiniChart
                label="Ingresos"
                porcentaje={empresa.tendencia?.porcentaje || 12.5}
                direccion="up"
                datos={[65, 78, 85, 92, 88, 95]}
                color="text-green-600"
              />
            </div>

            {/* 4️⃣ Egresos */}
            <div style={{ width: '80px' }} className="flex-shrink-0 overflow-hidden">
              <MiniChart
                label="Egresos"
                porcentaje={-8.75}
                direccion="down"
                datos={[20, 25, 22, 18, 15, 12]}
                color="text-red-600"
                isInverted
              />
            </div>

            {/* 5️⃣ IGV */}
            <div style={{ width: '80px' }} className="flex-shrink-0 overflow-hidden">
              <MiniChart
                label="IGV"
                porcentaje={5}
                direccion="up"
                datos={[8, 12, 15, 11, 9, 14]}
                color="text-blue-600"
              />
            </div>

            {/* 6️⃣ Rentas */}
            <div style={{ width: '80px' }} className="flex-shrink-0 overflow-hidden">
              <MiniChart
                label="Rentas"
                porcentaje={7.5}
                direccion="up"
                datos={[12, 14, 16, 18, 20, 22]}
                color="text-purple-600"
              />
            </div>

            {/* 7️⃣ Estado Tributario */}
            <div style={{ width: '180px' }} className="flex-shrink-0 overflow-hidden">
              <SemaforoTributario semaforo={empresa.semaforoTributario} />
            </div>

            {/* 8️⃣ Próximo Vencimiento */}
            <div style={{ width: '150px' }} className="flex-shrink-0 overflow-hidden">
              <ProximaObligacion obligacion={empresa.proximaObligacion} />
            </div>

            {/* 9️⃣ Menu de acciones */}
            <div className="flex-shrink-0 ml-auto">
              <div className="relative">
                <button
                  onClick={() => toggleDropdown(empresa.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {openDropdownId === empresa.id && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setOpenDropdownId(null)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-40">
                      <button
                        onClick={() =>
                          handleAction('permisos', empresa.id, empresa.nombre)
                        }
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-t-lg"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Gestionar Permisos</span>
                      </button>

                      <button
                        onClick={() =>
                          handleAction('ficha', empresa.id, empresa.nombre)
                        }
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 border-t border-gray-100 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Ver Ficha RUC</span>
                      </button>

                      <button
                        onClick={() =>
                          handleAction('editar', empresa.id, empresa.nombre)
                        }
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 border-t border-gray-100 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Editar Empresa</span>
                      </button>

                      <button
                        onClick={() =>
                          handleAction('eliminar', empresa.id, empresa.nombre)
                        }
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 border-t border-gray-100 transition-colors rounded-b-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar Empresa</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

        {/* Summary Footer */}
        {filteredEmpresas.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total: {filteredEmpresas.length} empresas</span>
              <div className="flex items-center space-x-4">
                <span>Activas: {filteredEmpresas.filter(e => e.estado.toLowerCase() === 'activo').length}</span>
                <span>Inactivas: {filteredEmpresas.filter(e => e.estado.toLowerCase() !== 'activo').length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RUC Modal */}
      {selectedEmpresa && (
        <RucModal
          isOpen={isRucModalOpen}
          onClose={closeRucModal}
          empresa={selectedEmpresa}
        />
      )}

      {/* Import CSV Modal */}
      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={closeImportModal}
        onImportSuccess={handleImportSuccess}
      />

      {/* Delete Confirmation Modal */}
      {empresaToDelete && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          companyName={empresaToDelete.nombre}
          isDeleting={isDeleting}
        />
      )}

      {/* Edit Company Modal */}
      {empresaToEdit && (
        <EditCompanyModal
          empresa={empresaToEdit}
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSave={handleEditSave}
        />
      )}
    </DashboardLayout>
  );
};

export default Empresas;