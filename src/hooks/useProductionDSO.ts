/**
 * Hook DSO baseado EXATAMENTE no padrão de produção
 * Substitui a implementação complexa por uma simples como na produção
 */

import { useState, useEffect, useCallback } from 'react';
import { profile, ProfileData } from '../utils/dso/session/profile';
import { login, LoginData, LoginResponse } from '../utils/dso/session/login';

interface ProductionDSOState {
  user: ProfileData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface ProductionDSOActions {
  login: (credentials: LoginData) => Promise<boolean>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isUserAuthenticated: () => Promise<boolean>;
}

const DSO_HOST = 'https://dso.childfundbrasil.org.br/';
const DSO_KEY = 'c5e53b87-d315-427d-a9f0-1d80d5f65f56';

/**
 * Hook DSO de produção - padrão simples
 */
export function useProductionDSO(): ProductionDSOState & ProductionDSOActions {
  const [state, setState] = useState<ProductionDSOState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  /**
   * Verifica se o usuário está autenticado (tem token válido)
   */
  const isUserAuthenticated = useCallback(async (): Promise<boolean> => {
    try {
      // Tentar buscar perfil - se funcionar, está autenticado
      const profileResult = await profile(DSO_HOST);
      const hasValidProfile = profileResult.data && Object.keys(profileResult.data).length > 0;
      
      console.log('🔍 [ProductionDSO] Verificação de autenticação:', {
        hasValidProfile,
        profileData: profileResult.data
      });
      
      return hasValidProfile;
    } catch (error) {
      console.log('⚠️ [ProductionDSO] Erro na verificação de auth:', error);
      return false;
    }
  }, []);

  /**
   * Carrega perfil do usuário
   */
  const refreshProfile = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const profileResult = await profile(DSO_HOST);
      
      if (profileResult.data && Object.keys(profileResult.data).length > 0) {
        setState(prev => ({
          ...prev,
          user: profileResult.data as ProfileData,
          isAuthenticated: true,
          isLoading: false
        }));
        console.log('✅ [ProductionDSO] Perfil carregado:', profileResult.data);
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false
        }));
        console.log('⚠️ [ProductionDSO] Perfil vazio ou inválido');
      }
    } catch (error) {
      console.error('❌ [ProductionDSO] Erro ao carregar perfil:', error);
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  }, []);

  /**
   * Realiza login
   */
  const loginUser = useCallback(async (credentials: LoginData): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('🔐 [ProductionDSO] Fazendo login...');
      
      const loginResult = await login(DSO_HOST, credentials, DSO_KEY);
      
      if (loginResult.success === 'authenticated') {
        console.log('✅ [ProductionDSO] Login bem-sucedido');
        
        // Carregar perfil após login
        await refreshProfile();
        return true;
      } else {
        console.log('⚠️ [ProductionDSO] Login falhou:', loginResult.message);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: loginResult.message || 'Credenciais inválidas'
        }));
        return false;
      }
    } catch (error) {
      console.error('❌ [ProductionDSO] Erro no login:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro no login'
      }));
      return false;
    }
  }, [refreshProfile]);

  /**
   * Realiza logout
   */
  const logout = useCallback(() => {
    console.log('🚪 [ProductionDSO] Fazendo logout...');
    
    // Limpar localStorage
    localStorage.removeItem('dso-token');
    
    // Limpar cookies via endpoint
    fetch('/api/essentials/coockies', {
      method: 'DELETE',
      credentials: 'include'
    }).catch(e => console.warn('⚠️ Erro ao limpar cookies:', e));
    
    // Limpar estado
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    
    console.log('✅ [ProductionDSO] Logout concluído');
  }, []);

  /**
   * Verificar autenticação na inicialização
   */
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      const authenticated = await isUserAuthenticated();
      
      if (mounted) {
        if (authenticated) {
          await refreshProfile();
        } else {
          setState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            isLoading: false
          }));
        }
      }
    };
    
    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, [isUserAuthenticated, refreshProfile]);

  return {
    ...state,
    login: loginUser,
    logout,
    refreshProfile,
    isUserAuthenticated
  };
} 