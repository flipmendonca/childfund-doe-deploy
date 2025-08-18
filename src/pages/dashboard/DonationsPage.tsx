import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useDonorData } from "../../hooks/useDonorData";
import { CreditCard, Calendar, Download, Filter, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LoggedLayout from "@/components/layout/LoggedLayout";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import UnifiedDonationForm from "@/components/UnifiedDonationForm";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: "monthly" | "once" | "sponsorship";
  status: "completed" | "pending" | "failed";
  paymentMethod: string;
  description: string;
  receiptStatus?: "available" | "downloaded";
}

// ❌ DADOS MOCKADOS REMOVIDOS - Não devem ser exibidos

export default function DonationsPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const donorData = useDonorData();
  const isDonorLoading = false;
  const error = null;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth/login");
    }
    
    document.title = "Minhas Doações e Recibos - ChildFund Brasil";
  }, [user, isLoading, navigate]);

  // ✅ BUSCAR APENAS DADOS REAIS - Sem fallback para mock
  useEffect(() => {
    if (donorData && donorData.donations && donorData.donations.length > 0) {
      const realTransactions: Transaction[] = donorData.donations.map(donation => ({
        id: donation.id || `donation-${Date.now()}-${Math.random()}`,
        date: donation.date || new Date().toISOString().split('T')[0],
        amount: donation.amount || 0,
        type: (donation.type === 'sponsorship' ? 'sponsorship' : 
              donation.type === 'recurrent' || donation.frequency === 'monthly' ? 'monthly' : 'once') as 'monthly' | 'once' | 'sponsorship',
        status: donation.status || 'completed',
        paymentMethod: donation.paymentMethod || 'Não especificado',
        description: donation.description || 
          `Doação ${donation.type === 'sponsorship' ? 'Apadrinhamento' : 
                    donation.frequency === 'monthly' ? 'Mensal' : 'Única'}`,
        receiptStatus: 'available' as const
      }));
      
      setTransactions(realTransactions);
      console.log('✅ Doações reais carregadas:', realTransactions);
    } else if (!isDonorLoading) {
      // ✅ SEM DADOS REAIS: Array vazio (sem mock)
      console.log('ℹ️ Nenhum dado real de doações encontrado');
      setTransactions([]);
    }
  }, [donorData, isDonorLoading]);

  if (isLoading || isDonorLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-childfund-green"></div>
      </div>
    );
  }

  if (!user) return null;

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: Transaction["status"]) => {
    const statusConfig = {
      completed: { label: "Concluído", variant: "success" },
      pending: { label: "Pendente", variant: "warning" },
      failed: { label: "Falhou", variant: "destructive" }
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
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

  const handleDownload = (transaction: Transaction) => {
    // Simular download do recibo
    console.log(`Downloading receipt for transaction ${transaction.id}`);
  };

  return (
    <LoggedLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-childfund-green">Seu histórico de generosidade</h1>
            <p className="text-gray-600">Acompanhe suas contribuições e acesse seus recibos.</p>
          </div>
          <Dialog open={isDonationModalOpen} onOpenChange={setIsDonationModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-childfund-green hover:bg-childfund-green/90">
                <CreditCard className="mr-2" size={16} />
                Nova Doação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-full p-0 bg-transparent border-0 shadow-none">
              <UnifiedDonationForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros - Desktop */}
        <Card className="hidden md:block">
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar doações..."
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
                  <SelectItem value="sponsorship">Apadrinhamento</SelectItem>
                  <SelectItem value="monthly">Guardião</SelectItem>
                  <SelectItem value="once">Única</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setTypeFilter("all");
                  setStatusFilter("all");
                  setSearchTerm("");
                }}
              >
                <Filter className="mr-2" size={16} />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filtros - Mobile */}
        <div className="md:hidden space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar doações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2" size={16} />
                Filtros
                <ChevronDown className="ml-2" size={16} />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="sponsorship">Apadrinhamento</SelectItem>
                      <SelectItem value="monthly">Guardião</SelectItem>
                      <SelectItem value="once">Única</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => {
                    setTypeFilter("all");
                    setStatusFilter("all");
                    setSearchTerm("");
                    setIsFilterSheetOpen(false);
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* ✅ CONTEÚDO PRINCIPAL - Dados reais ou aviso */}
        <div>
          {filteredTransactions.length > 0 ? (
            <>
              {/* Tabela - Desktop */}
              <div className="hidden md:block border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Data</TableHead>
                        <TableHead className="whitespace-nowrap">Descrição</TableHead>
                        <TableHead className="whitespace-nowrap">Tipo</TableHead>
                        <TableHead className="whitespace-nowrap">Valor</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">Recibo</TableHead>
                        <TableHead className="whitespace-nowrap">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="whitespace-nowrap">{formatDate(transaction.date)}</TableCell>
                          <TableCell className="min-w-[200px]">{transaction.description}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {transaction.type === "monthly" ? "Guardião" :
                             transaction.type === "once" ? "Única" : "Apadrinhamento"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-medium text-childfund-green">
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant={transaction.receiptStatus === "downloaded" ? "secondary" : "default"}>
                              {transaction.receiptStatus === "downloaded" ? "Baixado" : "Disponível"}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownload(transaction)}
                            >
                              <Download className="mr-2" size={14} />
                              {transaction.receiptStatus === "downloaded" ? "Baixar Novamente" : "Baixar"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {/* Cards - Mobile */}
              <div className="md:hidden flex flex-col gap-4">
                {filteredTransactions.map((transaction) => (
                  <Card key={transaction.id} className="p-4 flex flex-col gap-2 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{formatDate(transaction.date)}</span>
                      <span className="font-medium text-childfund-green">{formatCurrency(transaction.amount)}</span>
                    </div>
                    <div className="text-base font-semibold text-gray-800">{transaction.description}</div>
                    <div className="flex flex-wrap gap-2 items-center text-sm">
                      <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                        {transaction.type === "monthly" ? "Guardião" : transaction.type === "once" ? "Única" : "Apadrinhamento"}
                      </span>
                      {getStatusBadge(transaction.status)}
                      <Badge variant={transaction.receiptStatus === "downloaded" ? "secondary" : "default"}>
                        {transaction.receiptStatus === "downloaded" ? "Baixado" : "Disponível"}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDownload(transaction)}
                      >
                        <Download className="mr-2" size={14} />
                        {transaction.receiptStatus === "downloaded" ? "Baixar Novamente" : "Baixar"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            /* ✅ AVISO QUANDO NÃO HÁ DADOS */
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-childfund-green/10 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-childfund-green" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Histórico de Doações em Desenvolvimento
                </h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Estamos trabalhando para disponibilizar o histórico completo das suas doações e recibos. 
                  Esta funcionalidade estará disponível em breve.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>• Histórico detalhado de todas as suas contribuições</p>
                  <p>• Download de recibos para declaração do Imposto de Renda</p>
                  <p>• Relatórios personalizados por período</p>
                </div>
                <div className="mt-6">
                  <Button 
                    className="bg-childfund-green hover:bg-childfund-green/90"
                    onClick={() => setIsDonationModalOpen(true)}
                  >
                    <CreditCard className="mr-2" size={16} />
                    Fazer Nova Doação
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resumo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-childfund-green">Resumo</CardTitle>
            <CardDescription>
              Total de doações e recibos no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total de Doações</p>
                <p className="text-2xl font-bold text-childfund-green">
                  {filteredTransactions.length}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-childfund-green">
                  {formatCurrency(filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0))}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Recibos Disponíveis</p>
                <p className="text-2xl font-bold text-childfund-green">
                  {filteredTransactions.filter(t => t.receiptStatus === "available").length}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Recibos Baixados</p>
                <p className="text-2xl font-bold text-childfund-green">
                  {filteredTransactions.filter(t => t.receiptStatus === "downloaded").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LoggedLayout>
  );
}
