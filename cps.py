"""
Copilot Switch CLI Launcher — 直接以 GUI 中激活的配置启动 Copilot CLI

用法:
    python cps.py           # 启动 copilot
    python cps.py --print   # 仅打印激活的配置，不启动
"""
import json
import os
import subprocess
import sys
from pathlib import Path

CONFIG_FILE = Path.home() / ".copilot" / "providers.json"


def load_active_provider():
    if not CONFIG_FILE.exists():
        print("[ERROR] 未找到配置文件，请先在 Copilot Switch GUI 中添加并激活配置")
        print(f"        期望路径: {CONFIG_FILE}")
        sys.exit(1)

    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        config = json.load(f)

    active_id = config.get("active", "")
    if not active_id:
        print("[ERROR] 没有激活的配置，请先在 GUI 中激活一个配置")
        sys.exit(1)

    for p in config["providers"]:
        if p["id"] == active_id:
            return p

    print("[ERROR] 激活的配置不存在，请重新在 GUI 中选择")
    sys.exit(1)


def launch(provider):
    env = os.environ.copy()
    env["COPILOT_PROVIDER_BASE_URL"] = provider["base_url"]
    env["COPILOT_MODEL"] = provider["model"]

    if provider.get("type") and provider["type"] != "openai":
        env["COPILOT_PROVIDER_TYPE"] = provider["type"]
    if provider.get("api_key"):
        env["COPILOT_PROVIDER_API_KEY"] = provider["api_key"]
    if provider.get("offline"):
        env["COPILOT_OFFLINE"] = "true"
    env["COPILOT_PROVIDER_MAX_OUTPUT_TOKENS"] = str(provider.get("max_output_tokens") or 128000)
    env["COPILOT_PROVIDER_MAX_PROMPT_TOKENS"] = str(provider.get("max_prompt_tokens") or 840000)

    print(f"Copilot Switch -> {provider['name']} ({provider.get('type', 'openai')})")
    print(f"  Model: {provider['model']}")
    print(f"  Base URL: {provider['base_url']}")
    print()

    subprocess.run(["copilot"], env=env)


if __name__ == "__main__":
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    provider = load_active_provider()

    if "--print" in sys.argv:
        print(f"Active: {provider['name']}")
        print(f"  Type:      {provider.get('type', 'openai')}")
        print(f"  Base URL:  {provider['base_url']}")
        print(f"  Model:     {provider['model']}")
        print(f"  API Key:   {'***' if provider.get('api_key') else '(none)'}")
        print(f"  Offline:      {provider.get('offline', False)}")
        print(f"  Max Output:   {provider.get('max_output_tokens') or '128000 (默认)'}")
        print(f"  Max Prompt:   {provider.get('max_prompt_tokens') or '840000 (默认)'}")
    else:
        launch(provider)
