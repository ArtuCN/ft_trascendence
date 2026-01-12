import { Paddles } from "./classPaddles.js"
import type { PaddleOrientation } from "./variables3D"

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
  }

  public getNameTag(): string {
    return this.nameTag
  }

  public getPaddle(): Paddles {
    return this.paddle
  }
}
