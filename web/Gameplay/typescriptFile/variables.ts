export const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
export const canvas_container = document.getElementById("canvas-container")!;
export const ctx = canvas.getContext("2d")!;
export const cornerWallSize = 100; // Length of each wall side (square)
export const cornerWallThickness = 100; // Thickness of the wall
export type PaddleOrientation = "vertical" | "horizontal";
export const keysPressed: Record<string, boolean> = {};

document.addEventListener("keydown", (e) => {
	keysPressed[e.key] = true;
});
document.addEventListener("keyup", (e) => {
	keysPressed[e.key] = false;
});