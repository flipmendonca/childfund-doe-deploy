
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ArrowRight, 
  ArrowLeft,
  Check,
  CreditCard,
  Banknote,
  QrCode,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

type DonationStep = 'value' | 'data' | 'payment' | 'success';
type PaymentMethod = 'creditCard' | 'boleto' | 'pix';

interface SponsorData {
  childId: string;
  childName: string;
  childAge: number;
  childLocation: string;
  childImage: string;
}

interface DonationStepFormProps {
  initialMode?: 'once' | 'monthly';
  initialValue?: number;
  sponsorData?: SponsorData;
}

export default function DonationStepForm({ initialMode, initialValue, sponsorData }: DonationStepFormProps) {
  const { toast } = useToast();
  const location = useLocation();
  const [step, setStep] = useState<DonationStep>('value');
  const [donationValue, setDonationValue] = useState<number>(initialValue || (sponsorData ? 74 : 50));
  const [customValue, setCustomValue] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('creditCard');
  const [isMonthly, setIsMonthly] = useState<boolean>(sponsorData ? true : initialMode === 'monthly' ? true : initialMode === 'once' ? false : true);
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
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

  // Check URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const modeParam = params.get('mode');
    
    if (modeParam === 'monthly' || modeParam === 'once') {
      setIsMonthly(modeParam === 'monthly');
    }

    const valueParam = params.get('value');
    if (valueParam && !isNaN(parseInt(valueParam))) {
      setDonationValue(parseInt(valueParam));
    }

    // Para apadrinhamento, extrair dados da URL
    if (sponsorData || params.get('child')) {
      setIsMonthly(true); // Apadrinhamento é sempre mensal
      setDonationValue(74); // Valor mínimo para apadrinhamento
    }
  }, [location, sponsorData]);

  // Predefined donation values - diferentes para apadrinhamento
  const donationValues = sponsorData ? [74, 100, 150] : [30, 50, 100, 150, 200];

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers
    const value = e.target.value.replace(/[^\d]/g, '');
    setCustomValue(value);
    if (value) {
      const numValue = parseInt(value);
      // Para apadrinhamento, valor mínimo é 74
      if (sponsorData && numValue < 74) {
        toast({
          title: "Valor mínimo",
          description: "O valor mínimo para apadrinhamento é R$ 74",
          variant: "destructive"
        });
        return;
      }
      // Para doações únicas e mensais, valor mínimo é 20
      if (!sponsorData && numValue < 20) {
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

  const nextStep = () => {
    // Scroll to top of form
    const formElement = document.getElementById('donation-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    if (step === 'value') {
      setStep('data');
      toast({
        title: "Valor selecionado",
        description: `R$ ${donationValue},00 ${isMonthly ? 'mensais' : 'em doação única'}`,
      });
    } else if (step === 'data') {
      // Validate data
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
      // Validate payment data
      if (paymentMethod === 'creditCard' && (!formData.cardNumber || !formData.expDate || !formData.cvv || !formData.cardName)) {
        toast({
          title: "Por favor, preencha os dados do cartão",
          description: "Todos os campos são obrigatórios",
          variant: "destructive"
        });
        return;
      }
      
      // Process payment (simulated)
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setStep('success');
        setShowStickyBar(false); // Hide sticky bar after successful payment
        
        // Mensagem personalizada com base no tipo de doação
        let successMessage = "";
        if (sponsorData) {
          successMessage = `Apadrinhamento de ${sponsorData.childName} realizado com sucesso!`;
        } else if (isMonthly) {
          successMessage = "Doação mensal configurada com sucesso!";
        } else {
          successMessage = "Doação única realizada com sucesso!";
        }
        
        toast({
          title: successMessage,
          description: `Obrigado pela sua contribuição de R$ ${donationValue},00${isMonthly ? ' mensais' : ''}`,
          variant: "default"
        });
      }, 2000);
    }
  };

  const prevStep = () => {
    if (step === 'data') setStep('value');
    else if (step === 'payment') setStep('data');
  };

  // Function to validate if current step is complete
  const isStepValid = () => {
    if (step === 'value') {
      return donationValue > 0;
    } else if (step === 'data') {
      return formData.name && formData.email && formData.cpf && formData.phone;
    } else if (step === 'payment') {
      if (paymentMethod === 'creditCard') {
        return formData.cardNumber && formData.expDate && formData.cvv && formData.cardName;
      }
      return true; // Other payment methods don't require additional fields
    }
    return true;
  };

  // Handle sticky bar visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Only show sticky bar when donation value is selected and not on success step
      if (donationValue > 0 && step !== 'success') {
        const scrollPosition = window.scrollY;
        const formElement = document.getElementById('donation-form');
        
        if (formElement) {
          const formPosition = formElement.getBoundingClientRect();
          // Show sticky bar when form is not visible in viewport
          setShowStickyBar(formPosition.top < -300 || formPosition.bottom < 0);
        }
      } else {
        setShowStickyBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [donationValue, step]);

  // Verificar se é um apadrinhamento e mostrar etapa de valor apenas se não tiver valor inicial
  const skipValueStep = sponsorData && initialValue ? true : false;

  useEffect(() => {
    // Se for apadrinhamento com valor fixo, pular para a etapa de dados pessoais
    if (skipValueStep && step === 'value') {
      setStep('data');
    }
  }, [skipValueStep]);

  return (
    <div id="donation-form" className="py-16">
      <div className="container">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {!sponsorData ? (
            <h2 className="text-3xl font-bold mb-4">
              {initialMode === 'monthly' ? 'Faça uma Doação Mensal' : 
               initialMode === 'once' ? 'Faça uma Doação Única' : 
               'Faça Uma Doação'}
            </h2>
          ) : (
            <h2 className="text-3xl font-bold mb-4">
              Complete o Apadrinhamento
            </h2>
          )}
          <p className="text-gray-600">
            {sponsorData ? 
              `Você está apadrinhando ${sponsorData.childName}. Complete os dados abaixo para finalizar seu apadrinhamento.` :
              'Sua contribuição transforma vidas e constrói um futuro melhor para crianças em situação de vulnerabilidade.'
            }
          </p>
        </motion.div>

        <motion.div 
          className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Progress bar - only show on steps 1-3 */}
          {step !== 'success' && (
            <div className="p-8 pb-0">
              <div className="flex justify-between items-center mb-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ 
                      width: step === 'value' ? '33%' : step === 'data' ? '66%' : '100%' 
                    }}
                  ></div>
                </div>
              </div>

              {/* Step labels */}
              <div className="flex justify-between text-sm mb-8">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                    step === 'value' ? 'bg-primary text-white' : 
                    (step === 'data' || step === 'payment') ? 'bg-primary/20 text-primary' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {(step === 'data' || step === 'payment') ? <Check size={16} /> : "1"}
                  </div>
                  <span className={step === 'value' ? 'font-medium text-primary' : 'text-gray-500'}>Valor</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                    step === 'data' ? 'bg-primary text-white' : 
                    step === 'payment' ? 'bg-primary/20 text-primary' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step === 'payment' ? <Check size={16} /> : "2"}
                  </div>
                  <span className={step === 'data' ? 'font-medium text-primary' : 'text-gray-500'}>Dados</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                    step === 'payment' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    3
                  </div>
                  <span className={step === 'payment' ? 'font-medium text-primary' : 'text-gray-500'}>Pagamento</span>
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
                  <h3 className="text-xl font-bold mb-6">
                    {sponsorData ? `Escolha o valor mensal para apadrinhar ${sponsorData.childName}` : 'Escolha o valor da sua contribuição'}
                  </h3>
                  
                  {sponsorData && (
                    <div className="mb-6 p-4 bg-childfund-green/5 rounded-lg border border-childfund-green/20">
                      <p className="text-sm text-childfund-green">
                        💡 {sponsorData 
                          ? 'O valor mínimo para apadrinhamento é R$ 74 por mês'
                          : 'O valor mínimo para doações é R$ 20'
                        }
                      </p>
                    </div>
                  )}
                  
                  {/* Mostrar opção para escolher tipo de doação apenas se não for apadrinhamento */}
                  {!initialMode && !sponsorData && (
                    <div className="mb-8">
                      <label className="block mb-2 font-medium">Tipo de doação</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          className={`p-4 rounded-lg border text-center transition-all ${
                            isMonthly 
                              ? 'border-primary bg-primary/10 text-primary font-medium shadow-sm' 
                              : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                          }`}
                          onClick={() => setIsMonthly(true)}
                        >
                          Mensal
                        </button>
                        <button
                          className={`p-4 rounded-lg border text-center transition-all ${
                            !isMonthly 
                              ? 'border-primary bg-primary/10 text-primary font-medium shadow-sm' 
                              : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                          }`}
                          onClick={() => setIsMonthly(false)}
                        >
                          Única
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <label className="block mb-2 font-medium">
                      Valor da {sponsorData ? 'contribuição mensal' : 'contribuição'}
                    </label>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {donationValues.map((value) => (
                        <button
                          key={value}
                          className={`p-4 rounded-lg border text-center transition-all ${
                            donationValue === value && customValue === '' 
                              ? 'border-primary bg-primary/10 text-primary font-medium shadow-sm transform scale-105' 
                              : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                          }`}
                          onClick={() => handleSelectValue(value)}
                        >
                          R$ {value}
                        </button>
                      ))}
                      <div className={`p-4 rounded-lg border transition-all ${
                        customValue !== '' 
                          ? 'border-primary bg-primary/10 shadow-sm' 
                          : 'border-gray-300'
                      }`}>
                        <label htmlFor="customValue" className="text-xs text-gray-500">
                          {sponsorData ? 'Valor personalizado (mín. R$ 74)' : 'Outro valor (mín. R$ 20)'}
                        </label>
                        <div className="flex items-center">
                          <span className="mr-1">R$</span>
                          <input
                            type="text"
                            id="customValue"
                            value={customValue}
                            onChange={handleCustomValueChange}
                            className="w-full bg-transparent focus:outline-none"
                            placeholder={sponsorData ? "74" : "20"}
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
                          <h4 className="font-medium mb-1">
                            {sponsorData ? `Seu impacto no desenvolvimento de ${sponsorData.childName}` : `Seu impacto com R$ ${donationValue}`}
                          </h4>
                          <p className="text-gray-600">
                            {sponsorData 
                              ? `Com R$ ${donationValue} mensais, você garantirá educação, alimentação, cuidados de saúde e muito carinho para ${sponsorData.childName}.`
                              : isMonthly 
                                ? `Com sua doação mensal de R$ ${donationValue}, você garante alimentação para ${Math.floor(donationValue / 10)} crianças durante um mês.`
                                : `Sua doação única de R$ ${donationValue} proporciona ${Math.floor(donationValue / 50)} kits escolares completos para crianças em vulnerabilidade.`
                            }
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <Button 
                    onClick={() => {
                      // Validate minimum value for sponsorship or donations
                      const minValue = sponsorData ? 74 : 20;
                      const donationType = sponsorData ? "apadrinhamento" : "doações";
                      
                      if (donationValue < minValue) {
                        toast({
                          title: "Valor insuficiente",
                          description: `O valor mínimo para ${donationType} é R$ ${minValue}`,
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      // Scroll to top of form
                      const formElement = document.getElementById('donation-form');
                      if (formElement) {
                        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                      
                      setStep('data');
                      toast({
                        title: "Valor selecionado",
                        description: `R$ ${donationValue},00 ${isMonthly || sponsorData ? 'mensais' : 'em doação única'}`,
                      });
                    }} 
                    className="w-full bg-primary hover:bg-primary-hover text-white transition-all flex items-center justify-center gap-2"
                    disabled={!donationValue || donationValue < 1 || (sponsorData ? donationValue < 74 : donationValue < 20)}
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
                  <h3 className="text-xl font-bold mb-6">
                    {sponsorData ? `Preencha seus dados para apadrinhar ${sponsorData.childName}` : 'Insira seus dados'}
                  </h3>
                  
                  {/* Exibir resumo se for apadrinhamento */}
                  {sponsorData && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                      <img 
                        src={sponsorData.childImage} 
                        alt={`${sponsorData.childName}, ${sponsorData.childAge} anos`}
                        className="w-20 h-20 object-cover rounded-full"
                      />
                      <div>
                        <h4 className="font-medium">{sponsorData.childName}, {sponsorData.childAge} anos</h4>
                        {sponsorData.childLocation && (
                          <p className="text-gray-600 text-sm">{sponsorData.childLocation}</p>
                        )}
                        <p className="text-primary font-medium text-sm mt-1">R$ {donationValue},00 mensais</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4 mb-8">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 mb-1">Nome completo</label>
                      <input 
                        type="text" 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {!skipValueStep && (
                      <Button 
                        onClick={prevStep} 
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-2"
                        size="lg"
                      >
                        <ArrowLeft size={18} />
                        <span>Voltar</span>
                      </Button>
                    )}
                    <Button 
                      onClick={nextStep} 
                      className="flex-1 bg-primary text-white hover:bg-primary-hover flex items-center justify-center gap-2"
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
                            paymentMethod === 'creditCard' ? 'border-primary bg-primary/5' : 'border-gray-300'
                          }`}
                          onClick={() => setPaymentMethod('creditCard')}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'creditCard' ? 'border-primary' : 'border-gray-400'
                          }`}>
                            {paymentMethod === 'creditCard' && (
                              <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <CreditCard size={20} className={paymentMethod === 'creditCard' ? 'text-primary' : 'text-gray-500'} />
                          <span className={paymentMethod === 'creditCard' ? 'font-medium' : ''}>Cartão de crédito</span>
                        </div>
                        
                        <div 
                          className={`p-4 border rounded-lg flex gap-3 items-center cursor-pointer transition-all ${
                            paymentMethod === 'boleto' ? 'border-primary bg-primary/5' : 'border-gray-300'
                          }`}
                          onClick={() => setPaymentMethod('boleto')}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'boleto' ? 'border-primary' : 'border-gray-400'
                          }`}>
                            {paymentMethod === 'boleto' && (
                              <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <Banknote size={20} className={paymentMethod === 'boleto' ? 'text-primary' : 'text-gray-500'} />
                          <span className={paymentMethod === 'boleto' ? 'font-medium' : ''}>Boleto bancário</span>
                        </div>
                        
                        <div 
                          className={`p-4 border rounded-lg flex gap-3 items-center cursor-pointer transition-all ${
                            paymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'border-gray-300'
                          }`}
                          onClick={() => setPaymentMethod('pix')}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'pix' ? 'border-primary' : 'border-gray-400'
                          }`}>
                            {paymentMethod === 'pix' && (
                              <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <QrCode size={20} className={paymentMethod === 'pix' ? 'text-primary' : 'text-gray-500'} />
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
                            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Nome conforme aparece no cartão"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg mb-8">
                    <h4 className="font-medium mb-3">Resumo da {sponsorData ? 'contribuição' : 'doação'}</h4>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium">
                        {sponsorData ? 'Apadrinhamento' : isMonthly ? 'Mensal' : 'Única'}
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
                      className="flex-1 bg-primary text-white hover:bg-primary-hover"
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
                          <span>{sponsorData ? 'Finalizar Apadrinhamento' : 'Finalizar Doação'}</span>
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
                  {/* Success animation */}
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
                    <h3 className="text-2xl font-bold mb-4">
                      {sponsorData 
                        ? `Parabéns! Você agora é padrinho/madrinha de ${sponsorData.childName}!`
                        : isMonthly 
                          ? 'Doação mensal configurada com sucesso!'
                          : 'Doação realizada com sucesso!'
                      }
                    </h3>
                    <p className="text-gray-600 mb-8">
                      {sponsorData
                        ? `Sua contribuição mensal de R$ ${donationValue} vai proporcionar educação, saúde e proteção para ${sponsorData.childName}. Você receberá atualizações por e-mail sobre o desenvolvimento.`
                        : isMonthly 
                          ? `Sua doação mensal de R$ ${donationValue} foi configurada com sucesso. Você receberá um e-mail de confirmação com todos os detalhes.`
                          : `Sua doação única de R$ ${donationValue} foi processada com sucesso. Você receberá um e-mail de confirmação com todos os detalhes e seu recibo para dedução no Imposto de Renda.`
                      }
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-green-50 border border-green-100 p-5 rounded-lg mb-8 text-left"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h4 className="font-medium mb-2">Seu impacto</h4>
                    <p className="text-gray-600">
                      {sponsorData
                        ? `Com seu apadrinhamento, você está ajudando diretamente na transformação da vida de ${sponsorData.childName} e sua comunidade. Este é o início de uma jornada muito especial.`
                        : isMonthly
                          ? `Com sua doação mensal, você está ajudando ${Math.floor(donationValue / 10)} crianças a terem alimentação adequada por um mês. Ao longo de um ano, isso significa mais de ${Math.floor((donationValue / 10) * 12)} refeições nutritivas.`
                          : `Sua doação permite que ${Math.floor(donationValue / 50)} crianças recebam material escolar completo, aumentando suas chances de sucesso na educação.`
                      }
                    </p>
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
                        // Reset form after short delay
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
                      Voltar para o início
                    </Button>
                    <Button 
                      className="flex-1 bg-primary text-white hover:bg-primary-hover"
                      onClick={() => {
                        navigator.share({
                          title: 'Minha contribuição para ChildFund Brasil',
                          text: `Acabei de ${
                            sponsorData 
                              ? `apadrinhar ${sponsorData.childName} com uma contribuição mensal`
                              : `doar R$ ${donationValue}${isMonthly ? '/mês' : ''}`
                          } para o ChildFund Brasil. Junte-se a mim nesta causa!`,
                          url: window.location.href
                        }).catch(() => {
                          toast({
                            title: "Compartilhar",
                            description: "Compartilhe nas suas redes sociais!",
                          });
                        });
                      }}
                      size="lg"
                    >
                      Compartilhar minha contribuição
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Sticky CTA Bar - connected to the form values */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div 
            className="fixed bottom-0 left-0 right-0 bg-white shadow-xl border-t py-4 px-4 z-50"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="container flex items-center justify-between">
              <div className="flex flex-col">
                <p className="font-medium">
                  {sponsorData 
                    ? `Apadrinhar ${sponsorData.childName}:`
                    : 'Sua doação:'} 
                  <span className="text-primary font-bold"> R$ {donationValue}{isMonthly || sponsorData ? '/mês' : ''}</span>
                </p>
                <p className="text-sm text-gray-500">Etapa {step === 'value' ? '1' : step === 'data' ? '2' : '3'} de 3</p>
              </div>
              <Button 
                className="bg-primary text-white hover:bg-primary-hover"
                onClick={() => {
                  // Scroll to form
                  const formElement = document.getElementById('donation-form');
                  if (formElement) {
                    formElement.scrollIntoView({ behavior: 'smooth' });
                    
                    // If user already completed data entry but went back, skip to payment
                    if (step === 'value' && formData.name && formData.email && formData.cpf && formData.phone) {
                      setStep('payment');
                    } else {
                      // Otherwise proceed with normal flow
                      nextStep();
                    }
                  }
                }}
                disabled={!isStepValid() || isSubmitting}
                size="lg"
              >
                {isSubmitting ? 'Processando...' : sponsorData ? 'Continuar apadrinhamento' : 'Continuar doação'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
