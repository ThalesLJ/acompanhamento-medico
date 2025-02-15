import { Handler } from '@netlify/functions';
import { MongoClient } from 'mongodb';

let cachedDb: any = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    cachedDb = { client, db };
    return cachedDb;
  } catch (error) {
    console.error('Erro ao conectar com MongoDB:', error);
    throw error;
  }
}

const handler: Handler = async (event) => {
  try {
    const { client, db } = await connectToDatabase();
    
    // GET /api/consultas
    if (event.httpMethod === 'GET') {
      const consultas = await db
        .collection('consultas')
        .find({ ativo: { $ne: false } })
        .sort({ dataHora: 1 })
        .toArray();

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
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

      const result = await db
        .collection('consultas')
        .insertOne(novaConsulta);

      return {
        statusCode: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      })
    };
  }
};

export { handler };