#!/bin/bash

# 部署脚本
# 用法: ./deploy.sh
# 功能: 先执行备份，再执行更新

echo "=== 开始部署 ==="
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 部署脚本启动" >> deploy.log

# 先执行备份
echo "正在执行备份..."
if bash backup.sh; then
    echo "备份成功完成"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 备份成功完成" >> deploy.log
else
    echo "错误: 备份失败"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 错误: 备份失败" >> deploy.log
    exit 1
fi

# 再执行更新
echo "正在执行更新..."
if bash update.sh; then
    echo "更新成功完成"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 更新成功完成" >> deploy.log
    echo "=== 部署成功 ==="
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] === 部署成功 ===" >> deploy.log
else
    echo "错误: 更新失败"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 错误: 更新失败" >> deploy.log
    exit 1
fi
