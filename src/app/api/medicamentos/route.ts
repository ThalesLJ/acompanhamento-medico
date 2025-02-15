import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export async function GET() {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(MONGODB_URI);
  }

  try {
    const medicamentos = await mongoose.connection.db
      .collection('medicamentos')
      .find({ ativo: { $ne: false } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(medicamentos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar medicamentos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(MONGODB_URI);
  }

  try {
    const data = await request.json();
    
    const novoMedicamento = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      ativo: true
    };

    const result = await mongoose.connection.db
      .collection('medicamentos')
      .insertOne(novoMedicamento);

    return NextResponse.json(
      { ...novoMedicamento, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar medicamento' },
      { status: 500 }
    );
  }
} 