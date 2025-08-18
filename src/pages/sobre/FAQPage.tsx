
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import FAQ from "../../components/FAQ";

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-childfund-green to-childfund-green/80 text-white py-20">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Perguntas Frequentes</h1>
            <p className="text-xl max-w-2xl">
              Encontre respostas para suas principais dúvidas sobre nosso trabalho
            </p>
          </div>
        </div>

        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
