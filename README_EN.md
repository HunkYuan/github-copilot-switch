# Copilot Switch

<p align="center">
  <b>🔄 Visual BYOK Configuration Manager for GitHub Copilot CLI</b>
</p>

<p align="center">
  Manage multiple LLM provider configurations with a graphical interface.<br>
  Launch Copilot CLI with one click — all environment variables injected automatically.
</p>

---

## ✨ Features

- **Web GUI** — Add, edit, delete, and switch between provider configurations visually
- **One-Click Launch** — `cps` command launches Copilot CLI directly from any terminal
- **CLI Launcher** — `cps` command launches Copilot CLI directly from any terminal
- **Multi-Provider** — Supports OpenAI-compatible endpoints, Azure OpenAI, and Anthropic
- **Offline Mode** — Works with local models (Ollama, vLLM, etc.)
- **API Key Protection** — Password field with 👁 toggle for plaintext view
- **Live Preview** — Real-time environment variable preview while editing
- **Zero Frontend Dependencies** — Pure HTML/CSS/JS, no Node.js required

## 📋 Supported Environment Variables

| Variable | Description |
|---|---|
| `COPILOT_PROVIDER_BASE_URL` | API endpoint base URL |
| `COPILOT_PROVIDER_TYPE` | `openai` / `azure` / `anthropic` |
| `COPILOT_PROVIDER_API_KEY` | API key |
| `COPILOT_MODEL` | Model identifier |
| `COPILOT_PROVIDER_MAX_OUTPUT_TOKENS` | Max output tokens (default 128000) |
| `COPILOT_PROVIDER_MAX_PROMPT_TOKENS` | Max prompt tokens (default 840000) |
| `COPILOT_OFFLINE` | Offline mode |

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- [GitHub Copilot CLI](https://docs.github.com/copilot/concepts/agents/about-copilot-cli) installed
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
cps              # Launch Copilot CLI with the active configuration
cps --print      # Show the currently active configuration
```

## 📖 Usage Guide

### 1. Add a Provider

Click **+ Add Config** and fill in the form:

- **Name**: A label for this configuration (e.g. "OpenAI GPT-4o")
- **Provider Type**: Select `openai` / `azure` / `anthropic`
- **Base URL**: The API endpoint address
- **API Key**: Your API key (click 👁 to toggle visibility)
- **Model Name**: e.g. `gpt-4o`, `claude-sonnet-4-5`, `llama3.2`
- **Max Tokens**: Optional — defaults are used when left blank
- **Offline Mode**: Check for local models (sets `COPILOT_OFFLINE=true`)

The modal shows a live preview of the environment variables that will be set.

### 2. Activate a Configuration

Click **Activate** on a provider card. The active configuration is highlighted with a green border and checkmark.

The **Config Preview** panel at the bottom displays the full environment variable setup for the active provider. API keys are masked by default with a toggle.

### 3. Launch Copilot

Run from any terminal:

```bash
cps              # Launch Copilot CLI with the active configuration
cps --print      # Show the currently active configuration
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

## 📁 File Structure

```
copilot-switch/
├── copilot_switch.py       # Flask backend (config CRUD)
├── cps.py                  # CLI launcher (launches copilot with active config)
├── cps.bat                 # Windows batch wrapper for CLI launcher
├── run.bat                 # One-click GUI startup
├── requirements.txt        # Python dependencies
├── BYOK_Usage_Guide.md     # BYOK usage guide (Chinese)
├── templates/
│   └── index.html          # Single-page web UI
├── static/
│   ├── style.css           # Stylesheet
│   └── app.js              # Frontend logic
├── README.md               # Bilingual README
└── README_EN.md            # English README (this file)
```

## 🔧 Configuration Storage

All configurations are stored in `~/.copilot/providers.json`:

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

## ❓ FAQ

**Q: How do I use the `cps` command from anywhere?**  
A: Add the `copilot-switch` directory to your system PATH:
```cmd
setx PATH "%PATH%;C:\path\to\copilot-switch"
```

**Q: Why does Copilot CLI show a token warning?**  
A: Copilot Switch always injects `COPILOT_PROVIDER_MAX_OUTPUT_TOKENS` (default 128000) and `COPILOT_PROVIDER_MAX_PROMPT_TOKENS` (default 840000). You can override these in the form.

**Q: Is my API key secure?**  
A: Keys are stored locally in `~/.copilot/providers.json`. The web UI listens only on `127.0.0.1` (localhost). Do not commit `providers.json` to public repositories.

**Q: How do I manage multiple configurations?**  
A: Add multiple providers and click **Activate** to switch between them. All configurations are stored in a single JSON file.

**Q: Can I use this on Linux/macOS?**  
A: The core Python app works cross-platform. The `run.bat` and `cps.bat` scripts are Windows-specific — use `python copilot_switch.py` and `python cps.py` directly on other platforms.

## 📄 License

MIT License

## 🙏 References

- [GitHub Copilot CLI Documentation](https://docs.github.com/copilot/concepts/agents/about-copilot-cli)
- [BYOK Models Documentation](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models)
