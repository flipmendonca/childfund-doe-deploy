import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DoacaoMensalForm from "../components/DoacaoMensalForm";
import { motion } from "framer-motion";

export default function DoacaoMensalPage() {
  useEffect(() => {
    document.title = "Guardião da Infância - ChildFund Brasil";
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
        <DoacaoMensalForm />
      </motion.main>
      
      <Footer />
    </div>
  );
}
