import logging
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.upload_service import upload_photo

router = APIRouter(tags=["upload"])
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/upload/photo")
@limiter.limit("20/minute")
async def upload_photo_endpoint(
    request: Request,
    file: UploadFile = File(...),
) -> dict:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG and WebP images are accepted")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 10MB limit")

    filename = f"{uuid.uuid4().hex}"
    logger.info("Uploading photo %s (%d bytes)", filename, len(content))

    try:
        host = request.headers.get("host", "localhost:8000")
        url = upload_photo(content, filename, host=host)
        return {"url": url}
    except Exception as exc:
        logger.error("Photo upload failed: %s", exc)
        raise HTTPException(status_code=500, detail="Photo upload failed")
