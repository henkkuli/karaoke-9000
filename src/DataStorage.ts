import * as idb from 'idb';

import EventEmitter from './EventEmitter';
import Project from './Project';

interface DbSchema extends idb.DBSchema {
    projects: {
        key: string,
        value: Project,
    };
    audios: {
        key: string,
        value: Blob,
    }
}

export default class DataStorage {
    private versionCounter = 0;
    public readonly change = new EventEmitter('DataStorage.change');
    private constructor(
        private db: idb.IDBPDatabase<DbSchema>
    ) {
    }

    public static async create() {
        const storage = new DataStorage(await idb.openDB('db', 1, {
            upgrade(db) {
                db.createObjectStore('projects');
                db.createObjectStore('audios');
            }
        }));
        return storage;
    }

    public async getAllProjects() {
        return this.db.getAll("projects");
    }

    public async saveProject(project: Project) {
        await this.db.put("projects", project, project.name);
        this.change.emit();
        this.versionCounter++;
    }

    public async createProject(name: string, audio: Blob) {
        const tx = this.db.transaction(['projects', 'audios'], 'readwrite');
        await tx.objectStore('projects').put({ name, text: '' }, name);
        await tx.objectStore('audios').put(audio, name);
        this.change.emit();
        this.versionCounter++;
    }

    public async getAudio(name: string) {
        const data = await this.db.get('audios', name);
        if (data === undefined) throw new Error('Audio not found');
        return new Audio(URL.createObjectURL(data));
    }

    public async deleteProject(name: string) {
        await this.db.delete('projects', name);
        this.change.emit();
        this.versionCounter++;
    }

    public get version() {
        return this.versionCounter;
    }
}

