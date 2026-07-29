from fastapi import FastAPI
from app.api.router import api_router

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Welcome to bookmark-api"}

app.include_router(api_router)