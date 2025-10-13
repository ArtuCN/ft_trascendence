import { Player } from './classPlayer.js';
import { Paddles } from './classPaddles.js';
import { gameRunning, stopGame, PaddleOrientation, canvas, ctx, cornerWallSize, cornerWallThickness,  } from './variables.js';
import { nbrPlayer, playerGoals, playerGoalsRecived, showMenu, ws } from '../script.js';
import { showVictoryScreen } from '../utilities.js';

export function drawScore(nbrPlayer: number) {
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "white";

    if (nbrPlayer <= 2) {
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

	private ballX: number = canvas.width / 2;
	private ballY: number = canvas.height / 2;
	private ballSize: number = 12;
	private speed: number = 4;
	private vx: number = 0;
	private vy: number = 0;
	private lastTouchedPlayer: number = -1;
	private online: boolean = false;
	private isAuthoritative: boolean = false;

	public getBallSpeed(): number {
		return this.speed;
	}

	public constructor(online: boolean = false, isAuthoritative: boolean = false) {
		this.online = online;
		this.isAuthoritative = isAuthoritative;
		let angle: number;
		if (this.online && this.isAuthoritative) return;
		if (nbrPlayer <= 2) {
			if (Math.random() < 0.5) {
				// Right: -π/4 to π/4
				angle = (Math.random() - 0.5) * (Math.PI / 4);
			} else {
				// Left: 3π/4 to 5π/4
				angle = Math.PI + (Math.random() - 0.5) * (Math.PI / 4);
			}
		} else {
			// Any direction for 4 players
			angle = Math.random() * Math.PI * 2;
		}
		this.vx = this.speed * Math.cos(angle);
		this.vy = this.speed * Math.sin(angle);
	}

	public resetGame(players: Player[]) {
		if (this.online && this.isAuthoritative) {
			this.setOnlinePosition(this.ballX, this.ballY, this.vx, this.vy);
			ws.send(JSON.stringify({
				type: 'ball_reset',
				canvas: {
					width: canvas.width,
					height: canvas.height
				}
			}));
			return ;
		}

		this.ballX = canvas.width / 2;
		this.ballY = canvas.height / 2;
		this.speed = 4;
		let angle: number;
		if (nbrPlayer <= 2) {
			if (Math.random() < 0.5) {
				// Right: -π/4 to π/4
				angle = (Math.random() - 0.5) * (Math.PI / 4);
			} else {
				// Left: 3π/4 to 5π/4
				angle = Math.PI + (Math.random() - 0.5) * (Math.PI / 4);
			}
		} else {
			// Any direction for 4 players
			angle = Math.random() * Math.PI * 2;
		}
		this.vx = this.speed * Math.cos(angle);
		this.vy = this.speed * Math.sin(angle);
		players.forEach(p => p.getPaddle().reset());
		this.lastTouchedPlayer = -1; // Reset last touched player
	}

	private checkScore(players: Player[]) {
		if (this.online && this.isAuthoritative) return;
		// Left goal
		if (this.ballX < 0) {
			if (this.lastTouchedPlayer !== -1) playerGoals[this.lastTouchedPlayer]++;
			playerGoalsRecived[0]++;
			playerGoalsRecived[0]++;
			drawScore(nbrPlayer);
			if (playerGoals[this.lastTouchedPlayer] == 5) {
				if (typeof showMenu === "function") {
					stopGame();
					showVictoryScreen(players[this.lastTouchedPlayer]);
					for (let i = 0; i < players.length; i++) {
						if (i !== this.lastTouchedPlayer) {
							players[i].getPaddle().stopBotPolling();
						}
					}
				}

			}
			this.resetGame(players);
			return;
		}
		// Right goal
		if (this.ballX > canvas.width) {
			if (this.lastTouchedPlayer !== -1) playerGoals[this.lastTouchedPlayer]++;
			drawScore(nbrPlayer);
			playerGoalsRecived[1]++;
			if (playerGoals[this.lastTouchedPlayer] == 5) {
				if (typeof showMenu === "function") {
					stopGame();
					showVictoryScreen(players[this.lastTouchedPlayer]);
					for (let i = 0; i < players.length; i++) {
						if (i !== this.lastTouchedPlayer) {
							players[i].getPaddle().stopBotPolling();
						}
					}
				}
			}
			this.resetGame(players);
			return;
		}
		if (nbrPlayer <= 2) {
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
				if (this.lastTouchedPlayer !== -1) playerGoals[this.lastTouchedPlayer]++;
				playerGoalsRecived[2]++;
				playerGoalsRecived[2]++;
				drawScore(nbrPlayer);
				if (playerGoals[this.lastTouchedPlayer]  == 5) {
					for (let i = 0; i < players.length; i++) {
						if (i !== this.lastTouchedPlayer) {
							players[i].getPaddle().stopBotPolling();
						}
					}
					stopGame();
					showVictoryScreen(players[this.lastTouchedPlayer]);
				}
				this.resetGame(players);
				return;
			}
			// Bottom goal
			if (this.ballY > canvas.height) {
				if (this.lastTouchedPlayer !== -1) playerGoals[this.lastTouchedPlayer]++;
				playerGoalsRecived[3]++;
				playerGoalsRecived[3]++;
				drawScore(nbrPlayer);
				this.resetGame(players);
				if (playerGoals[this.lastTouchedPlayer] == 5) {
					for (let i = 0; i < players.length; i++) {
						if (i !== this.lastTouchedPlayer) {
							players[i].getPaddle().stopBotPolling();
						}
					}
					stopGame();
					showVictoryScreen(players[this.lastTouchedPlayer]);
				}
				return;
			}
		}
	}

	public moveBallOnline(players: Player[]) {
		if (!gameRunning ) return;
		
		const leftPaddle = players[0].getPaddle();
		const rightPaddle = players[1].getPaddle();
		this.checkScore(players);
	
		ws.send(JSON.stringify({
			type: 'ball_update',
			leftPaddleY: leftPaddle.getInitialPosition(),
			rightPaddleY: rightPaddle.getInitialPosition(),
			PaddleLength: leftPaddle.getPaddleLength(),
			PaddleThickness: leftPaddle.getPaddleThickness(),
			canvasWidth: canvas.width,
			canvasHeight: canvas.height,
		}));
	}

	public moveBall(players: Player[]) {
		if (!gameRunning) return;
		if (!gameRunning) return;

		this.ballX += this.vx;
		this.ballY += this.vy;

		this.checkScore(players);

		if (nbrPlayer <= 2) {
			// Left paddle (Player 0)
			const leftPaddle = players[0].getPaddle();
			if (
				this.ballX - this.ballSize / 2 <= 20 + leftPaddle.getPaddleThickness() &&
				this.ballY + this.ballSize / 2 >= leftPaddle.getInitialPosition() &&
				this.ballY - this.ballSize / 2 <= leftPaddle.getInitialPosition() + leftPaddle.getPaddleLength()
			) {
				if (this.lastTouchedPlayer == -1)
					this.speed = 7;
				else
					this.speed += 0.1;
				if (this.lastTouchedPlayer == -1)
					this.speed = 7;
				else
					this.speed += 0.1;
				this.ballX = 20 + leftPaddle.getPaddleThickness() + this.ballSize / 2;
				this.calculateBounce(leftPaddle, "vertical");
				this.lastTouchedPlayer = 0; // Left player touched the ball
			}

			const rightPaddle = players[1].getPaddle();
			if (
				this.ballX + this.ballSize / 2 >= canvas.width - 20 - rightPaddle.getPaddleThickness() &&
				this.ballY + this.ballSize / 2 >= rightPaddle.getInitialPosition() &&
				this.ballY - this.ballSize / 2 <= rightPaddle.getInitialPosition() + rightPaddle.getPaddleLength()
			) {
				if (this.lastTouchedPlayer == -1)
					this.speed = 7;
				else
					this.speed += 0.1;
				if (this.lastTouchedPlayer == -1)
					this.speed = 7;
				else
					this.speed += 0.1;
				this.ballX = canvas.width - 20 - rightPaddle.getPaddleThickness() - this.ballSize / 2;
				this.calculateBounce(rightPaddle, "vertical", true);
				this.lastTouchedPlayer = 1; // Right player touched the ball
			}
		}
				
		if (nbrPlayer == 4) {
			this.cornerCollision();

			const leftPaddle = players[0].getPaddle();
			if (
				this.ballX - this.ballSize / 2 <= 20 + leftPaddle.getPaddleThickness() &&
				this.ballY + this.ballSize / 2 >= leftPaddle.getInitialPosition() &&
				this.ballY - this.ballSize / 2 <= leftPaddle.getInitialPosition() + leftPaddle.getPaddleLength()
			) {
				if (this.lastTouchedPlayer == -1)
					this.speed = 7;
				else
					this.speed += 0.1;
				if (this.lastTouchedPlayer == -1)
					this.speed = 7;
				else
					this.speed += 0.1;
				this.ballX = 20 + leftPaddle.getPaddleThickness() + this.ballSize / 2;
				this.calculateBounce(leftPaddle, "vertical");
				this.lastTouchedPlayer = 0;
			}

			const rightPaddle = players[1].getPaddle();
			if (
				this.ballX + this.ballSize / 2 >= canvas.width - 20 - rightPaddle.getPaddleThickness() &&
				this.ballY + this.ballSize / 2 >= rightPaddle.getInitialPosition() &&
				this.ballY - this.ballSize / 2 <= rightPaddle.getInitialPosition() + rightPaddle.getPaddleLength()
			) {
				if (this.lastTouchedPlayer == -1)
					this.speed = 7;
				else
					this.speed += 0.1;
				if (this.lastTouchedPlayer == -1)
					this.speed = 7;
				else
					this.speed += 0.1;
				this.ballX = canvas.width - 20 - rightPaddle.getPaddleThickness() - this.ballSize / 2;
				this.calculateBounce(rightPaddle, "vertical", true);
				this.lastTouchedPlayer = 1; // Right player touched the ball
			}

			const topPaddle = players[2].getPaddle();
			if (
				this.ballY - this.ballSize / 2 <= 20 + topPaddle.getPaddleThickness() &&
				this.ballX + this.ballSize / 2 >= topPaddle.getInitialPosition() &&
				this.ballX - this.ballSize / 2 <= topPaddle.getInitialPosition() + topPaddle.getPaddleLength()
			) {
				if (this.lastTouchedPlayer == -1)
					this.speed = 7;
				else
					this.speed += 0.1;
				if (this.lastTouchedPlayer == -1)
					this.speed = 7;
				else
					this.speed += 0.1;
				this.ballY = 20 + topPaddle.getPaddleThickness() + this.ballSize / 2;
				this.calculateBounce(topPaddle, "horizontal");
				this.lastTouchedPlayer = 2; // Top player touched the ball
			}

			const bottomPaddle = players[3].getPaddle();
			if (
				this.ballY + this.ballSize / 2 >= canvas.height - 20 - bottomPaddle.getPaddleThickness() &&
				this.ballX + this.ballSize / 2 >= bottomPaddle.getInitialPosition() &&
				this.ballX - this.ballSize / 2 <= bottomPaddle.getInitialPosition() + bottomPaddle.getPaddleLength()
			) {
				if (this.lastTouchedPlayer == -1)
					this.speed = 7;
				else
					this.speed += 0.1;
				if (this.lastTouchedPlayer == -1)
					this.speed = 7;
				else
					this.speed += 0.1;
				this.ballY = canvas.height - 20 - bottomPaddle.getPaddleThickness() - this.ballSize / 2;
				this.calculateBounce(bottomPaddle, "horizontal", true);
				this.lastTouchedPlayer = 3; // Bottom player touched the ball
			}
		}
	}

	public setOnlinePosition(x?: number, y?: number, vx?: number, vy?: number) {
		if (x !== undefined) this.ballX = x;
		if (y !== undefined) this.ballY = y;
		if (vx !== undefined) this.vx = vx;
		if (vy !== undefined) this.vy = vy;
	}

	public getState() {
		return {
			x: this.ballX,
			y: this.ballY,
			vx: this.vx,
			vy: this.vy,
			lastTouchedPlayer: this.lastTouchedPlayer
		};
	}

	public applyState(state: { ballX: number; ballY: number; vx: number; vy: number; lastTouchedPlayer: number }) {
		this.ballX = state.ballX;
		this.ballY = state.ballY;
		this.vx = state.vx;
		this.vy = state.vy;
		this.lastTouchedPlayer = state.lastTouchedPlayer;
		console.log("Ball state applied:");
	}

	private reflect(normalX: number, normalY: number) {

		const dot = this.vx * normalX + this.vy * normalY;
		this.vx = this.vx - 2 * dot * normalX;
		this.vy = this.vy - 2 * dot * normalY;
	}

	private cornerCollision() {

		if (
			this.ballX - this.ballSize / 2 < cornerWallSize &&
			this.ballY - this.ballSize / 2 < cornerWallThickness &&
			this.ballX - this.ballSize / 2 < cornerWallThickness &&
			this.ballY - this.ballSize / 2 < cornerWallSize
		) {

			const dx = this.ballX - cornerWallThickness;
			const dy = this.ballY - cornerWallThickness;
			if (Math.abs(dx) < Math.abs(dy)) {
				// Closer to vertical wall (left)
				this.ballX = cornerWallThickness + this.ballSize / 2;
				this.reflect(1, 0);
			} else if (Math.abs(dy) < Math.abs(dx)) {
				// Closer to horizontal wall (top)
				this.ballY = cornerWallThickness + this.ballSize / 2;
				this.reflect(0, 1);
			} else {
				// Corner point: reflect both
				this.ballX = cornerWallThickness + this.ballSize / 2;
				this.ballY = cornerWallThickness + this.ballSize / 2;
				this.reflect(1 / Math.sqrt(2), 1 / Math.sqrt(2));
			}
		}

		if (
			this.ballX + this.ballSize / 2 > canvas.width - cornerWallSize &&
			this.ballY - this.ballSize / 2 < cornerWallThickness &&
			this.ballX + this.ballSize / 2 > canvas.width - cornerWallThickness &&
			this.ballY - this.ballSize / 2 < cornerWallSize
		) {
			const dx = this.ballX - (canvas.width - cornerWallThickness);
			const dy = this.ballY - cornerWallThickness;
			if (Math.abs(dx) < Math.abs(dy)) {
				// Closer to vertical wall (right)
				this.ballX = canvas.width - cornerWallThickness - this.ballSize / 2;
				this.reflect(-1, 0);
			} else if (Math.abs(dy) < Math.abs(dx)) {
				// Closer to horizontal wall (top)
				this.ballY = cornerWallThickness + this.ballSize / 2;
				this.reflect(0, 1);
			} else {
				// Corner point
				this.ballX = canvas.width - cornerWallThickness - this.ballSize / 2;
				this.ballY = cornerWallThickness + this.ballSize / 2;
				this.reflect(-1 / Math.sqrt(2), 1 / Math.sqrt(2));
			}
		}

		if (
			this.ballX - this.ballSize / 2 < cornerWallSize &&
			this.ballY + this.ballSize / 2 > canvas.height - cornerWallThickness &&
			this.ballX - this.ballSize / 2 < cornerWallThickness &&
			this.ballY + this.ballSize / 2 > canvas.height - cornerWallSize
		) {
			const dx = this.ballX - cornerWallThickness;
			const dy = this.ballY - (canvas.height - cornerWallThickness);
			if (Math.abs(dx) < Math.abs(dy)) {
				// Closer to vertical wall (left)
				this.ballX = cornerWallThickness + this.ballSize / 2;
				this.reflect(1, 0);
			} else if (Math.abs(dy) < Math.abs(dx)) {
				// Closer to horizontal wall (bottom)
				this.ballY = canvas.height - cornerWallThickness - this.ballSize / 2;
				this.reflect(0, -1);
			} else {
				// Corner point
				this.ballX = cornerWallThickness + this.ballSize / 2;
				this.ballY = canvas.height - cornerWallThickness - this.ballSize / 2;
				this.reflect(1 / Math.sqrt(2), -1 / Math.sqrt(2));
			}
		}

		if (
			this.ballX + this.ballSize / 2 > canvas.width - cornerWallSize &&
			this.ballY + this.ballSize / 2 > canvas.height - cornerWallThickness &&
			this.ballX + this.ballSize / 2 > canvas.width - cornerWallThickness &&
			this.ballY + this.ballSize / 2 > canvas.height - cornerWallSize
		) {
			const dx = this.ballX - (canvas.width - cornerWallThickness);
			const dy = this.ballY - (canvas.height - cornerWallThickness);
			if (Math.abs(dx) < Math.abs(dy)) {
				// Closer to vertical wall (right)
				this.ballX = canvas.width - cornerWallThickness - this.ballSize / 2;
				this.reflect(-1, 0);
			} else if (Math.abs(dy) < Math.abs(dx)) {
				// Closer to horizontal wall (bottom)
				this.ballY = canvas.height - cornerWallThickness - this.ballSize / 2;
				this.reflect(0, -1);
			} else {
				// Corner point
				this.ballX = canvas.width - cornerWallThickness - this.ballSize / 2;
				this.ballY = canvas.height - cornerWallThickness - this.ballSize / 2;
				this.reflect(-1 / Math.sqrt(2), -1 / Math.sqrt(2));
			}
		}
	}

	private calculateBounce(paddle: Paddles, orientation: PaddleOrientation, isReverse: boolean = false) {

		let relativeIntersect: number, normalizedRelativeIntersection: number, bounceAngle: number;
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
		} else {
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

	public drawBall() {
		ctx.beginPath();
		ctx.arc(this.ballX, this.ballY, this.ballSize / 2, 0, Math.PI * 2);
		ctx.fillStyle = "white";
		ctx.fill();
		ctx.closePath();
	}

	public getBallX() {
		return this.ballX;
	}

	public getBallY() {
		return this.ballY;
	}

	public getBallSize() {
		return this.ballSize;
	}

	public getDirectionX() {
		return this.vx;
	}

	public getDirectionY() {
		return this.vy;
	}

	public getDirectionX() {
		return this.vx;
	}

	public getDirectionY() {
		return this.vy;
	}
}