from sqlmodel import select, SQLModel, or_
from fastapi import HTTPException, status, APIRouter
from app.db.session import SessionDep
from app.models import Bookmark,Tag
from app.models.bookmark import BookmarkCreate, BookmarkUpdate
from app.api.deps import BookmarkDep,TagDep,CurrentUserDep
from datetime import datetime
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])

class BookmarkPublicWithTags(SQLModel):
    bookmark_id: int
    url: str
    title: str
    notes: str | None
    created_at: datetime
    tags: list[Tag] = []

@router.post("", response_model=Bookmark)
def create_bookmark(payload: BookmarkCreate, session: SessionDep, current_user: CurrentUserDep):
    bookmark = Bookmark(
        url=payload.url,
        title=payload.title,
        notes=payload.notes,
        user_id=current_user.user_id,
    )
    session.add(bookmark)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail="bookmark url already existed")
    session.refresh(bookmark)
    return bookmark

@router.get("", response_model=list[BookmarkPublicWithTags])
def get_bookmarks(current_user: CurrentUserDep, session: SessionDep, tag :str | None = None, q: str | None = None):
    statement = select(Bookmark).where(Bookmark.user_id == current_user.user_id)
    if tag:
        statement = statement.where(Bookmark.tags.any(Tag.tag == tag))
    if q:
        statement = statement.where(
            or_(
                Bookmark.title.ilike(f"%{q}%"),
                Bookmark.url.ilike(f"%{q}%"),
                Bookmark.notes.ilike(f"%{q}%"),
            )
        )
    bookmarks = session.exec(statement).all()
    return bookmarks

@router.get("/{bookmark_id}", response_model=BookmarkPublicWithTags )
def get_specific_bookmark(bookmark: BookmarkDep):
    return bookmark

@router.patch("/{bookmark_id}", response_model=Bookmark)
def update_specific_bookmark(bookmark: BookmarkDep, payload: BookmarkUpdate, session: SessionDep):
    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(bookmark, key, value)

    session.add(bookmark)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail="bookmark url already existed")
    session.refresh(bookmark)
    return bookmark

@router.delete("/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_specific_bookmark(bookmark: BookmarkDep, session: SessionDep):
    session.delete(bookmark)
    session.commit()

@router.post("/{bookmark_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def connect(bookmark: BookmarkDep, tag: TagDep, session: SessionDep):
    if tag in bookmark.tags:
        raise HTTPException(status_code=400, detail="Tag already linked to this bookmark")
    bookmark.tags.append(tag)
    session.commit()

@router.delete("/{bookmark_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def disconnect(bookmark: BookmarkDep, tag: TagDep, session: SessionDep):
    if tag not in bookmark.tags:
        raise HTTPException(status_code=404, detail="Tag is not linked to this bookmark")
    bookmark.tags.remove(tag)
    session.commit()