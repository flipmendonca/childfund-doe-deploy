import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const prevPath = useRef(pathname);

  useEffect(() => {
    // Só faz scroll para o topo se não for navegação para âncora na mesma página
    if (prevPath.current !== pathname) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    prevPath.current = pathname;
  }, [pathname]);

  return null;
} 