import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, RefreshCw, Bug, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface DSODebugPanelProps {
  user?: any;
  className?: string;
}

export default function DSODebugPanel({ user, className }: DSODebugPanelProps) {
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const runDSODebug = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Executando debug DSO...');
      
      const response = await fetch('http://localhost:3000/api/debug/dso', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setDebugData(data);
      
      if (!response.ok) {
        setError(data.error || 'Erro no debug DSO');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro no debug DSO:', err);
    } finally {
      setLoading(false);
    }
  };

  const runProfileDebug = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Executando debug do perfil...');
      
      // Construir parâmetros baseado no usuário logado
      const params = new URLSearchParams();
      if (user?.id) params.append('userId', user.id);
      if (user?.cpf) params.append('document', user.cpf);
      if (user?.email) params.append('email', user.email);
      
      const response = await fetch(`http://localhost:3000/api/user/profile?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      // Adicionar dados do debug do perfil ao debugData existente
      setDebugData(prev => ({
        ...prev,
        profileDebug: data,
        timestamp: new Date().toISOString()
      }));
      
      if (!response.ok) {
        setError(data.error || 'Erro no debug do perfil');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro no debug do perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Auto-executar debug básico ao montar
  useEffect(() => {
    runDSODebug();
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Debug DSO Integration
        </CardTitle>
        <CardDescription>
          Diagnóstico detalhado da integração com o sistema DSO
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles */}
        <div className="flex gap-2">
          <Button 
            onClick={runDSODebug}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Bug className="h-4 w-4 mr-2" />}
            Debug DSO
          </Button>
          <Button 
            onClick={runProfileDebug}
            disabled={loading || !user}
            variant="outline"
            size="sm"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Bug className="h-4 w-4 mr-2" />}
            Debug Perfil
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {debugData && (
          <div className="space-y-4">
            {/* Summary */}
            {debugData.summary && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Resumo dos Testes</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>Total: {debugData.summary.totalTests}</div>
                  <div className="text-green-600">✓ {debugData.summary.successfulTests}</div>
                  <div className="text-red-600">✗ {debugData.summary.failedTests}</div>
                  <div className="text-orange-600">⚠ {debugData.summary.errorTests}</div>
                </div>
              </div>
            )}

            {/* Dados do usuário */}
            {user && (
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
                  <ChevronRight className="h-4 w-4" />
                  Dados do Usuário
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 p-3 bg-gray-50 rounded text-xs">
                  <pre>{JSON.stringify(user, null, 2)}</pre>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Testes DSO */}
            {debugData.debugInfo?.tests && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Testes de Conectividade</h4>
                {debugData.debugInfo.tests.map((test: any, index: number) => (
                  <Collapsible key={index}>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                      <div className="flex items-center gap-2 flex-1">
                        {getStatusIcon(test.status)}
                        <span className="text-sm">{test.name}</span>
                        <Badge className={`text-xs ${getStatusColor(test.status)}`}>
                          {test.httpStatus || test.status}
                        </Badge>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 p-3 bg-gray-50 rounded">
                      <div className="space-y-2 text-xs">
                        <div><strong>URL:</strong> {test.url}</div>
                        <div><strong>Descrição:</strong> {test.description}</div>
                        {test.error && (
                          <div className="text-red-600">
                            <strong>Erro:</strong> {test.error}
                          </div>
                        )}
                        {test.responseText && (
                          <div>
                            <strong>Resposta:</strong>
                            <pre className="mt-1 p-2 bg-white rounded text-xs overflow-x-auto">
                              {test.responseText}
                            </pre>
                          </div>
                        )}
                        {test.headers && (
                          <Collapsible>
                            <CollapsibleTrigger className="text-xs text-blue-600">
                              Ver Headers
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <pre className="mt-1 p-2 bg-white rounded text-xs">
                                {JSON.stringify(test.headers, null, 2)}
                              </pre>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}

            {/* Debug do perfil */}
            {debugData.profileDebug && (
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
                  <ChevronRight className="h-4 w-4" />
                  Debug do Perfil
                  <Badge className={debugData.profileDebug.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {debugData.profileDebug.success ? 'Sucesso' : 'Falha'}
                  </Badge>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 p-3 bg-gray-50 rounded text-xs">
                  <pre>{JSON.stringify(debugData.profileDebug, null, 2)}</pre>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* LocalStorage Debug */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2">Debug LocalStorage</h4>
              <p className="text-xs text-blue-800 mb-2">
                Execute no console do browser (F12):
              </p>
              <div className="bg-blue-100 rounded p-2 text-xs font-mono">
                <div>localStorage.getItem('childfund-auth-data')</div>
                <div>localStorage.getItem('user')</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}