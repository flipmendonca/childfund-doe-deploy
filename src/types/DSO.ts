// Interfaces para DSO API conforme documentação

export interface UserOrderGeneratorData {
  // Dados pessoais obrigatórios
  email: string;
  name: string;
  document: string; // CPF apenas números
  phone: string; // Formato: +55 (00) 00000-0000
  password?: string; // Opcional para doação sem cadastro
  address: string;
  addressNumber: string;
  addressComplement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string; // Formato: 00000-000
  country: string; // Padrão: BR
  gender: 'M' | 'F';
  birthDate: string; // YYYY-MM-DD
  type_document: 'cpf'; // Sempre CPF
  profession?: string;
  pronouns?: string;

  // Dados da doação
  child_id?: string | string[];
  childs?: string[]; // Array de IDs das crianças para apadrinhamento
  donate_type: 'sponsorship' | 'donate';
  value: number;

  // Dados do pagamento - CARTÃO DE CRÉDITO OU DÉBITO
  paymentMethod?: 'credit_card' | 'debit';
  credit_card?: {
    ownername: string;
    numero: string; // Sem espaços
    mesexp: string; // MM
    anoexp: string; // AA
    cvc: string;
  };
  installments?: number; // Sempre 1
  region?: number; // Sempre 1

  // Dados do pagamento - DÉBITO AUTOMÁTICO
  pay_name?: string;
  pay_doc?: string; // CPF apenas números
  pay_bankcode?: string; // Código do banco (001, 237, 341, etc)
  pay_accountnumber?: string;
  pay_digitaccountnumber?: string;
  pay_branchcode?: string;
  pay_digitbranchcode?: string;
  pay_type?: 'debit';

  // Comum aos dois métodos
  pay_duo_date?: string; // Dia da cobrança (05, 10, 15, 20, 25)
  worker?: string; // Colaborador/campanha
}

export interface GeneratorOrdersData {
  childid?: string;
  donate_type: 'sponsorship' | 'donate';
  paymentMethod: 'credit_card';
  installments: number; // Sempre 1
  value: number;
  ownername: string;
  numero: string; // Sem espaços
  mesexp: string; // MM
  anoexp: string; // AA
  cvc: string;
  region?: number; // Campo obrigatório conforme API (sempre 1)
  pay_duo_date?: string; // Dia da cobrança mensal
  worker?: string;
  email?: string; // Email do usuário
}

export interface DebitPaymentData {
  donate_type: 'sponsorship' | 'donate';
  childs: string[];
  pay_name: string;
  pay_doc: string; // CPF apenas números
  pay_bankcode: string;
  pay_accountnumber: string;
  pay_digitaccountnumber: string;
  pay_branchcode: string;
  pay_digitbranchcode: string;
  pay_duo_date: string; // Dia da cobrança
  pay_type: 'debit';
  pay_value: number;
}

export interface AuthenticationData {
  login: string; // Email ou CPF
  password: string;
}

export interface AuthenticationResponse {
  success?: string;
  data?: {
    token?: string;
    user?: {
      id?: string;
      name?: string;
      email?: string;
    };
  };
  status?: number;
}

export interface UserProfile {
  name?: string;
  email?: string;
  document?: string; // CPF formatado
  phone?: string; // Telefone formatado
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  cep?: string;
  profession?: string;
  pronouns?: string;
  birthDate?: string;
  gender?: 'M' | 'F';
  contactid?: string; // ID no Dynamics CRM
}

export interface DSOResponse {
  '@odata.context'?: string;
  '@odata.count'?: number;
  value: any[];
  success?: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export interface SimpleDSOResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

// Tipos para formulários
export interface PersonalData {
  name: string;
  email: string;
  document: string;
  phone: string;
  birthDate: string;
  gender: 'M' | 'F';
  address: string;
  addressNumber: string;
  addressComplement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  country: string;
  profession?: string;
  pronouns?: string;
  // Aliases for compatibility
  postalCode?: string; // Alias for cep
  street?: string; // Alias for address
  number?: string; // Alias for addressNumber
  complement?: string; // Alias for addressComplement
}

export interface CreditCardData {
  ownername: string;
  numero: string;
  mesexp: string;
  anoexp: string;
  cvc: string;
  // Aliases for compatibility
  cardName?: string; // Alias for ownername
  cardNumber?: string; // Alias for numero
  expiryMonth?: string; // Alias for mesexp
  expiryYear?: string; // Alias for anoexp
  cvv?: string; // Alias for cvc
}

export interface BankTransferData {
  pay_name: string;
  pay_doc: string;
  pay_bankcode: string;
  pay_accountnumber: string;
  pay_digitaccountnumber: string;
  pay_branchcode: string;
  pay_digitbranchcode: string;
  // Aliases for compatibility
  bankCode?: string; // Alias for pay_bankcode
  agency?: string; // Alias for pay_branchcode
  account?: string; // Alias for pay_accountnumber
  accountType?: string; // Additional field
}

export interface DonationData {
  type: 'sponsorship' | 'donate' | 'recurrent';
  value: number;
  childId?: string;
  occurrence?: string;
  collaborator?: string;
  campaign?: string;
  paymentMethod: 'credit_card' | 'debit' | 'bank_transfer';
  pay_duo_date?: string;
}