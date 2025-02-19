import { Handler } from '@netlify/functions';
import { MongoClient, ObjectId } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  
  if (!cachedClient) {
    cachedClient = client;
  }

  await client.connect();
  const db = client.db();
  
  if (!cachedDb) {
    cachedDb = db;
  }

  return { client, db };
}

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
      body: JSON.stringify({ error: 'ID não fornecido' })
    };
  }

  const id = event.path.split('/').pop();

  if (!id || !ObjectId.isValid(id)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'ID inválido' })
    };
  }

  try {
    const { db } = await connectToDatabase();
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
        ...data,
        inicio: data.inicio ? new Date(data.inicio) : null,
        fim: data.fim ? new Date(data.fim) : null,
        observacoes: data.observacoes || '',
        updatedAt: new Date()
      };

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Medicamento não encontrado' })
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ ...updateData, _id: id })
      };
    }

    // DELETE /api/medicamentos/[id]
    if (event.httpMethod === 'DELETE') {
      return collection
        .findOne({ _id: new ObjectId(id) })
        .then(medicamento => {
          if (!medicamento) {
            return {
              statusCode: 404,
              headers: corsHeaders,
              body: JSON.stringify({ error: 'Medicamento não encontrado' })
            };
          }

          return collection
            .findOneAndUpdate(
              { _id: new ObjectId(id) },
              { $set: { ativo: false, updatedAt: new Date() } },
              { returnDocument: 'after' }
            )
            .then(result => ({
              statusCode: 200,
              headers: corsHeaders,
              body: JSON.stringify(result.value)
            }));
        })
        .catch(error => ({
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ 
            error: 'Erro interno do servidor',
            details: error.message 
          })
        }));
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
    await cachedClient?.close();
  }
};

export { handler }; 