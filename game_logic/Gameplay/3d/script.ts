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

// Game objects using your classes
let ball: any; // Will be instance of Ball class
let players: any[] = []; // Will be array of Player instances

// Keyboard controls (needed by paddle movement)
const keys: Record<string, boolean> = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Function to create game objects using your classes
function createGameObjects(scene: any) {
    console.log("Creating game objects...");
    
    // Create Ball (simplified version of your Ball class)
    const ballMesh = BABYLON.MeshBuilder.CreateSphere("ball", {diameter: 0.5}, scene);
    const ballMaterial = new BABYLON.StandardMaterial("ballMaterial", scene);
    ballMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    ballMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    ballMesh.material = ballMaterial;
    ballMesh.position = new BABYLON.Vector3(0, 0.5, 0);
    
    // Create a simple ball object that mimics your Ball class
    ball = {
        mesh: ballMesh,
        position: ballMesh.position,
        velocity: new BABYLON.Vector3(0.15, 0, 0.1), // Start moving towards right
        ballSize: 0.5,
        moveBall: function(players: any[]) {
            this.position.addInPlace(this.velocity);
            this.mesh.position.copyFrom(this.position);
            
            // Check collision with paddles FIRST
            this.checkPaddleCollisions(players);
            
            // Boundary checks for top/bottom walls
            if (this.position.z > 6 || this.position.z < -6) {
                this.velocity.z *= -1;
                // Keep ball inside bounds
                this.position.z = (this.position.z > 0 ? 1 : -1) * (6 - this.ballSize/2);
                this.mesh.position.copyFrom(this.position);
            }
            
            // Goal checks (reset ball)
            if (this.position.x < -9 || this.position.x > 9) {
                console.log("Goal scored! Resetting ball...");
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
        },
        
        resetBall: function() {
            this.position = new BABYLON.Vector3(0, 0.5, 0);
            this.mesh.position.copyFrom(this.position);
            
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
    paddle1Material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    paddle1Material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    paddle1Mesh.material = paddle1Material;
    paddle1Mesh.position = new BABYLON.Vector3(-8.8, 0.5, 0);
    
    // Player 1 (right paddle)  
    const paddle2Mesh = BABYLON.MeshBuilder.CreateBox("paddle1",
        {width: 0.3, height: 1, depth: 3}, scene);
    const paddle2Material = new BABYLON.StandardMaterial("paddle1Material", scene);
    paddle2Material.diffuseColor = new BABYLON.Color3(1, 0, 0);
    paddle2Material.emissiveColor = new BABYLON.Color3(0.2, 0, 0);
    paddle2Mesh.material = paddle2Material;
    paddle2Mesh.position = new BABYLON.Vector3(8.8, 0.5, 0);
    
    // Create simple player objects that mimic your Player class
    players.push({
        id: 0,
        mesh: paddle1Mesh,
        position: paddle1Mesh.position,
        drawAndMove: function() {
            // Player 0 controls: W/S keys
            if (keys['w'] || keys['W']) {
                if (this.position.z < 4.5) this.position.z += 0.15;
            }
            if (keys['s'] || keys['S']) {
                if (this.position.z > -4.5) this.position.z -= 0.15;
            }
            this.mesh.position.copyFrom(this.position);
        }
    });
    
    // Player 1 (right paddle) - Human or AI depending on mode
    const player1 = {
        id: 1,
        mesh: paddle2Mesh,
        position: paddle2Mesh.position,
        lastAIUpdate: Date.now(),
        drawAndMove: function() {
            if (nbrPlayer === 1) {
                // AI Mode: Get AI decision periodically
                console.log("🤖 Player 1 in AI mode (nbrPlayer=" + nbrPlayer + ")");
                const now = Date.now();
                if (now - this.lastAIUpdate > aiUpdateInterval) {
                    console.log("🤖 AI update triggered. Ball Z:", ball ? ball.position.z : "no ball", "Paddle Z:", this.position.z);
                    this.updateAI();
                    this.lastAIUpdate = now;
                }
            } else {
                // Human Mode: Arrow keys  
                console.log("👤 Player 1 in human mode (nbrPlayer=" + nbrPlayer + ")");
                if (keys['ArrowUp']) {
                    if (this.position.z < 4.5) this.position.z += 0.15;
                }
                if (keys['ArrowDown']) {
                    if (this.position.z > -4.5) this.position.z -= 0.15;
                }
            }
            this.mesh.position.copyFrom(this.position);
        },
        updateAI: function() {
            console.log("🔧 updateAI called");
            if (!ball) {
                console.log("🤖 AI update: No ball found");
                return;
            }
            
            // Scale 3D coordinates to 2D pixel-like values for AI (multiply by 100)
            const scaledBallY = ball.position.z * 100;
            const scaledPaddleY = this.position.z * 100;
            
            console.log("🤖 Requesting AI decision for ball_y:", scaledBallY, "paddle_y:", scaledPaddleY, "(scaled from", ball.position.z, ",", this.position.z, ")");
            
            // Get AI decision based on ball and paddle positions
            const self = this;
            getAIDecision(scaledBallY, scaledPaddleY, function(aiDecision) {
                console.log("🤖 AI decision received:", aiDecision);
                if (aiDecision === 'ArrowUp' && self.position.z < 4.5) {
                    self.position.z += 0.15;
                    console.log("🤖 AI moving paddle UP to:", self.position.z);
                    self.mesh.position.copyFrom(self.position);
                } else if (aiDecision === 'ArrowDown' && self.position.z > -4.5) {
                    self.position.z -= 0.15;
                    console.log("🤖 AI moving paddle DOWN to:", self.position.z);
                    self.mesh.position.copyFrom(self.position);
                } else if (aiDecision === null) {
                    console.log("🤖 AI staying in position");
                } else {
                    console.log("🤖 AI decision not applicable:", aiDecision, "paddle z:", self.position.z, "limits: -4.5 to 4.5");
                }
            });
        }
    };
    
    players.push(player1);
    
    console.log("✅ Game objects created (temporary simple version)");
}

// Function to get AI decision from the backend (using callbacks for ES5 compatibility)
function getAIDecision(ballZ: number, paddleZ: number, callback: (decision: string | null) => void) {
    fetch('/ai/3d', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ball_y: ballZ,      // In 3D, Z is the vertical axis for paddles
            paddle_y: paddleZ   // Current paddle position
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        callback(data.key);
    })
    .catch(error => {
        console.error('AI request failed:', error);
        callback(null);
    });
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
        console.log("✅ Scene created successfully");
    } catch (error) {
        console.error("❌ Error creating engine/scene:", error);
        return;
    }

    try {
        // Create ArcRotate camera for better mouse controls
        camera = new BABYLON.ArcRotateCamera("camera1", -Math.PI/2, Math.PI/2.5, 12, BABYLON.Vector3.Zero(), scene);
        
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

        // Create the playing field
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 18, height: 12}, scene);
        const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.8, 0.1); // Green field
        ground.material = groundMaterial;
        console.log("✅ Playing field created");

        // Create game objects using your classes
        createGameObjects(scene);
        console.log("✅ Game objects created using your classes");
        
    } catch (error) {
        console.error("❌ Error creating 3D objects:", error);
        return;
    }
    
    console.log("✅ All 3D objects created successfully");

    // Force immediate render to test
    scene.render();
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

// Start game function
function startGame() {
    gameStarted = true;
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
        
        // Initialize Babylon.js only when needed
        initBabylon();
        
        // Start 2 player 3D game
        nbrPlayer = 2; // Set to 2 players
        gameStarted = true;
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
        
        // Initialize Babylon.js only when needed
        initBabylon();
        
        // Start AI game (Player 0 vs Bot)
        nbrPlayer = 1; // Set to 1 human player + AI
        gameStarted = true;
        console.log("🤖 3D VS Bot Game Started! nbrPlayer set to:", nbrPlayer);
    });

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