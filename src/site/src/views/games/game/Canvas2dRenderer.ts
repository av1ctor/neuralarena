
export class Canvas2dRenderer {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;

    constructor(
        canvas: HTMLCanvasElement
    ) {
        const ctx = canvas.getContext('2d');
        if(!ctx) {
            throw 'Canvas context 2d unsupported';
        }
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
    }

    clear() {
        this.ctx.fillStyle = `rgb(0, 0, 0)`;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    present() {
    }

    set_draw_color(
        r: number,
        g: number,
        b: number
    ) {
        const rgb = `rgb(${r}, ${g}, ${b})`;
        this.ctx.fillStyle = rgb;
        this.ctx.strokeStyle = rgb;
    }

    draw_line(
        x1: number,
        y1: number,
        x2: number,
        y2: number
    ) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    draw_rect(
        x: number,
        y: number,
        w: number,
        h: number
    ) {
        this.ctx.strokeRect(x, y, w, h);
    }

    fill_rect(
        x: number,
        y: number,
        w: number,
        h: number
    ) {
        this.ctx.fillRect(x, y, w, h);
    }
};