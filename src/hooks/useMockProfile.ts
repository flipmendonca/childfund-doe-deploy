import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserProfile, mockUsers } from '../mocks/userProfiles';

export function useMockProfile() {
  const [searchParams] = useSearchParams();
  const [mockProfile, setMockProfile] = useState<UserProfile>(() => {
    // Tenta pegar do localStorage primeiro
    const savedProfile = localStorage.getItem('mockProfile');
    if (savedProfile && (savedProfile === 'padrinho' || savedProfile === 'guardiao' || savedProfile === 'unico')) {
      return savedProfile;
    }
    // Se não tiver no localStorage, pega da URL
    const profileParam = searchParams.get('perfil');
    if (profileParam && (profileParam === 'padrinho' || profileParam === 'guardiao' || profileParam === 'unico')) {
      return profileParam;
    }
    // Default para padrinho se nada for especificado
    return 'padrinho';
  });

  useEffect(() => {
    // Salva no localStorage quando mudar
    localStorage.setItem('mockProfile', mockProfile);
  }, [mockProfile]);

  const mockUser = mockUsers[mockProfile];

  const changeProfile = (newProfile: UserProfile) => {
    setMockProfile(newProfile);
  };

  return {
    mockProfile,
    mockUser,
    changeProfile
  };
} 