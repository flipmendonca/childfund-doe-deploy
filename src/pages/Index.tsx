import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import ComoApoiarPage from './ComoApoiarPage';

export default function Index() {
  const navigate = useNavigate();

  return <ComoApoiarPage />;
} 