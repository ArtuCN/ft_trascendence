// Simple 3D Pong Game with Babylon.js
declare const BABYLON: any;

// Global game variables
let engine: any;
let scene: any;
let camera: any;
let canvas: HTMLCanvasElement;
let gameStarted = false;

// Variables needed by your classes (global scope for browser compatibility)
let nbrPlayer = 2; // Start with 2 players (will be set by game mode)
let playerGoals = [0, 0, 0, 0]; // Scores for up to 4 players
let isAIMode = false; // Flag to check if AI mode is active
let aiUpdateInterval = 100; // AI update frequency in ms

// Field dimensions (adjustable for 4-player square field)
let FIELD_WIDTH_3D = 18;
let FIELD_HEIGHT_3D = 12;
const FIELD_DEPTH_3D = 0.5;

// Game objects using your classes
let ball: any; // Will be instance of Ball class
let players: any[] = []; // Will be array of Player instances
// Corner obstacle cubes (created in initBabylon when nbrPlayer === 4)
let cornerCubes: any[] = [];

// Particle system for the ball trail
let ballParticleSystem: any = null;

// Keyboard controls (needed by paddle movement)
const keys: Record<string, boolean> = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Colori centralizzati per il 3D (usa BABYLON.Color3)
const COLORS = {
	// materiali
   ballDiffuse:    new BABYLON.Color3(0.88, 0.92, 0.98),  // bianco glaciale un filo più profondo
    ballEmissive:   new BABYLON.Color3(0.50, 0.82, 0.95),  // azzurro acqua più corposo
    paddleDefault:  new BABYLON.Color3(0.78, 0.90, 0.98),  // bianco-blu delicatamente scurito
    paddleRight:    new BABYLON.Color3(0.00, 0.60, 0.90),  // blu frutiger più intenso
    paddleTop:      new BABYLON.Color3(0.00, 0.88, 0.78),  // turchese acqua leggermente più profondo
    paddleBottom:   new BABYLON.Color3(0.28, 0.85, 0.82),  // acqua pastello più smorzato
    ground:         new BABYLON.Color3(0.36, 0.68, 0.78)   // azzurro più profondo e leggermente più scuro
};

// Function to create game objects using your classes
function createGameObjects(scene: any) {
    console.log("Creating game objects...");
    
    // Create Ball (simplified version of your Ball class)
    const ballMesh = BABYLON.MeshBuilder.CreateSphere("ball", {diameter: 0.5}, scene);
    const ballMaterial = new BABYLON.StandardMaterial("ballMaterial", scene);
    ballMaterial.diffuseColor = COLORS.ballDiffuse;
    ballMaterial.emissiveColor = COLORS.ballEmissive;
    ballMesh.material = ballMaterial;
    ballMesh.position = new BABYLON.Vector3(0, 0.5, 0);

    // ----------------------------------------------------------------------------
    // Particle trail for the ball
    // Requires a small particle texture at "textures/flare.png" (recommended).
    // If you don't have the texture, reduce particleSystem.particleTexture to a plain color or add the file.
    // ----------------------------------------------------------------------------
    try {
        ballParticleSystem = new BABYLON.ParticleSystem("ballTrail", 400, scene);
        // Particle texture - place a small glowing sprite at public/textures/flare.png
        ballParticleSystem.particleTexture = new BABYLON.Texture("textures/flare.png", scene);

        // Make the emitter the ball mesh so particles follow it
        ballParticleSystem.emitter = ballMesh;
        ballParticleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // emission from center
        ballParticleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);

        // Colors, size, lifetime
        ballParticleSystem.color1 = new BABYLON.Color4(1, 1, 1, 0.9);
        ballParticleSystem.color2 = new BABYLON.Color4(0.8, 0.95, 1, 0.6);
        ballParticleSystem.minSize = 0.04;
        ballParticleSystem.maxSize = 0.16;
        ballParticleSystem.minLifeTime = 0.2;
        ballParticleSystem.maxLifeTime = 0.6;

        // Emission and physics
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

        // Start emitting immediately (it follows the ball mesh)
        ballParticleSystem.start();
        console.log("✅ Ball particle system started");
    } catch (err) {
        console.warn("⚠️ Could not create ball particle system:", err);
    }
    // ----------------------------------------------------------------------------

    // Create a simple ball object that mimics your Ball class
    ball = {
        mesh: ballMesh,
        position: ballMesh.position,
        velocity: new BABYLON.Vector3(0.15, 0, 0.1), // Start moving towards right
        lastTouched: null as number | null,
        rallyActive: false as boolean,
        ballSize: 0.5,
        moveBall: function(players: any[]) {
            this.position.addInPlace(this.velocity);
            this.mesh.position.copyFrom(this.position);
            
            // Check collision with paddles FIRST
            this.checkPaddleCollisions(players);
            
            // Boundary / goal logic (use dynamic field half-sizes)
            const halfW = FIELD_WIDTH_3D / 2;
            const halfH = FIELD_HEIGHT_3D / 2;

            // If 4-player mode, treat Z-overflow as goals for player 3/4.
            if (nbrPlayer === 4) {
                if (this.position.z > halfH) {
                    // Goal: count only if a rally occurred and lastTouched is valid
                    if (this.rallyActive && this.lastTouched !== null) {
                        const scorer = this.lastTouched;
                        score3d[scorer] = (score3d[scorer] || 0) + 1;
                        updateScoreDisplay();
                    }
                    this.resetBall();
                    return;
                }
                if (this.position.z < -halfH) {
                    // Goal: count only if a rally occurred and lastTouched is valid
                    if (this.rallyActive && this.lastTouched !== null) {
                        const scorer = this.lastTouched;
                        score3d[scorer] = (score3d[scorer] || 0) + 1;
                        updateScoreDisplay();
                    }
                    this.resetBall();
                    return;
                }
            } else {
                // 2-player mode: bounce on top/bottom walls
                if (this.position.z > halfH || this.position.z < -halfH) {
                    this.velocity.z *= -1;
                    // Keep ball inside bounds
                    this.position.z = (this.position.z > 0 ? 1 : -1) * (halfH - this.ballSize/2);
                    this.mesh.position.copyFrom(this.position);
                }
            }
            
            // Goal checks (reset ball)
            if (this.position.x < -halfW) {
                // Goal: count only if a rally occurred and lastTouched is valid
                if (this.rallyActive && this.lastTouched !== null) {
                    const scorer = this.lastTouched;
                    score3d[scorer] = (score3d[scorer] || 0) + 1;
                    updateScoreDisplay();
                }
                this.resetBall();
            }
            if (this.position.x > halfW) {
                // Goal: count only if a rally occurred and lastTouched is valid
                if (this.rallyActive && this.lastTouched !== null) {
                    const scorer = this.lastTouched;
                    score3d[scorer] = (score3d[scorer] || 0) + 1;
                    updateScoreDisplay();
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
                
                // Calculate paddle bounds
                const paddleMinX = paddlePos.x - paddleWidth / 2;
                const paddleMaxX = paddlePos.x + paddleWidth / 2;
                const paddleMinZ = paddlePos.z - paddleDepth / 2;
                const paddleMaxZ = paddlePos.z + paddleDepth / 2;
                const paddleMinY = paddlePos.y - paddleHeight / 2;
                const paddleMaxY = paddlePos.y + paddleHeight / 2;
                
                // Check if ball is colliding with paddle
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
                    
                    // Horizontal bounce (left/right paddles)
                    this.velocity.x *= -1;
                    
                    // Add spin based on where ball hit the paddle
                    const hitPosition = (this.position.z - paddlePos.z) / (paddleDepth / 2);
                    this.velocity.z += hitPosition * 0.05;
                    
                    // Move ball away from paddle to prevent multiple collisions
                    if (this.position.x > paddlePos.x) {
                        this.position.x = paddleMaxX + ballRadius + 0.1;
                    } else {
                        this.position.x = paddleMinX - ballRadius - 0.1;
                    }
                    this.mesh.position.copyFrom(this.position);
                    
                    // Slightly increase speed (optional)
                    this.velocity.x *= 1.05;
                    this.velocity.z *= 1.02;
                }
            });

            // Check collision with corner cubes (treat cubes as AABB)
            cornerCubes.forEach((cube: any) => {
                try {
                    const boxPos = cube.position;
                    const half = (cube.metadata && cube.metadata.halfSize) ? cube.metadata.halfSize : 0.5;

                    // Compute overlap on X and Z between sphere center and box
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
                    // ignore per-cube errors
                }
            });
        },
        
        resetBall: function() {
            this.position = new BABYLON.Vector3(0, 0.5, 0);
            this.mesh.position.copyFrom(this.position);
            // clear last toucher on reset
            this.lastTouched = null;
            this.rallyActive = false;
            
            // Random direction
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
    
    // Create Players (simplified version of your Player class)
    players = [];
    
    // Player 0 (left paddle)
    const paddle1Mesh = BABYLON.MeshBuilder.CreateBox("paddle0", 
        {width: 0.3, height: 1, depth: 3}, scene);
    const paddle1Material = new BABYLON.StandardMaterial("paddle0Material", scene);
    paddle1Material.diffuseColor = COLORS.paddleDefault;
    paddle1Material.emissiveColor = new BABYLON.Color3(0.2,0.2,0.2); // small tint kept
    paddle1Mesh.material = paddle1Material;
    paddle1Mesh.position = new BABYLON.Vector3(-FIELD_WIDTH_3D / 2 + 0.2, 0.5, 0);
    
    // Player 1 (right paddle)  
    const paddle2Mesh = BABYLON.MeshBuilder.CreateBox("paddle1",
        {width: 0.3, height: 1, depth: 3}, scene);
    const paddle2Material = new BABYLON.StandardMaterial("paddle1Material", scene);
    paddle2Material.diffuseColor = COLORS.paddleRight;
    paddle2Material.emissiveColor = new BABYLON.Color3(0.2,0,0);
    paddle2Mesh.material = paddle2Material;
    paddle2Mesh.position = new BABYLON.Vector3(FIELD_WIDTH_3D / 2 - 0.2, 0.5, 0);
    
    // Create simple player objects that mimic your Player class
    players.push({
        id: 0,
        mesh: paddle1Mesh,
        position: paddle1Mesh.position,
        drawAndMove: function() {
            // Player 0 controls: W/S keys
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
    
    // Player 1 (right paddle) - Human or AI depending on mode
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
                // Clamp position
                if (this.position.z > vLimit) this.position.z = vLimit;
                if (this.position.z < -vLimit) this.position.z = -vLimit;
                this.mesh.position.copyFrom(this.position);
            } else if (nbrPlayer !== 1) {
                // Human Mode: Arrow keys  
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
    
    // Add paddles for 4 player mode
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
                // Player 2 controls: D/F keys
                // horizontal limit based on field height (top/bottom paddles move along X relative to field height)
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
        // Assign material to the mesh (was missing previously)
        paddle4Mesh.material = paddle4Material;
        // Ensure position is explicitly set before pushing the player
        paddle4Mesh.position = new BABYLON.Vector3(0, 0.5, -FIELD_HEIGHT_3D / 2 + 0.3);
        console.log("Paddle4 initial position:", paddle4Mesh.position);

        players.push({
            id: 3,
            mesh: paddle4Mesh,
            position: paddle4Mesh.position,
            drawAndMove: function() {
                // Player 3 controls: J/K keys
                // horizontal limit based on field height (top/bottom paddles move along X relative to field height)
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

// Bot polling variables
let botPollingId: number | null = null;
let botKey: string | null = null;

// Start bot polling (call this when starting AI mode)
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

// Stop bot polling (call this when stopping AI mode)
function stopBotPolling() {
    if (botPollingId !== null) {
        clearInterval(botPollingId);
        botPollingId = null;
    }
}

// Send bot data and get decision (returns a Promise)
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
        // Stampa sempre la decisione ricevuta
        console.log(`[BOT] AI decision received: ${data.key}`);
        return data.key;
    } catch (error) {
        console.error('[BOT] AI request failed:', error);
        console.log(`[BOT] AI decision received: null`);
        return null;
    }
}

// Function to setup manual camera controls
function setupManualCameraControls(camera: any, canvas: HTMLCanvasElement) {
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    
    // Mouse down event
    canvas.addEventListener('mousedown', (event) => {
        isMouseDown = true;
        mouseX = event.clientX;
        mouseY = event.clientY;
        canvas.style.cursor = 'grabbing';
    });
    
    // Mouse up event
    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
        canvas.style.cursor = 'grab';
    });
    
    // Mouse leave event (in case mouse leaves canvas while dragging)
    canvas.addEventListener('mouseleave', () => {
        isMouseDown = false;
        canvas.style.cursor = 'grab';
    });
    
    // Mouse move event
    canvas.addEventListener('mousemove', (event) => {
        if (!isMouseDown) return;
        
        const deltaX = event.clientX - mouseX;
        const deltaY = event.clientY - mouseY;
        
        // Update camera angles
        camera.alpha -= deltaX * 0.01; // Horizontal rotation
        camera.beta += deltaY * 0.01;  // Vertical rotation
        
        // Clamp beta to prevent flipping
        camera.beta = Math.max(0.1, Math.min(Math.PI - 0.1, camera.beta));
        
        mouseX = event.clientX;
        mouseY = event.clientY;
    });
    
    // Mouse wheel event for zoom
    canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        
        const zoomSpeed = 0.1;
        if (event.deltaY > 0) {
            // Zoom out
            camera.radius += zoomSpeed;
        } else {
            // Zoom in
            camera.radius -= zoomSpeed;
        }
        
        // Clamp zoom limits
        camera.radius = Math.max(5, Math.min(25, camera.radius));
    });
    
    // Set initial cursor
    canvas.style.cursor = 'grab';
    
    console.log("🖱️  Manual mouse controls ready:");
    console.log("   - Drag to rotate camera");
    console.log("   - Mouse wheel to zoom in/out");
}

// Helper: check sphere-AABB overlap. boxHalfX/Y/Z are half-sizes of the box.
function sphereIntersectsBox(spherePos: any, radius: number, boxPos: any, boxHalfX: number, boxHalfY: number, boxHalfZ: number) {
    const dx = Math.max(Math.abs(spherePos.x - boxPos.x) - boxHalfX, 0);
    const dy = Math.max(Math.abs(spherePos.y - boxPos.y) - boxHalfY, 0);
    const dz = Math.max(Math.abs(spherePos.z - boxPos.z) - boxHalfZ, 0);
    return (dx*dx + dy*dy + dz*dz) <= (radius * radius);
}

// Function to initialize Babylon.js scene
function initBabylon() {
    console.log("🚀 Initializing Babylon.js...");
    
    // Check if BABYLON is available
    if (typeof BABYLON === 'undefined') {
        console.error("❌ BABYLON.js is not loaded!");
        return;
    }
    console.log("✅ BABYLON.js is available");
    
    // Get canvas element (correct ID)
    canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    if (!canvas) {
        console.error("❌ Canvas not found!");
        return;
    }
    console.log("✅ Canvas found:", canvas);
    console.log("Canvas dimensions:", canvas.width, "x", canvas.height);

    try {
        // Create engine
        engine = new BABYLON.Engine(canvas, true);
        console.log("✅ Engine created successfully");

        // Create scene
        scene = new BABYLON.Scene(engine);
        // Set darker azure background for the scene
        scene.clearColor = new BABYLON.Color4(0.20, 0.45, 0.70, 1.0);
        console.log("✅ Scene created successfully");
    } catch (error) {
        console.error("❌ Error creating engine/scene:", error);
        return;
    }

    try {
        // Create ArcRotate camera for better mouse controls
        camera = new BABYLON.ArcRotateCamera("camera1", -Math.PI/2, Math.PI/2.5, 12, BABYLON.Vector3.Zero(), scene);
        // ATTACH CAMERA TO CANVAS so Babylon handles pointer input
        // This enables standard arc-rotate mouse drag/zoom controls
        try {
            camera.attachControl(canvas, true);
            console.log("✅ Camera attached to canvas for pointer controls");
        } catch (e) {
            console.warn("⚠️ camera.attachControl failed:", e);
        }
        
        // Disabilita i controlli da tastiera della ArcRotateCamera (frecce)
        // in modo che le freccette non muovano la camera: solo il mouse la controlla.
        try {
            camera.keysUp = [];
            camera.keysDown = [];
            camera.keysLeft = [];
            camera.keysRight = [];
            console.log("✅ Camera keyboard controls disabled (arrow keys won't move camera)");
        } catch (e) {
            console.warn("⚠️ Failed to clear camera key bindings:", e);
        }
        
        // Set camera limits to keep it reasonable
        camera.lowerRadiusLimit = 5;   // Min zoom distance
        camera.upperRadiusLimit = 25;  // Max zoom distance  
        camera.lowerBetaLimit = 0.1;   // Min vertical angle (almost top-down)
        camera.upperBetaLimit = Math.PI/2 * 0.95; // Max vertical angle (almost horizontal)
        
        // Manual mouse controls implementation
        setupManualCameraControls(camera, canvas);
        console.log("✅ Manual mouse controls implemented");
        
        console.log("✅ ArcRotate camera created successfully");
        console.log("🖱️  Try mouse controls: Drag to rotate, Wheel to zoom");

        // Create light
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        console.log("✅ Light created");

        // Create the playing field (use dynamic field size variables)
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: FIELD_WIDTH_3D, height: FIELD_HEIGHT_3D}, scene);
        const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
        groundMaterial.diffuseColor = COLORS.ground;
        // Reduce shiny reflections on the ground: lower specular color and power
        groundMaterial.specularColor = new BABYLON.Color3(0.03, 0.03, 0.03);
        groundMaterial.specularPower = 8;
        ground.material = groundMaterial;
        console.log("✅ Playing field created");

        // Create corner cubes only when in 4-player mode
        if (nbrPlayer === 4) {
            // --------------------------------------------------------------------
            // Corner cubes: one cube in each corner of the playing field
            // Positioned using FIELD_WIDTH_3D and FIELD_HEIGHT_3D so they follow
            // changes (e.g. when 4-player makes the field square).
            // --------------------------------------------------------------------
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
                    // Use predefined palette colors for consistency
                    mat.diffuseColor = cornerColors[idx % cornerColors.length];
                    cube.material = mat;
                    cube.position = pos;
                    // mark with half-size for collision checks and register
                    (cube as any).metadata = { halfSize: cornerSize / 2 };
                    cornerCubes.push(cube);
                });

                console.log("✅ Corner cubes created (4-player)");
            } catch (err) {
                console.warn("⚠️ Could not create corner cubes:", err);
            }
        }

        // Create game objects using your classes
        createGameObjects(scene);
        console.log("✅ Game objects created using your classes");

        // Start bot polling ONLY if AI mode is active and objects are ready
        if (nbrPlayer === 1) startBotPolling();
        else stopBotPolling();
    } catch (error) {
        console.error("❌ Error creating 3D objects:", error);
        return;
    }
    
    console.log("✅ All 3D objects created successfully");

    // Force immediate render to test
    scene.render();
    scene.clearColor = new BABYLON.Color4(0.40, 0.45, 0.70, 1.0);
    console.log("✅ First render executed");

    // Game loop using your classes - MOVED INSIDE initBabylon()
    engine.runRenderLoop(() => {
        if (gameStarted && ball && players.length > 0) {
            // Update players (handles paddle movement)
            players.forEach(player => player.drawAndMove());
            
            // Update ball (handles movement, collisions, goals)
            ball.moveBall(players);
        }
        
        scene.render();
    });
    
    console.log("✅ Game loop started successfully");
}

// Punteggio dei giocatori
let score3d: number[] = [];

// Funzione per aggiornare il punteggio su schermo
function updateScoreDisplay() {
    const scoreDiv = document.getElementById("score3d");
    if (!scoreDiv) return;

    // Mostra dinamicamente i punteggi esistenti
    if (!score3d || score3d.length === 0) {
        scoreDiv.innerText = "";
        return;
    }

    // Costruisci stringa punteggi in base al numero di giocatori
    const labels = score3d.map((s, idx) => `Player ${idx + 1}: ${s}`);
    scoreDiv.innerText = labels.join("   ");
}

// Start game function
function startGame() {
    // Inizializza array punteggi in base al numero di giocatori attuale
    score3d = new Array(Math.max(2, nbrPlayer)).fill(0);

    updateScoreDisplay();
    gameStarted = true;
    if (nbrPlayer === 1) startBotPolling();
    else stopBotPolling();
    console.log("3D Pong Game Started!");
}

// Handle window resize
window.addEventListener("resize", () => {
    if (engine && engine.resize) {
        engine.resize();
    }
});

// Wait for DOM to load before setting up UI
document.addEventListener('DOMContentLoaded', () => {
    // UI Elements for 3D Pong
    const buttonLocalPlay3D = document.getElementById("LocalPlay") as HTMLButtonElement;
    const buttonRemotePlay3D = document.getElementById("RemotePlay") as HTMLButtonElement;
    const canvasContainer3D = document.getElementById("canvas-container")!;
    const textPong3D = document.getElementById("PongGame") as HTMLHeadingElement;

    // Get references to submenu buttons
    const button2P3D = document.getElementById("Play2P") as HTMLButtonElement;
    const buttonAI3D = document.getElementById("PlayAI") as HTMLButtonElement;
    const button4P3D = document.getElementById("Play4P") as HTMLButtonElement;
    const buttonTournament3D = document.getElementById("Tournament") as HTMLButtonElement;
    const buttonMainMenu3D = document.getElementById("returnMenu") as HTMLButtonElement;

    // Check if elements exist
    if (!buttonLocalPlay3D) {
        console.error("ButtonLocalPlay not found!");
        return;
    }

    console.log("All UI elements found, setting up event listeners...");

// Event listeners for 3D Pong
buttonLocalPlay3D.addEventListener("click", () => {
    // Step 1: Hide main menu, show submenu (like 2D Pong)
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
        // Step 2: Hide submenu, start 2 player game
        button2P3D.style.display = "none";
        buttonAI3D.style.display = "none";
        buttonTournament3D.style.display = "none";
        buttonMainMenu3D.style.display = "none";
        textPong3D.style.display = "none";
        canvasContainer3D.style.display = "block";
        
        // Set player count BEFORE initializing Babylon
        nbrPlayer = 2; // Set to 2 players
        // Initialize Babylon.js only when needed
        initBabylon();
        // Properly start game (initializes score array etc.)
        startGame();
        stopBotPolling();
        console.log("3D Local 2 Player Game Started!");
    });

    buttonAI3D.addEventListener("click", () => {
        console.log("VS Bot button clicked!");
        // Step 2: Hide submenu, start AI game
        button2P3D.style.display = "none";
        buttonAI3D.style.display = "none";
        buttonTournament3D.style.display = "none";
        buttonMainMenu3D.style.display = "none";
        textPong3D.style.display = "none";
        canvasContainer3D.style.display = "block";
        
        // Set player count BEFORE initializing Babylon
        nbrPlayer = 1; // Set to 1 human player + AI
        // Initialize Babylon.js only when needed
        initBabylon();
        // Properly start game (initializes score array and bot polling)
        startGame();
        console.log("🤖 3D VS Bot Game Started! nbrPlayer set to:", nbrPlayer);
    });

    button4P3D.addEventListener("click", () => {
        console.log("4 Player button clicked!");
        // Nascondi submenu e mostra canvas
        button2P3D.style.display = "none";
        buttonAI3D.style.display = "none";
        button4P3D.style.display = "none";
        buttonTournament3D.style.display = "none";
        buttonMainMenu3D.style.display = "none";
        textPong3D.style.display = "none";
        canvasContainer3D.style.display = "block";

        // Imposta 4 giocatori e avvia la partita (nbrPlayer FIRST)
        nbrPlayer = 4;
        // Make the 3D field square for 4 players
        FIELD_HEIGHT_3D = FIELD_WIDTH_3D;
        // Initialize Babylon and then start game so score3d is created
        initBabylon();
        startGame();
        stopBotPolling(); // Nessun bot in 4P
        console.log("3D 4 Player Game Started!");
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
}); // End DOMContentLoaded

console.log("3D Pong Game Loaded!");

// Make startGame function global for HTML onclick
(window as any).startGame = startGame;