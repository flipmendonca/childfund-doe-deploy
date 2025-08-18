import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversion_identifier, email, ...otherData } = body;
    
    console.log('🔄 [RD Station Vercel] Recebendo conversão:', body);
    
    if (!conversion_identifier || !email) {
      return NextResponse.json({
        success: false,
        error: 'conversion_identifier e email são obrigatórios'
      }, { status: 400 });
    }
    
    // Integração real com RD Station API
    try {
      console.log('🔄 [RD Station] Enviando para API real...');
      
      const rdPayload = {
        conversion_identifier,
        email,
        ...otherData,
        traffic_source: 'website',
        traffic_medium: 'organic'
      };

      // Verificar se temos as credenciais do RD Station
      const rdClientId = process.env.RD_CLIENT_ID;
      const rdClientSecret = process.env.RD_CLIENT_SECRET;
      
      if (!rdClientId || !rdClientSecret) {
        console.warn('⚠️ [RD Station] Credenciais não encontradas, modo simulação');
        console.log('✅ [RD Station Vercel] Conversão processada (simulação):', {
          identifier: conversion_identifier,
          email,
          data: otherData
        });
        
        return NextResponse.json({
          success: true,
          message: 'Conversão enviada para RD Station (simulação)',
          mode: 'simulation',
          data: {
            identifier: conversion_identifier,
            email,
            timestamp: new Date().toISOString()
          }
        });
      }

      // Primeiro, obter access_token usando refresh_token (conforme documentação RD Station)
      const refreshToken = process.env.RD_REFRESH_TOKEN;
      console.log('🔄 [RD Station] Renovando access_token usando refresh_token...');
      
      const tokenResponse = await fetch('https://api.rd.services/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: rdClientId,
          client_secret: rdClientSecret,
          refresh_token: refreshToken
        })
      });

      if (!tokenResponse.ok) {
        const tokenError = await tokenResponse.text();
        console.error(`❌ [RD Station] Erro ao renovar token: ${tokenResponse.status}`, tokenError);
        throw new Error(`Erro ao obter token: ${tokenResponse.status} - ${tokenError}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('✅ [RD Station] Access token renovado com sucesso');
      console.log('🔑 [RD Station] Token expira em:', tokenData.expires_in, 'segundos');

      // Fazer chamada real para RD Station usando endpoint correto
      const rdResponse = await fetch('https://api.rd.services/platform/events?event_type=CONVERSION', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'authorization': `Bearer ${tokenData.access_token}`
        },
        body: JSON.stringify({
          event_type: 'CONVERSION',
          event_family: 'CDP',
          payload: rdPayload
        })
      });

      if (!rdResponse.ok) {
        const errorText = await rdResponse.text();
        console.error('❌ [RD Station] Erro na API:', rdResponse.status, errorText);
        
        // Retornar sucesso mesmo com erro para não quebrar o fluxo
        return NextResponse.json({
          success: true,
          message: 'Conversão processada (erro na API RD Station)',
          warning: `RD Station API Error: ${rdResponse.status}`,
          data: {
            identifier: conversion_identifier,
            email,
            timestamp: new Date().toISOString()
          }
        });
      }

      const rdResult = await rdResponse.json();
      console.log('✅ [RD Station] Conversão enviada com sucesso:', rdResult);
      
      return NextResponse.json({
        success: true,
        message: 'Conversão enviada para RD Station',
        mode: 'production',
        data: {
          identifier: conversion_identifier,
          email,
          timestamp: new Date().toISOString(),
          rdResult
        }
      });

    } catch (rdError) {
      console.error('❌ [RD Station] Erro na integração:', rdError);
      
      // Retornar sucesso mesmo com erro para não quebrar o fluxo
      return NextResponse.json({
        success: true,
        message: 'Conversão processada (erro na integração RD Station)',
        warning: rdError instanceof Error ? rdError.message : 'Erro desconhecido',
        data: {
          identifier: conversion_identifier,
          email,
          timestamp: new Date().toISOString()
        }
      });
    }
    
  } catch (error) {
    console.error('❌ [RD Station Vercel] Erro:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
