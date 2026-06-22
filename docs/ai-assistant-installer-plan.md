# AI助手安装器 - 技术方案文档

## 1. 项目概述

### 1.1 项目背景

为降低 AI 编程工具的使用门槛，开发一款"一键安装"的引导程序，让不懂技术的用户也能快速使用 OpenAI Codex 进行 AI 编程。

### 1.2 目标用户

- **完全不懂技术**的终端用户
- 只会用鼠标点击，不会命令行操作
- 希望"开箱即用"，无需复杂配置

### 1.3 核心功能

| 功能 | 描述 |
|------|------|
| 自动安装 Codex CLI | 下载并安装 OpenAI 开源 Codex CLI |
| API Key 配置 | 引导用户输入自己的 API Key |
| 中转站配置 | 预置中转站地址，支持自定义 |
| 环境变量设置 | 自动配置系统环境变量 |
| 快捷方式创建 | 创建桌面/开始菜单快捷方式 |

### 1.4 技术选型

| 组件 | 技术方案 | 说明 |
|------|----------|------|
| GUI 框架 | Electron | 跨平台桌面应用框架 |
| 前端框架 | React + Tailwind CSS | 现代化 UI 开发 |
| CLI 核心 | Codex CLI (开源) | OpenAI 官方开源 CLI |
| 打包工具 | electron-builder | 生成 Windows .exe 安装包 |
| 脚本执行 | PowerShell | 系统级操作 |

### 1.5 项目结构

```
ai-assistant-installer/
├── package.json                # 项目配置
├── electron/                   # Electron 主进程
│   ├── main.js                 # 主进程入口
│   └── preload.js              # 预加载脚本
├── src/                        # React 前端
│   ├── App.jsx                 # 主组件
│   ├── components/             # UI 组件
│   │   ├── Welcome.jsx         # 欢迎界面
│   │   ├── SystemCheck.jsx     # 环境检测
│   │   ├── ApiConfig.jsx       # API 配置
│   │   ├── Installing.jsx      # 安装进度
│   │   └── Complete.jsx        # 完成界面
│   ├── utils/                  # 工具函数
│   │   ├── system.js           # 系统检测
│   │   ├── downloader.js       # 下载管理
│   │   └── installer.js        # 安装逻辑
│   └── assets/                 # 静态资源
│       └── logo.png            # 应用图标
├── scripts/                    # 安装脚本
│   ├── install-codex.ps1       # Codex 安装
│   ├── install-nodejs.ps1      # Node.js 安装
│   └── setup-env.ps1           # 环境配置
└── build/                      # 打包配置
    ├── icon.ico                # 应用图标
    └── installer.nsi           # NSIS 配置
```

---

---

## 2. 详细实现步骤

### 2.1 第一阶段：项目初始化（15分钟）

#### 步骤 1：创建 Electron 项目

```bash
# 创建项目目录
mkdir ai-assistant-installer
cd ai-assistant-installer

# 初始化 npm 项目
npm init -y

# 安装依赖
npm install electron electron-builder react react-dom tailwindcss
npm install -D @electron-forge/cli webpack webpack-cli
```

#### 步骤 2：配置 package.json

```json
{
  "name": "ai-assistant-installer",
  "version": "1.0.0",
  "description": "AI助手一键安装器",
  "main": "electron/main.js",
  "scripts": {
    "start": "electron .",
    "build": "webpack --mode production",
    "dist": "electron-builder --win"
  },
  "build": {
    "appId": "com.aiassistant.installer",
    "productName": "AI助手安装器",
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

#### 步骤 3：创建 Electron 主进程

```javascript
// electron/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    resizable: false,
    frame: false,  // 无边框窗口
    titleBarStyle: 'hidden'
  });

  mainWindow.loadFile('src/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

---

### 2.2 第二阶段：UI 界面开发（30分钟）

#### 步骤 4：创建主界面框架

```jsx
// src/App.jsx
import React, { useState } from 'react';
import Welcome from './components/Welcome';
import SystemCheck from './components/SystemCheck';
import ApiConfig from './components/ApiConfig';
import Installing from './components/Installing';
import Complete from './components/Complete';

function App() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    apiKey: '',
    proxyUrl: 'https://your-proxy.com'
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="app-container">
      {step === 1 && <Welcome onNext={nextStep} />}
      {step === 2 && <SystemCheck onNext={nextStep} />}
      {step === 3 && <ApiConfig config={config} setConfig={setConfig} onNext={nextStep} onBack={prevStep} />}
      {step === 4 && <Installing config={config} onNext={nextStep} />}
      {step === 5 && <Complete />}
    </div>
  );
}

export default App;
```

#### 步骤 5：欢迎界面

```jsx
// src/components/Welcome.jsx
import React from 'react';

export default function Welcome({ onNext }) {
  return (
    <div className="welcome-screen">
      <div className="logo">
        <img src="/assets/logo.png" alt="AI助手" />
      </div>
      <h1>AI助手安装器</h1>
      <p>一键安装 OpenAI Codex，开始您的 AI 编程之旅</p>
      <button onClick={onNext} className="btn-primary">
        开始安装
      </button>
    </div>
  );
}
```

#### 步骤 6：API 配置界面

```jsx
// src/components/ApiConfig.jsx
import React, { useState } from 'react';

export default function ApiConfig({ config, setConfig, onNext, onBack }) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const testConnection = async () => {
    setTesting(true);
    try {
      const result = await window.electronAPI.testApi(config.apiKey, config.proxyUrl);
      setTestResult(result.success ? '连接成功！' : '连接失败：' + result.error);
    } catch (err) {
      setTestResult('测试失败：' + err.message);
    }
    setTesting(false);
  };

  return (
    <div className="api-config">
      <h2>配置 API</h2>

      <div className="form-group">
        <label>API Key</label>
        <input
          type="password"
          value={config.apiKey}
          onChange={(e) => setConfig({...config, apiKey: e.target.value})}
          placeholder="请输入您的 API Key"
        />
      </div>

      <div className="form-group">
        <label>中转站地址（可选）</label>
        <input
          type="text"
          value={config.proxyUrl}
          onChange={(e) => setConfig({...config, proxyUrl: e.target.value})}
          placeholder="https://your-proxy.com"
        />
      </div>

      <button onClick={testConnection} disabled={testing}>
        {testing ? '测试中...' : '测试连接'}
      </button>

      {testResult && <p className="test-result">{testResult}</p>}

      <div className="button-group">
        <button onClick={onBack} className="btn-secondary">上一步</button>
        <button onClick={onNext} className="btn-primary" disabled={!config.apiKey}>
          下一步
        </button>
      </div>
    </div>
  );
}
```

---

### 2.3 第三阶段：核心功能实现（45分钟）

#### 步骤 7：系统检测模块

```javascript
// src/utils/system.js
const { exec } = require('child_process');
const os = require('os');

async function checkSystem() {
  const checks = {
    os: checkWindowsVersion(),
    disk: checkDiskSpace(),
    network: checkNetwork(),
    nodejs: checkNodejs()
  };

  const results = await Promise.all(Object.values(checks));
  return {
    windows: results[0],
    diskSpace: results[1],
    network: results[2],
    nodejs: results[3]
  };
}

function checkWindowsVersion() {
  const version = os.release();
  const major = parseInt(version.split('.')[0]);
  return {
    success: major >= 10,
    version: version,
    message: major >= 10 ? 'Windows 版本满足要求' : '需要 Windows 10 或更高版本'
  };
}

function checkDiskSpace() {
  return new Promise((resolve) => {
    exec('wmic logicaldisk where "DeviceID=\'C:\'" get FreeSpace', (err, stdout) => {
      const freeSpaceGB = parseInt(stdout.trim().split('\n')[1]) / (1024 * 1024 * 1024);
      resolve({
        success: freeSpaceGB >= 2,
        freeSpace: freeSpaceGB.toFixed(2) + ' GB',
        message: freeSpaceGB >= 2 ? '磁盘空间充足' : '需要至少 2GB 可用空间'
      });
    });
  });
}

async function checkNetwork() {
  try {
    const response = await fetch('https://api.openai.com', { method: 'HEAD' });
    return { success: true, message: '网络连接正常' };
  } catch {
    return { success: false, message: '网络连接失败，请检查网络' };
  }
}

function checkNodejs() {
  return new Promise((resolve) => {
    exec('node --version', (err, stdout) => {
      if (err) {
        resolve({ success: false, installed: false, message: '未安装 Node.js' });
      } else {
        resolve({ success: true, installed: true, version: stdout.trim(), message: 'Node.js 已安装' });
      }
    });
  });
}

module.exports = { checkSystem };
```

#### 步骤 8：下载管理器

```javascript
// src/utils/downloader.js
const https = require('https');
const fs = require('fs');
const path = require('path');

class Downloader {
  constructor() {
    this.progress = 0;
    this.totalSize = 0;
    this.downloadedSize = 0;
  }

  async downloadFile(url, destPath, onProgress) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destPath);

      https.get(url, (response) => {
        this.totalSize = parseInt(response.headers['content-length'], 10);

        response.on('data', (chunk) => {
          this.downloadedSize += chunk.length;
          this.progress = (this.downloadedSize / this.totalSize) * 100;
          if (onProgress) onProgress(this.progress);
        });

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve(destPath);
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });
  }

  async downloadCodexCLI(destDir) {
    const url = 'https://github.com/openai/codex/releases/latest/download/codex-win-x64.exe';
    const destPath = path.join(destDir, 'codex.exe');
    return this.downloadFile(url, destPath);
  }
}

module.exports = new Downloader();
```

#### 步骤 9：安装逻辑

```javascript
// src/utils/installer.js
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class Installer {
  async installNodejs() {
    return new Promise((resolve, reject) => {
      // 下载 Node.js 安装包
      const installerPath = path.join(process.env.TEMP, 'nodejs-setup.msi');

      // 静默安装
      exec(`msiexec /i "${installerPath}" /quiet`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async installCodexCLI(exePath) {
    return new Promise((resolve, reject) => {
      // 复制到安装目录
      const installDir = path.join(process.env.ProgramFiles, 'AI助手');
      if (!fs.existsSync(installDir)) {
        fs.mkdirSync(installDir, { recursive: true });
      }

      const destPath = path.join(installDir, 'codex.exe');
      fs.copyFileSync(exePath, destPath);

      // 添加到 PATH
      this.addToPath(installDir);

      resolve(destPath);
    });
  }

  addToPath(dir) {
    const psCommand = `
      $path = [Environment]::GetEnvironmentVariable("Path", "User")
      if ($path -notlike "*${dir}*") {
        [Environment]::SetEnvironmentVariable("Path", "$path;${dir}", "User")
      }
    `;

    exec(`powershell -Command "${psCommand}"`, (err) => {
      if (err) console.error('Failed to add to PATH:', err);
    });
  }

  async configureApiKey(apiKey, proxyUrl) {
    const configDir = path.join(process.env.USERPROFILE, '.codex');
    const configPath = path.join(configDir, 'config.json');

    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const config = {
      api_key: apiKey,
      base_url: proxyUrl || 'https://api.openai.com/v1'
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  createShortcut(targetPath, shortcutName) {
    const psCommand = `
      $WshShell = New-Object -comObject WScript.Shell
      $Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\\Desktop\\${shortcutName}.lnk")
      $Shortcut.TargetPath = "${targetPath}"
      $Shortcut.Save()
    `;

    exec(`powershell -Command "${psCommand}"`, (err) => {
      if (err) console.error('Failed to create shortcut:', err);
    });
  }
}

module.exports = new Installer();
```

---

### 2.4 第四阶段：打包部署（20分钟）

#### 步骤 10：构建打包

```bash
# 构建前端
npm run build

# 打包 Windows 安装包
npm run dist
```

#### 步骤 11：NSIS 配置（可选自定义）

```nsis
; build/installer.nsi
!include "MUI2.nsh"

Name "AI助手安装器"
OutFile "AI助手安装器-Setup-1.0.0.exe"
InstallDir "$PROGRAMFILES\AI助手"

Page directory
Page instfiles

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "dist\win-unpacked\*.*"

  ; 创建桌面快捷方式
  CreateShortCut "$DESKTOP\AI助手.lnk" "$INSTDIR\AI助手安装器.exe"

  ; 创建开始菜单
  CreateDirectory "$SMPROGRAMS\AI助手"
  CreateShortCut "$SMPROGRAMS\AI助手\AI助手.lnk" "$INSTDIR\AI助手安装器.exe"
  CreateShortCut "$SMPROGRAMS\AI助手\卸载.lnk" "$INSTDIR\uninstall.exe"
SectionEnd
```

---

---

## 3. 测试与优化

### 3.1 测试清单

| 测试项 | 测试内容 | 预期结果 | 优先级 |
|--------|----------|----------|--------|
| 安装测试 | 在全新 Windows 10/11 上安装 | 成功安装，无报错 | P0 |
| 网络测试 | 弱网环境下下载 | 支持断点续传 | P0 |
| API 测试 | 测试 API Key 连接 | 正确提示成功/失败 | P0 |
| 权限测试 | 无管理员权限安装 | 优雅降级，提示用户 | P1 |
| 卸载测试 | 完全卸载程序 | 清理所有文件和注册表 | P1 |
| 兼容性测试 | 不同 Windows 版本 | Win10/11 均可运行 | P0 |

### 3.2 常见问题处理

#### 问题 1：Windows Defender 拦截

**现象**：安装包被标记为"未知发布者"

**解决方案**：
```javascript
// 在安装前提示用户
function showDefenderWarning() {
  dialog.showMessageBox({
    type: 'warning',
    title: '安全提示',
    message: 'Windows 可能会显示安全警告',
    detail: '请点击"更多信息" → "仍要运行"继续安装',
    buttons: ['我知道了', '取消']
  });
}
```

#### 问题 2：网络下载失败

**现象**：下载 Codex CLI 时网络中断

**解决方案**：
```javascript
// 实现断点续传
async function downloadWithResume(url, destPath, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await downloader.downloadFile(url, destPath);
      return;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      console.log(`下载失败，正在重试 (${i + 1}/${maxRetries})...`);
      await sleep(2000); // 等待 2 秒后重试
    }
  }
}
```

#### 问题 3：权限不足

**现象**：无法写入 Program Files 目录

**解决方案**：
```javascript
// 检测权限并提示
async function checkAdminPrivileges() {
  try {
    fs.writeFileSync(path.join(process.env.ProgramFiles, 'test.txt'), 'test');
    fs.unlinkSync(path.join(process.env.ProgramFiles, 'test.txt'));
    return true;
  } catch {
    return false;
  }
}

// 如果没有权限，安装到用户目录
function getInstallDir() {
  const isAdmin = await checkAdminPrivileges();
  if (isAdmin) {
    return path.join(process.env.ProgramFiles, 'AI助手');
  } else {
    return path.join(process.env.LOCALAPPDATA, 'AI助手');
  }
}
```

### 3.3 性能优化

#### 优化 1：并行下载

```javascript
// 同时下载多个组件
async function downloadAll() {
  const tasks = [
    downloader.downloadCodexCLI(tempDir),
    downloader.downloadNodejs(tempDir)
  ];

  await Promise.all(tasks);
}
```

#### 优化 2：进度条优化

```jsx
// src/components/Installing.jsx
function Installing({ config, onNext }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('准备中...');

  useEffect(() => {
    window.electronAPI.onProgress((event, data) => {
      setProgress(data.progress);
      setStatus(data.status);
    });
  }, []);

  return (
    <div className="installing">
      <h2>正在安装</h2>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="status">{status}</p>
      <p className="percentage">{Math.round(progress)}%</p>
    </div>
  );
}
```

#### 优化 3：缓存机制

```javascript
// 缓存已下载的文件
const cacheDir = path.join(process.env.LOCALAPPDATA, 'AI助手', 'cache');

async function downloadWithCache(url, filename) {
  const cachedPath = path.join(cacheDir, filename);

  // 检查缓存是否存在且有效
  if (fs.existsSync(cachedPath)) {
    const stats = fs.statSync(cachedPath);
    const cacheAge = Date.now() - stats.mtimeMs;

    // 缓存 24 小时内有效
    if (cacheAge < 24 * 60 * 60 * 1000) {
      console.log('使用缓存文件:', cachedPath);
      return cachedPath;
    }
  }

  // 下载并缓存
  await downloader.downloadFile(url, cachedPath);
  return cachedPath;
}
```

### 3.4 用户体验优化

#### 优化 1：友好的错误提示

```jsx
function ErrorDialog({ error, onRetry, onCancel }) {
  const errorMessages = {
    'NETWORK_ERROR': '网络连接失败，请检查网络后重试',
    'DISK_FULL': '磁盘空间不足，请清理后重试',
    'PERMISSION_DENIED': '权限不足，请以管理员身份运行',
    'API_INVALID': 'API Key 无效，请检查后重新输入'
  };

  return (
    <div className="error-dialog">
      <div className="error-icon">⚠️</div>
      <h3>安装遇到问题</h3>
      <p>{errorMessages[error.code] || error.message}</p>
      <div className="button-group">
        <button onClick={onRetry}>重试</button>
        <button onClick={onCancel}>取消</button>
      </div>
    </div>
  );
}
```

#### 优化 2：安装成功引导

```jsx
// src/components/Complete.jsx
function Complete() {
  return (
    <div className="complete">
      <div className="success-icon">✅</div>
      <h2>安装成功！</h2>
      <p>AI助手已准备就绪</p>

      <div className="quick-start">
        <h3>快速开始</h3>
        <ol>
          <li>双击桌面"AI助手"图标启动</li>
          <li>在终端输入 <code>codex</code> 开始使用</li>
          <li>输入您的问题，AI 会自动编写代码</li>
        </ol>
      </div>

      <div className="button-group">
        <button onClick={() => launchCodex()}>立即启动</button>
        <button onClick={() => openDocs()}>查看教程</button>
      </div>
    </div>
  );
}
```

---

## 4. 发布与维护

### 4.1 版本更新流程

```
1. 修改代码 → 2. 更新版本号 → 3. 构建打包 → 4. 测试验证 → 5. 发布分发
```

### 4.2 自动更新机制（可选）

```javascript
// 检查更新
const { autoUpdater } = require('electron-updater');

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: '发现新版本',
    message: '是否现在更新？',
    buttons: ['更新', '稍后']
  }).then(({ response }) => {
    if (response === 0) autoUpdater.downloadUpdate();
  });
});
```

### 4.3 用户反馈收集

```javascript
// 收集安装日志
function collectLogs() {
  const logPath = path.join(app.getPath('userData'), 'logs');
  // 上传到服务器或本地分析
}
```

---

## 5. 总结

### 5.1 开发时间估算

| 阶段 | 内容 | 时间 |
|------|------|------|
| 第一阶段 | 项目初始化 | 15分钟 |
| 第二阶段 | UI 界面开发 | 30分钟 |
| 第三阶段 | 核心功能实现 | 45分钟 |
| 第四阶段 | 测试与优化 | 30分钟 |
| 第五阶段 | 打包部署 | 20分钟 |
| **总计** | | **约 2.5 小时** |

### 5.2 最终交付物

- `AI助手安装器-Setup-1.0.0.exe` - Windows 安装包
- 使用文档
- 源代码仓库

### 5.3 后续扩展

- 支持 macOS 版本
- 支持自动更新
- 支持多语言
- 支持更多 AI 模型

---

*文档完成*