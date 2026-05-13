# Copilot Switch

<p align="center">
  <b>🔄 GitHub Copilot CLI BYOK 可视化管理工具</b>
</p>

<p align="center">
  图形化管理多套 LLM 提供商配置，一键启动 Copilot CLI 自动注入环境变量。<br>
  告别手动 <code>export</code> / <code>set</code>，像切换浏览器标签页一样切换 AI 模型。
</p>

---

## ✨ 功能

- **Web GUI** — 浏览器访问，可视化增删改查多套提供商配置
- **一键启动** — `cps` 命令直接从终端以激活的配置启动
- **CLI 启动器** — `cps` 命令直接从终端以激活的配置启动
- **多提供商** — 支持 OpenAI 兼容端点、Azure OpenAI、Anthropic
- **脱机模式** — 支持本地模型（Ollama、vLLM 等）
- **API Key 保护** — 密码框 + 👁 切换明文，配置持久化时有掩码
- **实时预览** — 编辑时动态显示将设置的环境变量
- **零依赖前端** — 纯 HTML/CSS/JS，无需 Node.js

## 📋 支持的环境变量

| 变量 | 说明 |
|---|---|
| `COPILOT_PROVIDER_BASE_URL` | API 端点 |
| `COPILOT_PROVIDER_TYPE` | `openai` / `azure` / `anthropic` |
| `COPILOT_PROVIDER_API_KEY` | API 密钥 |
| `COPILOT_MODEL` | 模型名称 |
| `COPILOT_PROVIDER_MAX_OUTPUT_TOKENS` | 最大输出 token（默认 128000） |
| `COPILOT_PROVIDER_MAX_PROMPT_TOKENS` | 最大提示 token（默认 840000） |
| `COPILOT_OFFLINE` | 脱机模式 |

## 🚀 快速开始

### 前提

- Python 3.8+
- [GitHub Copilot CLI](https://docs.github.com/copilot/concepts/agents/about-copilot-cli) 已安装
- 至少一个 LLM 提供商的 API Key 或本地模型

### 安装

```bash
git clone https://github.com/YOUR_USERNAME/copilot-switch.git
cd copilot-switch
pip install -r requirements.txt
```

### 启动 GUI

```bash
python copilot_switch.py
# 浏览器打开 http://127.0.0.1:5000
```

或者双击 `run.bat`（自动安装依赖 + 启动服务 + 打开浏览器）。

### 命令行启动

```bash
# 将目录加入 PATH
setx PATH "%PATH%;E:\copilot_switch"

# 之后在任意终端：
cps              # 以激活的配置启动 Copilot CLI
cps --print      # 查看当前激活的配置
```

## 📖 使用指南

### 1. 添加提供商

点击「+ 添加配置」，填写表单：

- **名称**：给这个配置起个名字（如 "OpenAI GPT-4o"）
- **提供商类型**：选择 `openai` / `azure` / `anthropic`
- **Base URL**：API 端点地址
- **API Key**：你的 API 密钥（支持 👁 切换明文）
- **模型名称**：如 `gpt-4o`、`claude-sonnet-4-5`、`llama3.2`
- **Max Tokens**：可选，不填使用默认值
- **脱机模式**：本地模型勾选此项 + `COPILOT_OFFLINE=true`

编辑时可实时预览将设置的环境变量。

### 2. 激活配置

在配置卡片上点击 **激活**，当前使用的配置会有绿色边框和 ✓ 标识。

页面底部「📋 当前配置预览」面板会显示激活配置的完整环境变量设置，API Key 默认掩码可切换。

### 3. 启动 Copilot

在任意终端运行：

```bash
cps              # 以激活的配置启动 Copilot CLI
cps --print      # 查看当前激活的配置
```

### 配置示例

#### OpenAI

| 字段 | 值 |
|---|---|
| 名称 | OpenAI GPT-4o |
| 类型 | openai |
| Base URL | `https://api.openai.com/v1` |
| API Key | `sk-...` |
| 模型 | `gpt-4o` |

#### 本地 Ollama

| 字段 | 值 |
|---|---|
| 名称 | Ollama Llama3 |
| 类型 | openai |
| Base URL | `http://localhost:11434` |
| API Key | （留空） |
| 模型 | `llama3.2` |
| 脱机模式 | ✅ 勾选 |

#### Anthropic Claude

| 字段 | 值 |
|---|---|
| 名称 | Claude Sonnet |
| 类型 | anthropic |
| Base URL | `https://api.anthropic.com` |
| API Key | `sk-ant-...` |
| 模型 | `claude-sonnet-4-5` |

#### Azure OpenAI

| 字段 | 值 |
|---|---|
| 名称 | Azure GPT-4 |
| 类型 | azure |
| Base URL | `https://RESOURCE.openai.azure.com/openai/deployments/DEPLOYMENT` |
| API Key | `...` |
| 模型 | `DEPLOYMENT-NAME` |

## 📁 文件结构

```
copilot-switch/
├── copilot_switch.py       # Flask 后端（配置 CRUD + 启动 API）
├── cps.py                  # CLI 启动器（直接以激活配置启动 copilot）
├── cps.bat                 # Windows 批处理包装器
├── run.bat                 # 一键启动 GUI
├── requirements.txt        # Python 依赖
├── BYOK_Usage_Guide.md     # Copilot CLI BYOK 使用说明
├── templates/
│   └── index.html          # Web UI 单页
├── static/
│   ├── style.css           # 样式
│   └── app.js              # 前端逻辑
└── README.md
```

## 🔧 配置存储

所有配置保存在 `~/.copilot/providers.json` 中，格式如下：

```json
{
  "active": "abc123",
  "providers": [
    {
      "id": "abc123",
      "name": "OpenAI GPT-4o",
      "type": "openai",
      "base_url": "https://api.openai.com/v1",
      "api_key": "sk-xxx",
      "model": "gpt-4o",
      "max_output_tokens": null,
      "max_prompt_tokens": null,
      "offline": false
    }
  ]
}
```

## ❓ 常见问题

**Q: 启动后终端显示乱码？**  
A: 确保终端编码为 UTF-8，`run.bat` 已自动设置 `chcp 65001`。

**Q: cps 命令找不到？**  
A: 需将 `copilot-switch` 目录加入系统 PATH。运行：
```cmd
setx PATH "%PATH%;你的目录路径"
```

**Q: Copilot CLI 提示 token 警告？**  
A: Copilot Switch 始终注入 `COPILOT_PROVIDER_MAX_OUTPUT_TOKENS` 和 `COPILOT_PROVIDER_MAX_PROMPT_TOKENS` 环境变量，默认值分别为 128000 和 840000。

**Q: 如何同时管理多套配置？**  
A: 添加多个提供商配置，点击「激活」即可切换。所有配置保存在同一个 JSON 文件中。

**Q: API Key 安全吗？**  
A: Key 存储在本地 `~/.copilot/providers.json` 中，不会上传。Web UI 仅监听 `127.0.0.1`，外网无法访问。建议不要将 `providers.json` 提交到公共仓库。

## 📄 许可

MIT License

## 🙏 参考

- [GitHub Copilot CLI 官方文档](https://docs.github.com/copilot/concepts/agents/about-copilot-cli)
- [BYOK 使用说明](https://docs.github.com/zh/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models)
