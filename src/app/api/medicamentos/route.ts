import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('/api/medicamentos');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar medicamentos');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar medicamentos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const response = await fetch('/api/medicamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao criar medicamento');
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao criar medicamento' },
      { status: 500 }
    );
  }
} 