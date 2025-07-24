import { PaddleOrientation, canvas, ctx, keysPressed, cornerWallThickness, cornerWallSize } from "./variables.js";
import { nbrPlayer, sendData, Pebble } from "../script.js";


export class Paddles {
	private id: number;
	private orientation: PaddleOrientation;
	private paddleLength: number;
	private paddleThickness: number;
	private speed: number = 4;
	private initialPosition: number;
	private botKey: string = "";
	private botPollingId: number | null = null;

	public constructor(i: number, orientation: PaddleOrientation) {

		this.id = i;
		this.orientation = orientation;
		if (orientation === "vertical") {
			this.paddleLength = 60;
			this.paddleThickness = 20;
			this.initialPosition = canvas.height / 2 - this.paddleLength / 2;
		} else {
			this.paddleLength = 60;
			this.paddleThickness = 20;
			this.initialPosition = canvas.width / 2 - this.paddleLength / 2;
		}
	}

	public getPaddleLength(): number {
		return this.paddleLength;
	}

	public getPaddleThickness(): number {
		return this.paddleThickness;
	}

	public getInitialPosition(): number {
		return this.initialPosition;
	}

	public getSpeed(): number {
		return this.speed;
	}

	public reset() {
		if (this.orientation === "vertical")
			this.initialPosition = canvas.height / 2 - this.paddleLength / 2;
		else
			this.initialPosition = canvas.width / 2 - this.paddleLength / 2;
	}

	public startBotPolling() {
		if (this.botPollingId !== null) {
			clearInterval(this.botPollingId);
		}
		this.botPollingId = window.setInterval(async () => {
			this.botKey = await sendData(Pebble.getBallY(), this.initialPosition + this.paddleLength / 2);
		}, 50); // Poll every 50ms (adjust as needed)
	}

	public stopBotPolling() {
		if (this.botPollingId !== null) {
			clearInterval(this.botPollingId);
			this.botPollingId = null;
		}
	}

	private botMode() {
		if (this.id === 0 && this.orientation === "vertical") {
			if (keysPressed["s"] && this.initialPosition <= (canvas.height - this.paddleLength))
				this.initialPosition += this.speed;
			if (keysPressed["w"] && this.initialPosition >= 0)
				this.initialPosition -= this.speed;
		}
		if (this.id === 1 && this.orientation === "vertical") {
			if (this.botKey === "ArrowDown" && this.initialPosition <= (canvas.height - this.paddleLength))
				this.initialPosition += this.speed;
			if (this.botKey === "ArrowUp" && this.initialPosition >= 0)
				this.initialPosition -= this.speed;
		}
		if (this.initialPosition > (canvas.height - this.paddleLength))
			this.initialPosition = canvas.height - this.paddleLength;
		if (this.initialPosition < 0)
			this.initialPosition = 0;
	}


	private twoPlayerMode() {
		if (this.id === 0 && this.orientation === "vertical") {
			if ((keysPressed["s"] || keysPressed["S"]) && this.initialPosition <= (canvas.height - this.paddleLength))
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
		if (this.initialPosition > (canvas.height - this.paddleLength))
			this.initialPosition = canvas.height - this.paddleLength;
		if (this.initialPosition < 0)
			this.initialPosition = 0;
	}

	private fourPlayerMode() {
		if (this.id === 0 && this.orientation === "vertical") {
			if (keysPressed["s"] && this.initialPosition <= (canvas.height - this.paddleLength - cornerWallThickness))
				this.initialPosition += this.speed;
			if (keysPressed["w"] && this.initialPosition >= 0 + cornerWallThickness)
				this.initialPosition -= this.speed;
		}
		// Right paddle (Player 1, vertical)
		else if (this.id === 1 && this.orientation === "vertical") {
			if (keysPressed["ArrowDown"] && this.initialPosition <= (canvas.height - this.paddleLength - cornerWallThickness))
				this.initialPosition += this.speed;
			if (keysPressed["ArrowUp"] && this.initialPosition >= 0 + cornerWallThickness)
				this.initialPosition -= this.speed;
		}
		// Top paddle (Player 2, horizontal)
		else if (this.id === 2 && this.orientation === "horizontal") {
			if (keysPressed["d"] && this.initialPosition <= (canvas.width - this.paddleLength - cornerWallThickness))
				this.initialPosition += this.speed;
			if (keysPressed["a"] && this.initialPosition >= 0 + cornerWallThickness)
				this.initialPosition -= this.speed;
		}
		// Bottom paddle (Player 3, horizontal)
		else if (this.id === 3 && this.orientation === "horizontal") {
			if (keysPressed["ArrowRight"] && this.initialPosition <= (canvas.width - this.paddleLength - cornerWallThickness))
				this.initialPosition += this.speed;
			if (keysPressed["ArrowLeft"] && this.initialPosition >= 0 + cornerWallThickness)
				this.initialPosition -= this.speed;
		}
		if (this.orientation === "vertical") {
			if (this.initialPosition > (canvas.height - this.paddleLength - cornerWallThickness))
				this.initialPosition = canvas.height - this.paddleLength - cornerWallThickness;
			if (this.initialPosition < 0 + cornerWallThickness)
				this.initialPosition = 0 + cornerWallThickness;
		} else {
			if (this.initialPosition > (canvas.width - this.paddleLength - cornerWallThickness))
				this.initialPosition = canvas.width - this.paddleLength - cornerWallThickness;
			if (this.initialPosition < 0 + cornerWallThickness)
				this.initialPosition = 0 + cornerWallThickness;
		}
	}

	public  movePaddles() {
		// Left paddle (Player 0, vertical)
		if (nbrPlayer === 1) {
			this.botMode();
		}
		else if (nbrPlayer == 2) {
			this.twoPlayerMode();
		}
		else if (nbrPlayer == 4) {
			this.fourPlayerMode();
		}
	}

	public drawPaddles() {
		
		if (this.orientation === "vertical") {
			if (this.id === 0) {
				ctx.fillStyle = "white";
				ctx.fillRect(20, this.initialPosition, this.paddleThickness, this.paddleLength); // Left
			}
			else {
				ctx.fillStyle = "red";
				ctx.fillRect(canvas.width - 20 - this.paddleThickness, this.initialPosition, this.paddleThickness, this.paddleLength); // Right
			}
		}
		else if (this.orientation === "horizontal") {
			if (this.id === 2) {
				ctx.fillStyle = "blue";
				ctx.fillRect(this.initialPosition, 20, this.paddleLength, this.paddleThickness); // Top
			}
			else {
				ctx.fillStyle = "green";
				ctx.fillRect(this.initialPosition, canvas.height - 20 - this.paddleThickness, this.paddleLength, this.paddleThickness); // Bottom
			}
		}
	}
}