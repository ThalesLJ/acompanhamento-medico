'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DetalheConsulta() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    dataHora: '',
    especialidade: '',
    local: '',
    status: 'agendado',
    resultado: ''
  });

  useEffect(() => {
    const fetchConsulta = async (consultaId: string) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/consulta/${consultaId}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar consulta');
        }
        const data = await response.json();
        setFormData({
          ...data,
          dataHora: new Date(data.dataHora).toISOString().slice(0, 16)
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erro ao buscar consulta');
      } finally {
        setLoading(false);
      }
    };

    if (typeof params?.id === 'string') {
      fetchConsulta(params.id);
    }
  }, [params]);

  if (loading) {
    return <div className="text-center p-4 text-blue-600">Carregando...</div>;
  }

  if (!formData) {
    return <div className="text-center p-4 text-red-600">Consulta não encontrada</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/consulta/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar consulta');
      }

      router.push('/');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao atualizar consulta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta consulta?')) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/consulta/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir consulta');
      
      router.push('/');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao excluir consulta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">Editar Consulta</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data e Hora
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.dataHora}
                onChange={(e) => setFormData({...formData, dataHora: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidade
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.especialidade}
                onChange={(e) => setFormData({...formData, especialidade: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Local
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.local}
              onChange={(e) => setFormData({...formData, local: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resultado da Consulta
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]"
              value={formData.resultado}
              onChange={(e) => setFormData({...formData, resultado: e.target.value})}
              placeholder="Digite o resultado da consulta..."
            />
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={submitting}
            >
              Excluir
            </button>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 