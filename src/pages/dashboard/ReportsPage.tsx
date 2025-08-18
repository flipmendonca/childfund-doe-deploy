import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FileText, Search, Filter, Download, Calendar, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import LoggedLayout from "../../components/layout/LoggedLayout";

interface Report {
  id: string;
  date: string;
  type: "monthly" | "quarterly" | "annual";
  status: "pending" | "available" | "downloaded";
  title: string;
  description: string;
  childName: string;
}

const mockReports: Report[] = [
  {
    id: "1",
    date: "2024-03-15",
    type: "monthly",
    status: "available",
    title: "Relatório Mensal - Março/2024",
    description: "Relatório de acompanhamento mensal",
    childName: "Maria Silva"
  },
  {
    id: "2",
    date: "2024-02-15",
    type: "monthly",
    status: "downloaded",
    title: "Relatório Mensal - Fevereiro/2024",
    description: "Relatório de acompanhamento mensal",
    childName: "Maria Silva"
  },
  {
    id: "3",
    date: "2024-01-15",
    type: "monthly",
    status: "downloaded",
    title: "Relatório Mensal - Janeiro/2024",
    description: "Relatório de acompanhamento mensal",
    childName: "Maria Silva"
  }
];

export default function ReportsPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [reports] = useState<Report[]>(mockReports);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth/login");
    }
    
    document.title = "Meus Relatórios - ChildFund Brasil";
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-childfund-green"></div>
      </div>
    );
  }

  if (!user) return null;

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.childName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: Report["status"]) => {
    const statusConfig = {
      pending: { label: "Pendente", variant: "secondary" },
      available: { label: "Disponível", variant: "success" },
      downloaded: { label: "Baixado", variant: "default" }
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const getTypeLabel = (type: Report["type"]) => {
    const typeConfig = {
      monthly: "Mensal",
      quarterly: "Trimestral",
      annual: "Anual"
    };
    return typeConfig[type];
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
            <h1 className="text-2xl font-bold text-childfund-green">Meus Relatórios</h1>
            <p className="text-gray-600">Acompanhe os relatórios de desenvolvimento</p>
          </div>
          <Button className="bg-childfund-green hover:bg-childfund-green/90">
            <BarChart className="mr-2" size={16} />
            Gerar Relatório
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar relatórios..."
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
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="annual">Anual</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="downloaded">Baixado</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2" size={16} />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Relatórios */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{report.title}</h3>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FileText size={14} />
                        {getTypeLabel(report.type)} - {report.childName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(report.date)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {report.description}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    {report.status === "available" && (
                      <Button variant="outline" size="sm">
                        <Download className="mr-2" size={14} />
                        Baixar
                      </Button>
                    )}
                    {report.status === "downloaded" && (
                      <Button variant="outline" size="sm">
                        <Download className="mr-2" size={14} />
                        Baixar Novamente
                      </Button>
                    )}
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
              Total de relatórios no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Relatórios disponíveis</p>
                <p className="text-2xl font-bold text-childfund-green">
                  {filteredReports.filter(r => r.status === "available").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Relatórios baixados</p>
                <p className="text-2xl font-bold text-childfund-green">
                  {filteredReports.filter(r => r.status === "downloaded").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Relatórios pendentes</p>
                <p className="text-2xl font-bold text-childfund-green">
                  {filteredReports.filter(r => r.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LoggedLayout>
  );
} 