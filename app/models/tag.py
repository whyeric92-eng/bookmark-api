from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import UniqueConstraint

class TagLink(SQLModel, table = True):
    __tablename__ = "tag_link"

    bookmark_id: int = Field(foreign_key="bookmark.bookmark_id", primary_key= True)
    tag_id: int = Field(foreign_key="tag.tag_id", primary_key= True)

class Tag(SQLModel, table = True):
    __tablename__ = "tag"
    __table_args__ = (UniqueConstraint("user_id", "tag"),)

    tag_id: int | None = Field(default=None, primary_key=True)
    tag: str
    user_id: int = Field(foreign_key="user.user_id", index=True)
    owner: "User" = Relationship(back_populates="tags")
    bookmarks: list["Bookmark"] = Relationship(back_populates="tags", link_model=TagLink)

class TagCreate(SQLModel):
    tag: str

class TagUpdate(SQLModel):
    tag: str