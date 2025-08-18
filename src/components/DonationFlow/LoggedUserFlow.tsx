import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDonation } from '@/contexts/DonationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Check, Heart, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Componentes dos passos
import DonationValueStep from '../forms/DonationValueStep';
import PaymentMethodStep from '../forms/PaymentMethodStep';
import SuccessStep from '../forms/SuccessStep';

interface LoggedUserFlowProps {
  initialMode?: 'sponsorship' | 'donate' | 'recurrent' | null;
  initialValue?: number;
  childData?: {
    id: string;
    name: string;
    age: number;
    location: string;
    image: string;
  };
}

export default function LoggedUserFlow({ 
  initialMode, 
  initialValue, 
  childData 
}: LoggedUserFlowProps) {
  const { state, setCurrentStep, isStepValid } = useDonation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Passos para usuário logado (sem dados pessoais)
  const steps = [
    { id: 'value', label: 'Valor', number: 1 },
    { id: 'payment', label: 'Pagamento', number: 2 },
    { id: 'success', label: 'Sucesso', number: 3 },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === state.currentStep);

  // Ajustar o step inicial para usuário logado (pular dados pessoais)
  useEffect(() => {
    if (state.currentStep === 'data') {
      setCurrentStep('value');
    }
  }, [state.currentStep, setCurrentStep]);

  const nextStep = () => {
    if (!isStepValid(state.currentStep)) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Para usuário logado, pular de 'value' direto para 'payment'
    if (state.currentStep === 'value') {
      setCurrentStep('payment');
    } else if (state.currentStep === 'payment') {
      // O processamento será feito no PaymentMethodStep
      // que chamará setCurrentStep('success') quando concluído
    }
  };

  const prevStep = () => {
    if (state.currentStep === 'payment') {
      setCurrentStep('value');
    }
  };

  const getTitle = () => {
    switch (state.data_donation_fields.type) {
      case 'sponsorship':
        return childData ? `Apadrinhe ${childData.name}` : 'Apadrinhe uma Criança';
      case 'recurrent':
        return 'Seja um Guardião da Infância';
      case 'donate':
        return 'Faça uma Doação Única';
      default:
        return 'Faça uma Doação';
    }
  };

  const getDescription = () => {
    switch (state.data_donation_fields.type) {
      case 'sponsorship':
        return childData 
          ? `Acompanhe o desenvolvimento de ${childData.name} com contribuições mensais e correspondência direta.`
          : 'Crie uma conexão especial acompanhando o desenvolvimento de uma criança.';
      case 'recurrent':
        return 'Sua contribuição mensal gera um impacto contínuo e sustentável na vida de várias crianças.';
      case 'donate':
        return 'Sua contribuição única pode transformar a vida de uma criança imediatamente.';
      default:
        return 'Sua contribuição transforma vidas.';
    }
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Heart className="text-childfund-green" size={32} />
            {getTitle()}
          </h2>
          <p className="text-gray-600">{getDescription()}</p>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto mb-8"
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-childfund-green/10 rounded-full flex items-center justify-center">
                  <User className="text-childfund-green" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Olá, {user?.name?.split(' ')[0] || 'Doador'}!</p>
                  <p className="text-sm text-green-700">Seus dados já estão salvos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dados da criança (se apadrinhamento) */}
        {childData && state.data_donation_fields.type === 'sponsorship' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-8"
          >
            <Card className="bg-gradient-to-r from-childfund-green/5 to-childfund-green/10 border border-childfund-green/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={childData.image} 
                    alt={childData.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{childData.name}</h3>
                    <p className="text-sm text-gray-600">{childData.age} anos • {childData.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Form Card */}
        <motion.div 
          className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Progress Bar (não mostrar no sucesso) */}
          {state.currentStep !== 'success' && (
            <div className="p-8 pb-0">
              <div className="flex justify-between items-center mb-2">
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-childfund-green transition-all duration-500"
                    style={{ 
                      width: `${((currentStepIndex + 1) / (steps.length - 1)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-sm mb-8">
                {steps.slice(0, -1).map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                      index < currentStepIndex 
                        ? 'bg-childfund-green/20 text-childfund-green' 
                        : index === currentStepIndex 
                        ? 'bg-childfund-green text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index < currentStepIndex ? <Check size={16} /> : step.number}
                    </div>
                    <span className={index === currentStepIndex ? 'font-medium text-childfund-green' : 'text-gray-500'}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Value */}
              {state.currentStep === 'value' && (
                <motion.div 
                  key="value"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <DonationValueStep 
                    initialMode={initialMode}
                    initialValue={initialValue}
                    onNext={nextStep}
                  />
                </motion.div>
              )}

              {/* Step 2: Payment (direto, sem dados pessoais) */}
              {state.currentStep === 'payment' && (
                <motion.div 
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PaymentMethodStep 
                    isNewUser={false}
                    onNext={nextStep}
                    onPrev={prevStep}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </motion.div>
              )}

              {/* Step 3: Success */}
              {state.currentStep === 'success' && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <SuccessStep 
                    donationType={state.data_donation_fields.type}
                    donationValue={state.data_donation_fields.value}
                    childData={childData}
                    isLoggedUser={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Information Card para usuários logados */}
        {state.currentStep !== 'success' && (
          <motion.div 
            className="max-w-2xl mx-auto mt-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <h4 className="font-semibold text-green-900 mb-2">
                    🎉 Obrigado por continuar conosco!
                  </h4>
                  <p className="text-sm text-green-800">
                    Após sua doação, você poderá acompanhar tudo na sua área pessoal e 
                    ver o impacto das suas contribuições.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}