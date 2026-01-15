declare const BABYLON: any;
// import "@babylonjs/materials/grid/gridMaterial";

export const canvas_container = document.getElementById("canvas-container")!;
const buttonLocalPlay3D = document.getElementById("LocalPlay3D") as HTMLButtonElement;
const canvasContainer3D = document.getElementById("canvas-container")!;
const textPong3D = document.getElementById("PongGame") as HTMLHeadingElement;
const button2P3D = document.getElementById("Play2P3D") as HTMLButtonElement;
const buttonAI3D = document.getElementById("PlayAI3D") as HTMLButtonElement;
const button4P3D = document.getElementById("Play4P3D") as HTMLButtonElement;
const buttonMainMenu3D = document.getElementById("returnMenu") as HTMLButtonElement;
const textPong = document.getElementById("PongGame") as HTMLHeadingElement;
const canvas2D = document.getElementById("gameCanvas") as HTMLCanvasElement;
const scoreDiv = document.getElementById("score3d") as HTMLDivElement;
const playerNamesModal3D = document.getElementById("playerName") as HTMLDivElement | null;
const playerInputsContainer3D = document.getElementById("playerInputsContainer") as HTMLDivElement | null;
const startGameButton3D = document.getElementById("startGameButton") as HTMLButtonElement | null;
const cancelButton3D = document.getElementById("cancelButton") as HTMLButtonElement | null;
const modalTitle3D = document.getElementById("modalTitle") as HTMLHeadingElement | null;
const buttonTournament3D = document.getElementById("Tournament") as HTMLButtonElement | null;
const buttonNbrPlayer3D = document.getElementById("nbrPlayer") as HTMLSelectElement | null;
const startTournamentButton3D = document.getElementById("StartTournament") as HTMLButtonElement | null;
const bracketContainer3D = document.getElementById("bracket-container") as HTMLDivElement | null;
const buttonPlayGame3D = document.getElementById("PlayGame") as HTMLButtonElement | null;
const tournamentPlayerCountLabel3D = document.querySelector('label[for="nbrPlayer"]') as HTMLLabelElement | null;

function getCurrentUserId(): number {
    const userId = localStorage.getItem('id');
	return userId ? parseInt(userId) : 0;
}

function getCurrentUsername(): string {
    return localStorage.getItem('username') || 'Guest';
}

let engine: any;
let scene: any;
let camera: any;
let canvas: HTMLCanvasElement;
let gameStarted = false;

let nbrPlayer = 2;
let playerGoals = [0, 0, 0, 0];
let isAIMode = false;
let aiUpdateInterval = 100;

const FIELD_HEIGHT_BASE = 12;
let FIELD_WIDTH_3D = 18;
let FIELD_HEIGHT_3D = FIELD_HEIGHT_BASE;
const FIELD_DEPTH_3D = 0.5;

let ball: any; 
let players: any[] = [];
let cornerCubes: any[] = [];
let localPlayerNames: string[] | null = null;

// particelle ball
let ballParticleSystem: any = null;

const userId = getCurrentUserId();
const username = getCurrentUsername();

const keys: Record<string, boolean> = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

const COLORS = {
    // neon cyberpunk palette inspired by requested hues
    ballDiffuse:   new BABYLON.Color3(0.6078, 0.7922, 0.8471), // #ffffff muted cyan
    ballEmissive:  new BABYLON.Color3(0.0000, 0.7059, 0.8471), // #00B4D8 cyan glow
    paddleDefault: new BABYLON.Color3(0.0000, 0.4627, 0.7137), // #0077B6 primary tone
    paddleRight:   new BABYLON.Color3(0.3922, 0.4235, 1.0000), // #646CFF neon indigo
    paddleTop:     new BABYLON.Color3(1.0000, 0.8196, 0.4000), // #FFD166 vibrant yellow
    paddleBottom:  new BABYLON.Color3(0.9686, 0.4196, 0.1098), // #F76B1C electric orange
    ground:        new BABYLON.Color3(0.0235, 0.1647, 0.2275)  // #FF6EC7 pink accent
};

function createEmptyMatch3D(round: "quarterfinals" | "semifinals" | "final"): TournamentMatch3D {
    return {
        player1: null,
        player2: null,
        matchWinner: null,
        round
    };
}

type TournamentPlayer3D = {
    name: string;
    seed: number;
};

type TournamentMatch3D = {
    player1: TournamentPlayer3D | null;
    player2: TournamentPlayer3D | null;
    matchWinner: TournamentPlayer3D | null;
    round: "quarterfinals" | "semifinals" | "final";
};

type TournamentRound3D = "quarterfinals" | "semifinals" | "final" | "finished";
type WinnerLike = { playerName?: string; getNameTag?: () => string } | null;

let tournamentActive3D = false;
let tournamentPlayers3D: TournamentPlayer3D[] = [];
let tournamentPlayerCount3D = 0;
let quarterfinals3D: TournamentMatch3D[] = [];
let semifinals3D: TournamentMatch3D[] = [];
let final3D: TournamentMatch3D = createEmptyMatch3D("final");
let currentTournamentRound: TournamentRound3D = "quarterfinals";
let currentTournamentMatchIndex = 0;
let tournamentMatchInProgress: { round: TournamentRound3D; index: number } | null = null;
let tournamentId3D: string | null = null;

function resolveWinnerName(winner: WinnerLike): string | null {
    if (!winner) return null;
    if ("playerName" in winner && typeof winner.playerName === "string") {
        return winner.playerName;
    }
    if ("getNameTag" in winner && typeof winner.getNameTag === "function") {
        const nameTag = winner.getNameTag();
        return typeof nameTag === "string" ? nameTag : null;
    }
    return null;
}

function hidePlayerNameModal() {
    if (!playerNamesModal3D || !startGameButton3D || !cancelButton3D || !playerInputsContainer3D) return;
    playerNamesModal3D.style.display = "none";
    startGameButton3D.style.display = "none";
    cancelButton3D.style.display = "none";
    playerInputsContainer3D.innerHTML = "";
}

function showLocalOptionsMenu() {
    buttonLocalPlay3D.style.display = "none";
    button2P3D.style.display = "inline-block";
    buttonAI3D.style.display = "inline-block";
    button4P3D.style.display = "inline-block";
    if (buttonTournament3D) buttonTournament3D.style.display = "inline-block";
    buttonMainMenu3D.style.display = "inline-block";
    hideTournamentSetupControls();
    if (bracketContainer3D) bracketContainer3D.style.display = "none";
    if (buttonPlayGame3D) buttonPlayGame3D.style.display = "none";
}

function enterTournamentSetupMode() {
    resetTournamentState3D();
    hidePlayerNameModal();
    buttonLocalPlay3D.style.display = "none";
    button2P3D.style.display = "none";
    buttonAI3D.style.display = "none";
    button4P3D.style.display = "none";
    if (buttonTournament3D) buttonTournament3D.style.display = "none";
    buttonMainMenu3D.style.display = "inline-block";
    textPong3D.style.display = "none";
    showTournamentSetupControls();
    if (bracketContainer3D) bracketContainer3D.style.display = "none";
    if (buttonPlayGame3D) buttonPlayGame3D.style.display = "none";
}

function hideMenuForMatch() {
    buttonLocalPlay3D.style.display = "none";
    button2P3D.style.display = "none";
    buttonAI3D.style.display = "none";
    button4P3D.style.display = "none";
    buttonMainMenu3D.style.display = "none";
    textPong3D.style.display = "none";
    if (buttonTournament3D) buttonTournament3D.style.display = "none";
    hideTournamentSetupControls();
    if (buttonPlayGame3D) buttonPlayGame3D.style.display = "none";
    if (bracketContainer3D) bracketContainer3D.style.display = "none";
}

type PlayerNameModalOptions = {
    title: string;
    includeSelfName?: boolean;
    onConfirm: (names: string[]) => void;
    onCancel: () => void;
};

function requestPlayerNames(playerCount: number, options: PlayerNameModalOptions) {
    const { title, includeSelfName = true, onConfirm, onCancel } = options;

    if (!playerNamesModal3D || !playerInputsContainer3D || !startGameButton3D || !cancelButton3D || !modalTitle3D) {
        const fallback = Array.from({length: playerCount}, (_, idx) => {
            if (includeSelfName && idx === 0) return username || `Player ${idx + 1}`;
            return `Player ${idx + 1}`;
        });
        onConfirm(fallback);
        return;
    }

    modalTitle3D.textContent = title;
    playerInputsContainer3D.innerHTML = "";

    const startIdx = includeSelfName ? 1 : 0;
    for (let i = startIdx; i < playerCount; i++) {
        const label = document.createElement("label");
        label.style.display = "block";
        label.style.marginTop = "10px";
        label.textContent = `Player Name ${i + 1}:`;

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Player Name ${i + 1}`;
        input.id = `playerNameInput${i}`;
        input.style.display = "block";
        input.style.margin = "10px auto";

        playerInputsContainer3D.appendChild(label);
        playerInputsContainer3D.appendChild(input);
    }

    const gatherNames = () => {
        const names: string[] = [];
        for (let i = 0; i < playerCount; i++) {
            if (includeSelfName && i === 0) {
                names.push(username || `Player ${i + 1}`);
            } else {
                const input = document.getElementById(`playerNameInput${i}`) as HTMLInputElement | null;
                names.push(input && input.value.trim() ? input.value.trim() : `Player ${i + 1}`);
            }
        }
        return names;
    };

    const cleanup = () => {
        startGameButton3D.removeEventListener("click", handleSubmit);
        cancelButton3D.removeEventListener("click", handleCancel);
        hidePlayerNameModal();
    };

    const handleSubmit = () => {
        const names = gatherNames();
        cleanup();
        onConfirm(names);
    };

    const handleCancel = () => {
        cleanup();
        onCancel();
    };

    startGameButton3D.style.display = "inline-block";
    cancelButton3D.style.display = "inline-block";
    playerNamesModal3D.style.display = "block";

    startGameButton3D.addEventListener("click", handleSubmit);
    cancelButton3D.addEventListener("click", handleCancel);
}

function promptPlayerNames(playerCount: number, onConfirm: (names: string[]) => void) {
    requestPlayerNames(playerCount, {
        title: "Inserisci i nomi dei giocatori",
        includeSelfName: true,
        onConfirm,
        onCancel: showLocalOptionsMenu
    });
}

function hideTournamentSetupControls() {
    if (startTournamentButton3D) startTournamentButton3D.style.display = "none";
    if (buttonNbrPlayer3D) buttonNbrPlayer3D.style.display = "none";
    if (tournamentPlayerCountLabel3D) tournamentPlayerCountLabel3D.style.display = "none";
}

function showTournamentSetupControls() {
    if (startTournamentButton3D) startTournamentButton3D.style.display = "inline-block";
    if (buttonNbrPlayer3D) buttonNbrPlayer3D.style.display = "inline-block";
    if (tournamentPlayerCountLabel3D) tournamentPlayerCountLabel3D.style.display = "inline-block";
}

function resetTournamentState3D() {
    tournamentActive3D = false;
    tournamentPlayers3D = [];
    tournamentPlayerCount3D = 0;
    quarterfinals3D = [];
    semifinals3D = [];
    final3D = createEmptyMatch3D("final");
    currentTournamentRound = "quarterfinals";
    currentTournamentMatchIndex = 0;
    tournamentMatchInProgress = null;
    tournamentId3D = null;
    hideTournamentSetupControls();
    if (buttonPlayGame3D) {
        buttonPlayGame3D.disabled = false;
        buttonPlayGame3D.style.display = "none";
    }
    if (bracketContainer3D) bracketContainer3D.style.display = "none";
}

function generateTournamentId3D(prefix = "PONG3D") {
    return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function collectTournamentPlayerNames(playerCount: number): Promise<string[]> {
    return new Promise((resolve, reject) => {
        requestPlayerNames(playerCount, {
            title: "Inserisci i nomi dei partecipanti al torneo",
            includeSelfName: true,
            onConfirm: resolve,
            onCancel: () => {
                showTournamentSetupControls();
                reject(new Error("tournament cancelled"));
            }
        });
    });
}

function initializeTournament3D(names: string[]) {
    tournamentPlayers3D = names.map((name, idx) => ({ name, seed: idx }));
    tournamentPlayerCount3D = names.length;
    quarterfinals3D = [];
    semifinals3D = [];
    final3D = createEmptyMatch3D("final");

    if (tournamentPlayerCount3D === 8) {
        for (let i = 0; i < tournamentPlayerCount3D / 2; i++) {
            quarterfinals3D.push({
                player1: tournamentPlayers3D[2 * i] || null,
                player2: tournamentPlayers3D[2 * i + 1] || null,
                matchWinner: null,
                round: "quarterfinals"
            });
        }
        semifinals3D = [createEmptyMatch3D("semifinals"), createEmptyMatch3D("semifinals")];
        currentTournamentRound = "quarterfinals";
    } else {
        for (let i = 0; i < tournamentPlayerCount3D / 2; i++) {
            semifinals3D.push({
                player1: tournamentPlayers3D[2 * i] || null,
                player2: tournamentPlayers3D[2 * i + 1] || null,
                matchWinner: null,
                round: "semifinals"
            });
        }
        currentTournamentRound = "semifinals";
    }

    currentTournamentMatchIndex = 0;
    tournamentMatchInProgress = null;
    tournamentActive3D = true;

    renderTournamentBracket3D();
    if (bracketContainer3D) bracketContainer3D.style.display = "block";
    if (buttonPlayGame3D) {
        buttonPlayGame3D.disabled = false;
        buttonPlayGame3D.style.display = "inline-block";
    }
}

function getCurrentTournamentMatch(): TournamentMatch3D | null {
    if (!tournamentActive3D) return null;
    if (currentTournamentRound === "quarterfinals") {
        return quarterfinals3D[currentTournamentMatchIndex] || null;
    }
    if (currentTournamentRound === "semifinals") {
        return semifinals3D[currentTournamentMatchIndex] || null;
    }
    if (currentTournamentRound === "final") {
        return final3D;
    }
    return null;
}

function renderTournamentBracket3D() {
    if (!bracketContainer3D) return;

    const renderMatch = (match: TournamentMatch3D | undefined, label: string, roundName: string, index: number) => {
        const safeMatch = match || createEmptyMatch3D(roundName as "quarterfinals" | "semifinals" | "final");
        const p1 = safeMatch.player1?.name || "TBD";
        const p2 = safeMatch.player2?.name || "TBD";
        const winner = safeMatch.matchWinner ? `<div class="winner">Winner: ${safeMatch.matchWinner.name}</div>` : "";
        const playing = (currentTournamentRound === roundName && currentTournamentMatchIndex === index)
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
    };

    let html = `<div class="bracket">`;

    if (tournamentPlayerCount3D === 8) {
        html += `
          <div class="column">
            <div class="round-title">Quarterfinals</div>
            ${renderMatch(quarterfinals3D[0], "QF1", "quarterfinals", 0)}
            ${renderMatch(quarterfinals3D[1], "QF2", "quarterfinals", 1)}
          </div>
          <div class="column">
            <div class="round-title">Semifinal</div>
            ${renderMatch(semifinals3D[0], "SF1", "semifinals", 0)}
          </div>
          <div class="column center">
            <div class="round-title">Final</div>
            ${renderMatch(final3D, "Final", "final", 0)}
          </div>
          <div class="column">
            <div class="round-title">Semifinal</div>
            ${renderMatch(semifinals3D[1], "SF2", "semifinals", 1)}
          </div>
          <div class="column">
            <div class="round-title">Quarterfinals</div>
            ${renderMatch(quarterfinals3D[2], "QF3", "quarterfinals", 2)}
            ${renderMatch(quarterfinals3D[3], "QF4", "quarterfinals", 3)}
          </div>`;
    } else if (tournamentPlayerCount3D === 4) {
        html += `
          <div class="column">
            <div class="round-title">Semifinal</div>
            ${renderMatch(semifinals3D[0], "SF1", "semifinals", 0)}
          </div>
          <div class="column center">
            <div class="round-title">Final</div>
            ${renderMatch(final3D, "Final", "final", 0)}
          </div>
          <div class="column">
            <div class="round-title">Semifinal</div>
            ${renderMatch(semifinals3D[1], "SF2", "semifinals", 1)}
          </div>`;
    }

    html += `</div>`;
    bracketContainer3D.innerHTML = html;
    bracketContainer3D.style.display = "block";
}

function playCurrentTournamentMatch3D() {
    if (!tournamentActive3D) return;
    const match = getCurrentTournamentMatch();
    if (!match || !match.player1 || !match.player2) {
        console.warn("Tournament match not ready", currentTournamentRound, currentTournamentMatchIndex);
        return;
    }
    tournamentMatchInProgress = { round: currentTournamentRound, index: currentTournamentMatchIndex };
    if (buttonPlayGame3D) buttonPlayGame3D.style.display = "none";
    if (bracketContainer3D) bracketContainer3D.style.display = "none";
    startLocal3DMatch(2, [match.player1.name, match.player2.name]);
}

function handleTournamentMatchResult(winnerName: string | null) {
    if (!tournamentActive3D) return;
    const context = tournamentMatchInProgress;
    tournamentMatchInProgress = null;
    if (!context || !winnerName) {
        showTournamentSetupControls();
        return;
    }

    let match: TournamentMatch3D | undefined;
    if (context.round === "quarterfinals") {
        match = quarterfinals3D[context.index];
    } else if (context.round === "semifinals") {
        match = semifinals3D[context.index];
    } else if (context.round === "final") {
        match = final3D;
    }
    if (!match) return;

    const winner = match.player1?.name === winnerName ? match.player1 : match.player2?.name === winnerName ? match.player2 : { name: winnerName, seed: -1 };
    match.matchWinner = winner;

    if (context.round === "quarterfinals") {
        const semiIdx = Math.floor(context.index / 2);
        if (!semifinals3D[semiIdx]) semifinals3D[semiIdx] = createEmptyMatch3D("semifinals");
        if (context.index % 2 === 0) semifinals3D[semiIdx].player1 = winner;
        else semifinals3D[semiIdx].player2 = winner;
        currentTournamentMatchIndex++;
        if (currentTournamentMatchIndex >= quarterfinals3D.length) {
            currentTournamentRound = "semifinals";
            currentTournamentMatchIndex = 0;
        }
    } else if (context.round === "semifinals") {
        if (context.index === 0) final3D.player1 = winner;
        else final3D.player2 = winner;
        currentTournamentMatchIndex++;
        if (currentTournamentMatchIndex >= semifinals3D.length) {
            currentTournamentRound = "final";
            currentTournamentMatchIndex = 0;
        }
    } else if (context.round === "final") {
        final3D.matchWinner = winner;
        currentTournamentRound = "finished";
    }

    renderTournamentBracket3D();

    if (buttonPlayGame3D) {
        if (currentTournamentRound === "finished") {
            buttonPlayGame3D.style.display = "none";
        } else {
            buttonPlayGame3D.disabled = false;
            buttonPlayGame3D.style.display = "inline-block";
        }
    }
    if (bracketContainer3D) bracketContainer3D.style.display = "block";

    if (currentTournamentRound === "finished") {
        tournamentActive3D = false;
    }
}

function startLocal3DMatch(playerCount: number, names: string[]) {
    hideMenuForMatch();
    showGameCanvas3D();
    nbrPlayer = playerCount;
    FIELD_HEIGHT_3D = playerCount === 4 ? FIELD_WIDTH_3D : FIELD_HEIGHT_BASE;
    localPlayerNames = names;
    initBabylon();
    startGame();
    stopBotPolling();
}

function resolvePlayerName(index: number, fallback: string) {
    if (localPlayerNames && localPlayerNames[index]) {
        return localPlayerNames[index];
    }
    return fallback;
}

function disposeBabylon() {
    if (engine) {
        engine.stopRenderLoop();
        engine.dispose();
        engine = null;
    }

    if (scene) {
        scene.dispose();
        scene = null;
    }

    ball = null;
    players = [];
    cornerCubes = [];

    console.log("🧹 Babylon disposed");
}

function showMenu(winner: WinnerLike) {
    localPlayerNames = null;
    FIELD_HEIGHT_3D = FIELD_HEIGHT_BASE;
    hidePlayerNameModal();
    canvas.style.display = "none";
    canvasContainer3D.style.display = "none";
    scoreDiv.style.display = "none";
    canvas2D.style.display = "none";

    const winnerName = resolveWinnerName(winner);

    if (tournamentMatchInProgress) {
        handleTournamentMatchResult(winnerName);
    }

    if (currentTournamentRound === "finished" && !tournamentActive3D) {
        resetTournamentState3D();
        textPong3D.style.display = "block";
        buttonLocalPlay3D.style.display = 'inline-block';
        buttonMainMenu3D.style.display = "none";
        return;
    }

    if (tournamentActive3D) {
        textPong3D.style.display = "block";
        if (buttonPlayGame3D && currentTournamentRound !== "finished") {
            buttonPlayGame3D.disabled = false;
            buttonPlayGame3D.style.display = "inline-block";
        }
        if (bracketContainer3D) bracketContainer3D.style.display = "block";
        buttonLocalPlay3D.style.display = "none";
        buttonMainMenu3D.style.display = "inline-block";
        return;
    }

    textPong3D.style.display = "block";
    buttonLocalPlay3D.style.display = 'inline-block';
    buttonMainMenu3D.style.display = "none";
}

function showGameCanvas3D() {
    canvas_container.style.display = "block";
    canvasContainer3D.style.display = "block";
    scoreDiv.style.display = "block";

    const canvas3D = document.getElementById("gameCanvas3D") as HTMLCanvasElement;
    if (canvas3D) {
        canvas3D.style.display = "block";
    }

    canvas2D.style.display = "none"; // overlay solo per vittoria
}

export function showVictoryScreen3D(winner: any) {
    canvas_container.style.display = "block";
    
    const btnBack = document.getElementById("btnBackToMenu") as HTMLButtonElement;
    if (!btnBack) {
        console.error("Could not find btnBackToMenu element");
        return;
    }
    btnBack.style.display = "inline-block";
    btnBack.style.position = "absolute";
    btnBack.style.left = "50%";
    btnBack.style.top = "60%";
    btnBack.style.transform = "translate(-50%, -50%)";
    btnBack.style.zIndex = "999";
    
    btnBack.onclick = () => {
        gameStarted = false;
        disposeBabylon();
        btnBack.style.display = "none";
        canvas_container.style.display = "none";
        showMenu(winner); // or showMenu(null) if you want to reset
    };
    
    const ctx = canvas2D.getContext("2d")!;
    canvas2D.style.display = "block";
    if (!ctx) {
        console.error("Could not get 2D context from canvas");
        return;
    }
    ctx.clearRect(0, 0, canvas2D.width, canvas2D.height);

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(0, 0, canvas2D.width, canvas2D.height);
    
    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
        const winnerName = resolveWinnerName(winner) || "Player";
        ctx.fillText(
            `🏆 ${winnerName} Wins 🏆`,
            canvas2D.width / 2,
            canvas2D.height / 2
        );
}

function createGameObjects(scene: any) {
    console.log("Creating game objects...");
    
    const ballMesh = BABYLON.MeshBuilder.CreateSphere("ball", {diameter: 0.5}, scene);
    const ballMaterial = new BABYLON.StandardMaterial("ballMaterial", scene);
    ballMaterial.diffuseColor = COLORS.ballDiffuse;
    ballMaterial.emissiveColor = COLORS.ballEmissive;
    ballMesh.material = ballMaterial;
    ballMesh.position = new BABYLON.Vector3(0, 0.5, 0);

    try {
        ballParticleSystem = new BABYLON.ParticleSystem("ballTrail", 400, scene);
        const trailTexture = new BABYLON.DynamicTexture("ballTrailTexture", {width: 64, height: 64}, scene, false);
        const trailCtx = trailTexture.getContext();
        trailCtx.clearRect(0, 0, 64, 64);
        trailCtx.fillStyle = "white";
        trailCtx.beginPath();
        trailCtx.arc(32, 32, 26, 0, Math.PI * 2);
        trailCtx.fill();
        trailTexture.update();
        ballParticleSystem.particleTexture = trailTexture;
        ballParticleSystem.emitter = ballMesh;
        ballParticleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // emission from center
        ballParticleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);

        ballParticleSystem.color1 = new BABYLON.Color4(1, 1, 1, 0.9);
        ballParticleSystem.color2 = new BABYLON.Color4(1, 1, 1, 0.6);
        ballParticleSystem.minSize = 0.04;
        ballParticleSystem.maxSize = 0.16;
        ballParticleSystem.minLifeTime = 0.2;
        ballParticleSystem.maxLifeTime = 0.6;

        ballParticleSystem.emitRate = 180;
        ballParticleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        ballParticleSystem.gravity = new BABYLON.Vector3(0, 0, 0);
        ballParticleSystem.direction1 = new BABYLON.Vector3(-0.2, 0, -0.2);
        ballParticleSystem.direction2 = new BABYLON.Vector3(0.2, 0, 0.2);
        ballParticleSystem.minAngularSpeed = 0;
        ballParticleSystem.maxAngularSpeed = Math.PI;
        ballParticleSystem.minEmitPower = 0.1;
        ballParticleSystem.maxEmitPower = 0.6;
        ballParticleSystem.updateSpeed = 0.01;

        ballParticleSystem.start();
        console.log("✅ Ball particle system started");
    } catch (err) {
        console.warn("⚠️ Could not create ball particle system:", err);
    }

    ball = {
        mesh: ballMesh,
        position: ballMesh.position,
        velocity: new BABYLON.Vector3(0.15, 0, 0.1),
        lastTouched: null as number | null,
        rallyActive: false as boolean,
        ballSize: 0.5,
        moveBall: function(players: any[]) {
            this.position.addInPlace(this.velocity);
            this.mesh.position.copyFrom(this.position);
            
            this.checkPaddleCollisions(players);
        
            const halfW = FIELD_WIDTH_3D / 2;
            const halfH = FIELD_HEIGHT_3D / 2;
            if (nbrPlayer <= 2) {
                // 2-player mode: check left/right goals
                if (this.position.x < -halfW) {
                    if (this.rallyActive) {
                        score3d[1] = (score3d[1] || 0) + 1;
                        updateScoreDisplay();
                    }
                    console.log("Player 2 scored! Current score:", score3d);
                    if (score3d[1] >= 5) {
                        gameStarted = false;
                        showVictoryScreen3D(players[1]);
                    }
                    this.resetBall();
                    return;
                }
                if (this.position.x > halfW) {
                    if (this.rallyActive) {
                        score3d[0] = (score3d[0] || 0) + 1;
                        updateScoreDisplay();
                    }
                    if (score3d[0] >= 5) {
                        gameStarted = false;
                        showVictoryScreen3D(players[0]);
                    }
                    this.resetBall();
                    return;
                }
                if (this.position.z > halfH || this.position.z < -halfH) {
                    this.velocity.z *= -1;
                    this.position.z = (this.position.z > 0 ? 1 : -1) * (halfH - this.ballSize/2);
                    this.mesh.position.copyFrom(this.position);
                }
            }
            if (nbrPlayer === 4) {
                if (this.position.z > halfH) {
                    if (this.rallyActive && this.lastTouched !== null) {
                        const scorer = this.lastTouched;
                        score3d[scorer] = (score3d[scorer] || 0) + 1;
                        updateScoreDisplay();
                    }
                    if (score3d[this.lastTouched || 0] >= 5) {
                        gameStarted = false;
                        showVictoryScreen3D(players[this.lastTouched || 0]);
                    }
                    this.resetBall();
                    return;
                }
                if (this.position.z < -halfH) {
                    if (this.rallyActive && this.lastTouched !== null) {
                        const scorer = this.lastTouched;
                        score3d[scorer] = (score3d[scorer] || 0) + 1;
                        updateScoreDisplay();
                    }
                    if (score3d[this.lastTouched || 0] >= 5) {
                        gameStarted = false;
                        showVictoryScreen3D(players[this.lastTouched || 0]);
                    }
                    this.resetBall();
                    return;
                }
                if (this.position.x < -halfW) {
                    if (this.rallyActive && this.lastTouched !== null) {
                        const scorer = this.lastTouched;
                        score3d[scorer] = (score3d[scorer] || 0) + 1;
                        updateScoreDisplay();
                    }
                    if (score3d[this.lastTouched || 0] >= 5) {
                        gameStarted = false;
                        showVictoryScreen3D(players[this.lastTouched || 0]);
                    }
                    this.resetBall();
                }
                if (this.position.x > halfW) {
                    if (this.rallyActive && this.lastTouched !== null) {
                        const scorer = this.lastTouched;
                        score3d[scorer] = (score3d[scorer] || 0) + 1;
                        updateScoreDisplay();
                    }
                    if (score3d[this.lastTouched || 0] >= 5) {
                        gameStarted = false;
                        showVictoryScreen3D(players[this.lastTouched || 0]);
                    }
                    this.resetBall();
                }
            }
            
            //goal checks (reset ball)
        },
        
        checkPaddleCollisions: function(players: any[]) {
            const ballRadius = this.ballSize / 2;
            
            players.forEach((player: any, index: number) => {
                const paddlePos = player.position;
                const isHorizontal = (nbrPlayer === 4 && (index === 2 || index === 3));
                const paddleWidth = isHorizontal ? 3 : 0.3;
                const paddleDepth = isHorizontal ? 0.3 : 3;
                const paddleHeight = 1;
                
                const paddleMinX = paddlePos.x - paddleWidth / 2;
                const paddleMaxX = paddlePos.x + paddleWidth / 2;
                const paddleMinZ = paddlePos.z - paddleDepth / 2;
                const paddleMaxZ = paddlePos.z + paddleDepth / 2;
                const paddleMinY = paddlePos.y - paddleHeight / 2;
                const paddleMaxY = paddlePos.y + paddleHeight / 2;
                if (
                    this.position.x + ballRadius > paddleMinX &&
                    this.position.x - ballRadius < paddleMaxX &&
                    this.position.z + ballRadius > paddleMinZ &&
                    this.position.z - ballRadius < paddleMaxZ &&
                    this.position.y + ballRadius > paddleMinY &&
                    this.position.y - ballRadius < paddleMaxY
                ) {
                    console.log(`Ball hit paddle ${index}!`);
                    // remember last player who touched the ball and mark rally active
                    this.lastTouched = index;
                    this.rallyActive = true;

                    if (isHorizontal) {
                        this.velocity.z *= -1;
                    
                        const hitPosition = (this.position.x - paddlePos.x) / (paddleWidth / 2);
                        this.velocity.x += hitPosition * 0.05;
                    
                        if (this.position.z > paddlePos.z) {
                            this.position.z = paddleMaxZ + ballRadius + 0.1;
                        } else {
                            this.position.z = paddleMinZ - ballRadius - 0.1;
                        }
                    } else {
                        this.velocity.x *= -1;
                    
                        const hitPosition = (this.position.z - paddlePos.z) / (paddleDepth / 2);
                        this.velocity.z += hitPosition * 0.05;
                    
                        if (this.position.x > paddlePos.x) {
                            this.position.x = paddleMaxX + ballRadius + 0.1;
                        } else {
                            this.position.x = paddleMinX - ballRadius - 0.1;
                        }
                    }

                    this.mesh.position.copyFrom(this.position);

                    // speed up
                    this.velocity.x *= 1.05;
                    this.velocity.z *= 1.02;
                }
            });

            cornerCubes.forEach((cube: any) => {
                try {
                    const boxPos = cube.position;
                    const half = (cube.metadata && cube.metadata.halfSize) ? cube.metadata.halfSize : 0.5;
                    const dx = Math.abs(this.position.x - boxPos.x);
                    const dz = Math.abs(this.position.z - boxPos.z);
                    const overlapX = half + ballRadius - dx;
                    const overlapZ = half + ballRadius - dz;

                    if (overlapX > 0 && overlapZ > 0) {
                        // collision detected: decide axis of minimum penetration
                        if (overlapX < overlapZ) {
                            // push on X
                            if (this.position.x > boxPos.x) this.position.x = boxPos.x + half + ballRadius + 0.1;
                            else this.position.x = boxPos.x - half - ballRadius - 0.1;
                            this.velocity.x *= -1;
                        } else {
                            // push on Z
                            if (this.position.z > boxPos.z) this.position.z = boxPos.z + half + ballRadius + 0.1;
                            else this.position.z = boxPos.z - half - ballRadius - 0.1;
                            this.velocity.z *= -1;
                        }
                        this.mesh.position.copyFrom(this.position);
                    }
                } catch (e) {
                }
            });
        },
        
        resetBall: function() {
            this.position = new BABYLON.Vector3(0, 0.5, 0);
            this.mesh.position.copyFrom(this.position);
            // clear last toucher on reset
            this.lastTouched = null;
            this.rallyActive = false;
            
            // random direction ad ogni spawn
            const angle = Math.random() < 0.5 ? 
                (Math.random() - 0.5) * (Math.PI / 4) : 
                Math.PI + (Math.random() - 0.5) * (Math.PI / 4);
            
            this.velocity = new BABYLON.Vector3(
                0.15 * Math.cos(angle), 
                0, 
                0.15 * Math.sin(angle)
            );
        }
    };
    players = [];
    
    const paddle1Mesh = BABYLON.MeshBuilder.CreateBox("paddle0", 
        {width: 0.3, height: 1, depth: 3}, scene);
    const paddle1Material = new BABYLON.StandardMaterial("paddle0Material", scene);
    paddle1Material.diffuseColor = COLORS.paddleDefault;
    paddle1Material.emissiveColor = COLORS.paddleDefault;
    paddle1Material.disableLighting = true;
    paddle1Mesh.material = paddle1Material;
    paddle1Mesh.position = new BABYLON.Vector3(-FIELD_WIDTH_3D / 2 + 0.2, 0.5, 0);
    
    const paddle2Mesh = BABYLON.MeshBuilder.CreateBox("paddle1",
        {width: 0.3, height: 1, depth: 3}, scene);
    const paddle2Material = new BABYLON.StandardMaterial("paddle1Material", scene);
    paddle2Material.diffuseColor = COLORS.paddleRight;
    paddle2Material.emissiveColor = COLORS.paddleRight;
    paddle2Material.disableLighting = true;
    paddle2Mesh.material = paddle2Material;
    paddle2Mesh.position = new BABYLON.Vector3(FIELD_WIDTH_3D / 2 - 0.2, 0.5, 0);
    
    players.push({
        id: 0,
        user_ids: [userId],
        playerName: resolvePlayerName(0, username),
        mesh: paddle1Mesh,
        position: paddle1Mesh.position,
        drawAndMove: function() {
            // Player 0
            const step = 0.15;
            const paddleHalfX = 0.3 / 2;
            const paddleHalfY = 1 / 2;
            const paddleHalfZ = 3 / 2;
            const cubeHalf = (nbrPlayer === 4 && cornerCubes.length > 0 && cornerCubes[0].metadata) ? cornerCubes[0].metadata.halfSize : 0;
            const margin = 0.2;
            const vLimit = FIELD_HEIGHT_3D / 2 - paddleHalfZ - cubeHalf - margin;

            if (keys['w'] || keys['W']) {
                const candidateZ = this.position.z + step;
                if (candidateZ <= vLimit) {
                    const boxPos = new BABYLON.Vector3(this.position.x, this.position.y, candidateZ);
                    if (!ball || !sphereIntersectsBox(ball.position, ball.ballSize/2, boxPos, paddleHalfX, paddleHalfY, paddleHalfZ)) {
                        this.position.z = candidateZ;
                    }
                }
            }
            if (keys['s'] || keys['S']) {
                const candidateZ = this.position.z - step;
                if (candidateZ >= -vLimit) {
                    const boxPos = new BABYLON.Vector3(this.position.x, this.position.y, candidateZ);
                    if (!ball || !sphereIntersectsBox(ball.position, ball.ballSize/2, boxPos, paddleHalfX, paddleHalfY, paddleHalfZ)) {
                        this.position.z = candidateZ;
                    }
                }
            }
            this.mesh.position.copyFrom(this.position);
        }
    });
    
    // Player 1 (right paddle) (human or Ai)
    const player1 = {
        id: 1,
        mesh: paddle2Mesh,
        playerName: resolvePlayerName(1, "Guest 1"),
        position: paddle2Mesh.position,
        drawAndMove: function() {
            const step = 0.15;
            const paddleHalfX = 0.3 / 2;
            const paddleHalfY = 1 / 2;
            const paddleHalfZ = 3 / 2;
            const cubeHalf = (nbrPlayer === 4 && cornerCubes.length > 0 && cornerCubes[0].metadata) ? cornerCubes[0].metadata.halfSize : 0;
            const margin = 0.2;
            const vLimit = FIELD_HEIGHT_3D / 2 - paddleHalfZ - cubeHalf - margin;

            if (nbrPlayer === 1 && typeof botKey === "string") {
                console.log(`[BOT] drawAndMove: botKey=${botKey}, position.z=${this.position.z}`);
                if (botKey === "ArrowDown") {
                    const candidateZ = this.position.z + step;
                    if (candidateZ <= vLimit) {
                        const boxPos = new BABYLON.Vector3(this.position.x, this.position.y, candidateZ);
                        if (!ball || !sphereIntersectsBox(ball.position, ball.ballSize/2, boxPos, paddleHalfX, paddleHalfY, paddleHalfZ)) {
                            this.position.z = candidateZ;
                            console.log(`[BOT] Moving DOWN to ${this.position.z}`);
                        }
                    }
                }
                if (botKey === "ArrowUp") {
                    const candidateZ = this.position.z - step;
                    if (candidateZ >= -vLimit) {
                        const boxPos = new BABYLON.Vector3(this.position.x, this.position.y, candidateZ);
                        if (!ball || !sphereIntersectsBox(ball.position, ball.ballSize/2, boxPos, paddleHalfX, paddleHalfY, paddleHalfZ)) {
                            this.position.z = candidateZ;
                            console.log(`[BOT] Moving UP to ${this.position.z}`);
                        }
                    }
                }
                if (this.position.z > vLimit) this.position.z = vLimit;
                if (this.position.z < -vLimit) this.position.z = -vLimit;
                this.mesh.position.copyFrom(this.position);
            } else if (nbrPlayer !== 1) {
                if (keys['ArrowUp']) {
                    const candidateZ = this.position.z + step;
                    if (candidateZ <= vLimit) {
                        const boxPos = new BABYLON.Vector3(this.position.x, this.position.y, candidateZ);
                        if (!ball || !sphereIntersectsBox(ball.position, ball.ballSize/2, boxPos, paddleHalfX, paddleHalfY, paddleHalfZ)) {
                            this.position.z = candidateZ;
                        }
                    }
                }
                if (keys['ArrowDown']) {
                    const candidateZ = this.position.z - step;
                    if (candidateZ >= -vLimit) {
                        const boxPos = new BABYLON.Vector3(this.position.x, this.position.y, candidateZ);
                        if (!ball || !sphereIntersectsBox(ball.position, ball.ballSize/2, boxPos, paddleHalfX, paddleHalfY, paddleHalfZ)) {
                            this.position.z = candidateZ;
                        }
                    }
                }
                this.mesh.position.copyFrom(this.position);
            }
        }
    };
    
    players.push(player1);
    
    //for 4 player mode
    if (nbrPlayer === 4) {
        // Player 2 (top paddle)
        const paddle3Mesh = BABYLON.MeshBuilder.CreateBox("paddle2",
            {width: 3, height: 1, depth: 0.3}, scene);
        const paddle3Material = new BABYLON.StandardMaterial("paddle2Material", scene);
        paddle3Material.diffuseColor = COLORS.paddleTop;
        paddle3Material.emissiveColor = COLORS.paddleTop;
        paddle3Material.disableLighting = true;
        paddle3Mesh.material = paddle3Material;
        paddle3Mesh.position = new BABYLON.Vector3(0, 0.5, FIELD_HEIGHT_3D / 2 - 0.3);

        players.push({
            id: 2,
            mesh: paddle3Mesh,
            playerName: resolvePlayerName(2, "Guest 2"),
            position: paddle3Mesh.position,
            drawAndMove: function() {
                // Player 2 controls
                const paddleHalfX = 3 / 2;
                const cubeHalf = (nbrPlayer === 4 && cornerCubes.length > 0 && cornerCubes[0].metadata) ? cornerCubes[0].metadata.halfSize : 0;
                const margin = 0.2;
                const hLimit = FIELD_HEIGHT_3D / 2 - paddleHalfX - cubeHalf - margin;
                const step = 0.15;
                const paddleHalfY = 1 / 2;
                const paddleHalfZ = 0.3 / 2;
                if (keys['f'] || keys['F']) {
                    const candidateX = this.position.x + step;
                    if (candidateX <= hLimit) {
                        const boxPos = new BABYLON.Vector3(candidateX, this.position.y, this.position.z);
                        if (!ball || !sphereIntersectsBox(ball.position, ball.ballSize/2, boxPos, paddleHalfX, paddleHalfY, paddleHalfZ)) {
                            this.position.x = candidateX;
                        }
                    }
                }
                if (keys['d'] || keys['D']) {
                    const candidateX = this.position.x - step;
                    if (candidateX >= -hLimit) {
                        const boxPos = new BABYLON.Vector3(candidateX, this.position.y, this.position.z);
                        if (!ball || !sphereIntersectsBox(ball.position, ball.ballSize/2, boxPos, paddleHalfX, paddleHalfY, paddleHalfZ)) {
                            this.position.x = candidateX;
                        }
                    }
                }
                this.mesh.position.copyFrom(this.position);
            }
        });

        // Player 3 (bottom paddle)
        const paddle4Mesh = BABYLON.MeshBuilder.CreateBox("paddle3",
            {width: 3, height: 1, depth: 0.3}, scene);
        const paddle4Material = new BABYLON.StandardMaterial("paddle3Material", scene);
        paddle4Material.diffuseColor = COLORS.paddleBottom;
        paddle4Material.emissiveColor = COLORS.paddleBottom;
        paddle4Material.disableLighting = true;
        paddle4Mesh.material = paddle4Material;
        paddle4Mesh.position = new BABYLON.Vector3(0, 0.5, -FIELD_HEIGHT_3D / 2 + 0.3);
        console.log("Paddle4 initial position:", paddle4Mesh.position);

        players.push({
            id: 3,
            mesh: paddle4Mesh,
            playerName: resolvePlayerName(3, "Guest 3"),
            position: paddle4Mesh.position,
            drawAndMove: function() {
                // Player 3 controls
                    const paddleHalfX = 3 / 2;
                    const cubeHalf = (nbrPlayer === 4 && cornerCubes.length > 0 && cornerCubes[0].metadata) ? cornerCubes[0].metadata.halfSize : 0;
                    const margin = 0.2;
                    const hLimit = FIELD_HEIGHT_3D / 2 - paddleHalfX - cubeHalf - margin;
                const step = 0.15;
                const paddleHalfY = 1 / 2;
                const paddleHalfZ = 0.3 / 2;
                if (keys['k'] || keys['K']) {
                    const candidateX = this.position.x + step;
                    if (candidateX <= hLimit) {
                        const boxPos = new BABYLON.Vector3(candidateX, this.position.y, this.position.z);
                        if (!ball || !sphereIntersectsBox(ball.position, ball.ballSize/2, boxPos, paddleHalfX, paddleHalfY, paddleHalfZ)) {
                            this.position.x = candidateX;
                        }
                    }
                }
                if (keys['j'] || keys['J']) {
                    const candidateX = this.position.x - step;
                    if (candidateX >= -hLimit) {
                        const boxPos = new BABYLON.Vector3(candidateX, this.position.y, this.position.z);
                        if (!ball || !sphereIntersectsBox(ball.position, ball.ballSize/2, boxPos, paddleHalfX, paddleHalfY, paddleHalfZ)) {
                            this.position.x = candidateX;
                        }
                    }
                }
                this.mesh.position.copyFrom(this.position);
            }
        });
    }

    console.log("✅ Game objects created (supports up to 4 players)");
}

let botPollingId: number | null = null;
let botKey: string | null = null;

function startBotPolling() {
    if (botPollingId !== null) {
        clearInterval(botPollingId);
    }
    if (!gameStarted) {
        console.log("[BOT] Polling not started: game not running");
        return;
    }
    console.log("[BOT] Starting polling...");
    botPollingId = window.setInterval(async () => {
        const ballY = ball ? ball.position.z * 100 : 0;
        const paddleY = players[1] ? players[1].position.z * 100 : 0;
        console.log(`[BOT] Polling: ballY=${ballY}, paddleY=${paddleY}`);
        botKey = await sendBotData(ballY, paddleY);
        console.log(`[BOT] AI decision received: ${botKey}`);
    }, 80);
}

function stopBotPolling() {
    if (botPollingId !== null) {
        clearInterval(botPollingId);
        botPollingId = null;
    }
}

async function sendBotData(ballY: number, paddleY: number): Promise<string | null> {
    try {
        console.log(`[BOT] Sending data to backend: ballY=${ballY}, paddleY=${paddleY}`);
        const response = await fetch('/ai/3d', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ball_y: ballY, paddle_y: paddleY })
        });
        if (!response.ok) {
            console.log(`[BOT] Backend response not ok: ${response.status}`);
            return null;
        }
        const data = await response.json();
        console.log(`[BOT] Backend response: ${JSON.stringify(data)}`);
        console.log(`[BOT] AI decision received: ${data.key}`);
        return data.key;
    } catch (error) {
        console.error('[BOT] AI request failed:', error);
        console.log(`[BOT] AI decision received: null`);
        return null;
    }
}

function setupManualCameraControls(camera: any, canvas: HTMLCanvasElement) {
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    
    canvas.addEventListener('mousedown', (event) => {
        isMouseDown = true;
        mouseX = event.clientX;
        mouseY = event.clientY;
        canvas.style.cursor = 'grabbing';
    });
    
    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
        canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('mouseleave', () => {
        isMouseDown = false;
        canvas.style.cursor = 'grab';
    });
    
    canvas.addEventListener('mousemove', (event) => {
        if (!isMouseDown) return;
        const deltaX = event.clientX - mouseX;
        const deltaY = event.clientY - mouseY;
        camera.alpha -= deltaX * 0.01;
        camera.beta += deltaY * 0.01;
        camera.beta = Math.max(0.1, Math.min(Math.PI - 0.1, camera.beta));
        
        mouseX = event.clientX;
        mouseY = event.clientY;
    });
    
    canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        
        const zoomSpeed = 0.1;
        if (event.deltaY > 0) {
            camera.radius += zoomSpeed;
        } else {
            camera.radius -= zoomSpeed;
        }
        camera.radius = Math.max(5, Math.min(25, camera.radius));
    });
    
    canvas.style.cursor = 'grab';
    
    console.log("🖱️  Manual mouse controls ready:");
    console.log("   - Drag to rotate camera");
    console.log("   - Mouse wheel to zoom in/out");
}

function sphereIntersectsBox(spherePos: any, radius: number, boxPos: any, boxHalfX: number, boxHalfY: number, boxHalfZ: number) {
    const dx = Math.max(Math.abs(spherePos.x - boxPos.x) - boxHalfX, 0);
    const dy = Math.max(Math.abs(spherePos.y - boxPos.y) - boxHalfY, 0);
    const dz = Math.max(Math.abs(spherePos.z - boxPos.z) - boxHalfZ, 0);
    return (dx*dx + dy*dy + dz*dz) <= (radius * radius);
}

//init babylon.js scene
function initBabylon() {
    console.log("🚀 Initializing Babylon.js...");
    if (typeof BABYLON === 'undefined') {
        console.error("❌ BABYLON.js is not loaded!");
        return;
    }
    console.log("✅ BABYLON.js is available");
    
    canvas = document.getElementById("gameCanvas3D") as HTMLCanvasElement;
    if (!canvas) {
        console.error("❌ Canvas not found!");
        return;
    }
    console.log("✅ Canvas found:", canvas);
    console.log("Canvas dimensions:", canvas.width, "x", canvas.height);

    try {
        engine = new BABYLON.Engine(canvas, true);
        console.log("✅ Engine created successfully");
        scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0.10196, 0.07843, 0.21176, 1.0); // rgb(26,20,54)
        const glowLayer = new BABYLON.GlowLayer("neonGlow", scene);
        glowLayer.intensity = 0.5;
        console.log("✅ Glow layer ready");
        console.log("✅ Scene created successfully");
    } catch (error) {
        console.error("❌ Error creating engine/scene:", error);
        return;
    }

    try {
        camera = new BABYLON.ArcRotateCamera("camera1", -Math.PI/2, Math.PI/4, 42, BABYLON.Vector3.Zero(), scene);
        try {
            camera.attachControl(canvas, true);
            console.log("✅ Camera attached to canvas for pointer controls");
        } catch (e) {
            console.warn("⚠️ camera.attachControl failed:", e);
        }
        try {
            camera.keysUp = [];
            camera.keysDown = [];
            camera.keysLeft = [];
            camera.keysRight = [];
            console.log("✅ Camera keyboard controls disabled (arrow keys won't move camera)");
        } catch (e) {
            console.warn("⚠️ Failed to clear camera key bindings:", e);
        }
        camera.lowerRadiusLimit = 5;
        camera.upperRadiusLimit = 25; 
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = Math.PI/2 * 0.95;
        
        setupManualCameraControls(camera, canvas);
        console.log("✅ Manual mouse controls implemented");
        
        console.log("✅ ArcRotate camera created successfully");
        console.log("🖱️  Try mouse controls: Drag to rotate, Wheel to zoom");

        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        console.log("✅ Light created");

        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: FIELD_WIDTH_3D, height: FIELD_HEIGHT_3D}, scene);
        let groundMaterial: any;
        if (BABYLON.GridMaterial) {
            groundMaterial = new BABYLON.GridMaterial("gridMat", scene);
            groundMaterial.mainColor = new BABYLON.Color3(1.0, 1.0, 1.0); // white base so lines glow cleanly
            groundMaterial.lineColor = new BABYLON.Color3(1.0, 0.4314, 0.7804); // pink grid lines
            groundMaterial.emissiveColor = new BABYLON.Color3(0.6, 0.2588, 0.4706); // soften glow
            groundMaterial.opacity = 0.75;
            groundMaterial.gridRatio = 1.2;
            groundMaterial.minorUnitVisibility = 0.45;
            groundMaterial.disableLighting = true;
        } else {
            groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
            groundMaterial.diffuseColor = COLORS.ground;
            groundMaterial.specularColor = new BABYLON.Color3(0.6, 0.2588, 0.4706);
            groundMaterial.emissiveColor = new BABYLON.Color3(0.6, 0.2588, 0.4706);
            groundMaterial.specularPower = 8;
        }
        ground.material = groundMaterial;
        console.log("✅ Playing field created");

        if (nbrPlayer === 4) {
            try {
                const halfW = FIELD_WIDTH_3D / 2;
                const halfH = FIELD_HEIGHT_3D / 2;
                const cornerSize = 1.5; // doubled size
                const cornerY = cornerSize / 2; // sit on the ground

                const cornerPositions = [
                    new BABYLON.Vector3(-halfW + cornerSize/2, cornerY, -halfH + cornerSize/2), // bottom-left
                    new BABYLON.Vector3(halfW - cornerSize/2, cornerY, -halfH + cornerSize/2),  // bottom-right
                    new BABYLON.Vector3(-halfW + cornerSize/2, cornerY, halfH - cornerSize/2),  // top-left
                    new BABYLON.Vector3(halfW - cornerSize/2, cornerY, halfH - cornerSize/2)    // top-right
                ];

                cornerPositions.forEach((pos, idx) => {
                    const cube = BABYLON.MeshBuilder.CreateBox(`cornerCube${idx}`, {size: cornerSize}, scene);
                    const mat = new BABYLON.StandardMaterial(`cornerMat${idx}`, scene);
                    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
                    mat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
                    mat.alpha = 0.5;
                    cube.material = mat;
                    cube.position = pos;
                    //mark with half-size for collision checks and register
                    (cube as any).metadata = { halfSize: cornerSize / 2 };
                    cornerCubes.push(cube);
                });

                console.log("✅ Corner cubes created (4-player)");
            } catch (err) {
                console.warn("⚠️ Could not create corner cubes:", err);
            }
        }
        createGameObjects(scene);
        console.log("✅ Game objects created using your classes");

        if (nbrPlayer === 1) startBotPolling();
        else stopBotPolling();
    } catch (error) {
        console.error("❌ Error creating 3D objects:", error);
        return;
    }
    
    console.log("✅ All 3D objects created successfully");

    scene.render();
    scene.clearColor = new BABYLON.Color4(0.10196, 0.07843, 0.21176, 1.0); // rgb(26,20,54)
    console.log("✅ First render executed");

    engine.runRenderLoop(() => {
        if (gameStarted && ball && players.length > 0) {
            players.forEach(player => player.drawAndMove());
            ball.moveBall(players);
        }
        
        scene.render();
    });
    
    console.log("✅ Game loop started successfully");
}

let score3d: number[] = [];
const PLAYER_SCORE_COLORS = ["#0077B6", "#646CFF", "#FFD166", "#F76B1C"];

function getScoreLabelForPlayer(index: number) {
    if (localPlayerNames && localPlayerNames[index]) {
        return localPlayerNames[index];
    }
    const player = players[index];
    if (player && player.playerName) {
        return player.playerName;
    }
    return `Player ${index + 1}`;
}

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (char) => {
        switch (char) {
            case "&": return "&amp;";
            case "<": return "&lt;";
            case ">": return "&gt;";
            case '"': return "&quot;";
            case "'": return "&#39;";
            default: return char;
        }
    });
}

function renderColoredScoreLabel(idx: number, score: number) {
    const color = PLAYER_SCORE_COLORS[idx] || "#FFFFFF";
    const name = escapeHtml(getScoreLabelForPlayer(idx));
    return `<span style="color:${color}">${name}: ${score}</span>`;
}

function updateScoreDisplay() {
    if (!scoreDiv) return;

    if (!score3d || score3d.length === 0) {
        scoreDiv.innerText = "";
        return;
    }

    const labels = score3d.map((s, idx) => renderColoredScoreLabel(idx, s));
    scoreDiv.innerHTML = labels.join("&nbsp;&nbsp;&nbsp;");
}

function startGame() {
    score3d = new Array(Math.max(2, nbrPlayer)).fill(0);

    updateScoreDisplay();
    gameStarted = true;
    if (nbrPlayer === 1) startBotPolling();
    else stopBotPolling();
    console.log("3D Pong Game Started!");
}

window.addEventListener("resize", () => {
    if (engine && engine.resize) {
        engine.resize();
    }
});

document.addEventListener('DOMContentLoaded', () => {

    if (!buttonLocalPlay3D) {
        console.error("ButtonLocalPlay not found!");
        return;
    }

    console.log("All UI elements found, setting up event listeners...");

buttonLocalPlay3D.addEventListener("click", () => {
    hidePlayerNameModal();
    showLocalOptionsMenu();
});

    button2P3D.addEventListener("click", () => {
        console.log("2 Player button clicked!");
        promptPlayerNames(2, (names) => {
            console.log("3D Local 2 Player Game Started!");
            startLocal3DMatch(2, names);
        });
    });

    buttonAI3D.addEventListener("click", () => {
        console.log("VS Bot button clicked!");

        hideMenuForMatch();
        showGameCanvas3D();
        nbrPlayer = 1;
        FIELD_HEIGHT_3D = FIELD_HEIGHT_BASE;
        localPlayerNames = null;
        initBabylon();
        startGame();
        console.log("🤖 3D VS Bot Game Started! nbrPlayer set to:", nbrPlayer);
    });

    button4P3D.addEventListener("click", () => {
        console.log("4 Player button clicked!");
        promptPlayerNames(4, (names) => {
            console.log("3D 4 Player Game Started!");
            startLocal3DMatch(4, names);
        });
    });

    if (buttonTournament3D) {
        buttonTournament3D.addEventListener("click", () => {
            enterTournamentSetupMode();
        });
    }

    if (startTournamentButton3D) {
        startTournamentButton3D.addEventListener("click", async () => {
            if (!buttonNbrPlayer3D || tournamentActive3D) return;
            const selectedValue = parseInt(buttonNbrPlayer3D.value, 10);
            const playerCount = selectedValue === 8 ? 8 : 4;
            try {
                const names = await collectTournamentPlayerNames(playerCount);
                hideTournamentSetupControls();
                tournamentId3D = generateTournamentId3D();
                initializeTournament3D(names);
                textPong3D.style.display = "block";
            } catch (error) {
                console.log("Tournament setup cancelled", error);
            }
        });
    }

    if (buttonPlayGame3D) {
        buttonPlayGame3D.addEventListener("click", () => {
            buttonPlayGame3D.disabled = true;
            playCurrentTournamentMatch3D();
        });
    }

    buttonMainMenu3D.addEventListener("click", () => {
        resetTournamentState3D();
        buttonLocalPlay3D.style.display = "inline-block";
        button2P3D.style.display = "none";
        buttonAI3D.style.display = "none";
        button4P3D.style.display = "none";
        if (buttonTournament3D) buttonTournament3D.style.display = "none";
        buttonMainMenu3D.style.display = "none";
        textPong3D.style.display = "block";
        localPlayerNames = null;
        FIELD_HEIGHT_3D = FIELD_HEIGHT_BASE;
        hidePlayerNameModal();
        canvas_container.style.display = "none";
        canvasContainer3D.style.display = "none";
        scoreDiv.style.display = "none";
        canvas2D.style.display = "none";
    });
});

console.log("3D Pong Game Loaded!");

(window as any).startGame = startGame;