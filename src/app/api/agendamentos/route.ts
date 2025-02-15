import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Agendamento } from '@/models/schemas';

export async function GET() {
  try {
    await connectDB();
    const agendamentos = await Agendamento.find({}).sort({ dataHora: 1 });
    return NextResponse.json(agendamentos);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const novoAgendamento = await Agendamento.create(data);
    return NextResponse.json(novoAgendamento, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 });
  }
} 