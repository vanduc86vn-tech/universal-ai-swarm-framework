import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * ============================================================================
 * UNIVERSAL AI SWARM FRAMEWORK (UASOF V4.1)
 * COMPREHENSIVE GITOPS EVENT-DRIVEN REACTIVE DAEMON WATCHER
 * ============================================================================
 * Features:
 *  1. Zero-Hardcode Identity Resolution (UUID / Conversation ID <-> Role).
 *  2. Schema-Agnostic Registry Parser (supports slot_bindings, orchestrator/workers, arrays).
 *  3. Bidirectional Finite State Machine (FSM) Wakeup Signals:
 *     - Workers: ASSIGNED, READY, TODO, OPEN, IN_PROGRESS.
 *     - QA/Auditors: READY_FOR_AUDIT, AUDIT_IN_PROGRESS.
 *     - Lead/Orchestrator: PENDING_DISPATCH, NEW, INCOMING_RFC, READY_FOR_AUDIT, 
 *       READY_FOR_REVIEW, READY_FOR_LEAD_REVIEW, COMPLETED, AUDITED_PASSED, HANDOFF.
 *  4. Smart Dynamic Heartbeat & Power-Saving Day/Night Scheduling.
 *  5. Swarm Emergency Pause Switch (swarm_policy.status === 'PAUSED').
 *  6. Resilient Multi-Branch Git Synchronization with Timeout Shielding.
 * ============================================================================
 */

const rootDir = process.cwd();
const boardPath = path.join(rootDir, 'swarm/TASK_DISPATCH_BOARD.json');
const registryPath = path.join(rootDir, 'swarm/AI_SWARM_REGISTRY.json');

// --- 1. CLI ARGUMENTS PARSING ---
const args = process.argv.slice(2);
let idArg = null;
let roleArg = null;
let customIntervalArg = null;
const isLoop = args.includes('--loop');

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--id' && args[i + 1]) {
    idArg = args[++i];
  } else if (arg.startsWith('--id=')) {
    idArg = arg.split('=')[1];
  } else if (arg === '--role' && args[i + 1]) {
    roleArg = args[++i];
  } else if (arg.startsWith('--role=')) {
    roleArg = arg.split('=')[1];
  } else if (arg === '--interval' && args[i + 1]) {
    customIntervalArg = parseInt(args[++i], 10);
  } else if (arg.startsWith('--interval=')) {
    customIntervalArg = parseInt(arg.split('=')[1], 10);
  } else if (!arg.startsWith('--')) {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(arg)) {
      if (!idArg) idArg = arg;
    } else if (arg.startsWith('AI-') || !roleArg) {
      if (!roleArg) roleArg = arg;
    }
  }
}

// --- 2. UNIVERSAL REGISTRY RESOLUTION ENGINE ---
let registryData = null;
if (fs.existsSync(registryPath)) {
  try {
    registryData = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  } catch (err) {
    console.error('⚠️ [REGISTRY ERROR]: Không thể đọc file AI_SWARM_REGISTRY.json:', err.message);
  }
}

let isLeadRole = false;
let isQARole = false;

function resolveIdentity() {
  if (!registryData) return;

  // Schema A: UASOF Standard Archetype (slot_bindings or active_swarms)
  const slots = registryData.slot_bindings || registryData.active_swarms || (Array.isArray(registryData) ? registryData : null);
  if (Array.isArray(slots)) {
    for (const slot of slots) {
      const matchId = idArg && (slot.concrete_conversation_id === idArg || slot.conversation_id === idArg || slot.uuid === idArg);
      const matchRole = roleArg && (
        slot.project_assigned_id === roleArg || 
        slot.role === roleArg || 
        slot.slot === roleArg ||
        slot.abstract_meta_role === roleArg
      );

      if (matchId || matchRole) {
        if (!roleArg) roleArg = slot.project_assigned_id || slot.role || slot.abstract_meta_role || slot.slot;
        if (!idArg) idArg = slot.concrete_conversation_id || slot.conversation_id || slot.uuid;
        
        const roleUpper = String(roleArg || '').toUpperCase();
        const metaUpper = String(slot.abstract_meta_role || '').toUpperCase();
        const isLeadMatch = roleUpper === 'AI-LEAD&BA' || roleUpper.includes('LEAD') || roleUpper.includes('ORCHESTRAT') || metaUpper.includes('LEAD') || slot.slot === 'CONVERSATION_ID_1' || (/(^|[^A-Z])BA([^A-Z]|$)/.test(roleUpper) && !roleUpper.includes('DATA') && !roleUpper.includes('BACKEND'));
        if (isLeadMatch) {
          isLeadRole = true;
        }
        if (roleUpper.includes('AUDIT') || roleUpper.includes('QA') || metaUpper.includes('AUDIT') || metaUpper.includes('QA') || slot.slot === 'CONVERSATION_ID_3') {
          isQARole = true;
        }
        return;
      }
    }
  }

  // Schema B: Orchestrator + Registered Workers (Key-Value Dict)
  if (registryData.orchestrator) {
    const orch = registryData.orchestrator;
    if ((idArg && orch.conversation_id === idArg) || (roleArg && (orch.role === roleArg || roleArg.includes('LEAD')))) {
      if (!roleArg) roleArg = orch.role;
      if (!idArg) idArg = orch.conversation_id;
      isLeadRole = true;
      return;
    }
  }

  if (registryData.registered_workers && typeof registryData.registered_workers === 'object') {
    for (const [key, worker] of Object.entries(registryData.registered_workers)) {
      if ((idArg && worker.conversation_id === idArg) || (roleArg && (worker.role === roleArg || key === roleArg))) {
        if (!roleArg) roleArg = worker.role || key;
        if (!idArg) idArg = worker.conversation_id;
        const roleUpper = String(roleArg || '').toUpperCase();
        if (roleUpper.includes('AUDIT') || roleUpper.includes('QA')) {
          isQARole = true;
        }
        return;
      }
    }
  }
}

resolveIdentity();

// Fallback identification if not detected via registry
if (!roleArg && !idArg) {
  console.log('Cách sử dụng UASOF Swarm Watcher:');
  console.log('  node swarm/scripts/swarm-watch.js --id <UUID> [--interval <SEC>] [--loop]');
  console.log('  node swarm/scripts/swarm-watch.js --role <ROLE_NAME> [--interval <SEC>] [--loop]');
  process.exit(1);
}

const targetRole = roleArg || 'UNKNOWN_ROLE';
const targetId = idArg || 'UNKNOWN_ID';
const roleUpper = targetRole.toUpperCase();
if (!isLeadRole && (roleUpper === 'AI-LEAD&BA' || roleUpper.includes('LEAD') || roleUpper.includes('ORCHESTRAT') || (/(^|[^A-Z])BA([^A-Z]|$)/.test(roleUpper) && !roleUpper.includes('DATA') && !roleUpper.includes('BACKEND')))) {
  isLeadRole = true;
}
if (!isQARole && (roleUpper.includes('AUDIT') || roleUpper.includes('QA'))) {
  isQARole = true;
}

// --- 3. DYNAMIC HEARTBEAT & INTERVAL COMPUTATION ---
function calculateDynamicInterval() {
  if (customIntervalArg && customIntervalArg > 0) {
    return Math.min(Math.max(customIntervalArg, 5), 3600);
  }

  let interval = 30; // Mặc định 30 giây
  if (registryData && registryData.swarm_policy) {
    const policy = registryData.swarm_policy;
    const schedule = policy.smart_scheduling;
    if (schedule && schedule.enabled) {
      const currentHour = new Date().getHours();
      const nightStart = schedule.night_start_hour ?? 0;
      const nightEnd = schedule.night_end_hour ?? 6;
      if (currentHour >= nightStart && currentHour < nightEnd) {
        interval = schedule.nighttime_interval_seconds || 3600; // Nghỉ sâu ban đêm
      } else {
        interval = schedule.daytime_interval_seconds || 60; // Trực chiến ban ngày
      }
    } else if (policy.watch_interval_seconds) {
      interval = policy.watch_interval_seconds;
    }
  } else if (registryData && (registryData.watch_interval_seconds || registryData.heartbeat_policy?.interval_seconds)) {
    interval = registryData.watch_interval_seconds || registryData.heartbeat_policy.interval_seconds;
  }
  return Math.min(Math.max(interval, 5), 3600);
}

let activeIntervalSec = calculateDynamicInterval();

console.log('==================================================================');
console.log('🛰️  UNIVERSAL AI SWARM FRAMEWORK (UASOF V4.1) - GITOPS REACTIVE DAEMON');
console.log('==================================================================');
console.log(`Định danh phiên (UUID) : ${targetId}`);
console.log(`Vai trò đảm nhiệm      : [${targetRole}]`);
console.log(`Phân loại chức năng    : ${isLeadRole ? '👑 ORCHESTRATOR / LEAD & BA' : (isQARole ? '🛡️ QUALITY ASSURANCE & AUDITOR' : '⚙️ SPECIALIZED TASK WORKER')}`);
console.log(`Nhịp tim tuần tra      : Mỗi ${activeIntervalSec} giây`);
console.log(`Trạng thái             : Đang lắng nghe tín hiệu GitOps thời gian thực...\n`);

// --- 4. SECURE GIT SYNCHRONIZATION ---
function syncGitLatest() {
  try {
    execSync('git pull --quiet', { stdio: 'ignore', timeout: 8000 });
  } catch {
    try {
      execSync('git pull --quiet origin main', { stdio: 'ignore', timeout: 8000 });
    } catch {
      try {
        execSync('git pull --quiet origin master', { stdio: 'ignore', timeout: 8000 });
      } catch {
        // Yên lặng bỏ qua nếu remote tạm thời unreach hoặc offline
      }
    }
  }
}

// --- 5. FSM REACTIVE WAKEUP INSPECTION ---
function checkNewTasks() {
  try {
    // A. Kiểm tra công tắc dừng khẩn cấp toàn Swarm (EMERGENCY HALT SWITCH)
    if (fs.existsSync(registryPath)) {
      try {
        const freshRegistry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        if (freshRegistry.swarm_policy?.status === 'PAUSED') {
          console.log(`\n⏸️  [SWARM ĐANG TẠM DỪNG]: Nhận lệnh PAUSE từ Swarm Policy. Daemon [${targetRole}] tạm dừng tuần tra.`);
          process.exit(0);
        }
      } catch {}
    }

    // B. Kéo Git mới nhất
    syncGitLatest();

    // C. Đọc Task Dispatch Board
    if (!fs.existsSync(boardPath)) return false;
    let board;
    try {
      board = JSON.parse(fs.readFileSync(boardPath, 'utf8'));
    } catch {
      return false;
    }

    const tasks = board.tasks || [];
    const triggeredTasks = [];

    // FSM State Categories
    const WORKER_ACTIONABLE_STATUSES = ['ASSIGNED', 'READY', 'TODO', 'OPEN', 'IN_PROGRESS'];
    const QA_ACTIONABLE_STATUSES = ['READY_FOR_AUDIT', 'AUDIT_IN_PROGRESS', 'PENDING_QA_VERIFICATION'];
    const LEAD_DISPATCH_STATUSES = ['PENDING_DISPATCH', 'NEW', 'UNASSIGNED', 'INCOMING_RFC', 'RFC_PENDING', 'PROPOSED'];
    const LEAD_REVIEW_STATUSES = ['COMPLETED', 'AUDITED_PASSED', 'READY_FOR_LEAD_REVIEW', 'READY_FOR_REVIEW', 'DELIVERED', 'HANDOFF', 'RESOLVED'];

    for (const task of tasks) {
      if (task.status === 'CLOSED' || task.archived === true) continue;

      const assignedRole = String(task.assigned_to || '').trim();
      const assignedId = String(task.assigned_conversation_id || '').trim();
      const handoffRole = String(task.handoff_to || '').trim();

      const isAssignedDirectly = 
        (roleArg && (assignedRole === roleArg || assignedRole.toUpperCase() === roleUpper)) ||
        (idArg && (assignedId === idArg || assignedRole === idArg));

      // 1. Phản ứng cho WORKER thông thường (Không phải Lead)
      if (!isLeadRole && isAssignedDirectly && WORKER_ACTIONABLE_STATUSES.includes(task.status)) {
        triggeredTasks.push({ task, reason: `Tác vụ [${task.task_id}] được chỉ định trực tiếp với trạng thái ${task.status}` });
        continue;
      }

      // 2. Phản ứng cho AUDIT / QA WORKER
      if (isQARole) {
        const isQaDirect = isAssignedDirectly && QA_ACTIONABLE_STATUSES.includes(task.status);
        const isGeneralAuditSignal = QA_ACTIONABLE_STATUSES.includes(task.status) && (!assignedRole || assignedRole.includes('AUDIT') || assignedRole.includes('QA'));
        if (isQaDirect || isGeneralAuditSignal) {
          triggeredTasks.push({ task, reason: `Tác vụ [${task.task_id}] chuyển sang trạng thái kiểm toán Quality Gate: ${task.status}` });
          continue;
        }
      }

      // 3. Phản ứng cho LEAD & BA (TỔNG CHỈ HUY ĐIỀU PHỐI)
      if (isLeadRole) {
        // Nhóm 3.1: Task mới / RFC gửi đến từ dự án ngoài cần Lead bóc tách & Dispatch
        if (LEAD_DISPATCH_STATUSES.includes(task.status)) {
          triggeredTasks.push({ task, reason: `Phát hiện tác vụ mới/RFC cần Lead bóc tách & phân bổ: ${task.status}` });
          continue;
        }

        // Nhóm 3.2: Worker hoàn tất tác vụ, chuyển sang bàn giao kiểm toán nhưng chưa có QA nhận hoặc cần Lead phân phối
        if (task.status === 'READY_FOR_AUDIT' && !task.lead_reviewed) {
          triggeredTasks.push({ task, reason: `Worker đã thi công xong tác vụ [${task.task_id}], chuyển sang READY_FOR_AUDIT chờ nghiệm thu/kiểm toán` });
          continue;
        }

        // Nhóm 3.3: Worker hoặc QA đã hoàn tất, chuyển về bàn giao cho Lead báo cáo Sếp
        if (LEAD_REVIEW_STATUSES.includes(task.status) && !task.lead_reviewed) {
          triggeredTasks.push({ task, reason: `Worker/QA đã hoàn thành tác vụ [${task.task_id}] (${task.status}), cần Lead nghiệm thu và đóng Task` });
          continue;
        }

        // Nhóm 3.4: Task hoặc Handoff chỉ định đích danh Lead
        const isTargetedToLead = 
          assignedRole === targetRole || 
          assignedRole.includes('AI-LEAD') || 
          handoffRole === targetRole || 
          handoffRole.includes('AI-LEAD') ||
          assignedId === targetId;

        if (isTargetedToLead && !task.lead_reviewed && (WORKER_ACTIONABLE_STATUSES.includes(task.status) || LEAD_REVIEW_STATUSES.includes(task.status))) {
          triggeredTasks.push({ task, reason: `Tác vụ chỉ định đích danh cho Lead Orchestrator xử lý/nghiệm thu` });
          continue;
        }
      }
    }

    // D. Xử lý khi có tín hiệu kích hoạt Wakeup
    if (triggeredTasks.length > 0) {
      console.log(`\n🚨 ================================================================`);
      console.log(`⚡ [KÍCH HOẠT WAKEUP SIGNAL CHO: ${targetRole}]`);
      console.log(`Tổng số sự kiện cần xử lý ngay: ${triggeredTasks.length}`);
      console.log(`================================================================`);
      
      for (const item of triggeredTasks) {
        const t = item.task;
        console.log(`📌 Mã Task      : ${t.task_id} (Trạng thái: ${t.status})`);
        console.log(`🔍 Lý do Wakeup  : ${item.reason}`);
        console.log(`📁 Phân hệ       : ${t.module || 'N/A'}`);
        console.log(`📝 Tiêu đề       : ${t.title}`);
        if (t.assigned_to) console.log(`👤 Đang gán cho  : ${t.assigned_to}`);
        if (t.handoff_to)  console.log(`🤝 Bàn giao cho  : ${t.handoff_to}`);
        console.log(`👉 Hành động     : ${t.next_action || 'Thực thi / Bóc tách / Nghiệm thu ngay'}`);
        console.log(`----------------------------------------------------------------`);
      }
      console.log(`\n✅ Thoát tiến trình daemon (Exit Code 0) để đánh thức Agent trong phiên làm việc Antigravity!`);
      process.exit(0);
    } else {
      process.stdout.write(`[${new Date().toLocaleTimeString()}] [${targetRole}] đang tuần tra GitOps... (Nhịp tim: ${activeIntervalSec}s)\r`);
    }
  } catch (err) {
    console.error('⚠️ [WATCH CYCLE EXCEPTION]:', err.message);
  }
}

// Chạy kiểm tra ngay chu kỳ đầu tiên
checkNewTasks();

// Lập lịch tuần tra thích ứng nếu có cờ --loop
if (isLoop) {
  function scheduleNext() {
    activeIntervalSec = calculateDynamicInterval();
    setTimeout(() => {
      checkNewTasks();
      scheduleNext();
    }, activeIntervalSec * 1000);
  }
  scheduleNext();
}
