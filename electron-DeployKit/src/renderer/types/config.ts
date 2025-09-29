


export interface BackupUpdateMap {
    backup: Record<string, string>;
    update: Record<string, string>;
}

export interface ConfigData {
    desc: Record<string, string>;
    envs: string[];
    backupAndUpdate: BackupUpdateMap;
}


