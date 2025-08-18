export const validations = {
  name: {
    required: "O nome é obrigatório",
    validate: (value: string) => {
      if (!value) return validations.name.required;
      if (value.length < 3) return "O nome deve ter pelo menos 3 caracteres";
      if (value.length > 100) return "O nome deve ter no máximo 100 caracteres";
      return true;
    }
  },

  email: {
    required: "O e-mail é obrigatório",
    validate: (value: string) => {
      if (!value) return validations.email.required;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "E-mail inválido";
      return true;
    }
  },

  phone: {
    required: "O telefone é obrigatório",
    validate: (value: string) => {
      if (!value) return validations.phone.required;
      const cleanPhone = value.replace(/\D/g, "");
      if (cleanPhone.length < 10 || cleanPhone.length > 11) return "Telefone inválido";
      return true;
    }
  },

  birthDate: {
    required: "A data de nascimento é obrigatória",
    validate: (value: string) => {
      if (!value) return validations.birthDate.required;
      const date = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age--;
      }

      if (isNaN(date.getTime())) return "Data inválida";
      if (age < 18) return "Você deve ter pelo menos 18 anos";
      if (age > 120) return "Data de nascimento inválida";
      return true;
    }
  },

  cep: {
    required: "O CEP é obrigatório",
    validate: (value: string) => {
      if (!value) return validations.cep.required;
      const cleanCEP = value.replace(/\D/g, "");
      if (cleanCEP.length !== 8) return "CEP inválido";
      return true;
    }
  },

  address: {
    required: "Este campo é obrigatório",
    validate: (value: string) => {
      if (!value) return validations.address.required;
      if (value.length < 3) return "Este campo deve ter pelo menos 3 caracteres";
      if (value.length > 100) return "Este campo deve ter no máximo 100 caracteres";
      return true;
    }
  },

  cpf: {
    required: "O CPF é obrigatório",
    validate: (value: string) => {
      if (!value) return validations.cpf.required;
      const cleanCPF = value.replace(/\D/g, "");
      if (cleanCPF.length !== 11) return "CPF inválido";

      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{10}$/.test(cleanCPF)) return "CPF inválido";

      // Validação do primeiro dígito verificador
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
      }
      let rest = 11 - (sum % 11);
      let digit1 = rest > 9 ? 0 : rest;
      if (digit1 !== parseInt(cleanCPF.charAt(9))) return "CPF inválido";

      // Validação do segundo dígito verificador
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
      }
      rest = 11 - (sum % 11);
      let digit2 = rest > 9 ? 0 : rest;
      if (digit2 !== parseInt(cleanCPF.charAt(10))) return "CPF inválido";

      return true;
    }
  },

  amount: {
    required: "O valor da doação é obrigatório",
    validate: (value: string) => {
      if (!value) return validations.amount.required;
      const amount = parseFloat(value);
      if (isNaN(amount)) return "Valor inválido";
      if (amount <= 0) return "O valor deve ser maior que zero";
      if (amount > 1000000) return "O valor máximo permitido é R$ 1.000.000,00";
      return true;
    }
  },

  paymentMethod: {
    required: "A forma de pagamento é obrigatória",
    validate: (value: string) => {
      if (!value) return validations.paymentMethod.required;
      if (!["credit_card", "pix"].includes(value)) return "Forma de pagamento inválida";
      return true;
    }
  }
};

// Função para formatar CPF (000.000.000-00)
export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length <= 3) return cleanCPF;
  if (cleanCPF.length <= 6) return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3)}`;
  if (cleanCPF.length <= 9) return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6)}`;
  return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6, 9)}-${cleanCPF.slice(9, 11)}`;
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