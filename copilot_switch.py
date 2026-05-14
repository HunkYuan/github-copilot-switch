"""
Copilot Switch — 可视化管理 Copilot CLI BYOK 配置 & Claude 代理配置
"""
import json
import uuid
from pathlib import Path
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

HOME = Path.home()


def get_config_file(tool):
    """根据 tool 类型返回配置文件路径和默认空配置"""
    if tool == "claude":
        return HOME / ".claude" / "providers.json", {"active": "", "providers": []}
    return HOME / ".copilot" / "providers.json", {"active": "", "providers": []}


def load_config(tool="copilot"):
    """加载配置文件，不存在则返回默认空配置"""
    config_file, default = get_config_file(tool)
    if config_file.exists():
        with open(config_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return default


def save_config(config, tool="copilot"):
    """保存配置到文件"""
    config_file, _ = get_config_file(tool)
    config_file.parent.mkdir(parents=True, exist_ok=True)
    with open(config_file, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)


def parse_copilot_provider(data):
    return {
        "id": str(uuid.uuid4())[:8],
        "name": data["name"].strip(),
        "type": data.get("type", "openai").strip(),
        "base_url": data["base_url"].strip(),
        "api_key": data.get("api_key", "").strip(),
        "model": data["model"].strip(),
        "offline": bool(data.get("offline", False)),
        "max_output_tokens": data.get("max_output_tokens"),
        "max_prompt_tokens": data.get("max_prompt_tokens"),
    }


def update_copilot_provider(p, data):
    p["name"] = data["name"].strip()
    p["type"] = data.get("type", "openai").strip()
    p["base_url"] = data["base_url"].strip()
    p["api_key"] = data.get("api_key", "").strip()
    p["model"] = data["model"].strip()
    p["offline"] = bool(data.get("offline", False))
    p["max_output_tokens"] = data.get("max_output_tokens")
    p["max_prompt_tokens"] = data.get("max_prompt_tokens")


def parse_claude_provider(data):
    return {
        "id": str(uuid.uuid4())[:8],
        "name": data["name"].strip(),
        "base_url": data["base_url"].strip(),
        "api_key": data.get("api_key", "").strip(),
        "model": data["model"].strip(),
        "sonnet_model": data.get("sonnet_model", "").strip() or None,
        "opus_model": data.get("opus_model", "").strip() or None,
        "haiku_model": data.get("haiku_model", "").strip() or None,
        "disable_nonessential_traffic": data.get("disable_nonessential_traffic", True),
    }


def update_claude_provider(p, data):
    p["name"] = data["name"].strip()
    p["base_url"] = data["base_url"].strip()
    p["api_key"] = data.get("api_key", "").strip()
    p["model"] = data["model"].strip()
    p["sonnet_model"] = data.get("sonnet_model", "").strip() or None
    p["opus_model"] = data.get("opus_model", "").strip() or None
    p["haiku_model"] = data.get("haiku_model", "").strip() or None
    p["disable_nonessential_traffic"] = data.get("disable_nonessential_traffic", True)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/config", methods=["GET"])
def get_config():
    tool = request.args.get("tool", "copilot")
    config = load_config(tool)
    return jsonify(config)


@app.route("/api/providers", methods=["POST"])
def add_provider():
    tool = request.args.get("tool", "copilot")
    config = load_config(tool)
    data = request.get_json()
    if tool == "claude":
        provider = parse_claude_provider(data)
    else:
        provider = parse_copilot_provider(data)
    config["providers"].append(provider)
    if not config["active"]:
        config["active"] = provider["id"]
    save_config(config, tool)
    return jsonify(provider), 201


@app.route("/api/providers/<provider_id>", methods=["PUT"])
def update_provider(provider_id):
    tool = request.args.get("tool", "copilot")
    config = load_config(tool)
    data = request.get_json()
    for p in config["providers"]:
        if p["id"] == provider_id:
            if tool == "claude":
                update_claude_provider(p, data)
            else:
                update_copilot_provider(p, data)
            save_config(config, tool)
            return jsonify(p)
    return jsonify({"error": "not found"}), 404


@app.route("/api/providers/<provider_id>", methods=["DELETE"])
def delete_provider(provider_id):
    tool = request.args.get("tool", "copilot")
    config = load_config(tool)
    new_providers = [p for p in config["providers"] if p["id"] != provider_id]
    if len(new_providers) == len(config["providers"]):
        return jsonify({"error": "not found"}), 404
    config["providers"] = new_providers
    if config["active"] == provider_id:
        config["active"] = new_providers[0]["id"] if new_providers else ""
    save_config(config, tool)
    return jsonify({"ok": True})


@app.route("/api/providers/<provider_id>/activate", methods=["POST"])
def activate_provider(provider_id):
    tool = request.args.get("tool", "copilot")
    config = load_config(tool)
    for p in config["providers"]:
        if p["id"] == provider_id:
            config["active"] = provider_id
            save_config(config, tool)
            return jsonify(p)
    return jsonify({"error": "not found"}), 404


if __name__ == "__main__":
    import sys
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    print("=" * 50)
    print("  Copilot Switch - BYOK Config Manager")
    print("  Open http://127.0.0.1:5000 in browser")
    print("=" * 50)
    app.run(host="127.0.0.1", port=5000, debug=False)
