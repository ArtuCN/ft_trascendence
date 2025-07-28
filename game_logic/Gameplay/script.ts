import { gameRunning, stopGame, startGame, canvas, ctx, canvas_container, cornerWallSize, cornerWallThickness, bracketContainer } from "./typescriptFile/variables.js";
import { Player } from "./typescriptFile/classPlayer.js";
import { Ball, drawScore } from "./typescriptFile/classBall.js";
import { resetCanvas, generateBracket, renderBracket, drawCornerWalls, drawMiddleLine, clonePlayer, sendMatchData, sendTournamentData } from "./utilities.js";


export const button2P = document.getElementById("Play2P") as HTMLButtonElement;
export const button4P = document.getElementById("Play4P") as HTMLButtonElement;
export const buttonAi = document.getElementById("PlayAI") as HTMLButtonElement;
export const textPong = document.getElementById("PongGame") as HTMLHeadingElement;
export const buttonTournament = document.getElementById("Tournament") as HTMLButtonElement;
export const buttonPlayGame = document.getElementById("PlayGame") as HTMLButtonElement;
export const buttonNbrPlayer = document.getElementById("nbrPlayer") as HTMLSelectElement;
export const startTournamentButton = document.getElementById("StartTournament") as HTMLButtonElement;

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
    goalP1: number;
    goalP2: number;
};

export let match: BracketMatch;

export let quarterfinals: BracketMatch[] = [
    { player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 },
	{ player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 },
	{ player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 },
	{ player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 }
];
export let semifinals: BracketMatch[] = [
	{ player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 },
	{ player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 }
];

export let final: BracketMatch = { player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 };

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
        { player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 },
    	{ player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 },
    	{ player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 },
    	{ player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 }
    ];
    semifinals = [
    	{ player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 },
    	{ player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 }
    ];

    final = { player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 };
}

function drawTournament() {
    if (!gameRunning) return;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawMiddleLine();
	drawCornerWalls();
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
	resetGoalscore();
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
    else {
        match = final;
    }

	if (match.player1 && match.player2) {
		startMatch(match.player1, match.player2);
	}
}

export function advanceWinner(winner: Player) {
    if (currentRound === "quarterfinals") {
        quarterfinals[currentMatchIndex].matchWinner = winner;
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
        renderBracket();
        alert(`Tournament Winner: ${winner.getNameTag()}`);
        buttonPlayGame.style.display = "none";
        return;
    }
    renderBracket();
    buttonPlayGame.disabled = false;
    buttonPlayGame.style.display = "inline-block";
}

export function showMenu(winner: Player) {
	if (animationFrameId) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}
    console.log(`playerGoals: `, playerGoals);
    resetCanvas();
    stopGame();
    if (Tournament == true) {
        Tournament = false;
        if (currentRound === "final") {
            players = [];
            canvas_container.style.display = "none";
            bracketContainer.style.display = "none";
            buttonTournament.style.display = "inline-block";
            button2P.style.display = "inline-block";
            button4P.style.display = "inline-block";
            buttonAi.style.display = "inline-block";
            textPong.style.display = "block";
            Pebble = new Ball();
            //            sendData();
            resetBracket();
            players = [];
        }
        else {
            canvas_container.style.display = "none";
            advanceWinner(winner);
        }    
    }
    else {
       	for (const player of players) {
            player.getPaddle().stopBotPolling();
        }
        button2P.style.display = "inline-block";
        button4P.style.display = "inline-block";
        buttonAi.style.display = "inline-block";
        buttonTournament.style.display = "inline-block";
        buttonPlayGame.style.display = "none";
        bracketContainer.style.display = "none";
        textPong.style.display = "block";
        canvas_container.style.display = "none";
        canvas.style.display = "none";
        sendMatchData();
        players = [];
    }
}

// commento per push
function draw() {
    if (!gameRunning) return;

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

button2P.addEventListener("click", () => {
    button2P.style.display = "none";
    button4P.style.display = "none";
    buttonAi.style.display = "none";
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
	buttonTournament.style.display = "none";
    button2P.style.display = "none";
    button4P.style.display = "none";
    buttonAi.style.display = "none";
    textPong.style.display = "none";
    startTournamentButton.style.display = "inline-block";
    buttonNbrPlayer.style.display = "inline-block";
    TournamentID= 1234; // Example ID, replace with actual logic if needed
    nbrPlayer = await waitForStartButton();
    if (isNaN(nbrPlayer) || nbrPlayer <= 0) {
        console.error("Invalid player count:", buttonNbrPlayer.value);
        return;
    }
    countPlayers = nbrPlayer;
    players = [];
    for (let i = 0; i < nbrPlayer; i++) {
        if (i % 2 == 0) {
            players.push(new Player(`Player ${i + 1}`, 0, 12 + i, "vertical"));
        } else {
            players.push(new Player(`Player ${i + 1}`, 1, 13 + i, "vertical"));
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
                goalP1: 0,
                goalP2: 0
            });
        }
        semifinals = [
            { player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 },
            { player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 }
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
                goalP1: 0,
                goalP2: 0
            });
        }
    }

	final = { player1: null, player2: null, matchWinner: null, goalP1: 0, goalP2: 0 };
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
