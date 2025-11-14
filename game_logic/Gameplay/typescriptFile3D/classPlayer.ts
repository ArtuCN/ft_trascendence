import { Paddles } from "./classPaddles.js"
import type { PaddleOrientation } from "./variables3D"

// Babylon.js viene caricato come file locale e disponibile come variabile globale
declare const BABYLON: any;

export class Player {
  private nameTag: string
  private paddle: Paddles

  public constructor(name: string, id: number, orientation: PaddleOrientation, scene: any) {
    this.nameTag = name
    this.paddle = new Paddles(id, orientation, scene)
  }

  public drawAndMove() {
    this.paddle.movePaddles()
    // ✅ Non chiamare più drawPaddles() - non serve
    // this.paddle.drawPaddles()
  }

  public getNameTag(): string {
    return this.nameTag
  }

  public getPaddle(): Paddles {
    return this.paddle
  }
}
