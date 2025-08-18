import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { authService } from '@/services/authService';
import { dsoClient } from '@/lib/dso/DSOClient';
import { CheckCircle, XCircle, Loader2, Database, Globe, Users, Shield } from 'lucide-react';

export default function DSOConnectionTest() {
  const [isTestingDSO, setIsTestingDSO] = useState(false);
  const [isTestingCRM, setIsTestingCRM] = useState(false);
  const [dsoStatus, setDsoStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [crmStatus, setCrmStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [dsoError, setDsoError] = useState<string>('');
  const [crmError, setCrmError] = useState<string>('');
  const [dsoData, setDsoData] = useState<any>(null);
  const [crmData, setCrmData] = useState<any>(null);

  const testDSOConnection = async () => {
    setIsTestingDSO(true);
    setDsoStatus('idle');
    setDsoError('');
    setDsoData(null);

    try {
      // Testar conectividade básica
      const isConnected = await authService.testConnection();
      
      if (isConnected) {
        setDsoStatus('success');
        
        // Tentar buscar dados de exemplo
        try {
          const childrenData = await dsoClient.exploreAPIs();
          setDsoData(childrenData);
        } catch (error) {
          console.log('DSO conectado, mas não foi possível buscar dados de exemplo');
        }
      } else {
        setDsoStatus('error');
        setDsoError('Não foi possível conectar ao DSO');
      }
    } catch (error) {
      setDsoStatus('error');
      setDsoError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsTestingDSO(false);
    }
  };

  const testCRMConnection = async () => {
    setIsTestingCRM(true);
    setCrmStatus('idle');
    setCrmError('');
    setCrmData(null);

    try {
      // Testar conectividade com Dynamics CRM
      const response = await fetch('/api/dynamics/children?limit=1');
      
      if (response.ok) {
        const data = await response.json();
        setCrmStatus('success');
        setCrmData(data);
      } else {
        setCrmStatus('error');
        setCrmError(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      setCrmStatus('error');
      setCrmError(error instanceof Error ? error.message : 'Erro de conectividade');
    } finally {
      setIsTestingCRM(false);
    }
  };

  const getStatusIcon = (status: 'idle' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: 'idle' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Conectado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="secondary">Não testado</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Teste de Conectividade</h1>
        <p className="text-gray-600">Verifique a conectividade com DSO e Dynamics CRM</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teste DSO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              DSO (Donor Support Operations)
            </CardTitle>
            <CardDescription>
              Sistema de gerenciamento de doadores e autenticação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(dsoStatus)}
                {getStatusBadge(dsoStatus)}
              </div>
            </div>

            {dsoError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{dsoError}</p>
              </div>
            )}

            {dsoData && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700 font-medium mb-2">Dados de exemplo:</p>
                <pre className="text-xs text-green-600 overflow-auto">
                  {JSON.stringify(dsoData, null, 2)}
                </pre>
              </div>
            )}

            <Button 
              onClick={testDSOConnection} 
              disabled={isTestingDSO}
              className="w-full"
            >
              {isTestingDSO ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Testar Conexão DSO
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Teste CRM */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Dynamics CRM
            </CardTitle>
            <CardDescription>
              Sistema de gerenciamento de relacionamento com clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(crmStatus)}
                {getStatusBadge(crmStatus)}
              </div>
            </div>

            {crmError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{crmError}</p>
              </div>
            )}

            {crmData && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700 font-medium mb-2">Dados de exemplo:</p>
                <pre className="text-xs text-green-600 overflow-auto">
                  {JSON.stringify(crmData, null, 2)}
                </pre>
              </div>
            )}

            <Button 
              onClick={testCRMConnection} 
              disabled={isTestingCRM}
              className="w-full"
            >
              {isTestingCRM ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Testar Conexão CRM
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Informações do Ambiente */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Ambiente</CardTitle>
          <CardDescription>
            Configurações atuais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Variáveis de Ambiente</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Modo:</span>
                  <Badge variant={import.meta.env.VITE_APP_MODE === 'development' ? 'secondary' : 'default'}>
                    {import.meta.env.VITE_APP_MODE || 'development'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>DSO Host:</span>
                  <span className="text-gray-600">{import.meta.env.VITE_DSO_HOST || 'Não definido'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dynamics Env:</span>
                  <span className="text-gray-600">{import.meta.env.VITE_DYNAMICS_ENV || 'Não definido'}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Status dos Serviços</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>API Server:</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Frontend:</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como usar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Clique em "Testar Conexão DSO" para verificar a conectividade com o sistema de doadores</p>
            <p>2. Clique em "Testar Conexão CRM" para verificar a conectividade com o Dynamics CRM</p>
            <p>3. Os resultados mostrarão se as integrações estão funcionando corretamente</p>
            <p>4. Em caso de erro, verifique as configurações de ambiente e credenciais</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 