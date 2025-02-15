'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ErrorMessage from '@/components/ErrorMessage';

export default function Agenda() {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        // Em desenvolvimento usa porta 8888, em produção usa /.netlify/functions/
        const baseUrl = process.env.NEXT_PUBLIC_NETLIFY_DEV 
          ? 'http://localhost:8888/api'
          : '/.netlify/functions';
        
        const response = await fetch(`${baseUrl}/consultas`);
        if (!response.ok) {
          throw new Error('Erro ao carregar consultas');
        }
        const data = await response.json();
        setConsultas(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultas();
  }, []);

  if (loading) {
    return <div className="text-center p-4 text-blue-600">Carregando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Agenda de Consultas</h1>
        <Link href="/consultas/nova">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Nova Consulta
          </button>
        </Link>
      </div>

      <ErrorMessage message={error} />

      <div className="overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-700">
          <div>Data</div>
          <div>Hora</div>
          <div>Especialidade</div>
          <div>Local</div>
          <div>Status</div>
        </div>
        <div className="divide-y divide-gray-200">
          {consultas.map((consulta: any) => (
            <Link 
              href={`/consultas/${consulta._id}`} 
              key={consulta._id}
              className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50 transition-colors duration-150"
            >
              <div>{new Date(consulta.dataHora).toLocaleDateString()}</div>
              <div>{new Date(consulta.dataHora).toLocaleTimeString()}</div>
              <div>{consulta.especialidade}</div>
              <div>{consulta.local}</div>
              <div>
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