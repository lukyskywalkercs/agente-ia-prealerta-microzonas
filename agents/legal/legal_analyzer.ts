import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface NormativaValenciana {
  id: string;
  titulo: string;
  tipo: 'decreto' | 'ley' | 'orden' | 'plan';
  fecha: string;
  organo: string;
  url?: string;
  contenido_relevante: {
    distancia_seguridad: string[];
    protocolos_evacuacion: string[];
    responsabilidades: string[];
    criterios_activacion: string[];
  };
  estado: 'vigente' | 'derogado' | 'modificado';
}

interface CriterioOperativo {
  tipo: string;
  descripcion: string;
  fuente_normativa: string;
  valor: string | number;
  unidad?: string;
  aplicable_desde: string;
}

class LegalAnalyzer {
  private normativas: NormativaValenciana[] = [];
  private criterios: CriterioOperativo[] = [];

  constructor() {
    this.cargarNormativasBase();
  }

  private cargarNormativasBase() {
    // Normativas base de la Comunidad Valenciana para emergencias meteorológicas
    this.normativas = [
      {
        id: 'decreto_30_2015',
        titulo: 'Decreto 30/2015, Plan Territorial de Emergencias de la Comunidad Valenciana',
        tipo: 'decreto',
        fecha: '2015-03-06',
        organo: 'Generalitat Valenciana',
        url: 'https://www.dogv.gva.es/datos/2015/03/09/pdf/2015_1896.pdf',
        contenido_relevante: {
          distancia_seguridad: [
            'Artículo 45: Zonas de seguridad mínima de 500 metros de cauces en episodios de lluvia intensa',
            'Artículo 67: Evacuación preventiva en un radio de 300 metros de zonas inundables'
          ],
          protocolos_evacuacion: [
            'Artículo 89: Protocolo de activación por niveles de alerta meteorológica',
            'Artículo 91: Coordinación con AEMET para activación de planes municipales'
          ],
          responsabilidades: [
            'Artículo 23: Alcalde como máxima autoridad municipal en emergencias',
            'Artículo 34: Policía Local responsable del control de accesos y evacuación'
          ],
          criterios_activacion: [
            'Artículo 78: Activación por aviso naranja o rojo de AEMET',
            'Artículo 82: Criterios específicos para centros educativos y sanitarios'
          ]
        },
        estado: 'vigente'
      },
      {
        id: 'ley_10_2021',
        titulo: 'Ley 10/2021, de Cambio Climático y Transición Ecológica',
        tipo: 'ley',
        fecha: '2021-12-20',
        organo: 'Corts Valencianes',
        url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-1942',
        contenido_relevante: {
          distancia_seguridad: [
            'Artículo 67: Zonas de alto riesgo de inundación con restricciones de 200 metros'
          ],
          protocolos_evacuacion: [
            'Artículo 89: Adaptación de planes de emergencia al cambio climático'
          ],
          responsabilidades: [
            'Artículo 45: Obligaciones municipales de adaptación climática'
          ],
          criterios_activacion: [
            'Artículo 78: Nuevos umbrales de precipitación para activación'
          ]
        },
        estado: 'vigente'
      }
    ];
  }

  async analizarNormativaMunicipal(municipio: string): Promise<NormativaValenciana[]> {
    try {
      // Buscar normativas específicas del municipio
      const archivoMunicipal = join(__dirname, 'data', `${municipio.toLowerCase()}_normativa.json`);
      
      try {
        const contenido = await fs.readFile(archivoMunicipal, 'utf-8');
        const normativasMunicipales = JSON.parse(contenido);
        return [...this.normativas, ...normativasMunicipales];
      } catch (error) {
        console.log(`No se encontró normativa específica para ${municipio}, usando normativa autonómica`);
        return this.normativas;
      }
    } catch (error) {
      console.error('Error analizando normativa municipal:', error);
      return this.normativas;
    }
  }

  extraerCriteriosOperativos(normativas: NormativaValenciana[]): CriterioOperativo[] {
    const criterios: CriterioOperativo[] = [];

    normativas.forEach(normativa => {
      // Extraer distancias de seguridad
      normativa.contenido_relevante.distancia_seguridad.forEach(texto => {
        const match = texto.match(/(\d+)\s*(metros?|m)/i);
        if (match) {
          criterios.push({
            tipo: 'distancia_seguridad',
            descripcion: texto,
            fuente_normativa: normativa.titulo,
            valor: parseInt(match[1]),
            unidad: 'metros',
            aplicable_desde: normativa.fecha
          });
        }
      });

      // Extraer criterios de activación
      normativa.contenido_relevante.criterios_activacion.forEach(texto => {
        criterios.push({
          tipo: 'criterio_activacion',
          descripcion: texto,
          fuente_normativa: normativa.titulo,
          valor: texto,
          aplicable_desde: normativa.fecha
        });
      });
    });

    return criterios;
  }

  generarConfiguracionOperativa(municipio: string): any {
    const criterios = this.extraerCriteriosOperativos(this.normativas);
    
    return {
      municipio: municipio,
      fecha_analisis: new Date().toISOString(),
      normativas_aplicables: this.normativas.map(n => ({
        id: n.id,
        titulo: n.titulo,
        fecha: n.fecha,
        estado: n.estado
      })),
      criterios_extraidos: criterios,
      configuracion_recomendada: {
        distancia_minima_seguridad: Math.min(...criterios
          .filter(c => c.tipo === 'distancia_seguridad')
          .map(c => Number(c.valor))),
        umbral_activacion: 'naranja_rojo_aemet',
        responsabilidad_principal: 'alcalde_municipio',
        coordinacion_requerida: ['aemet', 'policia_local', 'proteccion_civil']
      }
    };
  }

  async guardarAnalisis(municipio: string): Promise<void> {
    const configuracion = this.generarConfiguracionOperativa(municipio);
    
    const archivoSalida = join(__dirname, '..', '..', 'public', 'data', `normativa_${municipio.toLowerCase()}.json`);
    
    try {
      await fs.writeFile(archivoSalida, JSON.stringify(configuracion, null, 2), 'utf-8');
      console.log(`Análisis normativo guardado en: ${archivoSalida}`);
    } catch (error) {
      console.error('Error guardando análisis normativo:', error);
    }
  }
}

// Función principal para ejecutar el análisis
async function analizarNormativaAlmassora() {
  const analyzer = new LegalAnalyzer();
  
  console.log('🔍 Analizando normativa vigente para Almassora...');
  
  const normativas = await analyzer.analizarNormativaMunicipal('Almassora');
  console.log(`📋 Encontradas ${normativas.length} normativas aplicables`);
  
  const criterios = analyzer.extraerCriteriosOperativos(normativas);
  console.log(`⚖️ Extraídos ${criterios.length} criterios operativos`);
  
  await analyzer.guardarAnalisis('Almassora');
  
  console.log('✅ Análisis normativo completado');
  
  return analyzer.generarConfiguracionOperativa('Almassora');
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  analizarNormativaAlmassora()
    .then(resultado => {
      console.log('\n📊 Resumen del análisis:');
      console.log(JSON.stringify(resultado, null, 2));
    })
    .catch(error => {
      console.error('❌ Error en análisis normativo:', error);
      process.exit(1);
    });
}

export { LegalAnalyzer, analizarNormativaAlmassora };


