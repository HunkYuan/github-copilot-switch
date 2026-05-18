"""
Claude Switch CLI Launcher — 直接以 GUI 中激活的配置启动 Claude CLI

用法:
    python claudes.py                # 启动 claude
    python claudes.py --help         # 传递参数给 claude
    python claudes.py -p "写一个hello world"  # 传递参数给 claude
"""
import json
import os
import subprocess
import sys
from pathlib import Path

CONFIG_FILE = Path.home() / ".claude" / "providers.json"


def load_providers():
    if not CONFIG_FILE.exists():
        print("[ERROR] 未找到配置文件，配置")
        print(f"        期望路径: {CONFIG_FILE}")
        sys.exit(1)

    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        config = json.load(f)

    active_id = config.get("active", "")
    return config.get("providers", []), active_id


def select_provider():
    providers, active_id = load_providers()
    if not providers:
        print("[ERROR] 没有可用的配置，请先在 GUI 中添加配置")
        sys.exit(1)

    # 找到 active provider 的索引
    active_index = None
    for i, p in enumerate(providers):
        if p["id"] == active_id:
            active_index = i
            break

    # 列出所有 provider
    print("可用 Provider 列表：")
    print()
    for i, p in enumerate(providers):
        marker = " * " if i == active_index else "   "
        print(f"{marker}[{i + 1}] {p['name']} ({p.get('type', 'openai')})")
    print()
    print(f"[*] 表示当前激活的配置")
    print()

    # 获取用户选择
    while True:
        default = str(active_index + 1) if active_index is not None else ""
        prompt = f"请选择 Provider [直接回车使用默认*{active_index + 1}]: " if default else "请选择 Provider: "
        choice = input(prompt).strip()

        if choice == "":
            if active_index is not None:
                selected = providers[active_index]
                print(f"已选择: {selected['name']}")
                return selected
            else:
                print("[ERROR] 没有激活的配置，请先选择")
                continue

        try:
            idx = int(choice) - 1
            if 0 <= idx < len(providers):
                selected = providers[idx]
                print(f"已选择: {selected['name']}")
                return selected
            else:
                print(f"[ERROR] 无效选择，请输入 1-{len(providers)} 之间的数字")
        except ValueError:
            print("[ERROR] 请输入数字")


def launch(provider, args=None):
    if args is None:
        args = []

    env = os.environ.copy()
    env["ANTHROPIC_BASE_URL"] = provider["base_url"]
    model = provider["model"]
    env["ANTHROPIC_MODEL"] = model

    if provider.get("api_key"):
        env["ANTHROPIC_AUTH_TOKEN"] = provider["api_key"]

    env["CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC"] = str(provider.get("disable_nonessential_traffic") or 1)
    env["ANTHROPIC_DEFAULT_SONNET_MODEL"] = str(provider.get("sonnet_model") or model)
    env["ANTHROPIC_DEFAULT_OPUS_MODEL"] = str(provider.get("opus_model") or model)
    env["ANTHROPIC_DEFAULT_HAIKU_MODEL"] = str(provider.get("haiku_model") or model)

    print(f"Claude Switch -> {provider['name']}")
    print(f"  Model: {provider['model']}")
    print(f"  Sonnet Model: {provider['model'] or model}")
    print(f"  OPUS Model: {provider['model'] or model}")
    print(f"  HAIKU Model: {provider['model'] or model}")
    print(f"  Base URL: {provider['base_url'] or model}")
    print()

    subprocess.run(["claude"] + args, env=env)


if __name__ == "__main__":
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    provider = select_provider()
    launch(provider, sys.argv[1:])
