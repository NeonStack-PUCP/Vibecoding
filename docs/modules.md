# Módulos principales del sistema

## Lista de módulos

| Módulo | Responsabilidad | Se comunica con |
|---|---|---|
| Frontend | TODO | TODO |
| Backend / API | TODO | TODO |
| Base de datos | TODO | TODO |
| Servicio de IA | TODO | TODO |
| APIs externas | TODO | TODO |

## Flujo principal del sistema

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend
    participant Backend
    participant IA as Servicio de IA
    participant DB as Base de datos

    Usuario->>Frontend: Realiza una acción
    Frontend->>Backend: Envía solicitud
    Backend->>IA: Procesa información con IA
    IA-->>Backend: Devuelve resultado
    Backend->>DB: Guarda o consulta datos
    DB-->>Backend: Devuelve información
    Backend-->>Frontend: Respuesta procesada
    Frontend-->>Usuario: Muestra resultado
```

## Descripción del flujo

TODO: Describir el flujo principal del usuario dentro del sistema.