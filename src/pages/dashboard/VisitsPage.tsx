import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Calendar, Search, Filter, MapPin, Clock, Users, ChevronDown, Video, UserCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import LoggedLayout from "../../components/layout/LoggedLayout";

interface Visit {
  id: string;
  date: string;
  time: string;
  type: "scheduled" | "completed" | "cancelled";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  location: string;
  participants: number;
  description: string;
  childName: string;
  visitType: "presencial" | "virtual";
}

const mockVisits: Visit[] = [
  {
    id: "1",
    date: "2024-04-15",
    time: "14:00",
    type: "scheduled",
    status: "confirmed",
    location: "Centro Comunitário São João",
    participants: 2,
    description: "Visita de acompanhamento",
    childName: "Maria Silva",
    visitType: "presencial"
  },
  {
    id: "2",
    date: "2024-03-10",
    time: "10:00",
    type: "completed",
    status: "completed",
    location: "Reunião Virtual",
    participants: 3,
    description: "Conversa com a família",
    childName: "Maria Silva",
    visitType: "virtual"
  },
  {
    id: "3",
    date: "2024-02-05",
    time: "15:30",
    type: "cancelled",
    status: "cancelled",
    location: "Centro Comunitário São João",
    participants: 2,
    description: "Visita de acompanhamento",
    childName: "Maria Silva",
    visitType: "presencial"
  }
];

export default function VisitsPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [visits] = useState<Visit[]>(mockVisits);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [visitType, setVisitType] = useState<"presencial" | "virtual">("presencial");
  const [preferredDate, setPreferredDate] = useState("");
  const [observations, setObservations] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth/login");
    }
    
    document.title = "Minhas Visitas - ChildFund Brasil";
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-childfund-green"></div>
      </div>
    );
  }

  if (!user) return null;

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = 
      visit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.childName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || visit.type === typeFilter;
    const matchesStatus = statusFilter === "all" || visit.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: Visit["status"]) => {
    const statusConfig = {
      pending: { label: "Pendente", variant: "secondary" },
      confirmed: { label: "Confirmada", variant: "warning" },
      completed: { label: "Realizada", variant: "success" },
      cancelled: { label: "Cancelada", variant: "destructive" }
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const getVisitTypeIcon = (visitType: Visit["visitType"]) => {
    return visitType === "virtual" ? 
      <Video className="text-childfund-orange" size={16} /> : 
      <UserCheck className="text-childfund-green" size={16} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const handleScheduleSubmit = () => {
    // Aqui seria feita a submissão para o backend
    console.log("Agendamento solicitado:", { visitType, preferredDate, observations });
    setShowScheduleForm(false);
    // Reset form
    setVisitType("presencial");
    setPreferredDate("");
    setObservations("");
  };

  return (
    <LoggedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-childfund-green">Minhas Visitas</h1>
            <p className="text-gray-600">Gerencie suas visitas programadas</p>
          </div>
          <Button 
            onClick={() => setShowScheduleForm(true)}
            className="bg-childfund-green hover:bg-childfund-green/90"
          >
            <Calendar className="mr-2" size={16} />
            Solicitar Visita
          </Button>
        </div>

        {/* Formulário de Agendamento */}
        {showScheduleForm && (
          <Card className="border-childfund-green/20">
            <CardHeader>
              <CardTitle className="text-childfund-green">Solicitar Nova Visita</CardTitle>
              <CardDescription>
                Escolha o tipo de visita e sua data preferencial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipo de Visita */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Tipo de Visita</Label>
                <RadioGroup 
                  value={visitType} 
                  onValueChange={(value) => setVisitType(value as "presencial" | "virtual")}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-childfund-green-light/30 transition-colors">
                    <RadioGroupItem value="presencial" id="presencial" />
                    <Label htmlFor="presencial" className="flex items-center gap-2 cursor-pointer flex-1">
                      <UserCheck className="text-childfund-green" size={20} />
                      <div>
                        <p className="font-medium">Visita Presencial</p>
                        <p className="text-sm text-gray-600">Encontro presencial no local do projeto</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-childfund-green-light/30 transition-colors">
                    <RadioGroupItem value="virtual" id="virtual" />
                    <Label htmlFor="virtual" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Video className="text-childfund-orange" size={20} />
                      <div>
                        <p className="font-medium">Visita Virtual</p>
                        <p className="text-sm text-gray-600">Videochamada com a criança e família</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Data Preferencial */}
              <div className="space-y-2">
                <Label htmlFor="preferredDate" className="text-base font-medium">
                  Data Preferencial (sugestão)
                </Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // 15 dias a partir de hoje
                />
                <p className="text-sm text-gray-600">
                  Esta é apenas uma sugestão. A data final dependerá da aprovação do ChildFund Brasil.
                </p>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observations" className="text-base font-medium">
                  Observações (opcional)
                </Label>
                <Textarea
                  id="observations"
                  placeholder="Adicione qualquer observação ou preferência especial..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Informações Importantes */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Informações Importantes:</strong><br />
                  As visitas são agendadas com antecedência mínima de 15 dias e dependem da disponibilidade da equipe local e família da criança. Entraremos em contato para confirmar.
                </AlertDescription>
              </Alert>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleScheduleSubmit}
                  className="bg-childfund-green hover:bg-childfund-green/90 flex-1"
                  disabled={!preferredDate}
                >
                  Enviar Solicitação
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar visitas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="scheduled">Agendadas</SelectItem>
                  <SelectItem value="completed">Realizadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="completed">Realizada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
              >
                <Filter className="mr-2" size={16} />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Visitas */}
        <div className="space-y-4">
          {filteredVisits.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma visita encontrada</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || typeFilter !== "all" || statusFilter !== "all" 
                    ? "Tente ajustar os filtros para encontrar suas visitas."
                    : "Você ainda não possui visitas agendadas."}
                </p>
                <Button 
                  onClick={() => setShowScheduleForm(true)}
                  className="bg-childfund-green hover:bg-childfund-green/90"
                >
                  Solicitar Primeira Visita
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredVisits.map((visit) => (
              <Card key={visit.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{visit.description}</h3>
                        {getStatusBadge(visit.status)}
                        <div className="flex items-center gap-1">
                          {getVisitTypeIcon(visit.visitType)}
                          <span className="text-sm text-gray-600 capitalize">
                            {visit.visitType}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {visit.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDate(visit.date)} às {visit.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          {visit.participants} participantes
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>Criança:</strong> {visit.childName}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {visit.status === "pending" && (
                        <Button size="sm" variant="outline" className="text-childfund-orange border-childfund-orange hover:bg-childfund-orange hover:text-white">
                          Reagendar
                        </Button>
                      )}
                      {visit.status === "confirmed" && (
                        <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white">
                          Cancelar
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </LoggedLayout>
  );
} 