from sqlmodel import SQLModel, Field, Relationship

class TagLink(SQLModel, table = True):
    __tablename__ = "tag_link"

    bookmark_id: int = Field(foreign_key="bookmark.bookmark_id", primary_key= True)
    tag_id: int = Field(foreign_key="tag.tag_id", primary_key= True)

class Tag(SQLModel, table = True):
    __tablename__ = "tag"

    tag_id: int | None = Field(default=None, primary_key=True)
    tag: str
    bookmarks: list["Bookmark"] = Relationship(back_populates="tags", link_model=TagLink)