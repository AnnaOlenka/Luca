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
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      document.head.appendChild(script);
      
      await new Promise((resolve) => {
        script.onload = resolve;
      });
      
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(59, 130, 246);
      doc.text('FICHA RUC - CONSULTA SUNAT', 20, 20);
      
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.8);
      doc.line(20, 35, 190, 35);
      
      let yPosition = 45;
      const tableX = 20;
      const tableWidth = 170;
      const leftColWidth = 85;
      const rightColWidth = 85;
      const padding = 2; // Reduced padding
      
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(1);
      doc.rect(tableX, yPosition, tableWidth, 0);
      
      // Header
      doc.setFillColor('#2f79b9');
      doc.rect(tableX, yPosition, tableWidth, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('Resultado de la Búsqueda', tableX + 5, yPosition + 8);
      yPosition += 12;
      
      const addTableRow = (label: string, value: string, isHighlighted: boolean = false) => {
        const labelColor = isHighlighted ? '#437e43' : '#000000';
        const valueColor = isHighlighted ? '#437e43' : '#4b5563';
        const labelBg = isHighlighted ? '#dff0d7' : '#ffffff';
        const valueBg = isHighlighted ? '#dff0d7' : '#ffffff';

        doc.setFontSize(9);
        const labelLines = doc.splitTextToSize(label, leftColWidth - padding * 2);
        const valueLines = doc.splitTextToSize(value, rightColWidth - padding * 2);
        const rowHeight = Math.max(labelLines.length, valueLines.length) * 5 + padding * 2;
        
        // Background
        doc.setFillColor(labelBg);
        doc.rect(tableX, yPosition, leftColWidth, rowHeight, 'F');
        doc.setFillColor(valueBg);
        doc.rect(tableX + leftColWidth, yPosition, rightColWidth, rowHeight, 'F');
        
        // Borders
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.rect(tableX, yPosition, leftColWidth, rowHeight, 'S');
        doc.rect(tableX + leftColWidth, yPosition, rightColWidth, rowHeight, 'S');
        
        // Label Text
        doc.setTextColor(labelColor);
        doc.text(labelLines, tableX + padding, yPosition + padding + 4);
        
        // Value Text
        doc.setTextColor(valueColor);
        doc.text(valueLines, tableX + leftColWidth + padding, yPosition + padding + 4);
        
        yPosition += rowHeight;
        
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      };

      const addSplitRow = (label1: string, value1: string, label2: string, value2: string) => {
        const quarterWidth = tableWidth / 4;
        const textColor = '#000000';
        const valueColor = '#4b5563';
        const labelBg = '#ffffff';

        doc.setFontSize(8);
        const label1Lines = doc.splitTextToSize(label1, quarterWidth - padding * 2);
        const value1Lines = doc.splitTextToSize(value1, quarterWidth - padding * 2);
        const label2Lines = doc.splitTextToSize(label2, quarterWidth - padding * 2);
        const value2Lines = doc.splitTextToSize(value2, quarterWidth - padding * 2);

        const rowHeight = Math.max(label1Lines.length, value1Lines.length, label2Lines.length, value2Lines.length) * 4 + padding * 2;
        
        // Columna 1
        doc.setFillColor(labelBg);
        doc.rect(tableX, yPosition, quarterWidth, rowHeight, 'F');
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.rect(tableX, yPosition, quarterWidth, rowHeight, 'S');
        doc.setTextColor(textColor);
        doc.text(label1Lines, tableX + padding, yPosition + padding + 4);
        
        // Columna 2
        doc.rect(tableX + quarterWidth, yPosition, quarterWidth, rowHeight, 'S');
        doc.setTextColor(valueColor);
        doc.text(value1Lines, tableX + quarterWidth + padding, yPosition + padding + 4);
        
        // Columna 3
        doc.setFillColor(labelBg);
        doc.rect(tableX + (quarterWidth * 2), yPosition, quarterWidth, rowHeight, 'F');
        doc.rect(tableX + (quarterWidth * 2), yPosition, quarterWidth, rowHeight, 'S');
        doc.setTextColor(textColor);
        doc.text(label2Lines, tableX + (quarterWidth * 2) + padding, yPosition + padding + 4);
        
        // Columna 4
        doc.rect(tableX + (quarterWidth * 3), yPosition, quarterWidth, rowHeight, 'S');
        doc.setTextColor(valueColor);
        doc.text(value2Lines, tableX + (quarterWidth * 3) + padding, yPosition + padding + 4);
        
        yPosition += rowHeight;
      };
      
      addTableRow('Número de RUC:', rucData.numeroRuc);
      addTableRow('Tipo Contribuyente:', rucData.tipoContribuyente);
      addTableRow('Nombre Comercial:', rucData.nombreComercial || '-');
      
      addSplitRow('Fecha de Inscripción:', rucData.fechaInscripcion, 'Fecha de Inicio de Actividades:', rucData.fechaInicioActividades);
      
      addTableRow('Estado del Contribuyente:', rucData.estadoContribuyente, true);
      addTableRow('Condición del Contribuyente:', rucData.condicionContribuyente, true);
      
      addTableRow('Domicilio Fiscal:', rucData.domicilioFiscal);
      addSplitRow('Sistema Emisión de Comprobante:', rucData.sistemaEmisionComprobante, 'Actividad Comercio Exterior:', rucData.actividadComercioExterior);
      addTableRow('Sistema Contabilidad:', rucData.sistemaContabilidad);
      addTableRow('Actividad(es) Económica(s):', rucData.actividadesEconomicas);
      addTableRow('Comprobantes de Pago c/aut. de impresión (F. 806 u 816):', rucData.comprobantesPago);
      addTableRow('Sistema de Emisión Electrónica:', rucData.sistemaEmisionElectronica);
      addTableRow('Emisor electrónico desde:', rucData.emisorElectronicoDesde);
      addTableRow('Comprobantes Electrónicos:', rucData.comprobantesElectronicos);
      addTableRow('Afiliado al PLE desde:', rucData.afiliadoPLE);
      addTableRow('Padrones:', rucData.padrones);
      
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(1);
      doc.rect(tableX, 45, tableWidth, yPosition - 45, 'S');
      
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
        <div 
          className="relative flex flex-col shadow-xl overflow-y-auto"
          style={{ 
            width: '56rem', 
            height: '37.5rem', 
            borderRadius: '0.75rem', 
            backgroundColor: 'white' 
          }}
        >
          {/* Header */}
          <div className="p-6" style={{ backgroundColor: '#2563eb', color: 'white', borderRadius: '0.75rem 0.75rem 0 0' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold">FICHA RUC - CONSULTA SUNAT</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2"
                style={{ color: 'white', backgroundColor: 'transparent', border: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e40af'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            
            {/* Botón de descarga */}
            <div className="mb-4 flex justify-end">
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-md"
                style={{ backgroundColor: '#16a34a', color: 'white', border: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
              >
                <Download className="w-4 h-4" />
                Descargar Ficha RUC (PDF)
              </button>
            </div>
            
            {/* Panel con borde azul */}
            <div className="border-2 rounded" style={{ borderColor: '#2563eb' }}>
              
              {/* Header del panel */}
              <div className="px-4 py-2 text-sm font-medium" style={{ backgroundColor: '#2f79b9', color: 'white' }}>
                Resultado de la Búsqueda
              </div>
              
              {/* Tabla de datos */}
              <div style={{ backgroundColor: 'white' }}>
                
                {/* Número de RUC */}
                <div style={{ borderBottom: '1px solid #d1d5db' }}>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#000000ff', fontSize: '0.875rem' }}>Número de RUC:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="font-semibold" style={{ color: '#1f2937', fontSize: '0.875rem' }}>{rucData.numeroRuc}</span>
                    </div>
                  </div>
                </div>

                {/* Tipo Contribuyente */}
                <div style={{ borderBottom: '1px solid #d1d5db' }}>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#000000ff', fontSize: '0.875rem' }}>Tipo Contribuyente:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{rucData.tipoContribuyente}</span>
                    </div>
                  </div>
                </div>

                {/* Nombre Comercial */}
                <div style={{ borderBottom: '1px solid #d1d5db' }}>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#000000ff', fontSize: '0.875rem' }}>Nombre Comercial:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{rucData.nombreComercial || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Fechas - en una sola fila */}
                <div style={{ borderBottom: '1px solid #d1d5db' }}>
                  <div className="grid grid-cols-4">
                    <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#000000ff', fontSize: '0.875rem' }}>Fecha de Inscripción:</span>
                    </div>
                    <div className="px-4 py-3" style={{ borderRight: '1px solid #d1d5db' }}>
                      <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{rucData.fechaInscripcion}</span>
                    </div>
                    <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#000000ff', fontSize: '0.875rem' }}>Fecha de Inicio de Actividades:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{rucData.fechaInicioActividades}</span>
                    </div>
                  </div>
                </div>

                {/* Estado del Contribuyente */}
                <div style={{ borderBottom: '1px solid #d1d5db', backgroundColor: '#dff0d7' }}>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-3" style={{ backgroundColor: '#dff0d7', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#437e43', fontSize: '0.875rem' }}>Estado del Contribuyente:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="font-semibold" style={{ color: '#437e43', fontSize: '0.875rem' }}>{rucData.estadoContribuyente}</span>
                    </div>
                  </div>
                </div>

                {/* Condición del Contribuyente */}
                <div style={{ borderBottom: '1px solid #d1d5db', backgroundColor: '#dff0d7' }}>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-3" style={{ backgroundColor: '#dff0d7', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#437e43', fontSize: '0.875rem' }}>Condición del Contribuyente:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span className="font-semibold" style={{ color: '#437e43', fontSize: '0.875rem' }}>{rucData.condicionContribuyente}</span>
                    </div>
                  </div>
                </div>

                {/* Domicilio Fiscal */}
                <div style={{ borderBottom: '1px solid #d1d5db' }}>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#000000ff', fontSize: '0.875rem' }}>Domicilio Fiscal:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{rucData.domicilioFiscal}</span>
                    </div>
                  </div>
                </div>

                {/* Sistema Emisión y Comercio Exterior */}
                <div style={{ borderBottom: '1px solid #d1d5db' }}>
                  <div className="grid grid-cols-4">
                    <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#000000ff', fontSize: '0.875rem' }}>Sistema Emisión de Comprobante:</span>
                    </div>
                    <div className="px-4 py-3" style={{ borderRight: '1px solid #d1d5db' }}>
                      <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{rucData.sistemaEmisionComprobante}</span>
                    </div>
                    <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#000000ff', fontSize: '0.875rem' }}>Actividad Comercio Exterior:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{rucData.actividadComercioExterior}</span>
                    </div>
                  </div>
                </div>

                {/* Sistema Contabilidad */}
                <div style={{ borderBottom: '1px solid #d1d5db' }}>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#000000ff', fontSize: '0.875rem' }}>Sistema Contabilidad:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{rucData.sistemaContabilidad}</span>
                    </div>
                  </div>
                </div>

                {/* Actividades Económicas */}
                <div style={{ borderBottom: '1px solid #d1d5db' }}>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#000000ff', fontSize: '0.875rem' }}>Actividad(es) Económica(s):</span>
                    </div>
                    <div className="px-4 py-3">
                      <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{rucData.actividadesEconomicas}</span>
                    </div>
                  </div>
                </div>

                {/* Comprobantes de Pago */}
                <div style={{ borderBottom: '1px solid #d1d5db' }}>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#000000ff', fontSize: '0.875rem' }}>Comprobantes de Pago c/aut. de impresión (F. 806 u 816):</span>
                    </div>
                    <div className="px-4 py-3">
                      <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{rucData.comprobantesPago}</span>
                    </div>
                  </div>
                </div>

                {/* Sistema de Emisión Electrónica */}
                <div style={{ borderBottom: '1px solid #d1d5db' }}>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#000000ff', fontSize: '0.875rem' }}>Sistema de Emisión Electrónica:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{rucData.sistemaEmisionElectronica}</span>
                    </div>
                  </div>
                </div>

                {/* Emisor electrónico desde */}
                <div style={{ borderBottom: '1px solid #d1d5db' }}>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#000000ff', fontSize: '0.875rem' }}>Emisor electrónico desde:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{rucData.emisorElectronicoDesde}</span>
                    </div>
                  </div>
                </div>

                {/* Comprobantes Electrónicos */}
                <div style={{ borderBottom: '1px solid #d1d5db' }}>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#000000ff', fontSize: '0.875rem' }}>Comprobantes Electrónicos:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{rucData.comprobantesElectronicos}</span>
                    </div>
                  </div>
                </div>

                {/* Afiliado al PLE desde */}
                <div style={{ borderBottom: '1px solid #d1d5db' }}>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#000000ff', fontSize: '0.875rem' }}>Afiliado al PLE desde:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{rucData.afiliadoPLE}</span>
                    </div>
                  </div>
                </div>

                {/* Padrones */}
                <div>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-3" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #d1d5db' }}>
                      <span className="font-semibold" style={{ color: '#000000ff', fontSize: '0.875rem' }}>Padrones:</span>
                    </div>
                    <div className="px-4 py-3">
                      <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{rucData.padrones}</span>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Footer del panel */}
              <div className="px-4 py-2 text-center" style={{ backgroundColor: '#f3f4f6', borderTop: '1px solid #d1d5db' }}>
                <small style={{ color: '#6b7280' }}>Fecha consulta: {new Date().toLocaleString('es-PE', {
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
          <div className="px-6 py-4" style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', borderRadius: '0 0 0.75rem 0.75rem' }}>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#6b7280', color: 'white', border: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
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