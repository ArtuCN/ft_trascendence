export const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
export const canvas_container = document.getElementById("canvas-container")!;
export const ctx = canvas.getContext("2d")!;
export const cornerWallSize = 100;
export const cornerWallThickness = 100;
export type PaddleOrientation = "vertical" | "horizontal";
export const keysPressed: Record<string, boolean> = {};
export const bracketContainer = document.getElementById("bracket-container") as HTMLDivElement;
export let gameRunning: boolean = true;

export function stopGame() {
	gameRunning = false;
}

export function startGame() {
	gameRunning = true;
}

document.addEventListener("keydown", (e) => {
	keysPressed[e.key] = true;
});
document.addEventListener("keyup", (e) => {
	keysPressed[e.key] = false;
});