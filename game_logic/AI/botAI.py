from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Middleware to handle CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AIRequest(BaseModel):
    ball_y: float
    paddle_y: float

# AI originale per il gioco 2D (logica originale ripristinata)
@app.post("/")
async def ai_decision_2d(data: AIRequest):
    ball_y = data.ball_y
    paddle_y = data.paddle_y

    # Logica originale del 2D (da ripristinare - assumo fosse questa)
    if ball_y > paddle_y + 20:
        return {"key": "ArrowDown"}
    elif ball_y < paddle_y - 20:
        return {"key": "ArrowUp"}
    else:
        return {"key": None}

# Nuova AI per il gioco 3D (coordinate invertite)
@app.post("/3d")
async def ai_decision_3d(data: AIRequest):
    ball_y = data.ball_y
    paddle_y = data.paddle_y

    # Soglia corretta per il 3D (simile al 2D)
    if ball_y > paddle_y + 20:
        return {"key": "ArrowDown"}
    elif ball_y < paddle_y - 20:
        return {"key": "ArrowUp"}
    else:
        return {"key": None}