import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DoacaoUnicaForm from "../components/DoacaoUnicaForm";
import { motion } from "framer-motion";

export default function DoacaoUnicaPage() {
  useEffect(() => {
    document.title = "Doação Única - ChildFund Brasil";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <motion.main 
        className="flex-grow bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <DoacaoUnicaForm />
      </motion.main>
      
      <Footer />
    </div>
  );
}
