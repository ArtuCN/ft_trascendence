export const canvas = document.getElementById("gameCanvas");
export const canvas_container = document.getElementById("canvas-container");
export const ctx = canvas.getContext("2d");
export const cornerWallSize = 100; // Length of each wall side (square)
export const cornerWallThickness = 100; // Thickness of the wall
export const keysPressed = {};
document.addEventListener("keydown", (e) => {
    keysPressed[e.key] = true;
});
document.addEventListener("keyup", (e) => {
    keysPressed[e.key] = false;
});
