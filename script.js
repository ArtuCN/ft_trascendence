var button = document.getElementById("PlayButton");
var canvas = document.getElementById("gameCanvas");
var canvas_container = document.getElementById("canvas-container");
var ctx = canvas.getContext("2d");
var nbrPlayer = 2;
var leftPlayerGoal = 0;
var rightPlayerGoal = 0;
var keysPressed = {};
document.addEventListener("keydown", function (e) {
    keysPressed[e.key] = true;
});
document.addEventListener("keyup", function (e) {
    keysPressed[e.key] = false;
});
var Player = /** @class */ (function () {
    function Player(name, id) {
        this.touchBall = false;
        this.nameTag = name;
        this.Bar = new Paddles(id);
    }
    Player.prototype.drawAndMove = function () {
        this.Bar.movePaddles();
        this.Bar.drawPaddles();
    };
    Player.prototype.getNameTag = function () {
        return this.nameTag;
    };
    Player.prototype.getPaddle = function () {
        return this.Bar;
    };
    return Player;
}());
var Paddles = /** @class */ (function () {
    function Paddles(i) {
        this.paddleLength = 60;
        this.paddleThickness = 20;
        this.speed = 4;
        this.id = i + 1;
        this.initialPosition = canvas.height / 2 - this.paddleLength / 2;
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
        this.initialPosition = canvas.height / 2 - this.paddleLength / 2;
    };
    Paddles.prototype.movePaddles = function () {
        for (var i = 0; i < nbrPlayer; i++) {
            if (this.id % 2 != 0) {
                if (keysPressed["s"] && this.initialPosition <= (canvas.height - this.paddleLength)
                    && this.initialPosition >= 0)
                    this.initialPosition += this.speed;
                if (keysPressed["w"] && this.initialPosition <= (canvas.height - this.paddleLength)
                    && this.initialPosition >= 0)
                    this.initialPosition -= this.speed;
                else if (this.initialPosition > (canvas.height - this.paddleLength))
                    this.initialPosition = canvas.height - this.paddleLength - 1;
                else if (this.initialPosition < 0)
                    this.initialPosition = 1;
            }
            else {
                if (keysPressed["ArrowUp"] && this.initialPosition <= (canvas.height - this.paddleLength)
                    && this.initialPosition >= 0)
                    this.initialPosition -= this.speed;
                if (keysPressed["ArrowDown"] && this.initialPosition <= (canvas.height - this.paddleLength)
                    && this.initialPosition >= 0)
                    this.initialPosition += this.speed;
                else if (this.initialPosition > (canvas.height - this.paddleLength))
                    this.initialPosition = canvas.height - this.paddleLength - 1;
                else if (this.initialPosition < 0)
                    this.initialPosition = 1;
            }
        }
    };
    Paddles.prototype.drawPaddles = function () {
        ctx.fillStyle = "white";
        if (this.id % 2 != 0)
            ctx.fillRect(20, this.initialPosition, this.paddleThickness, this.paddleLength);
        else
            ctx.fillRect(canvas.width - 20 - this.paddleThickness, this.initialPosition, this.paddleThickness, this.paddleLength);
    };
    return Paddles;
}());
var Ball = /** @class */ (function () {
    function Ball() {
        this.ballX = canvas.width / 2;
        this.ballY = canvas.height / 2;
        this.ballSize = 12;
        this.speed = 5;
        this.vx = this.speed * (Math.random() > 0.5 ? 1 : -1);
        this.vy = this.speed * (Math.random() * 2 - 1);
    }
    Ball.prototype.resetGame = function (leftPlayer, rightPlayer) {
        this.ballX = canvas.width / 2;
        this.ballY = canvas.height / 2;
        this.speed = 5;
        // Randomize direction
        var angle = (Math.random() * Math.PI / 2) - (Math.PI / 4); // -45° to 45°
        var dir = Math.random() > 0.5 ? 1 : -1;
        this.vx = this.speed * Math.cos(angle) * dir;
        this.vy = this.speed * Math.sin(angle);
        leftPlayer.getPaddle().reset();
        rightPlayer.getPaddle().reset();
    };
    Ball.prototype.moveBall = function (leftPlayer, rightPlayer) {
        this.ballX += this.vx;
        this.ballY += this.vy;
        // Top/bottom wall collision
        if (this.ballY < 0 + this.ballSize / 2) {
            this.ballY = this.ballSize / 2;
            this.vy *= -1;
        }
        if (this.ballY > canvas.height - this.ballSize / 2) {
            this.ballY = canvas.height - this.ballSize / 2;
            this.vy *= -1;
        }
        // Left goal
        if (this.ballX < 0) {
            rightPlayerGoal++;
            drawScore();
            if (rightPlayerGoal >= 5) {
                rightPlayerGoal = 0;
                leftPlayerGoal = 0;
                alert(rightPlayer.getNameTag() + " win!");
            }
            this.resetGame(leftPlayer, rightPlayer);
            return;
        }
        // Right goal
        if (this.ballX > canvas.width) {
            leftPlayerGoal++;
            drawScore();
            if (leftPlayerGoal >= 5) {
                leftPlayerGoal = 0;
                rightPlayerGoal = 0;
                alert(leftPlayer.getNameTag() + " win!");
            }
            this.resetGame(leftPlayer, rightPlayer);
            return;
        }
        // Paddle collision (left)
        var leftPaddle = leftPlayer.getPaddle();
        if (this.ballX - this.ballSize / 2 < 20 + leftPaddle.getPaddleThickness() &&
            this.ballY > leftPaddle.getInitialPosition() &&
            this.ballY < leftPaddle.getInitialPosition() + leftPaddle.getPaddleLength()) {
            this.ballX = 20 + leftPaddle.getPaddleThickness() + this.ballSize / 2;
            this.calculateBounce(leftPaddle);
        }
        // Paddle collision (right)
        var rightPaddle = rightPlayer.getPaddle();
        if (this.ballX + this.ballSize / 2 > canvas.width - 20 - rightPaddle.getPaddleThickness() &&
            this.ballY > rightPaddle.getInitialPosition() &&
            this.ballY < rightPaddle.getInitialPosition() + rightPaddle.getPaddleLength()) {
            this.ballX = canvas.width - 20 - rightPaddle.getPaddleThickness() - this.ballSize / 2;
            this.calculateBounce(rightPaddle, true);
        }
    };
    // Calculate bounce angle based on where the ball hits the paddle
    Ball.prototype.calculateBounce = function (paddle, isRight) {
        if (isRight === void 0) { isRight = false; }
        var paddleY = paddle.getInitialPosition();
        var paddleLength = paddle.getPaddleLength();
        var relativeIntersectY = (this.ballY - paddleY) - paddleLength / 2;
        var normalizedRelativeIntersectionY = relativeIntersectY / (paddleLength / 2);
        var bounceAngle = normalizedRelativeIntersectionY * (Math.PI / 4); // Max 45°
        this.speed *= 1.05; // Optional: increase speed after each hit
        var direction = isRight ? -1 : 1;
        this.vx = direction * this.speed * Math.cos(bounceAngle);
        this.vy = this.speed * Math.sin(bounceAngle);
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
function drawScore() {
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(leftPlayerGoal.toString(), canvas.width / 4, 50);
    ctx.fillText(rightPlayerGoal.toString(), (canvas.width * 3) / 4, 50);
}
function drawMiddleLine() {
    var dashHeight = 20;
    var gap = 15;
    var x = canvas.width / 2;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    for (var y = 0; y < canvas.height; y += dashHeight + gap) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + dashHeight);
        ctx.stroke();
    }
}
var Player1 = new Player("Matteo", 0);
var Player2 = new Player("Arturo", 1);
var Pebble = new Ball();
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMiddleLine();
    drawScore();
    Player1.drawAndMove();
    Player2.drawAndMove();
    Pebble.moveBall(Player1, Player2);
    Pebble.drawBall();
    requestAnimationFrame(draw);
}
button.addEventListener("click", function () {
    button.style.display = "none";
    canvas_container.style.display = "block";
    canvas.style.display = "block";
    draw();
});
