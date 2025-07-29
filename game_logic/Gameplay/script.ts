import { gameRunning, stopGame, startGame, canvas, ctx, canvas_container, bracketContainer } from "./typescriptFile/variables.js";
import { Player } from "./typescriptFile/classPlayer.js";
import { Ball, drawScore } from "./typescriptFile/classBall.js";
import { resetCanvas, generateBracket, renderBracket, drawCornerWalls, drawMiddleLine, clonePlayer, sendMatchData, sendTournamentData } from "./utilities.js";

const buttonLocalPlay = document.getElementById("LocalPlay") as HTMLButtonElement;
const buttonRemotePlay = document.getElementById("RemotePlay") as HTMLButtonElement;
const button2P = document.getElementById("Play2P") as HTMLButtonElement;
const button4P = document.getElementById("Play4P") as HTMLButtonElement;
const buttonAi = document.getElementById("PlayAI") as HTMLButtonElement;
const textPong = document.getElementById("PongGame") as HTMLHeadingElement;
const buttonTournament = document.getElementById("Tournament") as HTMLButtonElement;
const buttonNbrPlayer = document.getElementById("nbrPlayer") as HTMLSelectElement;
const buttonMainMenu = document.getElementById("returnMenu") as HTMLButtonElement;
const startTournamentButton = document.getElementById("StartTournament") as HTMLButtonElement;
export const buttonPlayGame = document.getElementById("PlayGame") as HTMLButtonElement;

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
};

export let match: BracketMatch;

export let quarterfinals: BracketMatch[] = [
	{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] },
	{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] },
	{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] },
	{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] }
];
export let semifinals: BracketMatch[] = [
	{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] },
	{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] }
];

export let final: BracketMatch = { player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] };

export let currentRound = "quarterfinals";
export let currentMatchIndex = 0;
export let animationFrameId: number | null = null;

// Reset goalscore
export function resetGoalscore() {
	for (let i = 0; i < playerGoals.length; i++)
		playerGoals[i] = 0;
	for (let i = 0; i < playerGoalsRecived.length; i++)
		playerGoalsRecived[i] = 0;
}

function resetBracket() {
	quarterfinals = [
		{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] },
		{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] },
		{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] },
		{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] }
	];
	semifinals = [
		{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] },
		{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] }
	];

	final = { player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] };
}

export function advanceWinner(winner: Player) {
	console.log(`player Goals: `, playerGoals);
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
			button2P.style.display = "inline-block";
			button4P.style.display = "inline-block";
			buttonAi.style.display = "inline-block";
			buttonTournament.style.display = "inline-block";
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
		button2P.style.display = "inline-block";
		button4P.style.display = "inline-block";
		buttonAi.style.display = "inline-block";
		buttonTournament.style.display = "inline-block";
		sendMatchData();
	}
}

function draw() {
	if (!gameRunning)
		return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawMiddleLine();
	if (nbrPlayer == 4)
		drawCornerWalls();
	Pebble.moveBall(players);
	Pebble.drawBall();
	for (const player of players) {
		player.getPaddle().movePaddles();
		player.getPaddle().drawPaddles();
	}
	drawScore(nbrPlayer);
	animationFrameId = requestAnimationFrame(draw);
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

buttonLocalPlay.addEventListener("click", () => {
	buttonLocalPlay.style.display = "none";
	buttonRemotePlay.style.display = "none";
	button2P.style.display = "inline-block";
	buttonAi.style.display = "inline-block";
	buttonTournament.style.display = "inline-block";
	buttonMainMenu.style.display = "inline-block";
});

buttonRemotePlay.addEventListener("click", () => {
	buttonLocalPlay.style.display = "none";
	buttonRemotePlay.style.display = "none";
	button2P.style.display = "inline-block";
	button4P.style.display = "inline-block";
	buttonTournament.style.display = "inline-block";
	buttonMainMenu.style.display = "inline-block";
});

buttonMainMenu.addEventListener("click", () => {
	buttonLocalPlay.style.display = "inline-block";
	buttonRemotePlay.style.display = "inline-block";
	button2P.style.display = "none";
	button4P.style.display = "none";
	buttonAi.style.display = "none";
	buttonTournament.style.display = "none";
	buttonMainMenu.style.display = "none";
});

button2P.addEventListener("click", () => {
	button2P.style.display = "none";
	button4P.style.display = "none";
	buttonAi.style.display = "none";
	buttonMainMenu.style.display = "none";
	buttonTournament.style.display = "none";
	textPong.style.display = "none";
	canvas_container.style.display = "block";
	canvas.style.display = "block";
	nbrPlayer = parseInt(button2P.value);
	if (isNaN(nbrPlayer))
		nbrPlayer = 2;
	playerGoals = new Array(nbrPlayer).fill(0);
	playerGoalsRecived = new Array(nbrPlayer).fill(0);
	Pebble = new Ball();
	startGame();
	players = [];
	players.push(new Player("Matteo", 0, 12, "vertical"));
	players.push(new Player("Arturo", 1, 13, "vertical"));

	draw();
});

button4P.addEventListener("click", () => {
	button4P.style.display = "none";
	button2P.style.display = "none";
	buttonAi.style.display = "none";
	buttonMainMenu.style.display = "none";
	buttonTournament.style.display = "none";
	textPong.style.display = "none";
	canvas_container.style.display = "block";
	canvas.style.display = "block";
	nbrPlayer = parseInt(button4P.value);
	if (isNaN(nbrPlayer))
		nbrPlayer = 4;
	playerGoals = new Array(nbrPlayer).fill(0);
	playerGoalsRecived = new Array(nbrPlayer).fill(0);
	canvas.height = canvas.width = 800;
	Pebble = new Ball();
	startGame();
	players = [];
	players.push(new Player("Matteo", 0, 12, "vertical"));
	players.push(new Player("Arturo", 1, 13, "vertical"));
	players.push(new Player("Petre", 2, 14, "horizontal"));
	players.push(new Player("Tjaz", 3, 15, "horizontal"));

	draw();
});

buttonAi.addEventListener("click", () => {
	buttonAi.style.display = "none";
	buttonMainMenu.style.display = "none";
	button2P.style.display = "none";
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
	players.push(new Player("Matteo", 0, 12, "vertical"));
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

buttonTournament.addEventListener("click", async () => {
	Tournament = true;
	resetBracket();
	buttonTournament.style.display = "none";
	button2P.style.display = "none";
	button4P.style.display = "none";
	buttonAi.style.display = "none";
	buttonMainMenu.style.display = "none";
	textPong.style.display = "none";
	startTournamentButton.style.display = "inline-block";
	buttonNbrPlayer.style.display = "inline-block";
	TournamentID= 1234; // Example Tournament ID, replace with actual logic to get ID
	nbrPlayer = await waitForStartButton();
	if (isNaN(nbrPlayer) || nbrPlayer <= 0) {
		console.error("Invalid player count:", buttonNbrPlayer.value);
		return;
	}
	countPlayers = nbrPlayer;
	players = [];
	for (let i = 0; i < nbrPlayer; i++) {
		if (i % 2 == 0) {
			players.push(new Player(`Player${i + 1}`, 0, 12 + i, "vertical"));
		} else {
			players.push(new Player(`Player${i + 1}`, 1, 13 + i, "vertical"));
		}
	}
	if (nbrPlayer == 8) {
		quarterfinals = [];
		currentRound = "quarterfinals";
		for (let i = 0; i < nbrPlayer / 2; i++) {
			quarterfinals.push({
				player1: players[2 * i],
				player2: players[2 * i + 1],
				matchWinner: null,
				users_goal: [0, 0],
				users_goal_recived: [0, 0]
			});
		}
		semifinals = [
			{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] },
			{ player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] }
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
				users_goal_recived: [0, 0]
			});
		}
	}

	final = { player1: null, player2: null, matchWinner: null, users_goal: [0, 0], users_goal_recived: [0, 0] };
	currentMatchIndex = 0;
	// Show bracket
	const bracketDiv = document.getElementById("bracket-container");
	if (bracketDiv) {
		bracketDiv.innerHTML = generateBracket(players);
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
