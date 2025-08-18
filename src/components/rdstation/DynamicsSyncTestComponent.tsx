'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DynamicsSyncService } from '@/services/DynamicsSyncService'

export function DynamicsSyncTestComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const testDynamicsSync = async () => {
    setIsLoading(true)
    setResult('')
    
    try {
      console.log('🧪 [Dynamics Sync Test] Iniciando teste...')
      
      const syncResult = await DynamicsSyncService.syncContactAfterPayment(
        {
          // Dados pessoais simulados
          name: 'Usuário Teste',
          email: 'teste@childfund.org.br',
          phone: '+55 (11) 99999-9999',
          birthDate: '1990-01-01',
          gender: 'M',
          street: 'Rua Teste',
          number: '123',
          addressComplement: 'Apto 1',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          postalCode: '01234-567',
          country: 'Brasil',
          document: '123.456.789-00'
        },
        {
          // Dados da doação simulados
          donationType: 'sponsorship',
          amount: 74.00,
          paymentMethod: 'credit_card',
          childId: 'test-child-id',
          pay_duo_date: '05'
        },
        {
          // UTM data simulado
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'teste-campanha',
          utm_content: 'teste-conteudo',
          utm_term: 'teste-termo',
          worker: 'colaborador-teste'
        },
        'test-transaction-id-' + Date.now()
      )
      
      if (syncResult.success) {
        setResult(`✅ Sincronização realizada com sucesso!\nContact ID: ${syncResult.contactId}`)
        console.log('✅ [Dynamics Sync Test] Teste bem-sucedido:', syncResult)
      } else {
        setResult(`❌ Erro na sincronização: ${syncResult.error}`)
        console.error('❌ [Dynamics Sync Test] Teste falhou:', syncResult.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setResult(`❌ Erro crítico: ${errorMessage}`)
      console.error('❌ [Dynamics Sync Test] Erro crítico:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3 className="text-lg font-semibold mb-4 text-blue-800">🧪 Teste Dynamics CRM Sync</h3>
      
      <div className="text-sm text-blue-700 mb-4">
        Este componente testa a sincronização automática com o Dynamics CRM após pagamentos.
        Verifique o console para logs detalhados.
      </div>
      
      <Button 
        onClick={testDynamicsSync} 
        disabled={isLoading}
        className="mb-4 bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? 'Testando...' : 'Testar Sincronização Dynamics CRM'}
      </Button>
      
      {result && (
        <div className="mt-4 p-3 bg-white border rounded text-sm">
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
      
      <div className="text-xs text-blue-600 mt-2">
        <strong>O que este teste faz:</strong><br/>
        1. Simula dados de um usuário e doação<br/>
        2. Tenta sincronizar com o Dynamics CRM<br/>
        3. Cria contato, apadrinhamento e registros relacionados<br/>
        4. Reporta sucesso ou erro da operação
      </div>
    </div>
  )
}
