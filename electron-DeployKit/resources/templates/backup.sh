#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志配置
LOG_FILE="backup.log"
echo "=== 备份任务开始 ===" > "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 备份脚本启动" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 执行用户: $(whoami)" >> "$LOG_FILE"

# 备份统计
TOTAL_FILES=0
SUCCESS_FILES=0
SKIPPED_FILES=0
FAILED_FILES=0

# 源目录
PROCESS_DIR="{UPDATE_PATH}"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 源目录: $PROCESS_DIR" >> "$LOG_FILE"

# 备份基目录
BACKUP_BASE_DIR="{BACKUP_PATH}"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 备份基目录: $BACKUP_BASE_DIR" >> "$LOG_FILE"

# 检查并创建备份目录（如果不存在）
if [ ! -d "$BACKUP_BASE_DIR" ]; then
    mkdir -p "$BACKUP_BASE_DIR"
    echo -e "${GREEN}创建备份目录: $BACKUP_BASE_DIR${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 创建备份目录: $BACKUP_BASE_DIR" >> "$LOG_FILE"
fi

# 基础备份名称
BASE_NAME="{UPDATE_NAME}"

# 获取当前时间戳
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 初始备份目录名称
BACKUP_NAME="${BASE_NAME}_${TIMESTAMP}"
BACKUP_PATH="$BACKUP_BASE_DIR/$BACKUP_NAME"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 备份版本号: $BACKUP_NAME" >> "$LOG_FILE"

# 如果目录已存在，递增序号
COUNT=1
while [ -d "$BACKUP_PATH" ]; do
    BACKUP_NAME="${BASE_NAME}_${TIMESTAMP}_${COUNT}"
    BACKUP_PATH="$BACKUP_BASE_DIR/$BACKUP_NAME"
    ((COUNT++))
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 目录已存在，尝试新版本: $BACKUP_NAME" >> "$LOG_FILE"
done

# 创建备份目录
mkdir -p "$BACKUP_PATH"
echo -e "${GREEN}开始备份，目标目录: $BACKUP_PATH${NC}"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 备份目标目录: $BACKUP_PATH" >> "$LOG_FILE"

# 需要备份的文件列表
FILES_TO_BACKUP=({FILES_TO_BACKUP})
TOTAL_FILES=${#FILES_TO_BACKUP[@]}
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 共需备份 $TOTAL_FILES 个文件" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 文件列表: ${FILES_TO_BACKUP[@]}" >> "$LOG_FILE"

# 备份所有文件
for file in "${FILES_TO_BACKUP[@]}"; do
    if [ -f "$PROCESS_DIR/$file" ]; then
        mkdir -p "$(dirname "$BACKUP_PATH/$file")"
        if cp -v "$PROCESS_DIR/$file" "$BACKUP_PATH/$file" >> "$LOG_FILE" 2>&1; then
            echo -e "${GREEN}已备份文件: $file${NC}"
            echo "[$(date +'%Y-%m-%d %H:%M:%S')] 成功备份: $file" >> "$LOG_FILE"
            ((SUCCESS_FILES++))
        else
            echo -e "${RED}错误: 文件 $file 备份失败${NC}"
            echo "[$(date +'%Y-%m-%d %H:%M:%S')] 备份失败: $file" >> "$LOG_FILE"
            ((FAILED_FILES++))
        fi
    else
        echo -e "${YELLOW}警告: 文件 $file 不存在，跳过${NC}"
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] 文件不存在: $file" >> "$LOG_FILE"
        ((SKIPPED_FILES++))
    fi
done

# 备份结果统计
echo -e "${GREEN}备份完成! 文件保存在: $BACKUP_PATH${NC}"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] === 备份统计 ===" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 总文件数: $TOTAL_FILES" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 成功备份: $SUCCESS_FILES" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 跳过文件: $SKIPPED_FILES" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 失败文件: $FAILED_FILES" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 备份完成时间: $(date)" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] === 备份任务结束 ===" >> "$LOG_FILE"
