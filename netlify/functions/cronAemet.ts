import { Handler } from '@netlify/functions';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const handler: Handler = async () => {
  try {
    await execAsync('npx tsx backend/cron-aemet.ts');
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'cron-aemet.ts ejecutado correctamente',
        triggered_at: new Date().toISOString(),
      }),
    };
  } catch (err: any) {
    const errorMsg = err.message || 'Error desconocido al ejecutar el cron';
    logFailure(errorMsg);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: errorMsg,
        triggered_at: new Date().toISOString(),
      }),
    };
  }
};

export { handler };

function execAsync(cmd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: path.resolve(__dirname, '../..') }, (error, stdout, stderr) => {
      if (stderr) console.error(stderr);
      if (stdout) console.log(stdout);
      if (error) return reject(error);
      resolve();
    });
  });
}

function logFailure(message: string) {
  const fallbackPath = path.resolve('public', 'data', 'agent_ui.json');
  fs.writeFileSync(fallbackPath, JSON.stringify({
    error: true,
    message,
    last_updated: new Date().toISOString(),
  }, null, 2), 'utf8');
}
