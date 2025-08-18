import { X, Heart, Users, Gift, Star, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface CampaignBannerProps {
  userProfile: "padrinho" | "guardiao" | "unico" | "novo" | "inativo";
  onClose?: () => void;
  hasActiveDonation?: boolean;
  isMultipleDonor?: boolean;
}

export default function CampaignBanner({ userProfile, onClose, hasActiveDonation = true, isMultipleDonor = false }: CampaignBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const getBannerContent = (): {
    icon: JSX.Element;
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    bgGradient: string;
    primaryButtonClass: string;
    secondaryButtonClass: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
  } | null => {
    switch (userProfile) {
      case "padrinho":
        if (isMultipleDonor) {
          // Padrinho que já é também Guardião
          return {
            icon: <Sparkles className="text-white" size={24} />,
            title: "🎆 Você é um verdadeiro herói!",
            description: "Como padrinho E Guardião, você está fazendo dupla diferença! Que tal fazer uma doação especial ou enviar um presente para sua criança apadrinhada?",
            ctaText: "Fazer doação especial",
            ctaLink: "/doacao-unica",
            bgGradient: "from-purple-500 to-indigo-600",
            primaryButtonClass: "bg-white text-purple-600 hover:bg-purple-50 font-semibold shadow-xl border-2 border-white",
            secondaryButtonClass: "bg-purple-600 text-white hover:bg-purple-700 border-2 border-white/50 font-semibold shadow-xl",
            secondaryCtaText: "Enviar presente",
            secondaryCtaLink: "/dashboard/gifts"
          };
        }
        // Padrinho regular - incentivar a ser Guardião ou doação única
        return {
          icon: <Heart className="text-white" size={24} />,
          title: "🚀 Multiplique seu impacto!",
          description: "Como padrinho, você já transforma uma vida. Que tal ampliar seu impacto tornando-se também Guardião da Infância ou fazendo uma doação especial?",
          ctaText: "Tornar-se Guardião",
          ctaLink: "/doacao-mensal",
          bgGradient: "from-childfund-green to-teal-600",
          primaryButtonClass: "bg-white text-childfund-green hover:bg-green-50 font-semibold shadow-xl border-2 border-white",
          secondaryButtonClass: "bg-childfund-green text-white hover:bg-childfund-green/90 border-2 border-white/50 font-semibold shadow-xl",
          secondaryCtaText: "Doação especial",
          secondaryCtaLink: "/doacao-unica"
        };
        
      case "guardiao":
        if (isMultipleDonor) {
          // Guardião que também é padrinho
          return {
            icon: <TrendingUp className="text-white" size={24} />,
            title: "🏆 Seu impacto é incrível!",
            description: "Como Guardião E padrinho, você está criando transformações reais! Veja seu relatório de impacto ou faça uma contribuição adicional.",
            ctaText: "Ver meu impacto",
            ctaLink: "/dashboard/reports",
            bgGradient: "from-amber-500 to-orange-600",
            primaryButtonClass: "bg-white text-amber-600 hover:bg-amber-50 font-semibold shadow-xl border-2 border-white",
            secondaryButtonClass: "bg-amber-600 text-white hover:bg-amber-700 border-2 border-white/50 font-semibold shadow-xl",
            secondaryCtaText: "Contribuição extra",
            secondaryCtaLink: "/doacao-unica"
          };
        }
        // Guardião regular - incentivar apadrinhamento ou doação especial
        return {
          icon: <Users className="text-white" size={24} />,
          title: "❤️ Crie um vínculo especial",
          description: "Como Guardião, você já apoia muitas crianças. Que tal criar um laço único apadrinhando uma criança específica?",
          ctaText: "Apadrinhar criança",
          ctaLink: "/apadrinhamento",
          bgGradient: "from-childfund-green to-childfund-green/80",
          primaryButtonClass: "bg-white text-childfund-green hover:bg-green-50 font-semibold shadow-xl border-2 border-white",
          secondaryButtonClass: "bg-childfund-green text-white hover:bg-childfund-green/90 border-2 border-white/50 font-semibold shadow-xl",
          secondaryCtaText: "Doação especial",
          secondaryCtaLink: "/doacao-unica"
        };
        
      case "unico":
        if (!hasActiveDonation) {
          // Ex-doador inativo - reativar
          return {
            icon: <Heart className="text-white" size={24} />,
            title: "🌱 Que tal voltar a transformar vidas?",
            description: "Sentimos sua falta! Você já fez parte dessa jornada de transformação. Reative suas contribuições e continue fazendo a diferença.",
            ctaText: "Reativar doações",
            ctaLink: "/dashboard/payment",
            bgGradient: "from-blue-500 to-blue-600",
            primaryButtonClass: "bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl border-2 border-white",
            secondaryButtonClass: "bg-blue-600 text-white hover:bg-blue-700 border-2 border-white/50 font-semibold shadow-xl",
            secondaryCtaText: "Nova doação",
            secondaryCtaLink: "/doacao-unica"
          };
        }
        // Doador único ativo - incentivar continuidade
        return {
          icon: <Star className="text-white" size={24} />,
          title: "🌟 Transforme uma vida para sempre",
          description: "Sua doação já fez diferença! Que tal dar o próximo passo e criar um vínculo duradouro apadrinhando ou sendo Guardião?",
          ctaText: "Conhecer o apadrinhamento",
          ctaLink: "/apadrinhamento",
          bgGradient: "from-childfund-green to-emerald-600",
          primaryButtonClass: "bg-white text-childfund-green hover:bg-green-50 font-semibold shadow-xl border-2 border-white",
          secondaryButtonClass: "bg-childfund-green text-white hover:bg-childfund-green/90 border-2 border-white/50 font-semibold shadow-xl",
          secondaryCtaText: "Tornar-se Guardião",
          secondaryCtaLink: "/doacao-mensal"
        };
        
      case "novo":
        // Usuário novo sem doações
        return {
          icon: <Sparkles className="text-white" size={24} />,
          title: "🌈 Bem-vindo(a) à família ChildFund!",
          description: "Comece sua jornada de transformação hoje! Escolha como quer fazer a diferença: apadrinhando uma criança ou sendo Guardião da Infância.",
          ctaText: "Apadrinhar criança",
          ctaLink: "/apadrinhamento",
          bgGradient: "from-pink-500 to-rose-600",
          primaryButtonClass: "bg-white text-pink-600 hover:bg-pink-50 font-semibold shadow-xl border-2 border-white",
          secondaryButtonClass: "bg-pink-600 text-white hover:bg-pink-700 border-2 border-white/50 font-semibold shadow-xl",
          secondaryCtaText: "Ser Guardião",
          secondaryCtaLink: "/doacao-mensal"
        };
        
      case "inativo":
        // Usuário com doações pausadas/canceladas
        return {
          icon: <Heart className="text-white" size={24} />,
          title: "🤗 Sua generosidade faz falta",
          description: "Você já foi parte dessa jornada incrível. As crianças e comunidades que você apoiou continuam precisando do seu carinho e cuidado.",
          ctaText: "Reativar apoio",
          ctaLink: "/dashboard/payment",
          bgGradient: "from-teal-500 to-cyan-600",
          primaryButtonClass: "bg-white text-teal-600 hover:bg-teal-50 font-semibold shadow-xl border-2 border-white",
          secondaryButtonClass: "bg-teal-600 text-white hover:bg-teal-700 border-2 border-white/50 font-semibold shadow-xl",
          secondaryCtaText: "Nova contribuição",
          secondaryCtaLink: "/doacao-unica"
        };
        
      default:
        return null;
    }
  };

  const content = getBannerContent();
  if (!content) return null;

  return (
    <div className="campaign-banner-container">
      <Card className={`relative overflow-hidden border-none shadow-lg mb-4 sm:mb-6 mx-2 sm:mx-4 md:mx-6 lg:mx-auto max-w-7xl`}>
      <div className={`bg-gradient-to-r ${content.bgGradient} p-2 sm:p-3 md:p-4 lg:p-6 overflow-hidden`}>
        <button
          onClick={handleClose}
          className="absolute top-1 right-1 sm:top-2 sm:right-2 md:top-3 md:right-3 text-white/80 hover:text-white transition-colors p-1 sm:p-1.5 md:p-2 rounded-full hover:bg-white/20 group z-10"
          aria-label="Fechar banner"
        >
          <X size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />
          <span className="absolute -bottom-8 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Fechar banner
          </span>
        </button>
        
        {/* Layout mobile-first otimizado */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 w-full pr-4 sm:pr-6 md:pr-8 lg:pr-10">
          {/* Ícone e título em linha no mobile */}
          <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-1">
            <div className="flex-shrink-0 p-1.5 sm:p-2 md:p-2.5 bg-white/20 rounded-full">
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex items-center justify-center">
                {content.icon}
              </div>
            </div>
            
            {/* Título visível no mobile junto ao ícone */}
            <h3 className="text-sm sm:hidden font-bold text-white leading-tight break-words hyphens-auto flex-1">
              {content.title}
            </h3>
          </div>
          
          <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
            {/* Título para telas maiores */}
            <h3 className="hidden sm:block text-base md:text-lg lg:text-xl font-bold text-white leading-tight break-words hyphens-auto">
              {content.title}
            </h3>
            
            {/* Descrição com melhor espaçamento */}
            <p className="text-white/90 text-xs sm:text-sm md:text-base leading-relaxed break-words hyphens-auto">
              {content.description}
            </p>
            
            {/* Botões sempre empilhados no mobile para melhor usabilidade */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full pt-1">
              <Button
                onClick={() => window.location.href = content.ctaLink}
                className={`${content.primaryButtonClass} text-xs sm:text-sm px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 h-8 sm:h-9 md:h-10 w-full sm:w-auto sm:flex-1 md:flex-initial min-w-0`}
                variant="default"
              >
                <span className="truncate text-center font-medium">{content.ctaText}</span>
              </Button>
              
              {content.secondaryCtaText && content.secondaryCtaLink && (
                <Button
                  onClick={() => window.location.href = content.secondaryCtaLink!}
                  className={`${content.secondaryButtonClass} text-xs sm:text-sm px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 h-8 sm:h-9 md:h-10 w-full sm:w-auto sm:flex-1 md:flex-initial min-w-0`}
                  variant="default"
                >
                  <span className="truncate text-center font-medium">{content.secondaryCtaText}</span>
                  <Star className="ml-1.5 sm:ml-2 flex-shrink-0" size={12} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
    </div>
  );
}