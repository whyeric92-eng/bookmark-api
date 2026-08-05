from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import CurrentUserDep
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import SessionDep
from app.models.user import User, UserCreate, UserLogin, UserProfile, Token


router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=UserProfile)
def register(payload: UserCreate, session: SessionDep):
    user = User(
        email=payload.email,
        username=payload.username,
        hashed_password=hash_password(payload.password)
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(payload: UserLogin, session: SessionDep):
    statement = select(User).where(User.email == payload.email)
    user = session.exec(statement).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = create_access_token({"sub": str(user.user_id)})
    return Token(access_token=access_token)

@router.get("/profile", response_model=UserProfile)
def get_profile(current_user: CurrentUserDep):
    return current_user

@router.post("/logout")
def logout(current_user: CurrentUserDep):
    return {"message": "Logged out successfully"}