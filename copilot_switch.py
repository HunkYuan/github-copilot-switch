"""
Copilot Switch — 可视化管理 Copilot CLI BYOK 配置
"""
import json
import uuid
from pathlib import Path
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

CONFIG_DIR = Path.home() / ".copilot"
CONFIG_FILE = CONFIG_DIR / "providers.json"


def load_config():
    """加载配置文件，不存在则返回默认空配置"""
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"active": "", "providers": []}


def save_config(config):
    """保存配置到文件"""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/config", methods=["GET"])
def get_config():
    config = load_config()
    return jsonify(config)


@app.route("/api/providers", methods=["POST"])
def add_provider():
    config = load_config()
    data = request.get_json()
    provider = {
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
    config["providers"].append(provider)
    if not config["active"]:
        config["active"] = provider["id"]
    save_config(config)
    return jsonify(provider), 201


@app.route("/api/providers/<provider_id>", methods=["PUT"])
def update_provider(provider_id):
    config = load_config()
    data = request.get_json()
    for p in config["providers"]:
        if p["id"] == provider_id:
            p["name"] = data["name"].strip()
            p["type"] = data.get("type", "openai").strip()
            p["base_url"] = data["base_url"].strip()
            p["api_key"] = data.get("api_key", "").strip()
            p["model"] = data["model"].strip()
            p["offline"] = bool(data.get("offline", False))
            p["max_output_tokens"] = data.get("max_output_tokens")
            p["max_prompt_tokens"] = data.get("max_prompt_tokens")
            save_config(config)
            return jsonify(p)
    return jsonify({"error": "not found"}), 404


@app.route("/api/providers/<provider_id>", methods=["DELETE"])
def delete_provider(provider_id):
    config = load_config()
    new_providers = [p for p in config["providers"] if p["id"] != provider_id]
    if len(new_providers) == len(config["providers"]):
        return jsonify({"error": "not found"}), 404
    config["providers"] = new_providers
    if config["active"] == provider_id:
        config["active"] = new_providers[0]["id"] if new_providers else ""
    save_config(config)
    return jsonify({"ok": True})


@app.route("/api/providers/<provider_id>/activate", methods=["POST"])
def activate_provider(provider_id):
    config = load_config()
    for p in config["providers"]:
        if p["id"] == provider_id:
            config["active"] = provider_id
            save_config(config)
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
