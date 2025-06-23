import { Paddles } from './classPaddles.js';
import { PaddleOrientation } from './variables.js';

export class Player {
	private nameTag: string;
	private paddle: Paddles;

	public constructor(name: string, id: number, orientation: PaddleOrientation) {
		this.nameTag = name;
		this.paddle = new Paddles(id, orientation);
	}

	public drawAndMove() {
		this.paddle.movePaddles();
		this.paddle.drawPaddles();
	}

	public getNameTag(): string {
		return this.nameTag;
	}

	public getPaddle(): Paddles {
		return this.paddle;
	}
}