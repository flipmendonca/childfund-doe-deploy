/**
 * Hook de autenticação DSO baseado na implementação de produção
 */

import { useState, useEffect, useCallback } from 'react';
import { dsoClient, DSOUser, DSOLoginRequest } from '../lib/dso/client';

interface DSOAuthState {
  user: DSOUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface DSOAuthActions {
  login: (credentials: DSOLoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<DSOUser>) => Promise<boolean>;
  clearError: () => void;
}

export function useDSOAuth(): DSOAuthState & DSOAuthActions {
  const [state, setState] = useState<DSOAuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  /**
   * Carrega o perfil do usuário atual
   */
  const loadUserProfile = useCallback(async () => {
    try {
      console.log('🔍 [useDSOAuth] Carregando perfil do usuário...');
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const isAuth = await dsoClient.isAuthenticated();
      console.log('🔍 [useDSOAuth] isAuthenticated:', isAuth);
      
      if (isAuth) {
        console.log('🔍 [useDSOAuth] Usuário autenticado, buscando perfil...');
        const user = await dsoClient.getMyProfile();
        console.log('🔍 [useDSOAuth] Perfil obtido:', user);
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          isLoading: false
        }));
      } else {
        console.log('🔍 [useDSOAuth] Usuário não autenticado');
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('[useDSOAuth] Erro ao carregar perfil:', error);
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar perfil'
      }));
    }
  }, []);

  /**
   * Realiza login
   */
  const login = useCallback(async (credentials: DSOLoginRequest): Promise<boolean> => {
    try {
      console.log('🔐 [useDSOAuth] Iniciando login DSO com:', { login: credentials.login });
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await dsoClient.login(credentials);
      console.log('🔐 [useDSOAuth] Resposta do login:', {
        success: response.success,
        hasToken: !!response.data.token,
        hasUser: !!response.data.user
      });
      
      if (response.success === 'authenticated') {
        console.log('✅ [useDSOAuth] Login bem-sucedido, definindo estado...');
        
        // Verificar se o token foi salvo corretamente
        const tokenSaved = localStorage.getItem('dso-token');
        console.log('🔐 [useDSOAuth] Token salvo:', !!tokenSaved);
        
        setState(prev => ({
          ...prev,
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false
        }));
        
        console.log('✅ [useDSOAuth] Estado atualizado com sucesso');
        return true;
      } else {
        console.warn('⚠️ [useDSOAuth] Login falhou:', response);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Credenciais inválidas'
        }));
        return false;
      }
    } catch (error) {
      console.error('❌ [useDSOAuth] Erro no login:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro no login'
      }));
      return false;
    }
  }, []);

  /**
   * Realiza logout
   */
  const logout = useCallback(async () => {
    try {
      await dsoClient.logout();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('[useDSOAuth] Erro no logout:', error);
    }
  }, []);

  /**
   * Atualiza dados do perfil
   */
  const refreshProfile = useCallback(async () => {
    await loadUserProfile();
  }, [loadUserProfile]);

  /**
   * Atualiza perfil do usuário
   */
  const updateProfile = useCallback(async (profileData: Partial<DSOUser>): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const updatedUser = await dsoClient.updateProfile(profileData);
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      console.error('[useDSOAuth] Erro ao atualizar perfil:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar perfil'
      }));
      return false;
    }
  }, []);

  /**
   * Limpa erros
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Carregar perfil na inicialização
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  return {
    ...state,
    login,
    logout,
    refreshProfile,
    updateProfile,
    clearError
  };
}