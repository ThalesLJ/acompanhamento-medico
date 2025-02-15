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

const handler: Handler = async (event) => {
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
    const collection = db.collection('consultas');

    // GET /api/consultas/[id]
    if (event.httpMethod === 'GET') {
      const consulta = await collection.findOne({ 
        _id: new ObjectId(id)
      });

      if (!consulta) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Consulta não encontrada' })
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(consulta)
      };
    }

    // PUT /api/consultas/[id]
    if (event.httpMethod === 'PUT' && event.body) {
      const data = JSON.parse(event.body);
      
      const consulta = await collection.findOne({ 
        _id: new ObjectId(id) 
      });

      if (!consulta) {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Consulta não encontrada' })
        };
      }

      // Remove o _id do objeto antes do update
      const { _id, ...updateData } = data;

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updateData,
            dataHora: new Date(data.dataHora),
            ativo: true,
            updatedAt: new Date()
          }
        }
      );

      if (result.modifiedCount === 0) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Nenhuma alteração realizada' })
        };
      }

      const updatedConsulta = await collection.findOne({ 
        _id: new ObjectId(id) 
      });

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(updatedConsulta)
      };
    }

    // DELETE /api/consultas/[id]
    if (event.httpMethod === 'DELETE') {
      return collection
        .findOne({ _id: new ObjectId(id) })
        .then(consulta => {
          if (!consulta) {
            return {
              statusCode: 404,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify({ error: 'Consulta não encontrada' })
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
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify(result.value)
            }));
        })
        .catch(error => ({
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            error: 'Erro interno do servidor',
            details: error.message 
          })
        }));
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