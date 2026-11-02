/**
 * 🛡️ ANTI-FRAUD CADENCE MONITOR (ZERO-TRUST PROBE & NONCE GENERATOR)
 * 
 * Vị trí: Chạy độc lập trong Tool Call (run_command), hoàn toàn không làm lag IDE UI.
 * Mục đích: 
 *   1. Khảo sát nhị phân CSDL SSOT (Mode A: GitOps files, Mode B: MySQL/API).
 *   2. Tính toán chính xác 4 chỉ số SLA: IN_PROGRESS, OPEN, READY_FOR_AUDIT, Ổ nghẽn Worker.
 *   3. Sinh mã xác thực dùng 1 lần AUDIT_NONCE (Proof-of-Audit Token) với TTL 300s.
 *   4. Xuất Biên lai Tuần tra Nhị phân CADENCE_INSPECTION_RECEIPT.json để Hook đối soát.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

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

function runProbe() {
  const workspaceRoot = path.resolve(__dirname, '../..');
  const checkpointsDir = path.join(workspaceRoot, 'swarm', 'tasks', 'checkpoints');
  if (!fs.existsSync(checkpointsDir)) {
    fs.mkdirSync(checkpointsDir, { recursive: true });
  }

  let tasks = [];

  // Try Mode B first: gov-client.cjs or gov-client.js patrol
  const govClientJs = path.join(__dirname, 'gov-client.js');
  const govClientCjs = path.join(__dirname, 'gov-client.cjs');
  let probedViaGovClient = false;

  const targetGov = fs.existsSync(govClientCjs) ? govClientCjs : (fs.existsSync(govClientJs) ? govClientJs : null);

  if (targetGov) {
    try {
      const out = execSync(`node "${targetGov}" patrol`, { encoding: 'utf8', timeout: 8000 });
      if (out && out.trim()) {
        const parsed = JSON.parse(out.trim());
        if (Array.isArray(parsed.tasks)) {
          tasks = parsed.tasks;
          probedViaGovClient = true;
        }
      }
    } catch (e) {
      // Fallback to Mode A if Mode B offline
    }
  }

  // Fallback Mode A: Read local active tasks
  if (!probedViaGovClient) {
    const activeTasksDir = path.join(workspaceRoot, 'swarm', 'tasks', 'active');
    if (fs.existsSync(activeTasksDir)) {
      try {
        const files = fs.readdirSync(activeTasksDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
          const t = readJsonSafe(path.join(activeTasksDir, file));
          if (t) {
            tasks.push({
              TaskID: t.task_id || t.id || file,
              Title: t.title || t.name || '',
              Status: t.status || 'OPEN',
              AssignedWorker: t.assigned_to || t.worker_role || 'UNASSIGNED'
            });
          }
        }
      } catch (e) {
        // Ignore read errors
      }
    }
  }

  // Compute SLA Metrics
  const inProgress = tasks.filter(t => (t.Status || t.status) === 'IN_PROGRESS');
  const openTasks = tasks.filter(t => ['OPEN', 'ASSIGNED'].includes(t.Status || t.status));
  const readyAudit = tasks.filter(t => (t.Status || t.status) === 'READY_FOR_AUDIT');

  const workerStats = {};
  inProgress.forEach(t => {
    const w = t.AssignedWorker || t.assigned_to || 'UNASSIGNED';
    workerStats[w] = (workerStats[w] || 0) + 1;
  });

  const isAlarm = (inProgress.length > 5 || openTasks.length > 0 || readyAudit.length > 5);
  const nowMs = Date.now();
  const timestampStr = new Date(nowMs).toISOString();

  // Cryptographic Single-Use Nonce
  const rawHash = crypto.createHash('sha256')
    .update(nowMs + JSON.stringify(workerStats) + inProgress.length + Math.random())
    .digest('hex');
  const auditNonce = 'POA-' + rawHash.slice(0, 8).toUpperCase();
  const receiptId = 'RCPT-' + timestampStr.slice(0, 10).replace(/-/g, '') + '-' + rawHash.slice(8, 12).toUpperCase();

  const receipt = {
    receipt_id: receiptId,
    audit_nonce: auditNonce,
    timestamp: timestampStr,
    created_at_ms: nowMs,
    ttl_seconds: 300, // 5 minutes
    consumed: false,
    consumed_at: null,
    alarmLevel: isAlarm ? "RED_ALERT" : "GREEN_NORMAL",
    totalTasks: tasks.length,
    inProgressCount: inProgress.length,
    openCount: openTasks.length,
    readyAuditCount: readyAudit.length,
    workerBottlenecks: workerStats,
    requiresPMAction: isAlarm
  };

  // Write Ephemeral Inspection Receipt to disk
  const receiptPath = path.join(checkpointsDir, 'CADENCE_INSPECTION_RECEIPT.json');
  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');

  // Output to stdout for Agent reading
  console.log(JSON.stringify(receipt, null, 2));
}

runProbe();
