import { useState, useRef } from 'react';
import RecaptchaWrapper, { RecaptchaWrapperRef } from '../components/RecaptchaWrapper';
import { Button } from '../components/ui/button';

export default function TestRecaptcha() {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<RecaptchaWrapperRef>(null);

  const handleRecaptchaChange = (token: string | null) => {
    console.log('reCAPTCHA token:', token);
    setRecaptchaToken(token);
  };

  const handleRecaptchaExpired = () => {
    console.log('reCAPTCHA expirado');
    setRecaptchaToken(null);
  };

  const handleRecaptchaError = () => {
    console.log('Erro no reCAPTCHA');
    setRecaptchaToken(null);
  };

  const handleReset = () => {
    recaptchaRef.current?.reset();
    setRecaptchaToken(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Teste do reCAPTCHA</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Informações de Debug</h2>
              <div className="bg-gray-100 p-4 rounded">
                <p><strong>Site Key:</strong> {import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'Não encontrada'}</p>
                <p><strong>Token:</strong> {recaptchaToken || 'Nenhum'}</p>
                <p><strong>Status:</strong> {recaptchaToken ? '✅ Verificado' : '❌ Não verificado'}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">reCAPTCHA</h2>
              <RecaptchaWrapper
                ref={recaptchaRef}
                onVerify={handleRecaptchaChange}
                onExpired={handleRecaptchaExpired}
                onError={handleRecaptchaError}
                className="mb-4"
              />
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleReset}
                variant="outline"
                className="flex-1"
              >
                Reset reCAPTCHA
              </Button>
              
              <Button 
                disabled={!recaptchaToken}
                className={`flex-1 ${recaptchaToken ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`}
              >
                {recaptchaToken ? 'Verificado!' : 'Complete o reCAPTCHA'}
              </Button>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Como acessar:</h3>
              <p className="text-gray-600">
                Vá para qualquer formulário de doação no site para ver o reCAPTCHA em ação:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                <li>Página "Como Apoiar" → Formulário de doação</li>
                <li>Formulário de Apadrinhamento</li>
                <li>Formulários unificados de doação</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 