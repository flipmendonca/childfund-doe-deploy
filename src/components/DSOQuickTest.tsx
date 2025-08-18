/**
 * Componente para teste r\u00e1pido da integra\u00e7\u00e3o DSO
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';

export default function DSOQuickTest() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { user, isDSOMode, isMockMode, refreshProfile } = useAuth();

  const runQuickTest = async () => {
    setIsRunning(true);
    setTestResult(null);

    try {
      console.log('\ud83d\ude80 [DSOQuickTest] Iniciando teste r\u00e1pido...');
      
      // Usar as fun\u00e7\u00f5es globais de teste
      const debugResult = await (window as any).testDSO?.debugCurrentUser();
      
      setTestResult({
        success: true,
        timestamp: new Date().toLocaleTimeString(),
        debug: debugResult,
        authState: {
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            cpf: user.cpf,
            isDSOUser: user.isDSOUser
          } : null,
          isDSOMode,
          isMockMode
        },
        localStorage: {
          dsoToken: !!localStorage.getItem('dso-token'),
          authData: !!localStorage.getItem('childfund-auth-data')
        }
      });
    } catch (error) {
      console.error('Erro no teste r\u00e1pido:', error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runLoginTest = async () => {
    setIsRunning(true);
    try {
      console.log('\ud83d\udd10 [DSOQuickTest] Testando login DSO...');
      
      const loginResult = await (window as any).testDSO?.loginRealUser();
      
      if (loginResult?.success) {
        console.log('\u2705 [DSOQuickTest] Login bem-sucedido, recarregando p\u00e1gina...');
        // For\u00e7ar recarga da p\u00e1gina para aplicar novo estado
        window.location.reload();
      } else {
        setTestResult({
          success: false,
          error: 'Login DSO falhou',
          details: loginResult,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro no login',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800 text-sm flex items-center gap-2">
          🔧 DSO Quick Test
        </CardTitle>
        <CardDescription className="text-orange-600 text-xs">
          Teste rápido da integração DSO
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={runQuickTest}
            disabled={isRunning}
            variant="outline" 
            size="sm"
            className="text-xs"
          >
            🔍 Debug Estado
          </Button>
          
          <Button 
            onClick={runLoginTest}
            disabled={isRunning}
            variant="outline" 
            size="sm"
            className="text-xs bg-green-50"
          >
            🔐 Testar Login
          </Button>
          
          {isDSOMode && refreshProfile && (
            <Button 
              onClick={refreshProfile}
              disabled={isRunning}
              variant="outline" 
              size="sm"
              className="text-xs"
            >
              🔄 Refresh DSO
            </Button>
          )}
        </div>

        {/* Estado atual */}
        <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
          <div><strong>Modo:</strong> {isMockMode ? 'Mock' : isDSOMode ? 'DSO' : 'Local'}</div>
          <div><strong>Usuário:</strong> {user?.name || 'Não logado'}</div>
          <div><strong>Token DSO:</strong> {localStorage.getItem('dso-token') ? 'Presente' : 'Ausente'}</div>
        </div>

        {/* Resultado do teste */}
        {testResult && (
          <div className="text-xs">
            <div className="font-medium mb-1">📄 Resultado ({testResult.timestamp}):</div>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-48">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {isRunning && (
          <div className="text-xs text-orange-600 flex items-center gap-1">
            <div className="animate-spin rounded-full h-3 w-3 border-t border-orange-600"></div>
            Executando teste...
          </div>
        )}
      </CardContent>
    </Card>
  );
}