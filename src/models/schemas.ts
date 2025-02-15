import mongoose from 'mongoose';

const consultaSchema = new mongoose.Schema({
  dataHora: { type: Date },
  especialidade: { type: String },
  local: { type: String },
  status: { type: String, default: 'agendado' },
  resultado: { type: String },
  agendamentoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agendamento'
  },
  observacoes: {
    type: String,
    default: ''
  },
  ativo: { type: Boolean, default: true }
}, {
  timestamps: true
});

const medicamentoSchema = new mongoose.Schema({
  nome: { type: String },
  dosagem: { type: String },
  frequencia: { type: String },
  horarios: [String],
  inicio: { type: Date },
  fim: { type: Date },
  ativo: { type: Boolean, default: true },
  status: { type: String, default: 'ativo' }
}, {
  timestamps: true
});

// Limpa os modelos existentes antes de criar novos
mongoose.models = {};

export const Consulta = mongoose.model('Consulta', consultaSchema);
export const Medicamento = mongoose.model('Medicamento', medicamentoSchema); 