from typing import Annotated
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.models import Bookmark, Tag, User
from app.db.session import SessionDep
from app.core.security import decode_access_token

bearer_scheme = HTTPBearer()

def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    session: SessionDep,
) -> User:
    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    user = session.get(User, int(user_id)) if user_id else None
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user

CurrentUserDep = Annotated[User, Depends(get_current_user)]

def get_bookmark_or_404(bookmark_id: int, session: SessionDep, current_user: CurrentUserDep) -> Bookmark:
    bookmark = session.get(Bookmark, bookmark_id)
    if bookmark is None:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    elif bookmark.user_id != current_user.user_id:
        raise HTTPException(status_code=404, detail="Access denied")
    return bookmark

BookmarkDep = Annotated[Bookmark, Depends(get_bookmark_or_404)]

def get_tag_or_404(tag_id: int, session: SessionDep, current_user: CurrentUserDep) -> Tag:
    tag = session.get(Tag, tag_id)
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    elif tag.user_id != current_user.user_id:
        raise HTTPException(status_code=404, detail="Access denied")
    return tag

TagDep = Annotated[Tag, Depends(get_tag_or_404)]
