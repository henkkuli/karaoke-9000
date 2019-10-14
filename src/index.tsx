import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';

import EditorView from './EditorView';
import DataStorage from './DataStorage';
import ProjectList from './ProjectList';
import Project from './Project';
import t from './translations';
import Editor from './Editor';

function clearBody() {
    while (document.body.lastChild) {
        document.body.removeChild(document.body.lastChild);
    }
}

// async function main() {
//     const events = new EventBoard();
//     const storage = await DataStorage.create(events);
//     const projectList = new ProjectList(storage, events);
//     const editor = new EditorView(storage, events);

//     document.body.appendChild(projectList.element);
//     events.selectProject.on(name => {
//         clearBody();
//         document.body.appendChild(editor.element);
//     });
//     events.closeProject.on(() => {
//         clearBody();
//         document.body.appendChild(projectList.element);
//     });
// }

const App: React.FC = () => {
    const [storage, setStorage] = useState<DataStorage>();
    useEffect(() => {
        DataStorage.create().then(setStorage);
    });

    const [currentProject, setCurrentProject] = useState<Project>();

    if (!storage) {
        return <span>{t().connectingToDatabase}</span>;
    }

    if (!currentProject) {
        return <ProjectList
            storage={storage}
            onSelectProject={setCurrentProject}>
        </ProjectList>;
    }

    return <EditorView
        storage={storage}
        project={currentProject} />;
};

window.addEventListener('load', function () {
    ReactDom.render(<App></App>, document.body);
});
