import { useState, useCallback } from 'react';
import ViaCEPService, { AddressData } from '@/services/ViaCEPService';
import { unmaskCEP, isValidCEPFormat } from '@/utils/formatters';

export interface UseViaCEPReturn {
  // Estado
  isLoading: boolean;
  error: string | null;
  addressData: AddressData | null;
  
  // Funções
  searchByCEP: (cep: string) => Promise<AddressData | null>;
  searchByAddress: (state: string, city: string, street: string) => Promise<AddressData[]>;
  clearError: () => void;
  clearAddressData: () => void;
}

export const useViaCEP = (): UseViaCEPReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressData, setAddressData] = useState<AddressData | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearAddressData = useCallback(() => {
    setAddressData(null);
  }, []);

  const searchByCEP = useCallback(async (cep: string): Promise<AddressData | null> => {
    const cleanCEP = unmaskCEP(cep);
    
    // Validação inicial
    if (!cleanCEP) {
      setError('CEP é obrigatório');
      return null;
    }

    if (!isValidCEPFormat(cep)) {
      setError('CEP deve ter 8 dígitos');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setAddressData(null);

    try {
      const result = await ViaCEPService.getAddressWithCache(cleanCEP);
      
      if (!result) {
        setError('CEP não encontrado');
        return null;
      }

      setAddressData(result);
      return result;

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao buscar CEP';
      setError(errorMessage);
      console.error('Erro na busca por CEP:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchByAddress = useCallback(async (
    state: string, 
    city: string, 
    street: string
  ): Promise<AddressData[]> => {
    // Validações
    if (!state || state.length !== 2) {
      setError('Estado deve ter 2 caracteres (UF)');
      return [];
    }

    if (!city || city.trim().length < 2) {
      setError('Nome da cidade deve ter pelo menos 2 caracteres');
      return [];
    }

    if (!street || street.trim().length < 3) {
      setError('Nome da rua deve ter pelo menos 3 caracteres');
      return [];
    }

    setIsLoading(true);
    setError(null);
    setAddressData(null);

    try {
      const results = await ViaCEPService.searchAddress(
        state.toUpperCase(),
        city.trim(),
        street.trim()
      );

      if (results.length === 0) {
        setError('Nenhum endereço encontrado com esses dados');
        return [];
      }

      // Se encontrou apenas um resultado, definir como addressData
      if (results.length === 1) {
        setAddressData(results[0]);
      }

      return results;

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao buscar endereços';
      setError(errorMessage);
      console.error('Erro na busca por endereço:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    addressData,
    searchByCEP,
    searchByAddress,
    clearError,
    clearAddressData
  };
};

// Hook específico para busca automática por CEP (para usar em formulários)
export const useAutoCEP = (onAddressFound?: (address: AddressData) => void) => {
  const { isLoading, error, searchByCEP, clearError } = useViaCEP();

  const handleCEPChange = useCallback(async (cep: string) => {
    const cleanCEP = unmaskCEP(cep);
    
    // Só buscar quando CEP estiver completo
    if (cleanCEP.length === 8) {
      const address = await searchByCEP(cep);
      if (address && onAddressFound) {
        onAddressFound(address);
      }
    }
  }, [searchByCEP, onAddressFound]);

  return {
    isLoading,
    error,
    handleCEPChange,
    clearError
  };
};