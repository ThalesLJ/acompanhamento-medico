import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Medicamento } from '@/models/schemas';

export async function GET() {
  try {
    await connectDB();
    
    const medicamentos = await Medicamento.find({ ativo: { $ne: false } })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    return NextResponse.json(medicamentos);
  } catch (error) {
    console.error('Erro ao buscar medicamentos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar medicamentos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    await connectDB();
    
    const medicamento = await Medicamento.create(body);
    
    return NextResponse.json(medicamento);
  } catch (error) {
    console.error('Erro ao criar medicamento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar medicamento' },
      { status: 500 }
    );
  }
} 