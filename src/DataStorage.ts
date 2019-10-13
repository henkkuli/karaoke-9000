import * as idb from 'idb';

import EventBoard from './EventBoard';
import Project from './Project';

interface DbSchema extends idb.DBSchema {
    projects: {
        key: string,
        value: Project,
    };
}

export default class DataStorage {
    private versionCounter = 0;
    private constructor(
        private db: idb.IDBPDatabase<DbSchema>,
        private events: EventBoard
    ) {
    }

    public static async create(events: EventBoard) {
        const storage = new DataStorage(await idb.openDB('db', 1, {
            upgrade(db) {
                db.createObjectStore('projects');
            }
        }), events);
        return storage;
    }

    public async getAllProjects() {
        return this.db.getAll("projects");
    }

    public async saveProject(project: Project) {
        await this.db.put("projects", project, project.name);
        this.events.storageChange.emit();
        this.versionCounter++;
    }

    public get version() {
        return this.versionCounter;
    }
}

