import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, User, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estado local para o nome do profileData
  const [profileName, setProfileName] = useState(() => {
    const savedProfile = localStorage.getItem("profileData");
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      if (profile.name) return profile.name;
    }
    return user?.name || '';
  });

  useEffect(() => {
    const updateProfileName = () => {
      const savedProfile = localStorage.getItem("profileData");
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        if (profile.name) {
          setProfileName(profile.name);
          return;
        }
      }
      setProfileName(user?.name || '');
    };
    window.addEventListener('storage', updateProfileName);
    // Também atualizar ao montar e ao salvar no mesmo contexto
    updateProfileName();
    return () => window.removeEventListener('storage', updateProfileName);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/como-apoiar');
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
  };

  // Função para obter o primeiro nome
  const getDisplayName = () => {
    return profileName.split(' ')[0] || 'Usuário';
  };

  // Função para scroll suave para a seção de apadrinhamento
  const scrollToApadrinhamento = () => {
    const section = document.getElementById('apadrinhamento');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handler para o botão na navbar
  const handleApadrinheClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    // Forçar refresh e navegação para a seção de apadrinhamento
    window.location.href = '/como-apoiar#apadrinhamento';
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      {/* Navegação principal com gradiente */}
      <div className="bg-gradient-to-r from-childfund-green to-childfund-green/95 shadow-lg overflow-hidden">
        <div className="container mx-auto flex justify-between items-center py-1 sm:py-2 px-2 sm:px-4 md:px-6">
          <Link 
            to="/" 
            className="flex items-center gap-2 sm:gap-3 group -mt-6 sm:-mt-8 -mb-6 sm:-mb-8 flex-shrink-0" 
            onClick={() => {
              // Forçar refresh para garantir navegação correta
              window.location.href = '/';
            }}
          >
            <img src="/logo-branca-transp.png" alt="ChildFund Brasil" className="h-24 sm:h-28 md:h-32 object-contain" />
          </Link>

          {/* Desktop Navigation aprimorada */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-8 flex-wrap">
            <Link 
              to="/doacao-mensal" 
              className="text-white hover:text-childfund-yellow transition-colors font-medium px-2 lg:px-3 py-1 lg:py-2 rounded-lg hover:bg-white/10 text-sm lg:text-base whitespace-nowrap" 
              onClick={() => {
                setIsMenuOpen(false);
                // Forçar refresh para garantir navegação correta
                window.location.href = '/doacao-mensal';
              }}
            >
              Guardião da Infância
            </Link>
            <Button
              className="bg-childfund-orange hover:bg-childfund-orange/90 text-white text-sm lg:text-base px-2 lg:px-4 py-1 lg:py-2 whitespace-nowrap"
              onClick={handleApadrinheClick}
            >
              Apadrinhe uma Criança
            </Button>
            <Link 
              to="/doacao-unica" 
              className="text-white hover:text-childfund-yellow transition-colors font-medium px-2 lg:px-3 py-1 lg:py-2 rounded-lg hover:bg-white/10 text-sm lg:text-base whitespace-nowrap" 
              onClick={() => {
                setIsMenuOpen(false);
                // Forçar refresh para garantir navegação correta
                window.location.href = '/doacao-unica';
              }}
            >
              Doação Única
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 lg:gap-2 bg-gray-100 hover:bg-gray-200 text-black rounded-full px-2 lg:px-3 py-1 shadow-md border border-gray-200 min-w-0">
                    <Avatar className="h-6 lg:h-8 w-6 lg:w-8 border-2 border-gray-300 bg-black flex-shrink-0">
                      <AvatarFallback className="bg-black text-white font-bold text-xs lg:text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm lg:text-base max-w-[80px] lg:max-w-[120px] truncate">{getDisplayName()}</span>
                    <ChevronDown size={14} className="text-gray-500 lg:w-[18px] lg:h-[18px] flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white shadow-xl border border-gray-100">
                  <div className="flex items-center justify-start gap-2 p-3 bg-childfund-green/5">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-semibold text-childfund-green">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-gray-600">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2 p-3 hover:bg-childfund-green/5">
                      <User className="fill-childfund-green text-childfund-green" size={16} />
                      Área do Doador
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="flex items-center gap-2 p-3 hover:bg-childfund-green/5">
                      <User className="fill-childfund-green text-childfund-green" size={16} />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/donations" className="flex items-center gap-2 p-3 hover:bg-childfund-green/5">
                      <User className="fill-childfund-green text-childfund-green" size={16} />
                      Minhas Doações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 p-3 hover:bg-red-50">
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/auth/login')} className="bg-white text-childfund-green border border-childfund-green font-bold px-2 lg:px-4 py-1 lg:py-2 rounded-lg ml-1 lg:ml-2 shadow-sm text-sm lg:text-base whitespace-nowrap">
                Entrar na Área do Doador
                </Button>
            )}
          </div>

            <button 
              className="md:hidden text-white p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isMenuOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
            </button>
        </div>

        {/* Mobile Navigation melhorada */}
        {isMenuOpen && (
          <div className="md:hidden bg-childfund-green/95 backdrop-blur-sm py-4 px-4 pb-8 border-t border-white/20">
            <div className="flex flex-col gap-4">
              {user && (
                <div className="flex flex-col gap-2 bg-white/90 rounded-lg p-3 mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border-2 border-childfund-green bg-white">
                      <AvatarFallback className="bg-childfund-green text-white font-bold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-childfund-green text-base leading-tight">{getDisplayName()}</span>
                      <span className="text-xs text-gray-600 leading-tight">{user.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    {location.pathname !== "/dashboard" && (
                      <Link to="/dashboard" className="text-childfund-green font-medium py-1 px-2 rounded hover:bg-childfund-green/10" onClick={() => setIsMenuOpen(false)}>
                        Área do Doador
                      </Link>
                    )}
                    <Link to="/dashboard/profile" className="text-childfund-green font-medium py-1 px-2 rounded hover:bg-childfund-green/10" onClick={() => setIsMenuOpen(false)}>
                      Meu Perfil
                    </Link>
                    <Link to="/dashboard/donations" className="text-childfund-green font-medium py-1 px-2 rounded hover:bg-childfund-green/10" onClick={() => setIsMenuOpen(false)}>
                      Minhas Doações
                    </Link>
                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-red-600 font-medium py-1 px-2 rounded hover:bg-red-50 text-left">
                      Sair
                    </button>
                  </div>
                </div>
              )}
              <Link 
                to="/doacao-mensal" 
                className="text-white py-2 border-b border-white/20" 
                onClick={() => {
                  setIsMenuOpen(false);
                  window.location.href = '/doacao-mensal';
                }}
              >
                Guardião da Infância
              </Link>
              <Button 
                className="w-full bg-childfund-orange hover:bg-childfund-orange/90 text-white shadow-lg hover:shadow-xl font-bold mt-2"
                onClick={handleApadrinheClick}
              >
                Apadrinhe uma Criança
              </Button>
              <Link 
                to="/doacao-unica" 
                className="text-white py-2 border-b border-white/20" 
                onClick={() => {
                  setIsMenuOpen(false);
                  window.location.href = '/doacao-unica';
                }}
              >
                Doação Única
              </Link>
              {!user && (
                <Link to="/auth/login" className="text-white py-2 border-b border-white/20" onClick={() => setIsMenuOpen(false)}>
                  Entrar na Área do Doador
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
