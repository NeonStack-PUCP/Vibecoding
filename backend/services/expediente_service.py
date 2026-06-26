import logging
from datetime import datetime
from openai import OpenAI
from config import settings

logger = logging.getLogger(__name__)

EXPEDIENTE_PROMPT = """Eres un asistente legal cívico experto en derecho administrativo peruano.
Genera un EXPEDIENTE CIUDADANO formal y profesional en español peruano basándote en los datos proporcionados.

El expediente debe seguir esta estructura:

---
EXPEDIENTE CIUDADANO #{report_id_short}
Fecha: {date}

DATOS DEL REPORTE
Tipo: {report_type}
Categoría: {category}
Dirección: {address}
Coordenadas: {latitude}, {longitude}

DESCRIPCIÓN DEL PROBLEMA
{description}

DATOS DEL ESTADO VERIFICADOS
{state_data_summary}

ENTIDAD RESPONSABLE
{responsible_entity}

FUNDAMENTO LEGAL
[Incluye las normas aplicables: Ley N° 27806 (Transparencia), Ley N° 27972 (Ley Orgánica de Municipalidades),
y cualquier norma específica según la categoría del problema]

PETICIÓN FORMAL
[Redacta la petición formal específica, incluyendo:
1. Qué se solicita concretamente
2. Plazo solicitado para respuesta (máximo 30 días hábiles según Ley 27806)
3. Canal de presentación sugerido]

OBSERVACIONES Y RECOMENDACIONES
[Incluye observaciones sobre el estado de la situación y recomendaciones de seguimiento]

---
Documento generado mediante ReportaPe — Plataforma Cívica Digital
"""


def _format_state_data(state_data: dict | None) -> str:
    if not state_data:
        return "No se obtuvo información de fuentes del Estado."

    lines = []
    infobras = state_data.get("infobras")
    if infobras and infobras.get("found"):
        lines.append(f"✓ INFOBRAS: Obra registrada código {infobras.get('code')}")
        if infobras.get("days_without_movement"):
            lines.append(f"  → Sin movimiento por {infobras['days_without_movement']} días")
        if infobras.get("budget"):
            lines.append(f"  → Presupuesto: S/. {infobras['budget']:,.0f}")
        if infobras.get("contractor"):
            lines.append(f"  → Contratista: {infobras['contractor']}")

    mef = state_data.get("mef")
    if mef and mef.get("found"):
        lines.append("✓ MEF/SIAF: Partida presupuestal identificada")
        if mef.get("assigned"):
            lines.append(f"  → Asignado: S/. {mef['assigned']:,.0f}")
        if mef.get("execution_pct") is not None:
            lines.append(f"  → Ejecución: {mef['execution_pct']}%")

    oefa = state_data.get("oefa")
    if oefa and oefa.get("found"):
        lines.append(f"✓ OEFA: {oefa.get('previous_inspections')} fiscalización(es) previa(s)")

    geo = state_data.get("geo")
    if geo and geo.get("found"):
        lines.append(f"✓ GeoPerú: Jurisdicción {geo.get('district')}, {geo.get('province')}")

    if not lines:
        return "Consultas realizadas a INFOBRAS, MEF y OEFA sin coincidencias en la zona."

    return "\n".join(lines)


def generate_expediente(
    report_id: str,
    report_type: str,
    category: str,
    address: str,
    latitude: float,
    longitude: float,
    description: str,
    photo_url: str,
    state_data: dict | None,
    responsible_entity: str | None,
) -> str:
    if not settings.openai_api_key:
        logger.warning("OPENAI_API_KEY not set — using fallback expediente")
        return _generate_fallback_expediente(
            report_id, report_type, category, address, description, state_data, responsible_entity
        )

    state_summary = _format_state_data(state_data)
    report_type_label = "DENUNCIA CIUDADANA" if report_type == "denuncia" else "PROPUESTA CIUDADANA"

    prompt = EXPEDIENTE_PROMPT.format(
        report_id_short=str(report_id)[:8].upper(),
        date=datetime.now().strftime("%d de %B de %Y"),
        report_type=report_type_label,
        category=category.upper(),
        address=address,
        latitude=latitude,
        longitude=longitude,
        description=description,
        state_data_summary=state_summary,
        responsible_entity=responsible_entity or "Por determinar según jurisdicción",
    )

    client = OpenAI(api_key=settings.openai_api_key)

    logger.info("Generating expediente for report %s via OpenAI", report_id)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=2000,
        messages=[
            {
                "role": "system",
                "content": "Eres un experto en derecho administrativo peruano. Generas documentos formales en español.",
            },
            {"role": "user", "content": prompt},
        ],
    )

    expediente_text: str = response.choices[0].message.content or ""
    logger.info("Expediente generated for report %s (%d chars)", report_id, len(expediente_text))
    return expediente_text


def _generate_fallback_expediente(
    report_id: str,
    report_type: str,
    category: str,
    address: str,
    description: str,
    state_data: dict | None,
    responsible_entity: str | None,
) -> str:
    state_summary = _format_state_data(state_data)
    return f"""EXPEDIENTE CIUDADANO #{str(report_id)[:8].upper()}
Fecha: {datetime.now().strftime('%d/%m/%Y')}

TIPO: {'DENUNCIA' if report_type == 'denuncia' else 'PROPUESTA'} CIUDADANA
CATEGORÍA: {category.upper()}
DIRECCIÓN: {address}

DESCRIPCIÓN:
{description}

DATOS DEL ESTADO:
{state_summary}

ENTIDAD RESPONSABLE: {responsible_entity or 'Por determinar'}

PETICIÓN: Se solicita atención en un plazo máximo de 30 días hábiles según
lo establecido en la Ley N° 27806 de Transparencia y Acceso a la Información Pública.

Documento generado mediante ReportaPe — Plataforma Cívica Digital
"""
