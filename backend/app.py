# backend/app.py - Modified Structure
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio

# Add your agent components
from src.agent import TabMateAgent

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class UrlRequest(BaseModel):
    urls: list[str]

@app.post("/process-urls")
async def process_urls_endpoint(request: UrlRequest):
    try:
        agent = TabMateAgent()
        result = await agent.process_urls(request.urls)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
