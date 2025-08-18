
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UnifiedDonationForm from "@/components/UnifiedDonationForm";
import { motion } from "framer-motion";

export default function SponsorPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const childData = {
    id: searchParams.get("child") || "",
    name: searchParams.get("name") || "",
    age: parseInt(searchParams.get("age") || "0"),
    location: searchParams.get("location") || "",
    image: searchParams.get("image") || ""
  };

  const hasChildData = childData.id && childData.name;

  useEffect(() => {
    document.title = hasChildData 
      ? `Apadrinhar ${childData.name} - ChildFund Brasil`
      : "Apadrinhamento - ChildFund Brasil";
  }, [hasChildData, childData.name]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <motion.main 
        className="flex-grow bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <UnifiedDonationForm 
          initialMode="sponsorship" 
          childData={hasChildData ? childData : undefined}
        />
      </motion.main>
      
      <Footer />
    </div>
  );
}
