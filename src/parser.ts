export interface Part {
    start: number;
    end: number;
    text: string;
}
interface UnscheduledLine {
    settings: Settings;
    row: number | null;
    parts: Part[];
}
export interface Line {
    settings: Settings;
    row: number;
    parts: Part[];
}
export type Song = Line[];
interface Settings {
    autostart?: number;
    resolution?: [number, number];
    fontfamily?: string;
    fontsize?: number;
    color1?: string;
    color2?: string;
}

// class Parser {
//     private pos = 0;
//     public constructor(private text:string){}

//     private consume():string|number {

//     }
// }

// class Tokenizer {
//     private pos = 0;
//     public constructor(private text:string){}

//     private consume():string|number {

//     }
// }

function normalizeSetting(name: string, value: string): [keyof Settings, [number, number] | string | number] | undefined {
    switch (name) {
        case 'autostart':
            return ['autostart', parseInt(value)];
        case 'res':
        case 'resolution':
            return ['resolution', value.split('x', 2).map(v => parseInt(v)) as [number, number]];
        case 'fontsize':
            return ['fontsize', parseInt(value)];
        case 'fontfamily':
            return ['fontfamily', value];
        case 'c1':
        case 'color1':
            return ['color1', value];
        case 'c2':
        case 'color2':
            return ['color2', value];
    }
}

function tokenizeLine(line: string) {
    let left = line;
    const res: (string | { type: string, time: number } | { row: number } | { settings: [string, string][] })[] = [];

    const settingsMatch = left.match(/^!{(.*?)}/);
    if (settingsMatch) {
        const parts = settingsMatch[1].split(',');
        res.push({ settings: parts.map(part => part.split('=', 2) as [string, string]) });
        left = left.substr(settingsMatch[0].length);
    }

    const rowMatch = left.match(/^#(\d+)/);
    if (rowMatch) {
        res.push({ row: parseInt(rowMatch[1]) - 1 });
        left = left.substr(rowMatch[0].length);
    }
    while (left.length > 0) {
        const match = left.match(/^([^{]*)(?:{([+=]?)(\d+\.?|(?:\d+)?\.\d+)})/);
        if (match) {
            if (match[1].length > 0) {
                res.push(match[1]);
            }
            res.push({ type: match[2], time: parseFloat(match[3]) });
            left = left.substr(match[0].length);
        } else {
            res.push(left);
            break;
        }
    }
    return res;
}

function tokenize(text: string) {
    return text.split('\n').map(tokenizeLine);
}

export function parse(text: string) {
    const tokenLines = tokenize(text); // .map(line => parseLine(line))
    let baseTime = 0;
    let offsetTime = 0;
    let tokenStartTime = 0;
    let result: UnscheduledLine[] = [];
    let settings: Partial<Settings> = {};
    for (let tokenLine of tokenLines) {
        let row: number | null = null;
        let hangingTokens: string[] = [];
        const line: Part[] = [];
        let firstToken = true;
        for (let token of tokenLine) {
            if (typeof token === 'string') {
                if (line.length === 0 && hangingTokens.length === 0 && settings.autostart && settings.autostart <= result.length) {
                    const start = endTime(result[result.length - settings.autostart]);
                    if (start !== null) {
                        line.push({
                            start: start,
                            end: tokenStartTime,
                            text: '',
                        });
                    } else {
                        for (let backline = settings.autostart - 1; backline > 0; backline--) {
                            const start = startTime(result[result.length - backline]);
                            if (start !== null) {
                                line.push({
                                    start: start,
                                    end: tokenStartTime,
                                    text: '',
                                });
                                break;
                            }
                        }
                    }
                }
                hangingTokens.push(token);
                firstToken = false;
            } else if ('type' in token) {
                if (token.type === '') {
                    offsetTime = token.time;
                } else if (token.type === '+') {
                    offsetTime += token.time;
                } else if (token.type === '=') {
                    baseTime = token.time;
                    offsetTime = 0;
                } else {
                    throw new Error(`Unknown time type ${token.type}`);
                }
                // No backward going
                if (baseTime + offsetTime < tokenStartTime) {
                    if (line.length > 0 || hangingTokens.length > 0) {
                        offsetTime = tokenStartTime - baseTime;
                    } else {
                        tokenStartTime = baseTime + offsetTime;
                    }
                }
                if (hangingTokens.length === 0 && !firstToken) {
                    hangingTokens.push('');
                }
                for (let token of hangingTokens) {
                    line.push({
                        start: tokenStartTime,
                        end: baseTime + offsetTime,
                        text: token,
                    });
                }
                hangingTokens = [];
                tokenStartTime = baseTime + offsetTime;
                firstToken = false;
            } else if ('settings' in token) {
                settings = { ...settings };
                for (let setting of token.settings) {
                    const normalized = normalizeSetting(setting[0], setting[1]);
                    if (!normalized) continue;
                    const [key, value] = normalized;
                    settings[key] = value as any;
                }
            } else {
                row = token.row;
                firstToken = false;
            }
        }
        for (let token of hangingTokens) {
            line.push({
                start: tokenStartTime,
                end: baseTime + offsetTime,
                text: token,
            });
        }
        result.push({
            settings: settings,
            row: row,
            parts: line,
        })
    }
    return result;
}

export function startTime(line: Line | UnscheduledLine) {
    if (line.parts.length === 0) return null;
    return line.parts[0].start;
}

export function endTime(line: Line | UnscheduledLine | Song): number | null {
    if ('length' in line) {
        return Math.max(...(line.map(line => endTime(line)).filter(time => time !== null) as number[]));
    }
    if (line.parts.length === 0) return null;
    return Math.max(...line.parts.map(part => part.end));
}

function schedule(song: UnscheduledLine[]): Line[] {
    const reservedUntil: number[] = [];
    let settings: Settings = {};
    return song.map(line => {
        const start = startTime(line);
        if (start === null) return null;
        for (let row = 0; ; row++) {
            if (reservedUntil[row] === undefined || reservedUntil[row] <= start) {
                reservedUntil[row] = endTime(line)!;
                settings = { ...settings, ...line.settings };
                return {
                    ...line,
                    settings,
                    row: row,
                }
            }
        }
    }).filter(line => line !== null) as Line[];
}

export default function parseAndSchedule(text: string): Song {
    return schedule(parse(text));
}