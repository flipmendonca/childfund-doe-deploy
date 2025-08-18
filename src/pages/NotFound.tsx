import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-childfund-green mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Página não encontrada</h2>
      <p className="text-gray-600 mb-6">Você será redirecionado para a página inicial em instantes.</p>
      <button
        className="bg-childfund-green text-white px-6 py-2 rounded-lg font-bold hover:bg-childfund-green/90 transition"
        onClick={() => navigate('/')}
      >
        Ir para a Home agora
      </button>
    </div>
  );
}
