
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function GovernancaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-childfund-green to-childfund-green/80 text-white py-20">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Governança</h1>
            <p className="text-xl max-w-2xl">
              Transparência, responsabilidade e ética em todas as nossas ações
            </p>
          </div>
        </div>

        <div className="py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-childfund-green">Estrutura Organizacional</h2>
                <p className="text-gray-600 mb-8">
                  O ChildFund Brasil possui uma estrutura de governança sólida e transparente, 
                  com órgãos de controle e fiscalização que garantem a aplicação responsável dos recursos.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold mb-4 text-childfund-green">Conselho de Administração</h3>
                    <p className="text-gray-600">
                      Órgão máximo de governança, responsável pelas diretrizes estratégicas 
                      e fiscalização da gestão executiva.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold mb-4 text-childfund-green">Conselho Fiscal</h3>
                    <p className="text-gray-600">
                      Responsável pela fiscalização financeira e patrimonial, 
                      garantindo transparência na aplicação dos recursos.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold mb-4 text-childfund-green">Diretoria Executiva</h3>
                    <p className="text-gray-600">
                      Responsável pela gestão operacional e implementação 
                      das estratégias definidas pelo Conselho.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-childfund-green">Certificações e Reconhecimentos</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-xl font-bold mb-2">Certificado de Entidade Beneficente</h4>
                    <p className="text-gray-600">
                      Reconhecimento oficial do governo federal que atesta nossa atuação 
                      em favor do interesse público e social.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-xl font-bold mb-2">Registro no CMDCA</h4>
                    <p className="text-gray-600">
                      Inscrição nos Conselhos Municipais dos Direitos da Criança e do Adolescente 
                      em todos os municípios onde atuamos.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-xl font-bold mb-2">Auditoria Externa</h4>
                    <p className="text-gray-600">
                      Nossas contas são auditadas anualmente por empresa independente, 
                      garantindo transparência total em nossa gestão financeira.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-childfund-green/5 p-8 rounded-xl">
                <h3 className="text-2xl font-bold mb-4 text-childfund-green">Prestação de Contas</h3>
                <p className="text-gray-600 mb-4">
                  Acreditamos que a transparência é fundamental para manter a confiança 
                  de nossos doadores e da sociedade.
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li>• Relatórios anuais de atividades e financeiro</li>
                  <li>• Demonstrações contábeis auditadas</li>
                  <li>• Relatórios de impacto social</li>
                  <li>• Prestação de contas aos órgãos reguladores</li>
                  <li>• Portal da transparência online</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
