import React, { useState, useEffect, useRef } from 'react';
import Tar from 'lib/tar';

import Timeline from './Timeline';
import Renderer from './Renderer';
import Project from './Project';
import parse, { endTime } from './parser';

interface Props {
    project: Project;
    length: number;
    onDone: () => void;
}
const RecordingView: React.FC<Props> = props => {
    const [project, setProject] = useState(props.project);
    const [frame, setFrame] = useState(0);
    const [tar] = useState<Tar>(new Tar());
    const time = frame * (1 / 50);

    useEffect(() => {
        setFrame(0);
    }, [props.project, props.length]);

    useEffect(() => {
        if (time >= props.length) {
            window.open(URL.createObjectURL(tar.save()));
            props.onDone();
        }
    }, [time, props.length]);

    function recordFrame(canvas: HTMLCanvasElement, frameTime: number) {
        if (frameTime !== time) return;

        canvas.toBlob((blob => {
            if (!blob) return;
            const fileReader = new FileReader();
            fileReader.addEventListener('loadend', () => {
                tar.append(toFrameName(frame) + '.png', new Uint8Array(fileReader.result! as ArrayBuffer));
                setFrame(frame + 1);
            });
            fileReader.readAsArrayBuffer(blob);
        }), 'png');
    }

    const song = parse(project.text);

    return <div>
        <Timeline time={time} length={props.length} />
        <Renderer song={song} time={time} onCanvasRendered={recordFrame} />
    </div>;
}

function toFrameName(frame: number) {
    const s = frame.toString();
    return "0".repeat(5 - s.length) + s;
}

export default RecordingView;