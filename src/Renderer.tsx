import React, { useRef, createContext, useEffect, useState } from 'react';
import { Song, startTime, endTime, Line } from './parser';
import styled from 'styled-components';

const DEFAULT_FONT_SIZE = 30;

interface Props {
    song: Song;
    time: number;
    onCanvasRendered?: (canvas: HTMLCanvasElement, time: number) => void;
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
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const [containerSize, setContainerSize] = useState<[number, number]>([1, 1]);

    useEffect(() => {
        function handleResize(e: UIEvent) {
            if (container) {
                console.log([container.clientWidth, container.clientHeight])
                setContainerSize([container.clientWidth, container.clientHeight]);
            }
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [container]);

    useEffect(() => {
        if (container && canvas) {
            const [width, height] = (props.song.length > 0 && props.song[0].settings.resolution) || [1920, 1080];
            canvas.width = width;
            canvas.height = height;
            const { clientWidth: parentWidth, clientHeight: parentHeight } = container;
            const aspectRatio = width / height;
            const parentAspectRatio = parentWidth / parentHeight;
            const [viewWidth, viewHeight] = parentAspectRatio < aspectRatio ? [(parentWidth - 2), (parentWidth - 2) / aspectRatio] : [(parentHeight - 2) * aspectRatio, (parentHeight - 2)];
            canvas.style.width = `${viewWidth}px`;
            canvas.style.height = `${viewHeight}px`;
            canvas.style.top = `${(parentHeight - 2 - viewHeight) / 2}px`;
            canvas.style.left = `${(parentWidth - 2 - viewWidth) / 2}px`;

            const maxRows = Math.max(...props.song.map(line => line.row));

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return;
            }
            const lines = props.song.filter(line => (startTime(line) || 0) <= props.time && props.time < (endTime(line) || 0));
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let line of lines) {
                const fontSize = line.settings.fontsize || DEFAULT_FONT_SIZE;
                ctx.font = `${fontSize}px ${line.settings.fontfamily || 'sans-serif'}`;
                const text = line.parts.map(part => part.text).join('');
                const interpolation = interpolationPosition(line, props.time, ctx);
                const lineWidth = totalWidth(text, ctx);
                const xpos = (width - lineWidth) / 2;

                ctx.save();
                ctx.beginPath();
                ctx.rect(xpos, 0, interpolation, canvas.height);
                ctx.clip();
                ctx.fillStyle = line.settings.color2 || 'black';
                ctx.fillText(text, xpos, canvas.height - (maxRows - line.row + 0.5) * fontSize);
                ctx.restore();


                ctx.save();
                ctx.beginPath();
                ctx.rect(xpos + interpolation, 0, canvas.width, canvas.height);
                ctx.clip();
                ctx.fillStyle = line.settings.color1 || 'magenta';
                ctx.fillText(text, xpos, canvas.height - (maxRows - line.row + 0.5) * fontSize);
                ctx.restore();
            }

            if (props.onCanvasRendered) {
                props.onCanvasRendered(canvas, props.time);
            }
        }
    }, [canvas, container, props.time, props.song, containerSize]);

    return <CanvasContainer ref={setContainer}>
        <StyledCanvas ref={setCanvas} />
    </CanvasContainer>;
};

const CanvasContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
`;

const StyledCanvas = styled.canvas`
    position: absolute;
    border: 1px solid black;
    margin: auto;
`;

export default Renderer;
