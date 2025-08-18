import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDonation } from '@/contexts/DonationContext';
import { useAuth } from '@/contexts/AuthContext';
import { DSOService } from '@/services/DSOService';
import { HashService, TransactionData } from '@/services/HashService';
import { AnalyticsService } from '@/services/AnalyticsService';
import { CRMService } from '@/services/CRMService';
import { useToast } from '@/hooks/use-toast';
import { sendEventConversionRD } from '@/utils/rdstation/conversion';
import { DynamicsSyncService } from '@/services/DynamicsSyncService';
import { useUTMParams } from './useUTMParams';
import { toInternationalPhone } from '@/utils/formatters';

export interface PaymentProcessorOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface PaymentResult {
  success: boolean;
  message?: string;
  transactionId?: string;
  data?: any;
  error?: string; // Adicionado para suportar códigos de erro específicos
}

// ✅ CORREÇÃO: Mapear tipos conforme documentação DSO
const mapDonationType = (type: string, occurrence?: string): { donate_type: 'sponsorship' | 'donate', occurrence?: string } => {
  console.log('🔍 [mapDonationType] Input:', { type, occurrence });
  
  if (type === 'recurrent') {
    const result = { donate_type: 'sponsorship' as const, occurrence: 'recurrent' };
    console.log('🔍 [mapDonationType] Recurrent mapping:', result);
    return result;
  }
  
  const result = { donate_type: type as 'sponsorship' | 'donate' };
  console.log('🔍 [mapDonationType] Normal mapping:', result);
  return result;
};

export const usePaymentProcessor = (options: PaymentProcessorOptions = {}) => {
  const { state, setCurrentStep, resetState } = useDonation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalStage, setModalStage] = useState<'processing' | 'success' | 'error' | null>(null);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [showDebitLoginModal, setShowDebitLoginModal] = useState(false);
  const { allParams } = useUTMParams();

  const processPayment = async (
    isNewUser: boolean = false, 
    directPersonalData?: any
  ): Promise<PaymentResult> => {
    setIsProcessing(true);
    setModalStage('processing');
    setModalMessage('');

    console.log('🔍 [PAYMENT DEBUG] Iniciando processamento de pagamento:', {
      isNewUser,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userName: user?.name,
      userCpf: user?.cpf,
      userDocument: user?.document
    });

    try {
      // 🔍 DEBUG: Log do método de pagamento antes da verificação
      console.log('🔍 [PAYMENT DEBUG] Verificando método de pagamento:', {
        paymentMethod: state.data_payment_fields.paymentMethod,
        isAuthenticated,
        hasUser: !!user
      });

      // ✅ VERIFICAÇÃO CRÍTICA: Débito automático requer login  
      // Verificar tanto 'debit' quanto 'bank_transfer' para compatibilidade
      const isDebitPayment = state.data_payment_fields.paymentMethod === 'debit' || 
                            state.data_payment_fields.paymentMethod === 'bank_transfer';
      
      if (isDebitPayment && (!isAuthenticated || !user)) {
        console.log('🚨 [PAYMENT] Débito automático escolhido por usuário não logado - exibindo modal de login');
        setIsProcessing(false);
        setModalStage(null);
        setShowDebitLoginModal(true);
        
        // Retornar um resultado específico para indicar que login é necessário
        return {
          success: false,
          error: 'LOGIN_REQUIRED_FOR_DEBIT',
          data: null,
          message: 'Login necessário para débito automático'
        };
      }

      // Validar se todos os dados necessários estão presentes
      if (!state.data_donation_fields.type || !state.data_donation_fields.value) {
        throw new Error('Dados da doação incompletos');
      }

      if (!state.data_payment_fields.paymentMethod) {
        throw new Error('Método de pagamento não selecionado');
      }

      // 🔧 CORREÇÃO: Usar dados diretos se fornecidos, senão usar contexto
      const personalData = directPersonalData || (isNewUser ? {
        email: state.data_user_fields.email,
        name: state.data_user_fields.name,
        document: state.data_user_fields.document,
        phone: state.data_user_fields.phone,
        postalCode: state.data_user_fields.postalCode,
        street: state.data_user_fields.street,
        number: state.data_user_fields.number,
        complement: state.data_user_fields.complement,
        neighborhood: state.data_user_fields.neighborhood,
        city: state.data_user_fields.city,
        state: state.data_user_fields.state
      } : {
        email: user?.email || '',
        name: user?.name || '',
        document: user?.cpf || user?.document || '',
        phone: user?.phone || ''
      });

      // Validar dados pessoais com logs detalhados
      console.log('🔍 [PAYMENT DEBUG] Validando dados pessoais:', {
        hasEmail: !!personalData.email,
        hasName: !!personalData.name,
        hasDocument: !!personalData.document,
        isNewUser,
        email: personalData.email || 'VAZIO',
        name: personalData.name || 'VAZIO',
        document: personalData.document || 'VAZIO',
        fullPersonalData: personalData
      });

      const missingFields = [];
      if (!personalData.email) missingFields.push('email');
      if (!personalData.name) missingFields.push('name');
      if (!personalData.document) missingFields.push('document');

      if (missingFields.length > 0) {
        const errorMessage = `Dados pessoais incompletos. Campos faltando: ${missingFields.join(', ')}`;
        console.error('❌ [PAYMENT ERROR] Validação falhou:', errorMessage);
        throw new Error(errorMessage);
      }

      // Preparar dados da doação
      const donationData = {
        donationType: state.data_donation_fields.type,
        amount: state.data_donation_fields.value,
        childId: state.data_donation_fields.childId
      };

      // DEBUG: Log para verificar o tipo de doação
      console.log('🔍 PAGAMENTO DEBUG - Dados da doação:', {
        donationType: donationData.donationType,
        type_from_donation_fields: state.data_donation_fields.type,
        type_from_payment_fields: state.data_payment_fields.donate_type,
        childId: donationData.childId,
        amount: donationData.amount
      });

      // Processar pagamento baseado no método
      let result: PaymentResult;

      if (state.data_payment_fields.paymentMethod === 'credit_card') {
        result = await processCreditCardPayment(personalData, donationData, isNewUser);
      } else if (state.data_payment_fields.paymentMethod === 'debit' || state.data_payment_fields.paymentMethod === 'bank_transfer') {
        result = await processBankTransferPayment(personalData, donationData);
      } else {
        throw new Error('Método de pagamento inválido');
      }

      if (result.success) {
        // Gerar hash de segurança para a transação
        // BUGFIX: Usar o tipo original da doação, não o que o DSO retorna
        const originalDonationType = state.data_donation_fields.type as 'sponsorship' | 'donate' | 'recurrent';
        
        const transactionData: TransactionData = {
          transactionId: result.transactionId || result.data?.id || `tx_${Date.now()}`,
          donationType: originalDonationType, // USAR O TIPO ORIGINAL, não o da resposta do DSO
          amount: donationData.amount,
          paymentMethod: state.data_payment_fields.paymentMethod || 'credit_card',
          userId: user?.id,
          childId: donationData.childId,
          timestamp: Date.now()
        };

        console.log('🔍 PAGAMENTO DEBUG - TransactionData criado:', {
          donationType: transactionData.donationType,
          originalFromDonationFields: originalDonationType,
          donationDataType: donationData.donationType,
          resultDataType: result.data?.donationType || 'não informado'
        });

        const hash = HashService.generateTransactionHash(transactionData);

        // Track analytics
        AnalyticsService.trackDonationSuccess({
          transactionId: transactionData.transactionId,
          donationType: transactionData.donationType,
          amount: transactionData.amount,
          paymentMethod: transactionData.paymentMethod,
          childId: donationData.childId,
          userId: transactionData.userId
        });

        // Track CRM conversion
        await CRMService.trackConversion({
          event_type: 'form_complete',
          user_id: transactionData.userId,
          form_type: `donation_${transactionData.donationType}`,
          amount: transactionData.amount,
          child_id: transactionData.childId,
          metadata: {
            transaction_id: transactionData.transactionId,
            payment_method: transactionData.paymentMethod,
            success: true
          }
        });

        // Track RD Station conversion
        try {
          const eventType = getRDStationEventType(transactionData.donationType)
          await sendEventConversionRD(
            eventType,
            personalData.email, // Usar email dos dados pessoais
            {
              cf_valor: transactionData.amount.toString(),
              cf_form_type: `donation_${transactionData.donationType}`,
              cf_child_id: transactionData.childId,
              name: personalData.name,
              mobile_phone: personalData.phone,
              state: personalData.state,
              city: personalData.city
            }
          )
          console.log('✅ [RD Station] Conversão enviada com sucesso')
        } catch (rdError) {
          console.warn('⚠️ [RD Station] Erro ao enviar conversão:', rdError)
        }

        // 🔄 NOVA INTEGRAÇÃO: Sincronizar com Dynamics CRM
        try {
          console.log('🔄 [Dynamics Sync] Iniciando sincronização automática...')
          
          const syncResult = await DynamicsSyncService.syncContactAfterPayment(
            personalData,
            {
              donationType: transactionData.donationType,
              amount: transactionData.amount,
              paymentMethod: transactionData.paymentMethod,
              childId: transactionData.childId,
              pay_duo_date: state.data_payment_fields.pay_duo_date
            },
            {
              utm_source: allParams.utm_source,
              utm_medium: allParams.utm_medium,
              utm_campaign: allParams.utm_campaign,
              utm_content: allParams.utm_content,
              utm_term: allParams.utm_term,
              worker: state.data_payment_fields.worker
            },
            transactionData.transactionId
          )
          
          if (syncResult.success) {
            console.log('✅ [Dynamics Sync] Sincronização realizada com sucesso. Contact ID:', syncResult.contactId)
          } else {
            console.warn('⚠️ [Dynamics Sync] Erro na sincronização:', syncResult.error)
            // Não falhar o pagamento por erro de sincronização
          }
        } catch (syncError) {
          console.warn('⚠️ [Dynamics Sync] Erro crítico na sincronização:', syncError)
          // Não falhar o pagamento por erro de sincronização
        }

        // Gerar URL de sucesso
        const successUrl = HashService.generateSuccessUrl(
          transactionData.donationType,
          hash,
          true
        );

        // Mostrar modal de sucesso
        setModalStage('success');

        // Toast de sucesso
        toast({
          title: "Doação processada com sucesso!",
          description: "Redirecionando para página de confirmação...",
          variant: "default"
        });

        // Resetar estado da doação
        resetState();

        // Redirecionar para página de sucesso após mostrar modal de sucesso
        setTimeout(() => {
          setModalStage(null);
          navigate(successUrl);
        }, 2500); // Tempo para mostrar o modal de sucesso

        options.onSuccess?.();
      } else {
        throw new Error(result.message || 'Erro ao processar pagamento');
      }

      return result;

    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      
      const errorMessage = error.message || "Houve um erro ao processar sua doação. Tente novamente.";
      
      // Mostrar modal de erro
      setModalStage('error');
      setModalMessage(errorMessage);
      
      toast({
        title: "Erro no processamento",
        description: errorMessage,
        variant: "destructive"
      });

      options.onError?.(errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const processCreditCardPayment = async (
    personalData: any, 
    donationData: any, 
    isNewUser: boolean
  ): Promise<PaymentResult> => {
    // Para novos usuários, usar userOrderGenerator (APENAS CARTÃO)
    if (isNewUser) {
      // Dados base obrigatórios
      const baseData = {
        // Dados pessoais obrigatórios
        email: personalData.email || '',
        name: personalData.name || '',
        document: personalData.document || '', // BUGFIX: era personalData.cpf, mas deve ser .document
        phone: toInternationalPhone(personalData.phone || ''), // 🔧 CORREÇÃO: Formato internacional para API DSO
        address: personalData.street || personalData.address || '', // BUGFIX: suporte para ambos os formatos
        addressNumber: personalData.number || '0', // Nunca pode ser vazio
        addressComplement: personalData.complement || '', // Campo opcional mas deve existir
        neighborhood: personalData.neighborhood || '',
        city: personalData.city || '',
        state: personalData.state || '',
        cep: personalData.postalCode || personalData.cep || '', // BUGFIX: suporte para ambos os formatos
        country: 'BR',
        gender: 'M' as const, // ⚠️ TODO: Coletar gênero real do usuário
        birthDate: '1990-01-01', // ⚠️ TODO: Coletar data de nascimento real do usuário
        type_document: 'cpf' as const,
        
        // Dados da doação
        ...mapDonationType(donationData.donationType),
        value: donationData.amount,
        region: 1, // Campo obrigatório conforme API DSO
        
        // Adicionar child_id apenas para apadrinhamento/recorrente conforme documentação
        ...(donationData.donationType !== 'donate' && donationData.childId ? {
          child_id: donationData.childId
        } : {})
      };

      // Adicionar dados de pagamento condicionalmente
      const userOrderData: any = { ...baseData };
      
      if (state.data_payment_fields.paymentMethod === 'credit_card') {
        userOrderData.paymentMethod = 'credit_card';
        userOrderData.credit_card = {
          ownername: state.data_payment_fields.cardName || '',
          numero: state.data_payment_fields.cardNumber?.replace(/\s/g, '') || '',
          mesexp: state.data_payment_fields.expiryMonth || '',
          anoexp: state.data_payment_fields.expiryYear || '',
          cvc: state.data_payment_fields.cvv || ''
        };
        userOrderData.pay_duo_date = state.data_payment_fields.pay_duo_date || '05';
      } else {
        // Para débito automático - usar userOrderGenerator com dados de débito
        userOrderData.paymentMethod = 'debit';
        userOrderData.pay_name = personalData.name;
        userOrderData.pay_doc = personalData.document;
        userOrderData.pay_bankcode = state.data_payment_fields.bankCode;
        userOrderData.pay_accountnumber = state.data_payment_fields.account;
        userOrderData.pay_digitaccountnumber = state.data_payment_fields.accountDigit || '0';
        userOrderData.pay_branchcode = state.data_payment_fields.agency;
        userOrderData.pay_digitbranchcode = state.data_payment_fields.agencyDigit || '0';
        userOrderData.pay_type = 'debit';
        userOrderData.pay_duo_date = state.data_payment_fields.pay_duo_date || '05';
      }
      
      console.log('🔍 PAGAMENTO DEBUG - userOrderData enviado para DSO (COMPLETO):', JSON.stringify(userOrderData, null, 2));
      
      // 🔍 DEBUG: Validação específica de campos obrigatórios conforme documentação DSO
      const camposObrigatorios = [
        'email', 'name', 'document', 'phone', 'address', 'addressNumber', 
        'neighborhood', 'city', 'state', 'cep', 'country', 'gender', 
        'birthDate', 'type_document', 'donate_type', 'value', 'region'
      ];
      
      const camposFaltando = camposObrigatorios.filter(campo => !userOrderData[campo]);
      if (camposFaltando.length > 0) {
        console.error('❌ [PAYMENT ERROR] Campos obrigatórios faltando:', camposFaltando);
        console.error('❌ [PAYMENT ERROR] Valores atuais dos campos:', camposObrigatorios.reduce((acc, campo) => {
          acc[campo] = userOrderData[campo] || 'VAZIO/UNDEFINED';
          return acc;
        }, {} as any));
      }
      
      // Validação específica para debug
      console.log('🔍 VALIDAÇÃO DSO - Campos críticos:', {
        email: userOrderData.email,
        name: userOrderData.name,
        document: userOrderData.document,
        phone: userOrderData.phone,
        donate_type: userOrderData.donate_type,
        value: userOrderData.value,
        region: userOrderData.region,
        paymentMethod: userOrderData.paymentMethod,
        gender: userOrderData.gender,
        birthDate: userOrderData.birthDate,
        type_document: userOrderData.type_document,
        country: userOrderData.country,
        address: userOrderData.address,
        city: userOrderData.city,
        state: userOrderData.state,
        cep: userOrderData.cep
      });
      
      return await DSOService.userOrderGenerator(userOrderData);
    } else {
      // Para usuários logados, usar generatorOrders (assumindo que já tem conta)
      const orderData: any = {
        ...mapDonationType(donationData.donationType),
        paymentMethod: 'credit_card' as const,
        installments: 1,
        value: donationData.amount,
        ownername: state.data_payment_fields.cardName,
        numero: state.data_payment_fields.cardNumber?.replace(/\s/g, '') || '',
        mesexp: state.data_payment_fields.expiryMonth,
        anoexp: state.data_payment_fields.expiryYear,
        cvc: state.data_payment_fields.cvv,
        region: 1, // Campo obrigatório conforme API
        pay_duo_date: state.data_payment_fields.pay_duo_date || '05', // Dia de cobrança
        
        // Adicionar childid apenas para apadrinhamento/recorrente
        ...(donationData.donationType !== 'donate' && donationData.childId ? {
          childid: donationData.childId
        } : {})
      };
      
      console.log('🔍 PAGAMENTO DEBUG - orderData enviado para DSO (usuário logado):', {
        donate_type: orderData.donate_type,
        childid: orderData.childid || 'REMOVIDO_DOACAO_UNICA',
        value: orderData.value,
        paymentMethod: orderData.paymentMethod,
        region: orderData.region,
        isNewUser: false
      });
      
      return await DSOService.generatorOrders(orderData);
    }
  };

  const processBankTransferPayment = async (
    personalData: any, 
    donationData: any
  ): Promise<PaymentResult> => {

    console.log('🔍 [BANK TRANSFER] Verificando se é usuário novo ou logado:', {
      isAuthenticated,
      hasUser: !!user,
      userEmail: user?.email
    });

    // ✅ CORREÇÃO CRÍTICA: Usar endpoint correto baseado no status de autenticação
    // - Usuário logado: /api/v1/childfund/payment/debit (com token)
    // - Usuário novo: /api/v1/user-order-generator (sem token, cria usuário + processa pagamento)
    if (!isAuthenticated || !user) {
      console.log('🔍 [BANK TRANSFER] Usuário não logado - usando userOrderGenerator');
      
      // Usar userOrderGenerator para débito de usuários novos
      const userOrderData = {
        // Dados pessoais obrigatórios
        email: personalData.email || '',
        name: personalData.name || '',
        document: (personalData.document || '').replace(/\D/g, ''), // Remove formatação CPF
        phone: toInternationalPhone(personalData.phone || ''),
        address: personalData.street || personalData.address || '',
        addressNumber: personalData.number || personalData.addressNumber || '0', // Nunca pode ser vazio
        addressComplement: personalData.complement || personalData.addressComplement || '',
        neighborhood: personalData.neighborhood || '',
        city: personalData.city || '',
        state: personalData.state || '',
        cep: (personalData.postalCode || personalData.cep || '').replace(/\D/g, ''), // Remove formatação CEP
        country: 'BR',
        gender: 'M' as const,
        birthDate: '1990-01-01',
        type_document: 'cpf' as const,
        
        // ✅ CORREÇÃO: Dados da doação conforme documentação DSO (orderDebit)
        donate_type: mapDonationType(donationData.donationType).donate_type,
        ...(mapDonationType(donationData.donationType).occurrence ? { 
          occurrence: mapDonationType(donationData.donationType).occurrence 
        } : {}),
        value: donationData.amount,
        region: 1,
        
        // ✅ Array childs VAZIO para doação única conforme documentação DSO
        childs: donationData.donationType !== 'donate' && donationData.childId ? [donationData.childId] : [],
        
        // ✅ Campo paymentMethod obrigatório
        paymentMethod: 'debit' as const,
        
        pay_name: personalData.name || '',
        pay_doc: (personalData.document || '').replace(/\D/g, ''), // Remove formatação CPF consistente
        pay_bankcode: state.data_payment_fields.bankCode || '',
        pay_accountnumber: state.data_payment_fields.account || '',
        pay_digitaccountnumber: state.data_payment_fields.accountDigit || '0',
        pay_branchcode: state.data_payment_fields.agency || '',
        pay_digitbranchcode: state.data_payment_fields.agencyDigit || '0',
        pay_duo_date: state.data_payment_fields.pay_duo_date || '20', // Padrão 20 conforme documentação
        pay_type: 'debit' as const,
        pay_value: donationData.amount || 0,
        worker: '' // Campo worker conforme documentação
      };

      console.log('🔍 [BANK TRANSFER] Enviando via userOrderGenerator para usuário novo:', userOrderData);
      
      // 🔍 DEBUG: Validação completa antes do envio para identificar campos undefined
      console.log('🔍 [DEBUG userOrderGenerator] Validação de campos obrigatórios:');
      const fieldsToCheck = [
        'email', 'name', 'document', 'phone', 'address', 'addressNumber', 
        'neighborhood', 'city', 'state', 'cep', 'pay_bankcode', 'pay_accountnumber', 
        'pay_branchcode', 'donate_type', 'value'
      ];
      
      fieldsToCheck.forEach(field => {
        const value = userOrderData[field];
        if (value === undefined || value === null || value === '') {
          console.warn(`⚠️ [DEBUG] Campo ${field} está vazio:`, value);
        } else {
          console.log(`✅ [DEBUG] Campo ${field}:`, value);
        }
      });
      
      return await DSOService.userOrderGenerator(userOrderData);
    }

    // ✅ Para usuários logados, usar endpoint de débito com token
    console.log('🔍 [BANK TRANSFER] Usuário logado - usando childfundPaymentDebit');
    
    const paymentData: any = {
      ...mapDonationType(donationData.donationType),
      pay_name: personalData.name || user?.name || '',
      pay_doc: (personalData.document || user?.cpf || '').replace(/\D/g, ''), // Remove formatação
      pay_bankcode: state.data_payment_fields.bankCode || '',
      pay_accountnumber: state.data_payment_fields.account || '',
      pay_digitaccountnumber: state.data_payment_fields.accountDigit || '0',
      pay_branchcode: state.data_payment_fields.agency || '',
      pay_digitbranchcode: state.data_payment_fields.agencyDigit || '0',
      pay_duo_date: state.data_payment_fields.pay_duo_date || '20', // Padrão 20 conforme documentação
      pay_type: 'debit' as const,
      pay_value: donationData.amount || 0,
      worker: '', // Campo worker conforme documentação
      
      // ✅ Array childs sempre correto
      childs: donationData.donationType === 'donate' ? [] : 
              (donationData.childId ? [donationData.childId] : [])
    };

    console.log('🔍 PAGAMENTO DEBUG - Bank Transfer enviando para DSO (usuário logado):', {
      donate_type: paymentData.donate_type,
      originalDonationType: donationData.donationType,
      childs: paymentData.childs || 'REMOVIDO_DOACAO_UNICA',
      childId: donationData.childId,
      value: donationData.amount
    });

    const result = await DSOService.childfundPaymentDebit(paymentData);
    
    console.log('🔍 PAGAMENTO DEBUG - Resposta do DSO Bank Transfer:', {
      success: result.success,
      donationType: result.data?.donationType || 'não informado',
      originalType: donationData.donationType
    });

    return result;
  };

  const validatePaymentData = (): boolean => {
    // Validar dados da doação
    if (!state.data_donation_fields.type || !state.data_donation_fields.value) {
      return false;
    }

    // Validar método de pagamento
    if (!state.data_payment_fields.paymentMethod) {
      return false;
    }

    // Validar dados específicos do método de pagamento
    if (state.data_payment_fields.paymentMethod === 'credit_card') {
      return !!(
        state.data_payment_fields.cardNumber &&
        state.data_payment_fields.cardName &&
        state.data_payment_fields.expiryMonth &&
        state.data_payment_fields.expiryYear &&
        state.data_payment_fields.cvv
      );
    } else if (state.data_payment_fields.paymentMethod === 'debit' || state.data_payment_fields.paymentMethod === 'bank_transfer') {
      return !!(
        state.data_payment_fields.bankCode &&
        state.data_payment_fields.agency &&
        state.data_payment_fields.account &&
        state.data_payment_fields.accountType
      );
    }

    return false;
  };

  const getPaymentSummary = () => {
    return {
      type: state.data_donation_fields.type,
      value: state.data_donation_fields.value,
      method: state.data_payment_fields.paymentMethod,
      childId: state.data_donation_fields.childId,
      isRecurring: state.data_donation_fields.type !== 'donate'
    };
  };

  const closeModal = () => {
    setModalStage(null);
    setModalMessage('');
  };

  const closeDebitLoginModal = () => {
    setShowDebitLoginModal(false);
  };

  const onDebitLoginSuccess = () => {
    setShowDebitLoginModal(false);
    // Não precisamos fazer nada especial aqui, o usuário pode tentar o pagamento novamente
    toast({
      title: "Login realizado!",
      description: "Agora você pode prosseguir com o débito automático.",
    });
  };

  return {
    processPayment,
    isProcessing,
    validatePaymentData,
    getPaymentSummary,
    // Estados do modal de pagamento
    modalStage,
    modalMessage,
    closeModal,
    // Estados do modal de login para débito
    showDebitLoginModal,
    closeDebitLoginModal,
    onDebitLoginSuccess
  };
};

// Função para mapear tipos de doação para eventos RD Station
const getRDStationEventType = (donationType: string): string => {
  switch (donationType) {
    case 'sponsorship':
      return 'Apadrinhamento'
    case 'recurrent':
      return 'Doação Recorrente'
    case 'donate':
      return 'Doação Única'
    default:
      return 'Doação'
  }
}