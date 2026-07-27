from sqlmodel import create_engine

from app.core.config import get_settings

engine = create_engine(get_settings().database_url)
