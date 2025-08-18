import { useState, useEffect, useCallback } from 'react';
import { Child, ChildFilters } from '@/types/Child';

interface UseChildrenDataResult {
  children: Child[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  stats: {
    total: number;
    available: number;
    sponsored: number;
  } | null;
}

interface UseChildrenDataOptions {
  filters?: ChildFilters;
  autoLoad?: boolean;
  pageSize?: number;
  enableStats?: boolean;
}

/**
 * Hook para gerenciar dados de crianças do Dynamics CRM
 */
export function useChildrenData(options: UseChildrenDataOptions = {}): UseChildrenDataResult {
  const {
    filters = {},
    autoLoad = true,
    pageSize = 50,
    enableStats = false
  } = options;

  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState<UseChildrenDataResult['stats']>(null);

  // Função para mapear dados do Dynamics para Child
  const mapDynamicsToChild = (item: any): Child => {
    return {
      id: item.contactid,
      name: item.fullname || `${item.firstname || ''} ${item.lastname || ''}`.trim(),
      firstname: item.firstname || '',
      lastname: item.lastname || '',
      age: calculateAge(item.birthdate),
      birthdate: item.birthdate,
      gender: mapGenderCode(item.gendercode || item.new_genero),
      image: item.chf_fotocrianca_url || '/placeholder-child.jpg',
      description: `Uma criança especial aguardando por alguém que possa fazer a diferença em sua vida.`,
      location: '',
      story: 'Esta criança faz parte do programa ChildFund Brasil e está aguardando um padrinho ou madrinha.',
      needs: ['Educação', 'Saúde', 'Proteção'],
      dynamicsData: {
        contactId: item.contactid,
        statusBloqueado: item.new_statusbloqueado,
        statusApadrinhamento: item.new_data_do_apadrinhamento,
        genderCode: item.gendercode,
        customGender: item.new_genero
      }
    };
  };

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const mapGenderCode = (genderCode: number): 'M' | 'F' | 'Outro' => {
    switch (genderCode) {
      case 1: return 'M';
      case 2: return 'F';
      default: return 'Outro';
    }
  };

  /**
   * Carrega dados de crianças do Dynamics CRM
   */
  const loadChildren = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const offset = reset ? 0 : currentOffset;
      
      // Filtro base para crianças disponíveis
      let filter = 'statecode eq 0 and new_statusbloqueado eq false and new_data_do_apadrinhamento eq null';
      
      // Adicionar filtros específicos
      if (filters?.gender && filters?.gender !== 'all') {
        const genderCode = filters.gender === 'M' ? 1 : filters.gender === 'F' ? 2 : null;
        if (genderCode) {
          filter += ` and new_genero eq ${genderCode}`;
        }
      }

      if (filters?.ageRange) {
        const currentYear = new Date().getFullYear();
        const minBirthYear = currentYear - filters.ageRange.max;
        const maxBirthYear = currentYear - filters.ageRange.min;
        filter += ` and birthdate ge ${minBirthYear}-01-01 and birthdate le ${maxBirthYear}-12-31`;
      }

      if (filters?.state) {
        filter += ` and new_estado eq '${filters.state}'`;
      }

      const queryParams = new URLSearchParams({
        '$select': 'contactid,firstname,lastname,fullname,birthdate,gendercode,new_genero,chf_fotocrianca_url,new_statusbloqueado,new_data_do_apadrinhamento',
        '$filter': filter,
        '$orderby': 'fullname asc',
        '$top': pageSize.toString(),
        '$count': 'true'
      });

      const response = await fetch(`/api/dynamics/contacts?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar crianças: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.value) {
        const mappedChildren = data.value.map(mapDynamicsToChild);
        
        if (reset) {
          setChildren(mappedChildren);
          setCurrentOffset(mappedChildren.length);
        } else {
          setChildren(prev => [...prev, ...mappedChildren]);
          setCurrentOffset(prev => prev + mappedChildren.length);
        }

        setHasMore(mappedChildren.length === pageSize);
        setTotalCount(data['@odata.count'] || 0);
      } else {
        if (reset) {
          setChildren([]);
          setCurrentOffset(0);
        }
        setHasMore(false);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar crianças';
      setError(errorMessage);
      console.error('Error loading children:', err);
      
      if (reset) {
        setChildren([]);
        setCurrentOffset(0);
        setTotalCount(0);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [filters, pageSize, currentOffset]);

  /**
   * Carrega estatísticas
   */
  const loadStats = useCallback(async () => {
    if (!enableStats) return;

    try {
      // Usar uma implementação simples baseada nos dados carregados
      const availableFilter = 'statecode eq 0 and new_statusbloqueado eq false and new_data_do_apadrinhamento eq null';
      const totalFilter = 'statecode eq 0';

      const [availableResponse, totalResponse] = await Promise.all([
        fetch(`/api/dynamics/contacts?$filter=${encodeURIComponent(availableFilter)}&$count=true&$top=1`),
        fetch(`/api/dynamics/contacts?$filter=${encodeURIComponent(totalFilter)}&$count=true&$top=1`)
      ]);

      if (availableResponse.ok && totalResponse.ok) {
        const [availableData, totalData] = await Promise.all([
          availableResponse.json(),
          totalResponse.json()
        ]);

        const available = availableData['@odata.count'] || 0;
        const total = totalData['@odata.count'] || 0;
        const sponsored = total - available;

        setStats({ total, available, sponsored });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, [enableStats]);

  /**
   * Recarrega dados do início
   */
  const refetch = useCallback(async () => {
    setCurrentOffset(0);
    await loadChildren(true);
    
    if (enableStats) {
      await loadStats();
    }
  }, [loadChildren, loadStats, enableStats]);

  /**
   * Carrega mais dados (paginação)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadChildren(false);
  }, [hasMore, loading, loadChildren]);

  /**
   * Efeito para carregar dados iniciais
   */
  useEffect(() => {
    if (autoLoad) {
      refetch();
    }
  }, [autoLoad]);

  /**
   * Efeito para recarregar quando filtros mudam
   */
  useEffect(() => {
    if (autoLoad) {
      const timeoutId = setTimeout(() => {
        refetch();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [JSON.stringify(filters)]);

  return {
    children,
    loading,
    error,
    totalCount,
    refetch,
    loadMore,
    hasMore,
    stats
  };
}

/**
 * Hook simplificado para buscar uma criança específica
 */
export function useChildData(contactId: string | null) {
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapDynamicsToChild = (item: any): Child => {
    return {
      id: item.contactid,
      name: item.fullname || `${item.firstname || ''} ${item.lastname || ''}`.trim(),
      firstname: item.firstname || '',
      lastname: item.lastname || '',
      age: calculateAge(item.birthdate),
      birthdate: item.birthdate,
      gender: mapGenderCode(item.gendercode || item.new_genero),
      image: item.chf_fotocrianca_url || '/placeholder-child.jpg',
      description: `Uma criança especial aguardando por alguém que possa fazer a diferença em sua vida.`,
      location: '',
      story: 'Esta criança faz parte do programa ChildFund Brasil e está aguardando um padrinho ou madrinha.',
      needs: ['Educação', 'Saúde', 'Proteção'],
      dynamicsData: {
        contactId: item.contactid,
        statusBloqueado: item.new_statusbloqueado,
        statusApadrinhamento: item.new_data_do_apadrinhamento,
        genderCode: item.gendercode,
        customGender: item.new_genero
      }
    };
  };

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const mapGenderCode = (genderCode: number): 'M' | 'F' | 'Outro' => {
    switch (genderCode) {
      case 1: return 'M';
      case 2: return 'F';
      default: return 'Outro';
    }
  };

  const loadChild = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        '$select': 'contactid,firstname,lastname,fullname,birthdate,gendercode,new_genero,chf_fotocrianca_url,new_statusbloqueado,new_data_do_apadrinhamento'
      });

      const response = await fetch(`/api/dynamics/contacts/${id}?${queryParams}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setChild(null);
          return;
        }
        throw new Error(`Erro ao carregar criança: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const childData = mapDynamicsToChild(data);
      setChild(childData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar criança';
      setError(errorMessage);
      console.error('Error loading child:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (contactId) {
      loadChild(contactId);
    } else {
      setChild(null);
      setError(null);
    }
  }, [contactId, loadChild]);

  const refetch = useCallback(() => {
    if (contactId) {
      loadChild(contactId);
    }
  }, [contactId, loadChild]);

  return {
    child,
    loading,
    error,
    refetch
  };
}

/**
 * Hook para estatísticas de crianças
 */
export function useChildrenStats() {
  const [stats, setStats] = useState<{ total: number; available: number; sponsored: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const availableFilter = 'statecode eq 0 and new_statusbloqueado eq false and new_data_do_apadrinhamento eq null';
      const totalFilter = 'statecode eq 0';

      const [availableResponse, totalResponse] = await Promise.all([
        fetch(`/api/dynamics/contacts?$filter=${encodeURIComponent(availableFilter)}&$count=true&$top=1`),
        fetch(`/api/dynamics/contacts?$filter=${encodeURIComponent(totalFilter)}&$count=true&$top=1`)
      ]);

      if (!availableResponse.ok || !totalResponse.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const [availableData, totalData] = await Promise.all([
        availableResponse.json(),
        totalResponse.json()
      ]);

      const available = availableData['@odata.count'] || 0;
      const total = totalData['@odata.count'] || 0;
      const sponsored = total - available;

      setStats({ total, available, sponsored });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
      setError(errorMessage);
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refetch: loadStats
  };
}

/**
 * Hook para verificar saúde da conexão com Dynamics
 */
export function useDynamicsHealth() {
  const [status, setStatus] = useState<'ok' | 'error' | 'checking'>('checking');
  const [message, setMessage] = useState<string>('Verificando conexão...');
  const [lastCheck, setLastCheck] = useState<number>(0);

  const checkHealth = useCallback(async () => {
    try {
      setStatus('checking');
      setMessage('Verificando conexão...');

      const start = Date.now();
      const response = await fetch('/api/dynamics/contacts?$top=1');
      
      if (!response.ok) {
        throw new Error(`Erro de conexão: ${response.status} ${response.statusText}`);
      }

      const responseTime = Date.now() - start;
      setStatus('ok');
      setMessage(`Conectado ao Dynamics CRM (${responseTime}ms)`);
      setLastCheck(Date.now());

    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Erro de conexão');
      setLastCheck(Date.now());
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    status,
    message,
    lastCheck,
    checkHealth
  };
} 