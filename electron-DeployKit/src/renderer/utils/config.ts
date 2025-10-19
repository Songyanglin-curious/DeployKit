import { ConfigData } from "@/types/config";

export function getConfigTemplate(): ConfigData {
    return {
        "envs": [
            "虚拟机",
            "现场"
        ],
        "backup": {
            "虚拟机": "/home/ysh/web/webBackup/",
            "现场": "/home/ysh/web/webBackup/"
        },
        "update": {
            "虚拟机": "/home/ysh/web/SourceCode/",
            "现场": "/home/ysh/web/SourceCode/"
        },
        "dbConfig": {
            "虚拟机": "/bin/ConnCfg.xml",
            "现场": "/bin/ConnCfg.xml"
        },
        "Bin": {
            "虚拟机": true,
            "现场": true
        },
        "fragileFiles": {
            "虚拟机": [
                "/bin/YshDogInfo.dll"
            ],
            "现场": [
                "/bin/YshDogInfo.dll"
            ]
        }
    }
}

/**
 * 将配置对象根据envs数组的格式化为标准的格式。
 * @param config 
 */
export function formatConfigData(config: ConfigData): ConfigData {
    const result: ConfigData = {
        "envs": [],
        "backup": {},
        "update": {},
        "dbConfig": {},
        "Bin": {},
        "fragileFiles": {}
    };
    for (const env of config.envs) {
        result.envs.push(env);
        result.backup[env] = config.backup[env] || "";
        result.update[env] = config.update[env] || "";
        result.dbConfig[env] = config.dbConfig[env] || "";
        result.Bin[env] = config.Bin[env] || false;
        result.fragileFiles[env] = config.fragileFiles[env] || [];
    }
    return result;
}