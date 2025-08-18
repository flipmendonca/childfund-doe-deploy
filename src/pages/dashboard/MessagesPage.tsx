import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Search, Filter, Send, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import LoggedLayout from "../../components/layout/LoggedLayout";

interface Message {
  id: string;
  date: string;
  type: "received" | "sent";
  status: "unread" | "read";
  subject: string;
  content: string;
  sender: string;
  recipient: string;
}

const mockMessages: Message[] = [
  {
    id: "1",
    date: "2024-03-15",
    type: "received",
    status: "unread",
    subject: "Atualização do desenvolvimento",
    content: "Olá! Gostaríamos de informar que o relatório de desenvolvimento do seu afilhado foi atualizado. Você pode acessá-lo na seção de relatórios.",
    sender: "Equipe ChildFund",
    recipient: "Você"
  },
  {
    id: "2",
    date: "2024-03-10",
    type: "sent",
    status: "read",
    subject: "Dúvida sobre visita",
    content: "Olá! Gostaria de confirmar o horário da visita programada para o próximo mês.",
    sender: "Você",
    recipient: "Equipe ChildFund"
  },
  {
    id: "3",
    date: "2024-03-05",
    type: "received",
    status: "read",
    subject: "Confirmação de doação",
    content: "Olá! Confirmamos o recebimento da sua doação. Muito obrigado pelo seu apoio!",
    sender: "Equipe ChildFund",
    recipient: "Você"
  }
];

export default function MessagesPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [messages] = useState<Message[]>(mockMessages);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth/login");
    }
    
    document.title = "Minhas Mensagens - ChildFund Brasil";
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-childfund-green"></div>
      </div>
    );
  }

  if (!user) return null;

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || message.type === typeFilter;
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: Message["status"]) => {
    const statusConfig = {
      unread: { label: "Não lida", variant: "warning" },
      read: { label: "Lida", variant: "default" }
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const getTypeLabel = (type: Message["type"]) => {
    const typeConfig = {
      received: "Recebida",
      sent: "Enviada"
    };
    return typeConfig[type];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Aqui você implementaria a lógica para enviar a mensagem
    console.log("Enviando mensagem:", newMessage);
    setNewMessage("");
  };

  return (
    <LoggedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-childfund-green">Minhas Mensagens</h1>
            <p className="text-gray-600">Comunique-se com a equipe ChildFund</p>
          </div>
          <Button className="bg-childfund-green hover:bg-childfund-green/90">
            <MessageSquare className="mr-2" size={16} />
            Nova Mensagem
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar mensagens..."
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
                  <SelectItem value="received">Recebidas</SelectItem>
                  <SelectItem value="sent">Enviadas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="unread">Não lidas</SelectItem>
                  <SelectItem value="read">Lidas</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2" size={16} />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Mensagens */}
          <div className="lg:col-span-1 space-y-4">
            {filteredMessages.map((message) => (
              <Card 
                key={message.id}
                className={`cursor-pointer transition-colors ${
                  selectedMessage?.id === message.id ? "border-childfund-green" : ""
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{message.subject}</h3>
                      {getStatusBadge(message.status)}
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        {message.type === "received" ? message.sender : message.recipient}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(message.date)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {message.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Visualização da Mensagem */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedMessage.subject}</CardTitle>
                      <CardDescription>
                        {selectedMessage.type === "received" ? "De: " : "Para: "}
                        {selectedMessage.type === "received" ? selectedMessage.sender : selectedMessage.recipient}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedMessage.status)}
                      <Badge variant="outline">
                        {getTypeLabel(selectedMessage.type)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-sm text-gray-600">
                    {selectedMessage.content}
                  </div>
                  <div className="border-t pt-4">
                    <Textarea
                      placeholder="Digite sua resposta..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end mt-2">
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-childfund-green hover:bg-childfund-green/90"
                      >
                        <Send className="mr-2" size={16} />
                        Enviar Resposta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-gray-500">
                    Selecione uma mensagem para visualizar
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Resumo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-childfund-green">Resumo</CardTitle>
            <CardDescription>
              Total de mensagens no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Mensagens não lidas</p>
                <p className="text-2xl font-bold text-childfund-green">
                  {filteredMessages.filter(m => m.status === "unread").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mensagens recebidas</p>
                <p className="text-2xl font-bold text-childfund-green">
                  {filteredMessages.filter(m => m.type === "received").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mensagens enviadas</p>
                <p className="text-2xl font-bold text-childfund-green">
                  {filteredMessages.filter(m => m.type === "sent").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LoggedLayout>
  );
} 