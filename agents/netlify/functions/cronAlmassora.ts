// netlify/functions/cronAlmassora.ts
import { Handler } from '@netlify/functions';
import { runMicrozonificador } from '../../agents/almassora/microzonificador';

const handler: Handler = async () => {
  try {
    await runMicrozonificador();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Microzonificador ejecutado correctamente' }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: (err as Error).message }),
    };
  }
};

export { handler };
