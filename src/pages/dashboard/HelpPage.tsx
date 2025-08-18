import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Search, HelpCircle, Mail, Phone, MessageSquare, ChevronRight, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import LoggedLayout from "../../components/layout/LoggedLayout";

const faqItems = [
  {
    question: "Como posso atualizar meus dados de pagamento?",
    answer: "Você pode atualizar seus dados de pagamento na seção 'Meu Perfil' da sua área do doador. Clique em 'Gerenciar Pagamento' para alterar cartão de crédito, dados bancários ou forma de pagamento."
  },
  {
    question: "Como funciona o apadrinhamento de uma criança?",
    answer: "O apadrinhamento é uma contribuição mensal de no mínimo R$ 75 que apoia diretamente uma criança específica. Você receberá relatórios de progresso, poderá trocar cartas e acompanhar o desenvolvimento educacional da criança."
  },
  {
    question: "Posso agendar uma visita à criança que apadrinho?",
    answer: "Sim! Você pode solicitar uma visita presencial ou virtual através da seção 'Visitas' na sua área do doador. As visitas são agendadas com antecedência mínima de 15 dias e dependem da disponibilidade da equipe local."
  },
  {
    question: "Como funciona o programa Guardião da Infância?",
    answer: "Como Guardião da Infância, sua contribuição mensal apoia programas comunitários que beneficiam múltiplas crianças e famílias. Você receberá relatórios de impacto e cartas comunitárias sobre os projetos apoiados."
  },
  {
    question: "Posso enviar cartas e presentes para minha criança apadrinhada?",
    answer: "Sim! Na seção 'Cartas' você pode escrever mensagens, enviar fotos e solicitar presentes especiais. As cartas são traduzidas quando necessário e entregues à criança através da nossa equipe local."
  },
  {
    question: "Como posso acompanhar o progresso da criança apadrinhada?",
    answer: "Você receberá relatórios de progresso regulares com informações sobre desenvolvimento educacional, saúde e atividades da criança. O próximo relatório será informado em breve na sua área do doador."
  },
  {
    question: "O que são os pedidos especiais e como posso fazer um?",
    answer: "Pedidos especiais são solicitações como presentes de aniversário, material escolar ou apoio em situações específicas. Você pode fazer pedidos especiais através da seção 'Cartas' na sua área do doador."
  },
  {
    question: "Posso alterar o valor da minha doação mensal?",
    answer: "Sim, você pode aumentar ou diminuir o valor da sua contribuição mensal a qualquer momento através da seção 'Meu Perfil', sempre respeitando o valor mínimo de R$ 75 para apadrinhamento."
  },
  {
    question: "Como posso cancelar minha contribuição?",
    answer: "Para cancelar sua contribuição, entre em contato conosco através do WhatsApp ou telefone. Nossa equipe irá orientá-lo sobre o processo e os prazos necessários."
  }
];

const contactMethods = [
  {
    title: "Telefone Principal",
    description: "Central de atendimento",
    icon: Phone,
    action: "Ligar agora",
    value: "0300 313 0110",
    schedule: "Segunda a sexta: 9h às 18h",
    link: "tel:03003130110"
  },
  {
    title: "WhatsApp - Quero apoiar",
    description: "Para quem quer começar a ajudar",
    icon: MessageSquare,
    action: "Abrir WhatsApp",
    value: "(31) 9 8793 5884",
    schedule: "Segunda a sexta: 9h às 18h",
    link: "https://wa.me/5531987935884?text=Olá! Preciso de ajuda para apadrinhar uma criança."
  },
  {
    title: "WhatsApp - Já sou doador(a)",
    description: "Para quem já é doador(a)",
    icon: MessageSquare,
    action: "Abrir WhatsApp",
    value: "(31) 9 9965 2936",
    schedule: "Segunda a sexta: 9h às 18h",
    link: "https://wa.me/5531999652936?text=Olá! Sou padrinho/madrinha e preciso de ajuda com minha área do doador."
  },
  {
    title: "E-mail",
    description: "Envie suas dúvidas detalhadas",
    icon: Mail,
    action: "Enviar e-mail",
    value: "atendimento@childfundbrasil.org.br",
    schedule: "Segunda a sexta: 9h às 18h",
    link: "mailto:atendimento@childfundbrasil.org.br?subject=Dúvida - Área do Doador"
  }
];

export default function HelpPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth/login");
    }
    
    document.title = "Ajuda e Suporte - ChildFund Brasil";
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-childfund-green"></div>
      </div>
    );
  }

  if (!user) return null;

  const filteredFaqItems = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContactClick = (method: typeof contactMethods[0]) => {
    window.open(method.link, "_blank");
  };

  const handleWhatsAppSupport = () => {
    // Determinar qual WhatsApp usar baseado no perfil do usuário
    let whatsappNumber = "5531987935884"; // Padrão para "quero apadrinhar"
    let message = "Olá! Preciso de ajuda para apadrinhar uma criança.";
    
    // Se o usuário já é padrinho, usar o número específico
    if (user?.donorType === "sponsor") {
      whatsappNumber = "5531999652936";
      message = "Olá! Sou " + encodeURIComponent(user?.name || "padrinho/madrinha") + " e preciso de ajuda com minha área do doador.";
    }
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <LoggedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-childfund-green">Ajuda e Suporte</h1>
            <p className="text-gray-600">Encontre respostas para suas dúvidas ou entre em contato conosco</p>
          </div>
          <Button
            onClick={handleWhatsAppSupport}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageSquare className="mr-2" size={16} />
            WhatsApp
            <ExternalLink className="ml-2" size={14} />
          </Button>
        </div>
        
        {/* Contatos com horários */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-childfund-green mb-2">Entre em Contato</h2>
            <p className="text-gray-600">Nossa equipe está disponível para atendê-lo nos seguintes canais:</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-childfund-green/10 flex items-center justify-center">
                      <method.icon className="text-childfund-green" size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{method.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                      <p className="text-sm font-medium text-childfund-green">{method.value}</p>
                    </div>
                    
                    {/* Horário de atendimento */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={14} />
                      <span>{method.schedule}</span>
                    </div>
                    
                    <Button
                      onClick={() => handleContactClick(method)}
                      variant="outline"
                      className="w-full border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white"
                    >
                      {method.action}
                      <ExternalLink className="ml-2" size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Busca */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Busque por palavras-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-childfund-green">Perguntas Frequentes</CardTitle>
            <CardDescription>
              Encontre respostas para as dúvidas mais comuns sobre sua experiência como doador
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredFaqItems.length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma pergunta encontrada</h3>
                <p className="text-gray-500 mb-4">
                  Tente buscar por outras palavras-chave ou entre em contato conosco.
                </p>
                <Button
                  onClick={handleWhatsAppSupport}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Falar no WhatsApp
                </Button>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
          
        {/* Ainda precisa de ajuda? */}
        <Card className="border-childfund-green/20">
          <CardHeader>
            <CardTitle className="text-childfund-green">Ainda precisa de ajuda?</CardTitle>
            <CardDescription>
              Nossa equipe está pronta para atender você com carinho e dedicação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-gray-600 mb-2">
                  Se você não encontrou a resposta que procurava, entre em contato conosco através do WhatsApp 
                  para um atendimento mais rápido e personalizado.
                </p>
                <div className="flex items-center gap-2 text-sm text-childfund-green">
                  <Clock size={14} />
                  <span>Disponível de segunda a sexta, das 9h às 18h</span>
                </div>
              </div>
              <Button
                onClick={handleWhatsAppSupport}
                className="bg-green-600 hover:bg-green-700 text-white min-w-fit"
              >
                <MessageSquare className="mr-2" size={16} />
                Solicitar Ajuda
                <ExternalLink className="ml-2" size={14} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </LoggedLayout>
  );
}
