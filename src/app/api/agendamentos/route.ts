import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export async function GET() {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(MONGODB_URI);
  }

  try {
    const agendamentos = await mongoose.connection.db
      .collection('agendamentos')
      .find({})
      .sort({ dataHora: 1 })
      .toArray();

    return NextResponse.json(agendamentos);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(MONGODB_URI);
  }

  try {
    const data = await request.json();
    
    const novoAgendamento = {
      ...data,
      dataHora: new Date(data.dataHora),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await mongoose.connection.db
      .collection('agendamentos')
      .insertOne(novoAgendamento);

    return NextResponse.json(
      { ...novoAgendamento, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 });
  }
} 