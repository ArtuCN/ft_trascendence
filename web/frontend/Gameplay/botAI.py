from fastapi import FastAPI, HTTPException
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/ai")
async def ai_decision(data: dict):
    ball_y = data.get("ballY")
    paddle_y = data.get("paddleY")

    if ball_y > paddle_y + 20:
        return {"key": "ArrowDown"}
    elif ball_y < paddle_y - 20:
        return {"key": "ArrowUp"}
    else:
        return {"key": None}