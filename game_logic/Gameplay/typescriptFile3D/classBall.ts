import type { Player } from "./classPlayer"
import { FIELD_WIDTH, FIELD_HEIGHT, stopGame } from "./variables3D.js"
import { nbrPlayer, playerGoals, playerGoalsRecived, showMenu } from "../script.js"
import { showVictoryScreen3D } from "../3d/script.js";

declare const BABYLON: any;

export class Ball {
  private position: any
  private mesh: any
  private ballSize = 0.5
  private speed = 0.2
  private velocity: any
  private lastTouchedPlayer = -1
  private rallyActive = false

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

  public drawBall() {}

  public moveBall(players: Player[]) {
    this.position.addInPlace(this.velocity)
    this.mesh.position.copyFrom(this.position)
    this.checkPaddleCollisions(players)

    if (nbrPlayer === 2) {

      if (this.position.x > FIELD_WIDTH / 2) {
        if (this.rallyActive) playerGoals[0]++
        playerGoalsRecived[1]++;
        console.log("Player 1 scored! Total goals:", playerGoals[0]);
        if (playerGoals[0] >= 5) {
          if (typeof showMenu === "function") {
            stopGame()
            showVictoryScreen3D(players[0]);
          }
        }
        this.resetGame(players)
        return
      }

      if (this.position.x < -FIELD_WIDTH / 2) {
        if (this.rallyActive) playerGoals[1]++
        playerGoalsRecived[0]++;
        if (playerGoals[1] >= 5) {
          if (typeof showMenu === "function") {
            stopGame()
            showVictoryScreen3D(players[1])
          }
        }
        this.resetGame(players)
        return
      }

      if (this.position.z > FIELD_HEIGHT / 2 || this.position.z < -FIELD_HEIGHT / 2) {
        this.velocity.z *= -1
        this.position.z = Math.sign(this.position.z) * (FIELD_HEIGHT / 2 - this.ballSize / 2)
      }
    }
    else if (nbrPlayer === 4) {
      if (this.position.x > FIELD_WIDTH / 2) {
        if (this.rallyActive && this.lastTouchedPlayer !== -1) playerGoals[this.lastTouchedPlayer]++
        playerGoalsRecived[1]++;
        if (playerGoals[this.lastTouchedPlayer] >= 5) {
          if (typeof showMenu === "function") {
            stopGame()
            showVictoryScreen3D(players[this.lastTouchedPlayer])
          }
        }
        this.resetGame(players)
        return
      }
      if (this.position.x < FIELD_WIDTH / 2) {
        if (this.rallyActive && this.lastTouchedPlayer !== -1) playerGoals[this.lastTouchedPlayer]++
        playerGoalsRecived[0]++;
        if (playerGoals[this.lastTouchedPlayer] >= 5) {
          if (typeof showMenu === "function") {
            stopGame()
            showVictoryScreen3D(players[this.lastTouchedPlayer])
          }
        }
        this.resetGame(players)
        return
      }
      if (this.position.z > FIELD_HEIGHT / 2) {
        // goal segnato dall'ultimo che tocca la palla
        if (this.rallyActive && this.lastTouchedPlayer !== -1) playerGoals[this.lastTouchedPlayer]++
        playerGoalsRecived[2]++;
        if (playerGoals[this.lastTouchedPlayer] >= 5) {
          if (typeof showMenu === "function") {
            stopGame()
            showVictoryScreen3D(players[this.lastTouchedPlayer])
          }
        }
        this.resetGame(players)
        return
      }

      if (this.position.z < -FIELD_HEIGHT / 2) {
        if (this.rallyActive && this.lastTouchedPlayer !== -1) playerGoals[this.lastTouchedPlayer]++
        playerGoalsRecived[3]++;
        if (playerGoals[this.lastTouchedPlayer] >= 5) {
          if (typeof showMenu === "function") {
            stopGame()
            showVictoryScreen3D(players[this.lastTouchedPlayer])
          }
        }
        this.resetGame(players)
        return
      }
    }
  }

  private checkPaddleCollisions(players: Player[]) {
    players.forEach((player, index) => {
      const paddle = player.getPaddle()
      const paddlePos = paddle.getPosition()
      const paddleLength = paddle.getPaddleLength()
      const paddleThickness = paddle.getPaddleThickness()

      let paddleMinX, paddleMaxX, paddleMinZ, paddleMaxZ

      if (paddle.getOrientation() === "vertical") {
        paddleMinX = paddlePos.x - paddleThickness / 2
        paddleMaxX = paddlePos.x + paddleThickness / 2
        paddleMinZ = paddlePos.z - paddleLength / 2
        paddleMaxZ = paddlePos.z + paddleLength / 2
      } else {
        paddleMinX = paddlePos.x - paddleLength / 2
        paddleMaxX = paddlePos.x + paddleLength / 2
        paddleMinZ = paddlePos.z - paddleThickness / 2
        paddleMaxZ = paddlePos.z + paddleThickness / 2
      }

      // controllare la palla da chi viene colpita
      const ballRadius = this.ballSize / 2
      if (
        this.position.x + ballRadius > paddleMinX &&
        this.position.x - ballRadius < paddleMaxX &&
        this.position.z + ballRadius > paddleMinZ &&
        this.position.z - ballRadius < paddleMaxZ
      ) {
        console.log(`Ball hit paddle ${index}!`)
        if (paddle.getOrientation() === "vertical") {
          this.velocity.x *= -1
          const hitPosition = (this.position.z - paddlePos.z) / (paddleLength / 2)
          this.velocity.z += hitPosition * 0.05

          if (this.position.x > paddlePos.x) {
            this.position.x = paddleMaxX + ballRadius
          } else {
            this.position.x = paddleMinX - ballRadius
          }
        } else {
          this.velocity.z *= -1
          const hitPosition = (this.position.x - paddlePos.x) / (paddleLength / 2)
          this.velocity.x += hitPosition * 0.05

          if (this.position.z > paddlePos.z) {
            this.position.z = paddleMaxZ + ballRadius
          } else {
            this.position.z = paddleMinZ - ballRadius
          }
        }

        // aumento la velocità ad ogni rimbalzo
        const speedMultiplier = 1.02
        this.velocity.x *= speedMultiplier
        this.velocity.z *= speedMultiplier

        // per aggiornare la posizione della mesh:
        this.mesh.position.copyFrom(this.position)

        this.lastTouchedPlayer = index
        this.rallyActive = true
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
    this.rallyActive = false
  }
}

export function drawScore(nbrPlayer: number) {
//   console.log("score:", playerGoals)
}
