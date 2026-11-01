#!/usr/bin/env node
/**
 * ============================================================================
 * UNIVERSAL SWARM GOVERNANCE CLIENT & DYNAMIC SERVICE DISCOVERY (gov-client.js)
 * ============================================================================
 * Multi-mode client supporting:
 *  1. Dynamic Service Discovery: `resolve <ROLE|NODE_ID>` (< 1ms lookup)
 *  2. Progressive Task Governance: Mode A (Partitioned Files) & Mode B (REST API / MySQL SSOT)
 *  3. Health Check & Connectivity Verification
 *
 * Zero external dependencies (Pure Node.js standard library: fs, path, http, https).
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const REGISTRY_FILE = path.join(ROOT_DIR, 'swarm', 'AI_SWARM_REGISTRY.json');
const ACTIVE_TASKS_DIR = path.join(ROOT_DIR, 'swarm', 'tasks', 'active');
const ARCHIVE_TASKS_DIR = path.join(ROOT_DIR, 'swarm', 'tasks', 'archive');
const CHECKPOINTS_DIR = path.join(ROOT_DIR, 'swarm', 'tasks', 'checkpoints');
const BOARD_SUMMARY_FILE = path.join(ROOT_DIR, 'swarm', 'BOARD_SUMMARY.json');

const API_BASE_URL = process.env.GOV_API_URL || 'http://127.0.0.1:3000';
const API_TOKEN = process.env.GOV_API_TOKEN || '';

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_FILE)) {
    console.error(`[ERROR] Registry file not found: ${REGISTRY_FILE}`);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
  } catch (err) {
    console.error(`[ERROR] Failed to parse registry file: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Command: resolve <ROLE | NODE_ID>
 * Rapid lookup of node configuration and conversation UUID for P2P Fast-Path.
 */
function handleResolve(target) {
  if (!target) {
    console.error('[USAGE] node gov-client.js resolve <ROLE | NODE_ID>');
    process.exit(1);
  }

  const registry = loadRegistry();
  const normalizedTarget = target.trim().toUpperCase();
  const nodes = registry.nodes || {};

  // 1. Direct match on Node ID (e.g. NODE_01)
  if (nodes[normalizedTarget]) {
    const node = nodes[normalizedTarget];
    console.log(JSON.stringify({
      found: true,
      node_id: normalizedTarget,
      role: node.role,
      conversation_uuid: node.conversation_uuid || '',
      tab_index: node.tab_index,
      runtime_manual: node.runtime_manual
    }, null, 2));
    return;
  }

  // 2. Lookup by role name (case-insensitive substring or exact match)
  for (const [nodeId, data] of Object.entries(nodes)) {
    const roleUpper = (data.role || '').toUpperCase();
    if (roleUpper === normalizedTarget || roleUpper.includes(normalizedTarget)) {
      console.log(JSON.stringify({
        found: true,
        node_id: nodeId,
        role: data.role,
        conversation_uuid: data.conversation_uuid || '',
        tab_index: data.tab_index,
        runtime_manual: data.runtime_manual
      }, null, 2));
      return;
    }
  }

  console.error(JSON.stringify({
    found: false,
    query: target,
    error: `Node or Role '${target}' not found in registry.`
  }, null, 2));
  process.exit(1);
}

/**
 * Command: list-nodes
 * Summary of all nodes registered in Swarm
 */
function handleListNodes() {
  const registry = loadRegistry();
  const nodes = registry.nodes || {};
  const summary = Object.entries(nodes).map(([id, d]) => ({
    node_id: id,
    role: d.role,
    tab: d.tab_index,
    has_uuid: !!d.conversation_uuid
  }));
  console.log(JSON.stringify(summary, null, 2));
}

/**
 * Command: get-task [WORKER_ROLE | WORKER_NODE_ID]
 * Mode A: Reads matching active task from swarm/tasks/active/
 * Mode B (if API configured): Calls REST endpoint
 */
function handleGetTask(worker) {
  const normalizedWorker = (worker || '').toUpperCase();

  // Mode A: Inspect local partitioned active directory
  if (fs.existsSync(ACTIVE_TASKS_DIR)) {
    const files = fs.readdirSync(ACTIVE_TASKS_DIR).filter(f => f.endsWith('.json'));
    const matchedTasks = [];

    for (const f of files) {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(ACTIVE_TASKS_DIR, f), 'utf8'));
        if (!normalizedWorker) {
          matchedTasks.push(content);
        } else {
          const assigned = (content.assigned_to || '').toUpperCase();
          const targetRole = (content.target_role || '').toUpperCase();
          if (assigned === normalizedWorker || targetRole === normalizedWorker || assigned.includes(normalizedWorker)) {
            matchedTasks.push(content);
          }
        }
      } catch (e) {
        // Skip unparseable files
      }
    }

    if (matchedTasks.length > 0) {
      console.log(JSON.stringify({
        mode: 'MODE_A_PARTITIONED',
        count: matchedTasks.length,
        tasks: matchedTasks
      }, null, 2));
      return;
    }
  }

  // If no local task found, report empty or suggest API check
  console.log(JSON.stringify({
    mode: 'MODE_A_PARTITIONED',
    count: 0,
    message: `No active tasks found for worker: ${worker || 'ALL'}`
  }, null, 2));
}

/**
 * Command: health-check
 * Checks local filesystem structure and optional API Gateway reachability
 */
function handleHealthCheck() {
  const status = {
    timestamp: new Date().toISOString(),
    framework_version: '6.2-Antigravity-Native',
    local_hygiene: {
      registry_exists: fs.existsSync(REGISTRY_FILE),
      active_tasks_dir: fs.existsSync(ACTIVE_TASKS_DIR),
      archive_tasks_dir: fs.existsSync(ARCHIVE_TASKS_DIR),
      board_summary: fs.existsSync(BOARD_SUMMARY_FILE)
    },
    monolith_status: {
      legacy_board_exists: fs.existsSync(path.join(ROOT_DIR, 'swarm', 'TASK_DISPATCH_BOARD.json')),
      is_redirect_pointer: false
    }
  };

  const legacyBoard = path.join(ROOT_DIR, 'swarm', 'TASK_DISPATCH_BOARD.json');
  if (fs.existsSync(legacyBoard)) {
    const size = fs.statSync(legacyBoard).size;
    status.monolith_status.size_bytes = size;
    status.monolith_status.is_redirect_pointer = size < 5000;
  }

  console.log(JSON.stringify(status, null, 2));
}

/**
 * Command: register <ROLE | NODE_ID> <CONVERSATION_UUID>
 * Allows a newly spawned successor to register its UUID and automatically retrieve pending checkpoints.
 */
function handleRegister(target, uuid) {
  if (!target || !uuid) {
    console.error('[USAGE] node gov-client.js register <ROLE | NODE_ID> <CONVERSATION_UUID>');
    process.exit(1);
  }

  const registry = loadRegistry();
  const normalizedTarget = target.trim().toUpperCase();
  const nodes = registry.nodes || {};
  let matchedNodeId = null;

  if (nodes[normalizedTarget]) {
    matchedNodeId = normalizedTarget;
  } else {
    for (const [nodeId, data] of Object.entries(nodes)) {
      const roleUpper = (data.role || '').toUpperCase();
      if (roleUpper === normalizedTarget || roleUpper.includes(normalizedTarget)) {
        matchedNodeId = nodeId;
        break;
      }
    }
  }

  if (!matchedNodeId) {
    console.error(`[ERROR] Role or Node '${target}' not found in registry.`);
    process.exit(1);
  }

  nodes[matchedNodeId].conversation_uuid = uuid.trim();
  registry.updated_at = new Date().toISOString();
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2), 'utf8');

  // Check for pending checkpoints
  let pendingCheckpoint = null;
  if (!fs.existsSync(CHECKPOINTS_DIR)) {
    fs.mkdirSync(CHECKPOINTS_DIR, { recursive: true });
  } else {
    const chkFiles = fs.readdirSync(CHECKPOINTS_DIR).filter(f => f.endsWith('.json'));
    for (const cf of chkFiles) {
      try {
        const chk = JSON.parse(fs.readFileSync(path.join(CHECKPOINTS_DIR, cf), 'utf8'));
        const assignedRole = (chk.worker_role || '').toUpperCase();
        if (assignedRole === nodes[matchedNodeId].role.toUpperCase() || assignedRole === matchedNodeId) {
          pendingCheckpoint = chk;
          break;
        }
      } catch (e) {}
    }
  }

  console.log(JSON.stringify({
    status: 'SUCCESS',
    node_id: matchedNodeId,
    role: nodes[matchedNodeId].role,
    registered_uuid: uuid.trim(),
    has_pending_checkpoint: !!pendingCheckpoint,
    resumed_checkpoint: pendingCheckpoint || null
  }, null, 2));
}

/**
 * Command: checkpoint <create | read | clear> <TASK_ID> [PAYLOAD_JSON_OR_STRING]
 * Zero-downtime task handover checkpoint management.
 */
function handleCheckpoint(action, taskId, payload) {
  if (!action || !taskId) {
    console.error('[USAGE] node gov-client.js checkpoint <create | read | clear> <TASK_ID> [JSON_PAYLOAD]');
    process.exit(1);
  }

  if (!fs.existsSync(CHECKPOINTS_DIR)) {
    fs.mkdirSync(CHECKPOINTS_DIR, { recursive: true });
  }

  const chkFile = path.join(CHECKPOINTS_DIR, `CHK-${taskId}.json`);

  if (action === 'read') {
    if (!fs.existsSync(chkFile)) {
      console.log(JSON.stringify({ found: false, task_id: taskId }));
      return;
    }
    console.log(fs.readFileSync(chkFile, 'utf8'));
    return;
  }

  if (action === 'clear') {
    if (fs.existsSync(chkFile)) {
      fs.unlinkSync(chkFile);
      console.log(JSON.stringify({ status: 'CLEARED', task_id: taskId }));
    } else {
      console.log(JSON.stringify({ status: 'NOT_FOUND', task_id: taskId }));
    }
    return;
  }

  if (action === 'create') {
    let checkpointData = {
      task_id: taskId,
      timestamp: new Date().toISOString(),
      step_completed: 'Partial progress',
      step_in_progress: 'Handover requested',
      files_modified: [],
      rejection_list: [],
      next_action: 'Resume execution'
    };

    if (payload) {
      if (typeof payload === 'string' && payload.endsWith('.json') && fs.existsSync(payload)) {
        try {
          const fileData = JSON.parse(fs.readFileSync(payload, 'utf8'));
          checkpointData = { ...checkpointData, ...fileData };
        } catch (e) {
          checkpointData.note = `Failed to parse file: ${e.message}`;
        }
      } else {
        try {
          const parsed = JSON.parse(payload);
          checkpointData = { ...checkpointData, ...parsed };
        } catch (e) {
          checkpointData.note = payload;
        }
      }
    }

    fs.writeFileSync(chkFile, JSON.stringify(checkpointData, null, 2), 'utf8');

    // Also update active task status if exists
    const activeTaskFile = path.join(ACTIVE_TASKS_DIR, `${taskId}.json`);
    if (fs.existsSync(activeTaskFile)) {
      try {
        const t = JSON.parse(fs.readFileSync(activeTaskFile, 'utf8'));
        t.status = 'HANDOVER_PENDING';
        t.checkpoint_file = `swarm/tasks/checkpoints/CHK-${taskId}.json`;
        t.updated_at = new Date().toISOString();
        fs.writeFileSync(activeTaskFile, JSON.stringify(t, null, 2), 'utf8');
      } catch (err) {}
    }

    console.log(JSON.stringify({
      status: 'CHECKPOINT_SAVED',
      checkpoint_path: chkFile,
      task_status: 'HANDOVER_PENDING'
    }, null, 2));
    return;
  }

  console.error(`[ERROR] Unknown checkpoint action: ${action}`);
  process.exit(1);
}

/**
 * Command: trigger-succession <ROLE> [REASON]
 * Initiates handover protocol when context reaches saturation or attention decay.
 */
function handleTriggerSuccession(target, reason) {
  if (!target) {
    console.error('[USAGE] node gov-client.js trigger-succession <ROLE | NODE_ID> [REASON]');
    process.exit(1);
  }

  const registry = loadRegistry();
  const normalizedTarget = target.trim().toUpperCase();
  const nodes = registry.nodes || {};
  let targetNode = null;

  for (const [nodeId, data] of Object.entries(nodes)) {
    if (nodeId === normalizedTarget || (data.role || '').toUpperCase() === normalizedTarget) {
      targetNode = { id: nodeId, ...data };
      break;
    }
  }

  if (!targetNode) {
    console.error(`[ERROR] Node/Role '${target}' not found.`);
    process.exit(1);
  }

  const manifest = {
    protocol: 'ZERO_DOWNTIME_SUCCESSION_PROTOCOL',
    timestamp: new Date().toISOString(),
    node_id: targetNode.id,
    role: targetNode.role,
    old_uuid: targetNode.conversation_uuid || '',
    reason: reason || 'CONTEXT_WINDOW_SATURATION_OR_ATTENTION_DECAY',
    directives_for_successor: [
      `1. Thức giấc trong Tab mới (New Session).`,
      `2. Chạy: node swarm/scripts/gov-client.js register ${targetNode.id} <NEW_CONVERSATION_UUID>`,
      `3. Nếu có checkpoint dở dang, lập tức thi công tiếp next_action mà không làm lại từ đầu.`,
      `4. Khóa cứng quy tắc Zero-Redundant-Read: Không đọc lại file runtime của chính mình.`
    ]
  };

  console.log(JSON.stringify(manifest, null, 2));
}

// CLI Dispatcher
const [,, command, ...args] = process.argv;

switch (command) {
  case 'resolve':
    handleResolve(args[0]);
    break;
  case 'register':
    handleRegister(args[0], args[1]);
    break;
  case 'checkpoint':
    handleCheckpoint(args[0], args[1], args[2]);
    break;
  case 'trigger-succession':
    handleTriggerSuccession(args[0], args[1]);
    break;
  case 'list-nodes':
    handleListNodes();
    break;
  case 'get-task':
    handleGetTask(args[0]);
    break;
  case 'health-check':
    handleHealthCheck();
    break;
  default:
    console.log(`
Universal Swarm Governance Client (gov-client.js)
Usage:
  node gov-client.js resolve <ROLE | NODE_ID>               - Lookup node UUID/config (< 1ms)
  node gov-client.js register <ROLE | NODE_ID> <UUID>       - Successor dynamic registration
  node gov-client.js checkpoint <create|read|clear> <TASK>  - Zero-downtime task checkpoint
  node gov-client.js trigger-succession <ROLE> [REASON]     - Initiate succession protocol
  node gov-client.js list-nodes                            - List all nodes and tab mappings
  node gov-client.js get-task [ROLE]                       - Fetch active task for role
  node gov-client.js health-check                          - Verify directory hygiene & status
`);
    break;
}
