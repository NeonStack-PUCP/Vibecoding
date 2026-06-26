"""Initial schema — reports and supports tables

Revision ID: 0001
Revises:
Create Date: 2026-06-26
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "reports",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("status", sa.String(30), nullable=False, server_default="pending"),
        sa.Column("title", sa.Text, nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("latitude", sa.Float, nullable=False),
        sa.Column("longitude", sa.Float, nullable=False),
        sa.Column("address", sa.Text, server_default=""),
        sa.Column("photo_url", sa.Text, nullable=False),
        sa.Column("expediente_url", sa.Text),
        sa.Column("responsible_entity", sa.Text),
        sa.Column("responsible_channel", sa.Text),
        sa.Column("support_count", sa.Integer, server_default="0"),
        sa.Column("collective_request_sent", sa.Boolean, server_default="false"),
        sa.Column("state_data", JSON),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_reports_category", "reports", ["category"])
    op.create_index("ix_reports_status", "reports", ["status"])
    op.create_index("ix_reports_created_at", "reports", ["created_at"])
    op.create_index("ix_reports_lat_lng", "reports", ["latitude", "longitude"])

    op.create_table(
        "supports",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("report_id", UUID(as_uuid=True), nullable=False),
        sa.Column("citizen_name", sa.String(200), nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_supports_report_id", "supports", ["report_id"])


def downgrade() -> None:
    op.drop_table("supports")
    op.drop_table("reports")
