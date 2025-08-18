import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  Gift, 
  UserRound, 
  HelpCircle, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  Settings,
  AlertCircle,
  Receipt
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useDonorData } from "../../hooks/useDonorData";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface LoggedLayoutProps {
  children: ReactNode;
}

// Flag para exibir o seletor de perfil (mockProfile) na área logada
const SHOW_MOCK_PROFILE = true; // Troque para false para esconder em produção

export default function LoggedLayout({ children }: LoggedLayoutProps) {
  const { user, logout, mockProfile, changeMockProfile } = useAuth();
  const donorData = useDonorData();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: "Área do Doador", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Meu Perfil", path: "/dashboard/profile", icon: <UserRound size={20} /> },
    { name: "Gerenciar Pagamento", path: "/dashboard/payment", icon: <CreditCard size={20} /> },
    { name: "Minhas Doações e Recibos", path: "/dashboard/donations", icon: <Receipt size={20} /> },
    { 
      name: "Meus Afilhados", 
      path: "/dashboard/sponsored", 
      icon: <Users size={20} />,
      // Show for users with sponsored children or sponsors
      show: user?.donorType === "sponsor" || 
            (donorData && 'sponsorships' in donorData && donorData.sponsorships && donorData.sponsorships.length > 0) || 
            (donorData && 'sponsoredChild' in donorData && donorData.sponsoredChild)
    },
    { 
      name: "Benefícios & Comunidade", 
      path: "/dashboard/benefits", 
      icon: null,
      featureDev: true
    },
    { name: "Ajuda & Suporte", path: "/dashboard/help", icon: <HelpCircle size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // ✅ FUNÇÃO PARA NAVEGAÇÃO COM REFRESH QUANDO NECESSÁRIO
  const handleNavigation = (path: string) => {
    console.log('🔍 [LoggedLayout] Tentando navegar para:', path, 'Atual:', location.pathname);
    
    if (location.pathname === path) {
      // Se já estamos na página, force um refresh
      console.log('🔄 [LoggedLayout] Forçando refresh da página');
      window.location.reload();
    } else {
      // Navegação forçada com window.location para garantir que funcione
      console.log('🚀 [LoggedLayout] Forçando navegação com window.location');
      window.location.href = path;
    }
    // Fechar sidebar mobile se estiver aberto
    setIsSidebarOpen(false);
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
  };

  const getPageTitle = (pathname: string) => {
    const currentNav = navigation.find(item => item.path === pathname);
    return currentNav?.name || "Área do Doador";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="flex items-center justify-center h-20 border-b border-gray-200 px-4">
          <Link to="/" className="flex items-center gap-2 px-2">
            <img src="/logo-cor.png" alt="ChildFund Brasil" className="h-12 max-h-12 w-auto" />
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.filter(item => item.show === undefined || item.show === true).map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all text-left
                  ${
                    location.pathname === item.path
                      ? "bg-childfund-green/10 text-childfund-green"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                {item.icon && <span className="mr-3">{item.icon}</span>}
                <span className="flex-1">{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={handleLogout}
            >
              <LogOut size={20} className="mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-20 border-b border-gray-200 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-cor.png" alt="ChildFund Brasil" className="h-12 max-h-12 w-auto" />
          </Link>
          <button onClick={toggleSidebar} className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.filter(item => item.show === undefined || item.show === true).map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all text-left
                  ${
                    location.pathname === item.path
                      ? "bg-childfund-green/10 text-childfund-green"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                {item.icon && <span className="mr-3">{item.icon}</span>}
                <span className="flex-1">{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={() => {
                handleLogout();
                setIsSidebarOpen(false);
              }}
            >
              <LogOut size={20} className="mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        {/* Top navbar com cores do ChildFund */}
        <header className="bg-childfund-green shadow-lg sticky top-0 z-10">
          <div className="px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-md text-white hover:bg-childfund-green/80"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>

            {/* Page title */}
            <div className="font-semibold text-lg md:block hidden text-white">
              {getPageTitle(location.pathname)}
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 text-white hover:bg-childfund-green/80">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-white text-childfund-green">
                          {user?.name ? getInitials(user.name) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block font-medium text-sm">{user?.name?.split(' ')[0]}</span>
                      <ChevronDown size={16} />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleNavigation("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Área do Doador</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation("/dashboard/profile")}>
                    <UserRound className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation("/dashboard/donations")}>
                    <Receipt className="mr-2 h-4 w-4" />
                    <span>Doações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
