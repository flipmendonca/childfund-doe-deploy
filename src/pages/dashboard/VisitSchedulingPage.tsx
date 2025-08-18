import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Video, AlertCircle, CheckCircle, X, User, Home, Camera, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import LoggedLayout from "../../components/layout/LoggedLayout";
import { DSOService } from "@/services/DSOService";

interface VisitRequest {
  id: string;
  type: "presencial" | "virtual";
  suggestedDate: string;
  suggestedTime: string;
  observations: string;
  status: "pending" | "confirmed" | "denied";
  confirmedDate?: string;
  confirmedTime?: string;
  requestDate: string;
  denyReason?: string;
}

const mockVisitRequests: VisitRequest[] = [
  {
    id: "1",
    type: "presencial",
    suggestedDate: "2024-04-15",
    suggestedTime: "14h às 16h",
    observations: "Prefiro fins de semana se possível",
    status: "confirmed",
    confirmedDate: "2024-04-14",
    confirmedTime: "15h às 17h",
    requestDate: "2024-03-25"
  },
  {
    id: "2",
    type: "virtual",
    suggestedDate: "2024-03-20",
    suggestedTime: "10h às 12h",
    observations: "Disponível durante a semana também",
    status: "pending",
    requestDate: "2024-03-10"
  },
  {
    id: "3",
    type: "presencial",
    suggestedDate: "2024-02-28",
    suggestedTime: "18h às 20h",
    observations: "",
    status: "denied",
    denyReason: "Data indisponível na agenda local",
    requestDate: "2024-02-15"
  }
];

const timeSlots = [
  "10h às 12h",
  "14h às 16h",
  "18h às 20h"
];

// Mock data para múltiplos afilhados
const mockChildren = [
  { id: "1", name: "Maria Silva", age: 8, state: "PE" },
  { id: "2", name: "João Santos", age: 10, state: "BA" },
  { id: "3", name: "Ana Costa", age: 7, state: "CE" }
];

export default function VisitSchedulingPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [visitType, setVisitType] = useState<"presencial" | "virtual">("presencial");
  const [visitDate, setVisitDate] = useState("");
  const [visitHour, setVisitHour] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [visitRequests] = useState<VisitRequest[]>(mockVisitRequests);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [children] = useState(mockChildren);

  // Data mínima: 15 dias a partir de hoje
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 15);
  const minDateString = minDate.toISOString().split('T')[0];

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth/login");
    }
    
    document.title = "Agende uma Visita - ChildFund Brasil";
    
    // Verificar se há um child ID nos parâmetros da URL
    const childParam = searchParams.get('child');
    if (childParam && children.find(child => child.id === childParam)) {
      setSelectedChildId(childParam);
    } else if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [user, isLoading, navigate, searchParams, children, selectedChildId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-childfund-green"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleSubmitRequest = async () => {
    if (!visitDate) {
      toast.error("Por favor, selecione uma data para a visita.");
      return;
    }

    if (!visitHour) {
      toast.error("Por favor, selecione um horário para a visita.");
      return;
    }

    if (!selectedChildId) {
      toast.error("Por favor, selecione uma criança para visitar.");
      return;
    }

    if (!phone) {
      toast.error("Por favor, informe seu telefone para contato.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Enviar dados conforme formato da produção
      const visitData = {
        childId: selectedChildId,
        visitDate: visitDate,
        visitHour: visitHour,
        message: message || `Solicitação de visita ${visitType}. Telefone para contato: ${phone}`,
      };

      console.log('🔍 Enviando solicitação de visita:', visitData);
      
      const response = await DSOService.scheduleVisit(visitData);
      
      console.log('✅ Resposta do agendamento:', response);
      
      if (response.success === 'send invite') {
        toast.success(response.note || "Sua solicitação foi registrada! Entraremos em contato em até 15 dias.", {
          duration: 5000,
        });
        
        // Limpar formulário
        setVisitDate("");
        setVisitHour("");
        setMessage("");
        setPhone("");
      } else {
        throw new Error(response.message || 'Erro ao processar solicitação');
      }
      
    } catch (error) {
      console.error('❌ Erro ao agendar visita:', error);
      toast.error(`Erro ao enviar solicitação: ${error instanceof Error ? error.message : 'Tente novamente.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const getStatusBadge = (status: VisitRequest["status"]) => {
    const statusConfig = {
      pending: { label: "Pendente", variant: "secondary", icon: Clock },
      confirmed: { label: "Confirmada", variant: "default", icon: CheckCircle },
      denied: { label: "Negada", variant: "destructive", icon: X }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <IconComponent size={12} />
        {config.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: "presencial" | "virtual") => {
    return type === "presencial" ? <Home size={16} /> : <Camera size={16} />;
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
            <h1 className="text-2xl font-bold text-childfund-green">Agende uma Visita</h1>
            <p className="text-gray-600">
              {children.length > 1 
                ? "Selecione uma criança, escolha o tipo de visita e sugira uma data" 
                : "Escolha o tipo de visita e sugira uma data — confirmamos em até 15 dias."
              }
            </p>
          </div>
        </div>

        {/* Seletor de Criança (apenas se houver mais de uma) */}
        {children.length > 1 && (
          <Card className="border-childfund-green/20 mb-6">
            <CardHeader>
              <CardTitle className="text-childfund-green flex items-center gap-2">
                <Calendar size={20} />
                Qual criança você gostaria de visitar?
              </CardTitle>
              <CardDescription>
                Selecione a criança para agendar a visita
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
                        <User className="text-childfund-green" size={16} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-childfund-green">{child.name}</h3>
                        <p className="text-sm text-gray-600">{child.age} anos • {child.state}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seletor de Tipo de Visita */}
        <Card className="border-childfund-green/20">
          <CardHeader>
            <CardTitle className="text-childfund-green">Tipo de Visita</CardTitle>
            <CardDescription>
              Escolha entre visita presencial ou virtual conforme sua preferência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setVisitType("presencial")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  visitType === "presencial"
                    ? "border-childfund-green bg-childfund-green/5 shadow-md"
                    : "border-gray-200 hover:border-childfund-green/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-full ${
                    visitType === "presencial" ? "bg-childfund-green text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    <Home size={20} />
                  </div>
                  <h3 className="font-semibold text-lg">Presencial</h3>
                </div>
                <p className="text-sm text-gray-600 text-left">
                  Visita no local onde a criança vive, acompanhada pela equipe técnica local
                </p>
              </button>

              <button
                onClick={() => setVisitType("virtual")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  visitType === "virtual"
                    ? "border-childfund-green bg-childfund-green/5 shadow-md"
                    : "border-gray-200 hover:border-childfund-green/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-full ${
                    visitType === "virtual" ? "bg-childfund-green text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    <Camera size={20} />
                  </div>
                  <h3 className="font-semibold text-lg">Virtual</h3>
                </div>
                <p className="text-sm text-gray-600 text-left">
                  Videoconferência com a criança e família, mediada pela equipe técnica
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Agendamento */}
        <Card className="border-childfund-green/20">
          <CardHeader>
            <CardTitle className="text-childfund-green flex items-center gap-2">
              <Calendar size={20} />
              {selectedChildId && children.find(c => c.id === selectedChildId) 
                ? `Visita para ${children.find(c => c.id === selectedChildId)?.name}`
                : "Dados da Solicitação"
              }
            </CardTitle>
            <CardDescription>
              Preencha os dados para sua solicitação de visita {visitType}
              {selectedChildId && children.find(c => c.id === selectedChildId) 
                ? ` com ${children.find(c => c.id === selectedChildId)?.name}`
                : ""
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data da Visita */}
            <div className="space-y-2">
              <Label htmlFor="visit-date" className="text-base font-medium">
                Data da visita *
              </Label>
              <input
                id="visit-date"
                type="date"
                min={minDateString}
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-childfund-green focus:border-transparent"
              />
              <p className="text-sm text-gray-600">
                Mínimo de 15 dias a partir de hoje
              </p>
            </div>

            {/* Horário da Visita */}
            <div className="space-y-2">
              <Label htmlFor="visit-hour" className="text-base font-medium">
                Horário da visita *
              </Label>
              <Select value={visitHour} onValueChange={setVisitHour}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Telefone para Contato */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-medium">
                Telefone para contato *
              </Label>
              <input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-childfund-green focus:border-transparent"
              />
              <p className="text-sm text-gray-600">
                Será usado para entrar em contato e confirmar a visita
              </p>
            </div>

            {/* Mensagem */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-base font-medium">
                Mensagem (opcional)
              </Label>
              <Textarea
                id="message"
                placeholder="Instruções especiais, preferências de dia da semana, etc."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-20"
                rows={3}
              />
            </div>

            {/* Informações Importantes */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong><br />
                As visitas são agendadas com antecedência mínima de 15 dias e dependem da disponibilidade 
                da equipe local e da família da criança. Entraremos em contato para confirmar.
              </AlertDescription>
            </Alert>

            {/* Botão de Envio */}
            <Button
              onClick={handleSubmitRequest}
              disabled={isSubmitting || !visitDate || !visitHour || !phone}
              className="w-full bg-childfund-orange hover:bg-childfund-orange/90 text-white font-bold py-3"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Enviando Solicitação...
                </>
              ) : (
                <>
                  <Calendar className="mr-2" size={16} />
                  Enviar Solicitação
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Histórico de Solicitações */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-childfund-green flex items-center gap-2">
                  <Clock size={20} />
                  Minhas Solicitações de Visita
                </CardTitle>
                <CardDescription>
                  Acompanhe o status de todas as suas solicitações de visita
                </CardDescription>
              </div>
              <Button 
                variant="outline"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white"
              >
                <Calendar className="mr-2" size={16} />
                Nova Solicitação
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {visitRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma solicitação ainda</h3>
                  <p className="text-gray-500">Faça sua primeira solicitação de visita usando o formulário acima!</p>
                </div>
              ) : (
                visitRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(request.type)}
                            <span className="font-medium capitalize">
                              Visita {request.type}
                            </span>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>
                              Data sugerida: {formatDate(request.suggestedDate)}
                              {request.suggestedTime && ` às ${request.suggestedTime}`}
                            </span>
                          </div>
                          
                          {request.status === "confirmed" && request.confirmedDate && (
                            <div className="flex items-center gap-2 text-childfund-green font-medium">
                              <CheckCircle size={14} />
                              <span>
                                Confirmada para {formatDate(request.confirmedDate)}
                                {request.confirmedTime && ` às ${request.confirmedTime}`}
                              </span>
                            </div>
                          )}
                          
                          {request.status === "denied" && request.denyReason && (
                            <div className="flex items-center gap-2 text-red-600">
                              <X size={14} />
                              <span>Motivo: {request.denyReason}</span>
                            </div>
                          )}
                          
                          {request.observations && (
                            <div className="text-gray-500">
                              <strong>Observações:</strong> {request.observations}
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-400">
                            Solicitada em {formatDate(request.requestDate)}
                          </div>
                        </div>
                      </div>
                      
                      {request.status === "confirmed" && (
                        <Button size="sm" variant="outline">
                          <User className="mr-2" size={14} />
                          Detalhes
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </LoggedLayout>
  );
} 