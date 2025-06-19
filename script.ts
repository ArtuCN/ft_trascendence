const button = document.getElementById("PlayButton") as HTMLButtonElement;
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const canvas_container = document.getElementById("canvas-container")!;
const ctx = canvas.getContext("2d")!;

let nbrPlayer = 2;

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

	public getPaddle() {
		return this.Bar;
	}

}

class Paddles {
	// private nameTag: string;
	private id;
	private paddleLength = 100;
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

	public movePaddles() {

		let zero: number = 0;
		
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
	private ballSpeedX = 2;
	private ballSpeedY = 2;
	private ballSize = 12;

	public moveBall(Player: Paddles) {

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

		if ( this.ballX < 20 + Player.getPaddleThickness() &&
			this.ballY > Player.getInitialPosition() &&
			this.ballY < Player.getInitialPosition() + Player.getPaddleLength())
		{
			this.ballSpeedX *= -1;
			this.ballX = 20 + Player.getPaddleThickness();
		}

		if ( this.ballX > canvas.width - 20 - Player.getPaddleThickness() &&
			this.ballY > Player.getInitialPosition() &&
			this.ballY < Player.getInitialPosition() + Player.getPaddleLength())
		{
			this.ballSpeedX *= -1;
			this.ballX = canvas.width - 20 - Player.getPaddleThickness();
		}
	}

	public drawBall() {

		ctx.beginPath();
		ctx.arc(this.ballX, this.ballY, this.ballSize / 2, 0, Math.PI * 2);
		ctx.fillStyle = "white";
		ctx.fill();
		ctx.closePath();
	}
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
	Player1.drawAndMove();
	Player2.drawAndMove();
	Pebble.moveBall(Player1.getPaddle());
	Pebble.moveBall(Player2.getPaddle());
	Pebble.drawBall();
	requestAnimationFrame(draw);
}

button.addEventListener("click", () => {

	button.style.display = "none";
	canvas_container.style.display = "block";
	canvas.style.display = "block";
	draw();
})
