import { gameRunning, stopGame, startGame, canvas, ctx, canvas_container, cornerWallSize, cornerWallThickness, bracketContainer } from "./typescriptFile/variables.js";
import { Player } from "./typescriptFile/classPlayer.js";
import { Ball, drawScore } from "./typescriptFile/classBall.js";
import { showMenu, players, nbrPlayer, buttonPlayGame, quarterfinals, semifinals, final, currentMatchIndex, currentRound, countPlayers, playerGoals, playerGoalsRecived, TournamentID } from "./script.js";

export function resetCanvas() {
    canvas.width = 900;
    canvas.height = 600;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function generateBracket(players: Player[]): string {

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

export function renderBracket() {
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

export function drawMiddleLine() {
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

export function drawCornerWalls() {
	ctx.fillStyle = "gray";
	ctx.fillRect(0, 0, cornerWallSize, cornerWallSize);
	ctx.fillRect(0, canvas.height - cornerWallSize, cornerWallSize, cornerWallSize);
	ctx.fillRect(canvas.width - cornerWallSize, 0, cornerWallSize, cornerWallSize);
	ctx.fillRect(canvas.width - cornerWallSize, canvas.height - cornerWallSize, cornerWallSize, cornerWallSize);
}

export function clonePlayer(original: Player, newID: number): Player {
    return new Player(original.getNameTag(), newID, original.getUserID(), original.getPaddle().getOrientation());
}

export async function sendData(ball_y: number, paddle_y: number): Promise<string> {

	let response = await fetch("/ai/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ ball_y, paddle_y })
	});
	if (!response.ok) {
		return "";
	}
	let data = await response.json();
	if (data.error) {
		return "";
	}
	return data.key;
}

export function sendTournamentData() {
    fetch("/api/tournament", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ quarterfinals, semifinals, final })
    })
}

export function sendMatchData() {
    let players_id: number[] = [];
    for (let i = 0; i < players.length; i++) {
        players_id[i] = players[i].getUserID();
        console.log(`players_id: `, players_id[i]);

    }
    for (let i = 0; i < playerGoals.length; i++) {
        console.log(`playerGoals: `, playerGoals[i]);
    }
    for (let i = 0; i < playerGoalsRecived.length; i++) {
        console.log(`playerGoalsRecived: `, playerGoalsRecived[i]);
    }
    let body = {
        id_tournament: TournamentID,
        users_id: players_id,
        users_goal_scored: playerGoals,
        users_goal_recived: playerGoalsRecived
    }
    console.log(`DATA MATCH: `, body.users_id);
    console.log(`DATA MATCH: `, body.users_goal_scored);
    console.log(`DATA MATCH: `, body.users_goal_recived);
    let response = fetch("/api/match", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
    let data = fetch("/api/users", {
        method: "GET",
    })
    console.log(`DATA MATCH DATA: `, data);
    console.log(`DATA MATCH SEND: `, body);
}

export function showVictoryScreen(winner: Player) {

    canvas_container.style.display = "block";

    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`🏆` + winner.getNameTag() + ` Wins 🏆`, canvas.width / 2, canvas.height / 2);

    const btnBack = document.getElementById("btnBackToMenu") as HTMLButtonElement;
    btnBack.style.display = "inline-block";
    btnBack.style.position = "absolute";
    btnBack.style.left = "50%";
    btnBack.style.top = "60%";
    btnBack.style.transform = "translate(-50%, -50%)";

    btnBack.onclick = () => {
        btnBack.style.display = "none";
        canvas_container.style.display = "none";
        showMenu(winner); // or showMenu(null) if you want to reset
    };
}
