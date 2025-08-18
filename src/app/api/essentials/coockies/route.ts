/**
 * Endpoint /api/essentials/coockies - EXATO como na produção
 * Gerencia token DSO via cookies
 */

import { NextRequest, NextResponse } from 'next/server';

const NEXTKEY = process.env.NEXTKEY || 'default-key';

export async function GET(request: NextRequest) {
  console.log('🍪 [Cookies] GET - Buscando token DSO...');
  
  try {
    // Para desenvolvimento, não exigir Authorization (facilitar testes)
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    console.log('🔍 [Cookies] Auth header recebido:', authHeader);
    console.log('🔍 [Cookies] NEXTKEY esperado:', NEXTKEY);
    console.log('🔍 [Cookies] Request URL:', request.url);
    console.log('🔍 [Cookies] Request method:', request.method);
    
    // Obter cookies da requisição
    const cookieHeader = request.headers.get('cookie') || '';
    console.log('🍪 [Cookies] Header de cookies:', cookieHeader);
    
    // Procurar por token DSO nos cookies
    const tokenMatch = cookieHeader.match(/dso[-_]?token=([^;]+)/i);
    const token = tokenMatch ? tokenMatch[1] : null;
    
    console.log('🔍 [Cookies] Token encontrado:', !!token);
    console.log('🔍 [Cookies] Token value:', token ? `${token.substring(0, 20)}...` : 'null');
    
    const response = {
      token: token ? {
        value: token,
        name: 'dso-token'
      } : null,
      success: !!token,
      message: token ? 'Token encontrado' : 'Token não encontrado',
      debug: {
        cookieHeader: !!cookieHeader,
        cookieLength: cookieHeader.length,
        hasToken: !!token
      }
    };
    
    console.log('✅ [Cookies] Retornando resposta:', JSON.stringify(response, null, 2));
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ [Cookies] Erro completo:', error);
    console.error('❌ [Cookies] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        debug: {
          type: typeof error,
          stack: error instanceof Error ? error.stack : null
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('🍪 [Cookies] POST - Definindo token DSO...');
  
  try {
    // Para desenvolvimento, permitir sem Authorization
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    console.log('🔍 [Cookies] POST Auth header:', authHeader);
    
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      );
    }
    
    console.log('✅ [Cookies] Definindo token, length:', token.length);
    
    const response = NextResponse.json({
      success: true,
      message: 'Token definido com sucesso'
    });
    
    // Definir cookie com token
    response.cookies.set('dso-token', token, {
      httpOnly: false,
      secure: false, // Para desenvolvimento
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    });
    
    return response;
    
  } catch (error) {
    console.error('❌ [Cookies] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  console.log('🍪 [Cookies] DELETE - Removendo token DSO...');
  
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Token removido com sucesso'
    });
    
    // Remover cookie
    response.cookies.delete('dso-token');
    
    return response;
    
  } catch (error) {
    console.error('❌ [Cookies] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 