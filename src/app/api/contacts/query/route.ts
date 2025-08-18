import { NextRequest, NextResponse } from 'next/server';
import { DynamicsToken } from '@/services/DynamicsToken';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    
    if (!searchTerm) {
      return NextResponse.json({ error: 'Search term is required' }, { status: 400 });
    }

    const token = await DynamicsToken.getInstance().getValidToken();
    
    // Filtro correto para crianças disponíveis + busca por nome usando startswith
    const filter = `statecode eq 0 and new_statusbloqueado eq false and new_data_do_apadrinhamento eq null and (startswith(fullname, '${searchTerm}') or startswith(firstname, '${searchTerm}'))`;
    
    const queryParams = new URLSearchParams({
      '$select': 'contactid,firstname,lastname,fullname,birthdate,gendercode,new_genero,chf_fotocrianca_url,new_statusbloqueado,new_data_do_apadrinhamento',
      '$filter': filter,
      '$orderby': 'fullname asc',
      '$top': '100'
    });

    const response = await fetch(`${process.env.DYNAMICS_BASE_URL}contacts?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro do Dynamics CRM na busca:', response.status, errorText);
      throw new Error(`Dynamics query failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Busca por "${searchTerm}": ${data.value?.length || 0} resultados encontrados`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na busca de contatos:', error);
    return NextResponse.json({ 
      error: 'Failed to query contacts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 