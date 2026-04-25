import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { cpf } = await params;
  const token = 'zqniPtC6uIfw6V0lF4mfDOP9NHPAJD97';
  const apiUrl = `https://zerolimis-1.onrender.com/api/consultar?type=cpf&value=${cpf}&token=${token}`;

  try {
    const response = await fetch(apiUrl);
    
    if (response.status === 401) {
      return NextResponse.json({ error: 'Token da API inválido ou expirado' }, { status: 401 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[CPF] Erro na consulta:', error.message);
    return NextResponse.json({ error: 'Erro ao consultar CPF' }, { status: 500 });
  }
}
