# ReportaPe

**ReportaPe** es una plataforma cívica móvil y web que ayuda a los vecinos a convertir problemas urbanos reales en quejas formales, geolocalizadas y respaldadas con evidencia.

La app permite que un ciudadano reporte un problema desde su celular usando audio, ubicación, fotos y datos básicos. Luego, la inteligencia artificial estructura la información, identifica la categoría municipal más adecuada, detecta datos faltantes, genera una vista previa formal de la queja y guía al usuario hacia el canal oficial correspondiente.

ReportaPe no busca reemplazar a las municipalidades ni prometer envíos automáticos sin validación. Su objetivo es actuar como puente entre el vecino y la entidad responsable, facilitando la creación, presentación, seguimiento y apoyo comunitario de quejas vecinales.

---

## Problemática

En el Perú, muchos vecinos enfrentan problemas cotidianos en sus distritos:

- Basura acumulada.
- Falta de recojo de residuos.
- Pistas con huecos.
- Veredas rotas.
- Obras que ocupan la vía pública.
- Ruidos molestos.
- Parques sin mantenimiento.
- Vehículos bloqueando cocheras o veredas.
- Falta de fiscalización municipal.
- Zonas inseguras o descuidadas.

Aunque estos problemas afectan directamente la calidad de vida de los ciudadanos, el proceso para reclamar suele ser confuso.

El vecino muchas veces no sabe:

- A qué entidad reclamar.
- Qué canal oficial usar.
- Qué datos debe presentar.
- Cómo redactar una queja formal.
- Qué evidencia adjuntar.
- Cómo hacer seguimiento.
- Cómo sumar apoyo de otros vecinos.

En la práctica, muchas quejas terminan en redes sociales, llamadas sin seguimiento o formularios incompletos. Esto reduce la posibilidad de obtener una respuesta institucional.

---

## Solución

ReportaPe propone una experiencia simple y guiada:

```text
Vecino detecta un problema
→ abre ReportaPe
→ selecciona el tipo de queja
→ graba un audio o escribe el detalle
→ adjunta evidencia
→ la IA estructura la información
→ se genera una queja formal
→ se guía al canal municipal correcto
→ se guarda el código de seguimiento
→ el caso aparece en el mapa
→ otros vecinos pueden apoyar
```

La propuesta central es:

> **ReportaPe convierte quejas vecinales en reportes formales, geolocalizados y respaldados con evidencia, usando inteligencia artificial para completar los datos necesarios y guiar al ciudadano hacia el canal municipal correcto.**

---

## Funcionalidades principales

### 1. Registro de quejas vecinales

El usuario puede reportar distintos tipos de problemas urbanos:

| Categoría | Ejemplos |
|---|---|
| Basura / residuos | Acumulación de basura, falta de recojo, puntos de acopio informal |
| Obra / construcción | Obra irregular, bloqueo de vereda, excavaciones, falta de señalización |
| Ruidos molestos | Locales, viviendas, eventos, maquinaria o vehículos |
| Parque / área verde | Falta de mantenimiento, juegos dañados, áreas verdes secas |
| Parqueo vehicular | Bloqueo de cochera, vehículos sobre vereda, zona rígida |
| Pista / vereda | Huecos, pistas hundidas, veredas rotas, sardineles dañados |
| Fiscalización municipal | Negocios sin licencia, uso indebido de espacio público |
| Inseguridad urbana | Zonas oscuras, falta de patrullaje, puntos de riesgo |
| Otro problema municipal | Casos que no encajan en una categoría específica |

---

### 2. Registro mediante audio

El usuario puede grabar un audio explicando el problema con sus propias palabras.

La app solicita que mencione:

- Ubicación exacta.
- Referencia visible.
- Desde cuándo ocurre.
- Frecuencia.
- Impacto.
- Responsable si se conoce.
- Acción que solicita.

Luego, la app simula la transcripción del audio y permite editar el texto antes de continuar.

---

### 3. Análisis con IA

La inteligencia artificial analiza la transcripción o descripción escrita y extrae los datos relevantes del caso.

Ejemplo de datos extraídos:

```ts
{
  direccionExacta: string;
  referencia: string;
  tipoProblema: string;
  detalleEspecifico: string;
  desdeCuando: string;
  frecuencia: string;
  impacto: string;
  responsableConocido?: string;
  accionSolicitada: string;
  categoriaMunicipalSugerida: string;
  confianza: number;
}
```

La app muestra:

- Categoría detectada.
- Categoría municipal sugerida.
- Nivel de confianza.
- Datos completos.
- Datos faltantes.

---

### 4. Detección de datos faltantes

ReportaPe no obliga al usuario a llenar todo desde cero.

Si el audio ya contiene dirección, referencia e impacto, la app solo pide lo que falta.

Ejemplo:

```text
Tu reporte ya tiene:
✓ Dirección
✓ Referencia
✓ Impacto

Falta completar:
- DNI o Código de Contribuyente
- Foto de evidencia
- Acción solicitada
```

---

### 5. Evidencia fotográfica o documental

El usuario puede tomar una foto desde el celular o adjuntar un archivo.

La evidencia sirve para respaldar el reclamo y hacer más claro el caso ante la municipalidad.

Reglas usadas en el prototipo:

- Formatos permitidos: JPG, TIFF, DOC, PDF, GIF.
- Tamaño máximo: 5 MB.
- En móvil se prioriza foto en JPG.
- Si hay varias fotos, se puede simular la generación de un PDF de evidencias.

---

### 6. Generación de queja formal

Con los datos extraídos, ReportaPe genera un texto formal listo para copiar, descargar o usar como base en el portal municipal.

Plantilla base:

```text
Solicito la atención por [problema/categoría] ubicado en [dirección exacta], referencia [referencia].
El hecho se observa desde [tiempo aproximado] y ocurre con frecuencia [frecuencia].
Se ha identificado [detalle específico del problema].
Esta situación genera [impacto observado].
[Responsable si se conoce].
Solicito [acción solicitada].
Adjunto evidencia fotográfica/documental.
```

---

### 7. Envío asistido al canal oficial

ReportaPe guía al usuario hacia el canal municipal correspondiente.

La app no debe afirmar que envía automáticamente una queja si el portal oficial exige validaciones como CAPTCHA, sesión o confirmación ciudadana.

En esos casos, la app debe:

- Preparar la queja.
- Mostrar los campos listos para copiar.
- Permitir descargar el expediente.
- Abrir el portal oficial.
- Explicar que el usuario debe completar CAPTCHA o confirmar el registro.
- Guardar el código de expediente cuando el ciudadano lo obtenga.

Mensaje clave:

```text
El portal oficial de la municipalidad puede requerir CAPTCHA y confirmación del ciudadano.
ReportaPe prepara tu queja y te guía para completar el registro oficial de forma segura.
```

---

### 8. Seguimiento de quejas

Después de registrar una queja, el usuario puede guardar:

- Código de expediente.
- Fecha de registro.
- Canal usado.
- Estado inicial.
- Link de seguimiento.
- Distrito.
- Categoría.

La app permite consultar o simular el seguimiento mediante:

- Código de expediente.
- DNI.
- Código de Contribuyente.
- Número de documento.

---

### 9. Mapa ciudadano

Los reportes se publican en un mapa para que otros vecinos puedan ver problemas cercanos.

Cada reporte muestra:

- Tipo de problema.
- Distrito.
- Foto.
- Estado.
- Código de seguimiento.
- Apoyos vecinales.
- Canal oficial usado.
- Ubicación aproximada.

---

### 10. Apoyo vecinal y escalamiento

Otros vecinos pueden apoyar un reporte si reconocen el mismo problema.

Cuando un reporte alcanza un umbral de apoyo, la app puede marcarlo como una solicitud colectiva.

Ejemplo:

```text
Este caso ya tiene 15 apoyos vecinales.
Puede escalarse como solicitud colectiva ante la entidad responsable.
```

---

## Flujo principal del usuario

```text
1. Seleccionar tipo de problema
2. Grabar audio o escribir descripción
3. Transcribir y analizar con IA
4. Detectar categoría municipal
5. Completar datos faltantes
6. Adjuntar evidencia
7. Revisar queja generada
8. Abrir canal oficial o continuar con registro asistido
9. Guardar código de seguimiento
10. Publicar reporte en el mapa
11. Recibir apoyo de vecinos
```

---

## Flujo municipal mapeado: Santiago de Surco

Para el flujo de quejas en Santiago de Surco, ReportaPe trabaja con la lógica del portal de Atención al Vecino.

El portal no maneja un endpoint diferente por cada tipo de problema. Las quejas se diferencian por:

- Categoría municipal seleccionada.
- Mensaje de la queja.
- Evidencia adjunta.
- DNI o Código de Contribuyente.
- CAPTCHA.
- Campos dinámicos del formulario oficial.

### Categorías municipales mapeadas

#### Basura / residuos

| Caso | Categoría municipal |
|---|---|
| Basura acumulada en vía pública | `ACUMULACION DE BASURA` |
| Falta de recojo de basura | `FALTA DEL SERVICIO DE RECOJO DE BASURA` |
| Punto informal de maleza o basura | `PUNTO DE ACOPIO DE MALEZA Y/O BASURA` |
| Recicladores dejando residuos | `RECICLADORES DE BASURA` |

#### Obra / construcción

| Caso | Categoría municipal |
|---|---|
| Obra irregular, bloqueo, excavación o falta de control | `CONTROL DE OBRA` |
| Consulta relacionada a conformidad de obra | `CONFORMIDAD DE OBRA` |

#### Ruido

| Caso | Categoría municipal |
|---|---|
| Ruido persistente de local, vivienda, evento o maquinaria | `RUIDOS MOLESTOS` |
| Ruido por compactación | `RUIDO POR COMPACTAR` |

#### Parque / área verde

| Caso | Categoría municipal |
|---|---|
| Mantenimiento deficiente de parque o área verde | `MANTENIMIENTO DE PARQUES` |

#### Parqueo vehicular

| Caso | Categoría municipal |
|---|---|
| Bloqueo de cochera, vehículo sobre vereda o zona rígida | `PARQUEO VEHICULAR` |

---

## Otros distritos considerados

ReportaPe está diseñado para adaptarse por distrito, ya que cada municipalidad puede tener canales y formularios diferentes.

### San Miguel

Para casos como pista con hueco o vereda dañada, el canal principal identificado es la Mesa de Partes Virtual de la Municipalidad Distrital de San Miguel.

La app debe preparar el expediente y guiar al usuario a presentarlo en el canal correspondiente.

### Cercado de Lima / Lima Metropolitana

Para casos en Cercado de Lima o vías metropolitanas, el canal corresponde a la Municipalidad Metropolitana de Lima.

La app debe diferenciar si el caso pertenece a una vía local, una vía metropolitana o una competencia distrital.

---

## Estados del reporte

```ts
type ReportStatus =
  | "draft"
  | "recording_audio"
  | "transcribing"
  | "analyzing"
  | "missing_data"
  | "ready_for_review"
  | "awaiting_official_submission"
  | "submitted"
  | "tracking_available"
  | "published"
  | "resolved"
  | "error";
```

| Estado | Significado |
|---|---|
| `draft` | El usuario inició el reporte |
| `recording_audio` | Se está grabando audio |
| `transcribing` | Se está generando la transcripción |
| `analyzing` | La IA está analizando el caso |
| `missing_data` | Falta información obligatoria |
| `ready_for_review` | La queja está lista para revisar |
| `awaiting_official_submission` | Falta completar el canal oficial |
| `submitted` | La queja fue registrada o simulada |
| `tracking_available` | Hay código de seguimiento |
| `published` | El reporte aparece en el mapa |
| `resolved` | El caso fue marcado como resuelto |
| `error` | Ocurrió un error controlado |

---

## Modelo de datos base

```ts
type CivicReportDraft = {
  id: string;

  problemType:
    | "basura"
    | "obra"
    | "ruido"
    | "parque"
    | "parqueo"
    | "pista"
    | "fiscalizacion"
    | "seguridad"
    | "otro";

  district: string;
  address?: string;
  reference?: string;
  latitude?: number;
  longitude?: number;

  transcript?: string;
  description?: string;

  aiExtraction?: {
    direccionExacta?: string;
    referencia?: string;
    tipoProblema?: string;
    detalleEspecifico?: string;
    desdeCuando?: string;
    frecuencia?: string;
    impacto?: string;
    responsableConocido?: string;
    accionSolicitada?: string;
  };

  municipalCategory?: string;
  confidence?: number;
  missingFields: string[];

  citizenDocumentType?: "DNI" | "CODIGO_CONTRIBUYENTE";
  citizenDocumentNumber?: string;
  citizenName?: string;
  email?: string;
  phone?: string;

  evidenceFiles: EvidenceFile[];
  generatedMessage?: string;

  officialEntity?: string;
  officialChannel?: string;
  officialPortalUrl?: string;

  trackingCode?: string;
  trackingUrl?: string;

  supportCount: number;
  status: ReportStatus;

  createdAt: string;
  updatedAt: string;
};
```

---

## Rutas principales del prototipo

| Ruta | Descripción |
|---|---|
| `/` | Mapa principal con reportes ciudadanos |
| `/report/new` | Flujo guiado para crear una queja |
| `/report/[id]` | Detalle de un reporte |
| `/tracking` | Consulta y seguimiento de quejas |
| `/proposal/new` | Registro simple de propuesta vecinal secundaria |
| `/proposal/[id]` | Detalle de propuesta vecinal |

---

## Componentes principales

```text
Navbar
MapView
MiniMap
ReportCard
CategoryCard
AudioRecorder
TranscriptEditor
AIAnalysisPanel
MissingFieldsForm
CitizenIdentificationForm
EvidenceUploader
ComplaintPreviewCard
OfficialSubmissionCard
TrackingCard
SupportButton
StepIndicator
LoadingState
ErrorState
EmptyState
Badge
FilterBar
ReportSidebar
```

---

## Servicios simulados del frontend

```text
audioTranscriptionService
aiComplaintService
municipalCategoryMapper
evidenceService
complaintPreviewService
officialSubmissionSimulator
trackingService
reportPublicationService
supportService
```

---

## Reglas importantes del MVP

- Toda la interfaz debe estar en español.
- El prototipo debe ser mobile-first y responsive.
- No se implementa backend real en esta versión.
- No se realiza envío real a municipalidades.
- No se resuelve CAPTCHA automáticamente.
- No se crean integraciones reales con portales municipales.
- La app debe simular el flujo completo con datos mockeados.
- La app debe ser transparente cuando un paso depende del portal oficial.
- El foco principal son quejas vecinales, no propuestas.
- Las propuestas quedan como funcionalidad secundaria.
- La experiencia debe sentirse formal, confiable y lista para producción.

---

## Diseño visual

ReportaPe utiliza una identidad visual cívica, moderna y confiable.

### Colores

| Token | Color |
|---|---|
| Primary | `#DC2626` |
| Secondary | `#1E40AF` |
| Success | `#16A34A` |
| Warning | `#D97706` |
| Danger | `#DC2626` |
| Neutral | `#64748B` |
| Background | `#F8FAFC` |
| Surface | `#FFFFFF` |
| Text | `#1E293B` |

### Tipografía

Fuente principal: `Inter`

| Elemento | Tamaño |
|---|---|
| H1 | 32px bold |
| H2 | 24px bold |
| H3 | 18px semibold |
| Body | 16px regular |
| Small | 14px regular |
| Caption | 12px medium |

---

## Stack tecnológico

> Este stack puede ajustarse según la implementación final del equipo.

| Capa | Tecnología |
|---|---|
| Frontend web | React / Next.js |
| Frontend móvil | React Native / Expo |
| Estilos | Tailwind CSS |
| Mapas | Leaflet / Map provider |
| IA | Servicio de IA para transcripción, análisis y generación de texto |
| Evidencia | Almacenamiento de archivos en una etapa posterior |
| Backend | Pendiente para integración real |
| Base de datos | Pendiente para persistencia real |
| Integraciones municipales | Pendiente para versión productiva |

---

## Instalación local

### Requisitos

- Node.js 18+
- npm, pnpm o yarn

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Si el proyecto usa Expo:

```bash
cd mobile
npm install
npx expo start
```

---

## Variables de entorno sugeridas

En el MVP frontend-only, las integraciones pueden permanecer simuladas.

```env
NEXT_PUBLIC_APP_NAME=ReportaPe
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_ENABLE_MOCKS=true
```

Para una versión posterior con servicios reales:

```env
AI_API_KEY=
DATABASE_URL=
STORAGE_PROVIDER_URL=
MAPS_API_KEY=
```

---

## Integrantes

| Nombre | Rol |
|---|---|
| Marsi Figueroa | |
| Oscar Soto | |
| Colleen Rodriguez | |

---

## Documentación adicional

- Diseño en Figma:
- Diagrama de arquitectura:
- Documento de presentación:
- Video demo:
- Prompt de maquetación:
- Flujos municipales mapeados:
