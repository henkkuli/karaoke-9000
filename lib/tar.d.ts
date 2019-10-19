declare class Tar {
    append(filepath: string, content: string | Uint8Array, opts?: { mode?: string, mtime?: number, uid?: number, gid?: number }, callback?: (data: Uint8Array) => void): void;
    clear(): void;
    save(): Blob;
}

export = Tar;