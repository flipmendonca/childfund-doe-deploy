
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function DesenvolvimentoSocialPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-childfund-green to-childfund-green/80 text-white py-20">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Desenvolvimento Social</h1>
            <p className="text-xl max-w-2xl">
              Fortalecemos comunidades e famílias para criar um ambiente 
              protetor para crianças e adolescentes
            </p>
          </div>
        </div>

        <div className="py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-childfund-green">
                  Nossa Abordagem de Desenvolvimento
                </h2>
                <p className="text-gray-600 mb-6">
                  Acreditamos que o desenvolvimento social sustentável acontece quando 
                  as próprias comunidades são protagonistas da transformação. Por isso, 
                  trabalhamos fortalecendo capacidades locais, criando redes de proteção 
                  e promovendo a participação cidadã.
                </p>
              </div>

              <div className="space-y-8 mb-12">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="text-2xl font-bold mb-4 text-childfund-green">
                    Fortalecimento Familiar
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Desenvolvemos programas que apoiam as famílias no exercício de seu papel 
                    protetor, oferecendo formação em parentalidade positiva, geração de renda 
                    e acesso a serviços básicos.
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Oficinas de parentalidade positiva</li>
                    <li>• Programas de geração de renda</li>
                    <li>• Orientação nutricional</li>
                    <li>• Apoio psicossocial</li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="text-2xl font-bold mb-4 text-childfund-green">
                    Mobilização Comunitária
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Promovemos a organização e mobilização das comunidades para que 
                    sejam agentes de mudança em seus territórios, fortalecendo a 
                    democracia participativa e o controle social.
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Formação de lideranças comunitárias</li>
                    <li>• Criação de comitês locais</li>
                    <li>• Advocacy para políticas públicas</li>
                    <li>• Articulação em redes</li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="text-2xl font-bold mb-4 text-childfund-green">
                    Desenvolvimento Institucional
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Apoiamos organizações locais no fortalecimento de suas capacidades 
                    técnicas e institucionais, promovendo sustentabilidade e qualidade 
                    na prestação de serviços.
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Formação técnica de equipes</li>
                    <li>• Apoio à gestão organizacional</li>
                    <li>• Desenvolvimento de metodologias</li>
                    <li>• Captação de recursos</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-childfund-green/5 p-8 rounded-xl">
                <h3 className="text-2xl font-bold mb-4 text-childfund-green">Impacto do Desenvolvimento Social</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-childfund-green mb-2">120</div>
                    <p className="text-gray-600">Organizações fortalecidas</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-childfund-green mb-2">2.400</div>
                    <p className="text-gray-600">Lideranças formadas</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-childfund-green mb-2">12.500</div>
                    <p className="text-gray-600">Famílias beneficiadas</p>
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
