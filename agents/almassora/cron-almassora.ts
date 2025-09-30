import * as cron from 'node-cron';
import { MicrozonificadorAlmassora } from './microzonificador';

/**
 * Cron job para ejecutar el análisis microzonificado de Almassora cada 60 minutos
 */
class CronAlmassora {
  private microzonificador: MicrozonificadorAlmassora;
  private task: cron.ScheduledTask | null = null;

  constructor() {
    this.microzonificador = new MicrozonificadorAlmassora();
  }

  /**
   * Inicia el cron job
   */
  public iniciar(): void {
    console.log('🚀 Iniciando cron job de análisis microzonificado para Almassora...');
    
    // Ejecutar inmediatamente al inicio
    this.ejecutarAnalisis();

    // Programar ejecución cada 60 minutos
    this.task = cron.schedule('0 * * * *', () => {
      console.log('⏰ Ejecutando análisis microzonificado programado...');
      this.ejecutarAnalisis();
    }, {
      scheduled: true,
      timezone: "Europe/Madrid"
    });

    console.log('✅ Cron job programado: cada 60 minutos (0 * * * *)');
  }

  /**
   * Detiene el cron job
   */
  public detener(): void {
    if (this.task) {
      this.task.destroy();
      this.task = null;
      console.log('🛑 Cron job de Almassora detenido');
    }
  }

  /**
   * Ejecuta el análisis microzonificado
   */
  private async ejecutarAnalisis(): Promise<void> {
    try {
      console.log('🔍 [ALMASSORA] Iniciando análisis microzonificado...');
      await this.microzonificador.procesarAvisos();
      console.log('✅ [ALMASSORA] Análisis completado exitosamente');
    } catch (error) {
      console.error('❌ [ALMASSORA] Error en análisis microzonificado:', error);
    }
  }

  /**
   * Ejecuta el análisis una sola vez (para testing)
   */
  public async ejecutarUnaVez(): Promise<void> {
    console.log('🔍 [ALMASSORA] Ejecutando análisis una sola vez...');
    await this.ejecutarAnalisis();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const cronAlmassora = new CronAlmassora();
  
  // Verificar argumentos de línea de comandos
  const args = process.argv.slice(2);
  
  if (args.includes('--once')) {
    // Ejecutar una sola vez
    cronAlmassora.ejecutarUnaVez()
      .then(() => {
        console.log('🏁 Análisis microzonificado completado');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
      });
  } else {
    // Ejecutar en modo cron
    cronAlmassora.iniciar();
    
    // Manejar señales de terminación
    process.on('SIGINT', () => {
      console.log('\n🛑 Recibida señal SIGINT, deteniendo cron job...');
      cronAlmassora.detener();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Recibida señal SIGTERM, deteniendo cron job...');
      cronAlmassora.detener();
      process.exit(0);
    });

    console.log('🔄 Cron job de Almassora ejecutándose. Presiona Ctrl+C para detener.');
  }
}

export { CronAlmassora };
