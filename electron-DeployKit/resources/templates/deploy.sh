#!/bin/bash

# 颜色定义
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 部署脚本
# 用法: ./deploy.sh
# 功能: 先执行备份，再执行更新

echo -e "${CYAN}=== 开始部署 ===${NC}"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] 部署脚本启动" >> deploy.log

# 先执行备份
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}============ 开始执行备份 =============${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo "[$(date +'%Y-%m-%d %H:%M:%S')] ======== 开始执行备份 ========" >> deploy.log

echo -e "${CYAN}正在执行备份...${NC}"
if bash backup.sh; then
    echo ""
    echo -e "${GREEN}备份成功完成${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 备份成功完成" >> deploy.log
else
    echo ""
    echo -e "${RED}错误: 备份失败${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 错误: 备份失败" >> deploy.log
    exit 1
fi

# 再执行更新
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}============ 开始执行更新 =============${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo "[$(date +'%Y-%m-%d %H:%M:%S')] ======== 开始执行更新 ========" >> deploy.log

echo -e "${CYAN}正在执行更新...${NC}"
if bash update.sh; then
    echo ""
    echo -e "${GREEN}更新成功完成${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 更新成功完成" >> deploy.log
    echo ""
    echo -e "${CYAN}=== 部署成功 ===${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] === 部署成功 ===" >> deploy.log
else
    echo ""
    echo -e "${RED}错误: 更新失败${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 错误: 更新失败" >> deploy.log
    exit 1
fi
