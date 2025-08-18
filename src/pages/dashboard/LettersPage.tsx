import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft, Send, Eye, Upload, X, Mail, MailOpen, FileText, Image, AlertCircle, CheckCircle, Heart, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import LoggedLayout from "../../components/layout/LoggedLayout";
import { DSOService } from "@/services/DSOService";
import { useDonorData } from "../../hooks/useDonorData";

// Interface compatível com produção
interface Letter {
  childId: string;
  childName: string;
  childImage: string; // Base64
  letterId: string;
  title: string;
  message: string;
  status: number;
  sentDate: string;
}

// Interface para compatibilidade com a UI atual
interface DisplayLetter {
  id: string;
  date: string;
  type: "sent" | "received";
  content: string;
  hasAttachment: boolean;
  attachmentName?: string;
  status: "delivered" | "pending" | "received";
}

// Interfaces baseadas na documentação DSO
interface RealChild {
  id: string;
  contactid: string;
  firstname: string;
  lastname: string;
  fullname?: string;
  cidade?: string;
  estado?: string;
  address1_city?: string;
  address1_stateorprovince?: string;
  new_idade_pessoa?: string;
  birthdate?: string;
}

export default function LettersPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const donorData = useDonorData();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [letters, setLetters] = useState<DisplayLetter[]>([]);
  const [isLoadingLetters, setIsLoadingLetters] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<DisplayLetter | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [children, setChildren] = useState<RealChild[]>([]);

  const maxChars = 1000;
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  // Verificar se usuário tem perfil de padrinho
  const isGodparent = donorData?.profile === "padrinho";
  const hasActiveSponsorships = (donorData as any)?.sponsorships && (donorData as any).sponsorships.length > 0;

  // ✅ FUNÇÃO PARA NAVEGAÇÃO COM REFRESH QUANDO NECESSÁRIO
  const handleNavigation = (path: string) => {
    console.log('🔍 [LettersPage] Tentando navegar para:', path, 'Atual:', location.pathname);
    
    if (location.pathname === path) {
      // Se já estamos na página, force um refresh
      console.log('🔄 [LettersPage] Forçando refresh da página');
      window.location.reload();
    } else {
      // Navegação forçada com window.location para garantir que funcione
      console.log('🚀 [LettersPage] Forçando navegação com window.location');
      window.location.href = path;
    }
  };

  // Função para converter cartas da produção para formato de display
  const convertProductionLettersToDisplay = (productionLetters: Letter[]): DisplayLetter[] => {
    return productionLetters.map((letter: Letter) => ({
      id: letter.letterId || Math.random().toString(),
      date: letter.sentDate,
      type: "sent", // Por enquanto todas as cartas são enviadas pelo padrinho
      content: letter.message,
      hasAttachment: false, // TODO: Verificar se há attachments na API
      status: letter.status === 1 ? "delivered" : "pending",
    }));
  };

  // Carregar histórico real de cartas
  const loadLettersHistory = async (childId?: string) => {
    if (!user) return;

    setIsLoadingLetters(true);
    try {
      console.log('🔍 Carregando histórico de cartas...');
      
      const response = await DSOService.getLettersHistory(childId);
      
      console.log('✅ Resposta completa do histórico de cartas:', response);
      
      // Verificar se há erro na resposta
      if (response.message && !response.success) {
        console.warn('⚠️ Erro na API:', response.message);
        setLetters([]);
        return;
      }
      
      // Processar cartas da produção
      if (response.success === 'letters' && response.data?.letters) {
        console.log('📧 Cartas encontradas:', response.data.letters);
        
        // Filtrar por criança se especificado
        let filteredLetters = response.data.letters;
        if (childId && selectedChildId) {
          filteredLetters = response.data.letters.filter((letter: Letter) => letter.childId === selectedChildId);
          console.log('🎯 Cartas filtradas para criança:', selectedChildId, filteredLetters);
        }
        
        const displayLetters = convertProductionLettersToDisplay(filteredLetters);
        setLetters(displayLetters);
        console.log('✅ Cartas convertidas para display:', displayLetters);
      } else {
        console.log('📭 Nenhuma carta encontrada');
        setLetters([]);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar histórico de cartas:', error);
      setLetters([]);
    } finally {
      setIsLoadingLetters(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth/login");
      return;
    }
    
    document.title = "Envie uma Carta - ChildFund Brasil";
    
    // Carregar crianças apadrinhadas dos dados reais
    if ((donorData as any)?.sponsorships && (donorData as any).sponsorships.length > 0) {
      const realChildren: RealChild[] = (donorData as any).sponsorships.map((sponsorship: any) => ({
        id: sponsorship.childId,
        contactid: sponsorship.childId,
        firstname: sponsorship.childName.split(' ')[0] || sponsorship.childName,
        lastname: sponsorship.childName.split(' ').slice(1).join(' ') || '',
        fullname: sponsorship.childName,
        // Dados adicionais podem vir do sponsoredChild se disponível
        cidade: (donorData as any).sponsoredChild?.location?.split(',')[0] || '',
        estado: (donorData as any).sponsoredChild?.location?.split(',')[1]?.trim() || '',
        new_idade_pessoa: (donorData as any).sponsoredChild?.age?.toString() || '',
      }));
      setChildren(realChildren);
    }
    
    // Verificar se há um child ID nos parâmetros da URL
    const childParam = searchParams.get('child');
    if (childParam && children.find(child => child.id === childParam)) {
      setSelectedChildId(childParam);
    } else if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [user, isLoading, navigate, searchParams, children, selectedChildId, donorData]);

  // Carregar histórico quando o usuário ou criança selecionada mudar
  useEffect(() => {
    if (user && selectedChildId) {
      loadLettersHistory(selectedChildId);
    }
  }, [user, selectedChildId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-childfund-green"></div>
      </div>
    );
  }

  if (!user) return null;

  // Renderizar CTA para não-padrinhos
  if (!isLoading && !isGodparent) {
    return (
      <LoggedLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Cabeçalho */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigation('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-childfund-green">Envie uma Carta</h1>
              <p className="text-gray-600">
                Funcionalidade disponível apenas para padrinhos e madrinhas
              </p>
            </div>
          </div>

          {/* CTA de Incentivo ao Apadrinhamento */}
          <Card className="text-center py-12 border-childfund-green/30">
            <CardContent className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-childfund-green/10 rounded-full flex items-center justify-center">
                <Heart className="text-childfund-green" size={32} />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-childfund-green">Transforme vidas através do apadrinhamento</h2>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Para enviar cartas e acompanhar o desenvolvimento de uma criança, você precisa se tornar padrinho ou madrinha. 
                  Com o apadrinhamento, você cria um vínculo especial e pode trocar cartas, agendar visitas e acompanhar 
                  o crescimento da criança ao longo dos anos.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 my-8">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-childfund-blue/10 rounded-full flex items-center justify-center mb-3">
                    <Mail className="text-childfund-blue" size={20} />
                  </div>
                  <h3 className="font-semibold text-childfund-blue mb-2">Troque Cartas</h3>
                  <p className="text-sm text-gray-600">Envie e receba cartas da criança que você apadrinhar</p>
                </div>
                
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-childfund-orange/10 rounded-full flex items-center justify-center mb-3">
                    <Users className="text-childfund-orange" size={20} />
                  </div>
                  <h3 className="font-semibold text-childfund-orange mb-2">Acompanhe o Crescimento</h3>
                  <p className="text-sm text-gray-600">Receba relatórios de progresso e atualizações regulares</p>
                </div>
                
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <Star className="text-purple-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-purple-600 mb-2">Faça a Diferença</h3>
                  <p className="text-sm text-gray-600">Impacte diretamente a vida de uma criança e sua família</p>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={() => handleNavigation('/apadrinhamento')}
                  size="lg"
                  className="bg-childfund-green hover:bg-childfund-green/90 text-white font-bold px-8 py-3"
                >
                  <Heart className="mr-2" size={20} />
                  Quero Apadrinhar uma Criança
                </Button>
                
                <p className="text-sm text-gray-500">
                  A partir de R$ 74,00 por mês você muda uma vida para sempre
                </p>
              </div>

              <Alert className="text-left mt-8">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Já é padrinho/madrinha?</strong><br />
                  Se você já apadrinhou uma criança, entre em contato conosco pelo WhatsApp ou email 
                  para verificar seus dados e ativar o acesso completo à sua área logada.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </LoggedLayout>
    );
  }

  // Se é padrinho mas não tem apadrinhamentos ativos
  if (isGodparent && children.length === 0) {
    return (
      <LoggedLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigation('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-childfund-green">Envie uma Carta</h1>
              <p className="text-gray-600">Seus dados de apadrinhamento estão sendo processados</p>
            </div>
          </div>
          
          <Card className="text-center py-12">
            <CardContent>
              <Mail className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Carregando suas crianças apadrinhadas...</h3>
              <p className="text-gray-500 mb-6">
                Se você já apadrinhou uma criança, seus dados estão sendo sincronizados. 
                Caso o problema persista, entre em contato conosco.
              </p>
              <div className="space-x-4">
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white"
                >
                  Atualizar Página
                </Button>
                <Button 
                  onClick={() => handleNavigation('/dashboard/help')}
                  className="bg-childfund-green hover:bg-childfund-green/90"
                >
                  Preciso de Ajuda
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </LoggedLayout>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > maxFileSize) {
        toast.error("Arquivo muito grande. O tamanho máximo é 5MB.");
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Formato não permitido. Use apenas JPG, PNG ou PDF.");
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSendLetter = async () => {
    if (!message.trim()) {
      toast.error("Por favor, escreva uma mensagem antes de enviar.");
      return;
    }

    if (!selectedChildId) {
      toast.error("Por favor, selecione uma criança para enviar a carta.");
      return;
    }

    setIsSending(true);
    
    try {
      // Preparar dados para envio ao DSO conforme documentação
      const letterData = {
        childId: selectedChildId,
        title: `Carta de ${user?.name || 'Padrinho/Madrinha'}`,
        message: message.trim(),
        attachments: selectedFile ? [selectedFile.name] : undefined,
      };

      console.log('🔍 Enviando carta:', letterData);
      
      const response = await DSOService.sendLetter(letterData);
      
      console.log('✅ Resposta do envio da carta:', response);
      
      toast.success("Carta enviada com sucesso! Sua mensagem chegará à criança na próxima atualização.");
      
      // Limpar formulário
      setMessage("");
      setSelectedFile(null);
      
      // Recarregar histórico de cartas
      if (selectedChildId) {
        loadLettersHistory(selectedChildId);
      }
      
    } catch (error) {
      console.error('❌ Erro ao enviar carta:', error);
      toast.error(`Erro ao enviar carta: ${error instanceof Error ? error.message : 'Tente novamente.'}`);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'pdf' ? <FileText size={16} /> : <Image size={16} />;
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <LoggedLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-childfund-green">Envie uma Carta</h1>
            <p className="text-gray-600">
              {children.length > 1 
                ? "Selecione uma criança e escreva uma mensagem carinhosa" 
                : "Escreva uma mensagem carinhosa e envie para seu afilhado(a)."
              }
            </p>
          </div>
        </div>

        {/* Seletor de Criança (apenas se houver mais de uma) */}
        {children.length > 1 && (
          <Card className="border-childfund-green/20 mb-6">
            <CardHeader>
              <CardTitle className="text-childfund-green flex items-center gap-2">
                <MailOpen size={20} />
                Para qual criança você quer enviar a carta?
              </CardTitle>
              <CardDescription>
                Selecione o destinatário da sua mensagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      selectedChildId === child.id
                        ? "border-childfund-green bg-childfund-green/5 shadow-md"
                        : "border-gray-200 hover:border-childfund-green/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-childfund-green/20 rounded-full flex items-center justify-center">
                        <Mail className="text-childfund-green" size={16} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-childfund-green">{child.firstname} {child.lastname}</h3>
                        <p className="text-sm text-gray-600">{child.new_idade_pessoa || 'N/A'} anos • {child.estado || child.address1_stateorprovince || 'N/A'}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seção de Composição */}
        <Card className="border-childfund-green/20">
          <CardHeader>
            <CardTitle className="text-childfund-green flex items-center gap-2">
              <Mail size={20} />
              {selectedChildId && children.find(c => c.id === selectedChildId) 
                ? `Carta para ${children.find(c => c.id === selectedChildId)?.firstname} ${children.find(c => c.id === selectedChildId)?.lastname}`
                : "Nova Carta"
              }
            </CardTitle>
            <CardDescription>
              Compartilhe momentos especiais e demonstre seu carinho através de uma carta personalizada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Campo de Texto */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-base font-medium">
                Sua mensagem
              </Label>
              <Textarea
                id="message"
                placeholder="Escreva aqui sua carta…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-32 resize-none"
                maxLength={maxChars}
              />
              <div className="flex justify-between items-center text-sm">
                <span className={`${message.length > maxChars * 0.9 ? 'text-orange-600' : 'text-gray-500'}`}>
                  {message.length}/{maxChars} caracteres
                </span>
              </div>
            </div>

            {/* Upload de Arquivo */}
            <div className="space-y-2">
              <Label className="text-base font-medium">
                Anexar arquivo (foto ou carta digital)
              </Label>
              
              {!selectedFile ? (
                <div className="border-2 border-dashed border-childfund-green/30 rounded-lg p-6 text-center hover:border-childfund-green/50 transition-colors">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mx-auto mb-2 text-childfund-green" size={32} />
                    <p className="text-childfund-green font-medium mb-1">
                      Clique para selecionar um arquivo
                    </p>
                    <p className="text-sm text-gray-600">
                      JPG, PNG ou PDF até 5MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-childfund-green-light/30 rounded-lg border border-childfund-green/20">
                  {getFileIcon(selectedFile.name)}
                  <div className="flex-1">
                    <p className="font-medium text-childfund-green">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                    className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <X size={16} />
                  </Button>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white"
                    disabled={!message.trim()}
                  >
                    <Eye className="mr-2" size={16} />
                    Visualizar Carta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Prévia da Carta</DialogTitle>
                    <DialogDescription>
                      Veja como sua carta ficará antes de enviar
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="whitespace-pre-wrap">{message}</p>
                    </div>
                    {selectedFile && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {getFileIcon(selectedFile.name)}
                        <span>Anexo: {selectedFile.name}</span>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleSendLetter}
                disabled={!message.trim() || isSending}
                className="bg-childfund-orange hover:bg-childfund-orange/90 text-white font-bold flex-1"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2" size={16} />
                    Enviar Carta
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Observações e Informações Importantes */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Informações importantes:</strong><br />
            Depois de enviada, sua carta ficará disponível para a criança na próxima atualização de conteúdo. 
            Você pode acompanhar o histórico abaixo.
          </AlertDescription>
        </Alert>

        {/* Histórico de Cartas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-childfund-green flex items-center gap-2">
              <MailOpen size={20} />
              Histórico de Cartas
            </CardTitle>
            <CardDescription>
              Acompanhe todas as cartas enviadas e recebidas com sua criança apadrinhada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingLetters ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-childfund-green mx-auto mb-4"></div>
                  <p className="text-gray-500">Carregando histórico de cartas...</p>
                </div>
              ) : letters.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="mx-auto h-12 w-12 text-childfund-green mb-4" />
                  <h3 className="text-lg font-medium text-childfund-green mb-2">É hora de enviar sua primeira carta!</h3>
                  <p className="text-gray-600 mb-4">
                    Que tal começar um vínculo especial com {selectedChildId && children.find(c => c.id === selectedChildId) 
                      ? `${children.find(c => c.id === selectedChildId)?.firstname}`
                      : "sua criança apadrinhada"
                    }? Uma simples mensagem pode alegrar o dia e criar uma conexão única.
                  </p>
                  <div className="bg-childfund-green/10 p-4 rounded-lg border border-childfund-green/20">
                    <p className="text-sm text-childfund-green font-medium mb-2">💡 Dicas para sua primeira carta:</p>
                    <ul className="text-sm text-gray-600 space-y-1 text-left max-w-md mx-auto">
                      <li>• Se apresente e conte um pouco sobre você</li>
                      <li>• Pergunte sobre os interesses e sonhos da criança</li>
                      <li>• Compartilhe algo sobre sua família ou cidade</li>
                      <li>• Envie palavras de carinho e encorajamento</li>
                    </ul>
                  </div>
                </div>
              ) : (
                letters.map((letter) => (
                  <div
                    key={letter.id}
                    className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedLetter(letter)}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {letter.type === "sent" ? (
                        <div className="w-10 h-10 bg-childfund-orange/10 rounded-full flex items-center justify-center">
                          <Send className="text-childfund-orange" size={16} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-childfund-green/10 rounded-full flex items-center justify-center">
                          <MailOpen className="text-childfund-green" size={16} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-childfund-green">
                          {letter.type === "sent" ? "Enviada por você" : "Recebida da criança"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(letter.date)}
                        </span>
                        {letter.hasAttachment && (
                          <Badge variant="secondary" className="text-xs">
                            Anexo
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {truncateText(letter.content)}
                      </p>
                      <button className="text-childfund-green text-sm font-medium hover:underline">
                        Ver completa
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal de Carta Completa */}
        <Dialog open={!!selectedLetter} onOpenChange={() => setSelectedLetter(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedLetter && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedLetter.type === "sent" ? (
                      <>
                        <Send className="text-childfund-orange" size={20} />
                        Carta Enviada
                      </>
                    ) : (
                      <>
                        <MailOpen className="text-childfund-green" size={20} />
                        Carta Recebida
                      </>
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedLetter.type === "sent" ? "Enviada por você" : "Recebida da criança"} em {formatDate(selectedLetter.date)}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedLetter.content}</p>
                  </div>
                  {selectedLetter.hasAttachment && (
                    <div className="flex items-center gap-2 p-3 bg-childfund-green-light/20 rounded-lg">
                      {getFileIcon(selectedLetter.attachmentName || "")}
                      <span className="text-sm font-medium">
                        Anexo: {selectedLetter.attachmentName}
                      </span>
                      <Button size="sm" variant="outline" className="ml-auto">
                        Baixar
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </LoggedLayout>
  );
} 