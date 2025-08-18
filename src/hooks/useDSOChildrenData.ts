import { useState, useEffect, useCallback, useRef } from 'react';
import { Child, ChildFilters } from '@/types/Child';
import { DSOService } from '@/services/DSOService';

interface UseDSOChildrenDataResult {
  children: Child[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isDSOAvailable: boolean;
}

interface UseDSOChildrenDataOptions {
  filters?: ChildFilters;
  autoLoad?: boolean;
  pageSize?: number;
}

/**
 * Hook para gerenciar dados de crianças do DSO
 */
export function useDSOChildrenData(options: UseDSOChildrenDataOptions = {}): UseDSOChildrenDataResult {
  const {
    filters = {},
    autoLoad = true,
    pageSize = 50
  } = options;

  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isDSOAvailable, setIsDSOAvailable] = useState(true);
  
  // Ref para controlar se já foi carregado inicialmente
  const hasInitialized = useRef(false);
  const filtersRef = useRef(filters);

  /**
   * Carrega dados de crianças do DSO
   */
  const loadChildren = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const page = reset ? 1 : currentPage;
      
      console.log('DSO: Carregando crianças, página:', page, 'filtros:', filters);

      const result = await DSOService.listChildren({
        filters,
        limit: pageSize,
        page
      });

      const newChildren = result.children;
      console.log('DSO: Crianças recebidas do serviço:', newChildren.slice(0, 3));
      
      if (reset) {
        setChildren(newChildren);
        setCurrentPage(1);
      } else {
        setChildren(prev => [...prev, ...newChildren]);
        setCurrentPage(prev => prev + 1);
      }

      setHasMore(result.hasMore);
      setTotalCount(result.totalCount);

      console.log(`DSO: Carregadas ${newChildren.length} crianças, total: ${result.totalCount}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar crianças do DSO';
      setError(errorMessage);
      console.error('Error loading children from DSO:', err);
      
      if (reset) {
        setChildren([]);
        setCurrentPage(1);
        setTotalCount(0);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [filters, pageSize]);

  /**
   * Testa conectividade com DSO
   */
  const testDSOConnection = useCallback(async () => {
    try {
      const isAvailable = await DSOService.testConnection();
      setIsDSOAvailable(isAvailable);
      console.log('DSO: Conectividade testada, disponível:', isAvailable);
      return isAvailable;
    } catch (error) {
      console.error('DSO: Erro ao testar conectividade:', error);
      setIsDSOAvailable(false);
      return false;
    }
  }, []);

  /**
   * Recarrega dados
   */
  const refetch = useCallback(async () => {
    await loadChildren(true);
  }, [loadChildren]);

  /**
   * Carrega mais dados
   */
  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await loadChildren(false);
    }
  }, [loading, hasMore, loadChildren]);

  // Efeito único para inicialização e mudanças de filtros
  useEffect(() => {
    if (!autoLoad) return;

    console.log('DSO: useEffect executado - autoLoad:', autoLoad, 'filters:', filters);

    const initializeData = async () => {
      // Testa conectividade apenas na primeira vez
      if (!hasInitialized.current) {
        console.log('DSO: Primeira inicialização - testando conectividade');
        const isAvailable = await testDSOConnection();
        hasInitialized.current = true;
        
        // Sempre tenta carregar dados, mesmo se o teste de conectividade falhar
        console.log('DSO: Carregando dados reais do DSO');
        await loadChildren(true);
        return;
      }

      // Verifica se os filtros mudaram (compara apenas se não são objetos vazios)
      const currentFiltersStr = JSON.stringify(filters);
      const previousFiltersStr = JSON.stringify(filtersRef.current);
      const filtersChanged = currentFiltersStr !== previousFiltersStr;
      
      console.log('DSO: Verificação de filtros - mudou:', filtersChanged);
      
      // Só atualiza se realmente mudou
      if (filtersChanged) {
        filtersRef.current = filters;
        console.log('DSO: Carregando dados - filtros mudaram');
        await loadChildren(true);
      } else {
        console.log('DSO: Dados já carregados, pulando carregamento');
      }
    };

    initializeData();
  }, [autoLoad, JSON.stringify(filters)]);

  useEffect(() => {
    if (children.length > 0) {
      console.log('DSO: Array final de crianças no hook:', children.slice(0, 3));
    }
  }, [children]);

  return {
    children,
    loading,
    error,
    totalCount,
    refetch,
    loadMore,
    hasMore,
    isDSOAvailable
  };
} 