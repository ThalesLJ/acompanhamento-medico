import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Consulta } from '@/models/schemas';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const consulta = await Consulta.findById(params.id)
      .lean()
      .exec();
    
    if (!consulta) {
      return NextResponse.json(
        { error: 'Consulta não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(consulta);
  } catch (error) {
    console.error('Erro ao buscar consulta:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar consulta', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Validação dos campos obrigatórios
    if (!data.dataHora || !data.especialidade || !data.medico || !data.local) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    // Formatação da data
    const consultaAtualizada = {
      ...data,
      dataHora: new Date(data.dataHora)
    };

    const consulta = await Consulta.findByIdAndUpdate(
      params.id,
      consultaAtualizada,
      { new: true }
    );

    if (!consulta) {
      return NextResponse.json(
        { error: 'Consulta não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(consulta);
  } catch (error) {
    console.error('Erro ao atualizar consulta:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar consulta: ' + error.message },
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
    
    const consulta = await Consulta.findByIdAndUpdate(
      params.id,
      { ativo: false },
      { new: true }
    );
    
    if (!consulta) {
      return NextResponse.json(
        { error: 'Consulta não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(consulta);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao excluir consulta' },
      { status: 500 }
    );
  }
} 