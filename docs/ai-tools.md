# Uso de herramientas de IA - ReportaP'

## Descripción general

ReportaP' utilizará herramientas de IA tanto durante el desarrollo del proyecto como dentro de la funcionalidad principal del sistema.

La IA se usará para apoyar el diseño, documentación, generación de código, análisis de evidencia ciudadana y generación de expedientes formales.

## Herramientas de IA utilizadas en el desarrollo

| Herramienta / Modelo | Uso dentro del proyecto |
|---|---|
| ChatGPT | Apoyo en arquitectura, documentación, diagramas Mermaid, estructura del repositorio y planificación técnica |
| GitHub Copilot | Apoyo en generación y autocompletado de código |
| Claude | Apoyo en análisis de requerimientos, redacción técnica y generación de contenido estructurado |
| Cursor / Windsurf | Apoyo en edición asistida de código dentro del entorno de desarrollo |

## Uso de IA dentro del producto

| Funcionalidad | Uso de IA |
|---|---|
| Clasificación de reportes | Identificar la categoría del problema ciudadano según descripción e imagen |
| Análisis de evidencia | Interpretar fotografías adjuntas al reporte |
| Cruce de información | Relacionar el reporte con datos públicos del Estado peruano |
| Generación de expediente | Redactar un documento formal con evidencia, sustento y entidad responsable |
| Conversión de propuestas | Convertir propuestas ciudadanas en peticiones o denuncias si existen datos públicos relacionados |

## Modelos considerados

| Modelo / Servicio | Uso propuesto |
|---|---|
| Claude API | Generación de expedientes formales y análisis contextual |
| Claude Vision | Análisis de imágenes enviadas como evidencia |
| Modelos LLM auxiliares | Apoyo en redacción, clasificación y resumen de datos públicos |

## Prompts relevantes

### Prompt para análisis de denuncia

```text
Analiza la siguiente denuncia ciudadana considerando descripción, ubicación, categoría y evidencia fotográfica. Identifica el problema principal, la entidad pública responsable, el nivel de urgencia y genera un resumen formal para expediente.
```

### Prompt para generación de expediente

```text
Genera un expediente formal ciudadano a partir de la denuncia, evidencia adjunta y datos públicos encontrados. El documento debe incluir resumen del caso, ubicación, hechos observados, fuentes consultadas, entidad responsable y solicitud concreta.
```

### Prompt para análisis de propuesta

```text
Evalúa la siguiente propuesta vecinal y determina si puede convertirse en una petición formal o denuncia sustentada. Considera si existen proyectos públicos, presupuesto asignado o antecedentes relacionados en fuentes estatales.
```

## Criterios de uso responsable

- La IA no reemplaza la validación ciudadana ni institucional.
- Los resultados generados por IA deben mostrarse como apoyo o borrador formal.
- Las fuentes públicas consultadas deben quedar registradas para trazabilidad.
- Los datos sensibles no deben exponerse innecesariamente.
- La generación de expedientes debe evitar afirmaciones no sustentadas por evidencia o fuentes verificables.
- El sistema debe permitir revisión humana antes de presentar un expediente formal ante una entidad.

## Limitaciones iniciales

- La calidad del expediente depende de la evidencia enviada por el ciudadano.
- Algunas fuentes públicas pueden no contar con APIs disponibles o datos estructurados.
- La IA puede requerir validación manual para evitar errores de interpretación.
- En el MVP, algunas consultas a fuentes externas podrían simularse o integrarse parcialmente.
