from datetime import datetime, timezone
from sqlmodel import Field, SQLModel

class Bookmark(SQLModel, table=True):
    __tablename__ = "bookmark"

    bookmark_id: int | None = Field(default=None, primary_key=True)
    url: str
    title: str
    notes: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
