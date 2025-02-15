import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Consulta } from '@/models/schemas';

export async function GET() {
  try {
    await connectDB();
    const consultas = await Consulta.find({ ativo: { $ne: false } })
      .sort({ dataHora: 1 });
    return NextResponse.json(consultas);
  } catch (error) {
    console.error('Erro ao buscar consultas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar consultas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Formatação da data
    const novaConsulta = {
      ...data,
      dataHora: new Date(data.dataHora)
    };

    const consulta = await Consulta.create(novaConsulta);
    return NextResponse.json(consulta, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar consulta:', error);
    return NextResponse.json(
      { error: 'Erro ao criar consulta: ' + error.message },
      { status: 500 }
    );
  }
} 