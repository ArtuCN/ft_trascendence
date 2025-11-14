import type { Player } from "./classPlayer"
import { FIELD_WIDTH, FIELD_HEIGHT } from "./variables3D.js"
import { nbrPlayer, playerGoals } from "../script.js"

// Babylon.js caricato come file locale - variabili globali
declare const BABYLON: any;

export class Ball {
  private position: any
  private mesh: any
  private ballSize = 0.5
  private speed = 0.2 // ✅ Aumentata da 0.1 a 0.15
  private velocity: any
  private lastTouchedPlayer = -1

  public getBallSpeed(): number {
    return this.speed
  }

  public constructor(scene: any) {
    this.position = new BABYLON.Vector3(0, 0.5, 0)
    this.mesh = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: this.ballSize }, scene)

    const ballMaterial = new BABYLON.StandardMaterial("ballMaterial", scene)
    ballMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1)
    ballMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3)
    this.mesh.material = ballMaterial

    this.mesh.position.copyFrom(this.position)

    let angle: number
    if (nbrPlayer === 2) {
      if (Math.random() < 0.5) {
        angle = (Math.random() - 0.5) * (Math.PI / 4)
      } else {
        angle = Math.PI + (Math.random() - 0.5) * (Math.PI / 4)
      }
    } else {
      angle = Math.random() * Math.PI * 2
    }

    this.velocity = new BABYLON.Vector3(this.speed * Math.cos(angle), 0, this.speed * Math.sin(angle))
  }

  public drawBall() {
    // Non serve fare niente - la mesh si disegna automaticamente
  }

  public moveBall(players: Player[]) {
    this.position.addInPlace(this.velocity)
    this.mesh.position.copyFrom(this.position)

    // ✅ Controlla collisioni con i paddle PRIMA di controllare i goal
    this.checkPaddleCollisions(players)

    // Controlla i limiti del campo per i goal
    if (this.position.x > FIELD_WIDTH / 2) {
      // Goal per il giocatore di sinistra (player 0)
      if (nbrPlayer >= 2) playerGoals[0]++
    //   console.log("Goal! Player 0 scored. Score:", playerGoals)
      this.resetGame(players)
      return
    }

    if (this.position.x < -FIELD_WIDTH / 2) {
      // Goal per il giocatore di destra (player 1)
      if (nbrPlayer >= 2) playerGoals[1]++
    //   console.log("Goal! Player 1 scored. Score:", playerGoals)
      this.resetGame(players)
      return
    }

    if (nbrPlayer === 2) {
      // Rimbalzo sui muri superiore e inferiore
      if (this.position.z > FIELD_HEIGHT / 2 || this.position.z < -FIELD_HEIGHT / 2) {
        this.velocity.z *= -1
        this.position.z = Math.sign(this.position.z) * (FIELD_HEIGHT / 2 - this.ballSize / 2)
      }
    } else if (nbrPlayer === 4) {
      // Per 4 giocatori, controlla anche i goal verticali
      if (this.position.z > FIELD_HEIGHT / 2) {
        playerGoals[2]++ // Player 2 (bottom)
        // console.log("Goal! Player 2 scored. Score:", playerGoals)
        this.resetGame(players)
        return
      }

      if (this.position.z < -FIELD_HEIGHT / 2) {
        playerGoals[3]++ // Player 3 (top)
        // console.log("Goal! Player 3 scored. Score:", playerGoals)
        this.resetGame(players)
        return
      }
    }
  }

  // ✅ Nuova funzione per controllare le collisioni con i paddle
  private checkPaddleCollisions(players: Player[]) {
    players.forEach((player, index) => {
      const paddle = player.getPaddle()
      const paddlePos = paddle.getPosition()
      const paddleLength = paddle.getPaddleLength()
      const paddleThickness = paddle.getPaddleThickness()

      // Calcola i bounds del paddle
      let paddleMinX, paddleMaxX, paddleMinZ, paddleMaxZ

      if (paddle.getOrientation() === "vertical") {
        // Paddle verticale (sinistra/destra)
        paddleMinX = paddlePos.x - paddleThickness / 2
        paddleMaxX = paddlePos.x + paddleThickness / 2
        paddleMinZ = paddlePos.z - paddleLength / 2
        paddleMaxZ = paddlePos.z + paddleLength / 2
      } else {
        // Paddle orizzontale (sopra/sotto)
        paddleMinX = paddlePos.x - paddleLength / 2
        paddleMaxX = paddlePos.x + paddleLength / 2
        paddleMinZ = paddlePos.z - paddleThickness / 2
        paddleMaxZ = paddlePos.z + paddleThickness / 2
      }

      // Controlla se la palla è in collisione con il paddle
      const ballRadius = this.ballSize / 2
      if (
        this.position.x + ballRadius > paddleMinX &&
        this.position.x - ballRadius < paddleMaxX &&
        this.position.z + ballRadius > paddleMinZ &&
        this.position.z - ballRadius < paddleMaxZ
      ) {
        console.log(`Ball hit paddle ${index}!`)

        // Determina la direzione del rimbalzo
        if (paddle.getOrientation() === "vertical") {
          // Rimbalzo orizzontale
          this.velocity.x *= -1

          // Aggiungi un po' di "spin" basato su dove ha colpito il paddle
          const hitPosition = (this.position.z - paddlePos.z) / (paddleLength / 2)
          this.velocity.z += hitPosition * 0.05

          // Sposta la palla fuori dal paddle per evitare collisioni multiple
          if (this.position.x > paddlePos.x) {
            this.position.x = paddleMaxX + ballRadius
          } else {
            this.position.x = paddleMinX - ballRadius
          }
        } else {
          // Rimbalzo verticale
          this.velocity.z *= -1

          // Aggiungi spin orizzontale
          const hitPosition = (this.position.x - paddlePos.x) / (paddleLength / 2)
          this.velocity.x += hitPosition * 0.05

          // Sposta la palla fuori dal paddle
          if (this.position.z > paddlePos.z) {
            this.position.z = paddleMaxZ + ballRadius
          } else {
            this.position.z = paddleMinZ - ballRadius
          }
        }

        // Aumenta leggermente la velocità ad ogni rimbalzo (opzionale)
        const speedMultiplier = 1.02
        this.velocity.x *= speedMultiplier
        this.velocity.z *= speedMultiplier

        // Aggiorna la posizione della mesh
        this.mesh.position.copyFrom(this.position)

        this.lastTouchedPlayer = index
      }
    })
  }

  private resetGame(players: Player[]) {
    this.position = new BABYLON.Vector3(0, 0.5, 0)
    this.mesh.position.copyFrom(this.position)

    let angle: number
    if (nbrPlayer === 2) {
      if (Math.random() < 0.5) {
        angle = (Math.random() - 0.5) * (Math.PI / 4)
      } else {
        angle = Math.PI + (Math.random() - 0.5) * (Math.PI / 4)
      }
    } else {
      angle = Math.random() * Math.PI * 2
    }

    this.velocity = new BABYLON.Vector3(this.speed * Math.cos(angle), 0, this.speed * Math.sin(angle))

    players.forEach((p) => p.getPaddle().reset())
    this.lastTouchedPlayer = -1
  }
}

export function drawScore(nbrPlayer: number) {
//   console.log("Score:", playerGoals)
}
