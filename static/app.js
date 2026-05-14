// Copilot Switch - Frontend Logic

let currentTool = "copilot";
let configCopilot = { active: "", providers: [] };
let configClaude = { active: "", providers: [] };

function currentConfig() {
  return currentTool === "claude" ? configClaude : configCopilot;
}

function setCurrentConfig(cfg) {
  if (currentTool === "claude") configClaude = cfg;
  else configCopilot = cfg;
}

// ====================== 初始化 ======================
async function init() {
  await Promise.all([loadConfig("copilot"), loadConfig("claude")]);
  bindEvents();
  render();
}

async function loadConfig(tool) {
  const res = await fetch(`/api/config?tool=${tool}`);
  const cfg = await res.json();
  if (tool === "claude") configClaude = cfg;
  else configCopilot = cfg;
}

function bindEvents() {
  document.getElementById("btn-add").addEventListener("click", () => openModal());
  document.getElementById("btn-cancel").addEventListener("click", closeModal);
  document.getElementById("btn-close-modal").addEventListener("click", closeModal);
  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById("provider-form").addEventListener("submit", handleSave);
  document.getElementById("btn-toggle-key").addEventListener("click", toggleApiKeyVisibility);

  // Tab switching
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tool));
  });

  // Copilot form preview fields
  ["f-name", "f-type", "f-base-url", "f-api-key", "f-model", "f-offline", "f-max-output-tokens", "f-max-prompt-tokens"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", updateModalPreview);
      if (el.type === "checkbox") el.addEventListener("change", updateModalPreview);
    }
  });

  // Claude form preview fields
  ["f-sonnet-model", "f-opus-model", "f-haiku-model", "f-disable-nonessential"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", updateModalPreview);
      if (el.type === "checkbox") el.addEventListener("change", updateModalPreview);
    }
  });
}

async function switchTab(tool) {
  currentTool = tool;
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tool === tool));
  document.querySelector(".subtitle").textContent =
    tool === "claude"
      ? "Claude 代理配置管理器 — 管理 Claude CLI 提供商，一键启动"
      : "BYOK 配置管理器 — 管理多个 LLM 提供商，一键启动 Copilot CLI";
  document.getElementById("btn-add").textContent =
    tool === "claude" ? "+ 添加 Claude 配置" : "+ 添加配置";
  await loadConfig(tool);
  render();
}

// ====================== 渲染 ======================
function toggleApiKeyVisibility() {
  const input = document.getElementById("f-api-key");
  const btn = document.getElementById("btn-toggle-key");
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
    btn.title = "隐藏";
  } else {
    input.type = "password";
    btn.textContent = "👁";
    btn.title = "显示";
  }
}

function updateModalPreview() {
  if (currentTool === "claude") updateClaudeModalPreview();
  else updateCopilotModalPreview();
}

function updateCopilotModalPreview() {
  const name = document.getElementById("f-name").value || "(未填写)";
  const type = document.getElementById("f-type").value || "openai";
  const baseUrl = document.getElementById("f-base-url").value || "(未填写)";
  const apiKey = document.getElementById("f-api-key").value;
  const model = document.getElementById("f-model").value || "(未填写)";
  const offline = document.getElementById("f-offline").checked;
  const maxOut = document.getElementById("f-max-output-tokens").value;
  const maxPrompt = document.getElementById("f-max-prompt-tokens").value;

  const lines = [];
  lines.push(`set COPILOT_PROVIDER_BASE_URL=${baseUrl}`);
  if (type !== "openai") lines.push(`set COPILOT_PROVIDER_TYPE=${type}`);
  if (apiKey) lines.push(`set COPILOT_PROVIDER_API_KEY=${apiKey.replace(/./g, "•")}`);
  else lines.push(`# COPILOT_PROVIDER_API_KEY (无需认证)`);
  lines.push(`set COPILOT_MODEL=${model}`);
  lines.push(`set COPILOT_PROVIDER_MAX_OUTPUT_TOKENS=${maxOut || 128000}`);
  lines.push(`set COPILOT_PROVIDER_MAX_PROMPT_TOKENS=${maxPrompt || 840000}`);
  if (offline) lines.push(`set COPILOT_OFFLINE=true`);

  document.getElementById("modal-preview-content").textContent = lines.join("\n");
}

function updateClaudeModalPreview() {
  const name = document.getElementById("f-name").value || "(未填写)";
  const baseUrl = document.getElementById("f-base-url").value || "(未填写)";
  const apiKey = document.getElementById("f-api-key").value;
  const model = document.getElementById("f-model").value || "(未填写)";
  const sonnet = document.getElementById("f-sonnet-model").value || model;
  const opus = document.getElementById("f-opus-model").value || model;
  const haiku = document.getElementById("f-haiku-model").value || model;
  const disableNonessential = document.getElementById("f-disable-nonessential").checked;

  const lines = [];
  lines.push(`set ANTHROPIC_BASE_URL=${baseUrl}`);
  if (apiKey) lines.push(`set ANTHROPIC_AUTH_TOKEN=${apiKey.replace(/./g, "•")}`);
  else lines.push(`# ANTHROPIC_AUTH_TOKEN (无需认证)`);
  lines.push(`set ANTHROPIC_MODEL=${model}`);
  lines.push(`set ANTHROPIC_DEFAULT_SONNET_MODEL=${sonnet}`);
  lines.push(`set ANTHROPIC_DEFAULT_OPUS_MODEL=${opus}`);
  lines.push(`set ANTHROPIC_DEFAULT_HAIKU_MODEL=${haiku}`);
  lines.push(`set CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=${disableNonessential ? 1 : 0}`);

  document.getElementById("modal-preview-content").textContent = lines.join("\n");
}

function render() {
  const cfg = currentConfig();
  const list = document.getElementById("provider-list");

  if (cfg.providers.length === 0) {
    const hintCmd = currentTool === "claude" ? "claudes" : "cps";
    const hintLabel = currentTool === "claude" ? "Claude CLI" : "Copilot CLI";
    list.innerHTML = `
      <div class="empty-state">
        <p>暂无配置，点击「+ 添加配置」开始</p>
        <p class="hint">激活配置后，在终端运行 <code>${hintCmd}</code> 启动 ${hintLabel}</p>
      </div>`;
    document.getElementById("preview-section").style.display = "none";
    return;
  }

  if (currentTool === "claude") renderClaudeCards(cfg, list);
  else renderCopilotCards(cfg, list);

  // 绑定卡片按钮事件
  list.querySelectorAll("button[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if (action === "activate") activateProvider(id);
      if (action === "edit") openModal(id);
      if (action === "delete") deleteProvider(id);
    });
  });

  renderPreview();
}

function renderCopilotCards(cfg, list) {
  const typeLabels = { openai: "OpenAI兼容", azure: "Azure", anthropic: "Anthropic" };
  list.innerHTML = cfg.providers.map(p => {
    const isActive = p.id === cfg.active;
    const hasKey = p.api_key ? "🔑" : "🔓";
    return `
      <div class="provider-card${isActive ? " active" : ""}">
        <div class="indicator"></div>
        <div class="info">
          <div class="name">${esc(p.name)}</div>
          <div class="meta">
            <span class="${isActive ? "badge-active" : ""}">${typeLabels[p.type] || p.type}</span>
            <span>${esc(p.model)}</span>
            <span>${hasKey}</span>
            ${p.offline ? '<span>离线</span>' : ""}
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" data-action="activate" data-id="${p.id}" ${isActive ? "disabled" : ""}>
            ${isActive ? "✓ 已激活" : "激活"}
          </button>
          <button class="btn btn-secondary" data-action="edit" data-id="${p.id}">编辑</button>
          <button class="btn btn-danger" data-action="delete" data-id="${p.id}">删除</button>
        </div>
      </div>`;
  }).join("");
}

function renderClaudeCards(cfg, list) {
  list.innerHTML = cfg.providers.map(p => {
    const isActive = p.id === cfg.active;
    const hasKey = p.api_key ? "🔑" : "🔓";
    return `
      <div class="provider-card${isActive ? " active" : ""}">
        <div class="indicator"></div>
        <div class="info">
          <div class="name">${esc(p.name)}</div>
          <div class="meta">
            <span class="${isActive ? "badge-active" : ""}">Claude</span>
            <span>${esc(p.model)}</span>
            <span>${hasKey}</span>
            ${p.disable_nonessential_traffic ? '<span>非必要流量已禁</span>' : ''}
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" data-action="activate" data-id="${p.id}" ${isActive ? "disabled" : ""}>
            ${isActive ? "✓ 已激活" : "激活"}
          </button>
          <button class="btn btn-secondary" data-action="edit" data-id="${p.id}">编辑</button>
          <button class="btn btn-danger" data-action="delete" data-id="${p.id}">删除</button>
        </div>
      </div>`;
  }).join("");
}

function esc(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

// ====================== 配置预览 ======================
function renderPreview() {
  const section = document.getElementById("preview-section");
  const content = document.getElementById("preview-content");
  const cfg = currentConfig();
  const activeProvider = cfg.providers.find(p => p.id === cfg.active);

  if (!activeProvider) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";

  if (currentTool === "claude") renderClaudePreview(content, activeProvider);
  else renderCopilotPreview(content, activeProvider);
}

function renderCopilotPreview(content, activeProvider) {
  const typeLabel = { openai: "OpenAI 兼容", azure: "Azure OpenAI", anthropic: "Anthropic" };
  const envVars = [
    { key: "COPILOT_PROVIDER_BASE_URL", value: activeProvider.base_url },
    { key: "COPILOT_PROVIDER_TYPE", value: activeProvider.type, skip: activeProvider.type === "openai" },
    { key: "COPILOT_PROVIDER_API_KEY", value: activeProvider.api_key || "(无需认证)", mask: !!activeProvider.api_key },
    { key: "COPILOT_MODEL", value: activeProvider.model },
    { key: "COPILOT_PROVIDER_MAX_OUTPUT_TOKENS", value: activeProvider.max_output_tokens || "128000" },
    { key: "COPILOT_PROVIDER_MAX_PROMPT_TOKENS", value: activeProvider.max_prompt_tokens || "840000" },
    { key: "COPILOT_OFFLINE", value: activeProvider.offline ? "true" : "(未启用)", skip: !activeProvider.offline },
  ];

  content.innerHTML = `
    <div class="preview-header">
      <span class="preview-provider-name">${esc(activeProvider.name)}</span>
      <span class="preview-provider-type">${typeLabel[activeProvider.type] || activeProvider.type}</span>
    </div>
    <table class="preview-table">
      ${envVars.filter(v => !v.skip).map((v, i) => `
        <tr>
          <td class="preview-key">${esc(v.key)}</td>
          <td class="preview-value">
            <span class="preview-val-text ${v.mask ? 'masked' : ''}" data-index="${i}">${v.mask ? '••••••••' : esc(v.value)}</span>
            ${v.mask ? `<button class="btn-eye-small" data-index="${i}" title="显示/隐藏">👁</button>` : ''}
          </td>
        </tr>
      `).join("")}
    </table>
  `;

  bindPreviewEyeButtons(content, activeProvider);
}

function renderClaudePreview(content, activeProvider) {
  const model = activeProvider.model;
  const envVars = [
    { key: "ANTHROPIC_BASE_URL", value: activeProvider.base_url },
    { key: "ANTHROPIC_AUTH_TOKEN", value: activeProvider.api_key || "(无需认证)", mask: !!activeProvider.api_key },
    { key: "ANTHROPIC_MODEL", value: model },
    { key: "ANTHROPIC_DEFAULT_SONNET_MODEL", value: activeProvider.sonnet_model || model },
    { key: "ANTHROPIC_DEFAULT_OPUS_MODEL", value: activeProvider.opus_model || model },
    { key: "ANTHROPIC_DEFAULT_HAIKU_MODEL", value: activeProvider.haiku_model || model },
    { key: "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC", value: activeProvider.disable_nonessential_traffic ? "1" : "0" },
  ];

  content.innerHTML = `
    <div class="preview-header">
      <span class="preview-provider-name">${esc(activeProvider.name)}</span>
      <span class="preview-provider-type">Claude</span>
    </div>
    <table class="preview-table">
      ${envVars.filter(v => !v.skip).map((v, i) => `
        <tr>
          <td class="preview-key">${esc(v.key)}</td>
          <td class="preview-value">
            <span class="preview-val-text ${v.mask ? 'masked' : ''}" data-index="${i}">${v.mask ? '••••••••' : esc(v.value)}</span>
            ${v.mask ? `<button class="btn-eye-small" data-index="${i}" title="显示/隐藏">👁</button>` : ''}
          </td>
        </tr>
      `).join("")}
    </table>
  `;

  bindPreviewEyeButtons(content, activeProvider);
}

function bindPreviewEyeButtons(content, activeProvider) {
  content.querySelectorAll(".btn-eye-small").forEach(btn => {
    btn.addEventListener("click", function () {
      const idx = parseInt(this.dataset.index);
      const span = content.querySelector(`.preview-val-text[data-index="${idx}"]`);
      if (span.classList.contains("masked")) {
        span.textContent = activeProvider.api_key;
        span.classList.remove("masked");
        this.textContent = "🙈";
      } else {
        span.textContent = "••••••••";
        span.classList.add("masked");
        this.textContent = "👁";
      }
    });
  });
}

// ====================== CRUD 操作 ======================
function openModal(editId) {
  const form = document.getElementById("provider-form");
  form.reset();
  document.getElementById("edit-id").value = "";

  // Show/hide tool-specific fields
  document.getElementById("copilot-fields").style.display = currentTool === "claude" ? "none" : "";
  document.getElementById("copilot-fields-2").style.display = currentTool === "claude" ? "none" : "";
  document.getElementById("claude-fields").style.display = currentTool === "claude" ? "" : "none";

  // Update placeholder for claude
  const baseUrlInput = document.getElementById("f-base-url");
  const modelInput = document.getElementById("f-model");
  if (currentTool === "claude") {
    baseUrlInput.placeholder = "例如：https://api.anthropic.com";
    modelInput.placeholder = "例如：claude-sonnet-4-5";
  } else {
    baseUrlInput.placeholder = "例如：https://api.openai.com/v1";
    modelInput.placeholder = "例如：gpt-4o / claude-sonnet-4-5";
  }

  if (editId) {
    const cfg = currentConfig();
    const p = cfg.providers.find(x => x.id === editId);
    if (p) {
      document.getElementById("edit-id").value = p.id;
      document.getElementById("f-name").value = p.name;
      document.getElementById("f-base-url").value = p.base_url;
      document.getElementById("f-api-key").value = p.api_key;
      document.getElementById("f-model").value = p.model;

      if (currentTool === "copilot") {
        document.getElementById("f-type").value = p.type || "openai";
        document.getElementById("f-offline").checked = p.offline;
        document.getElementById("f-max-output-tokens").value = p.max_output_tokens || "";
        document.getElementById("f-max-prompt-tokens").value = p.max_prompt_tokens || "";
      } else {
        document.getElementById("f-sonnet-model").value = p.sonnet_model || "";
        document.getElementById("f-opus-model").value = p.opus_model || "";
        document.getElementById("f-haiku-model").value = p.haiku_model || "";
        document.getElementById("f-disable-nonessential").checked = p.disable_nonessential_traffic !== false;
      }
      document.getElementById("modal-title").textContent = "编辑配置";
    }
  } else {
    document.getElementById("modal-title").textContent =
      currentTool === "claude" ? "添加 Claude 配置" : "添加配置";
    if (currentTool === "copilot") {
      document.getElementById("f-type").value = "openai";
    }
    if (currentTool === "claude") {
      document.getElementById("f-disable-nonessential").checked = true;
    }
  }

  document.getElementById("modal-overlay").classList.remove("hidden");
  updateModalPreview();
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
}

async function handleSave(e) {
  e.preventDefault();
  const editId = document.getElementById("edit-id").value;
  let payload = {
    name: document.getElementById("f-name").value,
    base_url: document.getElementById("f-base-url").value.trim(),
    api_key: document.getElementById("f-api-key").value,
    model: document.getElementById("f-model").value,
  };

  if (currentTool === "copilot") {
    payload.type = document.getElementById("f-type").value.trim();
    payload.offline = document.getElementById("f-offline").checked;
    payload.max_output_tokens = parseInt(document.getElementById("f-max-output-tokens").value) || null;
    payload.max_prompt_tokens = parseInt(document.getElementById("f-max-prompt-tokens").value) || null;
  } else {
    payload.sonnet_model = document.getElementById("f-sonnet-model").value.trim();
    payload.opus_model = document.getElementById("f-opus-model").value.trim();
    payload.haiku_model = document.getElementById("f-haiku-model").value.trim();
    payload.disable_nonessential_traffic = document.getElementById("f-disable-nonessential").checked;
  }

  const url = editId
    ? `/api/providers/${editId}?tool=${currentTool}`
    : `/api/providers?tool=${currentTool}`;
  const method = editId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    closeModal();
    await loadConfig(currentTool);
    render();
    showStatus("配置已保存", "success");
  } else {
    const err = await res.json();
    showStatus(err.error || "保存失败", "error");
  }
}

async function activateProvider(id) {
  const res = await fetch(`/api/providers/${id}/activate?tool=${currentTool}`, { method: "POST" });
  if (res.ok) {
    await loadConfig(currentTool);
    render();
    showStatus("已切换激活配置", "success");
  }
}

async function deleteProvider(id) {
  const cfg = currentConfig();
  const p = cfg.providers.find(x => x.id === id);
  if (!confirm(`确定删除「${p.name}」？`)) return;
  const res = await fetch(`/api/providers/${id}?tool=${currentTool}`, { method: "DELETE" });
  if (res.ok) {
    await loadConfig(currentTool);
    render();
    showStatus("配置已删除", "success");
  }
}

// ====================== 工具函数 ======================
function showStatus(msg, cls) {
  const bar = document.getElementById("status-bar");
  bar.textContent = msg;
  bar.className = cls || "";
  if (cls === "success" || cls === "error") {
    setTimeout(() => { bar.textContent = ""; bar.className = ""; }, 4000);
  }
}

// ====================== 启动 ======================
init();
