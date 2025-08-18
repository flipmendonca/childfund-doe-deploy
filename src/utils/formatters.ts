export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// Função para formatar CPF (000.000.000-00)
export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length <= 3) return cleanCPF;
  if (cleanCPF.length <= 6) return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3)}`;
  if (cleanCPF.length <= 9) return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6)}`;
  return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6, 9)}-${cleanCPF.slice(9, 11)}`;
};

// Função para formatar CNPJ (00.000.000/0000-00)
export const formatCNPJ = (cnpj: string): string => {
  const cleanCNPJ = cnpj.replace(/\D/g, "");
  if (cleanCNPJ.length <= 2) return cleanCNPJ;
  if (cleanCNPJ.length <= 5) return `${cleanCNPJ.slice(0, 2)}.${cleanCNPJ.slice(2)}`;
  if (cleanCNPJ.length <= 8) return `${cleanCNPJ.slice(0, 2)}.${cleanCNPJ.slice(2, 5)}.${cleanCNPJ.slice(5)}`;
  if (cleanCNPJ.length <= 12) return `${cleanCNPJ.slice(0, 2)}.${cleanCNPJ.slice(2, 5)}.${cleanCNPJ.slice(5, 8)}/${cleanCNPJ.slice(8)}`;
  return `${cleanCNPJ.slice(0, 2)}.${cleanCNPJ.slice(2, 5)}.${cleanCNPJ.slice(5, 8)}/${cleanCNPJ.slice(8, 12)}-${cleanCNPJ.slice(12, 14)}`;
};

// Função para formatar telefone nacional ((00) 00000-0000)
export const formatPhoneNational = (value: string): string => {
  // Remove tudo que não for número
  let v = value.replace(/\D/g, "");
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
  if (v.length > 10) v = v.replace(/(\d{5})(\d{4})$/, "$1-$2");
  else if (v.length > 9) v = v.replace(/(\d{4})(\d{4})$/, "$1-$2");
  return v;
};

// Função para converter para formato internacional DSO: +55 (00) 00000-0000
export const toInternationalPhone = (value: string): string => {
  // Remove tudo que não for número
  let v = value.replace(/\D/g, "");
  
  if (v.length === 10) {
    // Telefone fixo: +55 (11) 1234-5678
    return `+55 (${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
  } else if (v.length === 11) {
    // Celular: +55 (11) 91234-5678
    return `+55 (${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
  }
  
  return value;
};

// Função para formatar telefone ((00) 00000-0000)
export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length <= 2) return cleanPhone;
  if (cleanPhone.length <= 6) return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2)}`;
  if (cleanPhone.length <= 10) return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
  return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7, 11)}`;
};

// Função para formatar CEP (00000-000)
export const formatCEP = (cep: string): string => {
  const cleanCEP = cep.replace(/\D/g, "");
  if (cleanCEP.length <= 5) return cleanCEP;
  return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5, 8)}`;
};

// Função para formatar cartão de crédito (0000 0000 0000 0000)
export const formatCardNumber = (cardNumber: string): string => {
  const cleanCard = cardNumber.replace(/\D/g, "");
  if (cleanCard.length <= 4) return cleanCard;
  if (cleanCard.length <= 8) return `${cleanCard.slice(0, 4)} ${cleanCard.slice(4)}`;
  if (cleanCard.length <= 12) return `${cleanCard.slice(0, 4)} ${cleanCard.slice(4, 8)} ${cleanCard.slice(8)}`;
  return `${cleanCard.slice(0, 4)} ${cleanCard.slice(4, 8)} ${cleanCard.slice(8, 12)} ${cleanCard.slice(12, 16)}`;
};

// Função para limpar formatação (apenas números)
export const cleanNumericString = (value: string): string => {
  return value.replace(/\D/g, "");
};

// Função para validar se CPF tem formato válido
export const isValidCPFFormat = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, "");
  return cleanCPF.length === 11;
};

// Função para validar se telefone tem formato válido
export const isValidPhoneFormat = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, "");
  return cleanPhone.length === 10 || cleanPhone.length === 11;
};

// Função para validar se CEP tem formato válido
export const isValidCEPFormat = (cep: string): boolean => {
  const cleanCEP = cep.replace(/\D/g, "");
  return cleanCEP.length === 8;
};

// Função para remover máscara do CPF para envio à API
export const unmaskCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, "");
};

// Função para remover máscara do telefone para envio à API
export const unmaskPhone = (phone: string): string => {
  return phone.replace(/\D/g, "");
};

// Função para remover máscara do CEP para envio à API
export const unmaskCEP = (cep: string): string => {
  return cep.replace(/\D/g, "");
}; 