import { canvas, ctx, cornerWallSize, cornerWallThickness, } from './variables.js';
import { nbrPlayer, playerGoals, showMenu, resetGoalscore } from '../script.js';
export function drawScore(nbrPlayer) {
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "white";
    if (nbrPlayer == 2) {
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(playerGoals[0].toString(), canvas.width / 2 - 100, 20); // Left player
        ctx.textAlign = "right";
        ctx.fillText(playerGoals[1].toString(), canvas.width / 2 + 100, 20); // Right player
    }
    if (nbrPlayer == 4) {
        ctx.fillStyle = "blue";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(playerGoals[2].toString(), cornerWallThickness / 2 - 10, cornerWallThickness / 2 - 15);
        ctx.fillStyle = "red";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText(playerGoals[1].toString(), canvas.width - cornerWallThickness / 2 + 10, cornerWallThickness / 2 - 15);
        ctx.fillStyle = "green";
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillText(playerGoals[3].toString(), canvas.width - cornerWallThickness / 2 + 10, canvas.height - cornerWallThickness / 2 + 15);
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(playerGoals[0].toString(), cornerWallThickness / 2 - 10, canvas.height - cornerWallThickness / 2 + 15);
    }
}
export class Ball {
    constructor() {
        this.ballX = canvas.width / 2;
        this.ballY = canvas.height / 2;
        this.ballSize = 12;
        this.speed = 6;
        this.vx = this.speed * (Math.random() > 0.5 ? 1 : -1);
        this.vy = this.speed * (Math.random() * 2 - 1);
        this.lastTouchedPlayer = -1; // -1 means no player touched the ball yet
    }
    getBallSpeed() {
        return this.speed;
    }
    resetGame(players) {
        this.ballX = canvas.width / 2;
        this.ballY = canvas.height / 2;
        this.speed = 6;
        let angle;
        if (nbrPlayer === 2) {
            if (Math.random() < 0.5) {
                // Right: -π/4 to π/4
                angle = (Math.random() - 0.5) * (Math.PI / 2);
            }
            else {
                // Left: 3π/4 to 5π/4
                angle = Math.PI + (Math.random() - 0.5) * (Math.PI / 2);
            }
        }
        else {
            // Any direction for 4 players
            angle = Math.random() * Math.PI * 2;
        }
        this.vx = this.speed * Math.cos(angle);
        this.vy = this.speed * Math.sin(angle);
        players.forEach(p => p.getPaddle().reset());
        this.lastTouchedPlayer = -1; // Reset last touched player
    }
    checkScore(players) {
        // Left goal
        if (this.ballX < 0) {
            if (this.lastTouchedPlayer !== -1)
                playerGoals[this.lastTouchedPlayer]++;
            drawScore(nbrPlayer);
            if (playerGoals[this.lastTouchedPlayer] >= 5) {
                alert(players[this.lastTouchedPlayer].getNameTag() + " wins!");
                playerGoals.fill(0);
                resetGoalscore();
                if (typeof showMenu === "function")
                    showMenu();
            }
            this.resetGame(players);
            return;
        }
        // Right goal
        if (this.ballX > canvas.width) {
            if (this.lastTouchedPlayer !== -1)
                playerGoals[this.lastTouchedPlayer]++;
            drawScore(nbrPlayer);
            if (playerGoals[this.lastTouchedPlayer] >= 5) {
                alert(players[this.lastTouchedPlayer].getNameTag() + " wins!");
                playerGoals.fill(0);
                if (typeof showMenu === "function")
                    showMenu();
            }
            this.resetGame(players);
            return;
        }
        if (nbrPlayer == 2) {
            // Bounce off top wall
            if (this.ballY - this.ballSize / 2 <= 0) {
                this.ballY = this.ballSize / 2;
                this.vy *= -1;
            }
            // Bounce off bottom wall
            if (this.ballY + this.ballSize / 2 >= canvas.height) {
                this.ballY = canvas.height - this.ballSize / 2;
                this.vy *= -1;
            }
        }
        else if (nbrPlayer == 4) {
            if (this.ballY < 0) {
                if (this.lastTouchedPlayer !== -1)
                    playerGoals[this.lastTouchedPlayer]++;
                drawScore(nbrPlayer);
                if (playerGoals[this.lastTouchedPlayer] >= 5) {
                    alert(players[this.lastTouchedPlayer].getNameTag() + " wins!");
                    playerGoals.fill(0);
                    if (typeof showMenu === "function")
                        showMenu();
                }
                this.resetGame(players);
                return;
            }
            // Bottom goal
            if (this.ballY > canvas.height) {
                if (this.lastTouchedPlayer !== -1)
                    playerGoals[this.lastTouchedPlayer]++;
                drawScore(nbrPlayer);
                this.resetGame(players);
                if (playerGoals[this.lastTouchedPlayer] >= 5) {
                    alert(players[this.lastTouchedPlayer].getNameTag() + " wins!");
                    playerGoals.fill(0);
                    if (typeof showMenu === "function")
                        showMenu();
                }
                return;
            }
        }
    }
    moveBall(players) {
        this.ballX += this.vx;
        this.ballY += this.vy;
        this.checkScore(players);
        if (nbrPlayer == 2) {
            // Left paddle (Player 0)
            const leftPaddle = players[0].getPaddle();
            if (this.ballX - this.ballSize / 2 <= 20 + leftPaddle.getPaddleThickness() &&
                this.ballY + this.ballSize / 2 >= leftPaddle.getInitialPosition() &&
                this.ballY - this.ballSize / 2 <= leftPaddle.getInitialPosition() + leftPaddle.getPaddleLength()) {
                this.ballX = 20 + leftPaddle.getPaddleThickness() + this.ballSize / 2;
                this.calculateBounce(leftPaddle, "vertical");
                this.lastTouchedPlayer = 0; // Left player touched the ball
            }
            const rightPaddle = players[1].getPaddle();
            if (this.ballX + this.ballSize / 2 >= canvas.width - 20 - rightPaddle.getPaddleThickness() &&
                this.ballY + this.ballSize / 2 >= rightPaddle.getInitialPosition() &&
                this.ballY - this.ballSize / 2 <= rightPaddle.getInitialPosition() + rightPaddle.getPaddleLength()) {
                this.ballX = canvas.width - 20 - rightPaddle.getPaddleThickness() - this.ballSize / 2;
                this.calculateBounce(rightPaddle, "vertical", true);
                this.lastTouchedPlayer = 1; // Right player touched the ball
            }
        }
        if (nbrPlayer == 4) {
            this.cornerCollision();
            const leftPaddle = players[0].getPaddle();
            if (this.ballX - this.ballSize / 2 <= 20 + leftPaddle.getPaddleThickness() &&
                this.ballY + this.ballSize / 2 >= leftPaddle.getInitialPosition() &&
                this.ballY - this.ballSize / 2 <= leftPaddle.getInitialPosition() + leftPaddle.getPaddleLength()) {
                this.ballX = 20 + leftPaddle.getPaddleThickness() + this.ballSize / 2;
                this.calculateBounce(leftPaddle, "vertical");
                this.lastTouchedPlayer = 0; // Left player touched the ball
            }
            const rightPaddle = players[1].getPaddle();
            if (this.ballX + this.ballSize / 2 >= canvas.width - 20 - rightPaddle.getPaddleThickness() &&
                this.ballY + this.ballSize / 2 >= rightPaddle.getInitialPosition() &&
                this.ballY - this.ballSize / 2 <= rightPaddle.getInitialPosition() + rightPaddle.getPaddleLength()) {
                this.ballX = canvas.width - 20 - rightPaddle.getPaddleThickness() - this.ballSize / 2;
                this.calculateBounce(rightPaddle, "vertical", true);
                this.lastTouchedPlayer = 1; // Right player touched the ball
            }
            const topPaddle = players[2].getPaddle();
            if (this.ballY - this.ballSize / 2 <= 20 + topPaddle.getPaddleThickness() &&
                this.ballX + this.ballSize / 2 >= topPaddle.getInitialPosition() &&
                this.ballX - this.ballSize / 2 <= topPaddle.getInitialPosition() + topPaddle.getPaddleLength()) {
                this.ballY = 20 + topPaddle.getPaddleThickness() + this.ballSize / 2;
                this.calculateBounce(topPaddle, "horizontal");
                this.lastTouchedPlayer = 2; // Top player touched the ball
            }
            const bottomPaddle = players[3].getPaddle();
            if (this.ballY + this.ballSize / 2 >= canvas.height - 20 - bottomPaddle.getPaddleThickness() &&
                this.ballX + this.ballSize / 2 >= bottomPaddle.getInitialPosition() &&
                this.ballX - this.ballSize / 2 <= bottomPaddle.getInitialPosition() + bottomPaddle.getPaddleLength()) {
                this.ballY = canvas.height - 20 - bottomPaddle.getPaddleThickness() - this.ballSize / 2;
                this.calculateBounce(bottomPaddle, "horizontal", true);
                this.lastTouchedPlayer = 3; // Bottom player touched the ball
            }
        }
    }
    reflect(normalX, normalY) {
        const dot = this.vx * normalX + this.vy * normalY;
        this.vx = this.vx - 2 * dot * normalX;
        this.vy = this.vy - 2 * dot * normalY;
    }
    cornerCollision() {
        if (this.ballX - this.ballSize / 2 < cornerWallSize &&
            this.ballY - this.ballSize / 2 < cornerWallThickness &&
            this.ballX - this.ballSize / 2 < cornerWallThickness &&
            this.ballY - this.ballSize / 2 < cornerWallSize) {
            const dx = this.ballX - cornerWallThickness;
            const dy = this.ballY - cornerWallThickness;
            if (Math.abs(dx) < Math.abs(dy)) {
                // Closer to vertical wall (left)
                this.ballX = cornerWallThickness + this.ballSize / 2;
                this.reflect(1, 0);
            }
            else if (Math.abs(dy) < Math.abs(dx)) {
                // Closer to horizontal wall (top)
                this.ballY = cornerWallThickness + this.ballSize / 2;
                this.reflect(0, 1);
            }
            else {
                // Corner point: reflect both
                this.ballX = cornerWallThickness + this.ballSize / 2;
                this.ballY = cornerWallThickness + this.ballSize / 2;
                this.reflect(1 / Math.sqrt(2), 1 / Math.sqrt(2));
            }
        }
        if (this.ballX + this.ballSize / 2 > canvas.width - cornerWallSize &&
            this.ballY - this.ballSize / 2 < cornerWallThickness &&
            this.ballX + this.ballSize / 2 > canvas.width - cornerWallThickness &&
            this.ballY - this.ballSize / 2 < cornerWallSize) {
            const dx = this.ballX - (canvas.width - cornerWallThickness);
            const dy = this.ballY - cornerWallThickness;
            if (Math.abs(dx) < Math.abs(dy)) {
                // Closer to vertical wall (right)
                this.ballX = canvas.width - cornerWallThickness - this.ballSize / 2;
                this.reflect(-1, 0);
            }
            else if (Math.abs(dy) < Math.abs(dx)) {
                // Closer to horizontal wall (top)
                this.ballY = cornerWallThickness + this.ballSize / 2;
                this.reflect(0, 1);
            }
            else {
                // Corner point
                this.ballX = canvas.width - cornerWallThickness - this.ballSize / 2;
                this.ballY = cornerWallThickness + this.ballSize / 2;
                this.reflect(-1 / Math.sqrt(2), 1 / Math.sqrt(2));
            }
        }
        if (this.ballX - this.ballSize / 2 < cornerWallSize &&
            this.ballY + this.ballSize / 2 > canvas.height - cornerWallThickness &&
            this.ballX - this.ballSize / 2 < cornerWallThickness &&
            this.ballY + this.ballSize / 2 > canvas.height - cornerWallSize) {
            const dx = this.ballX - cornerWallThickness;
            const dy = this.ballY - (canvas.height - cornerWallThickness);
            if (Math.abs(dx) < Math.abs(dy)) {
                // Closer to vertical wall (left)
                this.ballX = cornerWallThickness + this.ballSize / 2;
                this.reflect(1, 0);
            }
            else if (Math.abs(dy) < Math.abs(dx)) {
                // Closer to horizontal wall (bottom)
                this.ballY = canvas.height - cornerWallThickness - this.ballSize / 2;
                this.reflect(0, -1);
            }
            else {
                // Corner point
                this.ballX = cornerWallThickness + this.ballSize / 2;
                this.ballY = canvas.height - cornerWallThickness - this.ballSize / 2;
                this.reflect(1 / Math.sqrt(2), -1 / Math.sqrt(2));
            }
        }
        if (this.ballX + this.ballSize / 2 > canvas.width - cornerWallSize &&
            this.ballY + this.ballSize / 2 > canvas.height - cornerWallThickness &&
            this.ballX + this.ballSize / 2 > canvas.width - cornerWallThickness &&
            this.ballY + this.ballSize / 2 > canvas.height - cornerWallSize) {
            const dx = this.ballX - (canvas.width - cornerWallThickness);
            const dy = this.ballY - (canvas.height - cornerWallThickness);
            if (Math.abs(dx) < Math.abs(dy)) {
                // Closer to vertical wall (right)
                this.ballX = canvas.width - cornerWallThickness - this.ballSize / 2;
                this.reflect(-1, 0);
            }
            else if (Math.abs(dy) < Math.abs(dx)) {
                // Closer to horizontal wall (bottom)
                this.ballY = canvas.height - cornerWallThickness - this.ballSize / 2;
                this.reflect(0, -1);
            }
            else {
                // Corner point
                this.ballX = canvas.width - cornerWallThickness - this.ballSize / 2;
                this.ballY = canvas.height - cornerWallThickness - this.ballSize / 2;
                this.reflect(-1 / Math.sqrt(2), -1 / Math.sqrt(2));
            }
        }
    }
    calculateBounce(paddle, orientation, isReverse = false) {
        let relativeIntersect, normalizedRelativeIntersection, bounceAngle;
        if (orientation === "vertical") {
            const paddleY = paddle.getInitialPosition();
            const paddleLength = paddle.getPaddleLength();
            relativeIntersect = (this.ballY - paddleY) - paddleLength / 2;
            normalizedRelativeIntersection = relativeIntersect / (paddleLength / 2);
            bounceAngle = normalizedRelativeIntersection * (Math.PI / 4); // Max 45°
            // this.speed *= 1.05;
            const direction = isReverse ? -1 : 1;
            this.vx = direction * this.speed * Math.cos(bounceAngle);
            this.vy = this.speed * Math.sin(bounceAngle);
        }
        else {
            const paddleX = paddle.getInitialPosition();
            const paddleLength = paddle.getPaddleLength();
            relativeIntersect = (this.ballX - paddleX) - paddleLength / 2;
            normalizedRelativeIntersection = relativeIntersect / (paddleLength / 2);
            bounceAngle = normalizedRelativeIntersection * (Math.PI / 4); // Max 45°
            // this.speed *= 1.05;
            const direction = isReverse ? -1 : 1;
            this.vy = direction * this.speed * Math.cos(bounceAngle);
            this.vx = this.speed * Math.sin(bounceAngle);
        }
    }
    drawBall() {
        ctx.beginPath();
        ctx.arc(this.ballX, this.ballY, this.ballSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.closePath();
    }
}
