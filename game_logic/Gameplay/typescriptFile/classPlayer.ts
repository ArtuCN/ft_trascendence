import { Paddles } from './classPaddles.js';
import { PaddleOrientation } from './variables.js';

export class Player {
	private nameTag: string;
	private paddle: Paddles;
	private user_ids: number;

	public constructor(name: string, id: number, user_id: number, orientation: PaddleOrientation) {
		this.nameTag = name;
		this.paddle = new Paddles(id, orientation);
		this.user_ids = user_id;
	}

	public drawAndMove() {
		this.paddle.movePaddles();
		this.paddle.drawPaddles();
	}

	public getNameTag(): string {
		return this.nameTag;
	}

	public getUserID(): number {
		return this.user_ids;
	}

	public getPaddle(): Paddles {
		return this.paddle;
	}
}