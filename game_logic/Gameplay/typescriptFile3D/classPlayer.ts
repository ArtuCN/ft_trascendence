import { Paddles } from "./classPaddles.js"
import type { PaddleOrientation } from "./variables3D"

declare const BABYLON: any;

export class Player {
  private nameTag: string
  private paddle: Paddles
  private user_ids: number

  public constructor(name: string, id: number, user_ids: number, orientation: PaddleOrientation, scene: any) {
    this.nameTag = name
    this.paddle = new Paddles(id, orientation, scene)
    this.user_ids = user_ids;
  }

  public drawAndMove() {
    this.paddle.movePaddles()
  }

  public getUserID(): number {
    return this.user_ids
  }

  public getNameTag(): string {
    return this.nameTag
  }

  public getPaddle(): Paddles {
    return this.paddle
  }
}
