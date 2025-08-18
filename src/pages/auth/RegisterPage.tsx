import { useEffect } from "react";
import RegisterForm from "../../components/auth/RegisterForm";
import { Link } from "react-router-dom";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function RegisterPage() {
  useEffect(() => {
    // Set page title
    document.title = "Cadastro - ChildFund Brasil";
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left side: Image */}
        <div className="hidden md:flex md:w-1/2 bg-primary">
          <div className="relative w-full h-full">
            <img 
              src="/images/Foto- Jake_Lyell_6.webp" 
              alt="Criança sorridente" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Right side: Form */}
        <div className="flex flex-col w-full md:w-1/2 items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-8">
              <img src="/logo-cor.png" alt="ChildFund Brasil" className="h-16 max-h-16 w-auto" />
            </div>
            <RegisterForm />
            <div className="flex justify-center mt-6">
              <Link to="/" className="flex items-center text-[#2C9B44] hover:underline text-sm font-medium w-fit">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Voltar para a Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
