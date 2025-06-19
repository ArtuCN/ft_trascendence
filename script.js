var button = document.getElementById("PlayButton");
var canvas = document.getElementById("gameCanvas");
var canvas_container = document.getElementById("canvas-container");
var ctx = canvas.getContext("2d");
var nbrPlayer = 2;
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
    Player.prototype.getPaddle = function () {
        return this.Bar;
    };
    return Player;
}());
var Paddles = /** @class */ (function () {
    function Paddles(i) {
        this.paddleLength = 100;
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
    Paddles.prototype.getInitialPosition = function (id) {
        return this.initialPosition;
    };
    Paddles.prototype.getSpeed = function () {
        return this.speed;
    };
    Paddles.prototype.movePaddles = function () {
        var zero = 0;
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
        this.ballSpeedX = 2;
        this.ballSpeedY = 0;
        this.ballSize = 12;
    }
    Ball.prototype.moveBall = function (Player) {
        this.ballX += this.ballSpeedX;
        this.ballY += this.ballSpeedY;
        if (this.ballX < 0) {
            alert("Player 2 win!");
            this.ballSpeedX *= -1;
        }
        else if (this.ballX > canvas.width) {
            alert("Player 1 win!");
            this.ballSpeedX *= -1;
        }
        if (this.ballY < 0 || this.ballY > canvas.height)
            this.ballSpeedY *= -1;
        if (this.ballX < 20 + Player.getPaddleThickness() &&
            this.ballY > Player.getInitialPosition(0) &&
            this.ballY < Player.getInitialPosition(0) + Player.getPaddleLength()) {
            this.ballSpeedX *= -1;
            this.ballX = 20 + Player.getPaddleThickness();
        }
        if (this.ballX > canvas.width - 20 - Player.getPaddleThickness() &&
            this.ballY > Player.getInitialPosition(1) &&
            this.ballY < Player.getInitialPosition(1) + Player.getPaddleLength()) {
            this.ballSpeedX *= -1;
            this.ballX = canvas.width - 20 - Player.getPaddleThickness();
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
    Player1.drawAndMove();
    Player2.drawAndMove();
    Pebble.moveBall(Player1.getPaddle());
    Pebble.moveBall(Player2.getPaddle());
    Pebble.drawBall();
    requestAnimationFrame(draw);
}
button.addEventListener("click", function () {
    button.style.display = "none";
    canvas_container.style.display = "block";
    canvas.style.display = "block";
    draw();
});
