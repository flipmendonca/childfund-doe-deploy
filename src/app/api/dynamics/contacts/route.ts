import { NextRequest, NextResponse } from 'next/server';
import { DynamicsToken } from '@/services/DynamicsToken';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Obter token de autenticação
    const token = await DynamicsToken.getInstance().getValidToken();
    
    // Construir URL da consulta
    const dynamicsUrl = new URL(`${process.env.DYNAMICS_BASE_URL}contacts`);
    
    // Passar todos os parâmetros OData para o Dynamics
    searchParams.forEach((value, key) => {
      dynamicsUrl.searchParams.set(key, value);
    });

    console.log('Consultando Dynamics CRM:', dynamicsUrl.toString());

    const response = await fetch(dynamicsUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro do Dynamics CRM:', response.status, errorText);
      throw new Error(`Dynamics CRM error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Retornados ${data.value?.length || 0} contatos do Dynamics CRM`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na consulta de contatos:', error);
    return NextResponse.json(
      { 
        error: 'Failed to query contacts from Dynamics CRM',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 