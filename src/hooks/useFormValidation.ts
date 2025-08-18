import { useState } from "react";
import { validations, formatCPF, formatPhone, formatCEP } from "@/utils/validations";
import { cepService } from "@/services/cepService";
import { useToast } from "@/components/ui/use-toast";

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  amount?: string;
  paymentMethod?: string;
}

interface UseFormValidationProps {
  initialValues: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void>;
}

export function useFormValidation({ initialValues, onSubmit }: UseFormValidationProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const { toast } = useToast();

  const validateField = (name: string, value: string): string | true => {
    switch (name) {
      case "name":
        return validations.name.validate(value);
      case "email":
        return validations.email.validate(value);
      case "phone":
        return validations.phone.validate(value);
      case "cpf":
        return validations.cpf.validate(value);
      case "birthDate":
        return validations.birthDate.validate(value);
      case "cep":
        return validations.cep.validate(value);
      case "logradouro":
      case "numero":
      case "bairro":
      case "cidade":
      case "estado":
        return validations.address.validate(value);
      case "amount":
        if (!value) return "O valor da doação é obrigatório";
        const amount = parseFloat(value);
        if (isNaN(amount) || amount <= 0) return "O valor deve ser maior que zero";
        return true;
      case "paymentMethod":
        if (!value) return "A forma de pagamento é obrigatória";
        return true;
      default:
        return true;
    }
  };

  const handleChange = async (name: string, value: string) => {
    let formattedValue = value;

    // Formatação específica para cada campo
    switch (name) {
      case "cpf":
        formattedValue = formatCPF(value);
        break;
      case "phone":
        formattedValue = formatPhone(value);
        break;
      case "cep":
        formattedValue = formatCEP(value);
        break;
    }

    // Atualiza o valor
    setValues(prev => ({ ...prev, [name]: formattedValue }));

    // Valida o campo
    const validationResult = validateField(name, formattedValue);
    if (validationResult !== true) {
      setErrors(prev => ({ ...prev, [name]: validationResult as string }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Se for CEP válido, busca o endereço
    if (name === "cep" && formattedValue.replace(/\D/g, "").length === 8) {
      setIsLoadingCEP(true);
      try {
        const address = await cepService.getAddressByCEP(formattedValue);
        setValues(prev => ({
          ...prev,
          logradouro: address.logradouro,
          bairro: address.bairro,
          cidade: address.localidade,
          estado: address.uf
        }));
      } catch (error) {
        toast({
          title: "Erro ao buscar CEP",
          description: "Não foi possível encontrar o endereço para este CEP.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingCEP(false);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Valida todos os campos
    Object.keys(values).forEach(key => {
      const validationResult = validateField(key, values[key]);
      if (validationResult !== true) {
        newErrors[key] = validationResult as string;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Erro ao enviar formulário",
        description: "Por favor, corrija os erros antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      toast({
        title: "Erro ao processar formulário",
        description: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    isLoadingCEP,
    handleChange,
    handleSubmit,
    resetForm
  };
} 