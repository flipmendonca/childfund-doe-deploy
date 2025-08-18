import { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Users, Star, Calendar, Award, Heart, AlertCircle, Construction, Home } from "lucide-react";
import LoggedLayout from "../../components/layout/LoggedLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BenefitsPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth/login");
    }
    
    document.title = "Benefícios & Comunidade - ChildFund Brasil";
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <LoggedLayout>
      {/* ✅ MODAL NÃO-FECHÁVEL PARA FUNCIONALIDADE EM DESENVOLVIMENTO */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Backdrop com blur */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center">
          {/* Ícone */}
          <div className="w-20 h-20 bg-childfund-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="w-10 h-10 text-childfund-orange" />
          </div>
          
          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Funcionalidade em Desenvolvimento
          </h2>
          
          {/* Descrição */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Estamos trabalhando para trazer uma experiência incrível em <strong>Benefícios & Comunidade</strong>. 
            Esta funcionalidade estará disponível em breve com recursos exclusivos para nossa comunidade de doadores.
          </p>
          
          {/* Features em desenvolvimento */}
          <div className="mb-8 text-sm text-gray-500 space-y-2">
            <p>• Programa de pontos e benefícios exclusivos</p>
            <p>• Comunidade interativa de padrinhos</p>
            <p>• Eventos especiais e encontros</p>
            <p>• Certificados e reconhecimentos</p>
          </div>
          
          {/* Botão para voltar */}
          <Button 
            onClick={handleGoToDashboard}
            className="w-full bg-childfund-green hover:bg-childfund-green/90 text-white py-3"
          >
            <Home className="w-5 h-5 mr-2" />
            Voltar para o Dashboard
          </Button>
        </div>
      </div>

      {/* ✅ CONTEÚDO DA PÁGINA FICA ATRÁS DO MODAL (COM BLUR) */}
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-2">Benefícios & Comunidade</h1>
          <p className="text-gray-600">Conheça os benefícios exclusivos para doadores e participe de nossa comunidade de impacto.</p>
          <Alert className="bg-yellow-50 border-yellow-200 mt-4">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Feature em Desenvolvimento</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Esta área está em desenvolvimento. Em breve você terá acesso a todos os benefícios e funcionalidades da comunidade.
            </AlertDescription>
          </Alert>
        </div>
        
        <Tabs defaultValue="benefits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="benefits" className="flex items-center gap-2">
              <Gift size={16} />
              Meus Benefícios
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users size={16} />
              Comunidade
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar size={16} />
              Eventos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="benefits">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="text-yellow-500" size={20} />
                    Status: Padrinho Gold
                  </CardTitle>
                  <CardDescription>
                    Você desbloqueou benefícios especiais!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Award className="text-green-600" size={20} />
                      <div>
                        <p className="font-medium">Certificado de Reconhecimento</p>
                        <p className="text-sm text-gray-600">Disponível para download</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Gift className="text-blue-600" size={20} />
                      <div>
                        <p className="font-medium">Kit Exclusivo ChildFund</p>
                        <p className="text-sm text-gray-600">Enviado anualmente</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Calendar className="text-purple-600" size={20} />
                      <div>
                        <p className="font-medium">Acesso Prioritário a Eventos</p>
                        <p className="text-sm text-gray-600">Convites especiais</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Programa de Fidelidade</CardTitle>
                  <CardDescription>
                    Ganhe pontos e desbloqueie novos benefícios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Pontos Atuais</span>
                        <span className="text-sm">2,450 pontos</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-3/4"></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">550 pontos para o próximo nível</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Como ganhar pontos:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 100 pontos por doação mensal</li>
                        <li>• 50 pontos por carta enviada</li>
                        <li>• 200 pontos por indicação de amigo</li>
                        <li>• 300 pontos por participação em eventos</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Benefícios Disponíveis</CardTitle>
                  <CardDescription>
                    Resgate seus pontos por benefícios exclusivos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-center">
                        <Gift className="text-blue-600 mx-auto mb-2" size={24} />
                        <h4 className="font-medium">Camiseta ChildFund</h4>
                        <p className="text-sm text-gray-600 mb-3">500 pontos</p>
                        <Button size="sm" disabled>
                          Indisponível
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="text-center">
                        <Award className="text-green-600 mx-auto mb-2" size={24} />
                        <h4 className="font-medium">Certificado Personalizado</h4>
                        <p className="text-sm text-gray-600 mb-3">1,000 pontos</p>
                        <Button size="sm" disabled>
                          Indisponível
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="text-center">
                        <Calendar className="text-purple-600 mx-auto mb-2" size={24} />
                        <h4 className="font-medium">Visita Guiada</h4>
                        <p className="text-sm text-gray-600 mb-3">2,000 pontos</p>
                        <Button size="sm">
                          Resgatar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="community">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="text-blue-600" size={20} />
                    Comunidade de Padrinhos
                  </CardTitle>
                  <CardDescription>
                    Conecte-se com outros padrinhos e madrinhas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Estatísticas da Comunidade</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Total de Padrinhos:</span>
                          <span className="text-sm font-medium">15,847</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Crianças Apadrinhadas:</span>
                          <span className="text-sm font-medium">12,934</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Cartas Enviadas (mês):</span>
                          <span className="text-sm font-medium">2,341</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Últimas Atividades</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Heart className="text-blue-600" size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Ana M. enviou uma carta</p>
                            <p className="text-xs text-gray-600">há 2 horas</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="text-green-600" size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Carlos S. se tornou padrinho</p>
                            <p className="text-xs text-gray-600">há 5 horas</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Calendar className="text-purple-600" size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Maria R. agendou uma visita</p>
                            <p className="text-xs text-gray-600">há 1 dia</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Histórias de Impacto</CardTitle>
                  <CardDescription>
                    Conheça histórias inspiradoras de nossa comunidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                      <h4 className="font-medium text-blue-900">João completou o ensino médio!</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        "Graças ao apoio de meus padrinhos, consegui me formar e agora vou para a universidade!" - João, 18 anos
                      </p>
                    </div>
                    
                    <div className="p-4 border-l-4 border-green-500 bg-green-50">
                      <h4 className="font-medium text-green-900">Nova escola inaugurada</h4>
                      <p className="text-sm text-green-800 mt-1">
                        Com a ajuda de nossa comunidade, inauguramos uma nova escola em Minas Gerais que atenderá 200 crianças.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="events">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="text-purple-600" size={20} />
                    Próximos Eventos
                  </CardTitle>
                  <CardDescription>
                    Participe de eventos exclusivos para nossa comunidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Encontro de Padrinhos - São Paulo</h4>
                          <p className="text-sm text-gray-600">15 de Janeiro, 2025 • 14h às 18h</p>
                          <p className="text-sm text-gray-600">Centro de Convenções Anhembi</p>
                        </div>
                        <Button size="sm">
                          Inscrever-se
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700">
                        Venha conhecer outros padrinhos, participar de palestras e atividades especiais.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Webinar: O Futuro da Educação</h4>
                          <p className="text-sm text-gray-600">28 de Janeiro, 2025 • 19h às 20h</p>
                          <p className="text-sm text-gray-600">Online via Zoom</p>
                        </div>
                        <Button size="sm">
                          Participar
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700">
                        Palestra sobre inovações educacionais e como elas impactam nossas comunidades.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Visita ao Projeto - Rio de Janeiro</h4>
                          <p className="text-sm text-gray-600">10 de Fevereiro, 2025 • 9h às 16h</p>
                          <p className="text-sm text-gray-600">Comunidade São José</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Lista de Espera
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700">
                        Conheça de perto um de nossos projetos e veja o impacto do seu apoio.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </LoggedLayout>
  );
}
