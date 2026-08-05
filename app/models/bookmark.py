from datetime import datetime, timezone
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import UniqueConstraint
from app.models.tag import TagLink

class Bookmark(SQLModel, table=True):
    __tablename__ = "bookmark"
    __table_args__ = (UniqueConstraint("user_id", "url"),)

    bookmark_id: int | None = Field(default=None, primary_key=True)
    url: str
    title: str
    notes: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    tags: list["Tag"] = Relationship(back_populates="bookmarks", link_model=TagLink)
    user_id: int = Field(foreign_key="user.user_id", index=True)
    owner: "User" = Relationship(back_populates="bookmarks")

class BookmarkCreate(SQLModel):
    url: str
    title: str
    notes: str | None = None

class BookmarkUpdate(SQLModel):
    url: str | None = None
    title: str | None = None
    notes: str | None = None