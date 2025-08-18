/**
 * Mapeamento de campos entre DSO e Frontend
 * Baseado na documentação MAPEAMENTO_DSO_PRODUCAO.md
 */

export interface DSOUserData {
  // Dados pessoais
  name: string;
  email: string;
  document: string;      // CPF no DSO
  phone: string;
  birthDate: string;
  gender: string;
  pronouns: string;
  deficiency?: string;
  
  // Endereço (campos DSO - conforme documentação)
  street: string;        // ⚠️ DSO usa 'street', frontend usa 'address'
  number: string;        // ⚠️ DSO usa 'number', frontend usa 'addressNumber'
  addressComplement: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  cep: string;
  
  // Campos alternativos que podem vir do DSO
  address?: string;      // Campo alternativo para street
  logradouro?: string;   // Campo alternativo para street
  addressNumber?: string; // Campo alternativo para number
  numero?: string;       // Campo alternativo para number
  zipCode?: string;      // Campo alternativo para cep
  postalCode?: string;   // Campo alternativo para cep
  
  // Profissional
  profission: string;    // ⚠️ DSO usa 'profission', frontend usa 'profession'
  profession?: string;   // Campo alternativo
  
  // Dados do sistema
  id?: string;
  dynamicsId?: string;
  contactid?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

export interface FrontendUserData {
  // Dados pessoais
  name: string;
  email: string;
  document: string;      // CPF
  phone: string;
  birthDate: string;
  gender: string;
  pronouns: string;
  deficiency?: string;
  
  // Endereço (campos frontend)
  address: string;       // Logradouro (mapeado de 'street')
  addressNumber: string; // Número (mapeado de 'number')
  addressComplement: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  cep: string;
  zipCode: string;       // Campo adicional para compatibilidade
  
  // Profissional
  profession: string;    // Profissão (mapeado de 'profission')
  
  // Dados do sistema
  id?: string;
  contactid?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

/**
 * Mapeia dados do DSO para o formato do frontend
 */
export function mapDSOToFrontend(dsoData: Partial<DSOUserData>): Partial<FrontendUserData> {
  console.log('🔄 [DSO Mapping] Mapeando dados do DSO para frontend...');
  console.log('📋 [DSO Mapping] Dados recebidos:', dsoData);
  
  // Debug específico para verificar se os campos de endereço existem
  console.log('🏠 [DSO Mapping] Debug campos de endereço recebidos:');
  console.log('  - street (DSO):', dsoData.street, typeof dsoData.street);
  console.log('  - address (DSO):', dsoData.address, typeof dsoData.address);
  console.log('  - logradouro (DSO):', dsoData.logradouro, typeof dsoData.logradouro);
  console.log('  - number (DSO):', dsoData.number, typeof dsoData.number);
  console.log('  - addressNumber (DSO):', dsoData.addressNumber, typeof dsoData.addressNumber);
  console.log('  - numero (DSO):', dsoData.numero, typeof dsoData.numero);
  console.log('  - cep (DSO):', dsoData.cep, typeof dsoData.cep);
  console.log('  - zipCode (DSO):', dsoData.zipCode, typeof dsoData.zipCode);
  console.log('  - neighborhood (DSO):', dsoData.neighborhood, typeof dsoData.neighborhood);
  console.log('  - city (DSO):', dsoData.city, typeof dsoData.city);
  console.log('  - state (DSO):', dsoData.state, typeof dsoData.state);
  
  const mapped: Partial<FrontendUserData> = {
    // Campos que permanecem iguais
    name: dsoData.name,
    email: dsoData.email,
    document: dsoData.document,
    phone: dsoData.phone,
    birthDate: dsoData.birthDate,
    gender: dsoData.gender,
    pronouns: dsoData.pronouns,
    deficiency: dsoData.deficiency,
    addressComplement: dsoData.addressComplement,
    neighborhood: dsoData.neighborhood,
    city: dsoData.city,
    state: dsoData.state,
    country: dsoData.country,
    
    // Campos que precisam ser mapeados - com fallbacks múltiplos
    address: dsoData.street || dsoData.address || dsoData.logradouro || '',
    addressNumber: dsoData.number || dsoData.addressNumber || dsoData.numero || '',
    profession: dsoData.profission || dsoData.profession || '',
    
    // CEP com múltiplas variações
    cep: dsoData.cep || dsoData.zipCode || dsoData.postalCode || '',
    zipCode: dsoData.cep || dsoData.zipCode || dsoData.postalCode || '',
  };
  
  console.log('✅ [DSO Mapping] Dados mapeados:', mapped);
  
  // Debug específico dos campos de endereço mapeados
  console.log('🏠 [DSO Mapping] Debug campos de endereço mapeados:');
  console.log('  - address (mapeado):', mapped.address, 'de:', dsoData.street || dsoData.address || dsoData.logradouro);
  console.log('  - addressNumber (mapeado):', mapped.addressNumber, 'de:', dsoData.number || dsoData.addressNumber || dsoData.numero);
  console.log('  - neighborhood (mapeado):', mapped.neighborhood, 'de:', dsoData.neighborhood);
  console.log('  - city (mapeado):', mapped.city, 'de:', dsoData.city);
  console.log('  - state (mapeado):', mapped.state, 'de:', dsoData.state);
  console.log('  - cep (mapeado):', mapped.cep, 'de:', dsoData.cep || dsoData.zipCode || dsoData.postalCode);
  console.log('  - zipCode (mapeado):', mapped.zipCode, 'de:', dsoData.cep || dsoData.zipCode || dsoData.postalCode);
  
  // Verificar se campos de endereço estão vazios
  const emptyAddressFields = [];
  if (!mapped.address) emptyAddressFields.push('address');
  if (!mapped.addressNumber) emptyAddressFields.push('addressNumber');
  if (!mapped.neighborhood) emptyAddressFields.push('neighborhood');
  if (!mapped.city) emptyAddressFields.push('city');
  if (!mapped.state) emptyAddressFields.push('state');
  if (!mapped.cep) emptyAddressFields.push('cep');
  
  if (emptyAddressFields.length > 0) {
    console.warn('⚠️ [DSO Mapping] Campos de endereço vazios:', emptyAddressFields);
  } else {
    console.log('✅ [DSO Mapping] Todos os campos de endereço foram mapeados com sucesso');
  }
  
  return mapped;
}

/**
 * Mapeia dados do frontend para o formato do DSO
 */
export function mapFrontendToDSO(frontendData: Partial<FrontendUserData>): Partial<DSOUserData> {
  const mapped: Partial<DSOUserData> = {
    // Campos que permanecem iguais
    name: frontendData.name,
    email: frontendData.email,
    document: frontendData.document,
    phone: frontendData.phone,
    birthDate: frontendData.birthDate,
    gender: frontendData.gender,
    pronouns: frontendData.pronouns,
    deficiency: frontendData.deficiency,
    addressComplement: frontendData.addressComplement,
    neighborhood: frontendData.neighborhood,
    city: frontendData.city,
    state: frontendData.state,
    country: frontendData.country,
    cep: frontendData.cep,
    
    // ⚠️ MAPEAMENTO CRÍTICO - Campos que mudam de nome
    // Frontend → DSO (reverso)
    street: frontendData.address,               // address → street
    number: frontendData.addressNumber,         // addressNumber → number
    profission: frontendData.profession,        // profession → profission
    dynamicsId: frontendData.contactid,         // contactid → dynamicsId
  };

  // Remove campos undefined
  Object.keys(mapped).forEach(key => {
    if (mapped[key as keyof DSOUserData] === undefined) {
      delete mapped[key as keyof DSOUserData];
    }
  });

  console.log('🔄 [Field Mapping] Frontend → DSO:', { 
    input: Object.keys(frontendData).length, 
    output: Object.keys(mapped).length,
    mapped: ['address→street', 'addressNumber→number', 'profession→profission', 'contactid→dynamicsId']
  });

  return mapped;
}

/**
 * Aplica formatação aos campos conforme padrões brasileiros
 */
export function formatFields(data: Partial<FrontendUserData>): Partial<FrontendUserData> {
  const formatted = { ...data };

  // Formatar CPF
  if (formatted.document && !formatted.document.includes('.')) {
    formatted.document = formatted.document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // Formatar telefone
  if (formatted.phone && !formatted.phone.includes('(')) {
    const phone = formatted.phone.replace(/\D/g, '');
    if (phone.length === 11) {
      formatted.phone = `+55 (${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7)}`;
    }
  }

  // Formatar CEP
  if (formatted.cep && !formatted.cep.includes('-')) {
    formatted.cep = formatted.cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  console.log('🎨 [Field Mapping] Campos formatados:', Object.keys(formatted));

  return formatted;
}

/**
 * Valida campos obrigatórios
 */
export function validateRequiredFields(data: Partial<FrontendUserData>): { isValid: boolean; missingFields: string[] } {
  const requiredFields = ['name', 'email', 'document', 'phone'];
  const missingFields: string[] = [];

  requiredFields.forEach(field => {
    if (!data[field as keyof FrontendUserData] || data[field as keyof FrontendUserData] === '') {
      missingFields.push(field);
    }
  });

  const isValid = missingFields.length === 0;

  if (!isValid) {
    console.warn('⚠️ [Field Mapping] Campos obrigatórios ausentes:', missingFields);
  }

  return { isValid, missingFields };
}

/**
 * Utilitário para debug de mapeamento
 */
export function debugFieldMapping(original: any, mapped: any, direction: 'DSO→Frontend' | 'Frontend→DSO') {
  console.group(`🔍 [Field Mapping Debug] ${direction}`);
  
  console.log('Original:', original);
  console.log('Mapeado:', mapped);
  
  // Mostra campos que foram transformados
  const transformedFields = [];
  
  if (direction === 'DSO→Frontend') {
    if (original.street !== undefined) transformedFields.push(`street (${original.street}) → address (${mapped.address})`);
    if (original.number !== undefined) transformedFields.push(`number (${original.number}) → addressNumber (${mapped.addressNumber})`);
    if (original.profission !== undefined) transformedFields.push(`profission (${original.profission}) → profession (${mapped.profession})`);
  } else {
    if (original.address !== undefined) transformedFields.push(`address (${original.address}) → street (${mapped.street})`);
    if (original.addressNumber !== undefined) transformedFields.push(`addressNumber (${original.addressNumber}) → number (${mapped.number})`);
    if (original.profession !== undefined) transformedFields.push(`profession (${original.profession}) → profission (${mapped.profission})`);
  }
  
  if (transformedFields.length > 0) {
    console.log('Transformações aplicadas:', transformedFields);
  } else {
    console.log('Nenhuma transformação de campo aplicada');
  }
  
  console.groupEnd();
}

/**
 * Testa o mapeamento de dados específicos de endereço
 */
export function testAddressMapping(dsoData: any) {
  console.group('🧪 [Address Mapping Test]');
  
  console.log('Dados DSO recebidos:', dsoData);
  
  const addressFields = {
    street: dsoData.street,
    number: dsoData.number,
    addressComplement: dsoData.addressComplement,
    neighborhood: dsoData.neighborhood,
    city: dsoData.city,
    state: dsoData.state,
    cep: dsoData.cep
  };
  
  console.log('Campos de endereço extraídos:', addressFields);
  
  const mapped = mapDSOToFrontend(dsoData);
  
  const mappedAddressFields = {
    address: mapped.address,
    addressNumber: mapped.addressNumber,
    addressComplement: mapped.addressComplement,
    neighborhood: mapped.neighborhood,
    city: mapped.city,
    state: mapped.state,
    cep: mapped.cep
  };
  
  console.log('Campos de endereço mapeados:', mappedAddressFields);
  
  console.groupEnd();
  
  return mappedAddressFields;
} 