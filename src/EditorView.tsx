import React, { useState } from 'react';

import DataStorage from './DataStorage';
import Editor from './Editor';
import Timeline from './Timeline';
import Renderer from './Renderer';
import Project from './Project';
import parse, { endTime } from './parser';

// export default class EditorView {
//     public readonly element: HTMLDivElement;
//     private readonly editor: Editor;
//     private readonly timeline: Timeline;

//     public constructor(
//         private storage: DataStorage,
//         private events: EventBoard,
//     ) {
//         this.element = document.createElement('div');
//         this.editor = new Editor(events);
//         this.timeline = new Timeline(events);

//         this.element.appendChild(this.timeline.element);
//         this.element.appendChild(this.editor.element);
//     }
// }

interface Props {
    project: Project;
    storage: DataStorage;
}
const EditorView: React.FC<Props> = props => {
    const [project, setProject] = useState(props.project);
    const [time, setTime] = useState(0);

    function saveProject(newProject: Project) {
        setProject(newProject);
        props.storage.saveProject(newProject);
    }

    const song = parse(project.text);

    return <div>
        <Timeline time={time} onChange={setTime} length={endTime(song) || 0} />
        <Renderer song={song} time={time} />
        <Editor text={project.text} onChange={text => saveProject({ ...project, text })} />
        <div>Time: {time}</div>
        <pre>
            {JSON.stringify(song, undefined, 4)}
        </pre>
    </div>;
}

export default EditorView;