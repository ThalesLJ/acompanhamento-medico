'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ErrorMessage from '@/components/ErrorMessage';

export default function Agenda() {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('dataHora');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/consultas`);
        if (!response.ok) {
          throw new Error('Erro ao carregar consultas');
        }
        const data = await response.json();
        setConsultas(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erro ao carregar consultas');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultas();
  }, []);

  const filteredAndSortedConsultas = consultas
    .filter(consulta => 
      consulta.especialidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consulta.local?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortField) {
        case 'dataHora':
          return sortDirection === 'asc'
            ? new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()
            : new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime();
        case 'hora':
          const timeA = new Date(a.dataHora).toLocaleTimeString();
          const timeB = new Date(b.dataHora).toLocaleTimeString();
          return sortDirection === 'asc'
            ? timeA.localeCompare(timeB)
            : timeB.localeCompare(timeA);
        case 'especialidade':
          return sortDirection === 'asc'
            ? (a.especialidade || '').localeCompare(b.especialidade || '')
            : (b.especialidade || '').localeCompare(a.especialidade || '');
        case 'local':
          return sortDirection === 'asc'
            ? (a.local || '').localeCompare(b.local || '')
            : (b.local || '').localeCompare(a.local || '');
        case 'status':
          const statusA = a.resultado ? 'finalizado' : 'agendado';
          const statusB = b.resultado ? 'finalizado' : 'agendado';
          return sortDirection === 'asc'
            ? statusA.localeCompare(statusB)
            : statusB.localeCompare(statusA);
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 3);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 3);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="text-center p-4 text-blue-600">Carregando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Consultas</h1>
        <Link href="/consultas/nova">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Nova Consulta
          </button>
        </Link>
      </div>

      <ErrorMessage message={error} />

      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por especialidade ou local..."
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
            <option value="dataHora">Data</option>
            <option value="hora">Hora</option>
            <option value="especialidade">Especialidade</option>
            <option value="local">Local</option>
            <option value="status">Status</option>
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
        <div className="grid grid-cols-3 max-[500px]:grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-700">
          <div>Data</div>
          <div>Hora</div>
          <div className="hidden md:block">Especialidade</div>
          <div className="hidden md:block">Local</div>
          <div className="hidden max-[500px]:hidden min-[501px]:block">Status</div>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredAndSortedConsultas.map((consulta: any) => (
            <Link 
              href={`/consultas/${consulta._id}`}
              key={consulta._id}
              className="grid grid-cols-3 max-[500px]:grid-cols-2 md:grid-cols-5 gap-4 p-4 hover:bg-gray-50 transition-colors duration-150"
            >
              <div>{formatDate(consulta.dataHora)}</div>
              <div>{formatTime(consulta.dataHora)}</div>
              <div className="hidden md:block">{consulta.especialidade}</div>
              <div className="hidden md:block">{consulta.local}</div>
              <div className="hidden max-[500px]:hidden min-[501px]:block">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${consulta.resultado ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {consulta.resultado ? 'finalizado' : 'agendado'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}