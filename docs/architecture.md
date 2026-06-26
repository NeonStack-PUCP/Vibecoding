# Arquitectura del sistema - ReportaPe

## Descripción general

ReportaPe es una plataforma cívica móvil y web que permite a ciudadanos peruanos registrar denuncias o propuestas geolocalizadas, adjuntar evidencia fotográfica y convertirlas en expedientes formales mediante el cruce de datos públicos del Estado peruano y generación asistida por IA.

El sistema se organiza en módulos separados: **app móvil** (React Native/Expo), **frontend web** (Next.js), **backend/API** (FastAPI), **base de datos geoespacial** (PostgreSQL + PostGIS), **servicios de IA** (Claude API), **almacenamiento** (Cloudinary), **procesamiento asíncrono** (Celery + Redis) y **fuentes externas del Estado peruano**.

## Diagrama general de arquitectura

```mermaid
flowchart TD
    Ciudadano[Ciudadano / Vecino]

    Ciudadano --> Mobile[App Móvil<br/>React Native / Expo]
    Ciudadano --> Web[Frontend Web<br/>Next.js 14 + Tailwind]

    Mobile --> API[Backend API<br/>FastAPI + Python]
    Web --> API

    subgraph Seguridad
        API --> RateLimit[Rate Limiter<br/>10 req/min POST]
        API --> Validation[Pydantic Validation<br/>+ lat/lng bounds check]
    end

    API --> Reportes[Módulo de reportes<br/>denuncias y propuestas]
    API --> Geo[Módulo geoespacial<br/>PostGIS queries]
    API --> Expedientes[Módulo de expedientes<br/>generación formal]
    API --> Comunidad[Módulo comunitario<br/>apoyos colectivos]

    Reportes --> DB[(PostgreSQL + PostGIS<br/>GIST index coords)]
    Geo --> DB
    Expedientes --> DB
    Comunidad --> DB

    Reportes --> Fotos[Cloudinary<br/>fotos + PDFs]

    API --> Cache[(Redis<br/>TTL 24h)]
    Cache --> Queue[Celery Workers<br/>tareas asíncronas]

    Queue --> Estado[Fuentes del Estado]
    Queue --> IA[Claude API<br/>claude-sonnet-4-6]

    Estado --> INFOBRAS[INFOBRAS<br/>Contraloría]
    Estado --> MEF[MEF / SIAF<br/>Consulta Amigable]
    Estado --> INVIERTE[INVIERTE.pe<br/>proyectos inversión]
    Estado --> OEFA[OEFA<br/>API pública]
    Estado --> SEACE[OECE / SEACE<br/>contratos CSV]
    Estado --> GeoPeru[GeoPerú / IDEPerú<br/>WMS/WFS]

    IA --> Expedientes
    Expedientes --> PDF[PDF Expediente formal<br/>Cloudinary]
```

## Arquitectura por capas

```mermaid
flowchart TB
    subgraph Clientes
        Mobile[App Móvil<br/>React Native/Expo<br/>Expo Router v3]
        Web[Web App<br/>Next.js 14<br/>App Router]
    end

    subgraph Backend
        direction TB
        Routers[Routers FastAPI<br/>HTTP + validación]
        Services[Services<br/>lógica de negocio]
        Repos[Repositories<br/>acceso a datos]
        Scrapers[Scrapers<br/>fuentes del Estado]
        Workers[Celery Workers<br/>tareas asíncronas]
    end

    subgraph Infraestructura
        DB[(PostgreSQL + PostGIS)]
        Redis[(Redis cache)]
        Storage[Cloudinary]
    end

    subgraph IA_Anthropic
        Claude[claude-sonnet-4-6<br/>expedientes]
        Vision[Claude Vision<br/>análisis de foto]
    end

    subgraph Estado_Peruano
        INFOBRAS[INFOBRAS]
        MEF[MEF/SIAF]
        OEFA[OEFA API]
        SEACE[SEACE CSV]
        GeoPeru[GeoPerú WFS]
    end

    Mobile --> Routers
    Web --> Routers
    Routers --> Services
    Services --> Repos
    Services --> Workers
    Repos --> DB
    Services --> Storage
    Services --> Redis

    Workers --> Scrapers
    Workers --> Claude
    Workers --> Vision
    Scrapers --> INFOBRAS
    Scrapers --> MEF
    Scrapers --> OEFA
    Scrapers --> SEACE
    Scrapers --> GeoPeru
    Workers --> DB
```

## Arquitectura móvil (React Native / Expo)

```mermaid
flowchart TD
    subgraph Pantallas
        MapTab[Mapa<br/>react-native-maps]
        ListTab[Reportes<br/>FlatList filterable]
        ProfileTab[Perfil<br/>mis reportes + stats]
        NewReport[Nuevo Reporte<br/>form 5 pasos]
        NewProposal[Nueva Propuesta<br/>form 4 pasos]
        Detail[Detalle<br/>expediente + apoyo]
    end

    subgraph Estado_Global
        Zustand[Zustand store]
        ReactQuery[React Query<br/>server cache 2min]
    end

    subgraph Permisos_Nativos
        Camera[expo-camera<br/>foto evidencia]
        Location[expo-location<br/>GPS automático]
        ImagePicker[expo-image-picker<br/>galería]
    end

    subgraph API_Client
        Axios[Axios + interceptors<br/>BASE_URL en Constants]
    end

    MapTab --> ReactQuery
    ListTab --> ReactQuery
    NewReport --> Camera
    NewReport --> Location
    NewReport --> ImagePicker
    NewReport --> Axios
    NewProposal --> Camera
    NewProposal --> Location
    Detail --> ReactQuery
    ReactQuery --> Axios
    Axios --> BackendAPI[Backend FastAPI]
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

## Modelo de datos (ER simplificado)

```mermaid
erDiagram
    REPORT {
        uuid id PK
        varchar type "denuncia | propuesta"
        varchar category "obra | basura | agua | ..."
        varchar status "pending | processing | active | resolved | closed"
        text title
        text description
        float latitude
        float longitude
        varchar address
        varchar photo_url
        varchar expediente_url
        varchar responsible_entity
        varchar responsible_channel
        int support_count
        bool collective_request_sent
        timestamp created_at
        timestamp updated_at
    }

    STATE_DATA_CACHE {
        uuid id PK
        uuid report_id FK
        jsonb infobras_result
        jsonb mef_result
        jsonb oefa_result
        jsonb geo_result
        timestamp cached_at
        timestamp expires_at
    }

    SUPPORT {
        uuid id PK
        uuid report_id FK
        varchar citizen_name
        varchar citizen_ip_hash
        timestamp created_at
    }

    REPORT ||--o{ SUPPORT : "tiene"
    REPORT ||--o| STATE_DATA_CACHE : "tiene"
```

## Capa de caché y resiliencia

```mermaid
flowchart LR
    Request[Solicitud<br/>GET /state-data/query] --> CheckCache{¿En Redis?}
    CheckCache -- HIT --> ReturnCache[Retornar datos cacheados<br/>TTL 24h]
    CheckCache -- MISS --> Workers[Celery Worker]

    Workers --> Try1[Intento 1<br/>fuente del Estado]
    Try1 -- Falla --> Delay1[1s delay]
    Delay1 --> Try2[Intento 2]
    Try2 -- Falla --> Delay2[3s delay]
    Delay2 --> Try3[Intento 3]
    Try3 -- Falla --> Graceful[Degradación elegante<br/>reporte se crea igual]
    Try1 -- OK --> SaveCache[Guardar en Redis<br/>TTL 24h]
    Try2 -- OK --> SaveCache
    Try3 -- OK --> SaveCache
    SaveCache --> ReturnData[Retornar datos]
```

## Diagrama de despliegue

```mermaid
flowchart LR
    subgraph Dispositivo_Usuario
        ExpoApp[Expo APK<br/>Android / iOS]
        Browser[Navegador<br/>Chrome / Safari]
    end

    subgraph AWS_CloudFront["AWS — CloudFront + S3"]
        NextJS[Next.js 14<br/>App Router<br/>Static Export]
    end

    subgraph AWS_EC2["AWS — EC2 t3.small (Docker)"]
        FastAPI[FastAPI<br/>Python 3.11<br/>uvicorn]
        Celery[Celery Worker<br/>procesamiento async]
        RedisDB[(Redis<br/>cache + broker)]
    end

    subgraph AWS_RDS["AWS — RDS PostgreSQL"]
        Postgres[(PostgreSQL 16<br/>+ PostGIS)]
    end

    subgraph AWS_S3["AWS — S3"]
        Media[Fotos JPG<br/>Expedientes TXT]
    end

    ExpoApp --> FastAPI
    Browser --> NextJS
    NextJS --> FastAPI
    FastAPI --> Postgres
    FastAPI --> RedisDB
    FastAPI --> Media
    Celery --> RedisDB
    Celery --> Postgres
    Celery --> Media
    Celery --> OpenAI[OpenAI API<br/>gpt-4o-mini]
    Celery --> EstadoPeruano[Fuentes del Estado<br/>INFOBRAS / MEF / OEFA]
```

> **Nota de despliegue:** Se usa AWS por créditos de equipo disponibles. El backend corre en un EC2 con `docker-compose` (FastAPI + Celery + Redis en contenedores). La BD corre en RDS para durabilidad. Las fotos y expedientes se guardan en S3. El frontend se exporta como sitio estático a S3 y se sirve via CloudFront.

## Decisiones de arquitectura

| Decisión | Opción elegida | Alternativa descartada | Razón |
|----------|---------------|----------------------|-------|
| App móvil | React Native / Expo | Flutter | Reutiliza conocimiento JS del equipo, Expo simplifica permisos y builds |
| Frontend web | Next.js 14 App Router | Vite + React SPA | SSR para SEO; export estático compatible con S3 + CloudFront (AWS) |
| Backend | FastAPI (Python) | Node.js Express | Mejor ecosistema para scraping y data science; documentación automática |
| Base de datos | PostgreSQL + PostGIS | MongoDB | Consultas geoespaciales nativas (ST_DWithin); ACID para datos cívicos |
| Cache + broker | Redis | RabbitMQ + Memcached | Un solo servicio para caché Y broker de Celery |
| Workers | Celery | FastAPI Background Tasks | Reintentos, monitoreo y escalado independiente del API |
| IA | OpenAI gpt-4o-mini | Claude Sonnet | Créditos disponibles del equipo; costo ~$0.001/expediente |
| Storage | AWS S3 | Cloudinary | Integrado con el resto de infra AWS; créditos disponibles |
| Routing móvil | Expo Router v3 | React Navigation | File-based routing = más claro para el equipo; tipado automático |
