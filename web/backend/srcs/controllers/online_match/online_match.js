import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';
import { start } from 'repl';

const players = [];
class Ball {
	constructor({canvasX, canvasY} = {}) {
		this.ballX = canvasX / 2 || 450;
		this.ballY = canvasY / 2 || 300;
		this.vx = 0;
		this.vy = 0;
		this.ballSize = 12;
		this.speed = 4;
		this.lastTouchedPlayer = -1;
	}
}
let ball;
const rooms = {ball, players};

function calculateBounce(data, paddle, invertY = false) {
	let relativeIntersect, normalizedRelativeIntersectionY, bounceAngle;
	const paddlePosition = paddle === left ? data.leftPaddleY : data.rightPaddleY;
	relativeIntersect = (data.ballY - paddlePosition) - data.paddleLength / 2;
	normalizedRelativeIntersectionY = relativeIntersect / (data.paddleLength / 2);
	bounceAngle = normalizedRelativeIntersectionY * (Math.PI / 4); // Max 45 degrees
	const direction = invertY ? -1 : 1;
	data.vx = direction * data.speed * Math.cos(bounceAngle);
	data.vy = data.speed * Math.sin(bounceAngle);
	data.ballX += data.vx;
	data.ballY += data.vy;
	return { ballX: data.ballX, ballY: data.ballY, vx: data.vx, vy: data.vy };
}

function MoveBallOnline(roomId, data) {
	let dataret = {ballX: 0, ballY: 0, speed: 0, vx: 0, vy: 0, lastTouchedPlayer: -1};
	if (!rooms[roomId]) {
		console.error(`Room ${roomId} does not exist.`);
		return;
	}
	const ball = rooms[roomId].ball;
	ball.ballX += ball.vx;
	ball.ballY += ball.vy;
	if (
		ball.ballX - ball.ballSize / 2 <= 20 + data.paddleThickness &&
		ball.ballY + ball.ballSize / 2 >= data.leftPaddleY &&
		ball.ballY - ball.ballSize / 2 <= data.leftPaddleY + data.paddleLength
	) {
		if (ball.lastTouchedPlayer == -1)
			ball.speed = 7;
		else {
			ball.speed = data.speed;
			ball.speed += 0.1;
		}
		ball.ballX = 20 + data.paddleThickness + data.ballSize / 2;
		ball = calculateBounce(ball, left);
		ball.lastTouchedPlayer = 0;
	}
	if (
		ball.ballX + ball.ballSize / 2 >= data.canvasWidth - 20 - data.paddleThickness &&
		ball.ballY + ball.ballSize / 2 >= data.rightPaddleY &&
		ball.ballY - ball.ballSize / 2 <= data.rightPaddleY + data.paddleLength
	) {
		if (ball.lastTouchedPlayer == -1)
			ball.speed = 7;
		else {
			ball.speed = data.speed;
			ball.speed += 0.1;
		}
		ball.ballX = canvas.width - 20 - data.paddleThickness - data.ballSize / 2;
		ball = calculateBounce(ball, right, true);
		ball.lastTouchedPlayer = 1;
	}
	const roomPlayers = rooms[roomId].players;
		console.log("send data ball to player:", roomPlayers[0].id, ball);
		roomPlayers[0].socket.send(JSON.stringify({
			type: 'set_ball',
			ballX: ball.ballX,
			ballY: ball.ballY,
			speed: ball.speed,
			vx: ball.vx,
			vy: ball.vy,
			lastTouchedPlayer: ball.lastTouchedPlayer
		}));
		console.log("send data ball to opponent:", roomPlayers[1].id, ball);
		roomPlayers[1].socket.send(JSON.stringify({
			type: 'set_ball',
			ballX: ball.ballX,
			ballY: ball.ballY,
			vx: ball.vx * -1,
			vy: ball.vy,
			lastTouchedPlayer: ball.lastTouchedPlayer
		}));
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
				ball = new Ball(data.canvas);
				if (!waitingPlayer) {
					waitingPlayer = ws;
					console.log('Player is waiting for an opponent...');
					ws.send(JSON.stringify({ type: "waiting" }));
				}
				else {
					console.log('Match found!');
					const opponent = players.find(p => p.id !== player.id);
					if (opponent) {
						const roomId = randomUUID();
						player.room = roomId;
						opponent.room = roomId;
						opponent.opponentId = 'aa';
						player.opponentId = 'bb';
						startGame();
						player.socket.send(JSON.stringify({ type: 'match_found', room: roomId, opponentId: opponent.opponentId, ball: ball }));
						ball.vx *= -1;
						opponent.socket.send(JSON.stringify({ type: 'match_found', room: roomId, opponentId: player.opponentId, ball: ball }));
						console.log(`Game started in room: ${roomId}`);
						console.log('web socket status: ', ws.readyState);
						waitingPlayer = null;
						rooms[roomId] = { ball, players: [player, opponent] };
						console.log('Rooms ID:', roomId);
						console.log('Current rooms:', Object.keys(rooms));
					}
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
				players
				.filter((p) => p.room === player.room && p.id !== player.id)
				.forEach((op) => {
						if (op.socket.readyState === ws.OPEN) {
							if (data.key === 'w' || data.key === 'W') {
								op.socket.send(JSON.stringify({ type: 'opponentMove', playerId: 1, key: "ArrowUp" }));
							} else if (data.key === 's' || data.key === 'S') {
								op.socket.send(JSON.stringify({ type: 'opponentMove', playerId: 1, key: "ArrowDown" }));
							}
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

