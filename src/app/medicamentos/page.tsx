'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ErrorMessage from '@/components/ErrorMessage';

export default function Medicamentos() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

      <div className="overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-700">
          <div>Nome</div>
          <div>Dosagem</div>
          <div>Frequência</div>
          <div>Horários</div>
          <div>Status</div>
        </div>
        <div className="divide-y divide-gray-200">
          {medicamentos.map((medicamento: any) => (
            <Link 
              href={`/medicamentos/${medicamento._id}`}
              key={medicamento._id}
              className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50 transition-colors duration-150 text-blue-600"
            >
              <div>{medicamento.nome}</div>
              <div>{medicamento.dosagem}</div>
              <div>{medicamento.frequencia}</div>
              <div>{medicamento.horarios?.join(', ')}</div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${medicamento.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {medicamento.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}