# Modelo de datos

## Entidades principales

| Entidad | Descripción | Campos principales |
|---|---|---|
| Usuario | TODO | id, nombre, email |
| EntidadPrincipal | TODO | id, descripcion, estado |
| ResultadoIA | TODO | id, resultado, fecha_creacion |

## Diagrama entidad-relación inicial

```mermaid
erDiagram
    USUARIO {
        string id
        string nombre
        string email
    }

    ENTIDAD_PRINCIPAL {
        string id
        string descripcion
        string estado
    }

    RESULTADO_IA {
        string id
        string resultado
        datetime fecha_creacion
    }

    USUARIO ||--o{ ENTIDAD_PRINCIPAL : crea
    ENTIDAD_PRINCIPAL ||--o{ RESULTADO_IA : genera
```

## Notas del modelo

TODO: Explicar decisiones iniciales del modelo de datos.