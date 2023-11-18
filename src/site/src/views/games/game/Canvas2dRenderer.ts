
export class Canvas2dRenderer {
    ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if(!ctx) {
            throw 'Canvas context 2d unsupported';
        }
        this.ctx = ctx;
    }

    clear() {
        this.ctx.fillStyle = "rgb(200, 0, 0)";
        this.ctx.fillRect(0, 0, 200, 200);
    }

    present() {

    }
};