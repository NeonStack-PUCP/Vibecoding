# ReportaPe

Plataforma cívica móvil y web que transforma denuncias y propuestas ciudadanas en evidencia estructurada usando datos reales del Estado peruano. El ciudadano reporta un problema con foto y ubicación; la app cruza automáticamente con INFOBRAS, MEF, OEFA y GeoPerú, genera un expediente formal listo para presentar, y lo publica en un mapa donde los vecinos pueden unirse y escalar la denuncia colectivamente.

---

## Problemática que resuelve

### El ciudadano peruano está solo frente al Estado

Cuando un vecino ve una obra abandonada, basura acumulada que lleva semanas sin recogerse, o una calle rota hace meses, hoy tiene básicamente tres opciones:

1. **Quejarse en redes sociales** — genera ruido pero ningún impacto institucional real.
2. **Llamar a la municipalidad** — lo ponen en espera, le dicen que "van a revisar", y nadie le da seguimiento.
3. **Ir presencialmente** — pierde medio día de trabajo y muchas veces ni sabe a qué ventanilla ir, qué documentos llevar, o si el problema es competencia de la municipalidad, del ministerio, o de la Contraloría.

El problema de fondo **no es que el Estado no tenga datos**. Los tiene. INFOBRAS (Contraloría) sabe exactamente qué obras públicas están registradas en cada coordenada del país. El MEF sabe qué presupuesto tiene asignado cada entidad y cuánto ha ejecutado. OEFA tiene registros de fiscalización ambiental por zona. GeoPerú sabe qué entidad es territorialmente responsable de cada punto del mapa.

**El problema es que esos datos nunca llegan al ciudadano en el momento en que los necesita.**

El resultado concreto es este:

- El vecino no sabe si la obra abandonada frente a su casa tiene presupuesto asignado o si simplemente nadie la contrató.
- No sabe si la responsable es la municipalidad distrital, la provincial, o un ministerio.
- No sabe qué documento presentar, ante quién, ni en qué plazo legal debe responderle.
- Su queja llega sin evidencia, sin respaldo técnico, y se archiva sin respuesta.
- Sus vecinos tienen el mismo problema pero cada uno actúa por separado, sin masa crítica para obligar una respuesta institucional.

### El problema de las propuestas vecinales

Del otro lado está el ciudadano que no solo quiere quejarse, sino proponer: quiere una ciclovía en su avenida, un parque en el terreno abandonado de la esquina, mejor alumbrado en la zona peligrosa. Hoy no tiene un canal real para hacerlo:

- **Change.org** no tiene datos del Estado, no es geolocalizado, y no genera ninguna obligación legal.
- **Las municipalidades** no tienen plataformas de participación ciudadana funcionales.
- **Las firmas en papel** se pierden o se entregan sin seguimiento.
- **Nadie puede saber** si ya existe un proyecto aprobado para eso que propone, o si hay presupuesto asignado que simplemente no se está ejecutando.

### El resultado

Miles de ciudadanos con problemas reales, datos públicos que respaldarían sus denuncias, y ningún puente entre ambos. Las denuncias mueren en el vacío. Las propuestas no llegan a ningún lado. El Estado gasta en obras que nadie fiscaliza y en proyectos que nadie reclama.

---

## Solución que proponemos

### ReportaPe: dos modos, una plataforma

**ReportaPe** es una plataforma web/móvil con dos modos de participación ciudadana:

**MODO DENUNCIA:** Transforma un reporte ciudadano en un expediente con evidencia estructurada, cruzando con datos reales del Estado para identificar al responsable y generar el documento formal listo para presentar.

**MODO PROPUESTA:** Permite a vecinos crear propuestas geolocalizadas, sumar firmas digitales de otros vecinos, y convertirlas en peticiones formales cuando alcanzan masa crítica.

---

### Cómo funciona el sistema — Modo Denuncia

#### Paso 1: El ciudadano reporta (30 segundos)

Desde el celular o la web, el ciudadano:
- Sube una foto del problema
- Activa su GPS (o marca el punto en el mapa)
- Escribe una descripción breve
- Elige la categoría del problema

No necesita saber nada más. La app hace el resto.

#### Paso 2: La app cruza con datos del Estado

Según la categoría elegida y las coordenadas GPS, el sistema consulta automáticamente las fuentes del Estado que corresponden:

```
Coordenadas del reporte
        │
        ▼
┌─ INFOBRAS (Contraloría) ──────── ¿Hay una obra pública registrada en esa zona?
├─ MEF / Consulta Amigable ─────── ¿Tiene presupuesto asignado? ¿Cuánto se ha ejecutado?
├─ INVIERTE.pe (MEF) ───────────── ¿Existe un proyecto de inversión pública para esa zona?
├─ OECE / SEACE ────────────────── ¿Hay un contratista asignado? ¿Cuál es?
├─ OEFA ────────────────────────── ¿Hay antecedentes de fiscalización ambiental en la zona?
└─ GeoPerú / IDEPerú ───────────── ¿Qué entidad es la responsable territorial?
```

Este cruce ocurre en segundos y de forma automática. El ciudadano no tiene que saber nada sobre estas fuentes.

#### Paso 3: La IA genera el expediente

Claude API analiza la foto, la descripción del ciudadano y todos los datos cruzados del Estado, y genera automáticamente un expediente estructurado:

```
╔══════════════════════════════════════════════════════════╗
║          REPORTE CIUDADANO #2847 — 26/06/2026           ║
╠══════════════════════════════════════════════════════════╣
║  Problema reportado : Obra pública paralizada            ║
║  Ubicación          : Jr. Los Pinos 342, SJL, Lima       ║
║  Fecha y hora       : 26/06/2026 — 10:34 AM              ║
║  Foto adjunta       : ✓ (con metadatos GPS verificados)  ║
╠══════════════════════════════════════════════════════════╣
║  DATOS DEL ESTADO CRUZADOS                              ║
║                                                          ║
║  ✓ Obra registrada en INFOBRAS (Código: 12394)          ║
║  ✓ Presupuesto asignado: S/. 480,000                    ║
║  ✓ Avance físico declarado por la entidad: 60%          ║
║  ✗ Sin movimiento registrado en los últimos 94 días     ║
║  ✓ Entidad responsable: Municipalidad de SJL            ║
║  ✓ Contratista asignado: Constructora XYZ SAC            ║
║  ✓ Contrato SEACE: N° 0034-2024-MDSJL                   ║
╠══════════════════════════════════════════════════════════╣
║  ACCIÓN SUGERIDA                                        ║
║                                                          ║
║  → Solicitud de información bajo Ley N° 27806           ║
║  → Denuncia ante la Contraloría General                 ║
║  → Canal: contraloría.gob.pe / participaciudadana       ║
╠══════════════════════════════════════════════════════════╣
║       [Descargar PDF]     [Enviar al canal oficial]      ║
╚══════════════════════════════════════════════════════════╝
```

El ciudadano recibe un PDF listo para presentar: con su foto, la fecha, su ubicación verificada, y los datos del Estado que respaldan su denuncia. Ya no necesita buscar nada. La app lo hizo por él.

#### Paso 4: El reporte aparece en el mapa

El reporte se publica en un mapa público donde todos los vecinos de la zona pueden verlo. Desde el mapa, cualquier vecino puede:
- Apoyar el reporte ("yo también lo veo")
- Agregar sus propias fotos como evidencia adicional
- Unirse a la denuncia con su nombre y DNI

#### Paso 5: La presión escala sola

Cuando el reporte acumula **15 o más vecinos**, el sistema genera automáticamente una solicitud colectiva formal y la dirige a la entidad responsable identificada. La entidad queda obligada por ley a responder en 30 días (Ley N° 27806 de Transparencia y Acceso a la Información Pública). El estado de la respuesta se muestra en el mapa — visible para todos.

---

### Cómo funciona el sistema — Modo Propuesta

#### Paso 1: El ciudadano crea la propuesta

Marca un punto en el mapa, describe qué quiere que exista ahí (una ciclovía, un parque, alumbrado, un punto de reciclaje, una rampa para discapacitados) y sube una imagen referencial si tiene.

#### Paso 2: La app cruza con datos del Estado

El sistema verifica automáticamente:
- ¿Ya existe un proyecto registrado en INVIERTE.pe para esa zona?
- ¿Tiene presupuesto asignado pero sin ejecutar?
- ¿La municipalidad ya licitó algo similar en otra zona?

Si ya existe un proyecto → **la propuesta se convierte automáticamente en una denuncia** de por qué no se está ejecutando lo que el Estado ya aprobó y presupuestó.

Si no existe → se crea como petición nueva con respaldo de vecinos.

#### Paso 3: Los vecinos firman

La propuesta aparece en el mapa. Los vecinos de la zona la ven, pueden firmarla digitalmente, agregar comentarios, o proponer variaciones.

#### Paso 4: Escala a petición formal

Al alcanzar el umbral de firmas, el sistema genera un documento formal con todas las firmas, el sustento técnico y el canal correcto de presentación ante la municipalidad o entidad correspondiente.

---

## Ejemplos concretos de uso

### Ejemplo 1 — Obra abandonada (Nivel 1: datos ricos)

> *"La obra de la pista de Jr. Tupac Amaru lleva 4 meses sin avanzar. Los obreros no aparecen y la calle está bloqueada."*

La app detecta en INFOBRAS que hay una obra registrada a 30 metros de las coordenadas. Cruza con MEF y encuentra que tiene S/. 320,000 asignados con solo 20% ejecutado. Identifica a la Municipalidad Provincial como responsable y al contratista en SEACE. Genera el expediente con todos esos datos y sugiere denuncia a la Contraloría.

### Ejemplo 2 — Contaminación por humo (Nivel 2: cruce básico)

> *"Todos los días la fábrica de la esquina bota humo negro desde las 6am. Huele horrible y los niños están con tos."*

La app consulta OEFA y encuentra que esa dirección tiene 2 fiscalizaciones previas por emisiones. Identifica que la responsable es OEFA para la sanción y la municipalidad para la licencia de funcionamiento. Genera el reporte con los antecedentes de OEFA y los canales de denuncia correspondientes.

### Ejemplo 3 — Basura acumulada (Nivel 2)

> *"Llevan 3 semanas sin recoger la basura en mi cuadra. Ya hay ratas."*

La app identifica que el servicio de limpieza pública es competencia de la Municipalidad Distrital de X. Genera el reporte formal dirigido a la Gerencia de Servicios Públicos con la base legal que obliga al recojo (Ley de Gestión Integral de Residuos Sólidos) y el canal de denuncia en INDECOPI si la municipalidad no responde.

### Ejemplo 4 — Pista rota (Nivel 3: solo reporte ciudadano)

> *"El hueco de la pista lleva 6 meses ahí. Ya chocaron 3 motos."*

Aunque no hay un cruce de datos tan rico como en obras formales, la app genera el reporte con foto + GPS + fecha, identifica a la municipalidad como responsable de vías locales, y genera la solicitud formal con el canal correcto.

### Ejemplo 5 — Propuesta de ciclovía

> *"La Av. Los Álamos tiene mucho tráfico y muchos vecinos vamos en bici. Necesitamos ciclovía."*

La app cruza con INVIERTE.pe y encuentra que hay un proyecto de ciclovía para esa avenida aprobado en 2022 con S/. 800,000 asignados pero sin ejecutar. La propuesta se convierte automáticamente en una denuncia: el presupuesto existe pero nadie lo está ejecutando. 40 vecinos se unen en 3 días y la solicitud formal llega a la municipalidad con respaldo legal.

### Ejemplo 6 — Propuesta de parque

> *"El terreno baldío de la Calle Unión lleva años abandonado. Los vecinos queremos que sea un parque."*

No hay proyecto registrado. La app crea la propuesta, la publica en el mapa, y cuando llega a 50 firmas genera una solicitud formal al municipio bajo la Ley de Participación Ciudadana y Ley Orgánica de Municipalidades que les obliga a responder las iniciativas vecinales.

---

## Categorías de reporte disponibles

| Categoría | Fuentes del Estado que se cruzan | Entidad responsable identificada |
|-----------|----------------------------------|----------------------------------|
| Obra pública paralizada | INFOBRAS + MEF/SIAF + OECE | Municipalidad / Ministerio + Contratista |
| Proyecto sin ejecutar | INVIERTE.pe + MEF | Entidad ejecutora |
| Contaminación / humo / ruido | OEFA | OEFA + Municipalidad (licencia) |
| Basura / botadero ilegal | SIGERSOL + MINAM | Municipalidad distrital |
| Agua sin servicio | SUNASS | EPS de la zona (SEDAPAL u otra) |
| Alumbrado roto | OSINERGMIN | Municipalidad + distribuidora eléctrica |
| Pista / vereda rota | GeoPerú | Municipalidad distrital |
| Parque descuidado | GeoPerú | Municipalidad distrital |
| Inseguridad / delincuencia | GeoPerú | PNP + Serenazgo municipal |
| Construcción ilegal | GeoPerú | Municipalidad (licencias) |

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend web | Next.js 14, Tailwind CSS, Leaflet.js |
| Frontend móvil | React Native (Expo) |
| Backend | FastAPI (Python), PostgreSQL + PostGIS |
| Tareas asíncronas | Celery + Redis |
| Datos del Estado | requests + BeautifulSoup (scraping), OEFA API REST, GeoPerú WMS/WFS |
| IA | Claude API (Anthropic) — claude-sonnet-4-6 |
| Almacenamiento fotos | Cloudinary |
| Despliegue | Vercel (frontend), Railway (backend) |

---

## Instrucciones para correr el proyecto localmente

### Requisitos previos
- Python 3.11+
- Node.js 18+
- PostgreSQL con extensión PostGIS
- Redis

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # completar variables de entorno
python scripts/load_infobras.py   # carga datos iniciales del Estado
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Variables de entorno necesarias

```env
ANTHROPIC_API_KEY=
DATABASE_URL=postgresql://usuario:password@localhost:5432/vecinoactivo
CLOUDINARY_URL=
REDIS_URL=redis://localhost:6379
```

---

## Modelos y herramientas de IA utilizados

| Herramienta | Uso específico |
|-------------|----------------|
| **Claude claude-sonnet-4-6** (Anthropic) | Genera el expediente formal redactado en lenguaje ciudadano y legal a partir de la descripción del reporte y los datos cruzados del Estado |
| **Claude Vision** (Anthropic) | Analiza la foto subida para clasificar automáticamente el tipo de problema y validar que la imagen es coherente con la categoría reportada |

---

## Fuentes de datos del Estado utilizadas

| Fuente | Entidad | Qué aporta al sistema |
|--------|---------|----------------------|
| INFOBRAS | Contraloría General de la República | Obras públicas registradas con coordenadas, avance físico y financiero |
| Consulta Amigable | MEF / SIAF | Ejecución presupuestal real vs. asignada por entidad y proyecto |
| INVIERTE.pe | MEF | Banco de proyectos de inversión pública aprobados |
| OECE / SEACE | OECE | Contratos públicos, montos y contratistas asignados |
| Open Data API | OEFA | Fiscalizaciones ambientales y antecedentes por zona |
| IDEPerú / GeoPerú | PCM | Delimitación territorial para identificar entidad responsable |
| SIGERSOL | MINAM | Gestión de residuos sólidos por municipio |
| SUNASS | SUNASS | Indicadores de calidad del servicio de agua por zona |
| OSINERGMIN | OSINERGMIN | Distribuidoras eléctricas y cobertura por zona |

---

## Integrantes

| Nombre | Rol |
|--------|-----|
| Marsi Figueroa | |
| Oscar Soto | |
| Colleen Rodriguez | |

---

## Documentación adicional

- Diseño en Figma:
- Diagrama de arquitectura:
- Documento de presentación:
- Video demo:
