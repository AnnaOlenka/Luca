import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, Users, Calculator, FileText, Building } from 'lucide-react';

interface PerfilEmpresarialModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa?: {
    id: string;
    nombre: string;
    ruc: string;
  };
}

const PerfilEmpresarialModal: React.FC<PerfilEmpresarialModalProps> = ({ isOpen, onClose, empresa }) => {
  const [activeTab, setActiveTab] = useState('tributario');
  const [showHistorica, setShowHistorica] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [expandedVariable, setExpandedVariable] = useState<string | null>(null);
  const [expandedHistoricalRow, setExpandedHistoricalRow] = useState<string | null>(null);

  // Estilos CSS responsivos
  const styles = `
    .perfil-modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem; }
    .perfil-modal-container { background-color: white; border-radius: 0.75rem; width: 100%; max-width: 56rem; max-height: 90vh; height: 37.5rem; min-height: 37.5rem; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow-y: auto; }
    .perfil-modal-header { background: linear-gradient(to right, #2563eb, #1d4ed8); color: white; padding: 1rem; border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; display: flex; justify-content: space-between; align-items: center; }
    .perfil-modal-title { font-size: 1.25rem; font-weight: 700; }
    .perfil-modal-close-btn { color: black; padding: 0.5rem; border-radius: 0.5rem; transition: all 0.2s; border: none; background: none; cursor: pointer; }
    .perfil-modal-close-btn:hover { background-color: rgba(255, 255, 255, 0.2); }
    .perfil-modal-tabs { border-bottom: 1px solid #e5e7eb; }
    .perfil-modal-tab-list { display: flex; }
    .perfil-modal-tab { display: flex; align-items: center; padding: 0.75rem 1.5rem; font-size: 0.875rem; font-weight: 500; border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.2s; border: none; background: none; }
    .perfil-modal-tab.active { border-bottom-color: #3b82f6; color: #2563eb; background-color: #eff6ff; }
    .perfil-modal-tab:not(.active) { color: #6b7280; }
    .perfil-modal-tab:not(.active):hover { color: #374151; border-bottom-color: #d1d5db; }
    .perfil-modal-content { flex: 1; overflow-y: auto; padding: 1.5rem; }
    .perfil-modal-btn-primary { background-color: #2563eb; color: white; padding: 0.5rem 1.5rem; border-radius: 0.5rem; font-weight: 500; transition: background-color 0.2s; border: none; cursor: pointer; }
    .perfil-modal-btn-primary:hover { background-color: #1d4ed8; }
    .perfil-modal-btn-secondary { background-color: #e5e7eb; color: #374151; padding: 0.5rem 1.5rem; border-radius: 0.5rem; font-weight: 500; transition: background-color 0.2s; border: none; cursor: pointer; }
    .perfil-modal-btn-secondary:hover { background-color: #d1d5db; }
    .perfil-modal-btn-green { background-color: #059669; color: white; padding: 0.5rem 1.5rem; border-radius: 0.5rem; font-weight: 500; transition: background-color 0.2s; border: none; cursor: pointer; }
    .perfil-modal-btn-green:hover { background-color: #047857; }
    .perfil-modal-btn-small { background-color: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 500; transition: background-color 0.2s; border: none; cursor: pointer; }
    .perfil-modal-btn-small:hover { background-color: #1d4ed8; }
    @media (max-width: 48rem) {
      .perfil-modal-backdrop { padding: 0.5rem; }
      .perfil-modal-container { height: 90vh; min-height: 90vh; }
      .perfil-modal-header { padding: 0.75rem; }
      .perfil-modal-title { font-size: 1.125rem; }
      .perfil-modal-tab { padding: 0.5rem 1rem; font-size: 0.8125rem; }
      .perfil-modal-content { padding: 1rem; }
    }
    @media (max-width: 30rem) {
      .perfil-modal-container { max-width: 95vw; }
      .perfil-modal-tab { padding: 0.5rem 0.75rem; font-size: 0.75rem; }
      .perfil-modal-content { padding: 0.75rem; }
    }
  `;

  
  const toggleHistoricalRow = (rowId: string) => {
    setExpandedHistoricalRow(prev => prev === rowId ? null : rowId);
  };

  // Función para obtener datos específicos de variables por trimestre
  const getVariableData = (trimestre: string, tipo: 'ponderacion' | 'vinculacion' | 'calificacion') => {
    const variablesData = {
      'I-2025': {
        ponderacion: 'No ha efectuado el pago del íntegro de las obligaciones tributarias por el Impuesto General a las Ventas (IGV) al vencimiento de dichas obligaciones hasta en dos (2) cuotas para el trimestre I-2025.',
        vinculacion: 'No registra incumplimientos o supuesto previsto en el inciso b) del numeral 6.1 del artículo 6 del Decreto Legislativo N° 1535 para el periodo I-2025.',
        calificacion: 'Registra presentación tardía de declaración jurada informativa del Impuesto a la Renta anual para el período I-2025.'
      },
      'IV-2024': {
        ponderacion: 'No ha efectuado el pago del íntegro de las obligaciones tributarias por el Impuesto a la Renta (IR) al vencimiento de dichas obligaciones hasta en dos (2) cuotas para el trimestre IV-2024.',
        vinculacion: 'Registra vínculos con empresas del mismo grupo económico que presentaron inconsistencias tributarias en el periodo IV-2024.',
        calificacion: 'No registra incumplimientos o supuesto previsto en el inciso b) del numeral 6.1 del artículo 6 del Decreto Legislativo N° 1535 para el período IV-2024.'
      },
      'III-2024': {
        ponderacion: 'No registra incumplimiento o supuesto previsto en inciso b) del numeral 6.1. del artículo 6 del Decreto Legislativo N° 1535 para el trimestre III-2024.',
        vinculacion: 'No registra incumplimientos o supuesto previsto en el inciso b) del numeral 6.1 del artículo 6 del Decreto Legislativo N° 1535 para el periodo III-2024.',
        calificacion: 'Registra omisión en la presentación de declaración jurada mensual del IGV para los meses de julio y agosto 2024.'
      },
      'II-2024': {
        ponderacion: 'No ha efectuado el pago del íntegro de las obligaciones tributarias por el Impuesto Temporal a los Activos Netos (ITAN) al vencimiento de dichas obligaciones hasta en dos (2) cuotas para el trimestre II-2024.',
        vinculacion: 'No registra incumplimientos o supuesto previsto en el inciso b) del numeral 6.1 del artículo 6 del Decreto Legislativo N° 1535 para el periodo II-2024.',
        calificacion: 'No registra incumplimientos o supuesto previsto en el inciso b) del numeral 6.1 del artículo 6 del Decreto Legislativo N° 1535 para el período II-2024.'
      }
    };

    return variablesData[trimestre as keyof typeof variablesData]?.[tipo] || 
           `No registra incumplimiento o supuesto previsto en inciso b) del numeral 6.1. del artículo 6 del Decreto Legislativo N° 1535 para el ${tipo} del trimestre ${trimestre}.`;
  };
  // Simulación de datos RUC basados en la empresa seleccionada
  const simulatedRucData = {
    numeroRuc: empresa ? `${empresa.ruc} - ${empresa.nombre}` : "20486774283 - CONSERIN S.A.C.",
    tipoContribuyente: "SOCIEDAD ANONIMA CERRADA",
    actividadesEconomicas: "Principal - 4210 - CONSTRUCCION DE CARRETERAS Y PISTAS DE ATERRIZAJE",
    comprobantesElectronicos: "FACTURA, BOLETA, NOTA DE CRÉDITO (desde 01/01/2020)",
    actividadComercioExterior: "SIN ACTIVIDAD"
  };
  
  // Estado para régimen tributario con datos automáticos
  const [formDataTributario, setFormDataTributario] = useState({
    razonSocial: simulatedRucData.numeroRuc.split(' - ')[1] || '',
    tipoPersona: simulatedRucData.tipoContribuyente.toLowerCase().includes('persona natural') ? 'natural' : 'juridica',
    tipoActividad: '',
    ingresosAnuales: '2850000',
    activosFijos: '',
    numeroTrabajadores: '35',
    realizaExportaciones: simulatedRucData.actividadComercioExterior.toLowerCase().includes('sin actividad') ? 'no' : 'si',
    emiteComprobantesElectronicos: (simulatedRucData.comprobantesElectronicos.toLowerCase().includes('factura') || 
                                   simulatedRucData.comprobantesElectronicos.toLowerCase().includes('boleta') || 
                                   simulatedRucData.comprobantesElectronicos.toLowerCase().includes('nota de crédito')) ? 'si' : 'no',
    regimenSeleccionado: ''
  });
  
  // Estado para régimen laboral
  const [formDataLaboral, setFormDataLaboral] = useState({
    sector: 'privado',
    clasificacion: '',
    regimenLaboral: '',
    baseLegal: ''
  });
  
  const [regimenDeterminado, setRegimenDeterminado] = useState('');
  const [restricciones, setRestricciones] = useState<string[]>([]);

  const regimenes = {
    'NRUS': 'Nuevo RUS',
    'RER': 'Régimen Especial (RER)',
    'RMT': 'Régimen MYPE Tributario (RMT)',
    'RG': 'Régimen General (RG)'
  };

  // Datos para régimen laboral
  const regimenesLaborales = {
    publico: {
      clasificacion: 'Según entidad/función',
      opciones: [
        { regimen: 'Ley del Servicio Civil – SERVIR', base: 'Ley 30057' },
        { regimen: 'Carrera Administrativa (trabajador nombrado)', base: 'D. Leg. 276' },
        { regimen: 'Profesorado', base: 'Ley 29944' },
        { regimen: 'Jueces o magistrados', base: 'Ley 29277' },
        { regimen: 'Profesionales de la salud', base: 'Ley 23536' },
        { regimen: 'Auxiliares de salud', base: 'Ley 28561' },
        { regimen: 'Fiscales', base: 'D. Leg. 052' },
        { regimen: 'Servicio Diplomático de la República', base: 'Ley 28091' },
        { regimen: 'Contrato Administrativo de Servicios (CAS)', base: 'D. Leg. 1057' },
        { regimen: 'Militares', base: 'Ley 28359' },
        { regimen: 'Policía Nacional del Perú', base: 'Ley 27238' },
        { regimen: 'Servidores penitenciarios', base: 'Ley 29709' },
        { regimen: 'Gerentes Públicos', base: 'D. Leg. 1024' }
      ]
    },
    privado: {
      clasificaciones: {
        'actividad': {
          nombre: 'Según actividad o tamaño de la empresa',
          opciones: [
            { regimen: 'Construcción civil', base: 'Sin base legal especificada' },
            { regimen: 'MYPE (micro y pequeña empresa)', base: 'Ley 30056' },
            { regimen: 'Agrario y agrícola', base: 'Ley 31110' },
            { regimen: 'Minero', base: 'Sin base legal especificada' },
            { regimen: 'Portuario', base: 'Sin base legal especificada' },
            { regimen: 'Exportación no tradicional', base: 'Sin base legal especificada' },
            { regimen: 'Pesquero', base: 'Sin base legal especificada' }
          ]
        },
        'trabajo': {
          nombre: 'Según naturaleza del trabajo',
          opciones: [
            { regimen: 'Trabajadora del hogar', base: 'Ley 31047' },
            { regimen: 'Guardianes y porteros', base: 'Sin base legal especificada' },
            { regimen: 'Tiempo parcial', base: 'Sin base legal especificada' },
            { regimen: 'Médico cirujano', base: 'Ley 23536' },
            { regimen: 'Enfermera', base: 'Ley 27669' },
            { regimen: 'Teletrabajo', base: 'Ley 31572' },
            { regimen: 'Artista', base: 'Ley 28131' },
            { regimen: 'Porteador', base: 'Sin base legal especificada' }
          ]
        },
        'especiales': {
          nombre: 'Según condiciones especiales del trabajador',
          opciones: [
            { regimen: 'Trabajador extranjero', base: 'D. Leg. 689' },
            { regimen: 'Trabajador adolescente', base: 'Ley 27337' },
            { regimen: 'Trabajadora gestante y madre trabajadora', base: 'Ley 30367' },
            { regimen: 'Trabajadores portadores de VIH y sida', base: 'Ley 26626' },
            { regimen: 'Trabajador discapacitado', base: 'Ley 29973' },
            { regimen: 'Trabajador migrante andino', base: 'Decisión 545 (CAN)' },
            { regimen: 'Trabajador con TBC', base: 'Ley 30287' }
          ]
        }
      }
    }
  };

  const determinarRegimen = (data: any) => {
    const ingresos = parseFloat(data.ingresosAnuales) || 0;
    const activos = parseFloat(data.activosFijos) || 0;
    const trabajadores = parseInt(data.numeroTrabajadores) || 0;
    
    let restriccionesEncontradas: string[] = [];
    
    // NRUS - Evaluación
    if (data.tipoPersona === 'juridica') {
      restriccionesEncontradas.push('NRUS: No permite personas jurídicas');
    }
    if (ingresos > 96000 || (ingresos > 8000 && data.tipoActividad !== 'alquiler')) {
      restriccionesEncontradas.push('NRUS: Supera límite de ingresos');
    }
    if (data.emiteComprobantesElectronicos === 'si') {
      restriccionesEncontradas.push('NRUS: No permite comprobantes electrónicos');
    }
    if (data.realizaExportaciones === 'si') {
      restriccionesEncontradas.push('NRUS: No permite exportaciones');
    }
    
    // RER - Evaluación
    if (ingresos > 525000) {
      restriccionesEncontradas.push('RER: Supera límite de ingresos (S/ 525,000)');
    }
    if (activos > 126000) {
      restriccionesEncontradas.push('RER: Supera límite de activos fijos (S/ 126,000)');
    }
    if (trabajadores > 10) {
      restriccionesEncontradas.push('RER: Supera límite de trabajadores (10)');
    }
    if (data.realizaExportaciones === 'si') {
      restriccionesEncontradas.push('RER: No permite exportaciones');
    }
    
    // RMT - Evaluación
    if (ingresos > 1700 * 5250) { // Aproximadamente 1,700 UIT
      restriccionesEncontradas.push('RMT: Supera límite de ingresos (1,700 UIT)');
    }
    
    setRestricciones(restriccionesEncontradas);
    
    // Determinar régimen automáticamente
    const puedeNRUS = data.tipoPersona === 'natural' && 
                      ingresos <= 96000 && 
                      data.emiteComprobantesElectronicos !== 'si' &&
                      data.realizaExportaciones !== 'si';
                      
    const puedeRER = ingresos <= 525000 && 
                     activos <= 126000 && 
                     trabajadores <= 10 &&
                     data.realizaExportaciones !== 'si';
                     
    const puedeRMT = ingresos <= (1700 * 5250);
    
    if (puedeNRUS && (data.tipoActividad === 'alquiler' || ingresos <= 96000)) {
      return 'NRUS';
    } else if (puedeRER) {
      return 'RER';
    } else if (puedeRMT) {
      return 'RMT';
    } else {
      return 'RG';
    }
  };

  useEffect(() => {
    const regimen = determinarRegimen(formDataTributario);
    setRegimenDeterminado(regimen);
    if (!formDataTributario.regimenSeleccionado) {
      setFormDataTributario(prev => ({ ...prev, regimenSeleccionado: regimen }));
    }
  }, [formDataTributario.tipoPersona, formDataTributario.tipoActividad, formDataTributario.ingresosAnuales, 
      formDataTributario.activosFijos, formDataTributario.numeroTrabajadores, formDataTributario.realizaExportaciones, 
      formDataTributario.emiteComprobantesElectronicos]);

  const handleInputChangeTributario = (field: string, value: string) => {
    setFormDataTributario(prev => ({ ...prev, [field]: value }));
  };
  
  // Función para obtener la actividad principal sugerida basada en RUC
  const getActividadSugerida = () => {
    const actividadRuc = simulatedRucData.actividadesEconomicas.toLowerCase();
    if (actividadRuc.includes('construccion')) return 'industria';
    if (actividadRuc.includes('comercio') || actividadRuc.includes('venta')) return 'comercio';
    if (actividadRuc.includes('manufactura') || actividadRuc.includes('fabrica')) return 'industria';
    if (actividadRuc.includes('agricultura')) return 'servicios';
    if (actividadRuc.includes('transporte')) return 'servicios';
    if (actividadRuc.includes('alquiler')) return 'alquiler';
    return '';
  };

  const handleInputChangeLaboral = (field: string, value: string) => {
    let newData = { ...formDataLaboral, [field]: value };
    
    // Lógica para autocompletar campos
    if (field === 'sector') {
      newData = { ...newData, clasificacion: '', regimenLaboral: '', baseLegal: '' };
      if (value === 'publico') {
        newData.clasificacion = regimenesLaborales.publico.clasificacion;
      }
    }
    
    if (field === 'clasificacion' && formDataLaboral.sector === 'privado') {
      newData = { ...newData, regimenLaboral: '', baseLegal: '' };
    }
    
    if (field === 'regimenLaboral') {
      if (formDataLaboral.sector === 'publico') {
        const opcion = regimenesLaborales.publico.opciones.find(o => o.regimen === value);
        if (opcion) newData.baseLegal = opcion.base;
      } else if (formDataLaboral.sector === 'privado' && formDataLaboral.clasificacion) {
        const clasificacionData = regimenesLaborales.privado.clasificaciones[formDataLaboral.clasificacion as keyof typeof regimenesLaborales.privado.clasificaciones];
        const opcion = clasificacionData?.opciones.find(o => o.regimen === value);
        if (opcion) newData.baseLegal = opcion.base;
      }
    }
    
    setFormDataLaboral(newData);
  };

  const handleSubmit = () => {
    if (activeTab === 'tributario') {
      console.log('Datos tributarios:', formDataTributario);
      console.log('Régimen determinado automáticamente:', regimenDeterminado);
      alert(`Datos tributarios guardados!\nRégimen seleccionado: ${regimenes[formDataTributario.regimenSeleccionado as keyof typeof regimenes]}`);
    } else if (activeTab === 'laboral') {
      console.log('Datos laborales:', formDataLaboral);
      alert('Datos laborales guardados!');
    }
  };

  const resetForm = () => {
    if (activeTab === 'tributario') {
      setFormDataTributario({
        razonSocial: simulatedRucData.numeroRuc.split(' - ')[1] || '',
        tipoPersona: simulatedRucData.tipoContribuyente.toLowerCase().includes('persona natural') ? 'natural' : 'juridica',
        tipoActividad: '',
        ingresosAnuales: '2850000',
        activosFijos: '',
        numeroTrabajadores: '35',
        realizaExportaciones: simulatedRucData.actividadComercioExterior.toLowerCase().includes('sin actividad') ? 'no' : 'si',
        emiteComprobantesElectronicos: (simulatedRucData.comprobantesElectronicos.toLowerCase().includes('factura') || 
                                       simulatedRucData.comprobantesElectronicos.toLowerCase().includes('boleta') || 
                                       simulatedRucData.comprobantesElectronicos.toLowerCase().includes('nota de crédito')) ? 'si' : 'no',
        regimenSeleccionado: ''
      });
      setRestricciones([]);
    } else if (activeTab === 'laboral') {
      setFormDataLaboral({
        sector: '',
        clasificacion: '',
        regimenLaboral: '',
        baseLegal: ''
      });
    } else if (activeTab === 'score') {
      setShowHistorica(false);
      setShowVariables(false);
      setExpandedHistoricalRow(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="perfil-modal-backdrop">
        <div className="perfil-modal-container">
          {/* Header */}
          <div className="perfil-modal-header">
            <h2 className="perfil-modal-title">Perfil Empresarial Tributario-Laboral</h2>
            <button
              onClick={onClose}
              className="perfil-modal-close-btn"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="perfil-modal-tabs">
            <nav className="perfil-modal-tab-list">
              <button
                onClick={() => setActiveTab('tributario')}
                className={`perfil-modal-tab ${activeTab === 'tributario' ? 'active' : ''}`}
              >
                <FileText className="inline w-4 h-4 mr-2" />
                Régimen Tributario
              </button>
              <button
                onClick={() => setActiveTab('laboral')}
                className={`perfil-modal-tab ${activeTab === 'laboral' ? 'active' : ''}`}
              >
                <Building className="inline w-4 h-4 mr-2" />
                Régimen Laboral
              </button>
              <button
                onClick={() => setActiveTab('score')}
                className={`perfil-modal-tab ${activeTab === 'score' ? 'active' : ''}`}
              >
                <Info className="inline w-4 h-4 mr-2" />
                Score Tributario
              </button>
            </nav>
          </div>

          <div className="perfil-modal-content">
          {activeTab === 'tributario' && (
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Información Básica */}
              <div className="bg-blue-50 border border-gray-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Información Básica</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tipo de Persona
                      </label>
                      <select
                        value={formDataTributario.tipoPersona}
                        onChange={(e) => handleInputChangeTributario('tipoPersona', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="natural">Persona Natural</option>
                        <option value="juridica">Persona Jurídica</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Basado en: {simulatedRucData.tipoContribuyente}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Actividad Principal
                      </label>
                      <select
                        value={formDataTributario.tipoActividad || getActividadSugerida()}
                        onChange={(e) => handleInputChangeTributario('tipoActividad', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="alquiler">Alquiler</option>
                        <option value="comercio">Comercio</option>
                        <option value="servicios">Servicios</option>
                        <option value="industria">Industria</option>
                        <option value="mixta">Mixta</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Según ficha RUC: {simulatedRucData.actividadesEconomicas}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos Económicos */}
              <div className="bg-blue-50 border border-emerald-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-emerald-900 mb-3 flex items-center">
                  <Calculator className="w-4 h-4 mr-1 text-emerald-600" />
                  Datos Económicos
                </h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ingresos Anuales (S/)
                      </label>
                      <input
                        type="number"
                        value={formDataTributario.ingresosAnuales}
                        onChange={(e) => handleInputChangeTributario('ingresosAnuales', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-emerald-500"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">Datos obtenidos de SIRE</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Activos Fijos (S/)
                      </label>
                      <input
                        type="number"
                        value={formDataTributario.activosFijos}
                        onChange={(e) => handleInputChangeTributario('activosFijos', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-emerald-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        N° Trabajadores
                      </label>
                      <input
                        type="number"
                        value={formDataTributario.numeroTrabajadores}
                        onChange={(e) => handleInputChangeTributario('numeroTrabajadores', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-emerald-500"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Datos obtenidos de SUNAT</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operaciones */}
              <div className="bg-blue-50 border border-purple-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-purple-900 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-1 text-purple-600" />
                  Operaciones
                </h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        ¿Exportaciones?
                      </label>
                      <select
                        value={formDataTributario.realizaExportaciones}
                        onChange={(e) => handleInputChangeTributario('realizaExportaciones', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Según ficha RUC: {simulatedRucData.actividadComercioExterior}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        ¿Comp. Electrónicos?
                      </label>
                      <select
                        value={formDataTributario.emiteComprobantesElectronicos}
                        onChange={(e) => handleInputChangeTributario('emiteComprobantesElectronicos', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Según ficha RUC: {simulatedRucData.comprobantesElectronicos}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Régimen Tributario Seleccionado
                    </label>
                    <select
                      value={formDataTributario.regimenSeleccionado}
                      onChange={(e) => handleInputChangeTributario('regimenSeleccionado', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="">Seleccionar régimen...</option>
                      {Object.entries(regimenes).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Régimen Recomendado */}
              {regimenDeterminado && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                    <CheckCircle size={20} />
                    Régimen Recomendado
                  </div>
                  <p className="text-green-800 text-lg font-semibold">
                    {regimenes[regimenDeterminado as keyof typeof regimenes]}
                  </p>
                </div>
              )}

              {/* Información del régimen seleccionado */}
              {formDataTributario.regimenSeleccionado && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700 font-medium mb-3">
                    <Info size={20} />
                    Información: {regimenes[formDataTributario.regimenSeleccionado as keyof typeof regimenes]}
                  </div>
                  <RegimenInfo regimen={formDataTributario.regimenSeleccionado} />
                </div>
              )}

              {/* Restricciones */}
              {restricciones.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-700 font-medium mb-3">
                    <AlertTriangle size={20} />
                    Restricciones Encontradas
                  </div>
                  <ul className="space-y-1 max-h-40 overflow-y-auto text-left mt-2">
                    {restricciones.map((restriccion, index) => (
                      <li key={index} className="text-yellow-800 text-sm">
                        • {restriccion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'laboral' && (
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Información Laboral */}
              <div className="bg-blue-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                  <Building className="w-4 h-4 mr-1 text-blue-600" />
                  Régimen Laboral
                </h3>
                
                <div className="space-y-4">
                  {/* Selector de sector - fijo en privado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sector
                    </label>
                    <input
                      type="text"
                      value="Privado"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                    />
                  </div>

                  {/* Clasificación - siempre visible para privado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clasificación
                    </label>
                    <select
                      value={formDataLaboral.clasificacion}
                      onChange={(e) => handleInputChangeLaboral('clasificacion', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar clasificación...</option>
                      <option value="actividad">Según actividad o tamaño de la empresa</option>
                      <option value="trabajo">Según naturaleza del trabajo</option>
                      <option value="especiales">Según condiciones especiales del trabajador</option>
                    </select>
                  </div>

                  {/* Régimen laboral - siempre visible */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Régimen Laboral
                    </label>
                    <select
                      value={formDataLaboral.regimenLaboral}
                      onChange={(e) => handleInputChangeLaboral('regimenLaboral', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!formDataLaboral.clasificacion}
                    >
                      <option value="">
                        {!formDataLaboral.clasificacion ? 'Selecciona una clasificación primero' : 'Seleccionar régimen laboral...'}
                      </option>
                      {formDataLaboral.clasificacion && regimenesLaborales.privado.clasificaciones[formDataLaboral.clasificacion as keyof typeof regimenesLaborales.privado.clasificaciones]?.opciones.map((opcion, index) => (
                        <option key={index} value={opcion.regimen}>
                          {opcion.regimen}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Base legal - siempre visible */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Legal
                    </label>
                    <input
                      type="text"
                      value={formDataLaboral.baseLegal || (!formDataLaboral.regimenLaboral ? 'Selecciona un régimen laboral primero' : 'Sin base legal especificada')}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                      placeholder={!formDataLaboral.regimenLaboral ? 'Selecciona un régimen laboral primero' : 'Sin base legal especificada'}
                    />
                  </div>
                </div>
              </div>

              {/* Información del régimen laboral seleccionado */}
              {formDataLaboral.regimenLaboral && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 font-medium mb-3">
                    <CheckCircle size={20} />
                    Régimen Laboral Seleccionado
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><strong>Sector:</strong> {formDataLaboral.sector === 'publico' ? 'Público' : 'Privado'}</div>
                    <div><strong>Clasificación:</strong> {formDataLaboral.clasificacion === 'actividad' ? 'Según actividad o tamaño de la empresa' : 
                      formDataLaboral.clasificacion === 'trabajo' ? 'Según naturaleza del trabajo' : 
                      formDataLaboral.clasificacion === 'especiales' ? 'Según condiciones especiales del trabajador' : 
                      formDataLaboral.clasificacion}</div>
                    <div><strong>Régimen:</strong> {formDataLaboral.regimenLaboral}</div>
                    <div><strong>Base Legal:</strong> {formDataLaboral.baseLegal}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'score' && (
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Título del Score Tributario */}
              <div className="text-center py-4">
                <h3 className="text-lg font-bold text-white bg-blue-600 py-2 px-4 rounded-t-lg">
                  CALIFICACIÓN DEL PERFIL DEL TRIMESTRE VIGENTE
                </h3>
              </div>

              {/* Información del Score Tributario */}
              <div className="bg-white border border-gray-300 rounded-b-lg p-6 space-y-3">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">RUC:</span>
                    <span className="text-gray-600">20486774283</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">RAZON SOCIAL:</span>
                    <span className="text-gray-600">ROCA FUERTE SOCIEDAD ANONIMA CERRADA - ROCA FUERTE S.A.C.</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">CALIFICACIÓN:</span>
                    <span className="text-gray-600">B</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">Período Calificación:</span>
                    <span className="text-gray-600">II - 2025</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">Período Evaluación:</span>
                    <span className="text-gray-600">Jul. 2024 - Jun. 2025</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">Comunicación notificada:</span>
                    <span className="text-gray-600">-</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold text-gray-700 w-32">Resolución notificada:</span>
                    <span className="text-gray-600">-</span>
                  </div>
                </div>
              </div>

              {/* Botones Calificación Histórica y Ver Variables */}
              <div className="text-center pt-4 space-x-4">
                <button
                  onClick={() => {
                    if (showHistorica) {
                      setShowHistorica(false);
                    } else {
                      setShowVariables(false); // Cierra el otro div si está abierto
                      setShowHistorica(true);
                    }
                  }}
                  className="perfil-modal-btn-primary"
                >
                  {showHistorica ? 'Ocultar Calificación Histórica' : 'Calificación Histórica'}
                </button>
                <button
                  onClick={() => {
                    if (showVariables) {
                      setShowVariables(false);
                    } else {
                      setShowHistorica(false); // Cierra el otro div si está abierto
                      setShowVariables(true);
                    }
                  }}
                  className="perfil-modal-btn-green"
                >
                  {showVariables ? 'Ocultar Variables' : 'Ver Variables'}
                </button>
              </div>

              {/* Tabla Histórica */}
              {showHistorica && (
                <div className="mt-6">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-white bg-blue-600 py-2 px-4 rounded-t-lg">
                      CALIFICACIÓN HISTÓRICA DEL PERFIL DE CUMPLIMIENTO
                    </h4>
                  </div>
                  
                  <div className="bg-white border border-gray-300 rounded-b-lg">
                    <div className="p-4 space-y-2 text-sm">
                      <div className="flex">
                        <span className="font-semibold text-gray-700 w-20">RUC:</span>
                        <span className="text-gray-600">20486774283</span>
                      </div>
                      <div className="flex">
                        <span className="font-semibold text-gray-700 w-20">RAZON SOCIAL:</span>
                        <span className="text-gray-600">ROCA FUERTE SOCIEDAD ANONIMA CERRADA - ROCA FUERTE S.A.C.</span>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-300">
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">TRIMESTRE</th>
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">CALIFICACIÓN</th>
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">PERIODO EVALUACIÓN</th>
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">RS NOTIFICADA</th>
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">VARIABLES</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-4 text-gray-600">I - 2025</td>
                            <td className="py-2 px-4 text-gray-600">A</td>
                            <td className="py-2 px-4 text-gray-600">Abr. 2024 - Mar. 2025</td>
                            <td className="py-2 px-4 text-gray-600">-</td>
                            <td className="py-2 px-4">
                              <button
                                onClick={() => toggleHistoricalRow('I-2025')}
                                className="perfil-modal-btn-small"
                              >
                                {expandedHistoricalRow === 'I-2025' ? 'Ocultar' : 'Ver'}
                              </button>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-4 text-gray-600">IV - 2024</td>
                            <td className="py-2 px-4 text-gray-600">A</td>
                            <td className="py-2 px-4 text-gray-600">Ene. 2024 - Dic. 2024</td>
                            <td className="py-2 px-4 text-gray-600">-</td>
                            <td className="py-2 px-4">
                            <button
                              onClick={() => toggleHistoricalRow('IV-2024')}
                              className="perfil-modal-btn-small"
                            >
                              {expandedHistoricalRow === 'IV-2024' ? 'Ocultar' : 'Ver'}
                            </button>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-4 text-gray-600">III - 2024</td>
                            <td className="py-2 px-4 text-gray-600">A</td>
                            <td className="py-2 px-4 text-gray-600">Oct. 2023 - Sep. 2024</td>
                            <td className="py-2 px-4 text-gray-600">-</td>
                            <td className="py-2 px-4">
                              <button
                                onClick={() => toggleHistoricalRow('III-2024')}
                                className="perfil-modal-btn-small"
                              >
                                {expandedHistoricalRow === 'III-2024' ? 'Ocultar' : 'Ver'}
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 text-gray-600">II - 2024</td>
                            <td className="py-2 px-4 text-gray-600">B</td>
                            <td className="py-2 px-4 text-gray-600">Jul. 2023 - Jun. 2024</td>
                            <td className="py-2 px-4 text-gray-600">-</td>
                            <td className="py-2 px-4">
                              <button
                                onClick={() => toggleHistoricalRow('II-2024')}
                                className="perfil-modal-btn-small"
                              >
                                {expandedHistoricalRow === 'II-2024' ? 'Ocultar' : 'Ver'}
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Variables expandibles específicas por trimestre */}
                  {expandedHistoricalRow && (
                    <div className="mt-6 space-y-4">
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-bold text-white bg-green-600 py-2 px-4 rounded-lg">
                          VARIABLES PARA TRIMESTRE {expandedHistoricalRow}
                        </h4>
                      </div>
                      
                      <div className="bg-white border border-gray-300 rounded-lg">
                        <div className="bg-blue-600 text-white px-4 py-2 font-bold text-center rounded-t-lg">
                          VARIABLES DE PONDERACIÓN - {expandedHistoricalRow}
                        </div>
                        <div className="p-4">
                          <p className="text-gray-700 text-sm">
                            {getVariableData(expandedHistoricalRow, 'ponderacion')}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-300 rounded-lg">
                        <div className="bg-blue-600 text-white px-4 py-2 font-bold text-center rounded-t-lg">
                          VARIABLES DE VINCULACIÓN - {expandedHistoricalRow}
                        </div>
                        <div className="p-4">
                          <p className="text-gray-700 text-sm">
                            {getVariableData(expandedHistoricalRow, 'vinculacion')}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-300 rounded-lg">
                        <div className="bg-blue-600 text-white px-4 py-2 font-bold text-center rounded-t-lg">
                          VARIABLES DE CALIFICACIÓN DIRECTA - {expandedHistoricalRow}
                        </div>
                        <div className="p-4">
                          <p className="text-gray-700 text-sm">
                            {getVariableData(expandedHistoricalRow, 'calificacion')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sección Variables */}
              {showVariables && (
                <div className="mt-6">
                  <div className="space-y-4">
                    {/* Variables de Ponderación */}
                    <div className="border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setExpandedVariable(expandedVariable === 'ponderacion' ? null : 'ponderacion')}
                        className="w-full px-4 py-3 bg-blue-600 text-white font-medium text-left rounded-t-lg hover:bg-blue-700 transition-colors flex justify-between items-center"
                      >
                        <span>Variables de Ponderación</span>
                        <span className="text-lg">{expandedVariable === 'ponderacion' ? '−' : '+'}</span>
                      </button>
                      {expandedVariable === 'ponderacion' && (
                        <div className="p-4 bg-white">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-bold text-blue-600">VARIABLES DE PONDERACIÓN</h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">Score:</span>
                              <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">B</span>
                            </div>
                          </div>
                          
                          <div className="bg-gray-100 p-3 rounded mb-4">
                            <p className="text-sm text-gray-700">
                              No ha efectuado el pago del íntegro de las obligaciones tributarias por el 
                              Impuesto Temporal a los Activos Netos (ITAN) al vencimiento de dichas 
                              obligaciones hasta en dos (2) cuotas.
                            </p>
                          </div>

                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-700">Gravedad: </span>
                            <span className="font-medium">LEVE</span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Período Tributario</th>
                                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Código de Tributo</th>
                                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Código de Formulario</th>
                                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Número de Orden</th>
                                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Fecha de Pago</th>
                                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Monto de Pago</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">202503</td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">ITAN IMP.TEMPORAL A LOS ACTIV.NETOS</td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">BOLETA DE PAGO VIRTUAL</td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">1130538741</td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">23/04/2025</td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">385</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Variables de Vinculación */}
                    <div className="border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setExpandedVariable(expandedVariable === 'vinculacion' ? null : 'vinculacion')}
                        className="w-full px-4 py-3 bg-blue-600 text-white font-medium text-left rounded-t-lg hover:bg-orange-700 transition-colors flex justify-between items-center"
                      >
                        <span>Variables de Vinculación</span>
                        <span className="text-lg">{expandedVariable === 'vinculacion' ? '−' : '+'}</span>
                      </button>
                      {expandedVariable === 'vinculacion' && (
                        <div className="p-4 bg-white">
                          <div className="py-4">
                            <p className="text-gray-700">No registra incumplimientos o supuesto previsto en el inciso b) del numeral 6.1 del artículo 6 del Decreto Legislativo N° 1535.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Variables de Calificación Directa */}
                    <div className="border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setExpandedVariable(expandedVariable === 'calificacion' ? null : 'calificacion')}
                        className="w-full px-4 py-3 bg-blue-600 text-white font-medium text-left rounded-t-lg hover:bg-purple-700 transition-colors flex justify-between items-center"
                      >
                        <span>Variables de Calificación Directa</span>
                        <span className="text-lg">{expandedVariable === 'calificacion' ? '−' : '+'}</span>
                      </button>
                      {expandedVariable === 'calificacion' && (
                        <div className="p-4 bg-white">
                          <div className="py-4">
                            <p className="text-gray-700">No registra incumplimientos o supuesto previsto en el inciso b) del numeral 6.1 del artículo 6 del Decreto Legislativo N° 1535.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botones */}
          {activeTab !== 'score' && (
            <div className="flex gap-4 justify-end pt-4 border-t mt-6">
              <button
                type="button"
                onClick={resetForm}
                className="perfil-modal-btn-secondary"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="perfil-modal-btn-primary"
              >
                Guardar Información
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
};

const RegimenInfo: React.FC<{ regimen: string }> = ({ regimen }) => {
  const info = {
    'NRUS': {
      ingresos: '≤ S/ 96,000 o S/ 8,000 mensuales',
      compras: '≤ S/ 96,000 o S/ 8,000 mensuales',
      activos: '≤ S/ 70,000 (excepto predios y vehículos)',
      comprobantes: 'Boleta de venta y tickets (sin derecho a crédito fiscal)',
      impuestos: 'Pago único mensual (S/ 20 o S/ 50)',
      trabajadores: 'Sin límite'
    },
    'RER': {
      ingresos: '≤ S/ 525,000',
      compras: '≤ S/ 525,000',
      activos: '≤ S/ 126,000 (excepto predios y vehículos)',
      comprobantes: 'Factura, boleta y todos los demás',
      impuestos: 'IGV (18%) + IR (1.5% ingresos netos)',
      trabajadores: '10 por turno'
    },
    'RMT': {
      ingresos: '≤ 1,700 UIT (S/ 9,095,000)',
      compras: 'Sin límite',
      activos: 'Sin límite',
      comprobantes: 'Factura, boleta y todos los demás',
      impuestos: 'IGV (18%) + IR (1% hasta 300 UIT, luego coeficiente o 1.5%) + regularización anual',
      trabajadores: 'Sin límite'
    },
    'RG': {
      ingresos: 'Sin límite',
      compras: 'Sin límite',
      activos: 'Sin límite',
      comprobantes: 'Factura, boleta y todos los demás',
      impuestos: 'IGV (18%) + IR anual 29.5% (con pagos a cuenta)',
      trabajadores: 'Sin límite'
    }
  };

  const regimenInfo = info[regimen as keyof typeof info];
  if (!regimenInfo) return null;

  return (
    <div className="space-y-2 text-xs">
      <div className="grid grid-cols-1 gap-2 text-left mt-2">
        <div><strong>Límite de ingresos:</strong> {regimenInfo.ingresos}</div>
        <div><strong>Límite de compras:</strong> {regimenInfo.compras}</div>
        <div><strong>Activos fijos:</strong> {regimenInfo.activos}</div>
        <div><strong>Comprobantes:</strong> {regimenInfo.comprobantes}</div>
        <div><strong>Impuestos:</strong> {regimenInfo.impuestos}</div>
        <div><strong>Trabajadores:</strong> {regimenInfo.trabajadores}</div>
      </div>
    </div>
  );
};

export default PerfilEmpresarialModal;