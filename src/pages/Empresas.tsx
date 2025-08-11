import React, { useState, useRef, useEffect } from 'react';
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
  ArrowDown,
  User,
  Mail,
  Settings,
  UserMinus,
  Clock,
  AlertTriangle,
  ExternalLink,
  Bell,
  CheckCircle
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
  // Propiedades de credenciales
  usuarioSol?: string;
  claveSol?: string;
  credentialsStatus?: 'valid' | 'invalid' | 'checking' | 'idle';
  credentialsValid?: boolean;
  personas?: Array<{
    id: number;
    nombre: string;
    iniciales: string;
    cargo: string;
    estado: 'activo' | 'pendiente' | 'inactivo';
    email?: string;        // Nuevo campo
    telefono?: string;     // Nuevo campo
    avatar?: string;       // Nuevo campo
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

// Popover para persona individual
const PersonaPopover: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  persona: any | null;
  position: { top: number; left: number };
}> = ({ isOpen, onClose, persona, position }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

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
      // Bloquear scroll del body de manera más robusta
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      
      // Prevenir scroll con rueda del mouse
      const preventScroll = (e: WheelEvent) => e.preventDefault();
      document.addEventListener('wheel', preventScroll, { passive: false });
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('wheel', preventScroll);
      };
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      // Cleanup al desmontar
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !persona) return null;

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'border-green-500 bg-green-100 text-green-700';
      case 'pendiente': return 'border-yellow-500 bg-yellow-100 text-yellow-700';
      case 'inactivo': return 'border-gray-500 bg-gray-100 text-gray-700';
      default: return 'border-gray-300 bg-gray-100 text-gray-700';
    }
  };

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-64"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
{/* Header compacto con avatar e info al lado */}
<div className="px-4 py-4 border-b border-gray-200">
  <div className="flex items-start justify-between">
    {/* Contenido principal */}
    <div className="flex items-center space-x-3 flex-1">
      {/* Avatar */}
      <div className={`w-12 h-12 rounded-full border-2 ${getEstadoColor(persona.estado)} flex items-center justify-center flex-shrink-0`}>
        {persona.avatar ? (
          <img src={persona.avatar} alt={persona.nombre} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="text-sm font-bold">
            {persona.iniciales}
          </span>
        )}
      </div>
      
      {/* Info al lado */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">
          {persona.nombre}
        </h3>
        
        {/* Cargo y estado en la misma línea */}
        <div className="flex items-center justify-between mt-1 gap-4">
          <p className="text-xs text-gray-600 truncate">
            {persona.cargo}
          </p>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            persona.estado === 'activo' ? 'bg-green-100 text-green-800' :
            persona.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {persona.estado.charAt(0).toUpperCase() + persona.estado.slice(1)}
          </span>
        </div>
        
        {/* Email abajo */}
        {persona.email && (
          <div className="flex items-center space-x-1 text-xs text-gray-500 mt-2">
            <Mail className="w-3 h-3" />
            <span className="truncate">{persona.email}</span>
          </div>
        )}
      </div>
    </div>
    
    {/* Botón cerrar más pequeño */}
    <button
      onClick={onClose}
      className="  border-0 outline-none text-gray-400 hover:text-gray-600 hover:bg-gray-100  p-0.5 transition-colors ml-2 flex-shrink-0"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
</div>

      {/* Acciones - Solo las 3 principales */}
      {/* Acciones */}
<div className="p-2">
  <div className="space-y-1">
    <button
      onClick={() => {
        alert(`Ver perfil completo de ${persona.nombre}`);
        onClose();
      }}
      className=" border-0 outline-none w-full flex items-center space-x-3 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <User className="w-4 h-4 text-gray-400" />
      <span>Ver perfil completo</span>
    </button>
    
    <button
      onClick={() => {
        alert(`Configurar permisos de ${persona.nombre}`);
        onClose();
      }}
      className=" border-0 outline-none w-full flex items-center space-x-3 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <Settings className="w-4 h-4 text-gray-400" />
      <span>Configurar permisos</span>
    </button>
    
    <button
      onClick={() => {
        alert(`Quitar a ${persona.nombre}`);
        onClose();
      }}
      className="border-0 outline-none w-full flex items-center space-x-3 px-3 py-2 text-xs text-red-600 hover:bg-red-50  transition-colors"
    >
      <UserMinus className="w-4 h-4" />
      <span>Quitar asignado</span>
    </button>
  </div>
</div>
    </div>
  );
};

// Popover para lista completa
const ListaPersonasPopover: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  personas: any[];
  position: { top: number; left: number };
}> = ({ isOpen, onClose, personas, position }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

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
      // Bloquear scroll del body de manera más robusta
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      
      // Prevenir scroll con rueda del mouse
      const preventScroll = (e: WheelEvent) => e.preventDefault();
      document.addEventListener('wheel', preventScroll, { passive: false });
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('wheel', preventScroll);
      };
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      // Cleanup al desmontar
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen, onClose]);

  // Filtrar personas
  const filteredPersonas = personas.filter(persona => 
    persona.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    persona.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'border-green-500 bg-green-100';
      case 'pendiente': return 'border-yellow-500 bg-yellow-100';
      case 'inactivo': return 'border-gray-500 bg-gray-100';
      default: return 'border-gray-300 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-72"
      style={{
        top: position.top,
        left: position.left,
        maxHeight: '300px',
      }}
    >{/* Header compacto */}
<div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
  <div className="flex items-center justify-between">
    {/* Contenido principal */}
    <div className="flex-1">
      <h3 className="text-sm font-semibold text-gray-900">
        Usuarios asignados
      </h3>
      <p className="text-xs text-gray-500 mt-0.5">
        {personas.length} asignados total
      </p>
    </div>
    
    {/* Botón cerrar con su propio espacio */}
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-full p-1 transition-colors shadow-sm ml-2 flex-shrink-0"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
</div>

{/* Búsqueda compacta */}
<div className="px-4 py-1 border-b border-gray-200">
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
    <input
      type="text"
      placeholder="Buscar miembros"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full h-4 pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
</div>

      {/* Lista compacta de personas */}
      <div className="px-3 py-2 max-h-48 overflow-y-auto">
        <div className="mb-2">
          <h4 className="text-xs font-medium text-gray-700 mb-2">
            Asignados de la empresa
          </h4>
          
          {filteredPersonas.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-gray-500 text-xs">
                {searchTerm ? 'No se encontraron miembros' : 'No hay miembros asignados'}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredPersonas.map((persona) => (
                <div key={persona.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {/* Avatar más pequeño */}
                    <div className={`w-10 h-10 rounded-full border-2 ${getEstadoColor(persona.estado)} flex items-center justify-center flex-shrink-0`}>
                      {persona.avatar ? (
                        <img src={persona.avatar} alt={persona.nombre} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-gray-700">
                          {persona.iniciales}
                        </span>
                      )}
                    </div>

                    {/* Información compacta */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {persona.nombre}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {persona.cargo}
                      </p>
                    </div>
                  </div>

                  {/* Botón quitar */}
                  <button
                    onClick={() => {
                      alert(`Quitar a ${persona.nombre}`);
                      onClose();
                    }}
                    className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-2"
                    title="Quitar asignado"
                  >
                    <UserMinus className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer compacto */}
      <div className="px-3 py-1.5 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <p className="text-xs text-gray-500 text-center">
          {personas.length} miembros
        </p>
      </div>
    </div>
  );
};
const PersonasAsignadas: React.FC<{ 
  personas?: Empresa['personas'];
  empresaNombre?: string;
  empresaId?: string;
}> = ({ personas = [], empresaNombre = "Empresa", empresaId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState<number | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<any | null>(null);
  const [isPersonaPopoverOpen, setIsPersonaPopoverOpen] = useState(false);
  const [isListaPopoverOpen, setIsListaPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const clickedElementRef = useRef<HTMLElement | null>(null);
 

  // Efecto para recalcular posición cuando cambie el layout o haya scroll
  useEffect(() => {
    const recalculatePosition = () => {
      if (clickedElementRef.current && (isPersonaPopoverOpen || isListaPopoverOpen)) {
        const newPosition = calculatePopoverPosition(clickedElementRef.current);
        setPopoverPosition(newPosition);
      }
    };

    // Listener para cambios en el layout
    const resizeObserver = new ResizeObserver(recalculatePosition);
    if (document.body) {
      resizeObserver.observe(document.body);
    }

    // Listener para scroll con throttling
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(recalculatePosition, 16); // ~60fps
    };

    // Agregar listeners
    window.addEventListener('scroll', handleScroll, true); // true para capturar en fase de captura
    document.addEventListener('scroll', handleScroll, true);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('scroll', handleScroll, true);
      clearTimeout(scrollTimeout);
    };
  }, [isPersonaPopoverOpen, isListaPopoverOpen]);

  // Limpiar referencia cuando se cierren todos los popovers
  useEffect(() => {
    if (!isPersonaPopoverOpen && !isListaPopoverOpen) {
      clickedElementRef.current = null;
    }
  }, [isPersonaPopoverOpen, isListaPopoverOpen]);
  
  const visiblePersonas = personas.slice(0, 2);
  const extraCount = personas.length > 2 ? personas.length - 2 : 0;
      
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'border-green-500 bg-green-100';
      case 'pendiente': return 'border-yellow-500 bg-yellow-100';
      case 'inactivo': return 'border-gray-500 bg-gray-100';
      default: return 'border-gray-300 bg-gray-100';
    }
  };

  const calculatePopoverPosition = (element: HTMLElement) => {
    // Validar que el elemento existe y está en el DOM
    if (!element || !element.getBoundingClientRect) {
      return { top: 0, left: 0 };
    }
    
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Verificar si hay suficiente espacio a la derecha para el popover
    const viewportWidth = window.innerWidth;
    const popoverWidth = 280; // Ancho estimado del popover
    const spaceToRight = viewportWidth - rect.right;
    
    let leftPosition = rect.left + scrollLeft - 50;
    
    // Si no hay suficiente espacio a la derecha, ajustar hacia la izquierda
    if (spaceToRight < popoverWidth) {
      leftPosition = rect.right + scrollLeft - popoverWidth + 10;
    }
    
    // Asegurar que no se salga del borde izquierdo
    leftPosition = Math.max(10, leftPosition);
    
    return {
      top: rect.bottom + scrollTop + 8, // 8px gap debajo del círculo
      left: leftPosition,
    };
  };

  const handlePersonaClick = (persona: any, event: React.MouseEvent<HTMLDivElement>) => {
    // Cerrar otros popovers primero
    setIsListaPopoverOpen(false);
    
    // Guardar referencia del nuevo elemento clickeado
    clickedElementRef.current = event.currentTarget;
    
    // Calcular posición inmediatamente
    const position = calculatePopoverPosition(event.currentTarget);
    setPopoverPosition(position);
    setSelectedPersona(persona);
    setIsPersonaPopoverOpen(true);
    setShowTooltip(null); // Ocultar tooltip
  };

  const handleExtraClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Cerrar otros popovers primero
    setIsPersonaPopoverOpen(false);
    setSelectedPersona(null);
    
    // Guardar referencia del nuevo elemento clickeado
    clickedElementRef.current = event.currentTarget;
    
    // Calcular posición inmediatamente
    const position = calculatePopoverPosition(event.currentTarget);
    setPopoverPosition(position);
    setIsListaPopoverOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-center space-x-1">
        {visiblePersonas.map((persona, index) => (
          <div 
            key={persona.id}
            className="relative"
            onMouseEnter={() => !isPersonaPopoverOpen && setShowTooltip(index)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <div 
              className={`w-10 h-10 rounded-full border-2 ${getEstadoColor(persona.estado)} flex items-center justify-center cursor-pointer transition-transform hover:scale-110`}
              onClick={(e) => handlePersonaClick(persona, e)}
            >
              <span className="text-sm font-semibold text-gray-700">
                {persona.iniciales}
              </span>
            </div>
                      
            {showTooltip === index && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs whitespace-nowrap z-20">
                <div>{persona.nombre}</div>
                <div className="text-gray-300">{persona.cargo}</div>
              </div>
            )}
          </div>
        ))}
              
        {extraCount > 0 && (
          <div 
            className="w-10 h-10 rounded-full border-2 border-blue-500 bg-blue-100 flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
            onClick={handleExtraClick}
          >
            <span className="text-sm font-semibold text-blue-700">
              +{extraCount}
            </span>
          </div>
        )}
      </div>

      {/* Popover individual */}
      <PersonaPopover
        isOpen={isPersonaPopoverOpen}
        onClose={() => {
          setIsPersonaPopoverOpen(false);
          setSelectedPersona(null);
        }}
        persona={selectedPersona}
        position={popoverPosition}
      />

      {/* Popover lista completa */}
      <ListaPersonasPopover
        isOpen={isListaPopoverOpen}
        onClose={() => setIsListaPopoverOpen(false)}
        personas={personas}
        position={popoverPosition}
      />
    </>
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
    const x = (index * 48) / (datos.length - 1);
    const y = 20 - ((value - min) / range) * 16;
    return `${x},${y}`;
  }).join(' ');

  // Para el área, necesitamos agregar puntos en la base
  const areaPoints = `${points} 48,20 0,20`;
  
  // Determinar el color base
  const getColor = () => {
    if (color.includes('green-600')) return "#10b981";
    if (color.includes('red-600')) return "#ef4444"; 
    if (color.includes('blue-600')) return "#2563eb";
    return "#9333ea";
  };
  
  const baseColor = getColor();
  
  return (
    <div className="text-center">
      {/* TÍTULO ARRIBA */}
      <div className="text-xs text-gray-500 font-medium mb-1 truncate">{label}</div>
      
      {/* GRÁFICO EN EL MEDIO */}
      <div className="flex justify-center mb-1">
        <svg width="48" height="20" className="flex-shrink-0">
          {/* Área sombreada */}
          <polygon
            points={areaPoints}
            fill={baseColor}
            fillOpacity="0.2"
          />
          
          {/* Línea principal */}
          <polyline
            points={points}
            fill="none"
            stroke={baseColor}
            strokeWidth="1"
          />
          
          {/* Puntos */}
          {datos.map((value, index) => {
            const x = (index * 48) / (datos.length - 1);
            const y = 20 - ((value - min) / range) * 16;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="0.8"
                fill={baseColor}
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

// Popover para próxima obligación
const ProximaObligacionPopover: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  obligacion: Empresa['proximaObligacion'] | null;
  position: { top: number; left: number };
}> = ({ isOpen, onClose, obligacion, position }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

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
      // Bloquear scroll del body de manera robusta
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      
      // Prevenir scroll con rueda del mouse
      const preventScroll = (e: WheelEvent) => e.preventDefault();
      document.addEventListener('wheel', preventScroll, { passive: false });
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('wheel', preventScroll);
      };
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      // Cleanup al desmontar
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !obligacion) return null;

  const { tipo, mes, diasRestantes, vencido } = obligacion;

  const getStyles = () => {
    if (vencido) return {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-600',
      iconBg: 'bg-red-100'
    };
    if (diasRestantes <= 7) return {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    };
    return {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100'
    };
  };

  const styles = getStyles();

  const getTexto = () => {
    if (vencido) return `Vencido hace ${Math.abs(diasRestantes)} días`;
    return `Faltan ${diasRestantes} días`;
  };

  const getFechaVencimiento = () => {
    const hoy = new Date();
    const fechaVencimiento = new Date(hoy);
    fechaVencimiento.setDate(hoy.getDate() + diasRestantes);
    return fechaVencimiento.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPrioridad = () => {
    if (vencido) return { texto: 'URGENTE', color: 'text-red-600', bg: 'bg-red-100' };
    if (diasRestantes <= 3) return { texto: 'ALTA', color: 'text-red-600', bg: 'bg-red-100' };
    if (diasRestantes <= 7) return { texto: 'MEDIA', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { texto: 'NORMAL', color: 'text-blue-600', bg: 'bg-blue-100' };
  };

  const prioridad = getPrioridad();

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-80"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {/* Header */}
      <div className={`px-4 py-4 border-b border-gray-200 ${styles.bg} rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
              {vencido ? (
                <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
              ) : (
                <Calendar className={`w-5 h-5 ${styles.icon}`} />
              )}
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${styles.text}`}>
                {tipo} - {mes} 2024
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${prioridad.bg} ${prioridad.color}`}>
                  {prioridad.texto}
                </span>
                <span className={`text-xs ${styles.text}`}>
                  {getTexto()}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-full p-1 transition-colors ml-2 flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Detalles */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Fecha exacta con campanita */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Fecha de vencimiento</p>
                <p className="text-xs text-gray-600 capitalize">{getFechaVencimiento()}</p>
              </div>
            </div>
            
            {/* Campanita de recordatorio */}
            <div className="flex-shrink-0" title={diasRestantes <= 7 && !vencido ? 'Recordatorio activo' : 'Recordatorio inactivo'}>
              {diasRestantes <= 7 && !vencido ? (
                <Bell className="w-4 h-4 text-blue-600 fill-current" />
              ) : (
                <Bell className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="flex items-start space-x-3">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Descripción</p>
              <p className="text-xs text-gray-600">
                Declaración y pago de {tipo.toLowerCase()} correspondiente al período {mes.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones en una fila */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex space-x-2">
          <button
            onClick={() => {
              alert(`Abrir calendario para ${tipo} ${mes}`);
              onClose();
            }}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors border-0"
          >
            <Calendar className="w-4 h-4" />
            <span>Calendario</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          
          {!vencido && (
            <button
              onClick={() => {
                alert(`Marcar como completado: ${tipo} ${mes}`);
                onClose();
              }}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors border-0"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Completar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
const ProximaObligacion: React.FC<{ 
  obligacion?: Empresa['proximaObligacion'];
  empresaId?: string;
}> = ({ obligacion, empresaId }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const clickedElementRef = useRef<HTMLElement | null>(null);

  // Efecto para recalcular posición cuando cambie el layout o haya scroll
  useEffect(() => {
    const recalculatePosition = () => {
      if (clickedElementRef.current && isPopoverOpen) {
        const newPosition = calculatePopoverPosition(clickedElementRef.current);
        setPopoverPosition(newPosition);
      }
    };

    // Listener para cambios en el layout
    const resizeObserver = new ResizeObserver(recalculatePosition);
    if (document.body) {
      resizeObserver.observe(document.body);
    }

    // Listener para scroll con throttling
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(recalculatePosition, 16); // ~60fps
    };

    // Agregar listeners
    window.addEventListener('scroll', handleScroll, true); // true para capturar en fase de captura
    document.addEventListener('scroll', handleScroll, true);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('scroll', handleScroll, true);
      clearTimeout(scrollTimeout);
    };
  }, [isPopoverOpen]);

  // Limpiar referencia cuando se cierre el popover
  useEffect(() => {
    if (!isPopoverOpen) {
      clickedElementRef.current = null;
    }
  }, [isPopoverOpen]);

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

  const calculatePopoverPosition = (element: HTMLElement) => {
    // Validar que el elemento existe y está en el DOM
    if (!element || !element.getBoundingClientRect) {
      return { top: 0, left: 0 };
    }
    
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Verificar si hay suficiente espacio a la derecha para el popover
    const viewportWidth = window.innerWidth;
    const popoverWidth = 320; // Ancho estimado del popover de obligación
    const spaceToRight = viewportWidth - rect.right;
    
    let leftPosition = rect.left + scrollLeft - 150;
    
    // Si no hay suficiente espacio a la derecha, ajustar hacia la izquierda
    if (spaceToRight < popoverWidth) {
      leftPosition = rect.right + scrollLeft - popoverWidth + 10;
    }
    
    // Asegurar que no se salga del borde izquierdo
    leftPosition = Math.max(10, leftPosition);
    
    return {
      top: rect.bottom + scrollTop + 8,
      left: leftPosition,
    };
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Guardar referencia del nuevo elemento clickeado (limpiar referencia anterior)
    clickedElementRef.current = event.currentTarget;
    
    // Calcular posición inmediatamente
    const position = calculatePopoverPosition(event.currentTarget);
    setPopoverPosition(position);
    setIsPopoverOpen(true);
  };

  return (
    <>
      <div 
        className={`flex items-center space-x-1 px-2 py-1 rounded-md ${styles.bg} ${styles.border} border cursor-pointer hover:opacity-80 transition-opacity`}
        onClick={handleClick}
      >
        <Calendar className={`w-3 h-3 ${styles.icon} flex-shrink-0`} />
        <div className="text-xs overflow-hidden">
          <div className={`font-medium ${styles.text} truncate`}>{tipo} {mes}</div>
          <div className={`text-xs ${styles.text} truncate`}>
            {getTexto()}
          </div>
        </div>
      </div>

      <ProximaObligacionPopover
        isOpen={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        obligacion={obligacion}
        position={popoverPosition}
      />
    </>
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
    const estadoLower = estado.toLowerCase().trim();
    switch (estadoLower) {
      case 'activo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'baja provisional por oficio':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'suspendido temporalmente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'no activo':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCondicionColor = (condicion: string) => {
    const condicionLower = condicion.toLowerCase().trim();
    switch (condicionLower) {
      case 'habido':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'no habido':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'por verificar':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'no hallado se mudo de domicilio':
      case 'no hallado se mudó de domicilio':
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
    console.log('🏢 handleEditSave recibió empresa actualizada:', {
      nombre: updatedEmpresa.nombre,
      credentialsStatus: updatedEmpresa.credentialsStatus,
      credentialsValid: updatedEmpresa.credentialsValid,
      usuarioSol: updatedEmpresa.usuarioSol
    });
    
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
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">Agrega nueva empresa</h3>
                    
                    {/* Estado badge */}
                    {validationState.ruc === 'validating' || validationState.credentials === 'validating' ? (
                      <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full flex items-center space-x-1">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Validando...</span>
                      </span>
                    ) : (validationState.ruc === 'invalid' || validationState.ruc === 'duplicate' || validationState.credentials === 'invalid') ? (
                      <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full">
                        No válido
                      </span>
                    ) : (!newCompanyForm.ruc.trim() || !newCompanyForm.usuarioSol.trim() || !newCompanyForm.claveSol.trim()) ? (
                      <span className="text-xs text-yellow-600 font-medium bg-yellow-50 px-2 py-1 rounded-full">
                        Incompleto
                      </span>
                    ) : (validationState.ruc === 'valid' || validationState.ruc === 'inactive') && validationState.credentials === 'valid' ? (
                      <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                        {validationState.ruc === 'inactive' ? 'Verificada (Inactiva)' : 'Verificada'}
                      </span>
                    ) : null}
                  </div>
                  
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
              style={{ width: '270px', minWidth: '270px', maxWidth: '270px' }}
              className="flex-shrink-0 flex items-center space-x-2 overflow-hidden"
            >
              {/* Logo */}
              <div className="w-8 h-8 bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-white" />
              </div>

              {/* Card interna */}
              <div
                style={{ width: '200px', minWidth: '200px', maxWidth: '220px' }}
                className="overflow-hidden"
              >
                {/* Progress bar */}
              <span className="text-xs font-medium text-gray-600 mb-1 text-left">Datos completados </span>
              <div className="flex items-center mb-2">
                <div
                  className="flex-1 bg-gray-200 rounded-full h-1.5 mr-2"
                  style={{ maxWidth: '140px' }}
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
                <div className="flex flex-wrap justify-between gap-2">
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
              style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}
              className="flex-shrink-0 overflow-hidden"
            >
               {/* TÍTULO */}
              <div className="text-xs text-gray-500 font-medium mb-1 text-center">Asignados</div>
              <PersonasAsignadas 
                personas={empresa.personas}
                empresaNombre={empresa.nombre} 
                empresaId={empresa.id} 
              />
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
              <ProximaObligacion 
                obligacion={empresa.proximaObligacion} 
                empresaId={empresa.id} 
              />
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
                    <div className="absolute right-0 top-full mt-1 w-58 bg-white border border-gray-200 rounded-lg shadow-xl z-40">
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