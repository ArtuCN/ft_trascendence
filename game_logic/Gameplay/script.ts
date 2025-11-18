import { gameRunning, stopGame, startGame, canvas, ctx, canvas_container, bracketContainer } from "./typescriptFile/variables.js";
import { Player } from "./typescriptFile/classPlayer.js";
import { Ball, drawScore } from "./typescriptFile/classBall.js";
import { resetCanvas, generateBracket, renderBracket, drawCornerWalls, drawMiddleLine, clonePlayer, sendMatchData, sendTournamentData, showVictoryScreen } from "./utilities.js";

// Helper functions to get user data from localStorage
function getCurrentUserId(): number {
	const userId = localStorage.getItem('id');
	return userId ? parseInt(userId) : 0;
}

function getCurrentUsername(): string {
	return localStorage.getItem('username') || 'Guest';
}

const buttonLocalPlay = document.getElementById("LocalPlay") as HTMLButtonElement;
const buttonRemotePlay = document.getElementById("RemotePlay") as HTMLButtonElement;
const button2PLocal = document.getElementById("Play2P") as HTMLButtonElement;
const button2PRemote = document.getElementById("Play2PRemote") as HTMLButtonElement;
const button4P = document.getElementById("Play4P") as HTMLButtonElement;
const buttonAi = document.getElementById("PlayAI") as HTMLButtonElement;
const textPong = document.getElementById("PongGame") as HTMLHeadingElement;
const buttonTournament = document.getElementById("Tournament") as HTMLButtonElement;
const buttonNbrPlayer = document.getElementById("nbrPlayer") as HTMLSelectElement;
const buttonMainMenu = document.getElementById("returnMenu") as HTMLButtonElement;
const startTournamentButton = document.getElementById("StartTournament") as HTMLButtonElement;
export const buttonPlayGame = document.getElementById("PlayGame") as HTMLButtonElement;
const playerNamesModal = document.getElementById("playerName") as HTMLDivElement;
const playerInputsContainer = document.getElementById("playerInputsContainer") as HTMLDivElement;
const startGameButton = document.getElementById("startGameButton") as HTMLButtonElement;
const cancelButton = document.getElementById("cancelButton") as HTMLButtonElement;
const modalTitle = document.getElementById("modalTitle") as HTMLHeadingElement;

export let nbrPlayer: number = 0;
export let countPlayers: number = 0;
export let Tournament: boolean = false;
export let TournamentID: number = 0;
export let playerGoals: number[] = [];
export let playerGoalsRecived: number[] = [];
export let Pebble: Ball = new Ball();
export let players: Player[] = [];
export type BracketMatch = {
	player1: Player | null;
	player2: Player | null;
	matchWinner: Player | null;
	users_goal: number[];
	users_goal_recived: number[];
	round: string;
};

export let match: BracketMatch;

export let quarterfinals: BracketMatch[] = [
	{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: "" },
	{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: "" },
	{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: "" },
	{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: "" }
];
export let semifinals: BracketMatch[] = [
	{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: "" },
	{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: "" }
];

export let final: BracketMatch = { player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: ""};

export let currentRound = "quarterfinals";
export let currentMatchIndex = 0;
export let animationFrameId: number | null = null;
export let online: boolean = false;

const userId = getCurrentUserId();
const username = getCurrentUsername();

// Usa hostname corrente invece di IP hardcoded
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsHost = window.location.host; // include porta se presente
export const ws = new WebSocket(`${wsProtocol}//${wsHost}/ws`);
let myId: number;

// Setup button listener (outside of ws.onopen to work immediately)
button2PRemote.addEventListener("click", () => {
	// Notify parent window that matchmaking started
	if (window.parent !== window) {
		window.parent.postMessage({ type: 'matchmaking_start' }, window.location.origin);
	}

	button2PRemote.style.display = "none";
	button4P.style.display = "none";
	buttonMainMenu.style.display = "none";
	buttonTournament.style.display = "none";
	textPong.style.display = "none";
	canvas_container.style.display = "block";
	canvas.style.display = "block";
	online = true;
	Pebble = new Ball(true, true);

	// Check if WebSocket is ready
	if (ws.readyState === WebSocket.OPEN) {
		// Get user data from localStorage
		const userId = localStorage.getItem('id');
		const username = localStorage.getItem('username');

		ws.send(JSON.stringify({ 
			type: "find_match", 
			canvas: { width: canvas.width, height: canvas.height },
			userId: userId ? Number(userId) : null,
			username: username || 'Guest'
		}));
	} else {
		// Send when connection is established
		ws.addEventListener('open', () => {
			const userId = localStorage.getItem('id');
			const username = localStorage.getItem('username');

			ws.send(JSON.stringify({ 
				type: "find_match", 
				canvas: { width: canvas.width, height: canvas.height },
				userId: userId ? Number(userId) : null,
				username: username || 'Guest'
			}));
		}, { once: true });
	}
});

ws.onopen = () => {
	console.log("WebSocket connection established");
};

ws.onmessage = (event) => {
	const message = JSON.parse(event.data);
	if (message.type === "waiting") {
		console.log("Waiting for an opponent...");
	}
	if (message.type === "match_found") {
		// Notify parent that match was found
		if (window.parent !== window) {
			window.parent.postMessage({ type: 'matchmaking_found' }, window.location.origin);
		}

		const playerNames: string = message.opponentName;
		nbrPlayer = 2;
		playerGoals = new Array(nbrPlayer).fill(0);
		playerGoalsRecived = new Array(nbrPlayer).fill(0);
		Pebble.applyState(message.ball);
		startGame();
		myId = message.id;
		players = [
			new Player(myId === 0 ? "You" : playerNames, 0, 12, "vertical"),
			new Player(myId === 1 ? "You" : playerNames, 1, 13, "vertical")
		];
		draw(myId);
	}
	if (message.type === "update_state") {
		const { playerGoals: newPlayerGoals, playerGoalsRecived: newPlayerGoalsRecived } = message;
		playerGoals = newPlayerGoals;
		playerGoalsRecived = newPlayerGoalsRecived;
		draw();
	}
	if (message.type === "opponentMove") {
		if (message.playerId !== myId) {
			players[message.playerId].getPaddle().moveWithKey(message.key);
		}
	}
	if (message.type === "set_ball") {
		Pebble.applyState(message);
	}
	if (message.type === 'goal') {
		playerGoals[0] = message.score[0];
		playerGoals[1] = message.score[1];
		// Reset posizione palla, animazione, ecc.
		Pebble.resetGame(players);
		drawScore(nbrPlayer);
	}
	if (message.type === 'victory') {
		showVictoryScreen(players[message.winner]);
	}
	if (message.type === 'opponent_disconnected') {
		alert(`Opponent disconnected: ${message.playerId}`);
		stopGame();
	}
};

ws.onclose = () => {
  console.log('WebSocket chiuso');
};

ws.onerror = error => {
  console.error('Errore WebSocket:', error);
  
  // Notify parent of error
  if (window.parent !== window) {
    window.parent.postMessage({ 
      type: 'matchmaking_error',
      message: 'Errore di connessione al server di gioco'
    }, window.location.origin);
  }
};

// Listen for messages from parent (e.g., cancel matchmaking)
window.addEventListener('message', (event) => {
  // Verify origin
  if (event.origin !== window.location.origin) return;

  const data = event.data;
  
  if (data.type === 'matchmaking_cancel') {
    // User cancelled matchmaking - close WebSocket and reset UI
    console.log('Matchmaking cancelled by user');
    ws.close();
    
    // Reset UI
    canvas_container.style.display = "none";
    canvas.style.display = "none";
    textPong.style.display = "block";
    button2PRemote.style.display = "inline-block";
    button4P.style.display = "inline-block";
    buttonMainMenu.style.display = "inline-block";
    buttonTournament.style.display = "inline-block";
    online = false;
    stopGame();
  }
});

// Reset goalscore
export function resetGoalscore() {
	for (let i = 0; i < playerGoals.length; i++)
		playerGoals[i] = 0;
	for (let i = 0; i < playerGoalsRecived.length; i++)
		playerGoalsRecived[i] = 0;
}

function resetBracket() {
	quarterfinals = [
		{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: "" },
		{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: "" },
		{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: "" },
		{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: "" }
	];
	semifinals = [
		{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: "" },
		{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: "" }
	];

	final = { player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: "" };
}

function showPlayerName(numberPlayers: number, gameType: 'local' | 'tournament') {
	playerInputsContainer.innerHTML = '';
	modalTitle.textContent = gameType === 'local' ? 'Inserisci i nomi dei giocatori' : 'Inserisci i nomi dei partecipanti al torneo';
	for (let i = 1; i < numberPlayers; i++) {
		const laber = document.createElement('label');
		laber.style.display = 'block';
		laber.style.marginTop = '10px';
		laber.textContent = `Player Name ${i}: `;
		const input = document.createElement('input');
		input.type = 'text';
		input.placeholder = `Player Name ${i + 1}`;
		input.id = `playerNameInput${i}`;
		input.style.display = 'block';
		input.style.margin = '10px auto';
		playerInputsContainer.appendChild(laber);
		playerInputsContainer.appendChild(input);
		playerInputsContainer.appendChild(document.createElement('br'));
	}
	playerNamesModal.style.display = 'block';
}

export function advanceWinner(winner: Player) {
	if (currentRound === "quarterfinals") {
		quarterfinals[currentMatchIndex].matchWinner = winner;
		quarterfinals[currentMatchIndex].users_goal = playerGoals;
		quarterfinals[currentMatchIndex].users_goal_recived = playerGoalsRecived;
		const semiIdx = Math.floor(currentMatchIndex / 2);
		if (currentMatchIndex % 2 === 0) {
			semifinals[semiIdx].player1 = winner;
		} else {
			semifinals[semiIdx].player2 = winner;
		}
		currentMatchIndex++;
		if (currentMatchIndex >= 4) {
			currentRound = "semifinals";
			currentMatchIndex = 0;
		}
	}
	else if (currentRound === "semifinals") {
		semifinals[currentMatchIndex].matchWinner = winner;
		semifinals[currentMatchIndex].users_goal = playerGoals;
		semifinals[currentMatchIndex].users_goal_recived = playerGoalsRecived;
		if (currentMatchIndex === 0) {
			final.player1 = winner;
		} else {
			final.player2 = winner;
		}
		currentMatchIndex++;
		if (currentMatchIndex >= 2) {
			currentRound = "final";
			currentMatchIndex = 0;
		}
	}
	else if (currentRound === "final") {
		final.matchWinner = winner;
		final.users_goal = playerGoals;
		final.users_goal_recived = playerGoalsRecived;
		currentRound = "finished";
		renderBracket();
		alert(`Tournament Winner: ${winner.getNameTag()}`);
		buttonPlayGame.style.display = "none";
		return;
	}
	renderBracket();
	buttonPlayGame.disabled = false;
	buttonPlayGame.style.display = "inline-block";
	Tournament = true;
}

export function showMenu(winner: Player) {

	if (animationFrameId) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}
	resetCanvas();
	stopGame();
	if (Tournament == true) {
		Tournament = false;
		canvas_container.style.display = "none";
		advanceWinner(winner);
		if (currentRound === "finished") {
			for (const player of players)
				player.getPaddle().stopBotPolling();
			textPong.style.display = "block";
			bracketContainer.style.display = "none";
			buttonLocalPlay.style.display = "none";
			buttonRemotePlay.style.display = "none";
			sendTournamentData();
		}
	}
	else {
	   	for (const player of players)
			player.getPaddle().stopBotPolling();
		canvas.style.display = "none";
		textPong.style.display = "block";
		buttonPlayGame.style.display = "none";
		bracketContainer.style.display = "none";
		canvas_container.style.display = "none";
		buttonRemotePlay.style.display = 'inline-block';
		buttonLocalPlay.style.display = 'inline-block';
		sendMatchData();
	}
}

function draw(myId?: number) {
	if (!gameRunning)
		return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawMiddleLine();
	if (nbrPlayer == 4)
		drawCornerWalls();
	if (!online) {
		Pebble.moveBall(players);
		Pebble.drawBall();
	}
	else {
		Pebble.moveBallOnline(players);
		Pebble.drawBall();
	}
	for (const player of players) {
		player.getPaddle().movePaddles(myId);
		player.getPaddle().drawPaddles();
	}
	drawScore(nbrPlayer);
	animationFrameId = requestAnimationFrame(() => draw(myId));
}

function drawTournament() {
	if (!gameRunning) 
		return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawMiddleLine();
	Pebble.moveBall(players);
	Pebble.drawBall();
	for (const player of players) {
		player.getPaddle().movePaddles();
		player.getPaddle().drawPaddles();
	}
	drawScore(nbrPlayer);
	animationFrameId = requestAnimationFrame(drawTournament);
}

function startMatch(player1: Player, player2: Player) {
	players.forEach(player => player.getPaddle().reset());
	alert(`Starting match: ${player1.getNameTag()} vs ${player2.getNameTag()}`);
	canvas_container.style.display = "block";
	nbrPlayer = 2;
	Pebble = new Ball();
	playerGoals = new Array(nbrPlayer).fill(0);
	playerGoalsRecived = new Array(nbrPlayer).fill(0);
	players = [clonePlayer(player1, 0), clonePlayer(player2, 1)];
	startGame();
	drawTournament();
}

function playCurrentMatch() {
	if (currentRound === "quarterfinals") {
		match = quarterfinals[currentMatchIndex];
	}
	else if (currentRound === "semifinals") {
		match = semifinals[currentMatchIndex];
	}
	else if (currentRound === "final") {
		match = final;
	}

	if (match.player1 && match.player2) {
		startMatch(match.player1, match.player2);
	}
}

startGameButton.addEventListener('click', () => {
	playerNamesModal.style.display = 'none';
	textPong.style.display = "none";
	if (!Tournament) {
		canvas_container.style.display = "block";
		canvas.style.display = "block";
		players.push(new Player(username, 0, userId, "vertical"));
		for (let i = 1; i < nbrPlayer; i++) {
			const input = document.getElementById(`playerNameInput${i}`) as HTMLInputElement;
			const playerName = input.value.trim() || `Player${i + 1}`;
			if (i === 1) {
				players.push(new Player(playerName, i, 0, "vertical"));
			} else {
				players.push(new Player(playerName, i, 0, "horizontal"));
			}
		}
		playerGoals = new Array(nbrPlayer).fill(0);
		playerGoalsRecived = new Array(nbrPlayer).fill(0);
		canvas_container.style.display = "block";
		Pebble = new Ball();
		startGame();
		draw();
	}
});

cancelButton.addEventListener('click', () => {
	playerNamesModal.style.display = 'none';
	buttonMainMenu.click();
});

buttonLocalPlay.addEventListener("click", () => {
	buttonLocalPlay.style.display = "none";
	buttonRemotePlay.style.display = "none";
	button2PLocal.style.display = "inline-block";
	button4P.style.display = "inline-block";
	buttonAi.style.display = "inline-block";
	buttonTournament.style.display = "inline-block";
	buttonMainMenu.style.display = "inline-block";
});

buttonRemotePlay.addEventListener("click", () => {
	buttonLocalPlay.style.display = "none";
	buttonRemotePlay.style.display = "none";
	button2PRemote.style.display = "inline-block";
	buttonMainMenu.style.display = "inline-block";
});

buttonMainMenu.addEventListener("click", () => {
	buttonLocalPlay.style.display = "inline-block";
	buttonRemotePlay.style.display = "inline-block";
	button2PLocal.style.display = "none";
	button4P.style.display = "none";
	buttonAi.style.display = "none";
	buttonTournament.style.display = "none";
	buttonMainMenu.style.display = "none";
});

button2PLocal.addEventListener("click", () => {
	button2PLocal.style.display = "none";
	button2PRemote.style.display = "none";
	button4P.style.display = "none";
	buttonAi.style.display = "none";
	buttonMainMenu.style.display = "none";
	buttonTournament.style.display = "none";
	nbrPlayer = parseInt(button2PLocal.value);
	if (isNaN(nbrPlayer))
		nbrPlayer = 2;
	showPlayerName(nbrPlayer, 'local');
});

button4P.addEventListener("click", () => {
	button4P.style.display = "none";
	button2PRemote.style.display = "none";
	buttonMainMenu.style.display = "none";
	buttonTournament.style.display = "none";
	nbrPlayer = parseInt(button4P.value);
	if (isNaN(nbrPlayer))
		nbrPlayer = 4;
	canvas.height = canvas.width = 800;
	showPlayerName(nbrPlayer, 'local');
});

buttonAi.addEventListener("click", () => {
	buttonAi.style.display = "none";
	buttonMainMenu.style.display = "none";
	button2PLocal.style.display = "none";
	button2PRemote.style.display = "none";
	button4P.style.display = "none";
	buttonTournament.style.display = "none";
	textPong.style.display = "none";
	canvas_container.style.display = "block";
	canvas.style.display = "block";
	nbrPlayer = parseInt(buttonAi.value);
	if (isNaN(nbrPlayer))
		nbrPlayer = 1;
	playerGoals = new Array(2).fill(0);
	playerGoalsRecived = new Array(2).fill(0);
	Pebble = new Ball();
	startGame();
	players = [];
	players.push(new Player(username, 0, userId, "vertical"));
	players.push(new Player("AI", 1, 13, "vertical"));

	players[1].getPaddle().startBotPolling();
	draw();
});

function waitForStartButton(): Promise<number> {
	return new Promise((resolve) => {
		startTournamentButton.onclick = () => {
			const num = parseInt(buttonNbrPlayer.value);
			resolve(num);
		};
	});
}

function waitForPlayerNames(): Promise<void> {
    return new Promise((resolve) => {
        const btn = document.getElementById("startGameButton")!;
        const modal = document.getElementById("playerName")!;

        const handler = () => {
            btn.removeEventListener("click", handler);
            modal.style.display = "none";
            resolve();
        };

        btn.addEventListener("click", handler);
    });
}


buttonTournament.addEventListener("click", async () => {
	Tournament = true;
	resetBracket();
	buttonTournament.style.display = "none";
	button2PLocal.style.display = "none";
	button2PRemote.style.display = "none";
	button4P.style.display = "none";
	buttonAi.style.display = "none";
	buttonMainMenu.style.display = "none";
	textPong.style.display = "none";
	startTournamentButton.style.display = "inline-block";
	buttonNbrPlayer.style.display = "inline-block";
	TournamentID= 1234;
	nbrPlayer = await waitForStartButton();
	if (isNaN(nbrPlayer) || nbrPlayer <= 0) {
		console.error("Invalid player count:", buttonNbrPlayer.value);
		return;
	}
	showPlayerName(nbrPlayer, 'tournament');
	await waitForPlayerNames();
	console.log(">>> after waitForPlayerNames, reading inputs... nbrPlayer =", nbrPlayer);

	// debug: logga tutti gli input trovati
	for (let i = 1; i < nbrPlayer; i++) {
	  const input = document.getElementById(`playerNameInput${i}`) as HTMLInputElement | null;
	  console.log(`input #${i}:`, input, input?.value);
	}
	players.push(new Player(username, 0, userId, "vertical"));
	for (let i = 1; i < nbrPlayer; i++) {
		const input = document.getElementById(`playerNameInput${i}`) as HTMLInputElement;
		const playerName = input.value.trim() || `Player${i + 1}`;
		if (i % 2 === 0) {
			players.push(new Player(playerName, 0, 0, "vertical"));
		} else {
			players.push(new Player(playerName, 1, 0, "vertical"));
		}
	}
	countPlayers = nbrPlayer;
	playerGoals = new Array(nbrPlayer).fill(0);
	playerGoalsRecived = new Array(nbrPlayer).fill(0);
	console.log(">>> players array:", players);
	if (nbrPlayer == 8) {
		quarterfinals = [];
		currentRound = "quarterfinals";
		for (let i = 0; i < nbrPlayer / 2; i++) {
			quarterfinals.push({
				player1: players[2 * i],
				player2: players[2 * i + 1],
				matchWinner: null,
				users_goal: [0, 0],
				users_goal_recived: [0, 0],
				round: ""
			});
		}
		semifinals = [
			{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: "" },
			{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: "" }
		];
	}
	else if (nbrPlayer == 4) {
		currentRound = "semifinals";
		semifinals = [];
		for (let i = 0; i < nbrPlayer / 2; i++) {
			semifinals.push({
				player1: players[2 * i],
				player2: players[2 * i + 1],
				matchWinner: null,
				users_goal: [0, 0],
				users_goal_recived: [0, 0],
				round: ""
			});
		}
	}

	final = { player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0], round: ""};
	currentMatchIndex = 0;
	// Show bracket
	const bracketDiv = document.getElementById("bracket-container");
	if (bracketDiv) {
		bracketDiv.innerHTML = generateBracket(players, nbrPlayer);
		bracketDiv.style.display = "block";
	}
	startTournamentButton.style.display = "none";
	buttonNbrPlayer.style.display = "none";
	canvas_container.style.display = "none";
	renderBracket();
	if (!(currentRound === "final" && final.matchWinner)) {
		buttonPlayGame.disabled = false;
		buttonPlayGame.style.display = "inline-block";
	}
	else {
		buttonPlayGame.style.display = "none";
	}

});

buttonPlayGame.addEventListener("click", () => {
	playCurrentMatch();
	buttonPlayGame.disabled = true;
	buttonPlayGame.style.display = "none";
	bracketContainer.style.display = "none";
});
