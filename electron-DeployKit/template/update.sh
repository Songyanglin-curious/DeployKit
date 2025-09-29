#!/bin/bash
# 更新脚本
# 用法: ./update.sh

LOG_FILE="update.log"
echo "=== 更新任务开始 ===" > "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 更新脚本启动" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 执行用户: $(whoami)" >> "$LOG_FILE"

# 检查备份日志是否存在或为空
if [ ! -f "backup.log" ] || [ ! -s "backup.log" ]; then
    echo "错误: 没有找到备份日志或备份日志为空"
    echo "请先执行备份脚本: bash backup.sh"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 错误: 没有找到备份日志或备份日志为空" >> "$LOG_FILE"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 更新任务终止" >> "$LOG_FILE"
    exit 1
fi

PACKAGE_NAME="{PACKAGE_NAME}"
PROCESS_PATH="{PROCESS_PATH}"
PROCESS_NAME="{PROCESS_NAME}"

# 控制台输出
echo "=== 开始更新 ==="
echo "项目: $PROCESS_NAME"
echo "更新目录: $PROCESS_PATH"
echo ""

echo "[$(date +'%Y-%m-%d %H:%M:%S')] 项目名称: $PROCESS_NAME" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 更新目录: $PROCESS_PATH" >> "$LOG_FILE"

# 文件比较和更新逻辑
echo "正在比较文件差异..."
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 开始比较文件差异..." >> "$LOG_FILE"

# 初始化统计变量
TOTAL_FILES=0
UPDATED_FILES=0
ADDED_FILES=0
UNCHANGED_FILES=0

# 处理更新包中的每个文件
while IFS= read -r -d '' file; do
    ((TOTAL_FILES++))
    # 获取相对路径并处理特殊字符
    rel_path=$(realpath --relative-to="$PACKAGE_NAME" "$file")
    target_file="$PROCESS_PATH/$rel_path"
    
    # 检查目标路径是否存在该文件
    if [ -f "$target_file" ]; then
        # 比较文件大小和内容
        if [ ! -f "$target_file" ] || 
           [ $(stat -c%s "$file") -ne $(stat -c%s "$target_file") ] || 
           ! cmp -s "$file" "$target_file" 
        then
            # 创建目标目录并保留权限
            mkdir -p "$(dirname "$target_file")"
            # 更新文件并保留权限、时间戳等属性
            if cp -p "$file" "$target_file"; then
                echo "更新文件: $rel_path"
                echo "[$(date +'%Y-%m-%d %H:%M:%S')] 更新文件: $rel_path (内容有变化)" >> "$LOG_FILE"
                ((UPDATED_FILES++))
            else
                echo "[$(date +'%Y-%m-%d %H:%M:%S')] 错误: 更新文件失败: $rel_path" >> "$LOG_FILE"
            fi
        else
            echo "跳过文件: $rel_path (无变化)"
            echo "[$(date +'%Y-%m-%d %H:%M:%S')] 跳过文件: $rel_path (内容无变化)" >> "$LOG_FILE"
            ((UNCHANGED_FILES++))
        fi
    else
        # 创建新文件并保留权限
        mkdir -p "$(dirname "$target_file")"
        if cp -p "$file" "$target_file"; then
            echo "添加文件: $rel_path"
            echo "[$(date +'%Y-%m-%d %H:%M:%S')] 添加文件: $rel_path (新文件)" >> "$LOG_FILE"
            ((ADDED_FILES++))
        else
            echo "[$(date +'%Y-%m-%d %H:%M:%S')] 错误: 添加文件失败: $rel_path" >> "$LOG_FILE"
        fi
    fi
done < <(find "$PACKAGE_NAME" -type f -print0)

# 添加统计信息
echo "[$(date +'%Y-%m-%d %H:%M:%S')] === 更新统计 ===" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 总文件数: $TOTAL_FILES" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 更新文件数: $UPDATED_FILES" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 添加文件数: $ADDED_FILES" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 未更改文件数: $UNCHANGED_FILES" >> "$LOG_FILE"

# 控制台输出统计信息
echo ""
echo "=== 更新统计 ==="
echo "总文件数: $TOTAL_FILES"
echo "更新文件数: $UPDATED_FILES"
echo "添加文件数: $ADDED_FILES"
echo "未更改文件数: $UNCHANGED_FILES"
echo ""
echo "更新任务完成"

echo "[$(date +'%Y-%m-%d %H:%M:%S')] 更新任务完成" >> "$LOG_FILE"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] === 更新任务结束 ===" >> "$LOG_FILE"
