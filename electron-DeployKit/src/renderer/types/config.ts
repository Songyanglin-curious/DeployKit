


export interface ConfigData {

    envs: string[];
    backup: Record<string, string>;
    update: Record<string, string>;
    dbConfig: Record<string, string>;
    Bin: Record<string, boolean>;
    fragileFiles: Record<string, string[]>;
}


