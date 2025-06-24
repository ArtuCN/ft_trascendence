import { Paddles } from './classPaddles.js';
export class Player {
    constructor(name, id, orientation) {
        this.nameTag = name;
        this.paddle = new Paddles(id, orientation);
    }
    drawAndMove() {
        this.paddle.movePaddles();
        this.paddle.drawPaddles();
    }
    getNameTag() {
        return this.nameTag;
    }
    getPaddle() {
        return this.paddle;
    }
}
