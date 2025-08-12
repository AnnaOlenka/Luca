import React from 'react';
import { X, Download } from 'lucide-react';

interface RucModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: {
    id: string;
    nombre: string;
    ruc: string;
    estado: string;
    condicion: string;
  };
}

const RucModal: React.FC<RucModalProps> = ({ isOpen, onClose, empresa }) => {
  if (!isOpen) return null;

  const getRucData = (ruc: string) => {
    return {
      numeroRuc: `${empresa.ruc} - ${empresa.nombre.toUpperCase()}`,
      tipoContribuyente: "SOCIEDAD ANONIMA CERRADA",
      tipoDocumento: `RUC ${empresa.ruc} - ${empresa.nombre.toUpperCase()}`,
      nombreComercial: "CONSERIN",
      fechaInscripcion: "15/07/2015",
      fechaInicioActividades: "01/08/2015",
      estadoContribuyente: empresa.estado.toUpperCase(),
      condicionContribuyente: empresa.condicion.toUpperCase(),
      domicilioFiscal: "JR. LOS JAZMINES 105 - URB. VILLA FLORIDA - CASTILLA - PIURA",
      sistemaEmisionComprobante: "MANUAL",
      actividadComercioExterior: "SIN ACTIVIDAD",
      sistemaContabilidad: "COMPUTARIZADO",
      actividadesEconomicas: "Principal - 4210 - CONSTRUCCION DE CARRETERAS Y PISTAS DE ATERRIZAJE",
      comprobantesPago: "FACTURA, BOLETA DE VENTA, NOTA DE CRÉDITO",
      sistemaEmisionElectronica: "FACTURA AFILIADO DESDE 01/01/2020",
      emisorElectronicoDesde: "01/01/2020",
      comprobantesElectronicos: "FACTURA, BOLETA, NOTA DE CRÉDITO (desde 01/01/2020)",
      afiliadoPLE: "01/01/2017",
      padrones: "RETENCIONES IGV DESDE 01/05/2024"
    };
  };

  const rucData = getRucData(empresa.ruc);

  const downloadPDF = async () => {
    try {
      // Cargar jsPDF dinámicamente desde el CDN
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      document.head.appendChild(script);
      
      await new Promise((resolve) => {
        script.onload = resolve;
      });
      
      // @ts-ignore - jsPDF se carga globalmente
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Título principal
      doc.setFontSize(18);
      doc.setTextColor(59, 130, 246);
      doc.text('FICHA RUC - CONSULTA SUNAT', 20, 20);
      
      // Línea separadora azul
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.8);
      doc.line(20, 35, 190, 35);
      
      // Configuración de la tabla
      let yPosition = 45;
      const tableX = 20;
      const tableWidth = 170;
      const leftColWidth = 85;
      const rightColWidth = 85;
      const rowHeight = 12;
      
      // Borde exterior de la tabla
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(1);
      doc.rect(tableX, yPosition, tableWidth, 0); // Solo para empezar
      
      // Header de la tabla
      doc.setFillColor(59, 130, 246);
      doc.rect(tableX, yPosition, tableWidth, rowHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('Resultado de la Búsqueda', tableX + 5, yPosition + 8);
      yPosition += rowHeight;
      
      // Función para agregar fila de la tabla
      const addTableRow = (label: string, value: string, isHighlighted: boolean = false) => {
        // Fondo de la fila
        if (isHighlighted) {
          doc.setFillColor(220, 252, 231); // Verde claro
          doc.rect(tableX, yPosition, tableWidth, rowHeight, 'F');
        }
        
        // Columna izquierda (etiqueta)
        doc.setFillColor(239, 246, 255); // Azul muy claro
        doc.rect(tableX, yPosition, leftColWidth, rowHeight, 'F');
        
        // Bordes
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.rect(tableX, yPosition, leftColWidth, rowHeight, 'S');
        doc.rect(tableX + leftColWidth, yPosition, rightColWidth, rowHeight, 'S');
        
        // Texto de la etiqueta
        doc.setFontSize(9);
        doc.setTextColor(30, 64, 175);
        const labelLines = doc.splitTextToSize(label, leftColWidth - 4);
        doc.text(labelLines, tableX + 2, yPosition + 6);
        
        // Texto del valor
        doc.setTextColor(isHighlighted ? 21 : 75, isHighlighted ? 128 : 85, isHighlighted ? 61 : 99);
        const valueLines = doc.splitTextToSize(value, rightColWidth - 4);
        doc.text(valueLines, tableX + leftColWidth + 2, yPosition + 6);
        
        yPosition += rowHeight;
        
        // Nueva página si es necesario
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      };
      
      // Función para fila con 4 columnas (fechas)
      const addSplitRow = (label1: string, value1: string, label2: string, value2: string) => {
        const quarterWidth = tableWidth / 4;
        
        // Primera columna (etiqueta 1)
        doc.setFillColor(239, 246, 255);
        doc.rect(tableX, yPosition, quarterWidth, rowHeight, 'F');
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.rect(tableX, yPosition, quarterWidth, rowHeight, 'S');
        doc.setFontSize(8);
        doc.setTextColor(30, 64, 175);
        const label1Lines = doc.splitTextToSize(label1, quarterWidth - 2);
        doc.text(label1Lines, tableX + 1, yPosition + 6);
        
        // Segunda columna (valor 1)
        doc.rect(tableX + quarterWidth, yPosition, quarterWidth, rowHeight, 'S');
        doc.setTextColor(75, 85, 99);
        doc.text(value1, tableX + quarterWidth + 1, yPosition + 6);
        
        // Tercera columna (etiqueta 2)
        doc.setFillColor(239, 246, 255);
        doc.rect(tableX + (quarterWidth * 2), yPosition, quarterWidth, rowHeight, 'F');
        doc.rect(tableX + (quarterWidth * 2), yPosition, quarterWidth, rowHeight, 'S');
        doc.setTextColor(30, 64, 175);
        const label2Lines = doc.splitTextToSize(label2, quarterWidth - 2);
        doc.text(label2Lines, tableX + (quarterWidth * 2) + 1, yPosition + 6);
        
        // Cuarta columna (valor 2)
        doc.rect(tableX + (quarterWidth * 3), yPosition, quarterWidth, rowHeight, 'S');
        doc.setTextColor(75, 85, 99);
        doc.text(value2, tableX + (quarterWidth * 3) + 1, yPosition + 6);
        
        yPosition += rowHeight;
      };
      
      // Agregar todas las filas de la tabla
      addTableRow('Número de RUC:', rucData.numeroRuc);
      addTableRow('Tipo Contribuyente:', rucData.tipoContribuyente);
      addTableRow('Tipo de Documento:', rucData.tipoDocumento);
      addTableRow('Nombre Comercial:', rucData.nombreComercial || '-');
      
      // Fila especial para fechas (4 columnas)
      addSplitRow('Fecha de Inscripción:', rucData.fechaInscripcion, 'Fecha Inicio Act.:', rucData.fechaInicioActividades);
      
      // Continuar con filas destacadas
      addTableRow('Estado del Contribuyente:', rucData.estadoContribuyente, true);
      addTableRow('Condición del Contribuyente:', rucData.condicionContribuyente, true);
      
      // Resto de filas normales
      addTableRow('Domicilio Fiscal:', rucData.domicilioFiscal);
      addTableRow('Sistema Contabilidad:', rucData.sistemaContabilidad);
      addTableRow('Actividad(es) Económica(s):', rucData.actividadesEconomicas);
      addTableRow('Comprobantes de Pago:', rucData.comprobantesPago);
      addTableRow('Sistema de Emisión Electrónica:', rucData.sistemaEmisionElectronica);
      addTableRow('Emisor electrónico desde:', rucData.emisorElectronicoDesde);
      addTableRow('Comprobantes Electrónicos:', rucData.comprobantesElectronicos);
      addTableRow('Afiliado al PLE desde:', rucData.afiliadoPLE);
      addTableRow('Padrones:', rucData.padrones);
      
      // Borde final de la tabla
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(1);
      doc.rect(tableX, 45, tableWidth, yPosition - 45, 'S');
      
      // Footer
      yPosition += 8;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const fechaConsulta = new Date().toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Fecha consulta: ${fechaConsulta}`, 20, yPosition);
      
      // Descargar el PDF
      doc.save(`Ficha_RUC_${empresa.ruc}_${empresa.nombre.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtelo nuevamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
          
          {/* Header */}
          <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg">
                FICHA RUC - CONSULTA SUNAT
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="text-black bg-white rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-200 transition"
            >
              ×
            </button>
          </div>

          {/* Content with scroll */}
          <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-4">
            
            {/* Botón de descarga */}
            <div className="mb-4 flex justify-end">
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
              >
                <Download className="w-4 h-4" />
                Descargar Ficha RUC (PDF)
              </button>
            </div>
            
            {/* Panel con borde azul */}
            <div className="border-2 border-blue-400 rounded">
              
              {/* Header del panel */}
              <div className="bg-blue-500 text-white px-4 py-2 text-sm font-medium">
                Resultado de la Búsqueda
              </div>
              
              {/* Tabla de datos */}
              <div className="bg-white">
                
                {/* Número de RUC */}
                <div className="border-b border-gray-300">
                  <div className="grid grid-cols-2">
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Número de RUC:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="font-semibold text-gray-800 text-sm">{rucData.numeroRuc}</span>
                    </div>
                  </div>
                </div>

                {/* Tipo Contribuyente */}
                <div className="border-b border-gray-300">
                  <div className="grid grid-cols-2">
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Tipo Contribuyente:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-gray-700 text-sm">{rucData.tipoContribuyente}</span>
                    </div>
                  </div>
                </div>

                {/* Tipo de Documento */}
                <div className="border-b border-gray-300">
                  <div className="grid grid-cols-2">
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Tipo de Documento:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-blue-600 text-sm underline">{rucData.tipoDocumento}</span>
                    </div>
                  </div>
                </div>

                {/* Nombre Comercial */}
                <div className="border-b border-gray-300">
                  <div className="grid grid-cols-2">
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Nombre Comercial:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-gray-700 text-sm">{rucData.nombreComercial || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Fechas - en una sola fila */}
                <div className="border-b border-gray-300">
                  <div className="grid grid-cols-4">
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Fecha de Inscripción:</span>
                    </div>
                    <div className="px-4 py-3 border-r border-gray-300">
                      <span className="text-gray-700 text-sm">{rucData.fechaInscripcion}</span>
                    </div>
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Fecha de Inicio de Actividades:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-gray-700 text-sm">{rucData.fechaInicioActividades}</span>
                    </div>
                  </div>
                </div>

                {/* Estado del Contribuyente */}
                <div className="border-b border-gray-300 bg-green-100">
                  <div className="grid grid-cols-2">
                    <div className="bg-green-200 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-green-800 text-sm">Estado del Contribuyente:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-green-700 text-sm font-semibold">{rucData.estadoContribuyente}</span>
                    </div>
                  </div>
                </div>

                {/* Condición del Contribuyente */}
                <div className="border-b border-gray-300 bg-green-100">
                  <div className="grid grid-cols-2">
                    <div className="bg-green-200 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-green-800 text-sm">Condición del Contribuyente:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-green-700 text-sm font-semibold">{rucData.condicionContribuyente}</span>
                    </div>
                  </div>
                </div>

                {/* Domicilio Fiscal */}
                <div className="border-b border-gray-300">
                  <div className="grid grid-cols-2">
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Domicilio Fiscal:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-gray-700 text-sm">{rucData.domicilioFiscal}</span>
                    </div>
                  </div>
                </div>

                {/* Sistema Emisión y Comercio Exterior */}
                <div className="border-b border-gray-300">
                  <div className="grid grid-cols-4">
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Sistema Emisión de Comprobante:</span>
                    </div>
                    <div className="px-4 py-3 border-r border-gray-300">
                      <span className="text-gray-700 text-sm">{rucData.sistemaEmisionComprobante}</span>
                    </div>
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Actividad Comercio Exterior:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-red-600 text-sm">{rucData.actividadComercioExterior}</span>
                    </div>
                  </div>
                </div>

                {/* Sistema Contabilidad */}
                <div className="border-b border-gray-300">
                  <div className="grid grid-cols-2">
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Sistema Contabilidad:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-gray-700 text-sm">{rucData.sistemaContabilidad}</span>
                    </div>
                  </div>
                </div>

                {/* Actividades Económicas */}
                <div className="border-b border-gray-300">
                  <div className="grid grid-cols-2">
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Actividad(es) Económica(s):</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-blue-600 text-sm underline">{rucData.actividadesEconomicas}</span>
                    </div>
                  </div>
                </div>

                {/* Comprobantes de Pago */}
                <div className="border-b border-gray-300">
                  <div className="grid grid-cols-2">
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Comprobantes de Pago c/aut. de impresión (F. 806 u 816):</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-gray-700 text-sm">{rucData.comprobantesPago}</span>
                    </div>
                  </div>
                </div>

                {/* Sistema de Emisión Electrónica */}
                <div className="border-b border-gray-300">
                  <div className="grid grid-cols-2">
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Sistema de Emisión Electrónica:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-gray-700 text-sm">{rucData.sistemaEmisionElectronica}</span>
                    </div>
                  </div>
                </div>

                {/* Emisor electrónico desde */}
                <div className="border-b border-gray-300">
                  <div className="grid grid-cols-2">
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Emisor electrónico desde:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-gray-700 text-sm">{rucData.emisorElectronicoDesde}</span>
                    </div>
                  </div>
                </div>

                {/* Comprobantes Electrónicos */}
                <div className="border-b border-gray-300">
                  <div className="grid grid-cols-2">
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Comprobantes Electrónicos:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-gray-700 text-sm">{rucData.comprobantesElectronicos}</span>
                    </div>
                  </div>
                </div>

                {/* Afiliado al PLE desde */}
                <div className="border-b border-gray-300">
                  <div className="grid grid-cols-2">
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Afiliado al PLE desde:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-gray-700 text-sm">{rucData.afiliadoPLE}</span>
                    </div>
                  </div>
                </div>

                {/* Padrones */}
                <div>
                  <div className="grid grid-cols-2">
                    <div className="bg-blue-50 px-4 py-3 border-r border-gray-300">
                      <span className="font-semibold text-blue-800 text-sm">Padrones:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="text-gray-700 text-sm">{rucData.padrones}</span>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Footer del panel */}
              <div className="bg-gray-100 px-4 py-2 text-center border-t border-gray-300">
                <small className="text-gray-600">Fecha consulta: {new Date().toLocaleString('es-PE', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</small>
              </div>
              
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RucModal;