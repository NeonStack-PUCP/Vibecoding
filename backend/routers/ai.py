import io
import json
import logging
from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
from openai import OpenAI
from config import settings

router = APIRouter(tags=["ai"])
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)

PARSE_SYSTEM_PROMPT = """Eres un asistente que ayuda a ciudadanos peruanos a estructurar reportes de problemas en su barrio.

Cuando el usuario describa un problema en texto libre, extrae la información disponible y devuelve un JSON con esta estructura exacta:

{
  "category": "basura|obra|agua|luz|ambiente|pista|parque|seguridad|otro",
  "title": "título corto del problema (máx 80 caracteres)",
  "description": "descripción formal del problema lista para el expediente",
  "address_hint": "dirección o referencia mencionada en el texto, o null",
  "missing_fields": ["lista de campos que FALTAN y son necesarios"],
  "missing_question": "pregunta al usuario para obtener los campos que faltan, en lenguaje amigable",
  "estimated_duration": "tiempo que lleva el problema según el usuario, o null",
  "urgency": "alta|media|baja"
}

Campos que SIEMPRE son necesarios:
- Una descripción clara del problema
- Una ubicación (aunque sea aproximada)

Si falta alguno de esos, agrégalo a missing_fields y formula una pregunta clara en missing_question.

Responde SOLO el JSON, sin texto adicional."""


class ParseReportRequest(BaseModel):
    text: str
    category: str = "basura"


class ParseReportResponse(BaseModel):
    category: str
    title: str
    description: str
    address_hint: str | None
    missing_fields: list[str]
    missing_question: str | None
    estimated_duration: str | None
    urgency: str


class TranscribeResponse(BaseModel):
    text: str


def _openai_client() -> OpenAI:
    return OpenAI(api_key=settings.openai_api_key)


@router.post("/ai/parse-report", response_model=ParseReportResponse)
@limiter.limit("20/minute")
async def parse_report(request: Request, body: ParseReportRequest) -> ParseReportResponse:
    if not settings.openai_api_key:
        raise HTTPException(status_code=503, detail="AI service not configured")

    if len(body.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Describe el problema con más detalle")

    client = _openai_client()
    logger.info("Parsing report text (%d chars) via OpenAI", len(body.text))

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=600,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": PARSE_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Categoría sugerida: {body.category}\n\nTexto del ciudadano:\n{body.text}",
                },
            ],
        )
        data = json.loads(response.choices[0].message.content or "{}")

        return ParseReportResponse(
            category=data.get("category", body.category),
            title=data.get("title", "Problema en mi zona"),
            description=data.get("description", body.text),
            address_hint=data.get("address_hint"),
            missing_fields=data.get("missing_fields", []),
            missing_question=data.get("missing_question"),
            estimated_duration=data.get("estimated_duration"),
            urgency=data.get("urgency", "media"),
        )
    except Exception as exc:
        logger.error("OpenAI parse failed: %s", exc)
        return ParseReportResponse(
            category=body.category,
            title="Reporte ciudadano",
            description=body.text,
            address_hint=None,
            missing_fields=["location"],
            missing_question="¿En qué dirección o zona ocurre este problema?",
            estimated_duration=None,
            urgency="media",
        )


@router.post("/ai/transcribe", response_model=TranscribeResponse)
@limiter.limit("15/minute")
async def transcribe_audio(
    request: Request,
    file: UploadFile = File(...),
) -> TranscribeResponse:
    if not settings.openai_api_key:
        raise HTTPException(status_code=503, detail="AI service not configured")

    content = await file.read()
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Audio file too large (max 25MB)")

    filename = file.filename or "audio.m4a"
    logger.info("Transcribing audio %s (%d bytes) via Whisper", filename, len(content))

    client = _openai_client()
    try:
        audio_file = io.BytesIO(content)
        audio_file.name = filename
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="es",
            prompt="Reporte ciudadano en Lima, Perú. Problema de basura, obra, agua, luz o infraestructura.",
        )
        logger.info("Transcription complete: %d chars", len(transcript.text))
        return TranscribeResponse(text=transcript.text)
    except Exception as exc:
        logger.error("Whisper transcription failed: %s", exc)
        raise HTTPException(status_code=500, detail="No se pudo transcribir el audio")
