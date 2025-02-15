import { Handler } from '@netlify/functions';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

const handler: Handler = async (event) => {
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
        body: JSON.stringify({ ...novoMedicamento, _id: result.insertedId })
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  } finally {
    await client.close();
  }
};

export { handler }; 