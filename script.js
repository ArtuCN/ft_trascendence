var button = document.getElementById("PlayButton");
var canvas = document.getElementById("gameCanvas");
var canvas_container = document.getElementById("canvas-container");
var SelectNbrPlayer = document.getElementById("nbrPlayerInput");
var ctx = canvas.getContext("2d");
var cornerWallSize = 40; // Length of each wall side (square)
var cornerWallThickness = 40; // Thickness of the wall
var nbrPlayer = parseInt(SelectNbrPlayer.value, 10);
var playerGoals; // Goals for each player
var keysPressed = {};
document.addEventListener("keydown", function (e) {
    keysPressed[e.key] = true;
});
document.addEventListener("keyup", function (e) {
    keysPressed[e.key] = false;
});
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
var Player = /** @class */ (function () {
    function Player(name, id, orientation) {
        this.nameTag = name;
        this.paddle = new Paddles(id, orientation);
    }
    Player.prototype.drawAndMove = function () {
        this.paddle.movePaddles();
        this.paddle.drawPaddles();
    };
    Player.prototype.getNameTag = function () {
        return this.nameTag;
    };
    Player.prototype.getPaddle = function () {
        return this.paddle;
    };
    return Player;
}());
var Paddles = /** @class */ (function () {
    function Paddles(i, orientation) {
        this.speed = 4;
        this.id = i;
        this.orientation = orientation;
        if (orientation === "vertical") {
            this.paddleLength = 60;
            this.paddleThickness = 20;
            this.initialPosition = canvas.height / 2 - this.paddleLength / 2;
        }
        else {
            this.paddleLength = 60;
            this.paddleThickness = 20;
            this.initialPosition = canvas.width / 2 - this.paddleLength / 2;
        }
    }
    Paddles.prototype.getPaddleLength = function () {
        return this.paddleLength;
    };
    Paddles.prototype.getPaddleThickness = function () {
        return this.paddleThickness;
    };
    Paddles.prototype.getInitialPosition = function () {
        return this.initialPosition;
    };
    Paddles.prototype.getSpeed = function () {
        return this.speed;
    };
    Paddles.prototype.reset = function () {
        if (this.orientation === "vertical")
            this.initialPosition = canvas.height / 2 - this.paddleLength / 2;
        else
            this.initialPosition = canvas.width / 2 - this.paddleLength / 2;
    };
    Paddles.prototype.movePaddles = function () {
        // Left paddle (Player 0, vertical)
        if (this.id === 0 && this.orientation === "vertical") {
            if (keysPressed["s"] && this.initialPosition <= (canvas.height - this.paddleLength))
                this.initialPosition += this.speed;
            if (keysPressed["w"] && this.initialPosition >= 0)
                this.initialPosition -= this.speed;
        }
        // Right paddle (Player 1, vertical)
        else if (this.id === 1 && this.orientation === "vertical") {
            if (keysPressed["ArrowDown"] && this.initialPosition <= (canvas.height - this.paddleLength))
                this.initialPosition += this.speed;
            if (keysPressed["ArrowUp"] && this.initialPosition >= 0)
                this.initialPosition -= this.speed;
        }
        // Top paddle (Player 2, horizontal)
        else if (this.id === 2 && this.orientation === "horizontal") {
            if (keysPressed["d"] && this.initialPosition <= (canvas.width - this.paddleLength))
                this.initialPosition += this.speed;
            if (keysPressed["a"] && this.initialPosition >= 0)
                this.initialPosition -= this.speed;
        }
        // Bottom paddle (Player 3, horizontal)
        else if (this.id === 3 && this.orientation === "horizontal") {
            if (keysPressed["ArrowRight"] && this.initialPosition <= (canvas.width - this.paddleLength))
                this.initialPosition += this.speed;
            if (keysPressed["ArrowLeft"] && this.initialPosition >= 0)
                this.initialPosition -= this.speed;
        }
        // Clamp position
        if (this.orientation === "vertical") {
            if (this.initialPosition > (canvas.height - this.paddleLength))
                this.initialPosition = canvas.height - this.paddleLength;
            if (this.initialPosition < 0)
                this.initialPosition = 0;
        }
        else {
            if (this.initialPosition > (canvas.width - this.paddleLength))
                this.initialPosition = canvas.width - this.paddleLength;
            if (this.initialPosition < 0)
                this.initialPosition = 0;
        }
    };
    Paddles.prototype.drawPaddles = function () {
        ctx.fillStyle = "white";
        if (this.orientation === "vertical") {
            if (this.id === 0)
                ctx.fillRect(20, this.initialPosition, this.paddleThickness, this.paddleLength); // Left
            else
                ctx.fillRect(canvas.width - 20 - this.paddleThickness, this.initialPosition, this.paddleThickness, this.paddleLength); // Right
        }
        else if (this.orientation === "horizontal") {
            if (this.id === 2)
                ctx.fillRect(this.initialPosition, 20, this.paddleLength, this.paddleThickness); // Top
            else
                ctx.fillRect(this.initialPosition, canvas.height - 20 - this.paddleThickness, this.paddleLength, this.paddleThickness); // Bottom
        }
    };
    return Paddles;
}());
// Reset goalscore
function resetGoalscore() {
    for (var i = 0; i < playerGoals.length; i++)
        playerGoals[i] = 0;
}
var Ball = /** @class */ (function () {
    function Ball() {
        this.ballX = canvas.width / 2;
        this.ballY = canvas.height / 2;
        this.ballSize = 12;
        this.speed = 5;
        this.vx = this.speed * (Math.random() > 0.5 ? 1 : -1);
        this.vy = this.speed * (Math.random() * 2 - 1);
        this.lastTouchedPlayer = -1; // -1 means no player touched the ball yet
    }
    Ball.prototype.resetGame = function (players) {
        this.ballX = canvas.width / 2;
        this.ballY = canvas.height / 2;
        this.speed = 5;
        var angle = (Math.random() * Math.PI * 2); // Any direction
        this.vx = this.speed * Math.cos(angle);
        this.vy = this.speed * Math.sin(angle);
        players.forEach(function (p) { return p.getPaddle().reset(); });
        this.lastTouchedPlayer = -1; // Reset last touched player
    };
    Ball.prototype.checkScore = function (players) {
        // Left goal
        if (this.ballX < 0) {
            if (this.lastTouchedPlayer !== -1)
                playerGoals[this.lastTouchedPlayer]++;
            drawScore(nbrPlayer);
            this.resetGame(players);
            return;
        }
        // Right goal
        if (this.ballX > canvas.width) {
            if (this.lastTouchedPlayer !== -1)
                playerGoals[this.lastTouchedPlayer]++;
            drawScore(nbrPlayer);
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
                this.resetGame(players);
                return;
            }
            // Bottom goal
            if (this.ballY > canvas.height) {
                if (this.lastTouchedPlayer !== -1)
                    playerGoals[this.lastTouchedPlayer]++;
                drawScore(nbrPlayer);
                this.resetGame(players);
                return;
            }
        }
    };
    Ball.prototype.moveBall = function (players) {
        this.ballX += this.vx;
        this.ballY += this.vy;
        this.checkScore(players);
        if (nbrPlayer == 2) {
            // Left paddle (Player 0)
            var leftPaddle = players[0].getPaddle();
            if (this.ballX - this.ballSize / 2 <= 20 + leftPaddle.getPaddleThickness() &&
                this.ballY + this.ballSize / 2 >= leftPaddle.getInitialPosition() &&
                this.ballY - this.ballSize / 2 <= leftPaddle.getInitialPosition() + leftPaddle.getPaddleLength()) {
                this.ballX = 20 + leftPaddle.getPaddleThickness() + this.ballSize / 2;
                this.calculateBounce(leftPaddle, "vertical");
                this.lastTouchedPlayer = 0; // Left player touched the ball
            }
            var rightPaddle = players[1].getPaddle();
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
            var leftPaddle = players[1].getPaddle();
            if (this.ballX - this.ballSize / 2 <= 20 + leftPaddle.getPaddleThickness() &&
                this.ballY + this.ballSize / 2 >= leftPaddle.getInitialPosition() &&
                this.ballY - this.ballSize / 2 <= leftPaddle.getInitialPosition() + leftPaddle.getPaddleLength()) {
                this.ballX = 20 + leftPaddle.getPaddleThickness() + this.ballSize / 2;
                this.calculateBounce(leftPaddle, "vertical");
                this.lastTouchedPlayer = 0; // Left player touched the ball
            }
            var rightPaddle = players[0].getPaddle();
            if (this.ballX + this.ballSize / 2 >= canvas.width - 20 - rightPaddle.getPaddleThickness() &&
                this.ballY + this.ballSize / 2 >= rightPaddle.getInitialPosition() &&
                this.ballY - this.ballSize / 2 <= rightPaddle.getInitialPosition() + rightPaddle.getPaddleLength()) {
                this.ballX = canvas.width - 20 - rightPaddle.getPaddleThickness() - this.ballSize / 2;
                this.calculateBounce(rightPaddle, "vertical", true);
                this.lastTouchedPlayer = 1; // Right player touched the ball
            }
            var topPaddle = players[2].getPaddle();
            if (this.ballY - this.ballSize / 2 <= 20 + topPaddle.getPaddleThickness() &&
                this.ballX + this.ballSize / 2 >= topPaddle.getInitialPosition() &&
                this.ballX - this.ballSize / 2 <= topPaddle.getInitialPosition() + topPaddle.getPaddleLength()) {
                this.ballY = 20 + topPaddle.getPaddleThickness() + this.ballSize / 2;
                this.calculateBounce(topPaddle, "horizontal");
                this.lastTouchedPlayer = 2; // Top player touched the ball
            }
            var bottomPaddle = players[3].getPaddle();
            if (this.ballY + this.ballSize / 2 >= canvas.height - 20 - bottomPaddle.getPaddleThickness() &&
                this.ballX + this.ballSize / 2 >= bottomPaddle.getInitialPosition() &&
                this.ballX - this.ballSize / 2 <= bottomPaddle.getInitialPosition() + bottomPaddle.getPaddleLength()) {
                this.ballY = canvas.height - 20 - bottomPaddle.getPaddleThickness() - this.ballSize / 2;
                this.calculateBounce(bottomPaddle, "horizontal", true);
                this.lastTouchedPlayer = 3; // Bottom player touched the ball
            }
        }
    };
    Ball.prototype.reflect = function (normalX, normalY) {
        var dot = this.vx * normalX + this.vy * normalY;
        this.vx = this.vx - 2 * dot * normalX;
        this.vy = this.vy - 2 * dot * normalY;
    };
    Ball.prototype.cornerCollision = function () {
        if (this.ballX - this.ballSize / 2 < cornerWallSize &&
            this.ballY - this.ballSize / 2 < cornerWallThickness &&
            this.ballX - this.ballSize / 2 < cornerWallThickness &&
            this.ballY - this.ballSize / 2 < cornerWallSize) {
            var dx = this.ballX - cornerWallThickness;
            var dy = this.ballY - cornerWallThickness;
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
            var dx = this.ballX - (canvas.width - cornerWallThickness);
            var dy = this.ballY - cornerWallThickness;
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
            var dx = this.ballX - cornerWallThickness;
            var dy = this.ballY - (canvas.height - cornerWallThickness);
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
            var dx = this.ballX - (canvas.width - cornerWallThickness);
            var dy = this.ballY - (canvas.height - cornerWallThickness);
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
    };
    Ball.prototype.calculateBounce = function (paddle, orientation, isReverse) {
        if (isReverse === void 0) { isReverse = false; }
        var relativeIntersect, normalizedRelativeIntersection, bounceAngle;
        if (orientation === "vertical") {
            var paddleY = paddle.getInitialPosition();
            var paddleLength = paddle.getPaddleLength();
            relativeIntersect = (this.ballY - paddleY) - paddleLength / 2;
            normalizedRelativeIntersection = relativeIntersect / (paddleLength / 2);
            bounceAngle = normalizedRelativeIntersection * (Math.PI / 4); // Max 45°
            this.speed *= 1.05;
            var direction = isReverse ? -1 : 1;
            this.vx = direction * this.speed * Math.cos(bounceAngle);
            this.vy = this.speed * Math.sin(bounceAngle);
        }
        else {
            var paddleX = paddle.getInitialPosition();
            var paddleLength = paddle.getPaddleLength();
            relativeIntersect = (this.ballX - paddleX) - paddleLength / 2;
            normalizedRelativeIntersection = relativeIntersect / (paddleLength / 2);
            bounceAngle = normalizedRelativeIntersection * (Math.PI / 4); // Max 45°
            this.speed *= 1.05;
            var direction = isReverse ? -1 : 1;
            this.vy = direction * this.speed * Math.cos(bounceAngle);
            this.vx = this.speed * Math.sin(bounceAngle);
        }
    };
    Ball.prototype.drawBall = function () {
        ctx.beginPath();
        ctx.arc(this.ballX, this.ballY, this.ballSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.closePath();
    };
    return Ball;
}());
function drawScore(nbrPlayer) {
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
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(playerGoals[2].toString(), cornerWallThickness / 2 - 10, cornerWallThickness / 2 - 15);
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText(playerGoals[1].toString(), canvas.width - cornerWallThickness / 2 + 10, cornerWallThickness / 2 - 15);
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillText(playerGoals[3].toString(), canvas.width - cornerWallThickness / 2 + 10, canvas.height - cornerWallThickness / 2 + 15);
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(playerGoals[0].toString(), cornerWallThickness / 2 - 10, canvas.height - cornerWallThickness / 2 + 15);
    }
}
function drawMiddleLine() {
    var dashHeight = 20;
    var gap = 15;
    var x = canvas.width / 2;
    var y = canvas.height / 2;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    // Vertical line
    if (nbrPlayer >= 2) {
        for (var yPos = 0; yPos < canvas.height; yPos += dashHeight + gap) {
            ctx.beginPath();
            ctx.moveTo(x, yPos);
            ctx.lineTo(x, yPos + dashHeight);
            ctx.stroke();
        }
    }
    if (nbrPlayer == 4) {
        // Horizontal line
        for (var xPos = 0; xPos < canvas.width; xPos += dashHeight + gap) {
            ctx.beginPath();
            ctx.moveTo(xPos, y);
            ctx.lineTo(xPos + dashHeight, y);
            ctx.stroke();
        }
    }
}
// Create 4 players
var players = [];
var Pebble = new Ball();
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMiddleLine();
    drawCornerWalls();
    Pebble.moveBall(players);
    Pebble.drawBall();
    players.forEach(function (player) { return player.drawAndMove(); });
    drawScore(nbrPlayer);
    requestAnimationFrame(draw);
}
button.addEventListener("click", function () {
    button.style.display = "none";
    SelectNbrPlayer.style.display = "none";
    SelectNbrPlayer.disabled = true;
    canvas_container.style.display = "block";
    canvas.style.display = "block";
    nbrPlayer = parseInt(SelectNbrPlayer.value, 10);
    playerGoals = Array(nbrPlayer).fill(0);
    if (isNaN(nbrPlayer) || nbrPlayer < 2 || nbrPlayer > 4)
        nbrPlayer = 2;
    players = [];
    if (nbrPlayer == 2) {
        players.push(new Player("Left", 0, "vertical"));
        players.push(new Player("Right", 1, "vertical"));
    }
    else if (nbrPlayer == 4) {
        players.push(new Player("Left", 0, "vertical"));
        players.push(new Player("Right", 1, "vertical"));
        players.push(new Player("Top", 2, "horizontal"));
        players.push(new Player("Bottom", 3, "horizontal"));
    }
    draw();
});
