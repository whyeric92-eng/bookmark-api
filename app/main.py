from sqlmodel import select
from fastapi import FastAPI, HTTPException, status

from app.db.session import SessionDep
from app.models import Bookmark
from app.models.bookmark import BookmarkCreate, BookmarkUpdate

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/bookmarks", response_model=Bookmark)
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

@app.get("/bookmarks", response_model=list[Bookmark])
def get_bookmarks(session: SessionDep):
    statement = select(Bookmark)
    bookmarks = session.exec(statement).all()
    return bookmarks

@app.get("/bookmarks/{bookmark_id}", response_model=Bookmark)
def get_specific_bookmark(bookmark_id: int, session: SessionDep):
    statement = select(Bookmark).where(Bookmark.bookmark_id==bookmark_id)
    bookmark = session.exec(statement).first()
    if bookmark is None:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return bookmark

@app.patch("/bookmarks/{bookmark_id}", response_model=Bookmark)
def update_specific_bookmark(bookmark_id: int, payload: BookmarkUpdate, session: SessionDep):
    statement = select(Bookmark).where(Bookmark.bookmark_id==bookmark_id)
    bookmark = session.exec(statement).first()
    if bookmark is None:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(bookmark, key, value)

    session.add(bookmark)
    session.commit()
    session.refresh(bookmark)
    return bookmark

@app.delete("/bookmarks/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_specific_bookmark(bookmark_id: int, session: SessionDep):
    statement = select(Bookmark).where(Bookmark.bookmark_id==bookmark_id)
    bookmark = session.exec(statement).first()
    if bookmark is None:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    session.delete(bookmark)
    session.commit()