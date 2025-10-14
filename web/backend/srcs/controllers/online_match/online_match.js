import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

const players = [];
class Ball {
	constructor({canvasX, canvasY} = {}) {
		this.ballX = canvasX / 2 || 450;
		this.ballY = canvasY / 2 || 300;
		this.vx = 0;
		this.vy = 0;
		this.ballSize = 12;
		this.speed = 2;
		this.lastTouchedPlayer = -1;
	}
}
let ball;
const rooms = {ball, players, score: [0, 0]};
let gameRunning = false;

// Gestione goal
function checkGoal(roomId, ball, data) {

	if (ball.ballX < 0) {
			ball.ballX = data.canvasWidth / 2;
			ball.ballY = data.canvasHeight / 2;
			ball.vx = -ball.vx; // inverti direzione
			ball.vy = ball.vy;
			ball.speed = 4;
			ball.lastTouchedPlayer = 1; // chi ha segnato
			rooms[roomId].score = rooms[roomId].score || [0, 0];
			rooms[roomId].score[1] += 1; // punto al player destro
			rooms[roomId].players.forEach(p =>
				p.socket.send(JSON.stringify({
					type: 'goal',
					scorer: 1,
					score: rooms[roomId].score
				}))
			);
			if (rooms[roomId].score[1] >= 5) {
				gameRunning = false;
				rooms[roomId].players.forEach(p =>
					p.socket.send(JSON.stringify({
						type: 'victory',
						winner: 1
					}))
				);
				rooms[roomId].score = [0, 0];
			}
		}

	if (ball.ballX > data.canvasWidth) {
		ball.ballX = data.canvasWidth / 2;
		ball.ballY = data.canvasHeight / 2;
		ball.vx = -ball.vx;
		ball.vy = ball.vy;
		ball.speed = 4;
		ball.lastTouchedPlayer = 0;
		rooms[roomId].score = rooms[roomId].score || [0, 0];
		rooms[roomId].score[0] += 1; // punto al player sinistro
		rooms[roomId].players.forEach(p =>
			p.socket.send(JSON.stringify({
				type: 'goal',
				scorer: 0,
				score: rooms[roomId].score
			}))
		);
		if (rooms[roomId].score[0] >= 5) {
			gameRunning = false;
		rooms[roomId].players.forEach(p =>
			p.socket.send(JSON.stringify({
				type: 'victory',
				winner: 0
			}))
		);
		rooms[roomId].score = [0, 0];
		}
	}
}

function calculateBounce(dataBall, dataPaddle, paddle, invertY = false) {
	console.log(`dataPaddle:`, dataPaddle);
	let relativeIntersect, normalizedRelativeIntersectionY, bounceAngle;
	const paddlePosition = paddle === "left" ? dataPaddle.leftPaddleY : dataPaddle.rightPaddleY;
	relativeIntersect = (dataBall.ballY - paddlePosition) - dataPaddle.PaddleLength / 2;
	normalizedRelativeIntersectionY = relativeIntersect / (dataPaddle.PaddleLength / 2);
	bounceAngle = normalizedRelativeIntersectionY * (Math.PI / 4); // Max 45 degrees
	const direction = invertY ? -1 : 1;
	dataBall.vx = direction * dataBall.speed * Math.cos(bounceAngle);
	dataBall.vy = dataBall.speed * Math.sin(bounceAngle);
	return { vx: dataBall.vx, vy: dataBall.vy };
}

function MoveBallOnline(roomId, data) {
	if (gameRunning === false) return;

	let dataret = {ballX: 0, ballY: 0, speed: 0, vx: 0, vy: 0, lastTouchedPlayer: -1};
	if (!rooms[roomId]) {
		console.error(`Room ${roomId} does not exist.`);
		return;
	}
	const ball = rooms[roomId].ball;
	ball.ballX += ball.vx;
	ball.ballY += ball.vy;
	checkGoal(roomId, ball, data);
	if (
		ball.ballX - (ball.ballSize / 2) <= 20 + data.PaddleThickness &&
		ball.ballY + (ball.ballSize / 2) >= data.leftPaddleY &&
		ball.ballY - (ball.ballSize / 2) <= data.leftPaddleY + data.PaddleLength
	) {
		if (ball.lastTouchedPlayer == -1)
			ball.speed = 5;
		else {
			ball.speed += 0.1;
		}
		ball.ballX = 20 + data.PaddleThickness + (ball.ballSize / 2);
		const bounce = calculateBounce(ball, data, "left");
		ball.vx = bounce.vx;
		ball.vy = bounce.vy;
		ball.lastTouchedPlayer = 0;
	}
	if (
		ball.ballX + (ball.ballSize / 2) >= data.canvasWidth - 20 - data.PaddleThickness &&
		ball.ballY + (ball.ballSize / 2) >= data.rightPaddleY &&
		ball.ballY - (ball.ballSize / 2) <= data.rightPaddleY + data.PaddleLength
	) {
		if (ball.lastTouchedPlayer == -1)
			ball.speed = 5;
		else {
			ball.speed += 0.1;
		}
		ball.ballX = data.canvasWidth - 20 - data.PaddleThickness - (ball.ballSize / 2);
		const bounce = calculateBounce(ball, data, "right", true);
		ball.vx = bounce.vx;
		ball.vy = bounce.vy;
		ball.lastTouchedPlayer = 1;
	}
	if (ball.ballY - ball.ballSize / 2 <= 0) {
		ball.ballY = ball.ballSize / 2;
		ball.vy *= -1;
	}
	// Bounce off bottom wall
	if (ball.ballY + ball.ballSize / 2 >= data.canvasHeight) {
		ball.ballY = data.canvasHeight - ball.ballSize / 2;
		ball.vy *= -1;
	}
	console.log(ball.speed);
	const roomPlayers = rooms[roomId].players;
	try {
		roomPlayers[0].socket.send(JSON.stringify({
			type: 'set_ball',
			ballX: ball.ballX,
			ballY: ball.ballY,
			vx: ball.vx,
			vy: ball.vy,
			lastTouchedPlayer: ball.lastTouchedPlayer
		}));
		roomPlayers[1].socket.send(JSON.stringify({
			type: 'set_ball',
			ballX: ball.ballX,
			ballY: ball.ballY,
			vx: ball.vx,
			vy: ball.vy,
			lastTouchedPlayer: ball.lastTouchedPlayer
		}));
	}
	catch (error) {
		console.error("Error sending ball data:", error);
	}
}

function startGame() {
		let angle;
		if (Math.random() < 0.5) {
			// Right: -π/4 to π/4
			angle = (Math.random() - 0.5) * (Math.PI / 4);
		} else {
			// Left: 3π/4 to 5π/4
			angle = Math.PI + (Math.random() - 0.5) * (Math.PI / 4);
		}
		ball.vx = 4 * Math.cos(angle);
		ball.vy = 4 * Math.sin(angle);
}

export function setupMatchmaking(server) {
	let waitingPlayer = null;
	const wss = new WebSocketServer({ noServer: true  });
	if (!wss) return;
	wss.on('connection', (ws) => {
		const player = { socket: ws, id: randomUUID() };
		players.push(player);
		console.log(`Player connected: ${player.id}`);

		ws.on('message', (message) => {
			let data;
			try {
				data = JSON.parse(message);
			}
			catch {
				console.error('Invalid JSON');
				return;
			}
			if (data.type === 'find_match') {
				gameRunning = true;
				ball = new Ball(data.canvas);
				if (!waitingPlayer) {
					player.name = 'aa';
					waitingPlayer = player;
					ws.send(JSON.stringify({ type: "waiting" }));
				} else {
					const opponent = waitingPlayer;
					const roomId = randomUUID();
					player.room = roomId;
					opponent.room = roomId;
					opponent.name = 'bb';
					startGame();
					player.socket.send(JSON.stringify({ type: 'match_found', opponentName: opponent.name, id: 1, ball: ball }));
					opponent.socket.send(JSON.stringify({ type: 'match_found', opponentName: player.name, id: 0, ball: ball }));
					waitingPlayer = null;
					rooms[roomId] = { ball, players: [opponent, player] };
				}
			}
			if (data.type === 'update_state' && player.room) {
				players
				.filter((p) => p.room === player.room && p.id !== player.id)
				.forEach((op) => {
					if (op.socket.readyState === ws.OPEN) {
					op.socket.send(JSON.stringify({ type: 'update_state', state: data.payload }));
					}
				});
			}
			if (data.type === 'paddleMove' && player.room) {
				const roomPlayers = rooms[player.room].players;
				roomPlayers.forEach((op) => {
					if (op.id !== player.id) {
						op.socket.send(JSON.stringify({
							type: 'opponentMove',
							playerId: data.playerId,
							key: data.key
						}));
					}
				});
			}
			if (data.type === 'ball_update' && player.room) {
				MoveBallOnline(player.room, data);
			}
			if (data.type === 'ball_reset' && player.room) {
				ball = new Ball(data.canvas);
				rooms[player.room].ball = ball;
				startGame();
			}
		});

		ws.on('close', () => {
	    console.log(`Player disconnected: ${player.id}`);
	    const index = players.findIndex(p => p.id === player.id);
	    if (index !== -1) players.splice(index, 1);

	    const roomId = player.room;
	    if (roomId && rooms[roomId]) {
				gameRunning = false;
				rooms[roomId].players.forEach(op => {
					if (op.id !== player.id && op.socket.readyState === op.socket.OPEN) {
						op.socket.send(JSON.stringify({
							type: 'opponent_disconnected',
						}));
					}
				});
				rooms[roomId].disconnectTimeout = setTimeout(() => {
					const remaining = rooms[roomId].players.find(op => op.id !== player.id);
					if (remaining && remaining.socket.readyState === remaining.socket.OPEN) {
						remaining.socket.send(JSON.stringify({
							type: 'victory',
							winner: rooms[remaining.room].players.findIndex(p => p.id === remaining.id)
						}));
					}
					delete rooms[roomId];
				}, 2 * 60 * 1000); // 2 minuti
	    }
	});

		ws.on('error', (err) => {
			console.error(`Errore WebSocket player ${player.id}:`, err.message);
		});
	});

	wss.on('error', (err) => {
		console.error('Errore WebSocketServer:', err.message);
	});
	return wss;
}

