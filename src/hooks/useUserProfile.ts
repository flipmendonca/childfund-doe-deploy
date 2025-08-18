import { useState, useEffect, useCallback } from 'react';
import { 
  userProfileService, 
  DSOUser, 
  DynamicsContact, 
  ConsolidatedUserData,
  ApiResponse 
} from '@/services/userProfileService';

interface UseUserProfileOptions {
  autoLoad?: boolean;
  userId?: string;
  document?: string;
  email?: string;
  dynamicsId?: string;
}

interface UseUserProfileResult {
  // Dados
  dsoData: DSOUser | null;
  dynamicsData: DynamicsContact | null;
  consolidatedData: ConsolidatedUserData | null;
  
  // Estados
  loading: boolean;
  error: string | null;
  
  // Metadados
  sources: string[];
  hasDSOData: boolean;
  hasDynamicsData: boolean;
  lastSync: string | null;
  
  // Métodos
  loadDSOProfile: (params: { userId?: string; document?: string; email?: string }) => Promise<void>;
  loadDynamicsData: (params: { dynamicsId?: string; contactId?: string }) => Promise<void>;
  loadConsolidatedData: (params: { userId?: string; document?: string; email?: string; dynamicsId?: string }) => Promise<void>;
  loadCurrentUserProfile: () => Promise<void>;
  updateDSOProfile: (userId: string, profileData: Partial<DSOUser>) => Promise<void>;
  updateDynamicsData: (contactId: string, contactData: Partial<DynamicsContact>) => Promise<void>;
  syncUserData: (userId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook para gerenciar dados de perfil do usuário
 * Integra DSO e Dynamics CRM
 */
export function useUserProfile(options: UseUserProfileOptions = {}): UseUserProfileResult {
  const {
    autoLoad = false,
    userId,
    document,
    email,
    dynamicsId
  } = options;

  // Estados
  const [dsoData, setDsoData] = useState<DSOUser | null>(null);
  const [dynamicsData, setDynamicsData] = useState<DynamicsContact | null>(null);
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Metadados
  const [sources, setSources] = useState<string[]>([]);
  const [hasDSOData, setHasDSOData] = useState(false);
  const [hasDynamicsData, setHasDynamicsData] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  /**
   * Carrega perfil do DSO
   */
  const loadDSOProfile = useCallback(async (params: { userId?: string; document?: string; email?: string }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userProfileService.getDSOProfile(params);
      
      if (response.success && response.data) {
        setDsoData(response.data);
        setHasDSOData(true);
        setSources(prev => [...new Set([...prev, 'DSO'])]);
        console.log('✅ Perfil DSO carregado:', response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar perfil DSO';
      setError(errorMessage);
      console.error('❌ Erro ao carregar perfil DSO:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carrega dados do Dynamics CRM
   */
  const loadDynamicsData = useCallback(async (params: { dynamicsId?: string; contactId?: string }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userProfileService.getDynamicsData(params);
      
      if (response.success && response.data) {
        setDynamicsData(response.data);
        setHasDynamicsData(true);
        setSources(prev => [...new Set([...prev, 'Dynamics CRM'])]);
        console.log('✅ Dados Dynamics carregados:', response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados Dynamics';
      setError(errorMessage);
      console.error('❌ Erro ao carregar dados Dynamics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carrega dados consolidados
   */
  const loadConsolidatedData = useCallback(async (params: { userId?: string; document?: string; email?: string; dynamicsId?: string }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userProfileService.getConsolidatedData(params);
      
      if (response.success && response.data) {
        setConsolidatedData(response.data);
        setDsoData(response.data.dso || null);
        setDynamicsData(response.data.dynamics || null);
        setHasDSOData(response.data.metadata.hasDSOData);
        setHasDynamicsData(response.data.metadata.hasDynamicsData);
        setSources(response.data.metadata.sources);
        setLastSync(response.data.metadata.lastSync);
        console.log('✅ Dados consolidados carregados:', response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados consolidados';
      setError(errorMessage);
      console.error('❌ Erro ao carregar dados consolidados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carrega perfil do usuário atual
   */
  const loadCurrentUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userProfileService.getCurrentUserProfile();
      
      if (response.success && response.data) {
        setConsolidatedData(response.data);
        setDsoData(response.data.dso || null);
        setDynamicsData(response.data.dynamics || null);
        setHasDSOData(response.data.metadata.hasDSOData);
        setHasDynamicsData(response.data.metadata.hasDynamicsData);
        setSources(response.data.metadata.sources);
        setLastSync(response.data.metadata.lastSync);
        console.log('✅ Perfil do usuário atual carregado:', response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar perfil do usuário atual';
      setError(errorMessage);
      console.error('❌ Erro ao carregar perfil do usuário atual:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Atualiza perfil no DSO
   */
  const updateDSOProfile = useCallback(async (userId: string, profileData: Partial<DSOUser>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userProfileService.updateDSOProfile(userId, profileData);
      
      if (response.success) {
        // Recarregar dados atualizados
        await loadDSOProfile({ userId });
        console.log('✅ Perfil DSO atualizado com sucesso');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar perfil DSO';
      setError(errorMessage);
      console.error('❌ Erro ao atualizar perfil DSO:', err);
    } finally {
      setLoading(false);
    }
  }, [loadDSOProfile]);

  /**
   * Atualiza dados no Dynamics CRM
   */
  const updateDynamicsData = useCallback(async (contactId: string, contactData: Partial<DynamicsContact>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userProfileService.updateDynamicsData(contactId, contactData);
      
      if (response.success) {
        // Recarregar dados atualizados
        await loadDynamicsData({ contactId });
        console.log('✅ Dados Dynamics atualizados com sucesso');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar dados Dynamics';
      setError(errorMessage);
      console.error('❌ Erro ao atualizar dados Dynamics:', err);
    } finally {
      setLoading(false);
    }
  }, [loadDynamicsData]);

  /**
   * Sincroniza dados entre sistemas
   */
  const syncUserData = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userProfileService.syncUserData(userId);
      
      if (response.success) {
        // Recarregar dados consolidados
        await loadConsolidatedData({ userId });
        console.log('✅ Dados sincronizados com sucesso');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao sincronizar dados';
      setError(errorMessage);
      console.error('❌ Erro ao sincronizar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [loadConsolidatedData]);

  /**
   * Recarrega dados
   */
  const refresh = useCallback(async () => {
    if (userId || document || email || dynamicsId) {
      await loadConsolidatedData({ userId, document, email, dynamicsId });
    } else {
      await loadCurrentUserProfile();
    }
  }, [userId, document, email, dynamicsId, loadConsolidatedData, loadCurrentUserProfile]);

  // Carregamento automático
  useEffect(() => {
    if (autoLoad) {
      if (userId || document || email || dynamicsId) {
        loadConsolidatedData({ userId, document, email, dynamicsId });
      } else {
        loadCurrentUserProfile();
      }
    }
  }, [autoLoad, userId, document, email, dynamicsId, loadConsolidatedData, loadCurrentUserProfile]);

  return {
    // Dados
    dsoData,
    dynamicsData,
    consolidatedData,
    
    // Estados
    loading,
    error,
    
    // Metadados
    sources,
    hasDSOData,
    hasDynamicsData,
    lastSync,
    
    // Métodos
    loadDSOProfile,
    loadDynamicsData,
    loadConsolidatedData,
    loadCurrentUserProfile,
    updateDSOProfile,
    updateDynamicsData,
    syncUserData,
    refresh,
  };
} 