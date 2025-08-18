import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Search, Heart, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LoggedLayout from "../../components/layout/LoggedLayout";

interface Child {
  id: string;
  name: string;
  age: number;
  country: string;
  status: string;
  startDate: string;
  lastLetter: string;
}

const mockChildren: Child[] = [
  {
    id: "CHD001",
    name: "Maria Silva",
    age: 8,
    country: "Brasil",
    status: "Ativo",
    startDate: "2023-01-15",
    lastLetter: "2024-01-10"
  },
  {
    id: "CHD002",
    name: "João Santos",
    age: 10,
    country: "Brasil",
    status: "Ativo",
    startDate: "2023-03-20",
    lastLetter: "2024-01-05"
  },
  {
    id: "CHD003",
    name: "Ana Oliveira",
    age: 7,
    country: "Brasil",
    status: "Inativo",
    startDate: "2022-06-10",
    lastLetter: "2023-12-15"
  }
];

export default function SponsorshipPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [filteredChildren, setFilteredChildren] = useState<Child[]>(mockChildren);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth/login");
    }
    
    document.title = "Apadrinhamento - ChildFund Brasil";
  }, [user, isLoading, navigate]);

  useEffect(() => {
    let filtered = mockChildren;

    if (searchTerm) {
      filtered = filtered.filter(child => 
        child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "Todos") {
      filtered = filtered.filter(child => child.status === statusFilter);
    }

    setFilteredChildren(filtered);
  }, [searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-childfund-green"></div>
      </div>
    );
  }

  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <LoggedLayout>
      <div className="space-y-6">
        {/* Header com estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="border-childfund-green/20">
            <CardContent className="p-4 md:p-6 text-center">
              <Heart className="text-childfund-green mx-auto mb-2" size={24} />
              <p className="text-xl md:text-2xl font-bold text-childfund-green">{filteredChildren.length}</p>
              <p className="text-sm md:text-base text-gray-600">Total de Crianças</p>
            </CardContent>
          </Card>
          
          <Card className="border-childfund-orange/20">
            <CardContent className="p-4 md:p-6 text-center">
              <Mail className="text-childfund-orange mx-auto mb-2" size={24} />
              <p className="text-xl md:text-2xl font-bold text-childfund-orange">
                {filteredChildren.filter(c => c.status === "Ativo").length}
              </p>
              <p className="text-sm md:text-base text-gray-600">Apadrinhamentos Ativos</p>
            </CardContent>
          </Card>
          
          <Card className="border-childfund-yellow/30">
            <CardContent className="p-4 md:p-6 text-center">
              <Calendar className="text-childfund-green mx-auto mb-2" size={24} />
              <p className="text-xl md:text-2xl font-bold text-childfund-green">
                {formatDate(filteredChildren[0]?.startDate || "")}
              </p>
              <p className="text-sm md:text-base text-gray-600">Último Apadrinhamento</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Ações */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-childfund-green">Meus Apadrinhamentos</CardTitle>
                <CardDescription>
                  Acompanhe as crianças que você apoia
                </CardDescription>
              </div>
              <Button 
                onClick={() => navigate('/dashboard/donations')}
                className="bg-childfund-orange hover:bg-childfund-orange/90"
              >
                <Heart className="mr-2" size={16} />
                Ver Doações
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos os status</SelectItem>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tabela de Crianças - Versão Mobile */}
            <div className="md:hidden space-y-4">
              {filteredChildren.map((child) => (
                <Card key={child.id} className="border-childfund-green/20">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-childfund-green">{child.name}</p>
                          <p className="text-sm text-gray-600">ID: {child.id}</p>
                        </div>
                        <Badge variant={
                          child.status === "Ativo" ? "default" :
                          child.status === "Inativo" ? "secondary" : "destructive"
                        }>
                          {child.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Idade</p>
                          <p className="font-medium">{child.age} anos</p>
                        </div>
                        <div>
                          <p className="text-gray-600">País</p>
                          <p className="font-medium">{child.country}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Início</p>
                          <p className="font-medium">{formatDate(child.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Última Carta</p>
                          <p className="font-medium">{formatDate(child.lastLetter)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1 border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white"
                        >
                          <Mail className="mr-2" size={14} />
                          Escrever Carta
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1 border-childfund-orange text-childfund-orange hover:bg-childfund-orange hover:text-white"
                        >
                          <Heart className="mr-2" size={14} />
                          Ver Perfil
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tabela de Crianças - Versão Desktop */}
            <div className="hidden md:block border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Última Carta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChildren.map((child) => (
                    <TableRow key={child.id}>
                      <TableCell className="font-medium">{child.id}</TableCell>
                      <TableCell>{child.name}</TableCell>
                      <TableCell>{child.age} anos</TableCell>
                      <TableCell>{child.country}</TableCell>
                      <TableCell>{formatDate(child.startDate)}</TableCell>
                      <TableCell>{formatDate(child.lastLetter)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          child.status === "Ativo" ? "default" :
                          child.status === "Inativo" ? "secondary" : "destructive"
                        }>
                          {child.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white"
                          >
                            <Mail className="mr-2" size={14} />
                            Escrever
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-childfund-orange text-childfund-orange hover:bg-childfund-orange hover:text-white"
                          >
                            <Heart className="mr-2" size={14} />
                            Perfil
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredChildren.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma criança encontrada com os filtros aplicados.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LoggedLayout>
  );
} 