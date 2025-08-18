import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Auth from './pages/Auth';
import MockLoginPage from './pages/auth/MockLoginPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Donations from './pages/Donations';
import { AuthProvider } from './contexts/AuthContext';
import { LocalDonationsProvider } from './contexts/LocalDonationsContext';
import { DonationProvider } from './contexts/DonationContext';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ComoApoiarPage from "./pages/ComoApoiarPage";
import DoacaoMensalPage from "./pages/DoacaoMensalPage";
import DoacaoUnicaPage from "./pages/DoacaoUnicaPage";
import ApadrinhamentoPage from "./pages/ApadrinhamentoPage";
import DoacaoApadrinhamentoPage from "./pages/DoacaoApadrinhamentoPage";
import DonateNowPage from "./pages/DonateNowPage";
import TestRecaptcha from './pages/TestRecaptcha';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/ScrollToTop';
import DynamicsDebug from './pages/DynamicsDebug';
import DSOConnectionTest from './components/DSOConnectionTest';

// Páginas de sucesso
import SucessoDoacaoUnicaPage from "./pages/SucessoDoacaoUnicaPage";
import SucessoApadrinhamentoPage from "./pages/SucessoApadrinhamentoPage";
import SucessoDoacaoRecorrentePage from "./pages/SucessoDoacaoRecorrentePage";

// Serviços
import { AnalyticsService } from "./services/AnalyticsService";

// Páginas do Dashboard
import SponsoredPage from "./pages/dashboard/SponsoredPage";
import BenefitsPage from "./pages/dashboard/BenefitsPage";
import HelpPage from "./pages/dashboard/HelpPage";
import LettersPage from "./pages/dashboard/LettersPage";
import VisitSchedulingPage from "./pages/dashboard/VisitSchedulingPage";
import PaymentPage from "./pages/dashboard/PaymentPage";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Inicializar Analytics Service
    AnalyticsService.initialize();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DonationProvider>
          <LocalDonationsProvider>
          <Router>
          <ScrollToTop />
          <div className="App">
            <Toaster />
            <SonnerToaster />
            <Routes>
              {/* Rotas principais */}
              <Route path="/" element={<Index />} />
              
              {/* Rotas de autenticação */}
              <Route path="/auth/:type" element={<Auth />} />
              <Route path="/auth/mock-login" element={<MockLoginPage />} />
              <Route path="/entrar" element={<Navigate to="/auth/login" replace />} />
              <Route path="/cadastro" element={<Navigate to="/auth/register" replace />} />
              <Route path="/redefinir-senha" element={<Navigate to="/auth/forgot-password" replace />} />
              
              {/* Rotas do dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/dashboard/donations" element={<Donations />} />
              <Route path="/dashboard/sponsored" element={<SponsoredPage />} />
              <Route path="/dashboard/benefits" element={<BenefitsPage />} />
              <Route path="/dashboard/help" element={<HelpPage />} />
              <Route path="/dashboard/letters" element={<LettersPage />} />
              <Route path="/dashboard/visit-scheduling" element={<VisitSchedulingPage />} />
              <Route path="/dashboard/payment" element={<PaymentPage />} />
              <Route path="/dashboard/payment-update" element={<PaymentPage />} />
              <Route path="/dashboard/payment-method" element={<PaymentPage />} />
              <Route path="/dashboard/donation-value" element={<PaymentPage />} />
              
              {/* Rotas de doação */}
              <Route path="/como-apoiar" element={<ComoApoiarPage />} />
              <Route path="/doacao-mensal" element={<DoacaoMensalPage />} />
              <Route path="/doacao-unica" element={<DoacaoUnicaPage />} />
              <Route path="/apadrinhamento" element={<ApadrinhamentoPage />} />
              <Route path="/doar-apadrinhamento" element={<DoacaoApadrinhamentoPage />} />
              <Route path="/donate-now" element={<DonateNowPage />} />
              
              {/* Páginas de sucesso */}
              <Route path="/sucesso-doacao-unica" element={<SucessoDoacaoUnicaPage />} />
              <Route path="/sucesso-apadrinhamento" element={<SucessoApadrinhamentoPage />} />
              <Route path="/sucesso-doacao-recorrente" element={<SucessoDoacaoRecorrentePage />} />
              
              {/* Rotas de teste e debug */}
            <Route path="/test-recaptcha" element={<TestRecaptcha />} />
            <Route path="/debug-dynamics" element={<DynamicsDebug />} />
              <Route path="/test-connections" element={<DSOConnectionTest />} />
              
              {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          </Router>
          </LocalDonationsProvider>
        </DonationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
