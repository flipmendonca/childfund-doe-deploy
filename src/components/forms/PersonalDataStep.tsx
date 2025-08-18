import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDonation } from '@/contexts/DonationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, User, Mail, Phone, MapPin } from 'lucide-react';
import { registerSchema1, registerSchema2 } from '@/utils/validationSchemas';
import { useToast } from '@/hooks/use-toast';
import { 
  formatCPF, 
  formatPhone, 
  formatCEP,
  unmaskCPF,
  unmaskPhone,
  unmaskCEP
} from '@/utils/formatters';
import { useAutoCEP } from '@/hooks/useViaCEP';

interface PersonalDataStepProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function PersonalDataStep({ onNext, onPrev }: PersonalDataStepProps) {
  const { state, setPersonalData } = useDonation();
  const { toast } = useToast();
  
  const [currentSection, setCurrentSection] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    // Seção 1 - Dados básicos
    name: state.data_user_fields.name || '',
    document: state.data_user_fields.document || '',
    email: state.data_user_fields.email || '',
    phone: state.data_user_fields.phone || '',
    
    // Seção 2 - Endereço
    postalCode: state.data_user_fields.postalCode || '',
    street: state.data_user_fields.street || '',
    number: state.data_user_fields.number || '',
    complement: state.data_user_fields.complement || '',
    neighborhood: state.data_user_fields.neighborhood || '',
    city: state.data_user_fields.city || '',
    state: state.data_user_fields.state || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hook para busca automática de CEP
  const { isLoading: isLoadingCEP, error: cepError, handleCEPChange, clearError } = useAutoCEP((address) => {
    setFormData(prev => ({
      ...prev,
      street: address.street || '',
      neighborhood: address.neighborhood || '',
      city: address.city || '',
      state: address.state || ''
    }));
  });

  // Handlers para formatação em tempo real
  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'document') {
      formattedValue = formatCPF(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    } else if (field === 'postalCode') {
      formattedValue = formatCEP(value);
      // Buscar endereço automaticamente quando CEP estiver completo
      handleCEPChange(formattedValue);
      // Limpar erro de CEP se existir
      if (cepError) {
        clearError();
      }
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateSection1 = () => {
    const section1Data = {
      name: formData.name,
      document: unmaskCPF(formData.document),
      email: formData.email,
      phone: unmaskPhone(formData.phone)
    };

    const validation = registerSchema1.safeParse(section1Data);
    
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach(error => {
        if (error.path[0]) {
          newErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const validateSection2 = () => {
    const section2Data = {
      postalCode: unmaskCEP(formData.postalCode),
      street: formData.street,
      number: formData.number,
      neighborhood: formData.neighborhood,
      city: formData.city,
      state: formData.state
    };

    const validation = registerSchema2.safeParse(section2Data);
    
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach(error => {
        if (error.path[0]) {
          newErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleNextSection = () => {
    if (currentSection === 1) {
      if (validateSection1()) {
        setCurrentSection(2);
      } else {
        toast({
          title: "Dados incompletos",
          description: "Por favor, preencha todos os campos obrigatórios",
          variant: "destructive"
        });
      }
    }
  };

  const handlePrevSection = () => {
    if (currentSection === 2) {
      setCurrentSection(1);
    }
  };

  const handleNext = () => {
    if (currentSection === 1) {
      handleNextSection();
      return;
    }

    if (validateSection2()) {
      // Salvar dados no contexto
      setPersonalData({
        name: formData.name,
        document: unmaskCPF(formData.document),
        email: formData.email,
        phone: unmaskPhone(formData.phone),
        postalCode: unmaskCEP(formData.postalCode),
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state
      });
      
      onNext();
    } else {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
    }
  };

  const handlePrev = () => {
    if (currentSection === 2) {
      handlePrevSection();
    } else {
      onPrev();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">
          {currentSection === 1 ? 'Seus dados pessoais' : 'Seu endereço'}
        </h3>
        <div className="text-sm text-gray-500">
          Seção {currentSection} de 2
        </div>
      </div>

      {/* Seção 1: Dados básicos */}
      {currentSection === 1 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4">
            {/* Nome completo */}
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <User size={16} />
                Nome completo *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Seu nome completo"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* CPF */}
            <div>
              <Label htmlFor="document">
                CPF *
              </Label>
              <Input
                id="document"
                type="text"
                value={formData.document}
                onChange={(e) => handleInputChange('document', e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                className={errors.document ? 'border-red-500' : ''}
              />
              {errors.document && (
                <p className="text-sm text-red-500 mt-1">{errors.document}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail size={16} />
                E-mail *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone size={16} />
                Telefone/Celular *
              </Label>
              <Input
                id="phone"
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Seção 2: Endereço */}
      {currentSection === 2 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CEP */}
            <div className="md:col-span-2">
              <Label htmlFor="postalCode" className="flex items-center gap-2">
                <MapPin size={16} />
                CEP *
              </Label>
              <div className="relative">
                <Input
                  id="postalCode"
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  className={errors.postalCode ? 'border-red-500' : ''}
                />
                {isLoadingCEP && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-4 h-4 border-2 border-childfund-green border-t-transparent rounded-full"
                    />
                  </div>
                )}
              </div>
              {(errors.postalCode || cepError) && (
                <p className="text-sm text-red-500 mt-1">{errors.postalCode || cepError}</p>
              )}
            </div>

            {/* Endereço */}
            <div className="md:col-span-2">
              <Label htmlFor="street">Endereço *</Label>
              <Input
                id="street"
                type="text"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="Rua, Avenida, etc."
                className={errors.street ? 'border-red-500' : ''}
              />
              {errors.street && (
                <p className="text-sm text-red-500 mt-1">{errors.street}</p>
              )}
            </div>

            {/* Número e Complemento */}
            <div>
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                type="text"
                value={formData.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
                placeholder="123"
                className={errors.number ? 'border-red-500' : ''}
              />
              {errors.number && (
                <p className="text-sm text-red-500 mt-1">{errors.number}</p>
              )}
            </div>

            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                type="text"
                value={formData.complement}
                onChange={(e) => handleInputChange('complement', e.target.value)}
                placeholder="Apto, Casa, etc."
              />
            </div>

            {/* Bairro */}
            <div>
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input
                id="neighborhood"
                type="text"
                value={formData.neighborhood}
                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                placeholder="Nome do bairro"
                className={errors.neighborhood ? 'border-red-500' : ''}
              />
              {errors.neighborhood && (
                <p className="text-sm text-red-500 mt-1">{errors.neighborhood}</p>
              )}
            </div>

            {/* Cidade */}
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Nome da cidade"
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-sm text-red-500 mt-1">{errors.city}</p>
              )}
            </div>

            {/* Estado */}
            <div className="md:col-span-2">
              <Label htmlFor="state">Estado *</Label>
              <select
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className={`w-full h-10 px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md ${errors.state ? 'border-red-500' : ''}`}
              >
                <option value="">Selecione o estado</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
              {errors.state && (
                <p className="text-sm text-red-500 mt-1">{errors.state}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Botões de navegação */}
      <div className="flex gap-4 pt-4">
        <Button 
          variant="outline" 
          onClick={handlePrev}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          {currentSection === 1 ? 'Voltar' : 'Dados pessoais'}
        </Button>
        
        <Button 
          onClick={handleNext}
          className="flex-1 bg-childfund-green text-white hover:bg-childfund-green/90 transition-all flex items-center justify-center gap-2"
        >
          <span>
            {currentSection === 1 ? 'Próximo: Endereço' : 'Continuar para pagamento'}
          </span>
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}