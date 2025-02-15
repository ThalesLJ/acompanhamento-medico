import { Handler } from '@netlify/functions';
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

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
    await client.connect();
    const db = client.db();
    const collection = db.collection('medicamentos');

    // GET /api/medicamentos/[id]
    if (event.httpMethod === 'GET') {
      const medicamento = await collection.findOne({ 
        _id: new ObjectId(id),
        ativo: { $ne: false }
      });

      if (!medicamento) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Medicamento não encontrado' })
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(medicamento)
      };
    }

    // PUT /api/medicamentos/[id]
    if (event.httpMethod === 'PUT' && event.body) {
      const data = JSON.parse(event.body);
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...data,
            inicio: data.inicio ? new Date(data.inicio) : null,
            fim: data.fim ? new Date(data.fim) : null,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      if (!result.value) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Medicamento não encontrado' })
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(result.value)
      };
    }

    // DELETE /api/medicamentos/[id]
    if (event.httpMethod === 'DELETE') {
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ativo: false, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );

      if (!result.value) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Medicamento não encontrado' })
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(result.value)
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