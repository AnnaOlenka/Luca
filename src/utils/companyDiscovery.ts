// Datos de simulación para auto-descubrimiento de empresas
export interface RelatedCompany {
  id: string;
  nombre: string;
  ruc: string;
  relacion: string;
  confidence: number;
  sector?: string;
  estado?: string;
  descripcion?: string;
  fechaConstitucion?: string;
  direccion?: string;
}

// Base de datos simulada de empresas relacionadas
const SIMULATED_COMPANIES: Record<string, RelatedCompany[]> = {
  'juan carlos perez': [
    {
      id: 'comp-001',
      nombre: 'CONSTRUCTORA PÉREZ HERMANOS S.A.C.',
      ruc: '20487123456',
      relacion: 'Gerente General',
      confidence: 95,
      sector: 'Construcción',
      estado: 'Activo',
      descripcion: 'Empresa constructora especializada en obras civiles y edificaciones residenciales.',
      fechaConstitucion: '15/03/2018',
      direccion: 'Av. Larco 1234, Miraflores, Lima'
    },
    {
      id: 'comp-002',
      nombre: 'INVERSIONES JUAN CARLOS E.I.R.L.',
      ruc: '20487654321',
      relacion: 'Titular/Propietario',
      confidence: 92,
      sector: 'Inversiones',
      estado: 'Activo',
      descripcion: 'Empresa de inversiones inmobiliarias y desarrollo de proyectos comerciales.',
      fechaConstitucion: '08/07/2020',
      direccion: 'Jr. Lampa 456, Cercado de Lima, Lima'
    },
    {
      id: 'comp-003',
      nombre: 'SERVICIOS TÉCNICOS PÉREZ S.R.L.',
      ruc: '20487789123',
      relacion: 'Socio (25%)',
      confidence: 78,
      sector: 'Servicios',
      estado: 'Activo',
      descripcion: 'Prestación de servicios técnicos especializados en ingeniería y consultoría.',
      fechaConstitucion: '22/11/2019',
      direccion: 'Calle Los Olivos 789, San Isidro, Lima'
    }
  ],
  'maria elena garcia': [
    {
      id: 'comp-004',
      nombre: 'TEXTILES GARCIA S.A.',
      ruc: '20487456789',
      relacion: 'Directora',
      confidence: 96,
      sector: 'Textil',
      estado: 'Activo',
      descripcion: 'Fabricación y comercialización de productos textiles para el mercado nacional e internacional.',
      fechaConstitucion: '12/05/2016',
      direccion: 'Av. Argentina 2345, Callao'
    },
    {
      id: 'comp-005',
      nombre: 'COMERCIAL MARÍA ELENA E.I.R.L.',
      ruc: '20487987654',
      relacion: 'Titular/Propietario',
      confidence: 94,
      sector: 'Comercio',
      estado: 'Activo',
      descripcion: 'Comercialización al por mayor y menor de productos de consumo masivo.',
      fechaConstitucion: '03/09/2021',
      direccion: 'Jr. Huancavelica 567, Cercado de Lima, Lima'
    },
    {
      id: 'comp-006',
      nombre: 'EXPORTADORA GARCIA HERMANAS S.A.C.',
      ruc: '20487321654',
      relacion: 'Socia (40%)',
      confidence: 85,
      sector: 'Exportación',
      estado: 'Activo',
      descripcion: 'Exportación de productos agroindustriales y textiles a mercados internacionales.',
      fechaConstitucion: '28/02/2017',
      direccion: 'Av. Javier Prado 1890, San Borja, Lima'
    },
    {
      id: 'comp-007',
      nombre: 'CONSULTORA GARCIA ASOCIADOS S.R.L.',
      ruc: '20487159357',
      relacion: 'Gerente Comercial',
      confidence: 71,
      sector: 'Consultoría',
      estado: 'Suspendido',
      descripcion: 'Servicios de consultoría empresarial y asesoría en gestión de negocios.',
      fechaConstitucion: '14/12/2019',
      direccion: 'Calle Las Begonias 234, San Isidro, Lima'
    }
  ],
  'carlos rodriguez martinez': [
    {
      id: 'comp-008',
      nombre: 'TECNOLOGÍA RODRIGUEZ S.A.C.',
      ruc: '20487654987',
      relacion: 'CEO/Fundador',
      confidence: 98,
      sector: 'Tecnología',
      estado: 'Activo',
      descripcion: 'Desarrollo de software empresarial y soluciones tecnológicas innovadoras.',
      fechaConstitucion: '10/01/2020',
      direccion: 'Av. El Derby 789, Surco, Lima'
    },
    {
      id: 'comp-009',
      nombre: 'INNOVACIÓN DIGITAL PERÚ S.R.L.',
      ruc: '20487741852',
      relacion: 'Socio Mayoritario (60%)',
      confidence: 89,
      sector: 'Tecnología',
      estado: 'Activo',
      descripcion: 'Startup especializada en transformación digital para pequeñas y medianas empresas.',
      fechaConstitucion: '05/06/2022',
      direccion: 'Jr. Schell 456, Miraflores, Lima'
    }
  ],
  'ana patricia silva': [
    {
      id: 'comp-010',
      nombre: 'CLÍNICA SILVA ESPECIALIDADES S.A.C.',
      ruc: '20487852963',
      relacion: 'Directora Médica',
      confidence: 93,
      sector: 'Salud',
      estado: 'Activo',
      descripcion: 'Centro médico especializado en cardiología, neurología y medicina interna.',
      fechaConstitucion: '18/09/2015',
      direccion: 'Av. Benavides 1234, Miraflores, Lima'
    },
    {
      id: 'comp-011',
      nombre: 'LABORATORIO SILVA & ASOCIADOS E.I.R.L.',
      ruc: '20487963741',
      relacion: 'Titular/Propietario',
      confidence: 87,
      sector: 'Salud',
      estado: 'Activo',
      descripcion: 'Laboratorio de análisis clínicos y patología con certificaciones internacionales.',
      fechaConstitucion: '25/04/2018',
      direccion: 'Calle Porta 567, San Borja, Lima'
    },
    {
      id: 'comp-012',
      nombre: 'FARMACÉUTICA ANA SILVA S.R.L.',
      ruc: '20487159753',
      relacion: 'Socia (35%)',
      confidence: 76,
      sector: 'Farmacéutico',
      estado: 'Inactivo',
      descripcion: 'Distribución y comercialización de productos farmacéuticos y dispositivos médicos.',
      fechaConstitucion: '07/11/2019',
      direccion: 'Av. Arequipa 890, Lince, Lima'
    }
  ]
};

// Función para normalizar nombres
const normalizeName = (name: string): string => {
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, '') // Remove special characters
    .trim();
};

// Función principal para descubrir empresas relacionadas
export const discoverRelatedCompanies = async (personName: string): Promise<RelatedCompany[]> => {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const normalizedName = normalizeName(personName);
  
  // Buscar coincidencias exactas primero
  let companies = SIMULATED_COMPANIES[normalizedName] || [];
  
  // Si no hay coincidencias exactas, buscar coincidencias parciales
  if (companies.length === 0) {
    const nameParts = normalizedName.split(' ');
    
    Object.keys(SIMULATED_COMPANIES).forEach(key => {
      const keyParts = key.split(' ');
      const commonParts = nameParts.filter(part => keyParts.includes(part));
      
      // Si al menos 2 partes del nombre coinciden, incluir las empresas
      if (commonParts.length >= 2) {
        companies = [...companies, ...SIMULATED_COMPANIES[key]];
      }
    });
  }
  
  // Filtrar duplicados y ordenar por confidence
  const uniqueCompanies = companies.filter((company, index, self) => 
    index === self.findIndex(c => c.id === company.id)
  );
  
  return uniqueCompanies.sort((a, b) => b.confidence - a.confidence);
};

// Función para verificar si un nombre puede tener empresas relacionadas
export const shouldTriggerDiscovery = (personName: string): boolean => {
  const normalizedName = normalizeName(personName);
  
  // Verificar si hay datos para este nombre o nombres similares
  if (SIMULATED_COMPANIES[normalizedName]) {
    return true;
  }
  
  // Verificar coincidencias parciales
  const nameParts = normalizedName.split(' ');
  if (nameParts.length < 2) return false;
  
  return Object.keys(SIMULATED_COMPANIES).some(key => {
    const keyParts = key.split(' ');
    const commonParts = nameParts.filter(part => keyParts.includes(part));
    return commonParts.length >= 2;
  });
};

// Función para obtener estadísticas de descubrimiento
export const getDiscoveryStats = (companies: RelatedCompany[]) => {
  const sectorSet = new Set(companies.map(c => c.sector).filter(Boolean));
  const relationSet = new Set(companies.map(c => c.relacion));
  
  return {
    total: companies.length,
    highConfidence: companies.filter(c => c.confidence >= 90).length,
    mediumConfidence: companies.filter(c => c.confidence >= 70 && c.confidence < 90).length,
    lowConfidence: companies.filter(c => c.confidence < 70).length,
    activeCompanies: companies.filter(c => c.estado === 'Activo').length,
    sectors: Array.from(sectorSet),
    relations: Array.from(relationSet)
  };
};