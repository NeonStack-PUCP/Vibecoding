import logging
from pathlib import Path

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from config import settings

logger = logging.getLogger(__name__)

STATIC_DIR = Path("/app/static/photos")


def _s3_client():
    return boto3.client(
        "s3",
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
    )


def _ensure_bucket() -> None:
    s3 = _s3_client()
    try:
        s3.head_bucket(Bucket=settings.aws_s3_bucket)
    except ClientError as e:
        if e.response["Error"]["Code"] == "404":
            logger.info("Creating S3 bucket %s", settings.aws_s3_bucket)
            if settings.aws_region == "us-east-1":
                s3.create_bucket(Bucket=settings.aws_s3_bucket)
            else:
                s3.create_bucket(
                    Bucket=settings.aws_s3_bucket,
                    CreateBucketConfiguration={"LocationConstraint": settings.aws_region},
                )
        else:
            raise


def upload_photo(file_bytes: bytes, filename: str, host: str = "localhost:8000") -> str:
    if not settings.aws_s3_bucket:
        logger.warning("AWS_S3_BUCKET not set — saving photo locally (dev mode)")
        STATIC_DIR.mkdir(parents=True, exist_ok=True)
        filepath = STATIC_DIR / f"{filename}.jpg"
        filepath.write_bytes(file_bytes)
        return f"http://{host}/static/photos/{filename}.jpg"

    key = f"photos/{filename}.jpg"
    logger.info("Uploading photo %s to S3", key)
    try:
        _ensure_bucket()
        s3 = _s3_client()
        s3.put_object(
            Bucket=settings.aws_s3_bucket,
            Key=key,
            Body=file_bytes,
            ContentType="image/jpeg",
        )
        url = f"https://{settings.aws_s3_bucket}.s3.{settings.aws_region}.amazonaws.com/{key}"
        logger.info("Photo uploaded to S3: %s", url)
        return url
    except (BotoCoreError, ClientError) as exc:
        logger.error("S3 upload failed: %s — falling back to local", exc)
        STATIC_DIR.mkdir(parents=True, exist_ok=True)
        filepath = STATIC_DIR / f"{filename}.jpg"
        filepath.write_bytes(file_bytes)
        return f"http://{host}/static/photos/{filename}.jpg"


def upload_pdf(pdf_text: str, report_id: str) -> str:
    if not settings.aws_s3_bucket:
        logger.warning("AWS_S3_BUCKET not set — skipping PDF upload (dev mode)")
        return ""

    key = f"expedientes/expediente_{report_id}.txt"
    logger.info("Uploading expediente for report %s to S3", report_id)
    try:
        _ensure_bucket()
        s3 = _s3_client()
        s3.put_object(
            Bucket=settings.aws_s3_bucket,
            Key=key,
            Body=pdf_text.encode("utf-8"),
            ContentType="text/plain; charset=utf-8",
        )
        url = f"https://{settings.aws_s3_bucket}.s3.{settings.aws_region}.amazonaws.com/{key}"
        logger.info("Expediente uploaded to S3: %s", url)
        return url
    except (BotoCoreError, ClientError) as exc:
        logger.error("S3 expediente upload failed: %s", exc)
        return ""
