# Modelo de Evaluación de Riesgo Meteorológico (Agente IA AEMET)

## Fuente de datos
Todos los datos meteorológicos son obtenidos de la API oficial de AEMET:  
https://opendata.aemet.es/

## Objetivo del modelo
Interpretar el impacto potencial de cada aviso por subzona, mediante:

- Puntuación base por nivel oficial
- Bonificaciones por tipo de fenómeno
- Ajustes por probabilidad declarada
- Bonus por inmediatez temporal

## Tabla de severidad base

| Nivel AEMET | Interpretación | Score Base |
|-------------|----------------|------------|
| Verde       | NORMAL         | 30         |
| Amarillo    | MEDIA          | 55         |
| Naranja/Rojo| CRÍTICA        | 80         |

## Bonus por tipo de fenómeno

| Tipo                 | RegEx usado                     | Bonus |
|----------------------|----------------------------------|--------|
| Tormentas            | /tormenta|thunder/              | +10    |
| Lluvias              | /lluvia|chubasco|precipit/       | +8     |
| Costeros             | /coster|oleaje|mar/              | +7     |
| Viento               | /viento|rachas/                  | +6     |
| Nieve                | /nieve|nevadas/                  | +6     |
| Calima / Polvo       | /calima|polvo/                   | +3     |

## Factor de probabilidad

| Probabilidad (media) | Factor IA aplicado |
|----------------------|---------------------|
| ≥ 80%                | ×1.00               |
| 60–79%               | ×0.90               |
| 40–59%               | ×0.80               |
| 20–39%               | ×0.70               |
| No definida          | ×0.85 (por defecto) |

## Bonus temporal

| Situación temporal     | Bonus |
|------------------------|--------|
| Inminente (<6h)        | +5     |
| Lejano (>24h)          | -5     |
| Caducado (fin < ahora) | -10    |

## Ejemplo de resultado

> Zona: Litoral de Barcelona  
> Aviso dominante: Lluvias (amarillo)  
> Score final: 58.5  
> Explicación:  
> - Severidad: MEDIA → base 55  
> - Fenómeno (Lluvias): +8  
> - Probabilidad: ×0.85  
> - Temporalidad: +5

## Nota
Este sistema **no sustituye la autoridad oficial de AEMET**. Solo sirve como **asistente de priorización para emergencias** a nivel institucional o local.

