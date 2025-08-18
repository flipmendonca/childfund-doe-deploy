import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Heart, Home, Calendar, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { HashService } from "../services/HashService";
import { AnalyticsService } from "../services/AnalyticsService";

export default function SucessoDoacaoRecorrentePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isValidHash, setIsValidHash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactionData, setTransactionData] = useState<any>(null);

  const hash = searchParams.get('hash');
  const type = searchParams.get('type');

  useEffect(() => {
    document.title = "Doação Recorrente Ativada - ChildFund Brasil";
    
    // Validar hash
    if (!hash) {
      navigate('/');
      return;
    }

    // Validar hash usando HashService
    const validateHash = async () => {
      try {
        const isValid = await HashService.validateTransactionHash(hash);
        
        if (isValid) {
          setIsValidHash(true);
          
          // Obter dados da transação
          const data = HashService.getTransactionData(hash);
          setTransactionData(data);
          
          // Disparar eventos de analytics apenas para pagamentos
          if (type === 'payment' && data) {
            AnalyticsService.trackDonationSuccess({
              transactionId: data.transactionId || hash,
              donationType: data.donationType,
              amount: data.amount,
              paymentMethod: data.paymentMethod || 'unknown'
            });
          }
        } else {
          console.log('Hash inválido ou expirado');
          navigate('/');
        }
      } catch (error) {
        console.error('Erro ao validar hash:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    validateHash();
  }, [hash, type, navigate]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isValidHash) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <motion.main 
        className="flex-grow bg-gradient-to-b from-green-50 to-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Doação Recorrente Ativada!
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                Obrigado! Sua doação mensal fará uma diferença contínua na vida das crianças.
              </p>

              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-red-500 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Doação Mensal Confirmada
                  </h2>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Sua doação mensal de R$ {transactionData?.amount?.toFixed(2) || 'XX,XX'} foi configurada com sucesso! Todo mês, no mesmo dia, 
                  sua contribuição será processada automaticamente para apoiar nossos programas.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4">
                    <Calendar className="h-6 w-6 text-green-600 mb-2 mx-auto" />
                    <h3 className="font-semibold text-green-800 mb-1">Cobrança Mensal</h3>
                    <p className="text-green-700 text-sm">
                      Sua doação será debitada automaticamente todo mês no mesmo dia
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <CreditCard className="h-6 w-6 text-blue-600 mb-2 mx-auto" />
                    <h3 className="font-semibold text-blue-800 mb-1">Gerenciar Doação</h3>
                    <p className="text-blue-700 text-sm">
                      Você pode alterar ou cancelar sua doação a qualquer momento
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    <strong>Importante:</strong> Você receberá um e-mail de confirmação e 
                    relatórios mensais sobre o impacto da sua doação.
                    <br />
                    <span className="font-mono mt-2 block">Transação: {hash?.substring(0, 16)}...</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Gerenciar Doações
                </Button>
                
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Voltar ao Início
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.main>
      
      <Footer />
    </div>
  );
}