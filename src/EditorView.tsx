import React, { useState, useEffect } from 'react';

import DataStorage from './DataStorage';
import Editor from './Editor';
import Timeline from './Timeline';
import Renderer from './Renderer';
import Project from './Project';
import parse, { endTime } from './parser';
import RecordingView from './RecordingView';

interface Props {
    project: Project;
    storage: DataStorage;
}
const EditorView: React.FC<Props> = props => {
    const [project, setProject] = useState(props.project);
    const [time, setTimeValue] = useState(0);
    const [context, setContext] = useState<AudioContext | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState(false);
    const [recording, setRecording] = useState(false);

    useEffect(() => {
        setContext(new AudioContext());
        return () => {
            if (context) context.close();
        };
    }, []);

    useEffect(() => {
        if (!context) return;
        props.storage.getAudio(project.name).then(audio => {
            setAudio(audio);
            const mediaSource = context.createMediaElementSource(audio);
            mediaSource.connect(context.destination);

            audio.addEventListener('ended', () => {
                pausePlayback();
            })
        });
    }, [context]);

    function saveProject(newProject: Project) {
        setProject(newProject);
        props.storage.saveProject(newProject);
    }

    function setTime(time: number) {
        setTimeValue(time);
        if (audio) audio.currentTime = time;
    }

    function startPlayback() {
        if (recording) return;
        if (audio) audio.play();
        setPlaying(true);
    }

    function pausePlayback() {
        if (recording) return;
        if (audio) audio.pause();
        setPlaying(false);
    }

    function record() {
        pausePlayback();
        setRecording(true);
    }

    function recordingDone() {
        setRecording(false);
    }

    useAnimationFrame(delta => {
        if (audio) {
            setTimeValue(audio.currentTime);
        }
    });

    const song = parse(project.text);

    if (recording) {
        return <RecordingView project={props.project} length={endTime(song) || 0} onDone={recordingDone} />
    } else {
        return <div>
            <Timeline time={time} onChange={setTime} length={(audio && audio.duration) || endTime(song) || 0} />
            <Renderer song={song} time={time} />
            <Editor text={project.text} time={time} onChange={text => saveProject({ ...project, text })} />
            <div>Time: {time}</div>
            <div>
                {playing ?
                    <span onClick={pausePlayback}>⏸</span> :
                    <span onClick={startPlayback}>▶</span>}
                <span onClick={record}>■</span>
            </div>
            {/* <pre>
            {JSON.stringify(song, undefined, 4)}
        </pre> */}
        </div>;
    }
}

const useAnimationFrame = (callback: (delta: number) => void) => {
    const requestRef = React.useRef<number>(0);
    const previousTimeRef = React.useRef<number>();
    const animate = React.useRef<(time: number) => void>(() => { });

    animate.current = (time: number) => {
        if (previousTimeRef.current != undefined) {
            const deltaTime = time - previousTimeRef.current;
            callback(deltaTime)
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate.current);
    }

    React.useEffect(() => {
        requestRef.current = requestAnimationFrame(animate.current);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);
}

export default EditorView;