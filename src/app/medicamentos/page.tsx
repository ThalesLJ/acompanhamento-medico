'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ErrorMessage from '@/components/ErrorMessage';

export default function Medicamentos() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nome');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const formatHorarios = (horarios: string[]) => {
    if (!horarios?.length) return '';
    if (horarios.length <= 2) return horarios.join(', ');
    return `${horarios.slice(0, 2).join(', ')}, ...`;
  };

  useEffect(() => {
    const fetchMedicamentos = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/medicamentos`);
        if (!response.ok) {
          throw new Error('Erro ao carregar medicamentos');
        }
        const data = await response.json();
        setMedicamentos(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erro ao carregar medicamentos');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicamentos();
  }, []);

  const filteredAndSortedMedicamentos = medicamentos
    .filter(medicamento => 
      medicamento.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortField) {
        case 'nome':
          return sortDirection === 'asc'
            ? (a.nome || '').localeCompare(b.nome || '')
            : (b.nome || '').localeCompare(a.nome || '');
        case 'horarios':
          const horariosA = a.horarios?.[0] || '';
          const horariosB = b.horarios?.[0] || '';
          return sortDirection === 'asc'
            ? horariosA.localeCompare(horariosB)
            : horariosB.localeCompare(horariosA);
        default:
          return 0;
      }
    });

  if (loading) {
    return <div className="text-center p-4 text-blue-600">Carregando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Medicamentos</h1>
        <Link href="/medicamentos/novo">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Novo Medicamento
          </button>
        </Link>
      </div>

      <ErrorMessage message={error} />

      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nome do medicamento..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="nome">Nome</option>
            <option value="horarios">Horário</option>
          </select>
          <button
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-700">
          <div>Nome</div>
          <div>Horários</div>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredAndSortedMedicamentos.map((medicamento: any) => (
            <Link 
              href={`/medicamentos/${medicamento._id}`}
              key={medicamento._id}
              className="grid grid-cols-2 gap-4 p-4 hover:bg-gray-50 transition-colors duration-150 text-blue-600"
            >
              <div className="truncate">{medicamento.nome}</div>
              <div className="truncate">{formatHorarios(medicamento.horarios)}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}