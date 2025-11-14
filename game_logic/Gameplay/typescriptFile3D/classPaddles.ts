import { type PaddleOrientation, keysPressed, FIELD_WIDTH, FIELD_HEIGHT } from "./variables3D.js"
import { nbrPlayer } from "../script.js"

// Babylon.js caricato come file locale - variabili globali
declare const BABYLON: any;

export class Paddles {
  private id: number
  private orientation: PaddleOrientation
  private paddleLength: number
  private paddleThickness: number
  private paddleHeight: number
  private speed = 0.15
  private position: any
  private mesh: any
  private scene: any

  public constructor(id: number, orientation: PaddleOrientation, scene: any) {
    this.id = id
    this.orientation = orientation
    this.scene = scene

    if (orientation === "vertical") {
      this.paddleLength = 3
      this.paddleThickness = 0.3
      this.paddleHeight = 1
      this.position = new BABYLON.Vector3(id === 0 ? -FIELD_WIDTH / 2 + 0.2 : FIELD_WIDTH / 2 - 0.2, 0.5, 0)
    } else {
      this.paddleLength = 3
      this.paddleThickness = 0.3
      this.paddleHeight = 1
      this.position = new BABYLON.Vector3(0, 0.5, id === 2 ? -FIELD_HEIGHT / 2 + 0.2 : FIELD_HEIGHT / 2 - 0.2)
    }

    // Crea la mesh del paddle
    if (orientation === "vertical") {
      this.mesh = BABYLON.MeshBuilder.CreateBox(
        `paddle${id}`,
        { width: this.paddleThickness, height: this.paddleHeight, depth: this.paddleLength },
        scene,
      )
    } else {
      this.mesh = BABYLON.MeshBuilder.CreateBox(
        `paddle${id}`,
        { width: this.paddleLength, height: this.paddleHeight, depth: this.paddleThickness },
        scene,
      )
    }

    // Materiale del paddle con colori più vivaci
    const paddleMaterial = new BABYLON.StandardMaterial(`paddleMaterial${id}`, scene)
    switch (id) {
      case 0:
        paddleMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1)
        paddleMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2)
        break
      case 1:
        paddleMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0)
        paddleMaterial.emissiveColor = new BABYLON.Color3(0.2, 0, 0)
        break
      case 2:
        paddleMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1)
        paddleMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0.2)
        break
      case 3:
        paddleMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0)
        paddleMaterial.emissiveColor = new BABYLON.Color3(0, 0.2, 0)
        break
    }
    this.mesh.material = paddleMaterial
    this.mesh.position.copyFrom(this.position)
    // this.mesh.renderingGroupId = 2
  }

  public getPaddleLength(): number {
    return this.paddleLength
  }

  public getPaddleThickness(): number {
    return this.paddleThickness
  }

  public getInitialPosition(): number {
    return this.orientation === "vertical" ? this.position.z : this.position.x
  }

  public getSpeed(): number {
    return this.speed
  }

  public getPosition(): any {
    return this.position
  }

  public getMesh(): any {
    return this.mesh
  }

  public getOrientation(): PaddleOrientation {
    return this.orientation
  }

  public reset() {
    if (this.orientation === "vertical") {
      this.position.z = 0
    } else {
      this.position.x = 0
    }
    this.mesh.position.copyFrom(this.position)
  }

  public movePaddles() {
    const maxMove =
      this.orientation === "vertical"
        ? FIELD_HEIGHT / 2 - this.paddleLength / 2
        : FIELD_WIDTH / 2 - this.paddleLength / 2

    if (nbrPlayer == 2) {
      if (this.id === 0 && this.orientation === "vertical") {
        // ✅ Player 0 (sinistra): W = su, S = giù
        if ((keysPressed["w"] || keysPressed["W"]) && this.position.z < maxMove) {
          this.position.z += this.speed
          console.log("Player 0 moving UP (W), position:", this.position.z)
        }
        if ((keysPressed["s"] || keysPressed["S"]) && this.position.z > -maxMove) {
          this.position.z -= this.speed
          console.log("Player 0 moving DOWN (S), position:", this.position.z)
        }
      } else if (this.id === 1 && this.orientation === "vertical") {
        // ✅ Player 1 (destra): ArrowUp = su, ArrowDown = giù
        if (keysPressed["ArrowUp"] && this.position.z < maxMove) {
          this.position.z += this.speed
          console.log("Player 1 moving UP (ArrowUp), position:", this.position.z)
        }
        if (keysPressed["ArrowDown"] && this.position.z > -maxMove) {
          this.position.z -= this.speed
          console.log("Player 1 moving DOWN (ArrowDown), position:", this.position.z)
        }
      }
    } else if (nbrPlayer == 4) {
      if (this.id === 0 && this.orientation === "vertical") {
        // Player 0 (sinistra)
        if (keysPressed["w"] && this.position.z < maxMove) this.position.z += this.speed
        if (keysPressed["s"] && this.position.z > -maxMove) this.position.z -= this.speed
      } else if (this.id === 1 && this.orientation === "vertical") {
        // Player 1 (destra)
        if (keysPressed["ArrowUp"] && this.position.z < maxMove) this.position.z += this.speed
        if (keysPressed["ArrowDown"] && this.position.z > -maxMove) this.position.z -= this.speed
      } else if (this.id === 2 && this.orientation === "horizontal") {
        // Player 2 (sotto): A = sinistra, D = destra
        if (keysPressed["a"] && this.position.x > -maxMove) this.position.x -= this.speed
        if (keysPressed["d"] && this.position.x < maxMove) this.position.x += this.speed
      } else if (this.id === 3 && this.orientation === "horizontal") {
        // Player 3 (sopra): ArrowLeft = sinistra, ArrowRight = destra
        if (keysPressed["ArrowLeft"] && this.position.x > -maxMove) this.position.x -= this.speed
        if (keysPressed["ArrowRight"] && this.position.x < maxMove) this.position.x += this.speed
      }
    }

    // Aggiorna la posizione della mesh
    this.mesh.position.copyFrom(this.position)
  }

  public drawPaddles() {
    // Non serve più - la mesh si disegna automaticamente in Babylon.js
  }
}
