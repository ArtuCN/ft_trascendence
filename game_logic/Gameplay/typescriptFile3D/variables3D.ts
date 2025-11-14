// ✅ Assicurati che gli elementi esistano
export const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement
export const canvas_container = document.getElementById("canvas-container")!
export const cornerWallSize = 100
export const cornerWallThickness = 100
export const ctx = canvas.getContext("2d");
export type PaddleOrientation = "vertical" | "horizontal"
export const keysPressed: Record<string, boolean> = {}

// Dimensioni del campo di gioco 3D
export const FIELD_WIDTH = 18
export const FIELD_HEIGHT = 12
export const FIELD_DEPTH = 0.5

// ✅ Aggiungi debug per vedere se i tasti vengono premuti
document.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true
  console.log("Key pressed:", e.key) // Debug
})
document.addEventListener("keyup", (e) => {
  keysPressed[e.key] = false
  console.log("Key released:", e.key) // Debug
})
