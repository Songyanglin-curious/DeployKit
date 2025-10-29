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

# 配置参数
PACKAGE_NAME="{PACKAGE_NAME}"
UPDATE_PATH="{UPDATE_PATH}"
BACKUP_BASE_DIR="{BACKUP_PATH}"
UPDATE_NAME="{UPDATE_NAME}"
HAVE_BIN="{HAVE_BIN}"

echo "[$(date +'%Y-%m-%d %H:%M:%S')] 项目名称: $UPDATE_NAME" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 更新包路径: $PACKAGE_NAME" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 目标路径: $UPDATE_PATH" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 备份基目录: $BACKUP_BASE_DIR" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 是否有Bin目录: $HAVE_BIN" >> "$LOG_FILE"

# 检查更新包目录是否存在
if [ ! -d "$PACKAGE_NAME" ]; then
    echo -e "${RED}错误: 更新包目录不存在: $PACKAGE_NAME${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 错误: 更新包目录不存在: $PACKAGE_NAME" >> "$LOG_FILE"
    exit 1
fi

# 检查目标目录是否存在
if [ ! -d "$UPDATE_PATH" ]; then
    echo -e "${RED}错误: 目标目录不存在: $UPDATE_PATH${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 错误: 目标目录不存在: $UPDATE_PATH" >> "$LOG_FILE"
    exit 1
fi

# 检查并创建备份目录（如果不存在）
if [ ! -d "$BACKUP_BASE_DIR" ]; then
    mkdir -p "$BACKUP_BASE_DIR"
    echo -e "${GREEN}创建备份目录: $BACKUP_BASE_DIR${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 创建备份目录: $BACKUP_BASE_DIR" >> "$LOG_FILE"
fi

# 基础备份名称
BASE_NAME="$UPDATE_NAME"

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

# 备份所有文件
echo -e "${BLUE}正在扫描并备份文件...${NC}"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 开始扫描并备份文件..." >> "$LOG_FILE"

# 使用find命令遍历更新包中的所有文件
while IFS= read -r -d '' file; do
    # 获取相对路径
    rel_path=$(realpath --relative-to="$PACKAGE_NAME" "$file")
    
    # 目标文件路径
    target_file="$UPDATE_PATH/$rel_path"
    
    # 检查目标文件是否存在
    if [ -f "$target_file" ]; then
        ((TOTAL_FILES++))
        
        # 创建备份目录结构
        mkdir -p "$(dirname "$BACKUP_PATH/$rel_path")"
        
        # 备份文件
        if cp -p "$target_file" "$BACKUP_PATH/$rel_path" 2>> "$LOG_FILE"; then
            echo -e "${GREEN}已备份文件: $rel_path${NC}"
            echo "[$(date +'%Y-%m-%d %H:%M:%S')] 成功备份: $rel_path" >> "$LOG_FILE"
            ((SUCCESS_FILES++))
        else
            echo -e "${RED}错误: 文件 $rel_path 备份失败${NC}"
            echo "[$(date +'%Y-%m-%d %H:%M:%S')] 备份失败: $rel_path" >> "$LOG_FILE"
            ((FAILED_FILES++))
        fi
        
        # 如果启用了Bin目录备份，并且文件在bin目录下，也备份对应的Bin目录文件
        if [[ "$HAVE_BIN" == "true" && "$rel_path" == bin/* ]]; then
            bin_rel_path="${rel_path//bin/Bin}"
            bin_target_file="$UPDATE_PATH/$bin_rel_path"
            
            if [ -f "$bin_target_file" ]; then
                ((TOTAL_FILES++))
                mkdir -p "$(dirname "$BACKUP_PATH/$bin_rel_path")"
                if cp -p "$bin_target_file" "$BACKUP_PATH/$bin_rel_path" 2>> "$LOG_FILE"; then
                    echo -e "${GREEN}已备份文件: $bin_rel_path${NC}"
                    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 成功备份: $bin_rel_path" >> "$LOG_FILE"
                    ((SUCCESS_FILES++))
                else
                    echo -e "${RED}错误: 文件 $bin_rel_path 备份失败${NC}"
                    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 备份失败: $bin_rel_path" >> "$LOG_FILE"
                    ((FAILED_FILES++))
                fi
            else
                echo -e "${YELLOW}警告: Bin目录文件不存在: $bin_target_file${NC}"
                echo "[$(date +'%Y-%m-%d %H:%M:%S')] 警告: Bin目录文件不存在: $bin_target_file" >> "$LOG_FILE"
            fi
        fi
    else
        echo -e "${YELLOW}警告: 目标文件不存在，跳过备份: $target_file${NC}"
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] 警告: 目标文件不存在，跳过备份: $target_file" >> "$LOG_FILE"
        ((SKIPPED_FILES++))
    fi
done < <(find "$PACKAGE_NAME" -type f -print0)

# 备份结果统计
echo -e "${BLUE}备份完成! 文件保存在: $BACKUP_PATH${NC}"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] === 备份统计 ===" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 总文件数: $TOTAL_FILES" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 成功备份: $SUCCESS_FILES" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 跳过文件: $SKIPPED_FILES" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 失败文件: $FAILED_FILES" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 备份完成时间: $(date)" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] === 备份任务结束 ===" >> "$LOG_FILE"

# 控制台输出统计信息
echo ""
echo -e "${BLUE}=== 备份统计 ==="
echo -e "${BLUE}总文件数: $TOTAL_FILES"
echo -e "${GREEN}成功备份: $SUCCESS_FILES"
echo -e "${YELLOW}跳过文件: $SKIPPED_FILES"
echo -e "${RED}失败文件: $FAILED_FILES"
echo ""
echo -e "${GREEN}备份任务完成${NC}"