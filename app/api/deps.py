from typing import Annotated
from fastapi import Depends, HTTPException
from app.models import Tag
from app.db.session import SessionDep

def get_tag_or_404(tag_id: int, session: SessionDep) -> Tag:
    tag = session.get(Tag, tag_id)
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag

TagDep = Annotated[Tag, Depends(get_tag_or_404)]
