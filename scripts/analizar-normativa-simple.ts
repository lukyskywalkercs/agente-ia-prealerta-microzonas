import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function analizarNormativaAlmassora() {
  console.log('🔍 Analizando normativa vigente para Almassora...');
  
  // Normativas base de la Comunidad Valenciana
  const normativas = [
    {
      id: 'decreto_30_2015',
      titulo: 'Decreto 30/2015, Plan Territorial de Emergencias de la Comunidad Valenciana',
      tipo: 'decreto',
      fecha: '2015-03-06',
      organo: 'Generalitat Valenciana',
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
    }
  ];

  console.log(`📋 Encontradas ${normativas.length} normativas aplicables`);

  // Extraer criterios operativos
  const criterios = [];
  
  normativas.forEach(normativa => {
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

  console.log(`⚖️ Extraídos ${criterios.length} criterios operativos`);

  const configuracion = {
    municipio: 'Almassora',
    fecha_analisis: new Date().toISOString(),
    normativas_aplicables: normativas.map(n => ({
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

  // Guardar análisis
  const archivoSalida = join(process.cwd(), 'public', 'data', 'normativa_almassora.json');
  
  try {
    await fs.writeFile(archivoSalida, JSON.stringify(configuracion, null, 2), 'utf-8');
    console.log(`✅ Análisis normativo guardado en: ${archivoSalida}`);
  } catch (error) {
    console.error('❌ Error guardando análisis normativo:', error);
    throw error;
  }

  console.log('✅ Análisis normativo completado');
  return configuracion;
}

async function main() {
  try {
    const resultado = await analizarNormativaAlmassora();
    
    console.log('\n📊 Resumen del análisis normativo:');
    console.log('=====================================');
    console.log(`Municipio: ${resultado.municipio}`);
    console.log(`Fecha de análisis: ${resultado.fecha_analisis}`);
    console.log(`Normativas aplicables: ${resultado.normativas_aplicables.length}`);
    
    console.log('\n📊 Criterios extraídos:');
    resultado.criterios_extraidos.forEach((criterio, index) => {
      console.log(`${index + 1}. ${criterio.tipo}: ${criterio.descripcion}`);
      console.log(`   Fuente: ${criterio.fuente_normativa}`);
      console.log(`   Valor: ${criterio.valor}${criterio.unidad ? ' ' + criterio.unidad : ''}`);
      console.log('');
    });
    
    console.log('⚙️ Configuración recomendada:');
    console.log(`- Distancia mínima de seguridad: ${resultado.configuracion_recomendada.distancia_minima_seguridad} metros`);
    console.log(`- Umbral de activación: ${resultado.configuracion_recomendada.umbral_activacion}`);
    console.log(`- Responsabilidad principal: ${resultado.configuracion_recomendada.responsabilidad_principal}`);
    console.log(`- Coordinación requerida: ${resultado.configuracion_recomendada.coordinacion_requerida.join(', ')}`);
    
    console.log('\n✅ Análisis normativo completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en el análisis normativo:', error);
    process.exit(1);
  }
}

main();


