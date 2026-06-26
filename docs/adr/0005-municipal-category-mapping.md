# ADR 0005: Municipal category mapping for complaint classification

## Status

Accepted

## Context

Municipal complaint portals often do not provide a different endpoint for each problem type. Instead, complaints are commonly differentiated by a selected category, description, evidence, and citizen information.

For ReportaPe to generate useful complaints, it must classify citizen problems into municipal categories that match the official or observed complaint options.

## Decision

We decided to implement a municipal category mapping layer.

The app will map internal ReportaPe problem types to municipal categories.

Example internal categories:

- Basura / residuos.
- Obra / construcción.
- Ruidos molestos.
- Parque / área verde.
- Parqueo vehicular.
- Pista / vereda.
- Fiscalización municipal.
- Seguridad urbana.
- Otro problema municipal.

Example mapped categories for Santiago de Surco:

| ReportaPe category | Municipal category |
|---|---|
| Basura acumulada | ACUMULACION DE BASURA |
| Falta de recojo de basura | FALTA DEL SERVICIO DE RECOJO DE BASURA |
| Punto de acopio informal | PUNTO DE ACOPIO DE MALEZA Y/O BASURA |
| Recicladores dejando residuos | RECICLADORES DE BASURA |
| Obra irregular o sin control | CONTROL DE OBRA |
| Ruido persistente | RUIDOS MOLESTOS |
| Parque sin mantenimiento | MANTENIMIENTO DE PARQUES |
| Parqueo indebido | PARQUEO VEHICULAR |

If the confidence level is low, the user must manually confirm or select the category.

## Consequences

### Positive

- Complaints become more aligned with municipal forms.
- AI output is easier to validate.
- The system can adapt to different districts.
- Future integrations can reuse the mapping layer.

### Negative

- Each district may require its own mapping.
- Municipal categories can change over time.
- The mapping must be maintained and validated.
