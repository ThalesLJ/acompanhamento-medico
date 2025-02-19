import { Handler } from '@netlify/functions';
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  if (!event.path) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'ID não fornecido' })
    };
  }

  const id = event.path.split('/').pop();

  if (!id || !ObjectId.isValid(id)) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'ID inválido' })
    };
  }

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('medicamentos');

    // GET /api/medicamento/{id}
    if (event.httpMethod === 'GET') {
      const medicamento = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!medicamento) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Medicamento não encontrado' })
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(medicamento)
      };
    }

    // PUT /api/medicamento/{id}
    if (event.httpMethod === 'PUT' && event.body) {
      const data = JSON.parse(event.body);
      const updateData = {
        nome: data.nome,
        dosagem: data.dosagem,
        frequencia: data.frequencia,
        horarios: data.horarios || [],
        inicio: data.inicio ? new Date(data.inicio) : null,
        fim: data.fim ? new Date(data.fim) : null,
        observacoes: data.observacoes || '',
        updatedAt: new Date()
      };

      const medicamento = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!medicamento) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Medicamento não encontrado' })
        };
      }

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      const medicamentoAtualizado = { ...medicamento, ...updateData, _id: id };

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(medicamentoAtualizado)
      };
    }

    // DELETE /api/medicamentos/[id]
    if (event.httpMethod === 'DELETE') {
      const medicamento = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!medicamento) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Medicamento não encontrado' })
        };
      }

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ativo: false, updatedAt: new Date() } }
      );

      const medicamentoAtualizado = { 
        ...medicamento, 
        ativo: false, 
        updatedAt: new Date() 
      };

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(medicamentoAtualizado)
      };
    }

    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
};

export { handler }; 