import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocalDonation {
  id: string;
  date: string;
  amount: number;
  type: 'single' | 'monthly' | 'sponsorship';
  status: 'completed' | 'pending';
  description: string;
  paymentMethod: string;
}

interface LocalDonationsContextType {
  localDonations: LocalDonation[];
  addDonation: (donation: Omit<LocalDonation, 'id' | 'date'>) => void;
  clearDonations: () => void;
  clearDonationsForUser: (userId: string) => void;
  currentUserId: string | null;
  updateUserId: (userId: string | null) => void;
}

const LocalDonationsContext = createContext<LocalDonationsContextType | undefined>(undefined);

export function LocalDonationsProvider({ children }: { children: ReactNode }) {
  const [localDonations, setLocalDonations] = useState<LocalDonation[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Método para atualizar userId (será chamado pelo AuthContext)
  const updateUserId = (userId: string | null) => {
    if (userId !== currentUserId) {
      console.log('🔄 LocalDonations: Usuário mudou de', currentUserId, 'para', userId);
      setCurrentUserId(userId);
      
      if (userId) {
        loadDonationsForUser(userId);
      } else {
        setLocalDonations([]);
        console.log('🔄 LocalDonations: Usuário deslogado, limpando doações');
      }
    }
  };

  const loadDonationsForUser = (userId: string) => {
    const storageKey = `childfund-local-donations-${userId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const donations = JSON.parse(stored);
        setLocalDonations(donations);
        console.log(`✅ Doações locais carregadas para usuário ${userId}:`, donations);
      } catch (error) {
        console.warn(`⚠️ Erro ao carregar doações locais para usuário ${userId}:`, error);
        setLocalDonations([]);
      }
    } else {
      setLocalDonations([]);
      console.log(`ℹ️ Nenhuma doação local encontrada para usuário ${userId}`);
    }
  };

  // Salvar no localStorage sempre que as doações mudarem
  useEffect(() => {
    if (currentUserId && localDonations.length > 0) {
      const storageKey = `childfund-local-donations-${currentUserId}`;
      localStorage.setItem(storageKey, JSON.stringify(localDonations));
      console.log(`💾 Doações locais salvas para usuário ${currentUserId}:`, localDonations);
    }
  }, [localDonations, currentUserId]);

  const addDonation = (donation: Omit<LocalDonation, 'id' | 'date'>) => {
    const newDonation: LocalDonation = {
      ...donation,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
    };
    
    setLocalDonations(prev => [newDonation, ...prev]); // Mais recentes primeiro
    console.log('✅ Nova doação adicionada localmente:', newDonation);
  };

  const clearDonations = () => {
    setLocalDonations([]);
    localStorage.removeItem('childfund-local-donations');
    console.log('🗑️ Doações locais removidas');
  };

  const clearDonationsForUser = (userId: string) => {
    const storageKey = `childfund-local-donations-${userId}`;
    localStorage.removeItem(storageKey);
    
    // Se for o usuário atual, limpar também o estado
    if (userId === currentUserId) {
      setLocalDonations([]);
    }
    
    console.log('🗑️ Doações locais removidas para usuário:', userId);
  };

  return (
    <LocalDonationsContext.Provider value={{ localDonations, addDonation, clearDonations, clearDonationsForUser, currentUserId, updateUserId }}>
      {children}
    </LocalDonationsContext.Provider>
  );
}

export function useLocalDonations() {
  const context = useContext(LocalDonationsContext);
  if (!context) {
    throw new Error('useLocalDonations deve ser usado dentro de LocalDonationsProvider');
  }
  return context;
}