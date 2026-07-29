from typing import Annotated

from sqlmodel import select
from fastapi import Depends, HTTPException, status, APIRouter

from app.db.session import SessionDep
from app.models import Bookmark
from app.models.bookmark import BookmarkCreate, BookmarkUpdate

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


def get_bookmark_or_404(bookmark_id: int, session: SessionDep) -> Bookmark:
    bookmark = session.get(Bookmark, bookmark_id)
    if bookmark is None:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return bookmark


BookmarkDep = Annotated[Bookmark, Depends(get_bookmark_or_404)]

@router.post("", response_model=Bookmark)
def create_bookmark(payload: BookmarkCreate, session: SessionDep):
    bookmark = Bookmark(
        url=payload.url,
        title=payload.title,
        notes=payload.notes,
    )
    session.add(bookmark)
    session.commit()
    session.refresh(bookmark)
    return bookmark

@router.get("", response_model=list[Bookmark])
def get_bookmarks(session: SessionDep):
    statement = select(Bookmark)
    bookmarks = session.exec(statement).all()
    return bookmarks

@router.get("/{bookmark_id}", response_model=Bookmark)
def get_specific_bookmark(bookmark: BookmarkDep):
    return bookmark

@router.patch("/{bookmark_id}", response_model=Bookmark)
def update_specific_bookmark(bookmark: BookmarkDep, payload: BookmarkUpdate, session: SessionDep):
    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(bookmark, key, value)

    session.add(bookmark)
    session.commit()
    session.refresh(bookmark)
    return bookmark

@router.delete("/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_specific_bookmark(bookmark: BookmarkDep, session: SessionDep):
    session.delete(bookmark)
    session.commit()