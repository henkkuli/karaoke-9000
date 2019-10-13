import React, { useRef, createContext } from 'react';
import { Song, startTime, endTime, Line } from './parser';

const DEFAULT_FONT_SIZE = 30;

interface Props {
    song: Song;
    time: number;
}

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

const Renderer: React.FC<Props> = props => {
    const ref = useRef<HTMLCanvasElement>(null);

    const canvas = ref.current;
    if (canvas) {
        if (props.song.length > 0) {
            const [width, height] = props.song[0].settings.resolution || [1920, 1080];
            canvas.width = width;
            canvas.height = height;
        }
        const maxRows = Math.max(...props.song.map(line => line.row));

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return <div>Failed to get context</div>;
        }
        const lines = props.song.filter(line => (startTime(line) || 0) <= props.time && props.time < (endTime(line) || 0));
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let line of lines) {
            const fontSize = line.settings.fontsize || DEFAULT_FONT_SIZE;
            ctx.font = `${fontSize}px ${line.settings.fontfamily || ''}`;
            const text = line.parts.map(part => part.text).join('');
            const interpolation = interpolationPosition(line, props.time, ctx);
            ctx.save();
            ctx.beginPath();
            ctx.rect(100, 0, interpolation, canvas.height);
            ctx.clip();
            ctx.fillStyle = line.settings.color1 || 'black';
            ctx.fillText(text, 100, canvas.height - (maxRows - line.row + 0.5) * fontSize);
            ctx.restore();


            ctx.save();
            ctx.beginPath();
            ctx.rect(100 + interpolation, 0, canvas.width, canvas.height);
            ctx.clip();
            ctx.fillStyle = line.settings.color2 || 'magenta';
            ctx.fillText(text, 100, canvas.height - (maxRows - line.row + 0.5) * fontSize);
            ctx.restore();
        }
    }

    return <canvas ref={ref} style={{ border: '1px solid black' }} />;
};

export default Renderer;
