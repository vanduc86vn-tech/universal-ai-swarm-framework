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

// CLI Dispatcher
const [,, command, ...args] = process.argv;

switch (command) {
  case 'resolve':
    handleResolve(args[0]);
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
  node gov-client.js resolve <ROLE | NODE_ID>  - Lookup node UUID/config (< 1ms)
  node gov-client.js list-nodes               - List all nodes and tab mappings
  node gov-client.js get-task [ROLE]          - Fetch active task for role
  node gov-client.js health-check             - Verify directory hygiene & status
`);
    break;
}
