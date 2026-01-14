declare const BABYLON: any;

let engine: any;
let scene: any;
let camera: any;
let canvas: HTMLCanvasElement;
let gameStarted = false;

let nbrPlayer = 2;
let playerGoals = [0, 0, 0, 0];
let isAIMode = false;
let aiUpdateInterval = 100;

let FIELD_WIDTH_3D = 18;
let FIELD_HEIGHT_3D = 12;
const FIELD_DEPTH_3D = 0.5;

let ball: any; 
let players: any[] = [];
let cornerCubes: any[] = [];
let playerNames: string[] = [];
let isTournament3D = false;
let tournamentNames3D: string[] = [];
let tournamentPairs3D: Array<[number, number]> = [];
let currentMatchIndex3D = 0;

// Bracket state aligned to 2D logic
type BracketMatch3D = {
    player1: string | null;
    player2: string | null;
    matchWinner: string | null;
    round: string;
};
let quarterfinals3D: BracketMatch3D[] = [
    { player1: null, player2: null, matchWinner: null, round: "" },
    { player1: null, player2: null, matchWinner: null, round: "" },
    { player1: null, player2: null, matchWinner: null, round: "" },
    { player1: null, player2: null, matchWinner: null, round: "" }
];
let semifinals3D: BracketMatch3D[] = [
    { player1: null, player2: null, matchWinner: null, round: "" },
    { player1: null, player2: null, matchWinner: null, round: "" }
];
let final3D: BracketMatch3D = { player1: null, player2: null, matchWinner: null, round: "" };
let currentRound3D: "quarterfinals" | "semifinals" | "final" | "finished" = "quarterfinals";

// particelle ball
let ballParticleSystem: any = null;

const keys: Record<string, boolean> = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

const COLORS = {
	// materiali
   ballDiffuse:    new BABYLON.Color3(0.88, 0.92, 0.98),  // bianco glaciale
    ballEmissive:   new BABYLON.Color3(0.50, 0.82, 0.95),  // azzurro acqua
    paddleDefault:  new BABYLON.Color3(0.78, 0.90, 0.98),  // bianco-blu
    paddleRight:    new BABYLON.Color3(0.00, 0.60, 0.90),  // blu frutiger
    paddleTop:      new BABYLON.Color3(0.00, 0.88, 0.78),  // turchese acqua
    paddleBottom:   new BABYLON.Color3(0.28, 0.85, 0.82),  // acqua pastello
    ground:         new BABYLON.Color3(0.36, 0.68, 0.78)   // azzurro più profondo
};

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
        // TODO place a small glowing sprite at public/textures/flare.png
        ballParticleSystem.particleTexture = new BABYLON.Texture("textures/flare.png", scene);
        ballParticleSystem.emitter = ballMesh;
        ballParticleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // emission from center
        ballParticleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);

        ballParticleSystem.color1 = new BABYLON.Color4(1, 1, 1, 0.9);
        ballParticleSystem.color2 = new BABYLON.Color4(0.8, 0.95, 1, 0.6);
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
            if (nbrPlayer === 4) {
                if (this.position.z > halfH) {
                    if (this.rallyActive && this.lastTouched !== null) {
                        const scorer = this.lastTouched;
                        score3d[scorer] = (score3d[scorer] || 0) + 1;
                        updateScoreDisplay();
                        checkVictory();
                    }
                    this.resetBall();
                    return;
                }
                if (this.position.z < -halfH) {
                    if (this.rallyActive && this.lastTouched !== null) {
                        const scorer = this.lastTouched;
                        score3d[scorer] = (score3d[scorer] || 0) + 1;
                        updateScoreDisplay();
                        checkVictory();
                    }
                    this.resetBall();
                    return;
                }
            } else {
                // 2-player mode: bounce on top/bottom walls
                if (this.position.z > halfH || this.position.z < -halfH) {
                    this.velocity.z *= -1;
                    this.position.z = (this.position.z > 0 ? 1 : -1) * (halfH - this.ballSize/2);
                    this.mesh.position.copyFrom(this.position);
                }
            }
            
            //goal checks (reset ball)
            if (this.position.x < -halfW) {
                if (this.rallyActive && this.lastTouched !== null) {
                    const scorer = this.lastTouched;
                    score3d[scorer] = (score3d[scorer] || 0) + 1;
                    updateScoreDisplay();
                    checkVictory();
                }
                this.resetBall();
            }
            if (this.position.x > halfW) {
                if (this.rallyActive && this.lastTouched !== null) {
                    const scorer = this.lastTouched;
                    score3d[scorer] = (score3d[scorer] || 0) + 1;
                    updateScoreDisplay();
                    checkVictory();
                }
                this.resetBall();
            }
        },
        
        checkPaddleCollisions: function(players: any[]) {
            const ballRadius = this.ballSize / 2;
            
            players.forEach((player: any, index: number) => {
                const paddlePos = player.position;
                const paddleWidth = 0.3;
                const paddleDepth = 3;
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

                    this.velocity.x *= -1;
           
                    const hitPosition = (this.position.z - paddlePos.z) / (paddleDepth / 2);
                    this.velocity.z += hitPosition * 0.05;
                    
                    if (this.position.x > paddlePos.x) {
                        this.position.x = paddleMaxX + ballRadius + 0.1;
                    } else {
                        this.position.x = paddleMinX - ballRadius - 0.1;
                    }
                    this.mesh.position.copyFrom(this.position);
                    
                    // leggero aumento velocità ad ogni rimbalzo
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
    paddle1Material.emissiveColor = new BABYLON.Color3(0.2,0.2,0.2);
    paddle1Mesh.material = paddle1Material;
    paddle1Mesh.position = new BABYLON.Vector3(-FIELD_WIDTH_3D / 2 + 0.2, 0.5, 0);
    
    const paddle2Mesh = BABYLON.MeshBuilder.CreateBox("paddle1",
        {width: 0.3, height: 1, depth: 3}, scene);
    const paddle2Material = new BABYLON.StandardMaterial("paddle1Material", scene);
    paddle2Material.diffuseColor = COLORS.paddleRight;
    paddle2Material.emissiveColor = new BABYLON.Color3(0.2,0,0);
    paddle2Mesh.material = paddle2Material;
    paddle2Mesh.position = new BABYLON.Vector3(FIELD_WIDTH_3D / 2 - 0.2, 0.5, 0);
    
    players.push({
        id: 0,
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
        paddle3Material.emissiveColor = new BABYLON.Color3(0,0,0.2);
        paddle3Mesh.material = paddle3Material;
        paddle3Mesh.position = new BABYLON.Vector3(0, 0.5, FIELD_HEIGHT_3D / 2 - 0.3);

        players.push({
            id: 2,
            mesh: paddle3Mesh,
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
        paddle4Material.emissiveColor = new BABYLON.Color3(0.2,0.2,0);
        paddle4Mesh.material = paddle4Material;
        paddle4Mesh.position = new BABYLON.Vector3(0, 0.5, -FIELD_HEIGHT_3D / 2 + 0.3);
        console.log("Paddle4 initial position:", paddle4Mesh.position);

        players.push({
            id: 3,
            mesh: paddle4Mesh,
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
    
    canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
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
        scene.clearColor = new BABYLON.Color4(0.20, 0.45, 0.70, 1.0);
        console.log("✅ Scene created successfully");
    } catch (error) {
        console.error("❌ Error creating engine/scene:", error);
        return;
    }

    try {
        camera = new BABYLON.ArcRotateCamera("camera1", -Math.PI/2, Math.PI/2.5, 12, BABYLON.Vector3.Zero(), scene);
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
        const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
        groundMaterial.diffuseColor = COLORS.ground;
        groundMaterial.specularColor = new BABYLON.Color3(0.03, 0.03, 0.03);
        groundMaterial.specularPower = 8;
        ground.material = groundMaterial;
        console.log("✅ Playing field created");

        if (nbrPlayer === 4) {
            try {
                const halfW = FIELD_WIDTH_3D / 2;
                const halfH = FIELD_HEIGHT_3D / 2;
                const cornerSize = 1.5; // doubled size
                const cornerY = cornerSize / 2; // sit on the ground

                const cornerColors = [COLORS.paddleRight, COLORS.paddleTop, COLORS.paddleBottom, COLORS.paddleDefault];

                const cornerPositions = [
                    new BABYLON.Vector3(-halfW + cornerSize/2, cornerY, -halfH + cornerSize/2), // bottom-left
                    new BABYLON.Vector3(halfW - cornerSize/2, cornerY, -halfH + cornerSize/2),  // bottom-right
                    new BABYLON.Vector3(-halfW + cornerSize/2, cornerY, halfH - cornerSize/2),  // top-left
                    new BABYLON.Vector3(halfW - cornerSize/2, cornerY, halfH - cornerSize/2)    // top-right
                ];

                cornerPositions.forEach((pos, idx) => {
                    const cube = BABYLON.MeshBuilder.CreateBox(`cornerCube${idx}`, {size: cornerSize}, scene);
                    const mat = new BABYLON.StandardMaterial(`cornerMat${idx}`, scene);
                    // use predefined palette colors
                    mat.diffuseColor = cornerColors[idx % cornerColors.length];
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
    scene.clearColor = new BABYLON.Color4(0.40, 0.45, 0.70, 1.0);
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

function updateScoreDisplay() {
    const scoreDiv = document.getElementById("score3d");
    if (!scoreDiv) return;

    if (!score3d || score3d.length === 0) {
        scoreDiv.innerText = "";
        return;
    }

    const labels = score3d.map((s, idx) => {
        const name = (playerNames && playerNames[idx]) ? playerNames[idx] : `Player ${idx + 1}`;
        return `${name}: ${s}`;
    });
    scoreDiv.innerText = labels.join("   ");
}

function startGame() {
    score3d = new Array(Math.max(2, nbrPlayer)).fill(0);

    updateScoreDisplay();
    gameStarted = true;
    if (nbrPlayer === 1) startBotPolling();
    else stopBotPolling();
    console.log("3D Pong Game Started!");
}

function resetBracket3D() {
    quarterfinals3D = [
        { player1: null, player2: null, matchWinner: null, round: "" },
        { player1: null, player2: null, matchWinner: null, round: "" },
        { player1: null, player2: null, matchWinner: null, round: "" },
        { player1: null, player2: null, matchWinner: null, round: "" }
    ];
    semifinals3D = [
        { player1: null, player2: null, matchWinner: null, round: "" },
        { player1: null, player2: null, matchWinner: null, round: "" }
    ];
    final3D = { player1: null, player2: null, matchWinner: null, round: "" };
    currentRound3D = "quarterfinals";
    currentMatchIndex3D = 0;
}

function generateBracketHTML3D(names: string[], numPlayers: number): string {
    const renderPair = (label: string, a?: string | null, b?: string | null, winner?: string | null) => {
        const nameA = a ?? 'TBD';
        const nameB = b ?? 'TBD';
        const winnerLine = winner ? `<div class="winner">Winner: ${winner}</div>` : '';
        return `<div class="match-wrapper"><div class="match-label">${label}</div><div class="match"><div class="player">${nameA}</div><div class="vs">vs</div><div class="player">${nameB}</div></div>${winnerLine}</div>`;
    };
    let html = `<h2>Tournament</h2><div class="bracket">`;
    if (numPlayers === 8) {
        html += `<div class="column"><div class="round-title">Quarterfinals</div>
            ${renderPair('QF1', names[0], names[1], quarterfinals3D[0]?.matchWinner)}
            ${renderPair('QF2', names[2], names[3], quarterfinals3D[1]?.matchWinner)}
        </div>`;
        html += `<div class="column"><div class="round-title">Semifinal</div>
            ${renderPair('SF1', semifinals3D[0].player1, semifinals3D[0].player2, semifinals3D[0]?.matchWinner)}
        </div>`;
        html += `<div class="column center"><div class="round-title">Final</div>
            ${renderPair('Final', final3D.player1, final3D.player2, final3D?.matchWinner)}
        </div>`;
        html += `<div class="column"><div class="round-title">Semifinal</div>
            ${renderPair('SF2', semifinals3D[1].player1, semifinals3D[1].player2, semifinals3D[1]?.matchWinner)}
        </div>`;
        html += `<div class="column"><div class="round-title">Quarterfinals</div>
            ${renderPair('QF3', names[4], names[5], quarterfinals3D[2]?.matchWinner)}
            ${renderPair('QF4', names[6], names[7], quarterfinals3D[3]?.matchWinner)}
        </div>`;
    } else {
        html += `<div class="column"><div class="round-title">Semifinal</div>
            ${renderPair('SF1', names[0], names[1], semifinals3D[0]?.matchWinner)}
        </div>`;
        html += `<div class="column center"><div class="round-title">Final</div>
            ${renderPair('Final', final3D.player1, final3D.player2, final3D?.matchWinner)}
        </div>`;
        html += `<div class="column"><div class="round-title">Semifinal</div>
            ${renderPair('SF2', names[2], names[3], semifinals3D[1]?.matchWinner)}
        </div>`;
    }
    html += `</div>`;
    return html;
}

function renderBracket3D() {
    const bracketDiv = document.getElementById("bracket-container") as HTMLDivElement | null;
    if (!bracketDiv) return;
    bracketDiv.innerHTML = generateBracketHTML3D(tournamentNames3D, tournamentNames3D.length);
    bracketDiv.style.display = "block";
}

function advanceWinner3D(winnerName: string) {
    if (currentRound3D === "quarterfinals") {
        quarterfinals3D[currentMatchIndex3D].matchWinner = winnerName;
        const semiIdx = Math.floor(currentMatchIndex3D / 2);
        if (currentMatchIndex3D % 2 === 0) {
            semifinals3D[semiIdx].player1 = winnerName;
        } else {
            semifinals3D[semiIdx].player2 = winnerName;
        }
        currentMatchIndex3D++;
        if (currentMatchIndex3D >= 4) {
            currentRound3D = "semifinals";
            currentMatchIndex3D = 0;
        }
    } else if (currentRound3D === "semifinals") {
        semifinals3D[currentMatchIndex3D].matchWinner = winnerName;
        if (currentMatchIndex3D === 0) {
            final3D.player1 = winnerName;
        } else {
            final3D.player2 = winnerName;
        }
        currentMatchIndex3D++;
        if (currentMatchIndex3D >= 2) {
            currentRound3D = "final";
            currentMatchIndex3D = 0;
        }
    } else if (currentRound3D === "final") {
        final3D.matchWinner = winnerName;
        currentRound3D = "finished";
        renderBracket3D();
        alert(`Tournament Winner: ${winnerName}`);
        const buttonPlay = document.getElementById("PlayGame") as HTMLButtonElement | null;
        if (buttonPlay) buttonPlay.style.display = "none";
        return;
    }
    renderBracket3D();
}

function playCurrentMatch3D() {
    let p1: string | null = null;
    let p2: string | null = null;
    if (currentRound3D === "quarterfinals") {
        const m = quarterfinals3D[currentMatchIndex3D];
        p1 = m.player1; p2 = m.player2;
    } else if (currentRound3D === "semifinals") {
        const m = semifinals3D[currentMatchIndex3D];
        p1 = m.player1; p2 = m.player2;
    } else if (currentRound3D === "final") {
        p1 = final3D.player1; p2 = final3D.player2;
    }
    if (p1 && p2) {
        playerNames = [p1, p2];
        nbrPlayer = 2;
        const textPong3D = document.getElementById("PongGame") as HTMLHeadingElement | null;
        const bracketContainer3D = document.getElementById("bracket-container") as HTMLDivElement | null;
        const canvasContainer3D = document.getElementById("canvas-container") as HTMLDivElement | null;
        if (textPong3D) textPong3D.style.display = "none";
        if (bracketContainer3D) bracketContainer3D.style.display = "none";
        if (canvasContainer3D) canvasContainer3D.style.display = "block";
        initBabylon();
        startGame();
        stopBotPolling();
        console.log(`🎮 Starting tournament match: ${p1} vs ${p2}`);
    }
}

function showMenu3D(winnerName: string) {
    gameStarted = false;
    stopBotPolling();
    const canvasContainer3D = document.getElementById("canvas-container") as HTMLDivElement | null;
    const textPong3D = document.getElementById("PongGame") as HTMLHeadingElement | null;
    const bracketContainer3D = document.getElementById("bracket-container") as HTMLDivElement | null;
    const buttonPlayGame3D = document.getElementById("PlayGame") as HTMLButtonElement | null;
    const buttonMainMenu3D = document.getElementById("returnMenu") as HTMLButtonElement | null;
    if (canvasContainer3D) canvasContainer3D.style.display = "none";

    if (isTournament3D) {
        advanceWinner3D(winnerName);
        if (currentRound3D === "finished") {
            if (textPong3D) textPong3D.style.display = "block";
            if (bracketContainer3D) bracketContainer3D.style.display = "none";
            if (buttonPlayGame3D) buttonPlayGame3D.style.display = "none";
            if (buttonMainMenu3D) buttonMainMenu3D.style.display = "inline-block";
        } else {
            renderBracket3D();
            if (buttonPlayGame3D) {
                buttonPlayGame3D.disabled = false;
                buttonPlayGame3D.style.display = "inline-block";
            }
        }
    } else {
        if (textPong3D) textPong3D.style.display = "block";
        if (bracketContainer3D) bracketContainer3D.style.display = "none";
        if (buttonPlayGame3D) buttonPlayGame3D.style.display = "none";
        if (buttonMainMenu3D) buttonMainMenu3D.style.display = "inline-block";
    }
}

function finishGame3D(winnerIndex: number) {
    const winnerName = (playerNames && playerNames[winnerIndex]) ? playerNames[winnerIndex] : `Player ${winnerIndex + 1}`;
    showMenu3D(winnerName);
}

function checkVictory() {
    const idx = score3d.findIndex((s) => s >= 5);
    if (idx >= 0) finishGame3D(idx);
}

window.addEventListener("resize", () => {
    if (engine && engine.resize) {
        engine.resize();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const buttonLocalPlay3D = document.getElementById("LocalPlay") as HTMLButtonElement;
    const buttonRemotePlay3D = document.getElementById("RemotePlay") as HTMLButtonElement;
    const canvasContainer3D = document.getElementById("canvas-container")!;
    const textPong3D = document.getElementById("PongGame") as HTMLHeadingElement;

    const button2P3D = document.getElementById("Play2P") as HTMLButtonElement;
    const buttonAI3D = document.getElementById("PlayAI") as HTMLButtonElement;
    const button4P3D = document.getElementById("Play4P") as HTMLButtonElement;
    const buttonTournament3D = document.getElementById("Tournament") as HTMLButtonElement;
    const buttonMainMenu3D = document.getElementById("returnMenu") as HTMLButtonElement;

    // Modal elements for names (same ids as 2D)
    const playerNamesModal3D = document.getElementById("playerName") as HTMLDivElement;
    const playerInputsContainer3D = document.getElementById("playerInputsContainer") as HTMLDivElement;
    const startGameButton3D = document.getElementById("startGameButton") as HTMLButtonElement;
    const cancelButton3D = document.getElementById("cancelButton") as HTMLButtonElement;
    const modalTitle3D = document.getElementById("modalTitle") as HTMLHeadingElement;

    // Tournament controls
    const startTournamentButton3D = document.getElementById("StartTournament") as HTMLButtonElement;
    const selectNbrPlayer3D = document.getElementById("nbrPlayer") as HTMLSelectElement;
    const bracketContainer3D = document.getElementById("bracket-container") as HTMLDivElement;
    const buttonPlayGame3D = document.getElementById("PlayGame") as HTMLButtonElement;

    if (!buttonLocalPlay3D) {
        console.error("ButtonLocalPlay not found!");
        return;
    }

    console.log("All UI elements found, setting up event listeners...");

    function getCurrentUsername3D(): string {
        try {
            return localStorage.getItem('username') || 'Player 1';
        } catch {
            return 'Player 1';
        }
    }

    function showPlayerName3D(numberPlayers: number, gameType: 'local'|'tournament' = 'local') {
        if (!playerInputsContainer3D || !playerNamesModal3D || !modalTitle3D) return;
        playerInputsContainer3D.innerHTML = '';
        modalTitle3D.textContent = gameType === 'local' ? 'Inserisci i nomi dei giocatori' : 'Inserisci i nomi dei partecipanti al torneo';
        // Ask for names of players 2..N (player 1 will use current username)
        for (let i = 1; i < numberPlayers; i++) {
            const label = document.createElement('label');
            label.style.display = 'block';
            label.style.marginTop = '10px';
            label.textContent = `Player Name ${i + 1}: `;
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Player Name ${i + 1}`;
            input.id = `playerNameInput${i}`;
            input.style.display = 'block';
            input.style.margin = '10px auto';
            playerInputsContainer3D.appendChild(label);
            playerInputsContainer3D.appendChild(input);
            playerInputsContainer3D.appendChild(document.createElement('br'));
        }
        playerNamesModal3D.style.display = 'block';
    }

buttonLocalPlay3D.addEventListener("click", () => {
    buttonLocalPlay3D.style.display = "none";
    buttonRemotePlay3D.style.display = "none";
    button2P3D.style.display = "inline-block";
    buttonAI3D.style.display = "inline-block";
    button4P3D.style.display = "inline-block";
    buttonTournament3D.style.display = "inline-block";
    buttonMainMenu3D.style.display = "inline-block";
});

    button2P3D.addEventListener("click", () => {
        console.log("2 Player button clicked!");
        // Show modal to enter names first
        nbrPlayer = 2;
        showPlayerName3D(nbrPlayer, 'local');
    });

    buttonAI3D.addEventListener("click", () => {
        console.log("VS Bot button clicked!");

        button2P3D.style.display = "none";
        buttonAI3D.style.display = "none";
        buttonTournament3D.style.display = "none";
        buttonMainMenu3D.style.display = "none";
        textPong3D.style.display = "none";
        canvasContainer3D.style.display = "block";
        
        nbrPlayer = 1;
        initBabylon();
        startGame();
        console.log("🤖 3D VS Bot Game Started! nbrPlayer set to:", nbrPlayer);
    });

    button4P3D.addEventListener("click", () => {
        console.log("4 Player button clicked!");
        nbrPlayer = 4;
        FIELD_HEIGHT_3D = FIELD_WIDTH_3D;
        showPlayerName3D(nbrPlayer, 'local');
    });

    // buttonTournament3D.addEventListener("click", () => {
    //     // Mostra solo il bottone 4 Player per il torneo
    //     button4P3D.style.display = "inline-block";
    //     // ...eventuali altri bottoni...
    // });

    // // Quando torni al menu, nascondi di nuovo il bottone
    // buttonMainMenu3D.addEventListener("click", () => {
    //     button4P3D.style.display = "none";
    //     // ...eventuali altri bottoni...
    // });

    buttonMainMenu3D.addEventListener("click", () => {
    // Return to main menu
    buttonLocalPlay3D.style.display = "inline-block";
    buttonRemotePlay3D.style.display = "inline-block";
    button2P3D.style.display = "none";
    buttonAI3D.style.display = "none";
    buttonTournament3D.style.display = "none";
    buttonMainMenu3D.style.display = "none";
    });

    // Helper promises to mirror 2D flow
    let suppressLocalStartOnModal3D = false;
    function waitForStartButton3D(): Promise<number> {
        return new Promise((resolve) => {
            if (!startTournamentButton3D || !selectNbrPlayer3D) {
                resolve(4);
                return;
            }
            startTournamentButton3D.onclick = () => {
                const num = parseInt(selectNbrPlayer3D.value);
                resolve(num);
            };
        });
    }

    function waitForPlayerNames3D(): Promise<void> {
        return new Promise((resolve) => {
            const btn = document.getElementById("startGameButton") as HTMLButtonElement | null;
            const modal = document.getElementById("playerName") as HTMLDivElement | null;
            if (!btn || !modal) { resolve(); return; }
            suppressLocalStartOnModal3D = true;
            const handler = () => {
                btn.removeEventListener("click", handler);
                if (modal) modal.style.display = "none";
                suppressLocalStartOnModal3D = false;
                resolve();
            };
            btn.addEventListener("click", handler);
        });
    }

    // Tournament entry: show selector + StartTournament (like 2D)
    buttonTournament3D.addEventListener('click', async () => {
        isTournament3D = true;
        resetBracket3D();
        // hide others, show selector + start
        buttonLocalPlay3D.style.display = "none";
        buttonRemotePlay3D.style.display = "none";
        button2P3D.style.display = "none";
        buttonAI3D.style.display = "none";
        button4P3D.style.display = "none";
        buttonTournament3D.style.display = "none";
        textPong3D.style.display = "none";
        // Keep Main Menu hidden during tournament setup (parity with 2D)
        buttonMainMenu3D.style.display = "none";
        if (startTournamentButton3D) startTournamentButton3D.style.display = "inline-block";
        if (selectNbrPlayer3D) selectNbrPlayer3D.style.display = "inline-block";

        // Wait for StartTournament like 2D
        const num = await waitForStartButton3D();
        nbrPlayer = (!isNaN(num) && (num === 4 || num === 8)) ? num : 4;
        // Hide controls, open modal for names
        if (startTournamentButton3D) startTournamentButton3D.style.display = "none";
        if (selectNbrPlayer3D) selectNbrPlayer3D.style.display = "none";
        showPlayerName3D(nbrPlayer, 'tournament');
        await waitForPlayerNames3D();

        // Build tournament names (first from localStorage username)
        const names: string[] = [];
        names.push(getCurrentUsername3D());
        for (let i = 1; i < nbrPlayer; i++) {
            const input = document.getElementById(`playerNameInput${i}`) as HTMLInputElement | null;
            names.push((input && input.value && input.value.trim()) ? input.value.trim() : `Player ${i + 1}`);
        }
        tournamentNames3D = names.slice(0, nbrPlayer);

        // Fill bracket arrays like 2D
        if (nbrPlayer === 8) {
            quarterfinals3D = [];
            currentRound3D = "quarterfinals";
            for (let i = 0; i < nbrPlayer / 2; i++) {
                quarterfinals3D.push({
                    player1: tournamentNames3D[2 * i],
                    player2: tournamentNames3D[2 * i + 1],
                    matchWinner: null,
                    round: "quarterfinals"
                });
            }
            semifinals3D = [
                { player1: null, player2: null, matchWinner: null, round: "semifinals" },
                { player1: null, player2: null, matchWinner: null, round: "semifinals" }
            ];
        } else {
            currentRound3D = "semifinals";
            semifinals3D = [];
            for (let i = 0; i < nbrPlayer / 2; i++) {
                semifinals3D.push({
                    player1: tournamentNames3D[2 * i],
                    player2: tournamentNames3D[2 * i + 1],
                    matchWinner: null,
                    round: "semifinals"
                });
            }
        }
        final3D = { player1: null, player2: null, matchWinner: null, round: "final" };
        currentMatchIndex3D = 0;

        // Show bracket
        renderBracket3D();
        // Show Play Game button
        buttonPlayGame3D.disabled = false;
        buttonPlayGame3D.style.display = "inline-block";
    });

    // Start game after entering names
    if (startGameButton3D) {
        startGameButton3D.addEventListener('click', () => {
            if (!playerNamesModal3D) return;
            // Close modal; local flow proceeds only if not suppressed
            playerNamesModal3D.style.display = 'none';
            if (suppressLocalStartOnModal3D) return;

            // Local immediate start (2P/4P)
            const names: string[] = [];
            names.push(getCurrentUsername3D());
            for (let i = 1; i < Math.max(2, nbrPlayer); i++) {
                const input = document.getElementById(`playerNameInput${i}`) as HTMLInputElement | null;
                names.push((input && input.value && input.value.trim()) ? input.value.trim() : `Player ${i + 1}`);
            }
            playerNames = names;
            button2P3D.style.display = "none";
            buttonAI3D.style.display = "none";
            button4P3D.style.display = "none";
            buttonTournament3D.style.display = "none";
            buttonMainMenu3D.style.display = "none";
            textPong3D.style.display = "none";
            canvasContainer3D.style.display = "block";
            initBabylon();
            startGame();
            stopBotPolling();
            console.log(`3D Local Game Started with ${nbrPlayer} players. Names:`, playerNames);
        });
    }

    if (cancelButton3D) {
        cancelButton3D.addEventListener('click', () => {
            if (!playerNamesModal3D) return;
            playerNamesModal3D.style.display = 'none';
            // Match 2D behavior: cancel returns to Main Menu
            buttonMainMenu3D.click();
        });
    }

    // Play current tournament match (like 2D)
    if (buttonPlayGame3D) {
        buttonPlayGame3D.addEventListener('click', () => {
            playCurrentMatch3D();
            buttonPlayGame3D.disabled = true;
            buttonPlayGame3D.style.display = "none";
            bracketContainer3D.style.display = "none";
        });
    }
});

console.log("3D Pong Game Loaded!");

(window as any).startGame = startGame;