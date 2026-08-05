from datetime import datetime, timezone
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    __tablename__ = "user"

    user_id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str 
    username: str = Field(unique=True, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

class UserCreate(SQLModel):
    username: str
    email: str 
    password: str = Field(min_length=8)

class UserProfile(SQLModel):
    user_id: int
    username: str
    email: str 

class UserLogin(SQLModel):
    email: str
    password: str