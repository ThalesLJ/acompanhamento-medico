import { Handler } from '@netlify/functions';
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

const handler: Handler = async (event) => {
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('consultas');

    // GET /api/consultas
    if (event.httpMethod === 'GET') {
      const consultas = await collection
        .find({ ativo: { $ne: false } })
        .sort({ dataHora: 1 })
        .toArray();

      return {
        statusCode: 200,
        body: JSON.stringify(consultas)
      };
    }

    // POST /api/consultas
    if (event.httpMethod === 'POST' && event.body) {
      const data = JSON.parse(event.body);
      const novaConsulta = {
        ...data,
        dataHora: new Date(data.dataHora),
        createdAt: new Date(),
        updatedAt: new Date(),
        ativo: true
      };

      const result = await collection.insertOne(novaConsulta);

      return {
        statusCode: 201,
        body: JSON.stringify({ ...novaConsulta, _id: result.insertedId })
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