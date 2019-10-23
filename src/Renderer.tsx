import React, { useEffect, useState } from 'react';
import { Song } from './parser';
import styled from 'styled-components';
import renderFrame from './renderer';

interface Props {
    song: Song;
    time: number;
    onCanvasRendered?: (canvas: HTMLCanvasElement, time: number) => void;
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

            renderFrame(props.song, props.time, canvas);

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
