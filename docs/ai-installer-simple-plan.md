# AI助手一键安装包 - 简化方案

## 核心思路

把 **Codex 桌面版（绿色便携版）** + **cc-switch** + **配置脚本** 打包成一个 `.exe` 安装包，用户双击即可使用。

---

## 技术方案

### 方案概述

```
用户双击安装包
    ↓
自动解压到 C:\AI助手\
    ↓
运行配置脚本
    ↓
创建桌面快捷方式
    ↓
弹出 API Key 配置窗口
    ↓
完成！
```

### 文件结构

```
AI助手安装包/
├── 📄 安装.bat                    # 主安装脚本
├── 📁 Codex/                     # Codex 桌面版（绿色便携版）
│   ├── Codex.exe                 # 主程序
│   ├── 📁 resources/             # 资源文件
│   └── ...
├── 📁 cc-switch/                 # cc-switch 工具
│   ├── cc-switch.exe             # 主程序
│   └── 📁 config/                # 配置文件
├── 📁 scripts/                   # 辅助脚本
│   ├── setup.bat                 # 环境配置
│   ├── config-api.bat            # API 配置
│   └── create-shortcut.vbs       # 创建快捷方式
├── 📄 使用说明.txt                # 用户指南
└── 📄 README.md                  # 说明文档
```

---

## 实现步骤

### 第一步：获取 Codex 绿色便携版

#### 方法A：使用非官方离线便携版（推荐）

```bash
# 克隆仓库
git clone https://github.com/lusipad/unofficial-codex-app-offline.git

# 进入目录
cd unofficial-codex-app-offline

# 查看文件结构
ls -la
```

#### 方法B：手动制作绿色版

1. 打开微软商店 Codex 页面：
   https://apps.microsoft.com/detail/9plm9xgg6vks

2. 复制页面链接

3. 打开解析网站：
   https://store.rg-adguard.net/

4. 粘贴链接，点击搜索

5. 下载 `.msix` 文件

6. 将 `.msix` 改名为 `.rar`

7. 解压得到绿色版目录

---

### 第二步：准备 cc-switch

确保 cc-switch 是独立的 `.exe` 文件，无需额外依赖。

```
cc-switch/
├── cc-switch.exe          # 主程序
├── config.json            # 默认配置
└── 📁 lib/                # 依赖库（如果需要）
```

---

### 第三步：编写安装脚本

#### 主安装脚本 `安装.bat`

```batch
@echo off
chcp 65001 >nul
title AI助手安装程序

echo ========================================
echo         AI助手一键安装程序
echo ========================================
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [提示] 正在请求管理员权限...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: 设置安装目录
set INSTALL_DIR=C:\AI助手
echo [1/5] 创建安装目录...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: 复制文件
echo [2/5] 复制程序文件...
xcopy /E /I /Y "Codex" "%INSTALL_DIR%\Codex"
xcopy /E /I /Y "cc-switch" "%INSTALL_DIR%\cc-switch"
copy /Y "scripts\*.bat" "%INSTALL_DIR%\"
copy /Y "scripts\*.vbs" "%INSTALL_DIR%\"
copy /Y "使用说明.txt" "%INSTALL_DIR%\"

:: 配置环境变量
echo [3/5] 配置环境变量...
setx PATH "%PATH%;%INSTALL_DIR%\cc-switch" /M

:: 创建桌面快捷方式
echo [4/5] 创建桌面快捷方式...
cscript //nologo "%INSTALL_DIR%\create-shortcut.vbs"

:: 运行 API 配置
echo [5/5] 配置 API...
call "%INSTALL_DIR%\config-api.bat"

echo.
echo ========================================
echo         安装完成！
echo ========================================
echo.
echo 安装位置：%INSTALL_DIR%
echo 桌面已创建快捷方式"AI助手"
echo.
echo 按任意键退出...
pause >nul
```

#### API 配置脚本 `config-api.bat`

```batch
@echo off
chcp 65001 >nul
title API 配置

echo ========================================
echo           API 配置
echo ========================================
echo.

:: 获取用户输入
set /p API_KEY="请输入您的 API Key："
set /p PROXY_URL="请输入中转站地址（直接回车使用默认）："

:: 设置默认值
if "%PROXY_URL%"=="" set PROXY_URL=https://api.openai.com/v1

:: 保存配置
(
echo {
echo   "api_key": "%API_KEY%",
echo   "base_url": "%PROXY_URL%",
echo   "model": "gpt-4"
echo }
) > "%INSTALL_DIR%\cc-switch\config.json"

:: 测试连接
echo.
echo 正在测试连接...
curl -s -o nul -w "%%{http_code}" "%PROXY_URL%/models" > temp.txt
set /p HTTP_CODE=<temp.txt
del temp.txt

if "%HTTP_CODE%"=="200" (
    echo [成功] API 连接正常！
) else (
    echo [警告] API 连接失败，请检查配置
)

echo.
echo 配置完成！
pause
```

#### 创建快捷方式 `create-shortcut.vbs`

```vbs
Set WshShell = CreateObject("WScript.Shell")
Set shortcut = WshShell.CreateShortcut(WshShell.SpecialFolders("Desktop") & "\AI助手.lnk")
shortcut.TargetPath = "C:\AI助手\Codex\Codex.exe"
shortcut.WorkingDirectory = "C:\AI助手\Codex"
shortcut.Description = "AI助手 - Codex 桌面版"
shortcut.Save

Set shortcut2 = WshShell.CreateShortcut(WshShell.SpecialFolders("Desktop") & "\cc-switch.lnk")
shortcut2.TargetPath = "C:\AI助手\cc-switch\cc-switch.exe"
shortcut2.WorkingDirectory = "C:\AI助手\cc-switch"
shortcut2.Description = "cc-switch 工具"
shortcut2.Save
```

---

### 第四步：打包成 .exe 安装包

#### 方法A：使用 WinRAR 自解压（推荐）

1. 选中所有文件和文件夹
2. 右键 → 添加到压缩文件
3. 勾选"创建自解压格式压缩文件"
4. 设置：
   - 解压路径：`C:\AI助手`
   - 解压后运行：`安装.bat`
   - 模式：全部隐藏
5. 点击确定，生成 `.exe` 文件

#### 方法B：使用 NSIS 打包

```nsis
; AI助手.nsi
!include "MUI2.nsh"

Name "AI助手安装器"
OutFile "AI助手安装包.exe"
InstallDir "C:\AI助手"

Page directory
Page instfiles

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "Codex"
  File /r "cc-switch"
  File "安装.bat"
  File "使用说明.txt"

  ; 运行安装脚本
  ExecWait '"$INSTDIR\安装.bat"'

  ; 创建桌面快捷方式
  CreateShortCut "$DESKTOP\AI助手.lnk" "$INSTDIR\Codex\Codex.exe"
SectionEnd
```

#### 方法C：使用 IExpress（Windows 自带）

1. 运行 `iexpress.exe`
2. 选择"提取文件并运行安装命令"
3. 添加所有文件
4. 设置安装命令：`安装.bat`
5. 完成向导，生成 `.exe`

---

## 最终交付物

```
AI助手安装包.exe          ← 用户只需要这一个文件
    ↓ 双击运行
    ↓ 自动解压到 C:\AI助手\
    ↓ 自动配置环境变量
    ↓ 自动创建桌面快捷方式
    ↓ 弹出 API 配置窗口
    ↓ 完成！
```

---

## 优势对比

| 对比项 | 原方案 | 新方案 |
|--------|--------|--------|
| 用户操作 | 多步骤配置 | 双击一下 |
| 安装时间 | 5-10分钟 | 1-2分钟 |
| 技术要求 | 需要一定基础 | 完全傻瓜式 |
| 文件数量 | 多个安装包 | 单个 .exe |
| 离线支持 | 需要网络 | 完全离线 |

---

## 注意事项

1. **文件大小**：打包后约 200-300MB
2. **杀毒软件**：可能误报，需要添加白名单
3. **权限问题**：需要管理员权限写入 C 盘
4. **更新机制**：后续更新需要重新打包

---

## 后续优化

- [ ] 支持自定义安装路径
- [ ] 支持卸载功能
- [ ] 支持自动更新
- [ ] 支持多语言

---

*方案完成*