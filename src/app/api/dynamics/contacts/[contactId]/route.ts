import { NextRequest, NextResponse } from 'next/server';
import { DynamicsToken } from '@/services/DynamicsToken';

export async function GET(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const { contactId } = params;
    const { searchParams } = new URL(request.url);
    
    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }

    // Obter token de autenticação
    const token = await DynamicsToken.getInstance().getValidToken();
    
    // Construir URL da consulta
    const dynamicsUrl = new URL(`${process.env.DYNAMICS_BASE_URL}contacts(${contactId})`);
    
    // Passar parâmetros OData se fornecidos
    searchParams.forEach((value, key) => {
      dynamicsUrl.searchParams.set(key, value);
    });

    console.log('Consultando contato específico:', dynamicsUrl.toString());

    const response = await fetch(dynamicsUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }
      
      const errorText = await response.text();
      console.error('Erro do Dynamics CRM:', response.status, errorText);
      throw new Error(`Dynamics CRM error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Contato encontrado: ${data.fullname || data.firstname} (ID: ${contactId})`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na consulta de contato:', error);
    return NextResponse.json(
      { 
        error: 'Failed to query contact from Dynamics CRM',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 