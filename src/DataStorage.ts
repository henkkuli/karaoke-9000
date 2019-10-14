import * as idb from 'idb';

import EventEmitter from './EventEmitter';
import Project from './Project';

interface DbSchema extends idb.DBSchema {
    projects: {
        key: string,
        value: Project,
    };
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

    public get version() {
        return this.versionCounter;
    }
}

