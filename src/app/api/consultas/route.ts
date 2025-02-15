import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export async function GET() {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(MONGODB_URI);
  }

  try {
    const consultas = await mongoose.connection.db
      .collection('consultas')
      .find({ ativo: { $ne: false } })
      .sort({ dataHora: 1 })
      .toArray();

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
  if (!mongoose.connection.readyState) {
    await mongoose.connect(MONGODB_URI);
  }

  try {
    const data = await request.json();
    
    const novaConsulta = {
      ...data,
      dataHora: new Date(data.dataHora),
      createdAt: new Date(),
      updatedAt: new Date(),
      ativo: true
    };

    const result = await mongoose.connection.db
      .collection('consultas')
      .insertOne(novaConsulta);

    return NextResponse.json(
      { ...novaConsulta, _id: result.insertedId }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar consulta:', error);
    return NextResponse.json(
      { error: 'Erro ao criar consulta' },
      { status: 500 }
    );
  }
} 