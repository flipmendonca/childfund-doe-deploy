'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sendEventConversionRD } from '@/utils/rdstation/conversion'

export function RDTestComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const testEvent = async () => {
    setIsLoading(true)
    setResult('')
    
    try {
      const response = await sendEventConversionRD(
        'Teste de Integração',
        'teste@childfund.org.br',
        {
          cf_valor: '100.00',
          cf_form_type: 'teste',
          name: 'Usuário Teste',
          mobile_phone: '11999999999',
          state: 'SP',
          city: 'São Paulo'
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setResult(`✅ Sucesso! Resposta: ${JSON.stringify(data, null, 2)}`)
      } else {
        setResult(`❌ Erro ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      setResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">🧪 Teste RD Station</h3>
      
      <Button 
        onClick={testEvent} 
        disabled={isLoading}
        className="mb-4"
      >
        {isLoading ? 'Testando...' : 'Testar Evento RD Station'}
      </Button>
      
      {result && (
        <div className="mt-4 p-3 bg-white border rounded text-sm">
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
      
      <div className="text-xs text-gray-600 mt-2">
        Este componente testa a integração com o RD Station.
        Verifique o console para logs detalhados.
      </div>
    </div>
  )
}
