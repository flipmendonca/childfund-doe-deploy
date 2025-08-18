import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Banknote,
  QrCode,
  Shield,
  Clock,
  Loader2,
  Building2,
  Heart
} from "lucide-react";
import LoggedLayout from '@/components/layout/LoggedLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useDonorData } from '@/hooks/useDonorData';
import { DSOService } from '@/services/DSOService';
import { useToast } from '@/hooks/use-toast';
import valid from 'card-validator';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCreditCard } from 'react-icons/fa';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { BRAZILIAN_BANKS } from '@/data/banks';

// Bancos aceitos para débito automático (conforme servidor de produção)
const bancos = BRAZILIAN_BANKS.map(bank => ({ 
  codigo: bank.code, 
  nome: bank.name 
}));

// Função para mostrar ícone do cartão
const getCardTypeIcon = (type: string | undefined) => {
  switch (type) {
    case "visa":
      return <FaCcVisa className="inline ml-2 text-blue-600 text-2xl" title="Visa" />;
    case "mastercard":
      return <FaCcMastercard className="inline ml-2 text-red-600 text-2xl" title="Mastercard" />;
    case "american-express":
      return <FaCcAmex className="inline ml-2 text-indigo-600 text-2xl" title="Amex" />;
    default:
      return <FaCreditCard className="inline ml-2 text-gray-400 text-2xl" title="Cartão" />;
  }
};

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_transfer';
  label: string;
  lastFour?: string;
  expiryDate?: string;
  bankName?: string;
  accountLastDigits?: string;
  isActive: boolean;
}

interface DonationData {
  id: string;
  amount: number;
  frequency: 'monthly' | 'once';
  paymentMethod: PaymentMethod;
  nextPayment: string;
  status: 'active' | 'paused' | 'cancelled';
}

// Interfaces para dados de cartão (conforme documentação)
interface Card {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
  focus: 'name' | 'number' | 'expiry' | 'cvc' | '';
}

interface TransferData {
  name: string;
  document: string;
  bank: string;
  number: string;
  digit: string;
  agency: string;
  agency_digit: string;
}

interface UserProfileData {
  paymentMethod?: string;
  cardLastFour?: string;
  cardExpiryDate?: string;
  bankName?: string;
  accountLastDigits?: string;
  donationAmount?: number;
  nextPaymentDate?: string;
  donationStatus?: string;
  hasPaymentMethod?: boolean;
  hasAnyDonationHistory?: boolean; // Nova propriedade para verificar histórico
}

export default function PaymentPage() {
  const { user, isLoading } = useAuth();
  const donorData = useDonorData(); // Ajustando para usar o hook corretamente
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("method");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingPaymentInfo, setIsLoadingPaymentInfo] = useState(true);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'card' | 'transfer'>('card');
  const [cardType, setCardType] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [userPaymentData, setUserPaymentData] = useState<UserProfileData>({});
  // REMOVIDO: temporaryPaymentInfo - não mostrar dados temporários/mockados
  
  // Estados para os formulários
  const [cardData, setCardData] = useState<Card>({
    name: "",
    number: "",
    expiry: "",
    cvc: "",
    focus: ""
  });

  const [transferData, setTransferData] = useState<TransferData>({
    name: "",
    document: "",
    bank: "",
    number: "",
    digit: "",
    agency: "",
    agency_digit: ""
  });

  const { toast } = useToast();

  // Carrega informações de pagamento do usuário
  const loadPaymentInfo = async () => {
    if (!user || isLoading) return;

    try {
      setIsLoadingPaymentInfo(true);
      console.log('🔍 [PaymentPage] Carregando informações de pagamento...');
      
      // Definir dados padrão sem método de pagamento
      const paymentInfo: UserProfileData = {
        hasPaymentMethod: false,
        paymentMethod: 'Nenhum método cadastrado',
        donationAmount: 0,
        donationStatus: 'inactive',
        hasAnyDonationHistory: false
      };

      setUserPaymentData(paymentInfo);
      console.log('✅ [PaymentPage] Interface configurada sem exibir dados de pagamento');
    } catch (error) {
      console.error('❌ [PaymentPage] Erro ao carregar informações de pagamento:', error);
    } finally {
      setIsLoadingPaymentInfo(false);
    }
  };

  useEffect(() => {
    if (!user || isLoading) return;
    
    loadPaymentInfo();
    
    // Verificar tab nos parâmetros da URL
    // const tab = searchParams.get('tab');
    // if (tab && ['overview', 'method'].includes(tab)) {
    //   setActiveTab(tab);
    // }
  }, [user, isLoading, navigate]);

  // Funções auxiliares para extrair informações do método de pagamento
  const extractLastFour = (paymentMethod: string): string => {
    const match = paymentMethod.match(/\d{4}$/);
    return match ? match[0] : '';
  };

  const extractExpiryDate = (paymentMethod: string): string => {
    const match = paymentMethod.match(/(\d{2}\/\d{2})/);
    return match ? match[0] : '';
  };

  const extractBankName = (paymentMethod: string): string => {
    if (paymentMethod.includes('Itaú')) return 'Banco Itaú S.A.';
    if (paymentMethod.includes('Bradesco')) return 'Banco Bradesco S.A.';
    if (paymentMethod.includes('Santander')) return 'Banco Santander (Brasil) S.A.';
    if (paymentMethod.includes('Brasil')) return 'Banco do Brasil S.A.';
    return paymentMethod;
  };

  // Dados de doação sem mostrar informações de pagamento
  const getCurrentDonationData = (): DonationData => {
    const paymentMethod: PaymentMethod = {
      id: '1',
      type: 'credit_card',
      label: 'Nenhum método cadastrado',
      lastFour: undefined,
      expiryDate: undefined,
      bankName: undefined,
      isActive: false
    };

    return {
      id: '1',
      amount: 0,
      frequency: 'monthly',
      paymentMethod,
      nextPayment: '',
      status: 'paused'
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  };

  // Handlers para cartão de crédito
  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'number') {
      const cardValidation = valid.number(value);
      setCardType(cardValidation.card?.type);
      
      // Formatação automática do número
      const formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      setCardData(prev => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'expiry') {
      // Formatação MM/AA
      let formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      setCardData(prev => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'cvc') {
      // Limitar CVC a 4 dígitos
      const formattedValue = value.replace(/\D/g, '').slice(0, 4);
      setCardData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setCardData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCardInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setCardData(prev => ({ ...prev, focus: e.target.name as Card['focus'] }));
  };

  // Handlers para transferência bancária
  const handleTransferInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'document') {
      // Formatação CPF: 000.000.000-00
      let formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length <= 11) {
        formattedValue = formattedValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
      setTransferData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setTransferData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Função de validação para cartão de crédito
  const validateCreditCard = () => {
    const errors: any = {};
    let isValid = true;

    if (!cardData.name.trim()) {
      errors.name = 'Nome no cartão é obrigatório';
      isValid = false;
    }

    const cardValidation = valid.number(cardData.number);
    if (!cardValidation.isValid) {
      errors.number = 'Número do cartão inválido';
      isValid = false;
    }

    const expValidation = valid.expirationDate(cardData.expiry);
    if (!expValidation.isValid) {
      errors.expiry = 'Data de validade inválida (MM/AA)';
      isValid = false;
    }

    if (!cardData.cvc.match(/^\d{3,4}$/)) {
      errors.cvc = 'CVC deve ter 3 ou 4 dígitos';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Função de validação para transferência bancária
  const validateTransfer = () => {
    const errors: any = {};
    let isValid = true;

    if (!transferData.name.trim()) {
      errors.name = 'Nome é obrigatório';
      isValid = false;
    }

    if (!transferData.document.match(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) {
      errors.document = 'CPF inválido';
      isValid = false;
    }

    if (!transferData.bank) {
      errors.bank = 'Selecione um banco';
      isValid = false;
    }

    if (!transferData.agency.match(/^\d{4}$/)) {
      errors.agency = 'Agência deve ter 4 dígitos';
      isValid = false;
    }

    if (!transferData.agency_digit.match(/^\d{1}$/)) {
      errors.agency_digit = 'Dígito da agência deve ter 1 dígito';
      isValid = false;
    }

    if (!transferData.number.match(/^\d{1,10}$/)) {
      errors.number = 'Número da conta inválido';
      isValid = false;
    }

    if (!transferData.digit.match(/^\d{1}$/)) {
      errors.digit = 'Dígito da conta deve ter 1 dígito';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Atualização de cartão de crédito
  const handleCardUpdate = async () => {
    if (!validateCreditCard()) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Mapear dados conforme interface DSO
      const cardUpdateData = {
        numero: cardData.number.replace(/\s/g, ''), // Remove espaços
        mesexp: cardData.expiry.slice(0, 2), // Mês
        anoexp: cardData.expiry.slice(3, 5), // Ano
        cvc: cardData.cvc,
        ownername: cardData.name,
      };

      console.log('🔍 Atualizando cartão de crédito:', cardUpdateData);

      const response = await DSOService.changeCreditCard(cardUpdateData);
      
      console.log('✅ Cartão atualizado com sucesso:', response);
      
      toast({
        title: "Cartão atualizado!",
        description: "Seu cartão de crédito foi atualizado com sucesso.",
        variant: "default"
      });

      // Limpar formulário
      setCardData({
        number: "",
        name: "",
        expiry: "",
        cvc: "",
        focus: ""
      });

      // Cartão atualizado com sucesso - não exibir dados para evitar confusão

    } catch (error) {
      console.error('❌ Erro ao atualizar cartão:', error);
      toast({
        title: "Erro na atualização",
        description: error instanceof Error ? error.message : "Erro ao atualizar cartão de crédito",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Atualização de transferência bancária
  const handleTransferUpdate = async () => {
    if (!validateTransfer()) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Mapear dados conforme interface DSO
      const transferUpdateData = {
        payName: transferData.name,
        doc: transferData.document.replace(/\D/g, ''), // Apenas números
        bankCode: transferData.bank,
        accountNumber: transferData.number,
        payDigitaccountnumber: transferData.digit,
        branchcode: transferData.agency,
        digitBranchCode: transferData.agency_digit,
      };

      console.log('🔍 Atualizando conta bancária:', transferUpdateData);

      const response = await DSOService.changeBankAccount(transferUpdateData);
      
      console.log('✅ Conta bancária atualizada com sucesso:', response);
      
      toast({
        title: "Conta atualizada!",
        description: "Sua conta bancária foi atualizada com sucesso.",
        variant: "default"
      });

      // Limpar formulário
      setTransferData({
        name: "",
        document: "",
        bank: "",
        number: "",
        digit: "",
        agency: "",
        agency_digit: ""
      });

      // Conta bancária atualizada com sucesso - não exibir dados para evitar confusão

    } catch (error) {
      console.error('❌ Erro ao atualizar conta bancária:', error);
      toast({
        title: "Erro na atualização",
        description: error instanceof Error ? error.message : "Erro ao atualizar conta bancária",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Processar doação com cartão de crédito
  const handleCreditCardDonation = async (amount: number, type: 'sponsorship' | 'donation', frequency: 'monthly' | 'once', childId?: string) => {
    if (!validateCreditCard()) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const donationData = {
        childId,
        amount,
        type,
        frequency,
        paymentMethod: 'credit_card' as const,
        cardNumber: cardData.number.replace(/\s/g, ''),
        cardHolderName: cardData.name,
        expiryMonth: cardData.expiry.slice(0, 2),
        expiryYear: cardData.expiry.slice(3, 5),
        cvv: cardData.cvc,
      };

      console.log('🔍 Processando doação com cartão:', donationData);

      const response = await DSOService.processDonation(donationData);
      
      console.log('✅ Doação processada com sucesso:', response);
      
      toast({
        title: "Doação realizada!",
        description: `Sua ${type === 'sponsorship' ? 'apadrinhamento' : 'doação'} foi processada com sucesso.`,
        variant: "default"
      });

      // Limpar formulário
      setCardData({
        number: "",
        name: "",
        expiry: "",
        cvc: "",
        focus: ""
      });

      // Recarregar dados de pagamento
      await loadPaymentInfo();

    } catch (error) {
      console.error('❌ Erro ao processar doação:', error);
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Erro ao processar doação",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Processar doação com débito automático
  const handleBankTransferDonation = async (amount: number, type: 'sponsorship' | 'donation', frequency: 'monthly' | 'once', childId?: string) => {
    if (!validateTransfer()) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const donationData = {
        childId,
        amount,
        type,
        frequency,
        paymentMethod: 'bank_transfer' as const,
        payName: transferData.name,
        doc: transferData.document.replace(/\D/g, ''),
        bankCode: transferData.bank,
        accountNumber: transferData.number,
        payDigitaccountnumber: transferData.digit,
        branchcode: transferData.agency,
        digitBranchCode: transferData.agency_digit,
      };

      console.log('🔍 Processando doação com débito automático:', donationData);

      const response = await DSOService.processDonation(donationData);
      
      console.log('✅ Doação processada com sucesso:', response);
      
      toast({
        title: "Doação realizada!",
        description: `Sua ${type === 'sponsorship' ? 'apadrinhamento' : 'doação'} foi processada com sucesso.`,
        variant: "default"
      });

      // Limpar formulário
      setTransferData({
        name: "",
        document: "",
        bank: "",
        number: "",
        digit: "",
        agency: "",
        agency_digit: ""
      });

      // Recarregar dados de pagamento
      await loadPaymentInfo();

    } catch (error) {
      console.error('❌ Erro ao processar doação:', error);
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Erro ao processar doação",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-childfund-green"></div>
      </div>
    );
  }

  if (!user) return null;

  const currentDonationData = getCurrentDonationData();

  return (
    <LoggedLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Voltar ao Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Atualizar Pagamento</h1>
          <p className="text-gray-600">Atualize seus dados de pagamento para continuar suas doações.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Status Atual</TabsTrigger>
            <TabsTrigger value="method">Atualizar Dados</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {isLoadingPaymentInfo ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Carregando informações de pagamento...</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Status da Doação */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="text-childfund-green" size={24} />
                      Status da Doação
                    </CardTitle>
                    <CardDescription>
                      Informações sobre sua doação atual
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!userPaymentData.hasPaymentMethod ? (
                      <>
                        {/* Usuário sem método de pagamento */}
                        {userPaymentData.hasAnyDonationHistory ? (
                          // Tem histórico de doações mas não tem método ativo
                          <div className="text-center p-6 bg-amber-50 rounded-lg border border-amber-200">
                            <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Método de Pagamento Inativo
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Você já fez doações anteriormente. Para reativar suas contribuições e continuar apoiando nossas crianças, cadastre um método de pagamento.
                            </p>
                            <Button 
                              onClick={() => setActiveTab('method')}
                              className="bg-childfund-green hover:bg-childfund-green/90"
                            >
                              Reativar Doações
                            </Button>
                          </div>
                        ) : (
                          // Usuário novo sem histórico de doações
                          <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                            <Heart className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Faça sua Primeira Doação
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Comece a transformar vidas hoje. Cadastre um método de pagamento e inicie sua jornada de apoio às crianças.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <Button 
                                onClick={() => setActiveTab('method')}
                                className="bg-childfund-green hover:bg-childfund-green/90"
                              >
                                Cadastrar Método de Pagamento
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => navigate('/#apadrinhamento')}
                                className="border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white"
                              >
                                Apadrinhe uma criança
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className={`grid grid-cols-1 ${currentDonationData.nextPayment ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(currentDonationData.amount)}
                            </div>
                            <div className="text-sm text-gray-600">Valor Mensal</div>
                          </div>
                          
                          {currentDonationData.nextPayment && (
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">
                                {formatDate(currentDonationData.nextPayment)}
                              </div>
                              <div className="text-sm text-gray-600">Próximo Pagamento</div>
                            </div>
                          )}
                          
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <Badge 
                              variant={currentDonationData.status === 'active' ? 'default' : 'secondary'}
                              className="text-sm"
                            >
                              <CheckCircle size={16} className="mr-1" />
                              {currentDonationData.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <div className="text-sm text-gray-600 mt-1">Status</div>
                          </div>
                        </div>

                        {/* Método de Pagamento Atual */}
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-2">Método de Pagamento Atual</h4>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            {currentDonationData.paymentMethod.type === 'credit_card' ? (
                              <CreditCard className="text-blue-600" size={20} />
                            ) : (
                              <Building2 className="text-green-600" size={20} />
                            )}
                            <div>
                              <div className="font-medium">
                                {currentDonationData.paymentMethod.label}
                                {currentDonationData.paymentMethod.lastFour && 
                                  ` •••• ${currentDonationData.paymentMethod.lastFour}`
                                }
                              </div>
                              {currentDonationData.paymentMethod.expiryDate && (
                                <div className="text-sm text-gray-600">
                                  Vence em {currentDonationData.paymentMethod.expiryDate}
                                </div>
                              )}
                            </div>
                            <div className="ml-auto">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setActiveTab('method')}
                              >
                                Atualizar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Impacto */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="text-childfund-green" size={24} />
                      Seu Impacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-6 bg-gradient-to-r from-childfund-green/10 to-blue-50 rounded-lg">
                      {userPaymentData.hasPaymentMethod ? (
                        <>
                          <div className="text-lg font-semibold text-gray-800 mb-2">
                            Com sua doação de {formatCurrency(currentDonationData.amount)} mensais
                          </div>
                          <div className="text-gray-600">
                            Você está transformando vidas e construindo um futuro melhor para crianças em situação de vulnerabilidade.
                          </div>
                        </>
                      ) : userPaymentData.hasAnyDonationHistory ? (
                        <>
                          <div className="text-lg font-semibold text-gray-800 mb-2">
                            Obrigado por seu apoio anterior
                          </div>
                          <div className="text-gray-600">
                            Suas doações passadas já fizeram diferença na vida de crianças. Reative suas contribuições e continue esse impacto positivo.
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-lg font-semibold text-gray-800 mb-2">
                            Comece sua jornada de impacto
                          </div>
                          <div className="text-gray-600">
                            Sua primeira doação será o início de uma transformação. Cada contribuição faz a diferença na vida das crianças e jovens que precisam do seu apoio.
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Atualizar Método de Pagamento */}
          <TabsContent value="method" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Atualizar Método de Pagamento</CardTitle>
                <CardDescription>
                  Escolha o tipo de pagamento e atualize suas informações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seleção do Tipo de Pagamento */}
                <div>
                  <Label className="text-base font-semibold mb-4 block">
                    Tipo de Pagamento
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant={selectedPaymentType === 'card' ? 'default' : 'outline'}
                      className={`h-20 flex flex-col gap-2 ${
                        selectedPaymentType === 'card' 
                          ? 'bg-childfund-green hover:bg-childfund-green/90' 
                          : ''
                      }`}
                      onClick={() => setSelectedPaymentType('card')}
                    >
                      <CreditCard size={24} />
                      <span>Cartão de Crédito</span>
                    </Button>
                    
                    <Button
                      variant={selectedPaymentType === 'transfer' ? 'default' : 'outline'}
                      className={`h-20 flex flex-col gap-2 ${
                        selectedPaymentType === 'transfer' 
                          ? 'bg-childfund-green hover:bg-childfund-green/90' 
                          : ''
                      }`}
                      onClick={() => setSelectedPaymentType('transfer')}
                    >
                      <Building2 size={24} />
                      <span>Transferência Bancária</span>
                    </Button>
                  </div>
                </div>

                {/* Formulário de Cartão de Crédito */}
                {selectedPaymentType === 'card' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Formulário */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Dados do Cartão</h3>
                        
                        <div>
                          <Label htmlFor="card-name">Nome no Cartão</Label>
                          <Input
                            id="card-name"
                            name="name"
                            value={cardData.name}
                            onChange={handleCardInputChange}
                            onFocus={handleCardInputFocus}
                            placeholder="Nome como impresso no cartão"
                            className={validationErrors.name ? 'border-red-500' : ''}
                          />
                          {validationErrors.name && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors.name}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="card-number">Número do Cartão</Label>
                          <div className="relative">
                            <Input
                              id="card-number"
                              name="number"
                              value={cardData.number}
                              onChange={handleCardInputChange}
                              onFocus={handleCardInputFocus}
                              placeholder="0000 0000 0000 0000"
                              maxLength={19}
                              className={validationErrors.number ? 'border-red-500' : ''}
                            />
                            {getCardTypeIcon(cardType)}
                          </div>
                          {validationErrors.number && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors.number}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="card-expiry">Validade</Label>
                            <Input
                              id="card-expiry"
                              name="expiry"
                              value={cardData.expiry}
                              onChange={handleCardInputChange}
                              onFocus={handleCardInputFocus}
                              placeholder="MM/AA"
                              maxLength={5}
                              className={validationErrors.expiry ? 'border-red-500' : ''}
                            />
                            {validationErrors.expiry && (
                              <p className="text-sm text-red-500 mt-1">{validationErrors.expiry}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="card-cvc">CVC</Label>
                            <Input
                              id="card-cvc"
                              name="cvc"
                              value={cardData.cvc}
                              onChange={handleCardInputChange}
                              onFocus={handleCardInputFocus}
                              placeholder="123"
                              maxLength={4}
                              className={validationErrors.cvc ? 'border-red-500' : ''}
                            />
                            {validationErrors.cvc && (
                              <p className="text-sm text-red-500 mt-1">{validationErrors.cvc}</p>
                            )}
                          </div>
                        </div>

                        <Button 
                          onClick={handleCardUpdate}
                          disabled={isUpdating}
                          className="w-full bg-childfund-green hover:bg-childfund-green/90"
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Atualizando...
                            </>
                          ) : (
                            'Atualizar Cartão'
                          )}
                        </Button>
                      </div>

                      {/* Preview do Cartão */}
                      <div className="flex justify-center items-start">
                        <div className="scale-90 lg:scale-100">
                          <Cards
                            cvc={cardData.cvc}
                            expiry={cardData.expiry}
                            focused={cardData.focus}
                            name={cardData.name}
                            number={cardData.number}
                            placeholders={{
                              name: 'Seu nome aqui',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Formulário de Transferência Bancária */}
                {selectedPaymentType === 'transfer' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dados Bancários</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="transfer-name">Nome do Titular</Label>
                        <Input
                          id="transfer-name"
                          name="name"
                          value={transferData.name}
                          onChange={handleTransferInputChange}
                          placeholder="Nome completo"
                          className={validationErrors.name ? 'border-red-500' : ''}
                        />
                        {validationErrors.name && (
                          <p className="text-sm text-red-500 mt-1">{validationErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="transfer-document">CPF</Label>
                        <Input
                          id="transfer-document"
                          name="document"
                          value={transferData.document}
                          onChange={handleTransferInputChange}
                          placeholder="000.000.000-00"
                          maxLength={14}
                          className={validationErrors.document ? 'border-red-500' : ''}
                        />
                        {validationErrors.document && (
                          <p className="text-sm text-red-500 mt-1">{validationErrors.document}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="transfer-bank">Banco</Label>
                        <Select 
                          value={transferData.bank} 
                          onValueChange={(value) => setTransferData(prev => ({ ...prev, bank: value }))}
                        >
                          <SelectTrigger className={validationErrors.bank ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Selecione o banco" />
                          </SelectTrigger>
                          <SelectContent>
                            {bancos.map((banco) => (
                              <SelectItem key={banco.codigo} value={banco.codigo}>
                                {banco.codigo} - {banco.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {validationErrors.bank && (
                          <p className="text-sm text-red-500 mt-1">{validationErrors.bank}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="transfer-agency">Agência</Label>
                          <Input
                            id="transfer-agency"
                            name="agency"
                            value={transferData.agency}
                            onChange={handleTransferInputChange}
                            placeholder="0000"
                            maxLength={4}
                            className={validationErrors.agency ? 'border-red-500' : ''}
                          />
                          {validationErrors.agency && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors.agency}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="transfer-agency-digit">Dígito</Label>
                          <Input
                            id="transfer-agency-digit"
                            name="agency_digit"
                            value={transferData.agency_digit}
                            onChange={handleTransferInputChange}
                            placeholder="0"
                            maxLength={1}
                            className={validationErrors.agency_digit ? 'border-red-500' : ''}
                          />
                          {validationErrors.agency_digit && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors.agency_digit}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="transfer-number">Conta</Label>
                          <Input
                            id="transfer-number"
                            name="number"
                            value={transferData.number}
                            onChange={handleTransferInputChange}
                            placeholder="Número da conta"
                            className={validationErrors.number ? 'border-red-500' : ''}
                          />
                          {validationErrors.number && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors.number}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="transfer-digit">Dígito</Label>
                          <Input
                            id="transfer-digit"
                            name="digit"
                            value={transferData.digit}
                            onChange={handleTransferInputChange}
                            placeholder="0"
                            maxLength={1}
                            className={validationErrors.digit ? 'border-red-500' : ''}
                          />
                          {validationErrors.digit && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors.digit}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleTransferUpdate}
                      disabled={isUpdating}
                      className="w-full bg-childfund-green hover:bg-childfund-green/90"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Atualizando...
                        </>
                      ) : (
                        'Atualizar Conta Bancária'
                      )}
                    </Button>
                  </div>
                )}

                {/* Informações de Segurança */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="text-blue-600 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Segurança</h4>
                      <p className="text-sm text-blue-800">
                        Seus dados são criptografados e protegidos. Não armazenamos informações 
                        sensíveis do cartão em nossos servidores.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LoggedLayout>
  );
} 