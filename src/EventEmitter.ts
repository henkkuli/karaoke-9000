export default class EventEmitter<Params extends any[] = []> {
    private readonly callbacks = new Set<(...params: Params) => void>();

    public constructor(private name: string) { }

    public on(callback: (...params: Params) => void) {
        this.callbacks.add(callback);
        return () => {
            this.off(callback);
        }
    }

    public off(callback: (...params: Params) => void) {
        this.callbacks.delete(callback);
    }

    public emit(...params: Params) {
        console.debug(`Emitting ${this.name}(%o)`, params);
        for (let callback of this.callbacks) {
            callback(...params);
        }
    }
}
