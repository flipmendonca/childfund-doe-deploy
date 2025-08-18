import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDonation } from '@/contexts/DonationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Check } from 'lucide-react';
import { donationValueSchema } from '@/utils/validationSchemas';
import { useToast } from '@/hooks/use-toast';

interface DonationValueStepProps {
  initialMode?: 'sponsorship' | 'donate' | 'recurrent' | null;
  initialValue?: number;
  onNext: () => void;
}

export default function DonationValueStep({ 
  initialMode, 
  initialValue, 
  onNext 
}: DonationValueStepProps) {
  const { state, setDonationType, setDonationValue } = useDonation();
  const { toast } = useToast();
  const [customValue, setCustomValue] = useState<string>('');

  // Configurar valores iniciais
  useEffect(() => {
    if (initialMode && state.data_donation_fields.type !== initialMode) {
      setDonationType(initialMode);
    }
    
    if (initialValue && state.data_donation_fields.value !== initialValue) {
      setDonationValue(initialValue);
    }
  }, [initialMode, initialValue, state.data_donation_fields.type, state.data_donation_fields.value, setDonationType, setDonationValue]);

  // Valores predefinidos baseados no tipo de doação
  const getDonationValues = () => {
    switch (state.data_donation_fields.type) {
      case 'sponsorship':
        return [74, 100, 150, 200];
      case 'recurrent':
        return [20, 50, 100, 150];
      case 'donate':
        return [30, 50, 100, 200];
      default:
        return [50, 100, 150, 200];
    }
  };

  const handleTypeChange = (type: 'sponsorship' | 'donate' | 'recurrent') => {
    setDonationType(type);
    
    // Ajustar valor se necessário conforme tipo
    const currentValue = state.data_donation_fields.value;
    if (type === 'sponsorship' && currentValue < 74) {
      setDonationValue(74);
      setCustomValue('');
    } else if (type === 'recurrent' && currentValue < 20) {
      setDonationValue(20);
      setCustomValue('');
    }
  };

  const handleSelectValue = (value: number) => {
    setDonationValue(value);
    setCustomValue('');
  };

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setCustomValue(value);
    if (value) {
      setDonationValue(parseInt(value));
    }
  };

  const handleNext = () => {
    // Validar valor conforme tipo de doação
    const validation = donationValueSchema.safeParse({
      type: state.data_donation_fields.type,
      value: state.data_donation_fields.value,
      childId: state.data_donation_fields.childId
    });

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Valor inválido';
      toast({
        title: "Valor inválido",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }

    onNext();
  };

  const getMinimumValue = () => {
    switch (state.data_donation_fields.type) {
      case 'sponsorship':
        return 74;
      case 'recurrent':
        return 20;
      case 'donate':
        return 1;
      default:
        return 1;
    }
  };

  const getImpactMessage = () => {
    const value = state.data_donation_fields.value;
    const type = state.data_donation_fields.type;

    if (type === 'sponsorship') {
      return `Com R$ ${value} mensais, você garante acompanhamento completo de uma criança, incluindo alimentação, educação e saúde.`;
    } else if (type === 'recurrent') {
      return `Com sua doação mensal de R$ ${value}, você garante alimentação para ${Math.floor(value / 10)} crianças durante um mês.`;
    } else {
      return `Sua doação única de R$ ${value} proporciona ${Math.floor(value / 25)} kits escolares completos para crianças em vulnerabilidade.`;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-6">Escolha o valor da sua contribuição</h3>
      
      {/* Seleção do tipo de doação (se não for fixo) */}
      {!initialMode && (
        <div className="mb-8">
          <label className="block mb-2 font-medium">Tipo de doação</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              className={`p-3 rounded-lg border text-center transition-all text-sm ${
                state.data_donation_fields.type === 'donate'
                  ? 'border-childfund-green bg-childfund-green/10 text-childfund-green font-medium' 
                  : 'border-gray-300 hover:border-childfund-green hover:bg-childfund-green/5'
              }`}
              onClick={() => handleTypeChange('donate')}
            >
              Única
            </button>
            <button
              className={`p-3 rounded-lg border text-center transition-all text-sm ${
                state.data_donation_fields.type === 'recurrent'
                  ? 'border-childfund-green bg-childfund-green/10 text-childfund-green font-medium' 
                  : 'border-gray-300 hover:border-childfund-green hover:bg-childfund-green/5'
              }`}
              onClick={() => handleTypeChange('recurrent')}
            >
              Mensal
            </button>
            <button
              className={`p-3 rounded-lg border text-center transition-all text-sm ${
                state.data_donation_fields.type === 'sponsorship'
                  ? 'border-childfund-green bg-childfund-green/10 text-childfund-green font-medium' 
                  : 'border-gray-300 hover:border-childfund-green hover:bg-childfund-green/5'
              }`}
              onClick={() => handleTypeChange('sponsorship')}
            >
              Apadrinhamento
            </button>
          </div>
        </div>
      )}
      
      {/* Seleção de valor */}
      <div className="mb-8">
        <label className="block mb-2 font-medium">Valor da contribuição</label>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {getDonationValues().map((value) => (
            <button
              key={value}
              className={`p-4 rounded-lg border text-center transition-all ${
                state.data_donation_fields.value === value && customValue === '' 
                  ? 'border-childfund-green bg-childfund-green/10 text-childfund-green font-medium' 
                  : 'border-gray-300 hover:border-childfund-green hover:bg-childfund-green/5'
              }`}
              onClick={() => handleSelectValue(value)}
            >
              R$ {value}
            </button>
          ))}
          <div className={`p-4 rounded-lg border transition-all ${
            customValue !== '' 
              ? 'border-childfund-green bg-childfund-green/10' 
              : 'border-gray-300'
          }`}>
            <label htmlFor="customValue" className="text-xs text-gray-500">Outro valor</label>
            <div className="flex items-center">
              <span className="mr-1">R$</span>
              <Input
                type="text"
                id="customValue"
                value={customValue}
                onChange={handleCustomValueChange}
                className="w-full bg-transparent border-none focus:ring-0 p-0 h-auto"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Aviso sobre valor mínimo */}
        {state.data_donation_fields.value < getMinimumValue() && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-800">
              <strong>Valor mínimo:</strong> R$ {getMinimumValue()},00 para {
                state.data_donation_fields.type === 'sponsorship' ? 'apadrinhamento' :
                state.data_donation_fields.type === 'recurrent' ? 'doação recorrente' :
                'este tipo de doação'
              }
            </p>
          </div>
        )}
      </div>

      {/* Mensagem de impacto */}
      {state.data_donation_fields.value >= getMinimumValue() && (
        <motion.div 
          className="bg-green-50 border border-green-100 rounded-lg p-5 mb-8"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Check size={20} className="text-green-600" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Seu impacto com R$ {state.data_donation_fields.value}</h4>
              <p className="text-gray-600">{getImpactMessage()}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Botão de continuar */}
      <Button 
        onClick={handleNext} 
        className="w-full bg-childfund-green text-white hover:bg-childfund-green/90 transition-all flex items-center justify-center gap-2"
        disabled={state.data_donation_fields.value < getMinimumValue()}
        size="lg"
      >
        <span>Continuar</span>
        <ArrowRight size={18} />
      </Button>
    </div>
  );
}