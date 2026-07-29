from datetime import datetime, timezone
from sqlmodel import Field, SQLModel

class Bookmark(SQLModel, table=True):
    __tablename__ = "bookmark"

    bookmark_id: int | None = Field(default=None, primary_key=True)
    url: str
    title: str
    notes: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

class BookmarkCreate(SQLModel):
    url: str
    title: str
    notes: str | None = None

class BookmarkUpdate(SQLModel):
    url: str | None = None
    title: str | None = None
    notes: str | None = None