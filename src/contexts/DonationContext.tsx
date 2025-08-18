import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PersonalData, CreditCardData, BankTransferData, DonationData } from '@/types/DSO';

// Tipos para o sistema de estado global
export type DonationStep = 'value' | 'data' | 'payment' | 'success';
export type PaymentMethod = 'credit_card' | 'debit' | 'bank_transfer';

interface DonationState {
  // Dados pessoais do usuário
  data_user_fields: PersonalData;
  
  // Dados dos métodos de pagamento
  data_payment_fields: {
    // Cartão de crédito
    credit_card: CreditCardData;
    
    // Débito automático
    debit: BankTransferData;
    
    // Comum aos dois
    pay_duo_date: string;
    paymentMethod: PaymentMethod;
    method?: PaymentMethod; // Alias for paymentMethod
    value: number;
    donate_type: 'sponsorship' | 'donate';
    child_id: string[];
    worker?: string;
    // Aliases for card data access
    cardNumber?: string;
    cardName?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    // Aliases for bank data access
    bankCode?: string;
    agency?: string;
    agencyDigit?: string;
    account?: string;
    accountDigit?: string;
    accountType?: string;
  };
  
  // Dados da doação/apadrinhamento
  data_donation_fields: DonationData;
  
  // Estado do fluxo
  currentStep: DonationStep;
  isUserLoggedIn: boolean;
}

interface DonationContextType {
  state: DonationState;
  updateUserFields: (fields: Partial<PersonalData>) => void;
  updatePaymentFields: (fields: Partial<DonationState['data_payment_fields']>) => void;
  updateDonationFields: (fields: Partial<DonationData>) => void;
  setCurrentStep: (step: DonationStep) => void;
  setUserLoggedIn: (isLoggedIn: boolean) => void;
  resetState: () => void;
  isStepValid: (step: DonationStep) => boolean;
  // Funções de conveniência
  setDonationType: (type: 'sponsorship' | 'donate' | 'recurrent') => void;
  setDonationValue: (value: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setChildId: (childId: string) => void;
  // Novas funções para compatibilidade
  setPersonalData: (data: any) => void;
  setPaymentData: (data: any) => void;
}

// Estado inicial
const initialState: DonationState = {
  data_user_fields: {
    name: '',
    email: '',
    document: '',
    phone: '',
    birthDate: '',
    gender: 'M',
    address: '',
    addressNumber: '',
    addressComplement: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
    country: 'BR',
    profession: '',
    pronouns: ''
  },
  data_payment_fields: {
    credit_card: {
      ownername: '',
      numero: '',
      mesexp: '',
      anoexp: '',
      cvc: ''
    },
    debit: {
      pay_name: '',
      pay_doc: '',
      pay_bankcode: '',
      pay_accountnumber: '',
      pay_digitaccountnumber: '',
      pay_branchcode: '',
      pay_digitbranchcode: ''
    },
    pay_duo_date: '05',
    paymentMethod: 'credit_card',
    value: 0,
    donate_type: 'sponsorship',
    child_id: [],
    worker: ''
  },
  data_donation_fields: {
    type: 'sponsorship',
    value: 74,
    childId: '',
    occurrence: '',
    collaborator: '',
    campaign: '',
    paymentMethod: 'credit_card',
    pay_duo_date: '05'
  },
  currentStep: 'value',
  isUserLoggedIn: false
};

const DonationContext = createContext<DonationContextType | undefined>(undefined);

interface DonationProviderProps {
  children: ReactNode;
}

export function DonationProvider({ children }: DonationProviderProps) {
  const [state, setState] = useState<DonationState>(() => {
    // Tentar recuperar estado do localStorage se existir
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('childfund-donation-state');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          return { ...initialState, ...parsed };
        } catch (error) {
          console.warn('Erro ao recuperar estado da doação do localStorage:', error);
        }
      }
    }
    return initialState;
  });

  // Salvar estado no localStorage sempre que mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('childfund-donation-state', JSON.stringify(state));
    }
  }, [state]);

  const updateUserFields = useCallback((fields: Partial<PersonalData>) => {
    setState(prev => ({
      ...prev,
      data_user_fields: {
        ...prev.data_user_fields,
        ...fields
      }
    }));
  }, []);

  const updatePaymentFields = useCallback((fields: Partial<DonationState['data_payment_fields']>) => {
    setState(prev => ({
      ...prev,
      data_payment_fields: {
        ...prev.data_payment_fields,
        ...fields
      }
    }));
  }, []);

  const updateDonationFields = useCallback((fields: Partial<DonationData>) => {
    setState(prev => ({
      ...prev,
      data_donation_fields: {
        ...prev.data_donation_fields,
        ...fields
      }
    }));
  }, []);

  const setCurrentStep = useCallback((step: DonationStep) => {
    setState(prev => ({
      ...prev,
      currentStep: step
    }));
  }, []);

  const setUserLoggedIn = useCallback((isLoggedIn: boolean) => {
    setState(prev => ({
      ...prev,
      isUserLoggedIn: isLoggedIn
    }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('childfund-donation-state');
    }
  }, []);

  // Validações por etapa
  const isStepValid = useCallback((step: DonationStep): boolean => {
    switch (step) {
      case 'value':
        return state.data_donation_fields.value > 0;
      
      case 'data':
        if (state.isUserLoggedIn) {
          return true; // Usuário logado já tem dados
        }
        const userData = state.data_user_fields;
        return !!(
          userData.name &&
          userData.email &&
          userData.document &&
          userData.phone &&
          userData.birthDate &&
          userData.gender &&
          userData.address &&
          userData.addressNumber &&
          userData.neighborhood &&
          userData.city &&
          userData.state &&
          userData.cep &&
          userData.country
        );
      
      case 'payment':
        const paymentData = state.data_payment_fields;
        if (paymentData.paymentMethod === 'credit_card') {
          const cardData = paymentData.credit_card;
          return !!(
            cardData.ownername &&
            cardData.numero &&
            cardData.mesexp &&
            cardData.anoexp &&
            cardData.cvc
          );
        } else {
          const debitData = paymentData.debit;
          return !!(
            debitData.pay_name &&
            debitData.pay_doc &&
            debitData.pay_bankcode &&
            debitData.pay_accountnumber &&
            debitData.pay_digitaccountnumber &&
            debitData.pay_branchcode &&
            debitData.pay_digitbranchcode
          );
        }
      
      case 'success':
        return true;
      
      default:
        return false;
    }
  }, [state]);

  // Funções de conveniência
  const setDonationType = useCallback((type: 'sponsorship' | 'donate' | 'recurrent') => {
    // BUGFIX: Manter consistência entre todos os campos de tipo de doação
    const mappedType = type === 'recurrent' ? 'sponsorship' : type;
    
    console.log('🔍 DEBUG: setDonationType chamado', { 
      input: type, 
      mappedType, 
      willUpdate: { donation_fields: type, payment_fields: mappedType }
    });
    
    updateDonationFields({ type });
    updatePaymentFields({ donate_type: mappedType });
  }, [updateDonationFields, updatePaymentFields]);

  const setDonationValue = useCallback((value: number) => {
    updateDonationFields({ value });
    updatePaymentFields({ value });
  }, [updateDonationFields, updatePaymentFields]);

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    updatePaymentFields({ paymentMethod: method });
    updateDonationFields({ paymentMethod: method });
  }, [updatePaymentFields, updateDonationFields]);

  const setChildId = useCallback((childId: string) => {
    updateDonationFields({ childId });
    updatePaymentFields({ child_id: childId ? [childId] : [] });
  }, [updateDonationFields, updatePaymentFields]);

  // Novas funções para compatibilidade com novos formulários
  const setPersonalData = useCallback((data: any) => {
    // Mapear novos campos para estrutura existente
    const mappedData: Partial<PersonalData> = {
      name: data.name || '',
      email: data.email || '',
      document: data.document || '',
      phone: data.phone || '',
      // Mapear campos de endereço
      cep: data.postalCode || '',
      address: data.street || '',
      addressNumber: data.number || '',
      addressComplement: data.complement || '',
      neighborhood: data.neighborhood || '',
      city: data.city || '',
      state: data.state || ''
    };
    updateUserFields(mappedData);
  }, [updateUserFields]);

  const setPaymentData = useCallback((data: any) => {
    console.log('🔍 DEBUG: setPaymentData chamado com:', data);
    
    if (data.method === 'credit_card') {
      updatePaymentFields({
        paymentMethod: 'credit_card',
        credit_card: {
          ownername: data.cardName || '',
          numero: data.cardNumber || '',
          mesexp: data.expiryMonth || '',
          anoexp: data.expiryYear || '',
          cvc: data.cvv || ''
        }
      });
    } else if (data.method === 'bank_transfer') {
      updatePaymentFields({
        paymentMethod: 'debit',
        debit: {
          pay_name: data.accountType === 'checking' ? 'Conta Corrente' : 'Conta Poupança',
          pay_doc: '',
          pay_bankcode: data.bankCode || '',
          pay_accountnumber: data.account || '',
          pay_digitaccountnumber: '',
          pay_branchcode: data.agency || '',
          pay_digitbranchcode: ''
        }
      });
    }
  }, [updatePaymentFields]);

  const contextValue: DonationContextType = {
    state,
    updateUserFields,
    updatePaymentFields,
    updateDonationFields,
    setCurrentStep,
    setUserLoggedIn,
    resetState,
    isStepValid,
    setDonationType,
    setDonationValue,
    setPaymentMethod,
    setChildId,
    setPersonalData,
    setPaymentData
  };

  return (
    <DonationContext.Provider value={contextValue}>
      {children}
    </DonationContext.Provider>
  );
}

export function useDonation() {
  const context = useContext(DonationContext);
  if (context === undefined) {
    throw new Error('useDonation deve ser usado dentro de um DonationProvider');
  }
  return context;
}

// Hook para detectar usuário logado
export function useDonationAuth() {
  const { state, setUserLoggedIn } = useDonation();
  
  useEffect(() => {
    // Verificar se há usuário logado no AuthContext
    const checkAuthStatus = () => {
      // Verificar localStorage ou contexto de autenticação
      const authData = localStorage.getItem('childfund-auth-data');
      const isLoggedIn = !!(authData && JSON.parse(authData)?.token);
      setUserLoggedIn(isLoggedIn);
    };

    checkAuthStatus();
    
    // Escutar mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'childfund-auth-data') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setUserLoggedIn]);

  return state.isUserLoggedIn;
}