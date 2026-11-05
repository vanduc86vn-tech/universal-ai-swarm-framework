/**
 * ============================================================================
 * UNIVERSAL AI SWARM FRAMEWORK - FEDERATED CROSS-PROJECT BRIDGE
 * File: swarm/scripts/federated-bridge.js & .cjs
 * ============================================================================
 * CHỦ QUYỀN NGỮ CẢNH TUYỆT ĐỐI (CONTEXTUAL SOVEREIGNTY):
 *  - CẤM TUYỆT ĐỐI ghi đĩa chéo giữa các workspace local (Zero Cross-Disk Poisoning).
 *  - Giao tiếp duy nhất qua:
 *      + Git Remote (GitHub/GitLab) cho Artifacts / Mã nguồn.
 *      + REST API Gateway Zero-Trust hoặc Git Mailbox RFC cho Trạng thái / Tác vụ.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

function readJsonSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

function resolveWorkspace() {
  let curr = process.cwd();
  while (curr && curr !== path.dirname(curr)) {
    if (fs.existsSync(path.join(curr, 'swarm')) || fs.existsSync(path.join(curr, '.agents'))) {
      return curr;
    }
    curr = path.dirname(curr);
  }
  return process.cwd();
}

const workspaceRoot = resolveWorkspace();
const activeTasksDir = path.join(workspaceRoot, 'swarm', 'tasks', 'active');
const archiveTasksDir = path.join(workspaceRoot, 'swarm', 'tasks', 'archive');
const configFile = path.join(workspaceRoot, 'swarm', 'federated-config.json');

function getFederatedConfig() {
  const defaultConf = {
    partner_mode: "MODE_B", // MODE_A | MODE_B
    gateway_url: "https://api.hddvn.com/api/v1/governance",
    api_token: process.env.SWARM_API_TOKEN || "FEDERATED_PARTNER_TOKEN",
    sla_timeout_minutes: 30,
    poll_filter: {
      target_worker: "AI-VPS-INFRA-PARTNER",
      statuses: ["OPEN", "READY_FOR_DEPLOY", "ASSIGNED"]
    }
  };

  const loaded = readJsonSafe(configFile);
  return { ...defaultConf, ...loaded };
}

let cachedJwtToken = process.env.AUDIT_JWT_TOKEN || '';

async function ensureJwtToken(config) {
  if (cachedJwtToken) return cachedJwtToken;
  try {
    const loginPayload = JSON.stringify({ username: 'aroot', pinCode: '8888' });
    const baseOrigin = new URL(config.gateway_url).origin;
    const loginUrl = new URL('/api/v1/governance/auth/login', baseOrigin);
    const client = loginUrl.protocol === 'https:' ? https : http;

    await new Promise((resolve) => {
      const req = client.request(loginUrl, {
        method: 'POST',
        agent: loginUrl.protocol === 'https:' ? new https.Agent({ rejectUnauthorized: false }) : undefined,
        rejectUnauthorized: false,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginPayload)
        },
        timeout: 6000
      }, (res) => {
        let b = '';
        res.on('data', c => b += c);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(b);
            if (parsed.data?.token) {
              cachedJwtToken = parsed.data.token;
            }
          } catch (_) {}
          resolve();
        });
      });
      req.on('error', () => resolve());
      req.write(loginPayload);
      req.end();
    });
  } catch (_) {}
  return cachedJwtToken;
}

async function fetchApi(endpoint, options = {}) {
  const config = getFederatedConfig();
  const token = (await ensureJwtToken(config)) || config.api_token;
  const fullUrl = new URL(endpoint, config.gateway_url);

  return new Promise((resolve, reject) => {
    const isHttps = fullUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      agent: isHttps ? new https.Agent({ rejectUnauthorized: false }) : undefined,
      rejectUnauthorized: false,
      timeout: 10000
    };

    const req = client.request(fullUrl, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`API request timed out after 10000ms: ${fullUrl}`));
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

/**
 * Command: pull
 * Kéo các task hợp đồng từ Partner Gateway về và sinh file Partitioned Task nội bộ
 */
async function handlePull() {
  const config = getFederatedConfig();
  console.log(`\n🌐 [FEDERATED BRIDGE PULL] Đang thăm dò tác vụ từ Partner Gateway: ${config.gateway_url}...`);

  if (!fs.existsSync(activeTasksDir)) {
    fs.mkdirSync(activeTasksDir, { recursive: true });
  }

  try {
    let res = await fetchApi('/patrol');
    let tasks = res.data?.tasks || res.data || [];

    if (!Array.isArray(tasks) || tasks.length === 0) {
      // Fallback tự động: Quét trực tiếp danh sách tasks toàn cục
      try {
        const resTasks = await fetchApi('/tasks');
        const allTasks = resTasks.data?.tasks || resTasks.data || [];
        if (Array.isArray(allTasks) && allTasks.length > 0) {
          tasks = allTasks;
        }
      } catch (e) {}
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      console.log(`✅ [ZERO NOISE]: Không có task hợp đồng mới nào đang chờ xử lý.`);
      return;
    }

    const filtered = tasks.filter(t => {
      const matchWorker = !config.poll_filter.target_worker || 
        String(t.AssignedWorker || t.assigned_to || '').toUpperCase() === config.poll_filter.target_worker.toUpperCase();
      const matchStatus = config.poll_filter.statuses.includes(String(t.Status || t.status || '').toUpperCase());
      return matchWorker && matchStatus;
    });

    console.log(`📋 Phát hiện ${filtered.length} task hợp đồng khớp điều kiện tác chiến:`);

    for (const t of filtered) {
      const taskId = t.TaskID || t.task_id || t.id;
      const targetPath = path.join(activeTasksDir, `${taskId}.json`);

      if (!fs.existsSync(targetPath)) {
        const localTask = {
          task_id: taskId,
          federated_contract: true,
          partner_source: config.gateway_url,
          title: t.Title || t.title || 'Federated Contract Task',
          status: 'OPEN',
          assigned_to: t.AssignedWorker || t.assigned_to || config.poll_filter.target_worker,
          priority: t.Priority || t.priority || 'P0_CRITICAL',
          created_at: new Date().toISOString(),
          sla_deadline: new Date(Date.now() + config.sla_timeout_minutes * 60000).toISOString(),
          federated_metadata: t
        };

        fs.writeFileSync(targetPath, JSON.stringify(localTask, null, 2), 'utf8');
        console.log(`  ➕ [LOCAL PARTITION CREATED]: Đã tiếp nhận task [${taskId}] -> swarm/tasks/active/${taskId}.json`);
      } else {
        console.log(`  ℹ️ [ALREADY SYNCED]: Task [${taskId}] đã có trong active queue.`);
      }
    }
  } catch (err) {
    console.error(`❌ [FEDERATED PULL ERROR]: Không thể kết nối tới Gateway: ${err.message}`);
  }
}

/**
 * Command: push <TASK_ID>
 * Nộp kết quả và bằng chứng nhị phân từ file Partitioned Task nội bộ ngược về Partner Gateway
 */
async function handlePush(taskId) {
  if (!taskId) {
    console.error(`❌ Lỗi: Cần cung cấp Task ID. Ví dụ: node federated-bridge.js push TASK-001`);
    process.exit(1);
  }

  const cleanId = taskId.replace('.json', '');
  const targetFile = path.join(activeTasksDir, `${cleanId}.json`);

  if (!fs.existsSync(targetFile)) {
    console.error(`❌ Không tìm thấy task [${cleanId}] trong thư mục active!`);
    process.exit(1);
  }

  const taskData = readJsonSafe(targetFile);
  console.log(`\n🚀 [FEDERATED BRIDGE PUSH] Đang nộp kết quả task [${cleanId}] về Partner Gateway...`);

  const payload = {
    task_id: cleanId,
    status: taskData.status || 'READY_FOR_AUDIT',
    deliverables: taskData.deliverables || taskData.result_artifact || [],
    proof_url: taskData.proof_url || taskData.result_artifact || null,
    proof_hash: taskData.proof_hash || null,
    completed_at: new Date().toISOString(),
    result_summary: taskData.result_summary || 'Tác vụ đã được thi công và bàn giao qua Federated Bridge'
  };

  try {
    const res = await fetchApi(`/tasks/${cleanId}/deliver`, {
      method: 'POST',
      body: payload
    });

    console.log(`✅ [PUSH DELIVERED]: Gateway phản hồi mã [${res.status}]. Đã bàn giao kết quả thành công!`);
  } catch (err) {
    console.warn(`⚠️ [OFFLINE FALLBACK]: Không thể kết nối Gateway (${err.message}). Kết quả vẫn được lưu giữ an toàn tại local.`);
  }
}

/**
 * Command: check-sla
 * Kiểm tra các task liên dự án bị timeout (> 30 phút) để ngắt mạch chống treo task
 */
function handleCheckSla() {
  const config = getFederatedConfig();
  console.log(`\n⏱️ [FEDERATED SLA WATCHDOG] Kiểm tra hạn mức cam kết tiến độ (SLA: ${config.sla_timeout_minutes} phút)...`);

  if (!fs.existsSync(activeTasksDir)) return;
  const files = fs.readdirSync(activeTasksDir).filter(f => f.endsWith('.json'));
  const now = Date.now();
  let hungCount = 0;

  for (const f of files) {
    const t = readJsonSafe(path.join(activeTasksDir, f));
    if (!t) continue;

    const createdTime = t.created_at ? Date.parse(t.created_at) : now;
    const elapsedMinutes = Math.round((now - createdTime) / 60000);

    if (elapsedMinutes > config.sla_timeout_minutes && ['OPEN', 'IN_PROGRESS'].includes(t.status)) {
      hungCount++;
      console.log(`⚠️ [HUNG TASK WARNING]: Task [${t.task_id}] đã kẹt ${elapsedMinutes} phút (vượt SLA ${config.sla_timeout_minutes}m)!`);
      console.log(`   Tiêu đề: ${t.title}`);
      console.log(`   Khuyến nghị: Kích hoạt Circuit Breaker và báo cáo Trọng tài Sếp Alex để phân xử.`);
    }
  }

  if (hungCount === 0) {
    console.log(`✅ [SLA NORMAL]: Mọi task hợp đồng liên dự án đều đang vận hành trong ngưỡng an toàn.`);
  }
}

// CLI Dispatcher
const [,, command, ...args] = process.argv;

switch ((command || 'help').toLowerCase()) {
  case 'pull':
    handlePull();
    break;
  case 'push':
    handlePush(args[0]);
    break;
  case 'check-sla':
    handleCheckSla();
    break;
  default:
    console.log(`
UNIVERSAL AI SWARM FRAMEWORK - FEDERATED CROSS-PROJECT BRIDGE
Sử dụng:
  node swarm/scripts/federated-bridge.js pull             - Kéo các task hợp đồng từ Partner Gateway về active/
  node swarm/scripts/federated-bridge.js push <TASK_ID>   - Nộp kết quả và deliverables ngược về Partner Gateway
  node swarm/scripts/federated-bridge.js check-sla        - Quét kiểm tra task bị kẹt quá SLA để ngắt mạch
`);
    break;
}

module.exports = {
  getFederatedConfig,
  fetchApi
};
