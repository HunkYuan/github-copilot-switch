// Copilot Switch - Frontend Logic

let config = { active: "", providers: [] };

// ====================== 初始化 ======================
async function init() {
  await loadConfig();
  bindEvents();
}

async function loadConfig() {
  const res = await fetch("/api/config");
  config = await res.json();
  render();
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

  // 表单实时预览
  ["f-name", "f-type", "f-base-url", "f-api-key", "f-model", "f-offline", "f-max-output-tokens", "f-max-prompt-tokens"].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener("input", updateModalPreview);
    if (el.type === "checkbox") el.addEventListener("change", updateModalPreview);
  });
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

function render() {
  const list = document.getElementById("provider-list");

  if (config.providers.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <p>暂无配置，点击「+ 添加配置」开始</p>
        <p class="hint">激活配置后，在终端运行 <code>cps</code> 启动 Copilot CLI</p>
      </div>`;
    return;
  }

  const typeLabels = { openai: "OpenAI兼容", azure: "Azure", anthropic: "Anthropic" };

  list.innerHTML = config.providers.map(p => {
    const isActive = p.id === config.active;
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

  // 渲染配置预览
  renderPreview();
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

  const activeProvider = config.providers.find(p => p.id === config.active);
  if (!activeProvider) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
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

  // 绑定预览区眼睛切换
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

  if (editId) {
    const p = config.providers.find(x => x.id === editId);
    if (p) {
      document.getElementById("edit-id").value = p.id;
      document.getElementById("f-name").value = p.name;
      document.getElementById("f-type").value = p.type || "openai";
      document.getElementById("f-base-url").value = p.base_url;
      document.getElementById("f-api-key").value = p.api_key;
      document.getElementById("f-model").value = p.model;
      document.getElementById("f-offline").checked = p.offline;
      document.getElementById("f-max-output-tokens").value = p.max_output_tokens || "";
      document.getElementById("f-max-prompt-tokens").value = p.max_prompt_tokens || "";
      document.getElementById("modal-title").textContent = "编辑配置";
    }
  } else {
    document.getElementById("modal-title").textContent = "添加配置";
    document.getElementById("f-type").value = "openai";
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
  const payload = {
    name: document.getElementById("f-name").value,
    type: document.getElementById("f-type").value.trim(),
    base_url: document.getElementById("f-base-url").value.trim(),
    api_key: document.getElementById("f-api-key").value,
    model: document.getElementById("f-model").value,
    offline: document.getElementById("f-offline").checked,
    max_output_tokens: parseInt(document.getElementById("f-max-output-tokens").value) || null,
    max_prompt_tokens: parseInt(document.getElementById("f-max-prompt-tokens").value) || null,
  };

  const url = editId ? `/api/providers/${editId}` : "/api/providers";
  const method = editId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    closeModal();
    await loadConfig();
    showStatus("配置已保存", "success");
  } else {
    const err = await res.json();
    showStatus(err.error || "保存失败", "error");
  }
}

async function activateProvider(id) {
  const res = await fetch(`/api/providers/${id}/activate`, { method: "POST" });
  if (res.ok) {
    await loadConfig();
    showStatus("已切换激活配置", "success");
  }
}

async function deleteProvider(id) {
  const p = config.providers.find(x => x.id === id);
  if (!confirm(`确定删除「${p.name}」？`)) return;
  const res = await fetch(`/api/providers/${id}`, { method: "DELETE" });
  if (res.ok) {
    await loadConfig();
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
