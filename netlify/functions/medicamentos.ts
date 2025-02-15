import { Handler } from '@netlify/functions';
import { MongoClient } from 'mongodb';

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

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('medicamentos');

    // GET /api/medicamentos
    if (event.httpMethod === 'GET') {
      const medicamentos = await collection
        .find({ ativo: { $ne: false } })
        .sort({ createdAt: -1 })
        .toArray();

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(medicamentos)
      };
    }

    // POST /api/medicamentos
    if (event.httpMethod === 'POST' && event.body) {
      const data = JSON.parse(event.body);
      const novoMedicamento = {
        ...data,
        inicio: data.inicio ? new Date(data.inicio) : null,
        fim: data.fim ? new Date(data.fim) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ativo: true
      };

      const result = await collection.insertOne(novoMedicamento);

      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({ ...novoMedicamento, _id: result.insertedId })
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
  } finally {
    await client.close();
  }
};

export { handler }; 