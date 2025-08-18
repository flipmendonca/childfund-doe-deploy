import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: string;
  count?: number;
}

interface NextPressResponse {
  '@odata.context': string;
  '@odata.count': number;
  value: any[];
}

interface FieldInfo {
  name: string;
  type: string;
  value: any;
  hasValue: boolean;
}

const DynamicsDebug: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [healthData, setHealthData] = useState<any>(null);
  const [childrenData, setChildrenData] = useState<ApiResponse | null>(null);
  const [singleChildData, setSingleChildData] = useState<ApiResponse | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [customQuery, setCustomQuery] = useState<string>('');
  const [customResponse, setCustomResponse] = useState<any>(null);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [availableFields, setAvailableFields] = useState<FieldInfo[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [realTotalCount, setRealTotalCount] = useState<{
    count: number;
    isRunning: boolean;
    progress: string;
    error?: string;
  } | null>(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    limit: 20,
    gender: '',
    minAge: '',
    maxAge: '',
    searchName: '',
    exactMatch: false
  });

  // Teste de conexão
  const testConnection = async () => {
    setLoading(prev => ({ ...prev, health: true }));
    try {
      const response = await fetch('/api/dynamics/health');
      const data = await response.json();
      
      if (response.ok) {
        setHealthStatus('success');
        setHealthData(data);
      } else {
        setHealthStatus('error');
        setHealthData(data);
      }
    } catch (error: any) {
      setHealthStatus('error');
      setHealthData({ error: error.message });
    } finally {
      setLoading(prev => ({ ...prev, health: false }));
    }
  };

  // Buscar crianças com filtros
  const fetchChildren = async () => {
    setLoading(prev => ({ ...prev, children: true }));
    setChildrenData(null); // Limpa dados anteriores
    
    try {
      console.log('🔄 Iniciando busca de crianças com filtros:', filters);
      
      // Construir query string com filtros
      const queryParams = new URLSearchParams();
      
      // Limitar quantidade - quando buscar por nome, pegamos mais registros para filtrar
      if (filters.limit > 0) {
        const topLimit = filters.searchName && filters.searchName.trim() 
          ? Math.max(filters.limit * 10, 100) // Busca mais registros quando há filtro de nome
          : filters.limit;
        queryParams.append('$top', topLimit.toString());
      }
      
      // Construir filtros OData
      const oDataFilters = [];
      
      // NOTA: Filtro por nome será aplicado no lado do cliente devido a problemas com OData no Dynamics
      // A busca por nome será feita após receber os dados do servidor
      
      // Filtro por gênero
      if (filters.gender) {
        if (filters.gender === 'masculino') {
          oDataFilters.push('gendercode eq 1');
        } else if (filters.gender === 'feminino') {
          oDataFilters.push('gendercode eq 2');
        }
      }
      
      // Filtro por idade (calculado baseado em birthdate)
      if (filters.minAge || filters.maxAge) {
        const currentYear = new Date().getFullYear();
        
        if (filters.minAge) {
          const maxBirthYear = currentYear - parseInt(filters.minAge);
          oDataFilters.push(`year(birthdate) le ${maxBirthYear}`);
        }
        
        if (filters.maxAge) {
          const minBirthYear = currentYear - parseInt(filters.maxAge);
          oDataFilters.push(`year(birthdate) ge ${minBirthYear}`);
        }
      }
      
      // Adicionar filtros na query
      if (oDataFilters.length > 0) {
        queryParams.append('$filter', oDataFilters.join(' and '));
      }
      
      // Ordenar por nome
      queryParams.append('$orderby', 'firstname asc');
      
      const queryString = queryParams.toString();
      const url = `/api/dynamics/children${queryString ? `?${queryString}` : ''}`;
      
      console.log('🌐 URL da requisição:', url);
      
      const response = await fetch(url);
      console.log('📡 Resposta recebida:', response.status);
      
      let data = await response.json();
      console.log('📊 Dados processados (antes do filtro):', data);
      
      // Filtro adicional no lado do cliente para garantir que a busca por nome funcione corretamente
      if (filters.searchName && filters.searchName.trim() && data.success && data.data) {
        const searchTerm = filters.searchName.trim().toLowerCase();
        
        data.data = data.data
          .filter((child: any) => {
            const firstName = child.firstName?.toLowerCase() || '';
            const lastName = child.lastName?.toLowerCase() || '';
            
            if (filters.exactMatch) {
              // Busca exata: nome deve ser igual
              return firstName === searchTerm || lastName === searchTerm;
            } else {
              // Busca parcial: nome deve conter o termo
              return firstName.includes(searchTerm) || lastName.includes(searchTerm);
            }
          })
          .slice(0, filters.limit); // Limita ao número solicitado pelo usuário
        
        data.count = data.data.length;
        console.log(`🔍 Filtro aplicado no cliente: ${data.count} registros restantes após busca por "${filters.searchName}" (limitado a ${filters.limit})`);
      }
      
      setChildrenData(data);
      
      // Analisa campos disponíveis
      if (data.success && data.data && data.data.length > 0) {
        analyzeFields(data.data[0]);
        console.log('✅ Análise de campos concluída');
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar crianças:', error);
      setChildrenData({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(prev => ({ ...prev, children: false }));
    }
  };

  // Buscar criança específica
  const fetchSingleChild = async () => {
    if (!selectedChildId.trim()) return;
    
    setLoading(prev => ({ ...prev, single: true }));
    try {
      const response = await fetch(`/api/dynamics/children/${selectedChildId}`);
      const data = await response.json();
      setSingleChildData(data);
    } catch (error: any) {
      setSingleChildData({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(prev => ({ ...prev, single: false }));
    }
  };

  // Executar query customizada
  const executeCustomQuery = async () => {
    if (!customQuery.trim()) return;
    
    setLoading(prev => ({ ...prev, custom: true }));
    try {
      const response = await fetch(`/api/dynamics/children?${customQuery}`);
      const data = await response.json();
      setCustomResponse(data);
    } catch (error: any) {
      setCustomResponse({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(prev => ({ ...prev, custom: false }));
    }
  };

  // Buscar estatísticas quantitativas
  // Função para descobrir o total real de registros usando paginação com $skiptoken
  const fetchRealTotalCount = async () => {
    setRealTotalCount({
      count: 0,
      isRunning: true,
      progress: 'Iniciando contagem real usando paginação $skiptoken...'
    });

    try {
      let totalCount = 0;
      let currentPage = 0;
      const pageSize = 5000; // Tamanho máximo da página
      let nextUrl = `/api/dynamics/children?$top=${pageSize}`;

      while (nextUrl) {
        currentPage++;
        
        setRealTotalCount(prev => prev ? {
          ...prev,
          progress: `Página ${currentPage}: buscando até ${pageSize} registros... (${totalCount} encontrados)`
        } : null);

        try {
          console.log(`📄 Fazendo requisição para página ${currentPage}:`, nextUrl);
          const response = await fetch(nextUrl);
          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || 'Erro na requisição');
          }

          const pageCount = data.data ? data.data.length : 0;
          totalCount += pageCount;

          console.log(`📄 Página ${currentPage}: ${pageCount} registros (total atual: ${totalCount})`);

          setRealTotalCount(prev => prev ? {
            ...prev,
            progress: `Página ${currentPage}: ${pageCount} registros encontrados (total: ${totalCount})`
          } : null);

          // Verificar se há nextLink no response original
          let nextLink = null;
          if (data._original && data._original['@odata.nextLink']) {
            nextLink = data._original['@odata.nextLink'];
          } else if (data['@odata.nextLink']) {
            nextLink = data['@odata.nextLink'];
          }

          if (nextLink && pageCount === pageSize) {
            // Extrair $skiptoken da URL nextLink
            try {
              const url = new URL(nextLink);
              const skiptoken = url.searchParams.get('$skiptoken');
              
              if (skiptoken) {
                nextUrl = `/api/dynamics/children?$top=${pageSize}&$skiptoken=${encodeURIComponent(skiptoken)}`;
                console.log(`🔗 Próxima página encontrada com skiptoken`);
              } else {
                console.log('⚠️ NextLink encontrado mas sem $skiptoken');
                nextUrl = null;
              }
            } catch (urlError) {
              console.error('❌ Erro ao processar nextLink:', urlError);
              nextUrl = null;
            }
          } else {
            // Não há mais páginas
            nextUrl = null;
            console.log('✅ Fim dos dados alcançado');
          }

          // Delay entre requisições para não sobrecarregar o servidor
          if (nextUrl) {
            setRealTotalCount(prev => prev ? {
              ...prev,
              progress: `Página ${currentPage} concluída. Aguardando 1s antes da próxima...`
            } : null);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

        } catch (pageError) {
          console.error(`❌ Erro na página ${currentPage}:`, pageError);
          setRealTotalCount(prev => prev ? {
            ...prev,
            progress: `❌ Erro na página ${currentPage}: ${pageError.message}`
          } : null);
          
          // Em caso de erro, parar o processo
          break;
        }
      }

      setRealTotalCount({
        count: totalCount,
        isRunning: false,
        progress: `✅ Contagem concluída! Total real: ${totalCount.toLocaleString()} registros em ${currentPage} páginas`
      });

    } catch (error: any) {
      console.error('❌ Erro na contagem total:', error);
      setRealTotalCount({
        count: 0,
        isRunning: false,
        progress: '❌ Erro na contagem total',
        error: error.message
      });
    }
  };

  const fetchStatistics = async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    setStatistics(null);
    
    try {
      console.log('📊 Buscando estatísticas dos registros...');
      
      // Buscar estatísticas gerais
      // Nota: Como o Dynamics CRM não suporta $count com filtros de forma confiável,
      // vamos fazer queries separadas para contar registros
      const queries = [
        // Total de registros (apenas esta usa $count=true)
        { name: 'total', query: '$count=true&$top=1', useCount: true },
        // Para as demais, buscaremos uma amostra grande e contaremos localmente
        { name: 'sample', query: '$top=5000', useCount: false, isSample: true },
      ];

      const results: any = {
        timestamp: new Date().toISOString(),
        queries: {}
      };

      // Executa queries
      for (const { name, query, useCount, isSample } of queries) {
        try {
          const response = await fetch(`/api/dynamics/children?${query}`);
          const data = await response.json();
          
          if (data.success) {
            if (useCount && data._original && data._original['@odata.count'] !== undefined) {
              // Para query de total, usa @odata.count
              results.queries[name] = {
                count: data._original['@odata.count'],
                success: true
              };
            } else if (isSample && data.data) {
              // Para amostra, calcula estatísticas localmente
              const sampleData = data.data;
              
              results.queries.ativos = {
                count: sampleData.filter(item => item.isActive).length,
                success: true,
                note: `Baseado em amostra de ${sampleData.length} registros`
              };
              
              results.queries.inativos = {
                count: sampleData.filter(item => !item.isActive).length,
                success: true,
                note: `Baseado em amostra de ${sampleData.length} registros`
              };
              
              results.queries.masculino = {
                count: sampleData.filter(item => item.gender === 'Masculino').length,
                success: true,
                note: `Baseado em amostra de ${sampleData.length} registros`
              };
              
              results.queries.feminino = {
                count: sampleData.filter(item => item.gender === 'Feminino').length,
                success: true,
                note: `Baseado em amostra de ${sampleData.length} registros`
              };
              
              results.queries.comDataNascimento = {
                count: sampleData.filter(item => item.birthdate).length,
                success: true,
                note: `Baseado em amostra de ${sampleData.length} registros`
              };
              
              results.queries.comFoto = {
                count: sampleData.filter(item => item.photo).length,
                success: true,
                note: `Baseado em amostra de ${sampleData.length} registros`
              };
              
              results.queries.bloqueados = {
                count: sampleData.filter(item => item.isBlocked).length,
                success: true,
                note: `Baseado em amostra de ${sampleData.length} registros`
              };
              
              // Estatísticas adicionais
              results.queries.semGenero = {
                count: sampleData.filter(item => !item.gender).length,
                success: true,
                note: `Baseado em amostra de ${sampleData.length} registros`
              };
              
              results.queries.amostraTotal = {
                count: sampleData.length,
                success: true,
                note: 'Total de registros na amostra'
              };
              
            } else {
              results.queries[name] = {
                count: data.count || 0,
                success: true,
                note: 'Contagem baseada em resultados retornados'
              };
            }
          } else {
            results.queries[name] = {
              count: 0,
              success: false,
              error: data.error
            };
          }
        } catch (error) {
          results.queries[name] = {
            count: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          };
        }
      }
      
      // Calcular estatísticas derivadas
      results.derived = {
        percentualAtivos: results.queries.total?.count > 0 
          ? ((results.queries.ativos?.count || 0) / results.queries.total.count * 100).toFixed(1)
          : 0,
        percentualComFoto: results.queries.total?.count > 0 
          ? ((results.queries.comFoto?.count || 0) / results.queries.total.count * 100).toFixed(1)
          : 0,
        percentualComDataNascimento: results.queries.total?.count > 0 
          ? ((results.queries.comDataNascimento?.count || 0) / results.queries.total.count * 100).toFixed(1)
          : 0,
        razaoMasculinoFeminino: results.queries.feminino?.count > 0 
          ? ((results.queries.masculino?.count || 0) / results.queries.feminino.count).toFixed(2)
          : 'N/A'
      };

      console.log('✅ Estatísticas carregadas:', results);
      setStatistics(results);
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      setStatistics({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Analisar campos disponíveis
  const analyzeFields = (sampleData: any) => {
    const fields: FieldInfo[] = [];
    
    // Analisa dados transformados
    Object.keys(sampleData).forEach(key => {
      if (key !== '_original') {
        fields.push({
          name: key,
          type: typeof sampleData[key],
          value: sampleData[key],
          hasValue: sampleData[key] !== null && sampleData[key] !== undefined && sampleData[key] !== ''
        });
      }
    });

    // Analisa dados originais do Dynamics
    if (sampleData._original) {
      Object.keys(sampleData._original).forEach(key => {
        fields.push({
          name: `_original.${key}`,
          type: typeof sampleData._original[key],
          value: sampleData._original[key],
          hasValue: sampleData._original[key] !== null && sampleData._original[key] !== undefined && sampleData._original[key] !== ''
        });
      });
    }

    setAvailableFields(fields);
  };

  // Copiar para clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Inicialização
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Debug Dynamics CRM API</h1>
        <p className="text-gray-600">
          Ferramenta de debug para testar e analisar a integração com Microsoft Dynamics CRM
        </p>
        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
          💡 <strong>Dica:</strong> Abra o console do navegador (F12) para ver logs detalhados das requisições
        </div>
      </div>

      <Tabs defaultValue="connection" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="connection">Conexão</TabsTrigger>
              <TabsTrigger value="children">Lista Crianças</TabsTrigger>
              <TabsTrigger value="single">Criança Específica</TabsTrigger>
              <TabsTrigger value="custom">Query Customizada</TabsTrigger>
              <TabsTrigger value="fields">Campos Disponíveis</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            </TabsList>

        {/* Teste de Conexão */}
        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Status da Conexão
                <Button 
                  onClick={testConnection} 
                  disabled={loading.health}
                  size="sm"
                  variant="outline"
                >
                  {loading.health ? '🔄' : '🔄'} Testar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <div className="flex items-center gap-2">
                    {healthStatus === 'success' && <span className="text-green-500">✅</span>}
                    {healthStatus === 'error' && <span className="text-red-500">❌</span>}
                    {healthStatus === 'loading' && <span>🔄</span>}
                    <Badge variant={healthStatus === 'success' ? 'default' : 'destructive'}>
                      {healthStatus === 'success' ? 'Conectado' : healthStatus === 'error' ? 'Erro' : 'Testando...'}
                    </Badge>
                  </div>
                  <AlertDescription className="mt-2">
                    {healthData && (
                      <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                        {JSON.stringify(healthData, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>API Server:</strong> http://localhost:3000
                  </div>
                  <div>
                    <strong>Environment:</strong> {import.meta.env.DEV ? 'Development' : 'Production'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lista de Crianças */}
        <TabsContent value="children">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Crianças</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                
                {/* Filtros */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">🎯 Filtros de Busca</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      
                      {/* Busca por nome */}
                      <div>
                        <Label htmlFor="searchName">🔍 Buscar por Nome</Label>
                        <Input
                          id="searchName"
                          type="text"
                          value={filters.searchName}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            searchName: e.target.value
                          }))}
                          placeholder="Ex: Maria, João..."
                        />
                        <div className="flex items-center space-x-2 mt-2">
                          <input
                            type="checkbox"
                            id="exactMatch"
                            checked={filters.exactMatch}
                            onChange={(e) => setFilters(prev => ({
                              ...prev,
                              exactMatch: e.target.checked
                            }))}
                            className="h-3 w-3"
                          />
                          <Label htmlFor="exactMatch" className="text-xs text-gray-600">
                            Busca exata
                          </Label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {filters.exactMatch 
                            ? 'Nome exato em firstname/lastname' 
                            : 'Busca parcial em firstname/lastname'
                          }
                        </p>
                      </div>

                      {/* Limite de resultados */}
                      <div>
                        <Label htmlFor="limit">Limite de resultados</Label>
                        <Input
                          id="limit"
                          type="number"
                          min="1"
                          max="100"
                          value={filters.limit}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            limit: parseInt(e.target.value) || 20
                          }))}
                          placeholder="20"
                        />
                        <p className="text-xs text-gray-500 mt-1">Máximo: 100</p>
                      </div>

                      {/* Filtro por gênero */}
                      <div>
                        <Label htmlFor="gender">Gênero</Label>
                        <select
                          id="gender"
                          value={filters.gender}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            gender: e.target.value
                          }))}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Todos</option>
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                        </select>
                      </div>

                      {/* Idade mínima */}
                      <div>
                        <Label htmlFor="minAge">Idade mínima</Label>
                        <Input
                          id="minAge"
                          type="number"
                          min="0"
                          max="18"
                          value={filters.minAge}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            minAge: e.target.value
                          }))}
                          placeholder="Ex: 5"
                        />
                      </div>

                      {/* Idade máxima */}
                      <div>
                        <Label htmlFor="maxAge">Idade máxima</Label>
                        <Input
                          id="maxAge"
                          type="number"
                          min="0"
                          max="18"
                          value={filters.maxAge}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            maxAge: e.target.value
                          }))}
                          placeholder="Ex: 15"
                        />
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={fetchChildren} 
                        disabled={loading.children}
                        className="flex items-center gap-2"
                      >
                        {loading.children ? '🔄 Carregando...' : '🔍 Buscar Crianças'}
                      </Button>
                      
                      <Button 
                        onClick={() => setFilters({
                          limit: 20,
                          gender: '',
                          minAge: '',
                          maxAge: '',
                          searchName: '',
                          exactMatch: false
                        })}
                        variant="outline"
                      >
                        🔄 Limpar Filtros
                      </Button>
                    </div>

                                         {/* Filtros rápidos */}
                     <div className="mt-4">
                       <Label>🚀 Filtros Rápidos:</Label>
                       <div className="flex flex-wrap gap-2 mt-2">
                         <Badge 
                           variant="outline" 
                           className="cursor-pointer hover:bg-blue-100"
                           onClick={() => setFilters({
                             limit: 10,
                             gender: '',
                             minAge: '',
                             maxAge: '',
                             searchName: '',
                             exactMatch: false
                           })}
                         >
                           🔥 Top 10
                         </Badge>
                         
                         <Badge 
                           variant="outline" 
                           className="cursor-pointer hover:bg-blue-100"
                           onClick={() => setFilters({
                             limit: 20,
                             gender: 'masculino',
                             minAge: '',
                             maxAge: '',
                             searchName: '',
                             exactMatch: false
                           })}
                         >
                           👦 Meninos
                         </Badge>
                         
                         <Badge 
                           variant="outline" 
                           className="cursor-pointer hover:bg-blue-100"
                           onClick={() => setFilters({
                             limit: 20,
                             gender: 'feminino',
                             minAge: '',
                             maxAge: '',
                             searchName: '',
                             exactMatch: false
                           })}
                         >
                           👧 Meninas
                         </Badge>
                         
                         <Badge 
                           variant="outline" 
                           className="cursor-pointer hover:bg-blue-100"
                           onClick={() => setFilters({
                             limit: 15,
                             gender: '',
                             minAge: '5',
                             maxAge: '10',
                             searchName: '',
                             exactMatch: false
                           })}
                         >
                           🧒 5-10 anos
                         </Badge>
                         
                         <Badge 
                           variant="outline" 
                           className="cursor-pointer hover:bg-blue-100"
                           onClick={() => setFilters({
                             limit: 15,
                             gender: '',
                             minAge: '11',
                             maxAge: '15',
                             searchName: '',
                             exactMatch: false
                           })}
                         >
                           👨‍🎓 11-15 anos
                         </Badge>
                       </div>
                     </div>

                     {/* Preview da query */}
                     <div className="mt-4 p-2 bg-gray-50 rounded text-sm">
                       <strong>📡 Query que será executada:</strong>
                       <br />
                       <code className="text-blue-600 break-all">
                         /api/dynamics/children?$top={filters.limit > 1 && filters.searchName ? Math.max(filters.limit * 10, 100) : filters.limit}
                         {(filters.gender || filters.minAge || filters.maxAge) && '&$filter='}
                         {[
                           filters.gender && `gendercode eq ${filters.gender === 'masculino' ? '1' : '2'}`,
                           filters.minAge && `year(birthdate) le ${new Date().getFullYear() - parseInt(filters.minAge)}`,
                           filters.maxAge && `year(birthdate) ge ${new Date().getFullYear() - parseInt(filters.maxAge)}`
                         ].filter(Boolean).join(' and ')}
                         &$orderby=firstname asc
                       </code>
                       {filters.searchName && (
                         <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                           <strong>🔍 Filtro de nome aplicado no cliente:</strong> 
                           <span className="text-orange-600">
                             {filters.exactMatch 
                               ? ` firstname === "${filters.searchName}" OR lastname === "${filters.searchName}"` 
                               : ` firstname.includes("${filters.searchName}") OR lastname.includes("${filters.searchName}")`
                             }
                           </span>
                         </div>
                       )}
                     </div>
                  </CardContent>
                </Card>

                {/* Informações ChildFund */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-800">🏢 Filtros ChildFund Brasil (Automáticos)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-blue-700 space-y-2">
                      <p><strong>📋 Filtro padrão aplicado automaticamente:</strong></p>
                      <code className="block bg-blue-100 p-2 rounded text-xs">
                        statecode eq 0 and new_statusbloqueado eq false
                      </code>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <strong>✅ statecode eq 0</strong>
                          <br />
                          <span className="text-xs">Registros ativos no Dynamics</span>
                        </div>
                        <div>
                          <strong>🚫 new_statusbloqueado eq false</strong>
                          <br />
                          <span className="text-xs">Criança não bloqueada</span>
                        </div>
                      </div>
                      <p className="mt-3">
                        <strong>💡 Nota:</strong> Este filtro garante que apenas crianças ativas e não bloqueadas 
                        sejam exibidas. Outros campos de status específicos podem não estar disponíveis na estrutura atual do Dynamics.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Status da requisição */}
                {loading.children && (
                  <Alert>
                    <span className="mr-2">🔄</span>
                    <AlertDescription>
                      <div className="flex items-center gap-2">
                        <div className="animate-spin">⭕</div>
                        <span>Buscando crianças no Dynamics CRM... Isso pode levar alguns segundos.</span>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Resumo dos filtros ativos */}
                {(filters.limit !== 20 || filters.searchName || filters.gender || filters.minAge || filters.maxAge) && (
                  <Alert>
                    <span className="mr-2">🎯</span>
                    <AlertDescription>
                      <strong>Filtros ativos:</strong>
                      {filters.limit !== 20 && ` Limite: ${filters.limit}`}
                      {filters.searchName && ` | Nome: "${filters.searchName}" ${filters.exactMatch ? '(exato)' : '(parcial)'}`}
                      {filters.gender && ` | Gênero: ${filters.gender}`}
                      {filters.minAge && ` | Idade mín: ${filters.minAge}`}
                      {filters.maxAge && ` | Idade máx: ${filters.maxAge}`}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Resultado da requisição */}
                {childrenData && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-2">
                        <Badge variant={childrenData.success ? 'default' : 'destructive'}>
                          {childrenData.success ? `✅ ${childrenData.count || 0} registros encontrados` : '❌ Erro na consulta'}
                        </Badge>
                        {childrenData.success && childrenData.count && (
                          <Badge variant="secondary">
                            📊 de {filters.limit > 0 ? `máximo ${filters.limit}` : 'todos'}
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => copyToClipboard(JSON.stringify(childrenData, null, 2))}
                        size="sm"
                        variant="ghost"
                      >
                        📋 Copiar
                      </Button>
                    </div>
                    
                    <Textarea
                      value={JSON.stringify(childrenData, null, 2)}
                      readOnly
                      className="h-96 font-mono text-xs"
                    />

                    {childrenData.success && childrenData.data && childrenData.data.length > 0 && (
                      <div className="mt-4">
                        <Label>Exemplo de registro (primeiro da lista):</Label>
                        <Textarea
                          value={JSON.stringify(childrenData.data[0], null, 2)}
                          readOnly
                          className="h-48 font-mono text-xs mt-2"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Criança Específica */}
        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Criança Específica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="childId">Contact ID</Label>
                    <Input
                      id="childId"
                      value={selectedChildId}
                      onChange={(e) => setSelectedChildId(e.target.value)}
                      placeholder="Ex: 50f0d764-3624-ef11-840a-002248e06b51"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={fetchSingleChild} 
                      disabled={loading.single || !selectedChildId.trim()}
                    >
                      {loading.single ? '🔄 Carregando...' : 'Buscar'}
                    </Button>
                  </div>
                </div>

                {/* Status da busca individual */}
                {loading.single && (
                  <Alert>
                    <span className="mr-2">🔄</span>
                    <AlertDescription>
                      <div className="flex items-center gap-2">
                        <div className="animate-spin">⭕</div>
                        <span>Buscando criança específica...</span>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Sugestão de IDs baseada nos dados já carregados */}
                {childrenData?.data && childrenData.data.length > 0 && (
                  <div>
                    <Label>IDs disponíveis (primeiros 10):</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {childrenData.data.slice(0, 10).map((child: any) => (
                        <Badge 
                          key={child.contactid}
                          variant="outline" 
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => setSelectedChildId(child.contactid)}
                        >
                          {child.contactid.substring(0, 8)}...
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {singleChildData && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={singleChildData.success ? 'default' : 'destructive'}>
                        {singleChildData.success ? 'Criança encontrada' : 'Erro na consulta'}
                      </Badge>
                      <Button
                        onClick={() => copyToClipboard(JSON.stringify(singleChildData, null, 2))}
                        size="sm"
                        variant="ghost"
                      >
                        📋 Copiar
                      </Button>
                    </div>
                    
                    <Textarea
                      value={JSON.stringify(singleChildData, null, 2)}
                      readOnly
                      className="h-96 font-mono text-xs"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Query Customizada */}
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Query Customizada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customQuery">Parâmetros de Query (formato URL)</Label>
                  <Input
                    id="customQuery"
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    placeholder="Ex: $top=10&$orderby=firstname desc"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Exemplos: $top=5, $orderby=firstname, $filter=statecode eq 0
                  </p>
                </div>

                {/* Status da query customizada */}
                {loading.custom && (
                  <Alert>
                    <span className="mr-2">🔄</span>
                    <AlertDescription>
                      <div className="flex items-center gap-2">
                        <div className="animate-spin">⭕</div>
                        <span>Executando query customizada...</span>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={executeCustomQuery} 
                    disabled={loading.custom || !customQuery.trim()}
                  >
                    {loading.custom ? '🔄 Executando...' : 'Executar Query'}
                  </Button>
                  <Button 
                    onClick={() => setCustomQuery('')} 
                    variant="outline"
                  >
                    Limpar
                  </Button>
                </div>

                {/* Exemplos de queries */}
                <div>
                  <Label>Exemplos de Queries:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[
                      '$top=5',
                      '$orderby=firstname',
                      '$orderby=lastname desc',
                      '$top=10&$orderby=birthdate',
                      '$filter=gendercode eq 1',
                      '$filter=gendercode eq 2'
                    ].map((example) => (
                      <Badge 
                        key={example}
                        variant="outline" 
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => setCustomQuery(example)}
                      >
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>

                {customResponse && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={customResponse.success ? 'default' : 'destructive'}>
                        {customResponse.success ? `${customResponse.count || 0} registros` : 'Erro na query'}
                      </Badge>
                      <Button
                        onClick={() => copyToClipboard(JSON.stringify(customResponse, null, 2))}
                        size="sm"
                        variant="ghost"
                      >
                        📋 Copiar
                      </Button>
                    </div>
                    
                    <Textarea
                      value={JSON.stringify(customResponse, null, 2)}
                      readOnly
                      className="h-96 font-mono text-xs"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campos Disponíveis */}
        <TabsContent value="fields">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Campos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableFields.length === 0 ? (
                  <Alert>
                    <span className="mr-2">⚠️</span>
                    <AlertDescription>
                      Execute a busca de crianças primeiro para analisar os campos disponíveis.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2 text-green-600">
                          ✅ Campos com Dados ({availableFields.filter(f => f.hasValue).length})
                        </h3>
                        <div className="space-y-1 max-h-96 overflow-y-auto">
                          {availableFields.filter(f => f.hasValue).map((field) => (
                            <div key={field.name} className="p-2 bg-green-50 rounded text-sm">
                              <div className="font-mono font-semibold">{field.name}</div>
                              <div className="text-gray-600">Tipo: {field.type}</div>
                              <div className="text-gray-800 truncate">
                                Valor: {typeof field.value === 'object' ? JSON.stringify(field.value) : String(field.value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2 text-orange-600">
                          ⚠️ Campos Vazios ({availableFields.filter(f => !f.hasValue).length})
                        </h3>
                        <div className="space-y-1 max-h-96 overflow-y-auto">
                          {availableFields.filter(f => !f.hasValue).map((field) => (
                            <div key={field.name} className="p-2 bg-orange-50 rounded text-sm">
                              <div className="font-mono font-semibold">{field.name}</div>
                              <div className="text-gray-600">Tipo: {field.type}</div>
                              <div className="text-gray-500">Sem dados</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded">
                      <h4 className="font-semibold mb-2">📊 Resumo:</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <strong>Total de campos:</strong> {availableFields.length}
                        </div>
                        <div>
                          <strong>Com dados:</strong> {availableFields.filter(f => f.hasValue).length}
                        </div>
                        <div>
                          <strong>Vazios:</strong> {availableFields.filter(f => !f.hasValue).length}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Estatísticas Quantitativas */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas Quantitativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Status de carregamento */}
                {loading.stats && (
                  <Alert>
                    <span className="mr-2">📊</span>
                    <AlertDescription>
                      <div className="flex items-center gap-2">
                        <div className="animate-spin">⭕</div>
                        <span>Carregando estatísticas do banco de dados...</span>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Seção de Contagem Total Real */}
                <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔢</span>
                    <h3 className="text-lg font-semibold text-yellow-800">Contagem Total Real</h3>
                  </div>
                  
                  <p className="text-sm text-yellow-700">
                    A API do Dynamics tem limite de 5000 registros por consulta. Use esta função para descobrir o total real através de paginação.
                  </p>

                  <div className="flex gap-2">
                    <Button 
                      onClick={fetchRealTotalCount} 
                      disabled={realTotalCount?.isRunning}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      {realTotalCount?.isRunning ? '🔄 Contando...' : '🔢 Buscar Total Real'}
                    </Button>
                    
                    {realTotalCount && !realTotalCount.isRunning && (
                      <Button 
                        onClick={() => setRealTotalCount(null)} 
                        variant="outline"
                      >
                        🗑️ Limpar
                      </Button>
                    )}
                  </div>

                  {realTotalCount && (
                    <div className="space-y-2">
                      {realTotalCount.isRunning && (
                        <Alert>
                          <span className="mr-2">⏳</span>
                          <AlertDescription>
                            <div className="flex items-center gap-2">
                              <div className="animate-spin">⭕</div>
                              <span>{realTotalCount.progress}</span>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}

                      {!realTotalCount.isRunning && (
                        <Alert className={realTotalCount.error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                          <span className="mr-2">{realTotalCount.error ? '❌' : '✅'}</span>
                          <AlertDescription>
                            {realTotalCount.error ? (
                              <div>
                                <strong>Erro:</strong> {realTotalCount.error}
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div><strong>Total Real:</strong> {realTotalCount.count.toLocaleString()} registros</div>
                                <div className="text-sm text-green-600">{realTotalCount.progress}</div>
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={fetchStatistics} 
                    disabled={loading.stats}
                  >
                    {loading.stats ? '📊 Carregando...' : '📊 Carregar Estatísticas'}
                  </Button>
                  <Button 
                    onClick={() => setStatistics(null)} 
                    variant="outline"
                  >
                    Limpar
                  </Button>
                </div>

                {statistics && (
                  <div className="space-y-6">
                    {statistics.error ? (
                      <Alert variant="destructive">
                        <span className="mr-2">❌</span>
                        <AlertDescription>
                          Erro ao carregar estatísticas: {statistics.error}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        {/* Estatísticas Principais */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-blue-600">📊 Visão Geral</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {statistics.queries.total?.count?.toLocaleString() || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Total de Registros</div>
                              {!statistics.queries.total?.success && (
                                <div className="text-xs text-red-500 mt-1">Erro na consulta</div>
                              )}
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {statistics.queries.ativos?.count?.toLocaleString() || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Registros Ativos</div>
                              <div className="text-xs text-green-600">
                                {statistics.derived.percentualAtivos}%
                              </div>
                            </div>

                            <div className="p-4 bg-orange-50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {statistics.queries.inativos?.count?.toLocaleString() || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Registros Inativos</div>
                              <div className="text-xs text-orange-600">
                                {(100 - parseFloat(statistics.derived.percentualAtivos)).toFixed(1)}%
                              </div>
                            </div>

                            <div className="p-4 bg-purple-50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {statistics.queries.bloqueados?.count?.toLocaleString() || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Registros Bloqueados</div>
                            </div>
                          </div>
                        </div>

                        {/* Estatísticas por Gênero */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-pink-600">👥 Distribuição por Gênero</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {statistics.queries.masculino?.count?.toLocaleString() || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Masculino</div>
                            </div>

                            <div className="p-4 bg-pink-50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-pink-600">
                                {statistics.queries.feminino?.count?.toLocaleString() || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Feminino</div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg text-center">
                              <div className="text-lg font-bold text-gray-600">
                                {statistics.derived.razaoMasculinoFeminino}
                              </div>
                              <div className="text-sm text-gray-600">Razão M/F</div>
                            </div>
                          </div>
                          
                          {/* Indicador de amostra */}
                          {statistics.queries.amostraTotal && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                              <div className="text-sm text-blue-600">
                                📊 <strong>Amostra analisada:</strong> {statistics.queries.amostraTotal.count?.toLocaleString()} registros
                              </div>
                              <div className="text-xs text-blue-500 mt-1">
                                ({((statistics.queries.amostraTotal.count / statistics.queries.total.count) * 100).toFixed(1)}% do total)
                              </div>
                            </div>
                          )}
                          
                          {/* Estatística adicional: Sem gênero */}
                          {statistics.queries.semGenero && (
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                  {statistics.queries.semGenero?.count?.toLocaleString() || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-600">Sem Gênero Definido</div>
                                <div className="text-xs text-yellow-600 mt-1">
                                  {statistics.queries.amostraTotal ? 
                                    `${((statistics.queries.semGenero.count / statistics.queries.amostraTotal.count) * 100).toFixed(1)}% da amostra` : ''
                                  }
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Completude de Dados */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-green-600">✅ Completude de Dados</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-green-50 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Com Data de Nascimento</span>
                                <span className="font-bold text-green-600">
                                  {statistics.queries.comDataNascimento?.count?.toLocaleString() || 'N/A'}
                                </span>
                              </div>
                              <div className="text-xs text-green-600 mt-1">
                                {statistics.derived.percentualComDataNascimento}% do total
                              </div>
                            </div>

                            <div className="p-4 bg-yellow-50 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Com Foto</span>
                                <span className="font-bold text-yellow-600">
                                  {statistics.queries.comFoto?.count?.toLocaleString() || 'N/A'}
                                </span>
                              </div>
                              <div className="text-xs text-yellow-600 mt-1">
                                {statistics.derived.percentualComFoto}% do total
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Detalhes Técnicos */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-gray-600">🔧 Detalhes Técnicos</h3>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Timestamp:</strong> {new Date(statistics.timestamp).toLocaleString('pt-BR')}
                              </div>
                              <div>
                                <strong>Queries executadas:</strong> {Object.keys(statistics.queries).length}
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <Button
                                onClick={() => copyToClipboard(JSON.stringify(statistics, null, 2))}
                                size="sm"
                                variant="ghost"
                              >
                                📋 Copiar Dados Completos
                              </Button>
                            </div>

                            <details className="mt-4">
                              <summary className="cursor-pointer font-semibold">Ver dados brutos</summary>
                              <Textarea
                                value={JSON.stringify(statistics, null, 2)}
                                readOnly
                                className="h-64 font-mono text-xs mt-2"
                              />
                            </details>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DynamicsDebug; 