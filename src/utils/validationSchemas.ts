import { z } from 'zod';

// ========== VALIDAÇÕES CONFORME DOCUMENTAÇÃO DSO ==========

/**
 * Schema para primeira etapa do cadastro (dados pessoais básicos)
 * Conforme documentação: registerSchema1
 */
export const registerSchema1 = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .refine(value => /\s/.test(value.trim()), {
      message: 'Insira um nome e um sobrenome',
    }),
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z.string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .refine(value => /[A-Z]/.test(value), {
      message: 'A senha deve conter pelo menos uma letra maiúscula',
    })
    .refine(value => /[a-z]/.test(value), {
      message: 'A senha deve conter pelo menos uma letra minúscula',
    })
    .refine(value => /[^A-Za-z0-9]/.test(value), {
      message: 'A senha deve conter pelo menos um caractere especial',
    }),
  confirm: z.string().min(1, 'Confirmação de senha é obrigatória'),
  gender: z.enum(['M', 'F'], {
    errorMap: () => ({ message: 'O gênero é obrigatório' })
  }),
  document: z.string()
    .min(1, 'O documento é obrigatório')
    .refine(value => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value), {
      message: 'CPF inválido, deve ter o formato "000.000.000-00"',
    }),
  birthDate: z.string().min(1, 'A data de nascimento é obrigatória'),
  phone: z.string()
    .min(1, 'O telefone é obrigatório')
    .refine(value => /^\+\d{2}\s\(\d{2}\)\s\d{5}-\d{4}$/.test(value), {
      message: 'Telefone inválido, deve ter o formato "+55 (00) 00000-0000"',
    }),
}).refine(data => data.password === data.confirm, {
  message: 'As senhas não coincidem',
  path: ['confirm'],
});

/**
 * Schema para segunda etapa do cadastro (endereço)
 * Conforme documentação: registerSchema2
 */
export const registerSchema2 = z.object({
  postalCode: z.string()
    .min(1, 'O CEP é obrigatório')
    .refine(value => /^\d{8}$/.test(value), {
      message: 'CEP deve ter 8 dígitos',
    }),
  street: z.string().min(1, 'O endereço é obrigatório'),
  number: z.string().min(1, 'O número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'O bairro é obrigatório'),
  city: z.string().min(2, 'A cidade é obrigatória'),
  state: z.string()
    .min(2, 'O estado é obrigatório')
    .max(2, 'Estado deve ter 2 caracteres'),
});

/**
 * Schema para dados pessoais completos (versão simplificada para novos formulários)
 */
export const personalDataSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .refine(value => /\s/.test(value.trim()), {
      message: 'Insira um nome e um sobrenome',
    }),
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  document: z.string()
    .min(1, 'O documento é obrigatório')
    .refine(value => /^\d{11}$/.test(value), {
      message: 'CPF deve ter 11 dígitos',
    }),
  phone: z.string()
    .min(1, 'O telefone é obrigatório')
    .refine(value => /^\d{10,11}$/.test(value), {
      message: 'Telefone deve ter 10 ou 11 dígitos',
    }),
  postalCode: z.string()
    .min(1, 'O CEP é obrigatório')
    .refine(value => /^\d{8}$/.test(value), {
      message: 'CEP deve ter 8 dígitos',
    }),
  street: z.string().min(1, 'O endereço é obrigatório'),
  number: z.string().min(1, 'O número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'O bairro é obrigatório'),
  city: z.string().min(2, 'A cidade é obrigatória'),
  state: z.string()
    .min(2, 'O estado é obrigatório')
    .max(2, 'Estado deve ter 2 caracteres'),
});

/**
 * Schema para cartão de crédito
 * Conforme documentação: changeCreditSchema
 */
export const changeCreditSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  number: z.string()
    .min(1, 'O número é obrigatório')
    .refine(value => {
      // Remove espaços e valida se tem entre 13 e 19 dígitos
      const cleaned = value.replace(/\s/g, '');
      return /^\d{13,19}$/.test(cleaned);
    }, {
      message: 'Número do cartão inválido',
    }),
  cvc: z.string()
    .min(3, 'O CVC deve ter pelo menos 3 dígitos')
    .max(4, 'O CVC deve ter no máximo 4 dígitos')
    .refine(value => /^\d{3,4}$/.test(value), {
      message: 'CVC deve conter apenas números',
    }),
  expiry: z.string()
    .min(5, 'A data de validade é obrigatória')
    .refine(value => /^\d{2}\/\d{2}$/.test(value), {
      message: 'Data deve estar no formato MM/AA',
    })
    .refine(value => {
      const [month, year] = value.split('/');
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10) + 2000;
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      // Validar mês
      if (monthNum < 1 || monthNum > 12) {
        return false;
      }
      
      // Validar se não está expirado
      if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
        return false;
      }
      
      return true;
    }, {
      message: 'Cartão expirado ou data inválida',
    }),
});

/**
 * Schema para débito automático
 * Conforme documentação: paymentDeditSchema
 */
export const paymentDebitSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  document: z.string()
    .min(1, 'O CPF é obrigatório')
    .refine(value => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value), {
      message: 'CPF inválido, deve ter o formato "000.000.000-00"',
    }),
  bank: z.string().min(3, 'O código do banco é obrigatório'),
  agency: z.string()
    .min(1, 'A agência é obrigatória')
    .refine(value => /^\d{4}$/.test(value), {
      message: 'Agência deve ter 4 dígitos',
    }),
  agencyDigit: z.string()
    .min(1, 'O dígito da agência é obrigatório')
    .refine(value => /^\d{1}$/.test(value), {
      message: 'Dígito da agência deve ter 1 dígito',
    }),
  account: z.string()
    .min(1, 'A conta é obrigatória')
    .refine(value => /^\d{1,10}$/.test(value), {
      message: 'Número da conta inválido',
    }),
  accountDigit: z.string()
    .min(1, 'O dígito da conta é obrigatório')
    .refine(value => /^\d{1}$/.test(value), {
      message: 'Dígito da conta deve ter 1 dígito',
    }),
});

/**
 * Schema para login
 */
export const loginSchema = z.object({
  login: z.string()
    .min(1, 'Email ou CPF é obrigatório')
    .refine(value => {
      // Aceita email ou CPF (com ou sem formatação)
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isCPF = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(value);
      return isEmail || isCPF;
    }, {
      message: 'Insira um email válido ou CPF',
    }),
  password: z.string().min(1, 'Senha é obrigatória'),
});

/**
 * Schema para redefinição de senha
 * Conforme documentação: resetPasswordSchema
 */
export const resetPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string()
    .min(8, 'A nova senha deve ter pelo menos 8 caracteres')
    .refine(
      value => value.length >= 8 &&
              /[a-z]/.test(value) &&
              /[A-Z]/.test(value) &&
              /\W|_/.test(value),
      {
        message: 'A senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma letra minúscula e um caractere especial'
      }
    ),
  confirmNewPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'As senhas não correspondem',
  path: ['confirmNewPassword'],
});

/**
 * Schema para validação de valores de doação
 */
export const donationValueSchema = z.object({
  type: z.enum(['sponsorship', 'donate', 'recurrent']),
  value: z.number()
    .min(0.01, 'Valor deve ser maior que zero')
    .min(1, 'Valor deve ser maior que zero'),
  childId: z.string().optional(),
  occurrence: z.string().optional(),
});

/**
 * Schema para seleção de dia de cobrança
 */
export const paymentDateSchema = z.object({
  pay_duo_date: z.enum(['05', '10', '15', '20', '25'], {
    errorMap: () => ({ message: 'Selecione um dia válido para cobrança' })
  }),
});

/**
 * Schema para validação de dados de pagamento (usado nos novos formulários)
 */
export const paymentSchema = z.discriminatedUnion('method', [
  // Pagamento com cartão de crédito
  z.object({
    method: z.literal('credit_card'),
    cardNumber: z.string()
      .min(13, 'Número do cartão deve ter pelo menos 13 dígitos')
      .max(19, 'Número do cartão deve ter no máximo 19 dígitos')
      .refine(value => /^\d+$/.test(value), {
        message: 'Número do cartão deve conter apenas números',
      }),
    cardName: z.string().min(1, 'Nome no cartão é obrigatório'),
    expiryMonth: z.string()
      .length(2, 'Mês deve ter 2 dígitos')
      .refine(value => {
        const month = parseInt(value);
        return month >= 1 && month <= 12;
      }, { message: 'Mês inválido' }),
    expiryYear: z.string()
      .length(4, 'Ano deve ter 4 dígitos')
      .refine(value => {
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        return year >= currentYear;
      }, { message: 'Ano não pode ser anterior ao atual' }),
    cvv: z.string()
      .min(3, 'CVV deve ter pelo menos 3 dígitos')
      .max(4, 'CVV deve ter no máximo 4 dígitos')
      .refine(value => /^\d+$/.test(value), {
        message: 'CVV deve conter apenas números',
      }),
  }),
  // Pagamento com débito automático
  z.object({
    method: z.literal('bank_transfer'),
    bankCode: z.string().min(1, 'Banco é obrigatório'),
    agency: z.string()
      .min(1, 'Agência é obrigatória')
      .refine(value => /^\d+$/.test(value), {
        message: 'Agência deve conter apenas números',
      }),
    account: z.string()
      .min(1, 'Conta é obrigatória')
      .refine(value => /^\d+$/.test(value), {
        message: 'Conta deve conter apenas números',
      }),
    accountType: z.enum(['checking', 'savings'], {
      errorMap: () => ({ message: 'Tipo de conta é obrigatório' })
    }),
  }),
]);

// ========== SCHEMAS COMBINADOS PARA FLUXOS COMPLETOS ==========

/**
 * Schema para usuário novo - dados completos + cartão
 */
export const newUserCreditCardSchema = personalDataSchema
  .merge(changeCreditSchema)
  .merge(donationValueSchema)
  .merge(paymentDateSchema.partial());

/**
 * Schema para usuário novo - dados completos + débito
 */
export const newUserDebitSchema = personalDataSchema
  .merge(paymentDebitSchema)
  .merge(donationValueSchema)
  .merge(paymentDateSchema);

/**
 * Schema para usuário logado - apenas cartão
 */
export const loggedUserCreditCardSchema = changeCreditSchema
  .merge(donationValueSchema)
  .merge(paymentDateSchema.partial());

/**
 * Schema para usuário logado - apenas débito
 */
export const loggedUserDebitSchema = paymentDebitSchema
  .merge(donationValueSchema)
  .merge(paymentDateSchema);

// ========== FUNÇÕES DE VALIDAÇÃO AUXILIARES ==========

/**
 * Valida CPF brasileiro
 */
export function validateCPF(cpf: string): boolean {
  // Remove formatação
  const numbers = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(numbers[9]) !== digit1) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(numbers[10]) === digit2;
}

/**
 * Valida formato de telefone brasileiro
 */
export function validateBrazilianPhone(phone: string): boolean {
  // Formato: +55 (00) 00000-0000
  return /^\+55\s\(\d{2}\)\s\d{5}-\d{4}$/.test(phone);
}

/**
 * Valida formato de CEP brasileiro
 */
export function validateBrazilianCEP(cep: string): boolean {
  // Formato: 00000-000
  return /^\d{5}-\d{3}$/.test(cep);
}

/**
 * Valida cartão de crédito usando algoritmo de Luhn
 */
export function validateCreditCard(number: string): boolean {
  const cleaned = number.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  
  let sum = 0;
  let alternate = false;
  
  // Algoritmo de Luhn
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (alternate) {
      digit *= 2;
      if (digit > 9) {
        digit = (digit % 10) + 1;
      }
    }
    
    sum += digit;
    alternate = !alternate;
  }
  
  return sum % 10 === 0;
}

// ========== TYPES DERIVADOS DOS SCHEMAS ==========

export type RegisterData1 = z.infer<typeof registerSchema1>;
export type RegisterData2 = z.infer<typeof registerSchema2>;
export type PersonalData = z.infer<typeof personalDataSchema>;
export type CreditCardData = z.infer<typeof changeCreditSchema>;
export type DebitData = z.infer<typeof paymentDebitSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type DonationValue = z.infer<typeof donationValueSchema>;
export type PaymentDate = z.infer<typeof paymentDateSchema>;

export type NewUserCreditCardData = z.infer<typeof newUserCreditCardSchema>;
export type NewUserDebitData = z.infer<typeof newUserDebitSchema>;
export type LoggedUserCreditCardData = z.infer<typeof loggedUserCreditCardSchema>;
export type LoggedUserDebitData = z.infer<typeof loggedUserDebitSchema>;