export interface Child {
  // === METADADOS ODATA ===
  '@odata.context'?: string;
  '@odata.etag'?: string;
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
  
  // === IDENTIFICADORES ===
  contactid?: string;
  id: string;
  cre37_idcrianca?: string;
  new_idcriancaoracle?: string;
  new_idcriancados?: string;
  
  // === DADOS PESSOAIS ===
  firstname?: string;
  lastname?: string;
  fullname?: string;
  nome?: string;
  name: string;
  new_cfb_nome?: string;
  
  // === DADOS DEMOGRÁFICOS ===
  birthdate?: string;
  new_datadenascimento?: string;
  new_cfb_datanascimento?: string;
  age: number;
  genero?: string;
  gendercode?: number;
  new_genero?: number;
  gender: 'M' | 'F' | 'Outro';
  
  // === LOCALIZAÇÃO ===
  location: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  address1_city?: string;
  address1_stateorprovince?: string;
  address1_postalcode?: string;
  address1_line1?: string;
  
  // === MÍDIA E DESCRIÇÃO ===
  image: string;
  imagefotoperfil?: string;
  new_imagefotoperfil?: string;
  entityimage_url?: string;
  chf_fotocrianca?: string;
  chf_fotocrianca_url?: string;
  descricao?: string;
  description?: string;
  story: string;
  
  // === STATUS E CONTROLE ===
  statuscode?: number;
  statecode?: number;
  new_statusram?: number;
  new_statusbloqueado?: boolean;
  isAvailable?: boolean;
  
  // === DADOS DE SINCRONIZAÇÃO ===
  sinkcreatedon?: string;
  sinkmodifiedon?: string;
  createdon?: string;
  modifiedon?: string;
  
  // === CONTATOS E COMUNICAÇÃO ===
  emailaddress1?: string;
  telephone1?: string;
  new_cfb_telefone1?: string;
  new_cfb_email?: string;
  
  // === INFORMAÇÕES ESPECÍFICAS CHILDFUND ===
  new_comunidade?: string;
  new_religiao?: string;
  new_cfb_religiao?: string;
  new_sabelereescrever?: boolean;
  new_idade_meses?: string;
  new_idade_sistema?: string;
  new_idade_pessoa?: string;
  
  // === NECESSIDADES E CARACTERÍSTICAS ===
  needs: string[];
  hobbies?: string[];
  dreams?: string;
  schoolGrade?: string;
  
  // === DADOS FAMILIARES ===
  new_cfb_filhosdependentes?: string;
  new_possuifilhos?: boolean;
  numberofchildren?: string;
  childrensnames?: string;
  
  // === INFORMAÇÕES MÉDICAS ===
  new_satussaudedacrianca?: number;
  new_tipodedoenca?: string;
  new_descrivo_doena?: string;
  new_relatriodedoenca?: string;
  new_relatriodeprogresso?: string;
  health?: {
    height?: string;
    weight?: string;
    vaccinated?: boolean;
  };
  
  // === DADOS FINANCEIROS ===
  chf_valor?: string;
  chf_valor_base?: string;
  valor?: string;
  sponsorshipValue?: string;
  
  // === CONTROLES INTERNOS ===
  new_integrar?: number;
  new_id_integracao_dimensao?: string;
  versionnumber?: number;
  timezoneruleversionnumber?: number;
  
  // === DADOS DE APADRINHAMENTO ===
  sponsorshipDate?: string;
  lastLetterReceived?: string;
  lastLetterSent?: string;
  nextReport?: string;
  lastProgressReport?: {
    date: string;
    title: string;
    available: boolean;
  };

  // Dados específicos do Dynamics CRM
  dynamicsData?: {
    contactId: string;
    statusBloqueado?: boolean;
    statusApadrinhamento?: number;
    genderCode?: number;
    customGender?: number;
    programaId?: string;
    estado?: string;
    cidade?: string;
    dataUltimaAtualizacao?: string;
  };

  // Campos adicionais opcionais
  programa?: string;
  regiao?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  escola?: string;
  grauEscolaridade?: string;
  necessidadesEspeciais?: string[];
  observacoes?: string;
  isActive?: boolean;
  isBlocked?: boolean;
  codigoBeneficiario?: string;
}

// Interface para respostas do Dynamics CRM
export interface DynamicsChildrenResponse {
  '@odata.context': string;
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
  value: Child[];
}

// Interface para filtros de consulta
export interface ChildFilters {
  gender?: 'M' | 'F' | 'all';
  state?: string;
  city?: string;
  isAvailable?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
  ageRange?: {
    min: number;
    max: number;
  };
  programa?: string;
  regiao?: string;
} 