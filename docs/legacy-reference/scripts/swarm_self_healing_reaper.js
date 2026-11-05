/**
 * ============================================================================
 * UNIVERSAL AI SWARM FRAMEWORK (UASOF V4.1)
 * SWARM SELF-HEALING REAPER & P2P MESH WATCHDOG ENGINE
 * File: swarm/scripts/swarm_self_healing_reaper.js
 * ============================================================================
 * Architecture Reference: ADR-005 & SWARM_SINGLETON_MUTEX_AND_SELF_HEALING_SPEC.md
 * Author: AI-BACKEND (TASK-BE-ANTI-HANG-IMPL & TASK-SWARM-MESH-P2P-REAPER)
 * Auditor: AI-AUDIT-QA
 *
 * Capabilities:
 *  1. Sweeps and cleans stale .git/index.lock files (> 30 seconds age).
 *  2. Sweeps swarm/locks/*.pid files:
 *     - Detects dead processes and removes orphan lock files.
 *     - Detects frozen zombie processes (heartbeat > 3x interval) and safely terminates them.
 *  3. [P2P MESH REAPER] Cross-Agent & Cross-Project OS Process Deduplication:
 *     - Scans all running `node` processes across the operating system.
 *     - Groups `swarm-watch.js` instances by canonical identity (`--role` / `--id` / Partner VPS UUID).
 *     - If ANY role/UUID has >= 2 `swarm-watch.js` processes running, terminates all older
 *       instances and keeps ONLY the single newest instance!
 *     - Automatically terminates any hanging `node -e` process running longer than 45 seconds!
 *  4. MySQL Project_Tasks / Dispatch Board watchdog: inspects hanging IN_PROGRESS tasks.
 *  5. Zero-Hang Guarantee: Includes hard-timeout self-termination and safe cleanup hooks.
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const locksDir = path.join(rootDir, 'swarm/locks');
const boardPath = path.join(rootDir, 'swarm/TASK_DISPATCH_BOARD.json');
const registryPath = path.join(rootDir, 'swarm/AI_SWARM_REGISTRY.json');

// --- CLI OPTIONS ---
const args = process.argv.slice(2);
const isDaemon = args.includes('--daemon') || args.includes('--loop');
const isVerbose = args.includes('--verbose') || args.includes('-v');
let intervalSec = 60; // Default watchdog cycle 60s

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--interval' && args[i + 1]) {
    intervalSec = Math.max(parseInt(args[++i], 10) || 60, 10);
  } else if (args[i].startsWith('--interval=')) {
    intervalSec = Math.max(parseInt(args[i].split('=')[1], 10) || 60, 10);
  }
}

/**
 * Load identity map from AI_SWARM_REGISTRY.json so `--id <UUID>` and `--role <ROLE>`
 * for the same agent resolve to the same canonical group key.
 */
function loadCanonicalIdentityMap() {
  const map = new Map();
  if (fs.existsSync(registryPath)) {
    try {
      const reg = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      const slots = reg.slot_bindings || [];
      for (const s of slots) {
        const canonical = s.project_assigned_id || s.slot || s.concrete_conversation_id;
        if (canonical) {
          map.set(String(canonical).toUpperCase(), canonical);
          if (s.concrete_conversation_id) {
            map.set(String(s.concrete_conversation_id).toLowerCase(), canonical);
          }
          if (s.physical_display_name) {
            map.set(String(s.physical_display_name).toUpperCase(), canonical);
          }
        }
      }
    } catch {}
  }
  return map;
}

/**
 * Check if a process ID is currently running on the operating system
 */
export function isPidAlive(pid) {
  if (!pid || isNaN(pid)) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    if (e.code === 'EPERM') return true; // Process exists but protected
    return false;
  }
}

/**
 * Terminate a process safely across platforms
 */
export function killProcess(pid) {
  if (!pid || isNaN(pid) || Number(pid) === process.pid) return false;
  try {
    try {
      process.kill(Number(pid), 'SIGKILL');
      return true;
    } catch {
      if (process.platform === 'win32') {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore', timeout: 3000 });
        return true;
      }
    }
  } catch (e) {
    if (isVerbose) console.warn(`[REAPER] Could not kill PID ${pid}:`, e.message);
  }
  return false;
}

/**
 * Query all OS `node` processes with their PID, Creation Time (ms), and CommandLine
 */
export function listOsNodeProcesses() {
  try {
    if (process.platform === 'win32') {
      const cmd = `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='node.exe'\\" | Select-Object ProcessId, CreationDate, CommandLine | ConvertTo-Json -Compress"`;
      const raw = execSync(cmd, { encoding: 'utf8', timeout: 4000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      return list.map(item => {
        let createdMs = Date.now();
        if (item.CreationDate) {
          const m = String(item.CreationDate).match(/\/Date\((\d+)\)\//);
          if (m) {
            createdMs = Number(m[1]);
          } else {
            const d = new Date(item.CreationDate).getTime();
            if (!isNaN(d)) createdMs = d;
          }
        }
        return {
          pid: Number(item.ProcessId),
          createdMs,
          commandLine: String(item.CommandLine || '')
        };
      }).filter(p => p.pid && !isNaN(p.pid));
    } else {
      const raw = execSync(`ps -eo pid,etimes,args | grep node`, { encoding: 'utf8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      if (!raw) return [];
      const now = Date.now();
      return raw.split('\n').map(line => {
        const match = line.trim().match(/^(\d+)\s+(\d+)\s+(.*)$/);
        if (!match) return null;
        return {
          pid: Number(match[1]),
          createdMs: now - Number(match[2]) * 1000,
          commandLine: match[3]
        };
      }).filter(Boolean);
    }
  } catch {
    return [];
  }
}

/**
 * Extract watcher identity (`--role <X>` or `--id <UUID>`) from a swarm-watch.js command line
 */
function extractWatcherIdentity(cmdLine, identityMap) {
  let rawId = null;
  const roleMatch = cmdLine.match(/--role(?:=|\s+)["']?([^\s"']+)["']?/i);
  const idMatch = cmdLine.match(/--id(?:=|\s+)["']?([^\s"']+)["']?/i);
  if (roleMatch) {
    rawId = roleMatch[1];
  } else if (idMatch) {
    rawId = idMatch[1];
  } else {
    const uuidMatch = cmdLine.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (uuidMatch) rawId = uuidMatch[1];
  }
  if (!rawId) return 'UNKNOWN_WATCHER';

  const upper = rawId.toUpperCase();
  const lower = rawId.toLowerCase();
  if (identityMap.has(upper)) return identityMap.get(upper);
  if (identityMap.has(lower)) return identityMap.get(lower);
  return upper;
}

/**
 * 3. [P2P MESH REAPER] Cross-Agent Duplicate Watcher & Hanging `node -e` Sweeper
 */
export function sweepOsMeshProcesses(maxNodeEvalAgeMs = 45000) {
  const procs = listOsNodeProcesses();
  if (procs.length === 0) {
    return { killedDuplicateWatchers: 0, killedHangingEvals: 0 };
  }

  const identityMap = loadCanonicalIdentityMap();
  const watcherGroups = new Map();
  let killedDuplicateWatchers = 0;
  let killedHangingEvals = 0;
  const now = Date.now();

  for (const p of procs) {
    if (p.pid === process.pid) continue;
    const cmd = p.commandLine;

    // A. Detect `swarm-watch.js` instances across all agents & cross-project partners
    if (cmd.includes('swarm-watch.js')) {
      const groupKey = extractWatcherIdentity(cmd, identityMap);
      if (!watcherGroups.has(groupKey)) {
        watcherGroups.set(groupKey, []);
      }
      watcherGroups.get(groupKey).push(p);
      continue;
    }

    // B. Detect hanging `node -e` / `--eval` processes running > 45 seconds
    const isNodeEval = /\bnode(?:\.exe)?["']?\s+(?:-e|--eval)\s+/i.test(cmd);
    if (isNodeEval) {
      const ageMs = now - p.createdMs;
      if (ageMs > maxNodeEvalAgeMs) {
        console.warn(`💥 [MESH REAPER]: Phát hiện tiến trình 'node -e' treo quá hạn (PID ${p.pid}, tuổi ${Math.round(ageMs / 1000)}s > ${Math.round(maxNodeEvalAgeMs / 1000)}s). Tiến hành tiêu diệt!`);
        if (killProcess(p.pid)) {
          killedHangingEvals++;
        }
      }
    }
  }

  // Deduplicate `swarm-watch.js` per canonical Role/UUID: keep ONLY the single newest PID!
  for (const [groupKey, list] of watcherGroups.entries()) {
    if (list.length >= 2) {
      // Sort descending by creation time (newest first; tie-breaker: higher PID)
      list.sort((a, b) => (b.createdMs - a.createdMs) || (b.pid - a.pid));
      const newest = list[0];
      const olderDuplicates = list.slice(1);

      console.warn(`⚔️ [MESH REAPER]: Phát hiện ${list.length} tiến trình swarm-watch.js trùng lặp cho [${groupKey}]. Giữ lại PID mới nhất [${newest.pid}], thanh lý ${olderDuplicates.length} tiến trình cũ: [${olderDuplicates.map(x => x.pid).join(', ')}]`);

      for (const oldProc of olderDuplicates) {
        if (killProcess(oldProc.pid)) {
          killedDuplicateWatchers++;
        }
      }
    }
  }

  return { killedDuplicateWatchers, killedHangingEvals };
}

/**
 * 1. Sweep stale Git lock files (.git/index.lock)
 */
export function sweepStaleGitLocks(maxAgeMs = 30000) {
  const indexLock = path.join(rootDir, '.git/index.lock');
  if (fs.existsSync(indexLock)) {
    try {
      const stat = fs.statSync(indexLock);
      const ageMs = Date.now() - stat.mtimeMs;
      if (ageMs > maxAgeMs) {
        fs.unlinkSync(indexLock);
        console.log(`🔓 [REAPER]: Đã giải phóng stale git lock: .git/index.lock (${Math.round(ageMs / 1000)}s tuổi).`);
        return true;
      }
    } catch (e) {
      console.error(`⚠️ [REAPER]: Lỗi khi dọn dẹp git index.lock:`, e.message);
    }
  }
  return false;
}

/**
 * 2. Sweep process lock files in swarm/locks/
 */
export function sweepProcessLocks() {
  if (!fs.existsSync(locksDir)) {
    try {
      fs.mkdirSync(locksDir, { recursive: true });
    } catch {}
    return { cleanedLocks: 0, terminatedZombies: 0 };
  }

  let cleanedLocks = 0;
  let terminatedZombies = 0;

  let files = [];
  try {
    files = fs.readdirSync(locksDir).filter(f => f.endsWith('.pid'));
  } catch {
    return { cleanedLocks, terminatedZombies };
  }

  for (const file of files) {
    const filePath = path.join(locksDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      const pid = Number(data.pid);
      const role = data.role || file.replace('.pid', '');

      if (!isPidAlive(pid)) {
        console.log(`🧹 [REAPER]: Phát hiện lock file mồ côi: ${file} (PID ${pid} của vai trò [${role}] đã dừng). Đang dọn dẹp...`);
        try {
          fs.unlinkSync(filePath);
          cleanedLocks++;
        } catch {}
      } else {
        // Process is alive, check heartbeat freshness
        const lastBeat = new Date(data.heartbeat_at || data.started_at).getTime();
        const ageMs = Date.now() - lastBeat;
        const maxWaitMs = (Number(data.interval_seconds) || 30) * 3 * 1000;

        if (ageMs > maxWaitMs) {
          console.warn(`🧟 [REAPER]: Phát hiện Zombie Watcher PID [${pid}] (${role}) đông cứng (> ${Math.round(ageMs / 1000)}s không nhịp tim). Đang giải phóng...`);
          killProcess(pid);
          try {
            fs.unlinkSync(filePath);
            terminatedZombies++;
          } catch {}
        } else if (isVerbose) {
          console.log(`💚 [REAPER]: Watcher [${role}] (PID ${pid}) nhịp tim tốt (${Math.round(ageMs / 1000)}s trước).`);
        }
      }
    } catch (err) {
      // Corrupted lock file
      console.warn(`⚠️ [REAPER]: Tệp lock hỏng [${file}], tiến hành thu hồi:`, err.message);
      try {
        fs.unlinkSync(filePath);
        cleanedLocks++;
      } catch {}
    }
  }

  return { cleanedLocks, terminatedZombies };
}

/**
 * 4. Inspect Task Dispatch Board for hanging tasks
 */
export function sweepTaskDispatchBoard() {
  if (!fs.existsSync(boardPath)) return [];
  try {
    const board = JSON.parse(fs.readFileSync(boardPath, 'utf8'));
    const hangingTasks = [];
    const now = Date.now();

    for (const task of (board.tasks || [])) {
      if (task.status === 'IN_PROGRESS' && task.started_at) {
        const startedTime = new Date(task.started_at).getTime();
        const durationHours = (now - startedTime) / (1000 * 3600);
        const estimatedHours = task.estimated_hours || 4;
        if (durationHours > estimatedHours * 2) {
          hangingTasks.push({
            task_id: task.task_id,
            assigned_to: task.assigned_to,
            running_hours: durationHours.toFixed(1),
            estimated_hours: estimatedHours
          });
        }
      }
    }

    if (hangingTasks.length > 0) {
      console.warn(`⚠️ [REAPER]: Phát hiện ${hangingTasks.length} tác vụ IN_PROGRESS kéo dài quá hạn ước tính:`);
      for (const h of hangingTasks) {
        console.warn(`   - [${h.task_id}] Gán cho: ${h.assigned_to} (Chạy ${h.running_hours}h / Dự kiến ${h.estimated_hours}h)`);
      }
    }

    return hangingTasks;
  } catch {
    return [];
  }
}

/**
 * Execute a complete single self-healing reaper cycle
 */
export function runReaperCycle() {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\n==================================================================`);
  console.log(`🩺 [P2P MESH REAPER CYCLE START: ${timestamp}] (PID: ${process.pid})`);
  console.log(`==================================================================`);

  // Step 1: Stale Git Locks
  const gitCleaned = sweepStaleGitLocks(30000);
  if (!gitCleaned && isVerbose) {
    console.log(`✓ [GIT GUARD]: Không phát hiện stale .git/index.lock.`);
  }

  // Step 2: Cross-Agent & Cross-Project OS Mesh Process Deduplication + Hanging `node -e` Killer
  const { killedDuplicateWatchers, killedHangingEvals } = sweepOsMeshProcesses(45000);
  console.log(`✓ [P2P MESH GUARD]: Đã tiêu diệt ${killedDuplicateWatchers} duplicate watchers, giải phóng ${killedHangingEvals} tiến trình 'node -e' treo.`);

  // Step 3: Stale Process Locks & Zombie Watchers
  const { cleanedLocks, terminatedZombies } = sweepProcessLocks();
  console.log(`✓ [MUTEX GUARD]: Đã dọn dẹp ${cleanedLocks} lock mồ côi, thanh lý ${terminatedZombies} zombie process.`);

  // Step 4: Hanging Tasks Watchdog
  const hanging = sweepTaskDispatchBoard();
  if (hanging.length === 0 && isVerbose) {
    console.log(`✓ [TASK WATCHDOG]: Toàn bộ task IN_PROGRESS đang trong giới hạn SLA.`);
  }

  console.log(`✅ [P2P MESH REAPER CYCLE COMPLETED: ${new Date().toLocaleTimeString()}]\n`);
}

// --- EXECUTION DISPATCHER ---
const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('swarm_self_healing_reaper.js') ||
  process.argv[1].replace(/\\/g, '/').endsWith('swarm_self_healing_reaper.js')
);

if (isMainModule) {
  if (!isDaemon) {
    const hardTimeout = setTimeout(() => {
      console.error('CRITICAL: Reaper cycle exceeded 15s execution timeout. Force terminating.');
      process.exit(1);
    }, 15000);
    hardTimeout.unref();

    try {
      runReaperCycle();
      process.exit(0);
    } catch (err) {
      console.error('❌ [REAPER FATAL EXCEPTION]:', err);
      process.exit(1);
    }
  } else {
    console.log(`🛰️  [SWARM P2P MESH REAPER DAEMON ACTIVATED]`);
    console.log(`Tuần tra tự phục hồi Swarm định kỳ mỗi ${intervalSec} giây...`);
    runReaperCycle();
    setInterval(() => {
      runReaperCycle();
    }, intervalSec * 1000);
  }
}
