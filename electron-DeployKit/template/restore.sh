#!/bin/bash
# 还原脚本
# 用法: ./restore.sh

# 颜色定义
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

LOG_FILE="restore.log"
UPDATE_LOG="update.log"
BACKUP_LOG="backup.log"

echo -e "${CYAN}=== 还原任务开始 ===" > "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 还原脚本启动" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 执行用户: $(whoami)" >> "$LOG_FILE"

# 检查必要的日志文件
if [ ! -f "$UPDATE_LOG" ]; then
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 错误: 更新日志文件不存在: $UPDATE_LOG" >> "$LOG_FILE"
    echo "错误: 更新日志文件不存在: $UPDATE_LOG"
    exit 1
fi

if [ ! -f "$BACKUP_LOG" ]; then
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 错误: 备份日志文件不存在: $BACKUP_LOG" >> "$LOG_FILE"
    echo "错误: 备份日志文件不存在: $BACKUP_LOG"
    exit 1
fi

# 从日志中提取必要信息
PROCESS_PATH=$(grep "更新目录:" "$UPDATE_LOG" | awk -F': ' '{print $2}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
BACKUP_BASE_DIR=$(grep "备份基目录:" "$BACKUP_LOG" | awk -F': ' '{print $2}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
BACKUP_VERSION=$(grep "备份版本号:" "$BACKUP_LOG" | awk -F': ' '{print $2}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
PROJECT_NAME=$(grep "项目名称:" "$UPDATE_LOG" | awk -F': ' '{print $2}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

# 构建完整备份目录路径
BACKUP_DIR="$BACKUP_BASE_DIR/$BACKUP_VERSION"

if [ -z "$BACKUP_DIR" ]; then
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 错误: 无法从备份日志中提取备份目录" >> "$LOG_FILE"
    echo "错误: 无法从备份日志中提取备份目录"
    exit 1
fi

echo "[$(date +'%Y-%m-%d %H:%M:%S')] 项目名称: $PROJECT_NAME" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 备份目录: $BACKUP_DIR" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 目标路径: $PROCESS_PATH" >> "$LOG_FILE"



# 初始化统计变量
TOTAL_FILES=0
RESTORED_FILES=0
REMOVED_FILES=0
SKIPPED_FILES=0

# 预统计总文件数（与更新脚本保持一致）
TOTAL_FILES=$(grep -c -E "更新文件:|添加文件:|跳过文件:" "$UPDATE_LOG")

# 解析更新日志并执行反向操作
while read -r line; do
    if echo "$line" | grep -qE "更新文件: [0-9]+$" || 
       echo "$line" | grep -qE "添加文件: [0-9]+$" || 
       echo "$line" | grep -qE "跳过文件: [0-9]+$"; then
        continue  # 跳过统计行
    fi
    
    if [[ "$line" =~ "更新文件:" ]]; then
        # 处理更新的文件 - 从备份还原
        # 提取并清理文件路径
        file_path=$(echo "$line" | awk -F': ' '{print $2}' | sed -e "s/ (内容有变化)//" -e "s/^ *//" -e "s/ *$//" -e "s#^/##")
        # 规范化路径
        backup_file=$(realpath -m "$BACKUP_DIR/$file_path")
        target_file=$(realpath -m "$PROCESS_PATH/$file_path")
        
        # 调试日志
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] 原始文件路径: $file_path" >> "$LOG_FILE"
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] 完整备份路径: $backup_file" >> "$LOG_FILE"
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] 完整目标路径: $target_file" >> "$LOG_FILE"
        
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] 处理更新文件: $file_path" >> "$LOG_FILE"
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] 备份文件路径: $backup_file" >> "$LOG_FILE"
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] 目标文件路径: $target_file" >> "$LOG_FILE"
        
        if [ -f "$backup_file" ]; then
            mkdir -p "$(dirname "$target_file")"
            if cp -p "$backup_file" "$target_file"; then
                echo "还原文件: $file_path"
                echo "[$(date +'%Y-%m-%d %H:%M:%S')] 成功还原文件: $file_path" >> "$LOG_FILE"
                ((RESTORED_FILES++))
            else
                echo "[$(date +'%Y-%m-%d %H:%M:%S')] 错误: 还原文件失败: $file_path" >> "$LOG_FILE"
            fi
        else
            echo "[$(date +'%Y-%m-%d %H:%M:%S')] 错误: 备份文件不存在: $backup_file" >> "$LOG_FILE"
            echo "错误: 备份文件不存在: $backup_file"
        fi
    elif [[ "$line" =~ "添加文件:" ]]; then
        # 处理新增的文件 - 删除

        file_path=$(echo "$line" | awk -F': ' '{print $2}' | sed "s/ (新文件)//")
        target_file="$PROCESS_PATH/$file_path"
        
        if [ -f "$target_file" ]; then
            if rm "$target_file"; then
                echo "删除文件: $file_path"
                echo "[$(date +'%Y-%m-%d %H:%M:%S')] 删除文件: $file_path" >> "$LOG_FILE"
                ((REMOVED_FILES++))
            else
                echo "[$(date +'%Y-%m-%d %H:%M:%S')] 错误: 删除文件失败: $file_path" >> "$LOG_FILE"
            fi
        else
            echo "[$(date +'%Y-%m-%d %H:%M:%S')] 警告: 目标文件不存在: $target_file" >> "$LOG_FILE"
        fi
    elif [[ "$line" =~ "跳过文件:" ]]; then
        # 处理未更改的文件 - 跳过

        file_path=$(echo "$line" | awk -F': ' '{print $2}' | sed "s/ (内容无变化)//")
        echo "跳过文件: $file_path"
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] 跳过文件: $file_path" >> "$LOG_FILE"
        ((SKIPPED_FILES++))
    fi
done < <(grep -E "更新文件:|添加文件:|跳过文件:" "$UPDATE_LOG")

# 添加统计信息
echo "[$(date +'%Y-%m-%d %H:%M:%S')] === 还原统计 ===" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 总文件数: $TOTAL_FILES" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 还原文件: $RESTORED_FILES" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 删除文件: $REMOVED_FILES" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 跳过文件: $SKIPPED_FILES" >> "$LOG_FILE"

# 控制台输出统计信息
echo ""
echo -e "${CYAN}=== 还原统计 ==="
echo -e "${CYAN}总文件数: $TOTAL_FILES"
echo -e "${GREEN}还原文件: $RESTORED_FILES"
echo -e "${RED}删除文件: $REMOVED_FILES"
echo -e "${YELLOW}跳过文件: $SKIPPED_FILES"
echo ""
echo -e "${CYAN}还原任务完成${NC}"

echo "[$(date +'%Y-%m-%d %H:%M:%S')] 还原任务完成" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] === 还原任务结束 ===" >> "$LOG_FILE"
