import React, { useState, useEffect, useRef } from 'react';
import Tar from 'lib/tar';

import Timeline from './Timeline';
import Project from './Project';
import parse, { Song, endTime } from './parser';
import renderFrame from './renderer';

interface Props {
    project: Project;
    length: number;
    onDone: () => void;
}

function renderSong(song: Song, length: number, setTime: (time: number) => void) {
    return new Promise<void>((resolve, reject) => {
        const tar = new Tar();
        const canvases: HTMLCanvasElement[] = [];
        const [width, height] = (song.length > 0 && song[0].settings.resolution) || [1920, 1080];
        for (let i = 0; i < 50; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvases.push(canvas);
        }
        let frame = 0;
        const frameTime = 1 / 50;

        function addFrame(frame: number, time: number, canvas: HTMLCanvasElement) {
            return new Promise<void>((resolve, reject) => {
                if (time > length) {
                    window.open(URL.createObjectURL(tar.save()));
                    resolve();
                    return;
                }
                renderFrame(song, time, canvas);
                canvas.toBlob((blob => {
                    if (!blob) return;
                    const fileReader = new FileReader();
                    fileReader.addEventListener('loadend', () => {
                        tar.append(toFrameName(frame) + '.png', new Uint8Array(fileReader.result! as ArrayBuffer));
                        resolve();
                    });
                    fileReader.readAsArrayBuffer(blob);
                }), 'png');
            });
        }

        function next() {
            if (frame * frameTime > length) {
                resolve();
                return;
            }
            const promises: Promise<void>[] = [];
            for (let i = 0; i < canvases.length; i++) {
                const time = frame * frameTime;
                setTime(time);
                promises.push(addFrame(frame, time, canvases[i]));
                frame++;
            }
            Promise.all(promises).then(next);
        }
        next();
    });
}

const RecordingView: React.FC<Props> = props => {
    const [time, setTime] = useState(0);
    const [tar] = useState<Tar>(new Tar());

    useEffect(() => {
        renderSong(parse(props.project.text), props.length, setTime).then(props.onDone);
    }, []);

    return <div>
        <Timeline time={time} length={props.length} />
    </div>;
}

function toFrameName(frame: number) {
    const s = frame.toString();
    return "0".repeat(5 - s.length) + s;
}

export default RecordingView;