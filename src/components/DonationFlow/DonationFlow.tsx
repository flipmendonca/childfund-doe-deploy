import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDonation, useDonationAuth } from '@/contexts/DonationContext';
import NewUserFlow from './NewUserFlow';
import LoggedUserFlow from './LoggedUserFlow';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface DonationFlowProps {
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

export default function DonationFlow({ 
  initialMode = null, 
  initialValue,
  childData 
}: DonationFlowProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { state, setDonationType, setDonationValue, setChildId } = useDonation();
  const isUserLoggedIn = useDonationAuth();

  // Configurar dados iniciais baseados nas props
  useEffect(() => {
    if (initialMode) {
      setDonationType(initialMode);
    }
    
    if (initialValue) {
      setDonationValue(initialValue);
    }
    
    if (childData?.id) {
      setChildId(childData.id);
    }
  }, [initialMode, initialValue, childData, setDonationType, setDonationValue, setChildId]);

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-childfund-green" />
          <p className="text-gray-600">Verificando seu status de login...</p>
        </motion.div>
      </div>
    );
  }

  console.log('🔍 [DonationFlow] Estado atual:', {
    isUserLoggedIn,
    hasUser: !!user,
    userEmail: user?.email,
    donationType: state.data_donation_fields.type,
    donationValue: state.data_donation_fields.value,
    currentStep: state.currentStep
  });

  // Determinar qual fluxo usar baseado no status de login
  if (!isUserLoggedIn || !user) {
    console.log('🔄 [DonationFlow] Renderizando fluxo para usuário NOVO');
    return (
      <NewUserFlow 
        initialMode={initialMode}
        initialValue={initialValue}
        childData={childData}
      />
    );
  } else {
    console.log('🔄 [DonationFlow] Renderizando fluxo para usuário LOGADO');
    return (
      <LoggedUserFlow 
        initialMode={initialMode}
        initialValue={initialValue}
        childData={childData}
      />
    );
  }
}