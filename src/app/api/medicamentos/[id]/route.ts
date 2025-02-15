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
    const medicamento = await mongoose.connection.db
      .collection('medicamentos')
      .findOne({ _id: new mongoose.Types.ObjectId(params.id) });

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
  if (!mongoose.connection.readyState) {
    await mongoose.connect(MONGODB_URI);
  }

  try {
    const data = await request.json();
    data.updatedAt = new Date();

    const result = await mongoose.connection.db
      .collection('medicamentos')
      .findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(params.id) },
        { $set: data },
        { returnDocument: 'after' }
      );

    if (!result.value) {
      return NextResponse.json(
        { error: 'Medicamento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.value);
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
  if (!mongoose.connection.readyState) {
    await mongoose.connect(MONGODB_URI);
  }

  try {
    const result = await mongoose.connection.db
      .collection('medicamentos')
      .findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(params.id) },
        { $set: { ativo: false, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );

    if (!result.value) {
      return NextResponse.json(
        { error: 'Medicamento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao excluir medicamento' },
      { status: 500 }
    );
  }
} 