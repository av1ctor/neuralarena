import { Principal } from "@dfinity/principal";
import { principalToString } from "../libs/icp";

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
        this.ctx.lineWidth = 2;
        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";
        this.width = canvas.width;
        this.height = canvas.height;
    }

    changeDim(dim: {w: number, h: number}) {
        this.width = dim.w;
        this.height = dim.h;
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

    font_match = /(?<value>\d+\.?\d*)/;

    set_font_size(
        size: number
    ) {
        this.ctx.font = this.ctx.font.replace(this.font_match, size.toString());
    }

    fill_text(
        text: string,
        x: number,
        y: number
    ) {
        this.ctx.fillText(text, x, y);
    }

    show_winner(
        principal: Principal
    ) {
        this.ctx.save();
        this.ctx.lineWidth = 2;
        
        const s = `${principalToString(principal)} won!`;
        this.set_font_size(32);
        const m = this.ctx.measureText(s);
        
        this.ctx.fillStyle = 'rgb(0, 0, 0)';
        this.fill_rect(this.width/2 - m.width/2 - 32, this.height/2 - 48, m.width + 64, 56);
        
        this.ctx.fillStyle = 'rgb(0, 255, 0)';
        this.fill_text(s, this.width/2 - m.width/2, this.height/2 - m.actualBoundingBoxAscent/2);
        
        this.ctx.strokeStyle = 'rgb(255, 255, 255)';
        this.ctx.setLineDash([3, 3]);
        this.draw_rect(this.width/2 - m.width/2 - 32, this.height/2 - 48, m.width + 64, 56);

        this.ctx.restore();
    }
};