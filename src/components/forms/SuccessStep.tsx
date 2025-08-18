import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle, 
  Heart, 
  Mail, 
  Download, 
  Home,
  User,
  Calendar,
  CreditCard
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface SuccessStepProps {
  donationType: 'sponsorship' | 'donate' | 'recurrent';
  donationValue: number;
  childData?: {
    id: string;
    name: string;
    age: number;
    location: string;
    image: string;
  };
  isLoggedUser?: boolean;
}

export default function SuccessStep({ 
  donationType, 
  donationValue, 
  childData,
  isLoggedUser = false
}: SuccessStepProps) {
  
  const getSuccessMessage = () => {
    switch (donationType) {
      case 'sponsorship':
        return {
          title: childData ? `Parabéns! Você agora é padrinho/madrinha do(a) ${childData.name}!` : 'Parabéns! Você agora é um padrinho/madrinha!',
          subtitle: 'Sua jornada de apadrinhamento começou hoje',
          description: childData 
            ? `Você criou uma conexão especial com ${childData.name}. Em breve, receberá informações sobre como acompanhar o desenvolvimento da criança.`
            : 'Você criou uma conexão especial com uma criança. Em breve, receberá informações sobre seu afilhado(a).',
          icon: '🤝',
          color: 'bg-gradient-to-br from-childfund-green to-green-600'
        };
      case 'recurrent':
        return {
          title: 'Obrigado! Você se tornou um Guardião da Infância!',
          subtitle: 'Sua contribuição mensal fará a diferença',
          description: 'Com sua doação recorrente, você garante um impacto contínuo na vida de várias crianças em situação de vulnerabilidade.',
          icon: '🛡️',
          color: 'bg-gradient-to-br from-blue-500 to-blue-600'
        };
      case 'donate':
        return {
          title: 'Muito obrigado pela sua doação!',
          subtitle: 'Sua generosidade transformará vidas',
          description: 'Sua contribuição única chegará diretamente às crianças que mais precisam, gerando um impacto imediato.',
          icon: '❤️',
          color: 'bg-gradient-to-br from-purple-500 to-purple-600'
        };
      default:
        return {
          title: 'Obrigado pela sua contribuição!',
          subtitle: 'Juntos, transformamos vidas',
          description: 'Sua doação fará toda a diferença na vida das crianças atendidas pela ChildFund Brasil.',
          icon: '🙏',
          color: 'bg-gradient-to-br from-childfund-green to-green-600'
        };
    }
  };

  const successInfo = getSuccessMessage();

  const getNextSteps = () => {
    const baseSteps = [
      {
        icon: Mail,
        title: 'Confirmação por e-mail',
        description: 'Você receberá um e-mail com todos os detalhes da sua doação em alguns minutos.'
      }
    ];

    if (donationType === 'sponsorship') {
      return [
        ...baseSteps,
        {
          icon: User,
          title: childData ? 'Conheça seu afilhado(a)' : 'Informações da criança',
          description: childData 
            ? `Em breve, você receberá informações detalhadas sobre ${childData.name}, incluindo como se corresponder.`
            : 'Em breve, você receberá informações sobre a criança que você apadrinhou.'
        },
        {
          icon: Calendar,
          title: 'Acompanhe o desenvolvimento',
          description: 'Relatórios regulares mostrarão como sua contribuição está transformando a vida da criança.'
        }
      ];
    } else if (donationType === 'recurrent') {
      return [
        ...baseSteps,
        {
          icon: CreditCard,
          title: 'Cobrança mensal',
          description: 'Sua contribuição será cobrada mensalmente na mesma data de hoje.'
        },
        {
          icon: Calendar,
          title: 'Relatórios de impacto',
          description: 'Você receberá relatórios mostrando o impacto das suas contribuições regulares.'
        }
      ];
    } else {
      return [
        ...baseSteps,
        {
          icon: Download,
          title: 'Certificado de doação',
          description: 'Seu certificado de doação estará disponível para download em sua área pessoal.'
        }
      ];
    }
  };

  const nextSteps = getNextSteps();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-8"
    >
      {/* Header de sucesso */}
      <div className="space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className={`w-20 h-20 ${successInfo.color} rounded-full flex items-center justify-center mx-auto text-white text-3xl shadow-lg`}
        >
          <CheckCircle size={40} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {successInfo.title}
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            {successInfo.subtitle}
          </p>
          <p className="text-gray-700 max-w-md mx-auto">
            {successInfo.description}
          </p>
        </motion.div>
      </div>

      {/* Dados da criança (se apadrinhamento) */}
      {childData && donationType === 'sponsorship' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <Card className="bg-gradient-to-r from-childfund-green/5 to-childfund-green/10 border border-childfund-green/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <img 
                  src={childData.image} 
                  alt={childData.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div className="text-left">
                  <h3 className="font-bold text-lg">{childData.name}</h3>
                  <p className="text-gray-600">{childData.age} anos • {childData.location}</p>
                  <p className="text-sm text-childfund-green font-medium mt-1">
                    Seu afilhado(a) ❤️
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Resumo da doação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center justify-center gap-2">
              <Heart className="text-red-500" size={20} />
              Resumo da sua contribuição
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Tipo:</span>
                <span className="font-medium">
                  {donationType === 'sponsorship' && 'Apadrinhamento'}
                  {donationType === 'recurrent' && 'Doação Recorrente'}
                  {donationType === 'donate' && 'Doação Única'}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Valor:</span>
                <span className="text-childfund-green">
                  {formatCurrency(donationValue)}
                  {donationType !== 'donate' && '/mês'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Próximos passos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <h3 className="text-xl font-bold mb-6">Próximos passos</h3>
        <div className="grid gap-4">
          {nextSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
            >
              <Card className="text-left">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-childfund-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <step.icon className="text-childfund-green" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Ações */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
      >
        {isLoggedUser ? (
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-childfund-green text-white hover:bg-childfund-green/90 flex items-center gap-2"
            size="lg"
          >
            <User size={18} />
            Ir para minha área
          </Button>
        ) : (
          <Button 
            onClick={() => window.location.href = '/auth/register'}
            className="bg-childfund-green text-white hover:bg-childfund-green/90 flex items-center gap-2"
            size="lg"
          >
            <User size={18} />
            Criar minha conta
          </Button>
        )}
        
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2"
          size="lg"
        >
          <Home size={18} />
          Voltar ao início
        </Button>
      </motion.div>

      {/* Mensagem final */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-2xl mx-auto"
      >
        <div className="text-center">
          <h4 className="font-semibold text-green-900 mb-2 text-lg">
            {successInfo.icon} Obrigado por fazer parte da nossa família!
          </h4>
          <p className="text-green-800">
            Juntos, estamos construindo um futuro melhor para crianças em situação de vulnerabilidade. 
            Sua contribuição é mais do que uma doação - é um ato de amor e esperança.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}