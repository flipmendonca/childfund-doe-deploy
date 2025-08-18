// Schemas de validação para autenticação
// Baseado na documentação: docs/AUTENTICACAO_CADASTRO.md

import { z } from 'zod';

// Função para validar CPF
function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(cleanCPF.charAt(9)) === digit1 && parseInt(cleanCPF.charAt(10)) === digit2;
}

// Função para validar CNPJ
function validateCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  // Validação do segundo dígito verificador
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(cleanCNPJ.charAt(12)) === digit1 && parseInt(cleanCNPJ.charAt(13)) === digit2;
}

// Função para validar telefone brasileiro
function validatePhone(phone: string): boolean {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica se tem 10 ou 11 dígitos (com DDD)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) return false;
  
  // Verifica se começa com DDD válido (11-99)
  const ddd = parseInt(cleanPhone.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  
  // Verifica se o número é válido
  const number = cleanPhone.substring(2);
  if (number.length < 8 || number.length > 9) return false;
  
  return true;
}

// Schema para login (CPF ou CNPJ)
export const loginSchema = z.object({
  login: z
    .string({ message: 'Documento é obrigatório' })
    .min(1, 'Documento é obrigatório')
    .refine((value) => {
      // Remove caracteres não numéricos para validação
      const cleanDocument = value.replace(/\D/g, '');
      
      // Verifica se tem 11 dígitos (CPF) ou 14 dígitos (CNPJ)
      if (cleanDocument.length !== 11 && cleanDocument.length !== 14) return false;
      
      // Valida o documento baseado no tamanho
      if (cleanDocument.length === 11) {
        return validateCPF(cleanDocument);
      } else {
        return validateCNPJ(cleanDocument);
      }
    }, 'Documento inválido (CPF ou CNPJ)'),
  password: z
    .string({ message: 'Senha é obrigatória' })
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// Schema para cadastro - primeiro passo (dados básicos)
export const registerSchema1 = z.object({
  name: z
    .string({ message: 'Nome é obrigatório' })
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .refine(value => /\s/.test(value.trim()), {
      message: 'Insira um nome e um sobrenome',
    })
    .refine(value => /^[a-zA-ZÀ-ÿ\s]+$/.test(value), {
      message: 'Nome deve conter apenas letras',
    }),
  email: z
    .string({ message: 'Email é obrigatório' })
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .refine(value => value.toLowerCase().includes('@'), {
      message: 'Email deve conter @',
    }),
  document: z
    .string({ message: 'O documento é obrigatório' })
    .min(1, 'O documento é obrigatório')
    .refine(value => {
      // Verifica se é CPF ou CNPJ baseado no formato
      const isCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value);
      const isCNPJ = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(value);
      
      if (!isCPF && !isCNPJ) {
        return false;
      }
      
      // Valida o documento
      const cleanDocument = value.replace(/\D/g, '');
      if (cleanDocument.length === 11) {
        return validateCPF(cleanDocument);
      } else if (cleanDocument.length === 14) {
        return validateCNPJ(cleanDocument);
      }
      
      return false;
    }, 'Documento inválido (CPF ou CNPJ)'),
  phone: z
    .string({ message: 'O telefone é obrigatório' })
    .min(1, 'O telefone é obrigatório')
    .refine(value => /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value), {
      message: 'Telefone inválido, deve ter o formato "(00) 00000-0000" ou "(00) 0000-0000"',
    })
    .refine((value) => {
      const cleanPhone = value.replace(/\D/g, '');
      return validatePhone(cleanPhone);
    }, 'Telefone inválido'),
  address: z
    .string({ message: 'Endereço é obrigatório' })
    .min(1, 'Endereço é obrigatório')
    .min(3, 'Endereço deve ter pelo menos 3 caracteres'),
  addressNumber: z
    .string({ message: 'Número é obrigatório' })
    .min(1, 'Número é obrigatório'),
  addressComplement: z
    .string()
    .optional(),
  neighborhood: z
    .string({ message: 'Bairro é obrigatório' })
    .min(1, 'Bairro é obrigatório'),
  city: z
    .string({ message: 'Cidade é obrigatória' })
    .min(1, 'Cidade é obrigatória'),
  state: z
    .string({ message: 'Estado é obrigatório' })
    .min(1, 'Estado é obrigatório')
    .max(2, 'Estado deve ter 2 caracteres'),
  cep: z
    .string({ message: 'CEP é obrigatório' })
    .min(1, 'CEP é obrigatório')
    .refine(value => /^\d{5}-\d{3}$/.test(value), {
      message: 'CEP inválido, deve ter o formato "00000-000"',
    }),
  industry: z
    .string()
    .optional(),
  ownership: z
    .string()
    .optional(),
});

// Schema para cadastro - segundo passo (senha)
export const registerSchema2 = z.object({
  password: z
    .string({ message: 'Senha é obrigatória' })
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres')
    .refine(value => 
      /[a-z]/.test(value) &&
      /[A-Z]/.test(value) &&
      /\d/.test(value) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(value), {
      message: 'A senha deve ter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
    }),
  confirmPassword: z
    .string({ message: 'Confirmação de senha é obrigatória' })
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não correspondem',
  path: ['confirmPassword'],
});

// Schema para cadastro completo
export const registerSchema = z.object({
  name: z
    .string({ message: 'Nome é obrigatório' })
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .refine(value => /\s/.test(value.trim()), {
      message: 'Insira um nome e um sobrenome',
    })
    .refine(value => /^[a-zA-ZÀ-ÿ\s]+$/.test(value), {
      message: 'Nome deve conter apenas letras',
    }),
  email: z
    .string({ message: 'Email é obrigatório' })
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .refine(value => value.toLowerCase().includes('@'), {
      message: 'Email deve conter @',
    }),
  document: z
    .string({ message: 'O documento é obrigatório' })
    .min(1, 'O documento é obrigatório')
    .refine(value => {
      // Verifica se é CPF ou CNPJ baseado no formato
      const isCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value);
      const isCNPJ = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(value);
      
      if (!isCPF && !isCNPJ) {
        return false;
      }
      
      // Valida o documento
      const cleanDocument = value.replace(/\D/g, '');
      if (cleanDocument.length === 11) {
        return validateCPF(cleanDocument);
      } else if (cleanDocument.length === 14) {
        return validateCNPJ(cleanDocument);
      }
      
      return false;
    }, 'Documento inválido (CPF ou CNPJ)'),
  phone: z
    .string({ message: 'O telefone é obrigatório' })
    .min(1, 'O telefone é obrigatório')
    .refine(value => /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value), {
      message: 'Telefone inválido, deve ter o formato "(00) 00000-0000" ou "(00) 0000-0000"',
    })
    .refine((value) => {
      const cleanPhone = value.replace(/\D/g, '');
      return validatePhone(cleanPhone);
    }, 'Telefone inválido'),
  password: z
    .string({ message: 'Senha é obrigatória' })
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres')
    .refine(value => 
      /[a-z]/.test(value) &&
      /[A-Z]/.test(value) &&
      /\d/.test(value) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(value), {
      message: 'A senha deve ter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
    }),
  confirmPassword: z
    .string({ message: 'Confirmação de senha é obrigatória' })
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não correspondem',
  path: ['confirmPassword'],
});

// Schema para solicitar redefinição de senha
export const sendEmailResetSchema = z.object({
  email: z
    .string({ message: 'Email é obrigatório' })
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
});

// Schema para redefinir senha com token
export const resetWithTokenSchema = z.object({
  password: z
    .string({ message: 'Senha é obrigatória' })
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres')
    .refine(value => 
      /[a-z]/.test(value) &&
      /[A-Z]/.test(value) &&
      /\d/.test(value) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(value), {
      message: 'A senha deve ter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
    }),
  confirmPassword: z
    .string({ message: 'Confirmação de senha é obrigatória' })
    .min(1, 'Confirmação de senha é obrigatória'),
  token: z
    .string({ message: 'Token é obrigatório' })
    .min(1, 'Token é obrigatório')
    .min(10, 'Token inválido'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não correspondem',
  path: ['confirmPassword'],
});

// Schema para alterar senha (usuário logado)
export const resetMyPasswordSchema = z.object({
  currentPassword: z
    .string({ message: 'Senha atual é obrigatória' })
    .min(1, 'Senha atual é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
  newPassword: z
    .string({ message: 'Nova senha é obrigatória' })
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres')
    .refine(value => 
      /[a-z]/.test(value) &&
      /[A-Z]/.test(value) &&
      /\d/.test(value) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(value), {
      message: 'A senha deve ter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
    }),
  confirmNewPassword: z
    .string({ message: 'Confirmação da nova senha é obrigatória' })
    .min(1, 'Confirmação da nova senha é obrigatória'),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'As senhas não correspondem',
  path: ['confirmNewPassword'],
});

// Schema para dados complementares do cadastro
export const additionalDataSchema = z.object({
  pronouns: z.string().optional(),
  address: z.string().max(200, 'Endereço deve ter no máximo 200 caracteres').optional(),
  addressNumber: z.string().max(10, 'Número deve ter no máximo 10 caracteres').optional(),
  addressComplement: z.string().max(100, 'Complemento deve ter no máximo 100 caracteres').optional(),
  state: z.string().max(2, 'Estado deve ter 2 caracteres').optional(),
  city: z.string().max(100, 'Cidade deve ter no máximo 100 caracteres').optional(),
  country: z.string().max(100, 'País deve ter no máximo 100 caracteres').optional(),
  cep: z.string().refine(value => !value || /^\d{5}-?\d{3}$/.test(value), {
    message: 'CEP deve ter o formato 00000-000',
  }).optional(),
  profession: z.string().max(100, 'Profissão deve ter no máximo 100 caracteres').optional(),
  deficiency: z.string().max(100, 'Deficiência deve ter no máximo 100 caracteres').optional(),
  gender: z.enum(['M', 'F', 'Outro']).optional(),
  birthDate: z.string().refine(value => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: 'Data de nascimento deve ter o formato YYYY-MM-DD',
  }).optional(),
  type_document: z.string().optional(),
  neighborhood: z.string().max(100, 'Bairro deve ter no máximo 100 caracteres').optional(),
});

// Schema para validação de dados do DSO
export const dsoValidationSchema = z.object({
  email: z.string().email('Email inválido'),
  document: z.string().refine((value) => {
    const cleanCPF = value.replace(/\D/g, '');
    return validateCPF(cleanCPF);
  }, 'CPF inválido'),
  phone: z.string().refine((value) => {
    // Remove caracteres não numéricos
    const cleanPhone = value.replace(/\D/g, '');
    
    // Verifica se tem 10 ou 11 dígitos (com DDD)
    if (cleanPhone.length < 10 || cleanPhone.length > 11) return false;
    
    // Verifica se começa com DDD válido (11-99)
    const ddd = parseInt(cleanPhone.substring(0, 2));
    if (ddd < 11 || ddd > 99) return false;
    
    // Verifica se o número é válido
    const number = cleanPhone.substring(2);
    if (number.length < 8 || number.length > 9) return false;
    
    return true;
  }, 'Telefone inválido'),
});

// Tipos TypeScript derivados dos schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RegisterStep1Data = z.infer<typeof registerSchema1>;
export type RegisterStep2Data = z.infer<typeof registerSchema2>;
export type SendEmailResetFormData = z.infer<typeof sendEmailResetSchema>;
export type ResetWithTokenFormData = z.infer<typeof resetWithTokenSchema>;
export type ResetMyPasswordFormData = z.infer<typeof resetMyPasswordSchema>;
export type AdditionalDataFormData = z.infer<typeof additionalDataSchema>;
export type DSOValidationData = z.infer<typeof dsoValidationSchema>; 