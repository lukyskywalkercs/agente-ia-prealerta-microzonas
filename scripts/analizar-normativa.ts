#!/usr/bin/env tsx

import { analizarNormativaAlmassora } from '../agents/legal/legal_analyzer';

async function main() {
  console.log('⚖️ Iniciando análisis normativo para Almassora...');
  
  try {
    const resultado = await analizarNormativaAlmassora();
    
    console.log('\n📋 Resumen del análisis normativo:');
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

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}


