from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class AIRequest(BaseModel):
    ball_y: float
    paddle_y: float

@app.post("/ai")
async def ai_decision(data: AIRequest):
    ball_y = data.ball_y
    paddle_y = data.paddle_y

    if ball_y > paddle_y + 20:
        return {"key": "ArrowDown"}
    elif ball_y < paddle_y - 20:
        return {"key": "ArrowUp"}
    else:
        return {"key": None}