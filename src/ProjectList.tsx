import React, { useState, useEffect, useRef } from 'react';
import DataStorage from './DataStorage';
import Project from './Project';
import t from './translations';

interface Props {
    storage: DataStorage;
    onSelectProject: (project: Project) => void;
}
const ProjectList: React.FC<Props> = props => {
    const [projects, setProjects] = useState<Project[]>();
    async function getProjects() {
        props.storage.getAllProjects().then(setProjects);
    }
    useEffect(() => {
        getProjects();
        return props.storage.change.on(getProjects);
    });

    return projects ?
        <div>
            <ul>
                {projects.map(project =>
                    <li onClick={() => props.onSelectProject(project)}>
                        {project.name}
                    </li>)}
            </ul>
            <CreateNewProject storage={props.storage} />
        </div> :
        <span>{t().loadingProjectList}</span>;
};

interface CreateNewProjectProps {
    storage: DataStorage;
}
const CreateNewProject: React.FC<CreateNewProjectProps> = props => {
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);

    async function createProject() {
        setSaving(true);
        await props.storage.saveProject({ name, text: '' });
        setSaving(false);
    }

    return <div>
        <input value={name} onChange={e => setName(e.target.value)} />
        <button onClick={createProject} disabled={name === '' || saving} >
            {t().createProject}
        </button>
    </div>;
};

export default ProjectList;

// export default class ProjectList {
//     public readonly element: HTMLDivElement;
//     private readonly list: HTMLUListElement;

//     public constructor(
//         private storage: DataStorage,
//         private events: EventBoard,
//     ) {
//         this.element = document.createElement('div');
//         this.list = document.createElement('ul');
//         this.element.appendChild(this.list);

//         const nameField = document.createElement('input');
//         const createButton = document.createElement('button');
//         createButton.append(t().createProject)
//         createButton.addEventListener('click', () => {
//             const name = nameField.value;
//             if (!name) return;
//             this.storage.saveProject({ name, text: '' });
//         });
//         this.element.appendChild(nameField);
//         this.element.appendChild(createButton);

//         this.events.storageChange.on(this.render.bind(this));

//         this.render();
//     }

//     private async render() {
//         while (this.list.lastChild) {
//             this.list.removeChild(this.list.lastChild);
//         }
//         const projects = await this.storage.getAllProjects();
//         for (let project of projects) {
//             const li = document.createElement('li');
//             li.append(project.name);
//             li.addEventListener('click', () => {
//                 this.events.selectProject.emit(project.name);
//             });
//             this.list.appendChild(li);
//         }
//     }
// }