import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Gift, Search, Filter, ShoppingCart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import LoggedLayout from "../../components/layout/LoggedLayout";

interface Gift {
  id: string;
  date: string;
  type: "birthday" | "christmas" | "special";
  status: "pending" | "processing" | "delivered" | "received";
  description: string;
  value: number;
  childName: string;
}

const mockGifts: Gift[] = [
  {
    id: "1",
    date: "2024-03-15",
    type: "birthday",
    status: "delivered",
    description: "Kit de material escolar",
    value: 150.00,
    childName: "Maria Silva"
  },
  {
    id: "2",
    date: "2024-02-10",
    type: "special",
    status: "received",
    description: "Roupa de inverno",
    value: 200.00,
    childName: "Maria Silva"
  },
  {
    id: "3",
    date: "2024-01-05",
    type: "christmas",
    status: "processing",
    description: "Brinquedo educativo",
    value: 100.00,
    childName: "Maria Silva"
  }
];

export default function GiftsPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [gifts] = useState<Gift[]>(mockGifts);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth/login");
    }
    
    document.title = "Meus Presentes - ChildFund Brasil";
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-childfund-green"></div>
      </div>
    );
  }

  if (!user) return null;

  const filteredGifts = gifts.filter(gift => {
    const matchesSearch = 
      gift.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gift.childName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || gift.type === typeFilter;
    const matchesStatus = statusFilter === "all" || gift.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: Gift["status"]) => {
    const statusConfig = {
      pending: { label: "Pendente", variant: "secondary" },
      processing: { label: "Processando", variant: "warning" },
      delivered: { label: "Entregue", variant: "success" },
      received: { label: "Recebido", variant: "default" }
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const getTypeLabel = (type: Gift["type"]) => {
    const typeConfig = {
      birthday: "Aniversário",
      christmas: "Natal",
      special: "Especial"
    };
    return typeConfig[type];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <LoggedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-childfund-green">Meus Presentes</h1>
            <p className="text-gray-600">Gerencie os presentes enviados</p>
          </div>
          <Button className="bg-childfund-green hover:bg-childfund-green/90">
            <Gift className="mr-2" size={16} />
            Enviar Presente
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar presentes..."
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
                  <SelectItem value="birthday">Aniversário</SelectItem>
                  <SelectItem value="christmas">Natal</SelectItem>
                  <SelectItem value="special">Especial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="received">Recebido</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2" size={16} />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Presentes */}
        <div className="space-y-4">
          {filteredGifts.map((gift) => (
            <Card key={gift.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{gift.description}</h3>
                      {getStatusBadge(gift.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Gift size={14} />
                        {getTypeLabel(gift.type)} - {gift.childName}
                      </div>
                      <div>
                        {formatDate(gift.date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-childfund-green">
                        {formatCurrency(gift.value)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2" size={14} />
                      Comprovante
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-childfund-green">Resumo</CardTitle>
            <CardDescription>
              Total de presentes no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Total gasto</p>
                <p className="text-2xl font-bold text-childfund-green">
                  {formatCurrency(filteredGifts.reduce((acc, curr) => acc + curr.value, 0))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Número de presentes</p>
                <p className="text-2xl font-bold text-childfund-green">
                  {filteredGifts.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Média por presente</p>
                <p className="text-2xl font-bold text-childfund-green">
                  {formatCurrency(
                    filteredGifts.reduce((acc, curr) => acc + curr.value, 0) / 
                    (filteredGifts.length || 1)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LoggedLayout>
  );
} 