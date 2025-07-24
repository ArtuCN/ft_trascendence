import { gameRunning, stopGame, startGame, canvas, ctx, canvas_container, cornerWallSize, cornerWallThickness, bracketContainer } from "./typescriptFile/variables.js";
import { Player } from "./typescriptFile/classPlayer.js";
import { Ball, drawScore } from "./typescriptFile/classBall.js";


const buttonTournament = document.getElementById("Tournament") as HTMLButtonElement;
const buttonPlayGame = document.getElementById("PlayGame") as HTMLButtonElement;
const buttonNbrPlayer = document.getElementById("nbrPlayer") as HTMLSelectElement;
const startTournamentButton = document.getElementById("StartTournament") as HTMLButtonElement;

export let nbrPlayer: number = 0;
let countPlayers: number = 0;
export let playerGoals: number[] = [0, 0];
export let Pebble: Ball = new Ball();
let players: Player[] = [];
type BracketMatch = {
	player1: Player | null;
	player2: Player | null;
	matchWinner: Player | null;
};

export let match: BracketMatch;

let quarterfinals: BracketMatch[] = [
    { player1: null, player2: null, matchWinner: null },
	{ player1: null, player2: null, matchWinner: null },
	{ player1: null, player2: null, matchWinner: null },
	{ player1: null, player2: null, matchWinner: null }
];
export let semifinals: BracketMatch[] = [
	{ player1: null, player2: null, matchWinner: null },
	{ player1: null, player2: null, matchWinner: null }
];

let final: BracketMatch = { player1: null, player2: null, matchWinner: null };

let currentRound = "quarterfinals";
let currentMatchIndex = 0;
let animationFrameId: number | null = null;

function resetBracket() {
    quarterfinals = [
        { player1: null, player2: null, matchWinner: null },
    	{ player1: null, player2: null, matchWinner: null },
    	{ player1: null, player2: null, matchWinner: null },
    	{ player1: null, player2: null, matchWinner: null }
    ];
    semifinals = [
    	{ player1: null, player2: null, matchWinner: null },
    	{ player1: null, player2: null, matchWinner: null }
    ];

    final = { player1: null, player2: null, matchWinner: null };
}

function sendTournamentData() {
    fetch("http://localhost/API", {
        method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ quarterfinals, semifinals, final })
    })
}

export function showMenu(winner: Player) {
	if (animationFrameId) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}
    if (currentRound === "final") {
        players = [];
        canvas_container.style.display = "none";
        bracketContainer.style.display = "none";
        buttonTournament.style.display = "inline-block";
        Pebble = new Ball();
        resetGoalscore();
        players = [];
        // sendData();
        resetBracket();
        stopGame();
    }
    else {
        canvas_container.style.display = "none";
        advanceWinner(winner);
    }
}

export function resetGoalscore() {
	playerGoals = [0, 0];
}

function generateBracket(players: Player[]): string {

    let html = "<h2>Tournament Bracket</h2>";
    html += "<div style='display:flex; flex-direction:column; align-items:flex-start;'>";
    html += "<strong>Quarterfinals:</strong><br>";
    if (nbrPlayer == 8) {
        for (let i = 0; i < 4; i++) {
            html += `Match ${i+1}: ${players[2*i].getNameTag()} vs ${players[2*i+1].getNameTag()}<br>`;
        }
    }
    else if (nbrPlayer == 4) {
        for (let i = 0; i < 2; i++) {
            html += `Match ${i+1}: ${players[2*i].getNameTag()} vs ${players[2*i+1].getNameTag()}<br>`;
        }
    }
    html += "<br><strong>Semifinals:</strong><br>";
    html += "Winner Match 1 vs Winner Match 2<br>";
    html += "Winner Match 3 vs Winner Match 4<br>";
    html += "<br><strong>Final:</strong><br>";
    html += "Winner SF1 vs Winner SF2<br>";
    html += "</div>";
    return html;
}

function renderBracket() {
    let html = "<h2>Tournament Bracket</h2><div style='display:flex; flex-direction:column; align-items:flex-start;'>";
    if (countPlayers == 8) {
        html += "<strong>Quarterfinals:</strong><br>";
        quarterfinals.forEach((m, i) => {
            html += `Match ${i+1}: ${m.player1?.getNameTag()} vs ${m.player2?.getNameTag()}`
            if (m.matchWinner) html += ` — <b>Winner: ${m.matchWinner.getNameTag()}</b>`;
            if (currentRound === "quarterfinals" && currentMatchIndex === i) html += " <span style='color:red'>(Playing)</span>";
            html += "<br>";
        });
    }
    html += "<br><strong>Semifinals:</strong><br>";
    semifinals.forEach((m, i) => {
        html += `Semifinal ${i+1}: ${m.player1?.getNameTag() || "TBD"} vs ${m.player2?.getNameTag() || "TBD"}`;
        if (m.matchWinner) html += ` — <b>Winner: ${m.matchWinner.getNameTag()}</b>`;
        if (currentRound === "semifinals" && currentMatchIndex === i) html += " <span style='color:red'>(Playing)</span>";
        html += "<br>";
    });
    html += "<br><strong>Final:</strong><br>";
    html += `${final.player1?.getNameTag() || "TBD"} vs ${final.player2?.getNameTag() || "TBD"}`;
    if (final.matchWinner) html += ` — <b>Winner: ${final.matchWinner.getNameTag()}</b>`;
    if (currentRound === "final") html += " <span style='color:red'>(Playing)</span>";
    html += "<br></div>";
    const bracketDiv = document.getElementById("bracket-container");
    if (bracketDiv) {
        bracketDiv.innerHTML = html;
        bracketDiv.style.display = "block";
    }
    buttonPlayGame.style.display = "inline";
}

function drawMiddleLine() {
	const dashedLineLength = 20;
	const gapLength = 10;
	const x = canvas.width / 2;
	const y = canvas.height / 2;

	ctx.strokeStyle = "white";
	ctx.lineWidth = 4;

	for (let yPos = 0; yPos < canvas.height; yPos += dashedLineLength + gapLength) {
		ctx.beginPath();
		ctx.moveTo(x, yPos);
		ctx.lineTo(x, yPos + dashedLineLength);
		ctx.stroke();
	}
}

function drawCornerWalls() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, cornerWallSize, cornerWallSize);
	ctx.fillRect(0, canvas.height - cornerWallSize, cornerWallSize, cornerWallSize);
	ctx.fillRect(canvas.width - cornerWallSize, 0, cornerWallSize, cornerWallSize);
	ctx.fillRect(canvas.width - cornerWallSize, canvas.height - cornerWallSize, cornerWallSize, cornerWallSize);
}

function draw() {
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
	animationFrameId = requestAnimationFrame(draw);
}

function clonePlayer(original: Player, newID: number): Player {
	return new Player(original.getNameTag(), newID, original.getPaddle().getOrientation());
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
	draw();
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

function waitForStartButton(): Promise<number> {
    return new Promise((resolve) => {
        startTournamentButton.onclick = () => {
            const num = parseInt(buttonNbrPlayer.value);
            resolve(num);
        };
    });
}


buttonTournament.addEventListener("click", async () => {
	buttonTournament.style.display = "none";
    startTournamentButton.style.display = "inline-block";
    buttonNbrPlayer.style.display = "inline-block";
    nbrPlayer = await waitForStartButton();
    if (isNaN(nbrPlayer) || nbrPlayer <= 0) {
        console.error("Invalid player count:", buttonNbrPlayer.value);
        return;
    }
    countPlayers = nbrPlayer;
    players = [];
    for (let i = 0; i < nbrPlayer; i++) {
        if (i % 2 == 0) {
            players.push(new Player(`Player ${i + 1}`, 0, "vertical"));
        } else {
            players.push(new Player(`Player ${i + 1}`, 1, "vertical"));
        }
    }
    if (nbrPlayer == 8) {
        quarterfinals = [];
        currentRound = "quarterfinals";
        for (let i = 0; i < nbrPlayer / 2; i++) {
            quarterfinals.push({
                player1: players[2 * i],
                player2: players[2 * i + 1],
                matchWinner: null
            });
        }
        semifinals = [
            { player1: null, player2: null, matchWinner: null },
            { player1: null, player2: null, matchWinner: null }
        ];
    }
    else if (nbrPlayer == 4) {
        currentRound = "semifinals";
        semifinals = [];
        for (let i = 0; i < nbrPlayer / 2; i++) {
            semifinals.push({
                player1: players[2 * i],
                player2: players[2 * i + 1],
                matchWinner: null
            });
        }
    }

	final = { player1: null, player2: null, matchWinner: null };
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
