// // Simple 3D Pong Game with Babylon.js
// declare const BABYLON: any;

// // Global game variables
// let gameStarted = false;
// let engine: any;
// let scene: any;
// let ballMesh: any;
// let paddle1Mesh: any;
// let paddle2Mesh: any;
// let ballVelocity: any;
// let camera: any;
// let canvas: HTMLCanvasElement;

// // Create camera
// const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
// camera.setTarget(BABYLON.Vector3.Zero());
// camera.attachControls(canvas, true);

// // Create light
// const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// // Create basic pong elements
// const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 10}, scene);
// const ball = BABYLON.MeshBuilder.CreateSphere("ball", {diameter: 0.5}, scene);
// ball.position.y = 0.5;

// // Create paddles
// const paddle1 = BABYLON.MeshBuilder.CreateBox("paddle1", {width: 0.2, height: 2, depth: 0.2}, scene);
// paddle1.position.x = -9;
// paddle1.position.y = 1;

// const paddle2 = BABYLON.MeshBuilder.CreateBox("paddle2", {width: 0.2, height: 2, depth: 0.2}, scene);
// paddle2.position.x = 9;
// paddle2.position.y = 1;

// // Add materials
// const ballMaterial = new BABYLON.StandardMaterial("ballMat", scene);
// ballMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
// ball.material = ballMaterial;

// const paddleMaterial = new BABYLON.StandardMaterial("paddleMat", scene);
// paddleMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0);
// paddle1.material = paddleMaterial;
// paddle2.material = paddleMaterial;

// // Game variables
// let ballVelocity = new BABYLON.Vector3(0.1, 0, 0.05);
// let gameStarted = false;
// const paddleSpeed = 0.2;

// // Keyboard controls
// const keys: Record<string, boolean> = {};
// window.addEventListener('keydown', (e) => {
//     keys[e.key.toLowerCase()] = true;
// });
// window.addEventListener('keyup', (e) => {
//     keys[e.key.toLowerCase()] = false;
// });

// // Start game function
// function startGame() {
//     gameStarted = true;
//     console.log("3D Pong Game Started!");
// }

// // Game loop
// engine.runRenderLoop(() => {
//     if (gameStarted) {
//         // Player controls
//         // Player 1 (left paddle): W/S keys
//         if (keys['w'] && paddle1.position.z < 4) {
//             paddle1.position.z += paddleSpeed;
//         }
//         if (keys['s'] && paddle1.position.z > -4) {
//             paddle1.position.z -= paddleSpeed;
//         }
        
//         // Player 2 (right paddle): Arrow keys
//         if (keys['arrowup'] && paddle2.position.z < 4) {
//             paddle2.position.z += paddleSpeed;
//         }
//         if (keys['arrowdown'] && paddle2.position.z > -4) {
//             paddle2.position.z -= paddleSpeed;
//         }
        
//         // Move ball
//         ball.position.addInPlace(ballVelocity);
        
//         // Ball collision with walls
//         if (ball.position.z > 4.5 || ball.position.z < -4.5) {
//             ballVelocity.z *= -1;
//         }
        
//         // Ball collision with paddles
//         if (ball.position.x < -8.5 && Math.abs(ball.position.z - paddle1.position.z) < 1) {
//             ballVelocity.x *= -1;
//         }
//         if (ball.position.x > 8.5 && Math.abs(ball.position.z - paddle2.position.z) < 1) {
//             ballVelocity.x *= -1;
//         }
        
//         // Reset ball if it goes out
//         if (ball.position.x < -10 || ball.position.x > 10) {
//             ball.position = new BABYLON.Vector3(0, 0.5, 0);
//             ballVelocity = new BABYLON.Vector3(Math.random() > 0.5 ? 0.1 : -0.1, 0, (Math.random() - 0.5) * 0.1);
//         }
//     }
    
//     scene.render();
// });

// // Handle window resize
// window.addEventListener("resize", () => {
//     engine.resize();
// });

// // Wait for DOM to load before setting up UI
// document.addEventListener('DOMContentLoaded', () => {
//     // UI Elements for 3D Pong
//     const buttonLocalPlay3D = document.getElementById("LocalPlay") as HTMLButtonElement;
//     const buttonRemotePlay3D = document.getElementById("RemotePlay") as HTMLButtonElement;
//     const canvasContainer3D = document.getElementById("canvas-container")!;
//     const textPong3D = document.getElementById("PongGame") as HTMLHeadingElement;

//     // Get references to submenu buttons
//     const button2P3D = document.getElementById("Play2P") as HTMLButtonElement;
//     const buttonAI3D = document.getElementById("PlayAI") as HTMLButtonElement;
//     const buttonTournament3D = document.getElementById("Tournament") as HTMLButtonElement;
//     const buttonMainMenu3D = document.getElementById("returnMenu") as HTMLButtonElement;

//     // Check if elements exist
//     if (!buttonLocalPlay3D) {
//         console.error("ButtonLocalPlay not found!");
//         return;
//     }

//     console.log("All UI elements found, setting up event listeners...");

// // Event listeners for 3D Pong
// buttonLocalPlay3D.addEventListener("click", () => {
//     // Step 1: Hide main menu, show submenu (like 2D Pong)
//     buttonLocalPlay3D.style.display = "none";
//     buttonRemotePlay3D.style.display = "none";
//     button2P3D.style.display = "inline-block";
//     buttonAI3D.style.display = "inline-block";
//     buttonTournament3D.style.display = "inline-block";
//     buttonMainMenu3D.style.display = "inline-block";
// });

// button2P3D.addEventListener("click", () => {
//     // Step 2: Hide submenu, start 2 player game
//     button2P3D.style.display = "none";
//     buttonAI3D.style.display = "none";
//     buttonTournament3D.style.display = "none";
//     buttonMainMenu3D.style.display = "none";
//     textPong3D.style.display = "none";
//     canvasContainer3D.style.display = "block";
    
//     // Start 2 player 3D game
//     gameStarted = true;
//     console.log("3D Local 2 Player Game Started!");
// });

// buttonMainMenu3D.addEventListener("click", () => {
//     // Return to main menu
//     buttonLocalPlay3D.style.display = "inline-block";
//     buttonRemotePlay3D.style.display = "inline-block";
//     button2P3D.style.display = "none";
//     buttonAI3D.style.display = "none";
//     buttonTournament3D.style.display = "none";
//     buttonMainMenu3D.style.display = "none";
//     });
// }); // End DOMContentLoaded

// console.log("3D Pong Game Loaded!");

// // Make startGame function global for HTML onclick
// (window as any).startGame = startGame;