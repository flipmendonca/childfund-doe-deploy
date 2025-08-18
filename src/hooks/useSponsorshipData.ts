import { useState, useEffect } from 'react';
import { Child } from '@/types/Child';

interface UseSponsorshipDataReturn {
  children: Child[];
  isLoading: boolean;
  error: string | null;
  searchChildren: (query: string) => Promise<void>;
  searchResults: Child[];
  isSearching: boolean;
  clearSearch: () => void;
  hasSearched: boolean;
  totalCount: number;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isLoadingMore: boolean;
}

export function useSponsorshipData(): UseSponsorshipDataReturn {
  const [children, setChildren] = useState<Child[]>([]);
  const [searchResults, setSearchResults] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [lastContactId, setLastContactId] = useState<string | null>(null);
  const limit = 200; // Aumentado para carregar mais crianças de uma vez

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

  // Carrega crianças disponíveis iniciais
  const loadInitialChildren = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Filtro correto para crianças disponíveis
      const filter = 'statecode eq 0 and new_statusbloqueado eq false and new_data_do_apadrinhamento eq null';
      
      const queryParams = new URLSearchParams({
        '$select': 'contactid,firstname,lastname,fullname,birthdate,gendercode,new_genero,chf_fotocrianca_url,new_statusbloqueado,new_data_do_apadrinhamento',
        '$filter': filter,
        '$orderby': 'fullname asc',
        '$top': limit.toString(),
        '$count': 'true'
      });

      const response = await fetch(`/api/dynamics/contacts?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar crianças: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.value) {
        const mappedChildren = data.value.map(mapDynamicsToChild);
        setChildren(mappedChildren);
        setTotalCount(data['@odata.count'] || 0);
        setHasMore(mappedChildren.length >= limit);
        if (mappedChildren.length > 0) {
          setLastContactId(mappedChildren[mappedChildren.length - 1].id);
        }
      } else {
        setChildren([]);
        setTotalCount(0);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Erro ao carregar crianças:', err);
      setError(err instanceof Error ? err.message : 'Erro ao conectar com o Dynamics CRM');
      setChildren([]);
      setTotalCount(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega mais crianças (desabilitado por limitação do Dynamics CRM)
  const loadMore = async () => {
    // Dynamics CRM não suporta $skip, então vamos carregar apenas os primeiros resultados
    console.log('LoadMore desabilitado - Dynamics CRM não suporta paginação com $skip');
  };

  // Busca crianças por nome usando startswith
  const searchChildren = async (query: string) => {
    if (!query.trim()) {
      clearSearch();
      return;
    }

    try {
      setIsSearching(true);
      setError(null);

      const searchTerm = query.trim();
      // Usar startswith que funciona no Dynamics
      const filter = `statecode eq 0 and new_statusbloqueado eq false and new_data_do_apadrinhamento eq null and (startswith(fullname, '${searchTerm}') or startswith(firstname, '${searchTerm}'))`;
      
      const queryParams = new URLSearchParams({
        '$select': 'contactid,firstname,lastname,fullname,birthdate,gendercode,new_genero,chf_fotocrianca_url,new_statusbloqueado,new_data_do_apadrinhamento',
        '$filter': filter,
        '$orderby': 'fullname asc',
        '$top': '100'
      });

      const response = await fetch(`/api/dynamics/contacts?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Erro na busca: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.value) {
        const mappedResults = data.value.map(mapDynamicsToChild);
        setSearchResults(mappedResults);
        setHasSearched(true);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        setSearchResults([]);
        setHasSearched(true);
      }
    } catch (err) {
      console.error('Erro na busca:', err);
      setError(err instanceof Error ? err.message : 'Erro na busca do Dynamics CRM');
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Limpa a busca
  const clearSearch = () => {
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  };

  // Carrega dados iniciais
  useEffect(() => {
    loadInitialChildren();
  }, []);

  return {
    children,
    isLoading,
    error,
    searchChildren,
    searchResults,
    isSearching,
    clearSearch,
    hasSearched,
    totalCount,
    loadMore,
    hasMore,
    isLoadingMore
  };
} 