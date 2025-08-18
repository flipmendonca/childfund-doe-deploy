
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ImpactSection from "../../components/home/ImpactSection";

export default function ImpactoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-childfund-green to-childfund-green/80 text-white py-20">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Nosso Impacto</h1>
            <p className="text-xl max-w-2xl">
              Veja os resultados concretos do nosso trabalho na vida de crianças e comunidades
            </p>
          </div>
        </div>

        <ImpactSection />

        <div className="py-16 bg-gray-50">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-childfund-green">
                Impacto por Área de Atuação
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold mb-4 text-childfund-green">Educação</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Crianças apoiadas na educação</span>
                      <span className="font-bold">35.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de permanência escolar</span>
                      <span className="font-bold">95%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Melhoria no rendimento</span>
                      <span className="font-bold">78%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold mb-4 text-childfund-green">Saúde e Nutrição</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Crianças atendidas em saúde</span>
                      <span className="font-bold">28.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Redução da desnutrição</span>
                      <span className="font-bold">65%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Famílias orientadas</span>
                      <span className="font-bold">12.500</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold mb-4 text-childfund-green">Proteção</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Casos de violência prevenidos</span>
                      <span className="font-bold">1.200</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Adolescentes fora do trabalho infantil</span>
                      <span className="font-bold">850</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Famílias fortalecidas</span>
                      <span className="font-bold">12.500</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold mb-4 text-childfund-green">Desenvolvimento Comunitário</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Organizações parceiras</span>
                      <span className="font-bold">120</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lideranças formadas</span>
                      <span className="font-bold">2.400</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projetos comunitários</span>
                      <span className="font-bold">95</span>
                    </div>
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
