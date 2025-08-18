
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UnifiedDonationForm from "@/components/UnifiedDonationForm";
import { motion } from "framer-motion";

export default function DonateNowPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get("mode") as "once" | "monthly" | null;
  const value = searchParams.get("value") ? parseInt(searchParams.get("value") as string) : undefined;

  useEffect(() => {
    document.title = "Fazer Doação - ChildFund Brasil";
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
        <UnifiedDonationForm initialMode={mode} initialValue={value} />
      </motion.main>
      
      <Footer />
    </div>
  );
}
