import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  ArrowLeft,
  Check,
  CreditCard,
  Banknote,
  QrCode,
  Heart,
  UserPlus
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useDonation } from "@/contexts/DonationContext";
import { usePaymentProcessor } from "@/hooks/usePaymentProcessor";
import { AnalyticsService } from "@/services/AnalyticsService";
// import RecaptchaWrapper, { RecaptchaWrapperRef } from "./RecaptchaWrapper"; // Removido temporariamente

type DonationStep = 'value' | 'data' | 'payment' | 'success';
type PaymentMethod = 'creditCard' | 'boleto' | 'pix';
type DonationType = 'once' | 'monthly' | 'sponsorship';

interface UnifiedDonationFormProps {
  initialMode?: DonationType | null;
  initialValue?: number;
  childData?: {
    id: string;
    name: string;
    age: number;
    location: string;
    image: string;
  };
}

export default function UnifiedDonationForm({ 
  initialMode = null, 
  initialValue,
  childData 
}: UnifiedDonationFormProps) {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { updateDonationFields } = useDonation();
  const { processPayment } = usePaymentProcessor();
  const [step, setStep] = useState<DonationStep>('value');
  const [donationType, setDonationType] = useState<DonationType>(initialMode || 'monthly');
  const [donationValue, setDonationValue] = useState<number>(initialValue || (initialMode === 'sponsorship' ? 74 : 50));
  const [customValue, setCustomValue] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('creditCard');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(false);
  // const recaptchaRef = useRef<RecaptchaWrapperRef>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    cardNumber: '',
    expDate: '',
    cvv: '',
    cardName: ''
  });

  // Carregar dados do usuário logado automaticamente
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔍 [UnifiedDonationForm] Carregando dados do usuário logado:', user);
      
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        cpf: user.cpf || prev.cpf,
        phone: user.phone || prev.phone,
        // Dados de pagamento permanecem vazios - usuário deve preencher manualmente
      }));
      
      console.log('✅ [UnifiedDonationForm] Dados básicos preenchidos automaticamente');
    }
  }, [isAuthenticated, user]);

  // Predefined donation values based on type
  const getDonationValues = () => {
    if (donationType === 'sponsorship') {
      return [74, 100, 150, 200];
    }
    return [30, 50, 100, 150, 200];
  };

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setCustomValue(value);
    if (value) {
      const numValue = parseInt(value);
      
      // Validar valor mínimo baseado no tipo de doação
      if (donationType === 'sponsorship' && numValue < 74) {
        toast({
          title: "Valor mínimo",
          description: "O valor mínimo para apadrinhamento é R$ 74",
          variant: "destructive"
        });
        return;
      }
      
      if ((donationType === 'once' || donationType === 'monthly') && numValue < 20) {
        toast({
          title: "Valor mínimo",
          description: "O valor mínimo para doações é R$ 20",
          variant: "destructive"
        });
        return;
      }
      
      setDonationValue(numValue);
    }
  };

  const handleSelectValue = (value: number) => {
    setDonationValue(value);
    setCustomValue('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // const handleRecaptchaChange = (token: string | null) => {
  //   setRecaptchaToken(token);
  // };

  // const handleRecaptchaExpired = () => {
  //   setRecaptchaToken(null);
  //   toast({
  //     title: "reCAPTCHA expirado",
  //     description: "Por favor, complete a verificação novamente",
  //     variant: "destructive"
  //   });
  // };

  // const handleRecaptchaError = () => {
  //   setRecaptchaToken(null);
  //   toast({
  //     title: "Erro na verificação",
  //     description: "Houve um problema com o reCAPTCHA. Tente novamente",
  //     variant: "destructive"
  //   });
  // };

  const nextStep = async () => {
    if (step === 'value') {
      setStep('data');
      toast({
        title: "Valor selecionado",
        description: `R$ ${donationValue},00 ${getDonationTypeText()}`,
      });
    } else if (step === 'data') {
      if (!formData.name || !formData.email || !formData.cpf || !formData.phone) {
        toast({
          title: "Por favor, preencha todos os campos",
          description: "Todos os campos são obrigatórios",
          variant: "destructive"
        });
        return;
      }
      setStep('payment');
    } else if (step === 'payment') {
      if (paymentMethod === 'creditCard' && (!formData.cardNumber || !formData.expDate || !formData.cvv || !formData.cardName)) {
        toast({
          title: "Por favor, preencha os dados do cartão",
          description: "Todos os campos são obrigatórios",
          variant: "destructive"
        });
        return;
      }
      
      // Process payment using the new system
      setIsSubmitting(true);
      
      try {
        // Track analytics
        AnalyticsService.trackFormEvent({
          formType: donationType === 'once' ? 'donation_single' : donationType === 'monthly' ? 'donation_recurring' : 'sponsorship',
          step: 'submitted',
          paymentMethod: paymentMethod === 'creditCard' ? 'credit_card' : paymentMethod === 'boleto' ? 'bank_transfer' : 'debit',
          amount: donationValue
        });

        // Update donation context
        updateDonationFields({
          // Dados de doação
          type: donationType === 'sponsorship' ? 'sponsorship' : donationType === 'once' ? 'donate' : 'recurrent',
          value: donationValue,
          paymentMethod: paymentMethod === 'creditCard' ? 'credit_card' : paymentMethod === 'boleto' ? 'bank_transfer' : 'debit',
          childId: donationType === 'sponsorship' && childData ? childData.id : undefined
        });

        // Process payment
        const result = await processPayment(!isAuthenticated);
        
        // Note: processPayment will handle success redirection automatically
        // No need to handle success case here as it will redirect to success page
        
      } catch (error) {
        console.error('Erro ao processar doação:', error);
        toast({
          title: "Erro ao processar doação",
          description: error instanceof Error ? error.message : 'Erro desconhecido',
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const prevStep = () => {
    if (step === 'data') setStep('value');
    else if (step === 'payment') setStep('data');
  };

  const getDonationTypeText = () => {
    switch (donationType) {
      case 'once': return 'em doação única';
      case 'monthly': return 'mensais';
      case 'sponsorship': return 'mensais para apadrinhamento';
      default: return '';
    }
  };

  const isStepValid = () => {
    if (step === 'value') {
      const minValue = donationType === 'sponsorship' ? 74 : 20;
      return donationValue >= minValue;
    } else if (step === 'data') {
      return formData.name && formData.email && formData.cpf && formData.phone;
    } else if (step === 'payment') {
      const paymentDataValid = paymentMethod === 'creditCard' 
        ? (formData.cardNumber && formData.expDate && formData.cvv && formData.cardName)
        : true;
      return paymentDataValid && privacyAgreed; // && recaptchaToken !== null - removido temporariamente
    }
    return true;
  };

  const getTitle = () => {
    switch (donationType) {
      case 'once': return 'Faça uma Doação Única';
      case 'monthly': return 'Faça uma Doação Mensal';
      case 'sponsorship': return childData ? `Apadrinhe ${childData.name}` : 'Apadrinhe uma Criança';
      default: return 'Faça uma Doação';
    }
  };

  const getDescription = () => {
    switch (donationType) {
      case 'once': return 'Sua contribuição única pode transformar a vida de uma criança imediatamente.';
      case 'monthly': return 'Sua contribuição mensal gera um impacto contínuo e sustentável.';
      case 'sponsorship': return childData 
        ? `Acompanhe o desenvolvimento de ${childData.name} com contribuições mensais e correspondência direta.`
        : 'Crie uma conexão especial acompanhando o desenvolvimento de uma criança.';
      default: return 'Sua contribuição transforma vidas.';
    }
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="container">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">{getTitle()}</h2>
          <p className="text-gray-600">{getDescription()}</p>
        </motion.div>

        {childData && (
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

        <motion.div 
          className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {step !== 'success' && (
            <div className="p-8 pb-0">
              <div className="flex justify-between items-center mb-2">
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-childfund-green transition-all duration-500"
                    style={{ 
                      width: step === 'value' ? '33%' : step === 'data' ? '66%' : '100%' 
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-sm mb-8">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                    step === 'value' ? 'bg-childfund-green text-white' : 
                    (step === 'data' || step === 'payment') ? 'bg-childfund-green/20 text-childfund-green' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {(step === 'data' || step === 'payment') ? <Check size={16} /> : "1"}
                  </div>
                  <span className={step === 'value' ? 'font-medium text-childfund-green' : 'text-gray-500'}>Valor</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                    step === 'data' ? 'bg-childfund-green text-white' : 
                    step === 'payment' ? 'bg-childfund-green/20 text-childfund-green' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step === 'payment' ? <Check size={16} /> : "2"}
                  </div>
                  <span className={step === 'data' ? 'font-medium text-childfund-green' : 'text-gray-500'}>Dados</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                    step === 'payment' ? 'bg-childfund-green text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    3
                  </div>
                  <span className={step === 'payment' ? 'font-medium text-childfund-green' : 'text-gray-500'}>Pagamento</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Value */}
              {step === 'value' && (
                <motion.div 
                  key="value"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-bold mb-6">Escolha o valor da sua contribuição</h3>
                  
                  {!initialMode && (
                    <div className="mb-8">
                      <label className="block mb-2 font-medium">Tipo de doação</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          className={`p-3 rounded-lg border text-center transition-all text-sm ${
                            donationType === 'once'
                              ? 'border-childfund-green bg-childfund-green/10 text-childfund-green font-medium' 
                              : 'border-gray-300 hover:border-childfund-green hover:bg-childfund-green/5'
                          }`}
                          onClick={() => {
                            setDonationType('once');
                            setDonationValue(50);
                            setCustomValue('');
                          }}
                        >
                          Única
                        </button>
                        <button
                          className={`p-3 rounded-lg border text-center transition-all text-sm ${
                            donationType === 'monthly'
                              ? 'border-childfund-green bg-childfund-green/10 text-childfund-green font-medium' 
                              : 'border-gray-300 hover:border-childfund-green hover:bg-childfund-green/5'
                          }`}
                          onClick={() => {
                            setDonationType('monthly');
                            setDonationValue(50);
                            setCustomValue('');
                          }}
                        >
                          Mensal
                        </button>
                        <button
                          className={`p-3 rounded-lg border text-center transition-all text-sm ${
                            donationType === 'sponsorship'
                              ? 'border-childfund-green bg-childfund-green/10 text-childfund-green font-medium' 
                              : 'border-gray-300 hover:border-childfund-green hover:bg-childfund-green/5'
                          }`}
                          onClick={() => {
                            setDonationType('sponsorship');
                            setDonationValue(74);
                            setCustomValue('');
                          }}
                        >
                          Apadrinhamento
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <label className="block mb-2 font-medium">Valor da contribuição</label>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {getDonationValues().map((value) => (
                        <button
                          key={value}
                          className={`p-4 rounded-lg border text-center transition-all ${
                            donationValue === value && customValue === '' 
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
                          <input
                            type="text"
                            id="customValue"
                            value={customValue}
                            onChange={handleCustomValueChange}
                            className="w-full bg-transparent focus:outline-none"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {donationValue > 0 && (
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
                          <h4 className="font-medium mb-1">Seu impacto com R$ {donationValue}</h4>
                          <p className="text-gray-600">
                            {donationType === 'sponsorship' 
                              ? `Com R$ ${donationValue} mensais, você garante acompanhamento completo de uma criança, incluindo alimentação, educação e saúde.`
                              : donationType === 'monthly' 
                              ? `Com sua doação mensal de R$ ${donationValue}, você garante alimentação para ${Math.floor(donationValue / 10)} crianças durante um mês.`
                              : `Sua doação única de R$ ${donationValue} proporciona ${Math.floor(donationValue / 50)} kits escolares completos para crianças em vulnerabilidade.`
                            }
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <Button 
                    onClick={nextStep} 
                    className="w-full bg-childfund-green text-white hover:bg-childfund-green/90 transition-all flex items-center justify-center gap-2"
                    disabled={!isStepValid()}
                    size="lg"
                  >
                    <span>Continuar</span>
                    <ArrowRight size={18} />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Personal Data */}
              {step === 'data' && (
                <motion.div 
                  key="data"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-bold mb-6">Insira seus dados</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 mb-1">Nome completo</label>
                      <input 
                        type="text" 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-childfund-green focus:border-transparent"
                        placeholder="Seu nome completo"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-gray-700 mb-1">E-mail</label>
                      <input 
                        type="email" 
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-childfund-green focus:border-transparent"
                        placeholder="seu@email.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cpf" className="block text-gray-700 mb-1">CPF</label>
                      <input 
                        type="text" 
                        id="cpf"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-childfund-green focus:border-transparent"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-gray-700 mb-1">Telefone</label>
                      <input 
                        type="tel" 
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-childfund-green focus:border-transparent"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={prevStep} 
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2"
                      size="lg"
                    >
                      <ArrowLeft size={18} />
                      <span>Voltar</span>
                    </Button>
                    <Button 
                      onClick={nextStep} 
                      className="flex-1 bg-childfund-green text-white hover:bg-childfund-green/90 flex items-center justify-center gap-2"
                      size="lg"
                    >
                      <span>Continuar</span>
                      <ArrowRight size={18} />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {step === 'payment' && (
                <motion.div 
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-bold mb-6">Escolha a forma de pagamento</h3>
                  
                  <div className="space-y-6 mb-8">
                    <div>
                      <label className="block text-gray-700 mb-3">Método de pagamento</label>
                      <div className="space-y-3">
                        <div 
                          className={`p-4 border rounded-lg flex gap-3 items-center cursor-pointer transition-all ${
                            paymentMethod === 'creditCard' ? 'border-childfund-green bg-childfund-green/5' : 'border-gray-300'
                          }`}
                          onClick={() => setPaymentMethod('creditCard')}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'creditCard' ? 'border-childfund-green' : 'border-gray-400'
                          }`}>
                            {paymentMethod === 'creditCard' && (
                              <div className="w-2.5 h-2.5 bg-childfund-green rounded-full"></div>
                            )}
                          </div>
                          <CreditCard size={20} className={paymentMethod === 'creditCard' ? 'text-childfund-green' : 'text-gray-500'} />
                          <span className={paymentMethod === 'creditCard' ? 'font-medium' : ''}>Cartão de crédito</span>
                        </div>
                        
                        <div 
                          className={`p-4 border rounded-lg flex gap-3 items-center cursor-pointer transition-all ${
                            paymentMethod === 'boleto' ? 'border-childfund-green bg-childfund-green/5' : 'border-gray-300'
                          }`}
                          onClick={() => setPaymentMethod('boleto')}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'boleto' ? 'border-childfund-green' : 'border-gray-400'
                          }`}>
                            {paymentMethod === 'boleto' && (
                              <div className="w-2.5 h-2.5 bg-childfund-green rounded-full"></div>
                            )}
                          </div>
                          <Banknote size={20} className={paymentMethod === 'boleto' ? 'text-childfund-green' : 'text-gray-500'} />
                          <span className={paymentMethod === 'boleto' ? 'font-medium' : ''}>Boleto bancário</span>
                        </div>
                        
                        <div 
                          className={`p-4 border rounded-lg flex gap-3 items-center cursor-pointer transition-all ${
                            paymentMethod === 'pix' ? 'border-childfund-green bg-childfund-green/5' : 'border-gray-300'
                          }`}
                          onClick={() => setPaymentMethod('pix')}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'pix' ? 'border-childfund-green' : 'border-gray-400'
                          }`}>
                            {paymentMethod === 'pix' && (
                              <div className="w-2.5 h-2.5 bg-childfund-green rounded-full"></div>
                            )}
                          </div>
                          <QrCode size={20} className={paymentMethod === 'pix' ? 'text-childfund-green' : 'text-gray-500'} />
                          <span className={paymentMethod === 'pix' ? 'font-medium' : ''}>PIX</span>
                        </div>
                      </div>
                    </div>

                    {paymentMethod === 'creditCard' && (
                      <motion.div 
                        className="space-y-4 mt-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <div>
                          <label htmlFor="cardNumber" className="block text-gray-700 mb-1">Número do cartão</label>
                          <input 
                            type="text" 
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-childfund-green focus:border-transparent"
                            placeholder="0000 0000 0000 0000"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="expDate" className="block text-gray-700 mb-1">Validade</label>
                            <input 
                              type="text" 
                              id="expDate"
                              name="expDate"
                              value={formData.expDate}
                              onChange={handleInputChange}
                              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-childfund-green focus:border-transparent"
                              placeholder="MM/AA"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="cvv" className="block text-gray-700 mb-1">CVV</label>
                            <input 
                              type="text" 
                              id="cvv"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleInputChange}
                              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-childfund-green focus:border-transparent"
                              placeholder="000"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="cardName" className="block text-gray-700 mb-1">Nome no cartão</label>
                          <input 
                            type="text" 
                            id="cardName"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-childfund-green focus:border-transparent"
                            placeholder="Nome conforme aparece no cartão"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg mb-8">
                    <h4 className="font-medium mb-3">Resumo da doação</h4>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium">
                        {donationType === 'once' ? 'Única' : donationType === 'monthly' ? 'Mensal' : 'Apadrinhamento'}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Valor:</span>
                      <span className="font-medium">R$ {donationValue},00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Forma de pagamento:</span>
                      <span className="font-medium">
                        {paymentMethod === 'creditCard' ? 'Cartão de Crédito' : 
                         paymentMethod === 'boleto' ? 'Boleto Bancário' : 'PIX'}
                      </span>
                    </div>
                  </div>

                  {/* Privacy Agreement */}
                  <div className="mb-6">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="privacyAgreement"
                        checked={privacyAgreed}
                        onChange={(e) => setPrivacyAgreed(e.target.checked)}
                        className="mt-1 h-4 w-4 text-childfund-green focus:ring-childfund-green border-gray-300 rounded"
                        required
                      />
                      <label htmlFor="privacyAgreement" className="text-sm text-gray-700 leading-relaxed">
                        Concordo com a{" "}
                        <a href="/politica-salvaguarda" target="_blank" className="text-childfund-green underline hover:text-childfund-green/80">
                          Política de Salvaguarda Infantil
                        </a>
                        {" "}e{" "}
                        <a href="/aviso-privacidade" target="_blank" className="text-childfund-green underline hover:text-childfund-green/80">
                          Aviso de Privacidade
                        </a>
                        {" "}e estou ciente que meus dados serão usados somente para fins da minha doação.
                      </label>
                    </div>
                  </div>

                  {/* reCAPTCHA Verification - Removido temporariamente */}

                  <div className="flex gap-4">
                    <Button 
                      onClick={prevStep} 
                      variant="outline"
                      className="flex-1"
                      disabled={isSubmitting}
                      size="lg"
                    >
                      <ArrowLeft size={18} className="mr-2" />
                      <span>Voltar</span>
                    </Button>
                    <Button 
                      onClick={nextStep} 
                      className="flex-1 bg-childfund-green text-white hover:bg-childfund-green/90"
                      disabled={isSubmitting || !isStepValid()}
                      size="lg"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processando
                        </span>
                      ) : (
                        <>
                          <span>Finalizar Doação</span>
                          <ArrowRight size={18} className="ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 'success' && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-8"
                >
                  <motion.div 
                    className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.2
                    }}
                  >
                    <Check className="w-12 h-12 text-green-600" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-2xl font-bold mb-4 text-childfund-green">
                      Obrigado por sua doação!
                    </h3>
                    <p className="text-gray-700 mb-8">
                      Sua contribuição ajuda a transformar vidas. Juntos, criamos futuros melhores!
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-childfund-green/10 border border-childfund-green/20 p-6 rounded-lg mb-8 text-left"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <UserPlus className="text-childfund-green" size={20} />
                      Cadastre-se para acessar a Área do Doador
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Acompanhe suas doações, veja relatórios de impacto e tenha acesso a benefícios exclusivos.
                    </p>
                    <Button 
                      asChild
                      className="bg-childfund-green hover:bg-childfund-green/90 text-white w-full mb-2"
                    >
                      <Link to="/auth/register">
                        <UserPlus className="mr-2" size={18} />
                        Cadastrar na Área do Doador
                      </Link>
                    </Button>
                    <div className="text-center mt-2">
                      <span className="text-gray-700">Já tem cadastro? </span>
                      <Link to="/auth/login" className="text-childfund-green underline font-medium">Faça login</Link>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Button
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setTimeout(() => {
                          setStep('value');
                          setFormData({
                            name: '',
                            email: '',
                            cpf: '',
                            phone: '',
                            cardNumber: '',
                            expDate: '',
                            cvv: '',
                            cardName: ''
                          });
                        }, 300);
                      }}
                      size="lg"
                    >
                      Fazer outra doação
                    </Button>
                    <Button 
                      asChild
                      className="flex-1 bg-childfund-yellow hover:bg-childfund-yellow/90 text-gray-800 font-bold"
                      size="lg"
                    >
                      <Link to="/">Voltar ao início</Link>
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
