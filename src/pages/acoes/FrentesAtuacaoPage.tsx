
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function FrentesAtuacaoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-childfund-green to-childfund-green/80 text-white py-20">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Frentes de Atuação</h1>
            <p className="text-xl max-w-2xl">
              Conhece as principais áreas onde desenvolvemos nossos programas 
              de proteção infantil
            </p>
          </div>
        </div>

        <div className="py-16">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <h3 className="text-2xl font-bold mb-4 text-childfund-green">Educação</h3>
                  <p className="text-gray-600 mb-4">
                    Promovemos o acesso e permanência na escola, melhorando a qualidade 
                    da educação e apoiando o desenvolvimento integral das crianças.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Reforço escolar</li>
                    <li>• Atividades complementares</li>
                    <li>• Formação de educadores</li>
                    <li>• Material escolar</li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <h3 className="text-2xl font-bold mb-4 text-childfund-green">Saúde e Nutrição</h3>
                  <p className="text-gray-600 mb-4">
                    Garantimos acesso a cuidados de saúde e nutrição adequada, 
                    promovendo o crescimento saudável das crianças.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Acompanhamento nutricional</li>
                    <li>• Suplementação alimentar</li>
                    <li>• Orientação em saúde</li>
                    <li>• Prevenção de doenças</li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <h3 className="text-2xl font-bold mb-4 text-childfund-green">Proteção</h3>
                  <p className="text-gray-600 mb-4">
                    Prevenimos e combatemos todas as formas de violência contra 
                    crianças, fortalecendo redes de proteção.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Prevenção da violência</li>
                    <li>• Combate ao trabalho infantil</li>
                    <li>• Redes de proteção</li>
                    <li>• Denúncias e encaminhamentos</li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <h3 className="text-2xl font-bold mb-4 text-childfund-green">Participação Cidadã</h3>
                  <p className="text-gray-600 mb-4">
                    Promovemos a participação de crianças e adolescentes nos 
                    espaços de decisão que afetam suas vidas.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Conselhos de participação</li>
                    <li>• Formação em direitos</li>
                    <li>• Protagonismo juvenil</li>
                    <li>• Advocacy para políticas</li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <h3 className="text-2xl font-bold mb-4 text-childfund-green">Geração de Renda</h3>
                  <p className="text-gray-600 mb-4">
                    Apoiamos famílias no desenvolvimento de atividades geradoras 
                    de renda, promovendo autonomia econômica.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Capacitação profissional</li>
                    <li>• Microcrédito</li>
                    <li>• Cooperativismo</li>
                    <li>• Empreendedorismo</li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <h3 className="text-2xl font-bold mb-4 text-childfund-green">Cultura e Esporte</h3>
                  <p className="text-gray-600 mb-4">
                    Utilizamos atividades culturais e esportivas como ferramentas 
                    de desenvolvimento e proteção social.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Oficinas culturais</li>
                    <li>• Esportes educacionais</li>
                    <li>• Arte e expressão</li>
                    <li>• Festivais comunitários</li>
                  </ul>
                </div>
              </div>

              <div className="mt-16 bg-gradient-to-r from-blue-50 to-childfund-green/5 p-8 rounded-xl">
                <h3 className="text-2xl font-bold mb-4 text-childfund-green text-center">
                  Nossos Resultados por Frente
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-childfund-green">35K</div>
                    <div className="text-sm text-gray-600">Educação</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-childfund-green">28K</div>
                    <div className="text-sm text-gray-600">Saúde</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-childfund-green">50K</div>
                    <div className="text-sm text-gray-600">Proteção</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-childfund-green">15K</div>
                    <div className="text-sm text-gray-600">Participação</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-childfund-green">8K</div>
                    <div className="text-sm text-gray-600">Renda</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-childfund-green">25K</div>
                    <div className="text-sm text-gray-600">Cultura</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
