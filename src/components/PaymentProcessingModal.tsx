import { motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface PaymentProcessingModalProps {
  isOpen: boolean;
  stage: 'processing' | 'success' | 'error';
  message?: string;
  onClose?: () => void;
}

export default function PaymentProcessingModal({ 
  isOpen, 
  stage, 
  message,
  onClose 
}: PaymentProcessingModalProps) {
  const [dots, setDots] = useState('');

  // Animação dos pontos de carregamento
  useEffect(() => {
    if (stage === 'processing') {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [stage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop com blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={stage !== 'processing' ? onClose : undefined}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-white rounded-3xl shadow-2xl p-8 mx-4 max-w-md w-full text-center"
      >
        {/* Logo ChildFund */}
        <div className="mb-6 flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            className="relative w-24 h-24 bg-gradient-to-br from-[#007A45] via-[#3CC387] to-[#007A45] rounded-3xl flex items-center justify-center shadow-xl"
          >
            {/* Inner circle with heart */}
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
              <div className="text-[#007A45] font-bold text-lg">
                <Heart className="w-8 h-8 fill-current" />
              </div>
            </div>
            {/* Glowing effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#007A45] to-[#3CC387] rounded-3xl opacity-20 animate-pulse"></div>
          </motion.div>
        </div>

        {stage === 'processing' && (
          <>
            {/* Spinner animado */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6 flex justify-center"
            >
              <Loader2 className="w-12 h-12 text-[#007A45] animate-spin" />
            </motion.div>

            {/* Título e mensagem */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-[#007A45] mb-3">
                Processando Pagamento{dots}
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Estamos processando seu apadrinhamento com segurança. 
                Este processo pode levar alguns instantes.
              </p>
              
              {/* Barra de progresso indeterminada */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#007A45] to-[#3CC387]"
                  animate={{
                    x: ["-100%", "100%"]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                  style={{ width: "50%" }}
                />
              </div>

              <p className="text-sm text-gray-500">
                ⚠️ Por favor, não feche esta janela nem atualize a página
              </p>
            </motion.div>
          </>
        )}

        {stage === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-3">
              Pagamento Aprovado!
            </h2>
            <p className="text-gray-600 mb-4">
              Seu apadrinhamento foi processado com sucesso.
              Redirecionando para a página de confirmação...
            </p>
          </motion.div>
        )}

        {stage === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              Erro no Processamento
            </h2>
            <p className="text-gray-600 mb-6">
              {message || "Houve um problema ao processar seu pagamento. Tente novamente."}
            </p>
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Tentar Novamente
            </button>
          </motion.div>
        )}

        {/* Indicadores de etapas para processamento */}
        {stage === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex justify-center space-x-2"
          >
            {['Validando dados', 'Processando pagamento', 'Confirmando'].map((step, index) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                  index <= 1 ? 'bg-[#007A45]' : 'bg-gray-300'
                }`}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}