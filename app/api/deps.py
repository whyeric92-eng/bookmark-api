from typing import Annotated
from fastapi import Depends, HTTPException
from app.models import Bookmark, Tag
from app.db.session import SessionDep

def get_bookmark_or_404(bookmark_id: int, session: SessionDep) -> Bookmark:
    bookmark = session.get(Bookmark, bookmark_id)
    if bookmark is None:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return bookmark

BookmarkDep = Annotated[Bookmark, Depends(get_bookmark_or_404)]

def get_tag_or_404(tag_id: int, session: SessionDep) -> Tag:
    tag = session.get(Tag, tag_id)
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag

TagDep = Annotated[Tag, Depends(get_tag_or_404)]
