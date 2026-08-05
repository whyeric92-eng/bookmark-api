from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    access_token_expire_minutes: int = 30
    algorithm: str = "HS256"

    model_config = SettingsConfigDict(env_file="app/.env")


@lru_cache
def get_settings():
    return Settings()
