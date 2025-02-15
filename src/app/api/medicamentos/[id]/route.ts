import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Medicamento } from '@/models/schemas';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const medicamento = await Medicamento.findById(params.id);
    
    if (!medicamento) {
      return NextResponse.json(
        { error: 'Medicamento não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(medicamento);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar medicamento' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const data = await request.json();
    
    const medicamento = await Medicamento.findByIdAndUpdate(
      params.id,
      data,
      { new: true }
    );
    
    if (!medicamento) {
      return NextResponse.json(
        { error: 'Medicamento não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(medicamento);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar medicamento' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const medicamento = await Medicamento.findByIdAndUpdate(
      params.id,
      { ativo: false },
      { new: true }
    );
    
    if (!medicamento) {
      return NextResponse.json(
        { error: 'Medicamento não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(medicamento);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao excluir medicamento' },
      { status: 500 }
    );
  }
} 