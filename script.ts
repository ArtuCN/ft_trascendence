const button = document.getElementById("PlayButton") as HTMLButtonElement;
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const canvas_container = document.getElementById("canvas-container")!;
const ctx = canvas.getContext("2d")!;

let nbrPlayer = 2;
let leftPlayerGoal = 0;
let rightPlayerGoal = 0;

const keysPressed: Record<string, boolean> = {};

document.addEventListener("keydown", (e) => {
	keysPressed[e.key] = true;
});
document.addEventListener("keyup", (e) => {
	keysPressed[e.key] = false;
});

class Player {

	private nameTag: string;
	private Bar;
	private touchBall: boolean = false;

	public constructor(name: string, id: number) {
		this.nameTag = name;
		this.Bar = new Paddles(id);
	}

	public drawAndMove() {
		this.Bar.movePaddles();
		this.Bar.drawPaddles();
	}

	public getNameTag() {
		return this.nameTag;
	}

	public getPaddle() {
		return this.Bar;
	}

}

class Paddles {
	// private nameTag: string;
	private id;
	private paddleLength = 60;
	private paddleThickness = 20;
	private speed = 4;
	private initialPosition;

	public constructor(i: number) {
			this.id = i + 1;
			this.initialPosition = canvas.height / 2 - this.paddleLength / 2;
	}

	public getPaddleLength() {
		return this.paddleLength;
	}

	public getPaddleThickness() {
		return this.paddleThickness;
	}

	public getInitialPosition() {
		return this.initialPosition;
	}

	public getSpeed() {
		return this.speed;
	}

	public reset() {
		this.initialPosition = canvas.height / 2 - this.paddleLength / 2
	}

	public movePaddles() {
		
		for (let i = 0; i < nbrPlayer; i++) {

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
				if (keysPressed["ArrowUp"]&& this.initialPosition <= (canvas.height - this.paddleLength)
					&& this.initialPosition >= 0)
					this.initialPosition -= this.speed;
				if (keysPressed["ArrowDown"]&& this.initialPosition <= (canvas.height - this.paddleLength)
					&& this.initialPosition >= 0)
					this.initialPosition += this.speed;
				else if (this.initialPosition > (canvas.height - this.paddleLength))
					this.initialPosition = canvas.height - this.paddleLength - 1;
				else if (this.initialPosition < 0)
					this.initialPosition = 1;
			}
		}

	}

	public drawPaddles() {

		ctx.fillStyle = "white";

		if (this.id % 2 != 0)
			ctx.fillRect(20, this.initialPosition, this.paddleThickness, this.paddleLength);
		else
			ctx.fillRect(canvas.width - 20 - this.paddleThickness, this.initialPosition, this.paddleThickness, this.paddleLength);
	}
}

class Ball {
    private ballX = canvas.width / 2;
    private ballY = canvas.height / 2;
    private ballSize = 12;
    private speed = 5;
    private vx = this.speed * (Math.random() > 0.5 ? 1 : -1);
    private vy = this.speed * (Math.random() * 2 - 1);

    private resetGame(leftPlayer: Player, rightPlayer: Player) {
        this.ballX = canvas.width / 2;
        this.ballY = canvas.height / 2;
        this.speed = 5;
        // Randomize direction
        const angle = (Math.random() * Math.PI / 2) - (Math.PI / 4); // -45° to 45°
        const dir = Math.random() > 0.5 ? 1 : -1;
        this.vx = this.speed * Math.cos(angle) * dir;
        this.vy = this.speed * Math.sin(angle);
        leftPlayer.getPaddle().reset();
        rightPlayer.getPaddle().reset();
    }

    public moveBall(leftPlayer: Player, rightPlayer: Player) {
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
        const leftPaddle = leftPlayer.getPaddle();
        if (
            this.ballX - this.ballSize / 2 < 20 + leftPaddle.getPaddleThickness() &&
            this.ballY > leftPaddle.getInitialPosition() &&
            this.ballY < leftPaddle.getInitialPosition() + leftPaddle.getPaddleLength()
        ) {
            this.ballX = 20 + leftPaddle.getPaddleThickness() + this.ballSize / 2;
            this.calculateBounce(leftPaddle);
        }

        // Paddle collision (right)
        const rightPaddle = rightPlayer.getPaddle();
        if (
            this.ballX + this.ballSize / 2 > canvas.width - 20 - rightPaddle.getPaddleThickness() &&
            this.ballY > rightPaddle.getInitialPosition() &&
            this.ballY < rightPaddle.getInitialPosition() + rightPaddle.getPaddleLength()
        ) {
            this.ballX = canvas.width - 20 - rightPaddle.getPaddleThickness() - this.ballSize / 2;
            this.calculateBounce(rightPaddle, true);
        }
    }

    // Calculate bounce angle based on where the ball hits the paddle
    private calculateBounce(paddle: Paddles, isRight: boolean = false) {
        const paddleY = paddle.getInitialPosition();
        const paddleLength = paddle.getPaddleLength();
        const relativeIntersectY = (this.ballY - paddleY) - paddleLength / 2;
        const normalizedRelativeIntersectionY = relativeIntersectY / (paddleLength / 2);
        const bounceAngle = normalizedRelativeIntersectionY * (Math.PI / 4); // Max 45°

        this.speed *= 1.05; // Optional: increase speed after each hit

        const direction = isRight ? -1 : 1;
        this.vx = direction * this.speed * Math.cos(bounceAngle);
        this.vy = this.speed * Math.sin(bounceAngle);
    }

    public drawBall() {
        ctx.beginPath();
        ctx.arc(this.ballX, this.ballY, this.ballSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.closePath();
    }
}

function drawScore() {
	ctx.font = "bold 36px Arial";
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.fillText(leftPlayerGoal.toString(), canvas.width / 4, 50);
	ctx.fillText(rightPlayerGoal.toString(), (canvas.width * 3) / 4, 50);
}

function drawMiddleLine() {

	const dashHeight = 20;
	const gap = 15;
	const x = canvas.width / 2;

	ctx.strokeStyle = "white";
	ctx.lineWidth = 4;

	for (let y = 0; y < canvas.height; y += dashHeight + gap) {
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x, y + dashHeight);
		ctx.stroke();
	}
}

let Player1 = new Player("Matteo", 0);
let Player2 = new Player("Arturo", 1);
let Pebble = new Ball()

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

button.addEventListener("click", () => {

	button.style.display = "none";
	canvas_container.style.display = "block";
	canvas.style.display = "block";
	draw();
})
