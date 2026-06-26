# Arquitectura del sistema - ReportaP'

## Descripción general

ReportaP' es una plataforma cívica que permite a ciudadanos registrar denuncias o propuestas geolocalizadas, adjuntar evidencia fotográfica y convertirlas en expedientes formales mediante el cruce de datos públicos del Estado peruano y generación asistida por IA.

El sistema se organiza en módulos separados: frontend, backend/API, base de datos geoespacial, servicios de IA, almacenamiento de imágenes, procesamiento asíncrono y fuentes externas del Estado.

## Diagrama general de arquitectura

```mermaid
flowchart TD
    Usuario[Ciudadano / Vecino] --> Frontend[Frontend Web/Móvil<br/>Next.js + Tailwind + Leaflet]

    Frontend --> API[Backend API<br/>FastAPI]

    API --> Auth[Gestión de usuarios<br/>y validación de reportes]
    API --> Reportes[Módulo de reportes<br/>denuncias y propuestas]
    API --> Geo[Módulo geoespacial<br/>ubicación y zonas]
    API --> Expedientes[Módulo de expedientes<br/>generación formal]
    API --> Comunidad[Módulo comunitario<br/>firmas y apoyos]

    Reportes --> DB[(PostgreSQL + PostGIS)]
    Geo --> DB
    Expedientes --> DB
    Comunidad --> DB

    Reportes --> Fotos[Cloudinary<br/>almacenamiento de fotos]

    API --> Queue[Celery + Redis<br/>procesamiento asíncrono]

    Queue --> Estado[Fuentes de datos del Estado]
    Queue --> IA[Claude API<br/>generación y análisis]

    Estado --> INFOBRAS[INFOBRAS]
    Estado --> MEF[MEF / SIAF / INVIERTE.pe]
    Estado --> OEFA[OEFA]
    Estado --> SEACE[OECE / SEACE]
    Estado --> GeoPeru[GeoPerú / IDEPerú]
    Estado --> Otros[SIGERSOL / SUNASS / OSINERGMIN]

    IA --> Expedientes
    Expedientes --> PDF[PDF / Expediente formal]
    API --> PDF
    Frontend --> Mapa[Mapa público de reportes]
```

## Arquitectura por capas

```mermaid
flowchart TB
    subgraph Cliente
        Web[Next.js Web App]
        Map[Mapa interactivo Leaflet]
    end

    subgraph Backend
        API[FastAPI REST API]
        Services[Servicios de dominio]
        Workers[Celery Workers]
    end

    subgraph Datos
        DB[(PostgreSQL + PostGIS)]
        Redis[(Redis)]
        Storage[Cloudinary]
    end

    subgraph IA
        Claude[Claude API]
        Vision[Claude Vision]
    end

    subgraph Estado_Peruano
        INFOBRAS[INFOBRAS]
        MEF[MEF / Consulta Amigable]
        Invierte[INVIERTE.pe]
        OEFA[OEFA]
        SEACE[SEACE / OECE]
        GeoPeru[GeoPerú / IDEPerú]
    end

    Web --> API
    Map --> API

    API --> Services
    Services --> DB
    Services --> Storage
    Services --> Redis

    Redis --> Workers
    Workers --> Claude
    Workers --> Vision
    Workers --> INFOBRAS
    Workers --> MEF
    Workers --> Invierte
    Workers --> OEFA
    Workers --> SEACE
    Workers --> GeoPeru

    Workers --> DB
```

## Comunicación entre módulos

| Módulo | Responsabilidad | Se comunica con |
|---|---|---|
| Frontend | Permite registrar reportes, propuestas, fotos, ubicación y visualizar el mapa público | Backend API |
| Backend API | Expone endpoints, valida datos y coordina la lógica principal del sistema | Frontend, Base de datos, Redis, Cloudinary |
| Módulo de reportes | Gestiona denuncias y propuestas ciudadanas | Base de datos, Cloudinary, Módulo geoespacial |
| Módulo geoespacial | Procesa coordenadas y determina ubicación territorial | PostGIS, GeoPerú / IDEPerú |
| Módulo de datos del Estado | Consulta fuentes públicas según categoría y ubicación | INFOBRAS, MEF, OEFA, SEACE, GeoPerú |
| Módulo de IA | Analiza fotos, clasifica problemas y genera expedientes formales | Claude API, Claude Vision |
| Módulo comunitario | Gestiona apoyos, firmas y escalamiento colectivo | Base de datos |
| Módulo de expedientes | Genera documentos formales listos para presentar | IA, datos del Estado, PDF |
| Workers asíncronos | Ejecutan tareas pesadas sin bloquear la API | Redis, fuentes externas, IA |
| Base de datos | Persiste usuarios, reportes, propuestas, firmas, evidencias y expedientes | Backend, Workers |

## Flujo principal - Modo denuncia

```mermaid
sequenceDiagram
    actor Ciudadano
    participant Frontend
    participant API as Backend API
    participant DB as PostgreSQL + PostGIS
    participant Storage as Cloudinary
    participant Worker as Celery Worker
    participant Estado as Fuentes del Estado
    participant IA as Claude API

    Ciudadano->>Frontend: Registra denuncia con foto, ubicación y descripción
    Frontend->>API: Envía datos del reporte
    API->>Storage: Sube fotografía
    Storage-->>API: Devuelve URL de imagen
    API->>DB: Guarda reporte inicial
    API->>Worker: Encola análisis del reporte
    API-->>Frontend: Confirma registro del reporte

    Worker->>Estado: Consulta datos públicos según ubicación y categoría
    Estado-->>Worker: Devuelve información encontrada

    Worker->>IA: Envía foto, descripción y datos cruzados
    IA-->>Worker: Devuelve análisis y expediente estructurado

    Worker->>DB: Guarda resultados y expediente generado
    Frontend->>API: Consulta estado del reporte
    API->>DB: Obtiene reporte actualizado
    API-->>Frontend: Muestra expediente y estado en el mapa
```

## Flujo principal - Modo propuesta

```mermaid
sequenceDiagram
    actor Ciudadano
    participant Frontend
    participant API as Backend API
    participant DB as PostgreSQL + PostGIS
    participant Worker as Celery Worker
    participant Estado as Fuentes del Estado
    participant IA as Claude API

    Ciudadano->>Frontend: Crea propuesta geolocalizada
    Frontend->>API: Envía propuesta
    API->>DB: Guarda propuesta inicial
    API->>Worker: Encola verificación con datos públicos

    Worker->>Estado: Consulta si existe proyecto o presupuesto asociado
    Estado-->>Worker: Devuelve coincidencias encontradas

    alt Existe proyecto público sin ejecutar
        Worker->>IA: Genera sustento para convertir propuesta en denuncia
        IA-->>Worker: Devuelve expediente de denuncia
        Worker->>DB: Actualiza propuesta como denuncia escalable
    else No existe proyecto relacionado
        Worker->>IA: Genera petición formal inicial
        IA-->>Worker: Devuelve documento base
        Worker->>DB: Guarda propuesta como petición vecinal
    end

    Ciudadano->>Frontend: Otros vecinos firman o apoyan
    Frontend->>API: Registra firmas
    API->>DB: Actualiza contador de apoyo
```

## Decisiones iniciales de arquitectura

- Se usa **Next.js** para construir una interfaz rápida, compatible con despliegue en Vercel y adecuada para mapas interactivos.
- Se usa **FastAPI** como backend por su velocidad de desarrollo, documentación automática y buen soporte para servicios REST.
- Se usa **PostgreSQL + PostGIS** porque el sistema depende de coordenadas, búsquedas geográficas y relación entre reportes y zonas.
- Se usa **Celery + Redis** para ejecutar consultas externas y procesamiento con IA sin bloquear la experiencia del usuario.
- Se usa **Claude API** para generar expedientes formales y analizar la evidencia enviada por el ciudadano.
- Se usa **Cloudinary** para almacenar imágenes ciudadanas sin sobrecargar el backend.
- La arquitectura separa reportes, propuestas, expedientes, comunidad y datos externos para facilitar la evolución del sistema hacia la entrega final.
