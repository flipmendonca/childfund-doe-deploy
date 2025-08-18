import { Banner } from '../components/Banner';

export function ComoAjudarPage() {
  return (
    <div>
      <Banner
        title="Como Ajudar"
        subtitle="Existem várias maneiras de fazer a diferença na vida de uma criança. Conheça as formas de ajudar e escolha a que melhor se encaixa no seu perfil."
        imageSrc="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1920&q=80"
        imageAlt="Crianças felizes brincando juntas"
      />
      
      {/* Resto do conteúdo da página */}
      <div className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-roboto-slab font-bold text-childfund-green mb-8">
          Formas de Ajudar
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card de Apadrinhamento */}
          <div className="card-donation">
            <h3 className="text-2xl font-roboto-slab font-bold text-childfund-green mb-4">
              Apadrinhamento
            </h3>
            <p className="text-gray-600 mb-6">
              Ao apadrinhar uma criança, você contribui diretamente para seu desenvolvimento, 
              garantindo acesso à educação, saúde e alimentação adequada.
            </p>
            <button className="btn-primary w-full">
              Apadrinhar Agora
            </button>
          </div>

          {/* Card de Doação */}
          <div className="card-donation">
            <h3 className="text-2xl font-roboto-slab font-bold text-childfund-green mb-4">
              Doação Única
            </h3>
            <p className="text-gray-600 mb-6">
              Faça uma doação única e ajude a transformar a vida de muitas crianças 
              através de nossos projetos e programas.
            </p>
            <button className="btn-primary w-full">
              Doar Agora
            </button>
          </div>

          {/* Card de Voluntariado */}
          <div className="card-donation">
            <h3 className="text-2xl font-roboto-slab font-bold text-childfund-green mb-4">
              Voluntariado
            </h3>
            <p className="text-gray-600 mb-6">
              Doe seu tempo e conhecimento participando de nossos programas 
              voluntários e faça a diferença na comunidade.
            </p>
            <button className="btn-primary w-full">
              Ser Voluntário
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 