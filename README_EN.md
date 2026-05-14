# Copilot Switch

<p align="center">
  <b>🔄 Visual Proxy Configuration Manager for GitHub Copilot CLI & Claude Code</b>
</p>

<p align="center">
  Manage multiple LLM provider configurations with a graphical interface.<br>
  Launch CLI with one click — all environment variables injected automatically.
</p>

---

## ✨ Features

- **Web GUI** — Add, edit, delete, and switch between provider configurations visually
- **Dual Tabs** — 🤖 Copilot BYOK + 🧠 Claude Code proxy — switch with one click
- **One-Click Launch** — `cps` / `claudes` commands list all providers with interactive selection
- **CLI Launcher** — `cps` / `claudes` commands support interactive provider selection
- **Multi-Provider** — Supports OpenAI-compatible endpoints, Azure OpenAI, and Anthropic
- **Offline Mode** — Works with local models (Ollama, vLLM, etc.)
- **API Key Protection** — Password field with 👁 toggle for plaintext view
- **Live Preview** — Real-time environment variable preview while editing
- **Zero Frontend Dependencies** — Pure HTML/CSS/JS, no Node.js required

## 📋 Supported Environment Variables

### Copilot CLI

| Variable | Description |
|---|---|
| `COPILOT_PROVIDER_BASE_URL` | API endpoint base URL |
| `COPILOT_PROVIDER_TYPE` | `openai` / `azure` / `anthropic` |
| `COPILOT_PROVIDER_API_KEY` | API key |
| `COPILOT_MODEL` | Model identifier |
| `COPILOT_PROVIDER_MAX_OUTPUT_TOKENS` | Max output tokens (default 128000) |
| `COPILOT_PROVIDER_MAX_PROMPT_TOKENS` | Max prompt tokens (default 840000) |
| `COPILOT_OFFLINE` | Offline mode |

### Claude Code Proxy

| Variable | Description |
|---|---|
| `ANTHROPIC_BASE_URL` | API endpoint base URL |
| `ANTHROPIC_AUTH_TOKEN` | API key |
| `ANTHROPIC_MODEL` | Default model identifier |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | Sonnet model (optional, defaults to model) |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | Opus model (optional) |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | Haiku model (optional) |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | Disable non-essential traffic (on by default) |

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- [GitHub Copilot CLI](https://docs.github.com/copilot/concepts/agents/about-copilot-cli) or [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed
- At least one LLM provider API key or a running local model

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/copilot-switch.git
cd copilot-switch
pip install -r requirements.txt
```

### Start GUI

```bash
python copilot_switch.py
# Open http://127.0.0.1:5000 in your browser
```

Or double-click `run.bat` (auto-installs dependencies, starts server, opens browser).

### CLI Launch

```bash
# Add the directory to your PATH
setx PATH "%PATH%;E:\copilot_switch"

# Then from any terminal:
cps              # List all providers, select one, then launch Copilot CLI
cps --print      # Show the currently active Copilot configuration
claudes          # List all providers, select one, then launch Claude Code
claudes --print  # Show the currently active Claude configuration
```

## 📖 Usage Guide

### Tab Switching

Open the Web GUI and click **🤖 Copilot** or **🧠 Claude** in the top tab bar to switch between management targets. Each tab's data is completely independent.

### 1. Add a Provider

Click **+ Add Config** and fill in the form:

**Copilot tab:**
- **Name**: A label for this configuration (e.g. "OpenAI GPT-4o")
- **Provider Type**: Select `openai` / `azure` / `anthropic`
- **Base URL**: The API endpoint address
- **API Key**: Your API key (click 👁 to toggle visibility)
- **Model Name**: e.g. `gpt-4o`, `claude-sonnet-4-5`, `llama3.2`
- **Max Tokens**: Optional — defaults are used when left blank
- **Offline Mode**: Check for local models (sets `COPILOT_OFFLINE=true`)

**Claude tab:**
- **Name**: A label for this configuration (e.g. "Claude via DeepSeek")
- **Base URL**: The proxy endpoint address
- **API Key**: Your API key
- **Model Name**: e.g. `claude-sonnet-4-5`
- **Default Sonnet/Opus/Haiku Model**: Optional — defaults to model name
- **Disable Non-Essential Traffic**: Checked by default to avoid telemetry

The modal shows a live preview of the environment variables that will be set.

### 2. Activate a Configuration

Click **Activate** on a provider card. The active configuration is highlighted with a green border and checkmark.

The **Config Preview** panel at the bottom displays the full environment variable setup for the active provider. API keys are masked by default with a toggle.

### 3. Launch CLI

Run `cps` or `claudes` from any terminal. It lists all configured providers, marking the active one with `*`. Press Enter to confirm the default, or enter a number to switch:

```
Available Providers:

   [1] Provider A (openai)
 * [2] Provider B (anthropic)
   [3] Provider C (openai)

[*] indicates the currently active configuration

Select a provider [press Enter to use default*2]: _
```

```bash
cps              # Interactive provider selection, then launch Copilot CLI
cps --print      # Show the currently active Copilot configuration
claudes          # Interactive provider selection, then launch Claude Code
claudes --print  # Show the currently active Claude configuration
```

### Example Configurations

#### OpenAI

| Field | Value |
|---|---|
| Name | OpenAI GPT-4o |
| Type | openai |
| Base URL | `https://api.openai.com/v1` |
| API Key | `sk-...` |
| Model | `gpt-4o` |

#### Local Ollama

| Field | Value |
|---|---|
| Name | Ollama Llama3 |
| Type | openai |
| Base URL | `http://localhost:11434` |
| API Key | (leave blank) |
| Model | `llama3.2` |
| Offline | ✅ Enabled |

#### Anthropic Claude

| Field | Value |
|---|---|
| Name | Claude Sonnet |
| Type | anthropic |
| Base URL | `https://api.anthropic.com` |
| API Key | `sk-ant-...` |
| Model | `claude-sonnet-4-5` |

#### Azure OpenAI

| Field | Value |
|---|---|
| Name | Azure GPT-4 |
| Type | azure |
| Base URL | `https://RESOURCE.openai.azure.com/openai/deployments/DEPLOYMENT` |
| API Key | `...` |
| Model | `DEPLOYMENT-NAME` |

#### Claude Code Proxy

| Field | Value |
|---|---|
| Name | Claude via DeepSeek |
| Base URL | `https://api.deepseek.com/anthropic` |
| API Key | `sk-...` |
| Model | `claude-sonnet-4-5` |
| Disable Non-Essential | ✅ Enabled |

## 📁 File Structure

```
copilot-switch/
├── copilot_switch.py       # Flask backend (Copilot + Claude dual config CRUD)
├── cps.py                  # Copilot CLI launcher
├── cps.bat                 # Copilot CLI Windows batch wrapper
├── claudes.py              # Claude Code CLI launcher
├── claudes.bat             # Claude Code Windows batch wrapper
├── cpss.bat                # One-click GUI startup (install deps + start server + open browser)
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html          # Single-page web UI (🤖 Copilot / 🧠 Claude dual tabs)
├── static/
│   ├── style.css           # Stylesheet
│   └── app.js              # Frontend logic
├── README.md               # Chinese README
└── README_EN.md            # English README (this file)
```

## 🔧 Configuration Storage

**Copilot config** stored in `~/.copilot/providers.json`:

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

**Claude config** stored in `~/.claude/providers.json`:

```json
{
  "active": "abc123",
  "providers": [
    {
      "id": "abc123",
      "name": "Claude via DeepSeek",
      "base_url": "https://api.deepseek.com/anthropic",
      "api_key": "sk-xxx",
      "model": "claude-sonnet-4-5",
      "sonnet_model": null,
      "opus_model": null,
      "haiku_model": null,
      "disable_nonessential_traffic": true
    }
  ]
}
```

## ❓ FAQ

**Q: How do I use the `cps` / `claudes` commands from anywhere?**  
A: Add the `copilot-switch` directory to your system PATH:
```cmd
setx PATH "%PATH%;C:\path\to\copilot-switch"
```

**Q: Why does Copilot CLI show a token warning?**  
A: Copilot Switch always injects `COPILOT_PROVIDER_MAX_OUTPUT_TOKENS` (default 128000) and `COPILOT_PROVIDER_MAX_PROMPT_TOKENS` (default 840000). You can override these in the form.

**Q: How do I manage both Copilot and Claude configurations?**  
A: Open the Web GUI and switch between the 🤖 Copilot / 🧠 Claude tabs at the top. Each tab's data is stored independently under `~/.copilot/` and `~/.claude/`.

**Q: What fields do I need for Claude Code proxy?**  
A: At minimum, Base URL and model name. Sonnet/Opus/Haiku model names are optional (defaults to the main model). It's recommended to keep "Disable Non-Essential Traffic" checked to avoid telemetry.

**Q: Is my API key secure?**  
A: Keys are stored locally in `providers.json`. The web UI listens only on `127.0.0.1` (localhost). Do not commit `providers.json` to public repositories.

**Q: Can I use this on Linux/macOS?**  
A: The core Python app works cross-platform. The `.bat` scripts are Windows-specific — use `python copilot_switch.py`, `python cps.py`, and `python claudes.py` directly on other platforms.

## 📄 License

MIT License

## 🙏 References

- [GitHub Copilot CLI Documentation](https://docs.github.com/copilot/concepts/agents/about-copilot-cli)
- [BYOK Models Documentation](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models)
