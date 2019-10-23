import { Line, Song, startTime, endTime } from './parser';

const DEFAULT_FONT_SIZE = 30;

function totalWidth(text: string, ctx: CanvasRenderingContext2D) {
    return ctx.measureText(text).width;
}

function interpolationPosition(line: Line, time: number, ctx: CanvasRenderingContext2D) {
    let text: string[] = [];
    for (let part of line.parts) {
        if (part.end < time) {
            text.push(part.text);
        } else {
            const width1 = totalWidth(text.join(''), ctx);
            text.push(part.text);
            const width2 = totalWidth(text.join(''), ctx);
            return width1 + (width2 - width1) * (time - part.start) / (part.end - part.start);
        }
    }
    return Infinity;
}

export default function renderFrame(song: Song, time: number, canvas: HTMLCanvasElement) {

    const maxRows = Math.max(...song.map(line => line.row));

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }
    const lines = song.filter(line => (startTime(line) || 0) <= time && time < (endTime(line) || 0));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let line of lines) {
        const fontSize = line.settings.fontsize || DEFAULT_FONT_SIZE;
        ctx.font = `${fontSize}px ${line.settings.fontfamily || 'sans-serif'}`;
        const text = line.parts.map(part => part.text).join('');
        const interpolation = interpolationPosition(line, time, ctx);
        const lineWidth = totalWidth(text, ctx);
        const xpos = (canvas.width - lineWidth) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, xpos + interpolation, canvas.height);
        ctx.clip();
        ctx.fillStyle = '';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 1;
        ctx.fillText(text, xpos, canvas.height - (maxRows - line.row + 0.5) * fontSize);
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 2;
        ctx.fillText(text, xpos, canvas.height - (maxRows - line.row + 0.5) * fontSize);
        ctx.fillStyle = line.settings.color2 || 'black';
        ctx.shadowBlur = 0;
        ctx.fillText(text, xpos, canvas.height - (maxRows - line.row + 0.5) * fontSize);
        ctx.restore();


        ctx.save();
        ctx.beginPath();
        ctx.rect(xpos + interpolation, 0, canvas.width, canvas.height);
        ctx.clip();
        ctx.fillStyle = '';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 1;
        ctx.fillText(text, xpos, canvas.height - (maxRows - line.row + 0.5) * fontSize);
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 2;
        ctx.fillText(text, xpos, canvas.height - (maxRows - line.row + 0.5) * fontSize);
        ctx.fillStyle = line.settings.color1 || 'magenta';
        ctx.shadowBlur = 0;
        ctx.fillText(text, xpos, canvas.height - (maxRows - line.row + 0.5) * fontSize);
        ctx.restore();
    }
}