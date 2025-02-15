import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(MONGODB_URI);
  }

  try {
    if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const consulta = await mongoose.connection.db
      .collection('consultas')
      .findOne({ _id: new mongoose.Types.ObjectId(params.id) });

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
      { error: 'Erro ao buscar consulta' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(MONGODB_URI);
  }

  try {
    const data = await request.json();

    if (!data.dataHora || !data.especialidade || !data.medico || !data.local) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    const consultaAtualizada = {
      ...data,
      dataHora: new Date(data.dataHora),
      updatedAt: new Date()
    };

    const result = await mongoose.connection.db
      .collection('consultas')
      .findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(params.id) },
        { $set: consultaAtualizada },
        { returnDocument: 'after' }
      );

    if (!result.value) {
      return NextResponse.json(
        { error: 'Consulta não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar consulta' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(MONGODB_URI);
  }

  try {
    const result = await mongoose.connection.db
      .collection('consultas')
      .findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(params.id) },
        { $set: { ativo: false, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );

    if (!result.value) {
      return NextResponse.json(
        { error: 'Consulta não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao excluir consulta' },
      { status: 500 }
    );
  }
} 