import { canvas, ctx, canvas_container, cornerWallSize, cornerWallThickness } from "./typescriptFile/variables.js";
import { Player } from "./typescriptFile/classPlayer.js";
import { Ball, drawScore } from "./typescriptFile/classBall.js";
const button2P = document.getElementById("Play2P");
const button4P = document.getElementById("Play4P");
const buttonAi = document.getElementById("PlayAI");
const textPong = document.getElementById("PongGame");
export let nbrPlayer;
export let playerGoals;
export function showMenu() {
    button2P.style.display = "inline-block";
    button4P.style.display = "inline-block";
    buttonAi.style.display = "inline-block";
    textPong.style.display = "block";
    canvas_container.style.display = "none";
    canvas.style.display = "none";
}
function drawCornerWalls() {
    if (nbrPlayer !== 4)
        return;
    ctx.fillStyle = "#888";
    // Top-left
    ctx.fillRect(0, 0, cornerWallSize, cornerWallThickness); // horizontal
    ctx.fillRect(0, 0, cornerWallThickness, cornerWallSize); // vertical
    // Top-right
    ctx.fillRect(canvas.width - cornerWallSize, 0, cornerWallSize, cornerWallThickness);
    ctx.fillRect(canvas.width - cornerWallThickness, 0, cornerWallThickness, cornerWallSize);
    // Bottom-left
    ctx.fillRect(0, canvas.height - cornerWallThickness, cornerWallSize, cornerWallThickness);
    ctx.fillRect(0, canvas.height - cornerWallSize, cornerWallThickness, cornerWallSize);
    // Bottom-right
    ctx.fillRect(canvas.width - cornerWallSize, canvas.height - cornerWallThickness, cornerWallSize, cornerWallThickness);
    ctx.fillRect(canvas.width - cornerWallThickness, canvas.height - cornerWallSize, cornerWallThickness, cornerWallSize);
}
// Reset goalscore
export function resetGoalscore() {
    for (let i = 0; i < playerGoals.length; i++)
        playerGoals[i] = 0;
}
function drawMiddleLine() {
    const dashHeight = 20;
    const gap = 15;
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    // Vertical line
    if (nbrPlayer >= 2) {
        for (let yPos = 0; yPos < canvas.height; yPos += dashHeight + gap) {
            ctx.beginPath();
            ctx.moveTo(x, yPos);
            ctx.lineTo(x, yPos + dashHeight);
            ctx.stroke();
        }
    }
    if (nbrPlayer == 4) {
        // Horizontal line
        for (let xPos = 0; xPos < canvas.width; xPos += dashHeight + gap) {
            ctx.beginPath();
            ctx.moveTo(xPos, y);
            ctx.lineTo(xPos + dashHeight, y);
            ctx.stroke();
        }
    }
}
// Create 4 players
let players = [];
let Pebble = new Ball();
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMiddleLine();
    drawCornerWalls();
    Pebble.moveBall(players);
    Pebble.drawBall();
    players.forEach(player => player.drawAndMove());
    drawScore(nbrPlayer);
    requestAnimationFrame(draw);
}
button2P.addEventListener("click", () => {
    button2P.style.display = "none";
    button4P.style.display = "none";
    buttonAi.style.display = "none";
    textPong.style.display = "none";
    canvas_container.style.display = "block";
    canvas.style.display = "block";
    nbrPlayer = parseInt(button2P.value);
    if (isNaN(nbrPlayer))
        nbrPlayer = 2;
    playerGoals = [0, 0];
    players = [];
    players.push(new Player("Matteo", 0, "vertical"));
    players.push(new Player("Arturo", 1, "vertical"));
    draw();
});
button4P.addEventListener("click", () => {
    button4P.style.display = "none";
    button2P.style.display = "none";
    buttonAi.style.display = "none";
    textPong.style.display = "none";
    canvas_container.style.display = "block";
    canvas.style.display = "block";
    nbrPlayer = parseInt(button4P.value);
    if (isNaN(nbrPlayer))
        nbrPlayer = 4;
    playerGoals = [0, 0, 0, 0];
    canvas.height = canvas.width;
    players = [];
    players.push(new Player("Matteo", 0, "vertical"));
    players.push(new Player("Arturo", 1, "vertical"));
    players.push(new Player("Khadim", 2, "horizontal"));
    players.push(new Player("Tjaz", 3, "horizontal"));
    draw();
});
