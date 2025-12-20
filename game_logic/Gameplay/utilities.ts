import { canvas, ctx, canvas_container, cornerWallSize } from "./typescriptFile/variables.js";
import { Player } from "./typescriptFile/classPlayer.js";
import { BracketMatch, showMenu, players, nbrPlayer, buttonPlayGame, quarterfinals, semifinals, final, currentMatchIndex, currentRound, countPlayers, playerGoals, playerGoalsRecived, TournamentID } from "./script.js";

export function resetCanvas() {
    canvas.width = 900;
    canvas.height = 600;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function generateBracket(players: Player[], nbrPlayer: number): string {
  function renderMatch(label: string, p1: Player | null, p2: Player | null): string {
    const name1 = p1 ? p1.getNameTag() : "TBD";
    const name2 = p2 ? p2.getNameTag() : "TBD";
    return `
      <div class="match-wrapper">
        <div class="match-label">${label}</div>
        <div class="match">
          <div class="player">${name1}</div>
          <div class="vs">vs</div>
          <div class="player">${name2}</div>
        </div>
      </div>
    `;
  }
  let html = "";
  if (nbrPlayer == 8) {

    html = `
      <div class="bracket">
        <!-- Left Side -->
        <div class="column">
          <div class="round-title">Quarterfinals</div>
          ${renderMatch("QF1", players[0], players[1])}
          ${renderMatch("QF2", players[2], players[3])}
        </div>
        <div class="column">
          <div class="round-title">Semifinal</div>
          ${renderMatch("SF1", null, null)}
        </div>
  
        <!-- Final -->
        <div class="column center">
          <div class="round-title">Final</div>
          ${renderMatch("Final", null, null)}
        </div>
  
        <!-- Right Side -->
        <div class="column">
          <div class="round-title">Semifinal</div>
          ${renderMatch("SF2", null, null)}
        </div>
        <div class="column">
          <div class="round-title">Quarterfinals</div>
          ${renderMatch("QF3", players[4], players[5])}
          ${renderMatch("QF4", players[6], players[7])}
        </div>
      </div>
    `;
  }
  else if (nbrPlayer == 4) {
    html = `        
        <div class="column">
          <div class="round-title">Semifinal</div>
          ${renderMatch("SF1", players[0], players[1])}
        </div>
  
        <!-- Final -->
        <div class="column center">
          <div class="round-title">Final</div>
          ${renderMatch("Final", null, null)}
        </div>
  
        <!-- Right Side -->
        <div class="column">
          <div class="round-title">Semifinal</div>
          ${renderMatch("SF2", players[2], players[3])}
        </div>`
  }
  return html;
}


export function renderBracket() {
  function renderMatch(match: BracketMatch, label: string, index: number, roundName: string): string {
    const p1 = match.player1?.getNameTag() || "TBD";
    const p2 = match.player2?.getNameTag() || "TBD";
    const winner = match.matchWinner ? `<div class="winner">Winner: ${match.matchWinner.getNameTag()}</div>` : "";
    const playing = (currentRound === roundName && currentMatchIndex === index)
      ? `<div class="playing-indicator">(Playing)</div>` : "";

    return `
      <div class="match-wrapper">
        <div class="match-label">${label}</div>
        <div class="match">
          <div class="player">${p1}</div>
          <div class="vs">vs</div>
          <div class="player">${p2}</div>
          ${winner}
          ${playing}
        </div>
      </div>
    `;
  }

  let html = `<h2>Tournament Name</h2><div class="bracket">`;

  if (countPlayers === 8) {
    // Left side (QF1, QF2 → SF1)
    html += `<div class="column">
      <div class="round-title">Quarterfinals</div>
      ${renderMatch(quarterfinals[0], "QF1", 0, "quarterfinals")}
      ${renderMatch(quarterfinals[1], "QF2", 1, "quarterfinals")}
    </div>
    <div class="column">
      <div class="round-title">Semifinal</div>
      ${renderMatch(semifinals[0], "SF1", 0, "semifinals")}
    </div>`;

    // Center Final
    html += `<div class="column center">
      <div class="round-title">Final</div>
      ${renderMatch(final, "Final", 0, "final")}
    </div>`;

    // Right side (SF2 ← QF3, QF4)
    html += `<div class="column">
      <div class="round-title">Semifinal</div>
      ${renderMatch(semifinals[1], "SF2", 1, "semifinals")}
    </div>
    <div class="column">
      <div class="round-title">Quarterfinals</div>
      ${renderMatch(quarterfinals[2], "QF3", 2, "quarterfinals")}
      ${renderMatch(quarterfinals[3], "QF4", 3, "quarterfinals")}
    </div>`;
  } else if (countPlayers === 4) {
    html += `<div class="column">
      <div class="round-title">Semifinal</div>
        ${renderMatch(semifinals[0], "SF1", 0, "semifinals")}
      </div>`;

    // Center Final
    html += `
      <div class="column center">
        <div class="round-title">Final</div>
        ${renderMatch(final, "Final", 0, "final")}
      </div>`;

    // Right side (SF2 ← QF3, QF4)
    html += `<div class="column">
      <div class="round-title">Semifinal</div>
      ${renderMatch(semifinals[1], "SF2", 1, "semifinals")}
    </div>`;
  }

  html += `</div>`; // close .bracket

  const bracketDiv = document.getElementById("bracket-container");
  if (bracketDiv) {
    bracketDiv.innerHTML = html;
    bracketDiv.style.display = "block";
  }

  buttonPlayGame.style.display = "inline"; // assumes this button exists
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

export async function sendBotData(ball_y: number, paddle_y: number): Promise<string> {

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

    let body = {
        id_tournament: TournamentID,
        quarterfinals: quarterfinals,
        semifinals: semifinals,
        final: final
    };
    fetch("/api/tournament/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
}

export async function sendMatchData() {

    let players_id: number[] = [];
    for (let i = 0; i < players.length; i++)
        players_id[i] = players[i].getUserID();

    let body = {
        id_tournament: TournamentID || null, // null for non-tournament matches
        users_ids: players[0].getUserID(),
        users_goal_scored: playerGoals[0],
        users_goal_taken: playerGoalsRecived[0]
    };

    console.log("Sending match data:", body);

    try {
        const response = await fetch("/api/match", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to save match stats:", response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log("Match stats saved successfully:", result);
        return result;
    } catch (error) {
        console.error("Error sending match data:", error);
        throw error;
    }
}

export function showVictoryScreen(winner: Player) {

    canvas_container.style.display = "block";

    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    console.log(winner.getNameTag());
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
