import React from 'react';
import { X, FileText, BarChart3, MapPin, Briefcase, Receipt, Calculator, FileCheck } from 'lucide-react';

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
    // Mock data based on the screenshot design
    return {
      tipo: "S.A.C.",
      comercial: "CONSERIN",
      inscripcion: "15/07/2015",
      inicioAct: "01/08/2015",
      domicilioFiscal: {
        direccion: "JR. LOS JAZMINES 105",
        urbanizacion: "URB. VILLA FLORIDA",
        distrito: "CASTILLA - PIURA"
      },
      actividadesEconomicas: {
        principal: "4210 - CONST. CARRETERAS",
        secundaria: "7110 - ARQ. E INGENIERÍA"
      },
      comprobantes: {
        sistema: "MANUAL",
        tipos: "FACTURA, BOLETA, NOTA CRÉDITO"
      },
      contabilidad: {
        sistema: "COMPUTARIZADO",
        comercioExt: "SIN ACTIVIDAD"
      },
      obligaciones: [
        { tipo: "PLE", desde: "01/01/2017", activo: true },
        { tipo: "Ret. IGV", desde: "01/05/2024", activo: true }
      ],
      emisionElectronica: [
        { sistema: "Portal SUNAT", desde: "01/01/2020", activo: true },
        { sistema: "Sistemas", desde: "15/03/2019", activo: true }
      ]
    };
  };

  const rucData = getRucData(empresa.ruc);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">


          {/* Header */}
          <div className="bg-blue-600 text-white px-6 py-4 rounded-t flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg">
                FICHA RUC - {empresa.nombre.toUpperCase()}
              </h2>
              <p className="text-sm opacity-80 text-left">RUC: {empresa.ruc}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-black bg-white rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-200 transition"
            >
              ×
            </button>
          </div>

          {/* Grid container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 text-left">

            {/* Datos del Contribuyente */}
            <section className='bg-gray-50 p-4 rounded'>
              <h3 className="font-semibold mb-2">Datos del Contribuyente</h3>
              <p><span className="font-semibold">Tipo:</span> {rucData.tipo}</p>
              <p><span className="font-semibold">Comercial:</span> {rucData.comercial}</p>
              <p><span className="font-semibold">Inscripción:</span> {rucData.inscripcion}</p>
              <p><span className="font-semibold">Inicio Act:</span> {rucData.inicioAct}</p>
            </section>

            {/* Estado y Condición */}
            <section className='bg-gray-50 p-4 rounded'>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Estado y Condición
              </h3>
              <p>
                <span className="font-semibold">Estado:</span> 
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  empresa.estado.toLowerCase() === 'activo' 
                    ? 'bg-green-200 text-green-800' 
                    : 'bg-red-200 text-red-800'
                }`}>
                  {empresa.estado.toUpperCase()}
                </span>
              </p>
              <p>
                <span className="font-semibold">Condición:</span> 
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  empresa.condicion.toLowerCase() === 'habido' 
                    ? 'bg-green-200 text-green-800' 
                    : empresa.condicion.toLowerCase() === 'no habido'
                    ? 'bg-orange-200 text-orange-800'
                    : 'bg-yellow-200 text-yellow-800'
                }`}>
                  {empresa.condicion.toUpperCase()}
                </span>
              </p>
            </section>

            {/* Domicilio Fiscal */}
            <section className='bg-gray-50 p-4 rounded'>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Domicilio Fiscal
              </h3>
              <address className="font-semibold not-italic leading-relaxed text-gray-700">
                {rucData.domicilioFiscal.direccion} - {rucData.domicilioFiscal.urbanizacion}<br/>
                {rucData.domicilioFiscal.distrito}
              </address>
            </section>

            {/* Actividades Económicas */}
            <section className='bg-gray-50 p-4 rounded'>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Actividades Económicas
              </h3>
              <p><span className="font-semibold">Principal:</span> {rucData.actividadesEconomicas.principal}</p>
              <p><span className="font-semibold">Secundaria:</span> {rucData.actividadesEconomicas.secundaria}</p>
            </section>

            {/* Comprobantes */}
            <section className='bg-gray-50 p-4 rounded'>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                Comprobantes
              </h3>
              <p><span className="font-semibold">Sistema:</span> {rucData.comprobantes.sistema}</p>
              <p><span className="font-semibold">Tipos:</span> {rucData.comprobantes.tipos}</p>
            </section>

            {/* Contabilidad */}
            <section className='bg-gray-50 p-4 rounded'>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                Contabilidad
              </h3>
              <p><span className="font-semibold">Sistema:</span> {rucData.contabilidad.sistema}</p>
              <p><span className="font-semibold">Com. Ext:</span> {rucData.contabilidad.comercioExt}</p>
            </section>

            {/* Obligaciones */}
            <section className=' bg-gray-50 p-4 rounded'>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Obligaciones
              </h3>
              {rucData.obligaciones.map((obligacion, index) => (
                <p key={index}> - {obligacion.tipo} desde {obligacion.desde}</p>
              ))}
            </section>

            {/* Emisión Electrónica */}
            <section className=" bg-gray-50 p-4 rounded ">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Emisión Electrónica
              </h3>
              {rucData.emisionElectronica.map((emision, index) => (
                <p key={index}> - {emision.sistema}: ✓ {emision.desde}</p>
              ))}
            </section>

          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
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