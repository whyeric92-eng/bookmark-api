from fastapi import APIRouter, status
from app.db.session import SessionDep
from app.models import Tag, Bookmark
from app.models.tag import TagCreate, TagUpdate
from sqlmodel import select, SQLModel
from app.api.deps import TagDep

router = APIRouter(prefix="/tags", tags=["tags"])

class TagPublicWithBookmarks(SQLModel):
    tag_id: int
    tag: str
    bookmarks: list[Bookmark] = []

@router.post('', response_model=Tag)
def create_tag(payload: TagCreate, session: SessionDep):
    tag = Tag(tag=payload.tag)
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag

@router.get('', response_model=list[Tag])
def get_tags(session: SessionDep):
    statement = select(Tag)
    tags = session.exec(statement).all()
    return tags

@router.get('/{tag_id}', response_model=TagPublicWithBookmarks)
def get_specific_tag(tag: TagDep):
    return tag

@router.patch('/{tag_id}', response_model=Tag)
def update_tag(tag: TagDep, payload: TagUpdate, session: SessionDep):
    tag.tag = payload.tag
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag

@router.delete('/{tag_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_specific_tag(tag: TagDep, session: SessionDep):
    session.delete(tag)
    session.commit()
