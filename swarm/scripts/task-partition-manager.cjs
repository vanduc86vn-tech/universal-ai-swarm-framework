/**
 * ============================================================================
 * UNIVERSAL AI SWARM FRAMEWORK - PARTITIONED TASK MANAGER (MODE A GITOPS)
 * File: swarm/scripts/task-partition-manager.js & .cjs
 * ============================================================================
 * ĐỘT PHÁ TỐI THƯỢNG: KHAI TỬ BẢNG TASK ĐƠN KHỐI (ZERO MONOLITHIC JSON)
 * Tuân thủ tuyệt đối Điều V Hiến Pháp Swarm:
 *  - Cấm đọc file lớn > 45 KB
 *  - Phân mảnh task độc lập: Mỗi task là 1 file JSON < 2 KB trong swarm/tasks/active/
 *  - Khi xong chuyển sang swarm/tasks/archive/
 *  - Bảng tổng kết mỏng nhẹ swarm/BOARD_SUMMARY.json (< 1 KB)
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

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
const activeDir = path.join(workspaceRoot, 'swarm', 'tasks', 'active');
const archiveDir = path.join(workspaceRoot, 'swarm', 'tasks', 'archive');
const summaryPath = path.join(workspaceRoot, 'swarm', 'BOARD_SUMMARY.json');

function ensureDirs() {
  if (!fs.existsSync(activeDir)) fs.mkdirSync(activeDir, { recursive: true });
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
}

function updateSummary() {
  ensureDirs();
  const activeFiles = fs.readdirSync(activeDir).filter(f => f.endsWith('.json'));
  const archiveFiles = fs.existsSync(archiveDir) ? fs.readdirSync(archiveDir).filter(f => f.endsWith('.json')) : [];

  const activeTasks = [];
  const workerWorkload = {};

  for (const f of activeFiles) {
    const data = readJsonSafe(path.join(activeDir, f));
    if (data) {
      const taskId = data.task_id || data.id || f.replace('.json', '');
      const assigned = data.assigned_to || data.worker || 'UNASSIGNED';
      const status = data.status || 'OPEN';
      activeTasks.push({
        task_id: taskId,
        title: data.title || '',
        status: status,
        assigned_to: assigned
      });
      workerWorkload[assigned] = (workerWorkload[assigned] || 0) + 1;
    }
  }

  const summary = {
    board_name: "SWARM_PARTITIONED_TASK_BOARD",
    version: "3.2.0-PARTITIONED-GITOPS",
    mode: "MODE_A_PARTITIONED_GITOPS",
    last_updated: new Date().toISOString(),
    metrics: {
      total_active_tasks: activeFiles.length,
      completed_archived_tasks: archiveFiles.length,
      worker_workload: workerWorkload
    },
    active_directory: "swarm/tasks/active/",
    archive_directory: "swarm/tasks/archive/",
    active_tasks: activeTasks
  };

  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
  return summary;
}

function migrateMonolith(customPath) {
  ensureDirs();
  let monolithFile = customPath;
  if (!monolithFile) {
    const candidates = [
      path.join(workspaceRoot, 'swarm', 'TASK_DISPATCH_BOARD.json'),
      path.join(workspaceRoot, 'TASK_DISPATCH_BOARD.json'),
      path.join(workspaceRoot, 'swarm', 'tasks', 'TASK_DISPATCH_BOARD.json')
    ];
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        monolithFile = cand;
        break;
      }
    }
  }

  if (!monolithFile || !fs.existsSync(monolithFile)) {
    console.error(`❌ [LỖI] Không tìm thấy file Task Monolith cần di tản: ${monolithFile || 'TASK_DISPATCH_BOARD.json'}`);
    process.exit(1);
  }

  console.log(`\n🚀 =========================================================================`);
  console.log(`📦 BẮT ĐẦU DI TẢN & PHÂN RÃ FILE ĐƠN KHỐI (MONOLITH -> PARTITIONS)`);
  console.log(`📄 Nguồn: ${monolithFile}`);
  console.log(`=========================================================================\n`);

  const statBefore = fs.statSync(monolithFile);
  const sizeKbBefore = (statBefore.size / 1024).toFixed(2);
  console.log(`📊 Dung lượng file gốc: ${sizeKbBefore} KB (~${Math.round(sizeKbBefore * 250)} tokens/lần đọc)`);

  const rawData = readJsonSafe(monolithFile);
  if (!rawData) {
    console.error(`❌ [LỖI] Không thể phân tích cú pháp JSON từ file: ${monolithFile}`);
    process.exit(1);
  }

  // Trích xuất danh sách tasks từ các cấu trúc JSON phổ biến
  let taskList = [];
  if (Array.isArray(rawData)) {
    taskList = rawData;
  } else if (Array.isArray(rawData.tasks)) {
    taskList = rawData.tasks;
  } else if (Array.isArray(rawData.items)) {
    taskList = rawData.items;
  } else if (typeof rawData === 'object') {
    // Có thể là object dạng { "TASK-001": {...}, "TASK-002": {...} }
    for (const [k, v] of Object.entries(rawData)) {
      if (v && typeof v === 'object' && (v.task_id || v.title || v.status)) {
        if (!v.task_id) v.task_id = k;
        taskList.push(v);
      }
    }
  }

  if (taskList.length === 0) {
    console.log(`⚠️ Không tìm thấy mảng task nào trong file monolith. Kiểm tra lại nội dung file!`);
    process.exit(0);
  }

  console.log(`🔍 Tìm thấy tổng cộng: ${taskList.length} tasks trong file đơn khối.\n`);

  let activeCount = 0;
  let archiveCount = 0;

  const terminalStatuses = ['COMPLETED', 'ARCHIVED', 'CANCELLED', 'DONE', 'CLOSED', 'REJECTED'];

  taskList.forEach((task, index) => {
    const taskId = task.task_id || task.id || `TASK-MIGRATE-${String(index + 1).padStart(3, '0')}`;
    const status = String(task.status || 'OPEN').toUpperCase();
    const isCompleted = terminalStatuses.includes(status);

    const taskFilename = `${taskId}.json`;
    const targetDir = isCompleted ? archiveDir : activeDir;
    const targetPath = path.join(targetDir, taskFilename);

    // Chuẩn hóa cấu trúc task file < 2 KB
    const normalizedTask = {
      task_id: taskId,
      module: task.module || 'general',
      title: task.title || task.name || 'Untitled Task',
      description: task.description || '',
      status: task.status || (isCompleted ? 'COMPLETED' : 'OPEN'),
      assigned_to: task.assigned_to || task.worker || 'UNASSIGNED',
      assigned_uuid: task.assigned_uuid || '',
      priority: task.priority || 'MEDIUM',
      created_at: task.created_at || new Date().toISOString(),
      started_at: task.started_at || null,
      completed_at: task.completed_at || (isCompleted ? new Date().toISOString() : null),
      result_artifact: task.result_artifact || task.proof_url || null,
      proof_hash: task.proof_hash || null,
      audited_by: task.audited_by || null,
      audit_verdict: task.audit_verdict || (isCompleted ? 'PASSED' : null),
      migrated_from: path.basename(monolithFile),
      migrated_at: new Date().toISOString()
    };

    fs.writeFileSync(targetPath, JSON.stringify(normalizedTask, null, 2), 'utf8');

    if (isCompleted) {
      archiveCount++;
    } else {
      activeCount++;
      console.log(`  ➕ [ACTIVE]  ${taskId.padEnd(25)} -> ${normalizedTask.status.padEnd(12)} (${normalizedTask.assigned_to})`);
    }
  });

  console.log(`\n-------------------------------------------------------------------------`);
  console.log(`✅ Phân rã hoàn tất:`);
  console.log(`   - Tasks đang hoạt động (Active): ${activeCount} files -> swarm/tasks/active/`);
  console.log(`   - Tasks đã hoàn thành (Archive): ${archiveCount} files -> swarm/tasks/archive/`);

  // Backup file gốc
  const backupFile = `${monolithFile}.monolith.bak`;
  try {
    fs.copyFileSync(monolithFile, backupFile);
    console.log(`💾 Đã sao lưu an toàn file gốc -> ${path.basename(backupFile)}`);
  } catch (e) {
    console.warn(`⚠️ Không thể tạo bản sao lưu: ${e.message}`);
  }

  // Thay thế file monolith cũ bằng tệp con trỏ chỉ mục mỏng (< 500 bytes)
  const pointerContent = {
    board_name: "SWARM_PARTITIONED_TASK_BOARD",
    version: "3.2.0-PARTITIONED",
    status: "MIGRATED_TO_PARTITIONED_TASKS",
    message: "Tệp monolithic cũ đã được phân rã thành công. Tuyệt đối KHÔNG đọc file này để tiết kiệm Token!",
    migration_summary: {
      migrated_at: new Date().toISOString(),
      original_file_backup: path.basename(backupFile),
      total_active_tasks: activeCount,
      total_archived_tasks: archiveCount
    },
    active_tasks_directory: "swarm/tasks/active/",
    archive_tasks_directory: "swarm/tasks/archive/",
    summary_file: "swarm/BOARD_SUMMARY.json"
  };

  fs.writeFileSync(monolithFile, JSON.stringify(pointerContent, null, 2), 'utf8');
  const statAfter = fs.statSync(monolithFile);
  const sizeKbAfter = (statAfter.size / 1024).toFixed(2);
  console.log(`📉 Dung lượng con trỏ mới: ${sizeKbAfter} KB (Giảm ${(100 - (sizeKbAfter/sizeKbBefore*100)).toFixed(1)}% dung lượng!)`);

  // Cập nhật BOARD_SUMMARY.json
  updateSummary();
  console.log(`📋 Đã làm mới snapshot tổng hợp -> swarm/BOARD_SUMMARY.json (< 1 KB)`);
  console.log(`🎉 DI TẢN HOÀN TOÀN THÀNH CÔNG! HỆ THỐNG ĐÃ SẴN SÀNG CHẠY MODE A PHÂN RÃ.`);
  console.log(`=========================================================================\n`);
}

// ============================================================================
// CLI DISPATCHER
// ============================================================================
const args = process.argv.slice(2);
const command = (args[0] || 'list').toLowerCase();

switch (command) {
  case 'migrate': {
    const targetFile = args[1];
    migrateMonolith(targetFile);
    break;
  }

  case 'list':
  case 'active': {
    ensureDirs();
    const files = fs.readdirSync(activeDir).filter(f => f.endsWith('.json'));
    console.log(`\n📋 DANH SÁCH TASK ACTIVE (Tổng: ${files.length}):`);
    console.log('---------------------------------------------------------------------------------------');
    for (const f of files) {
      const data = readJsonSafe(path.join(activeDir, f));
      if (data) {
        console.log(`📌 [${(data.task_id || f).padEnd(25)}] Trạng thái: ${(data.status || 'N/A').padEnd(14)} | Gán: ${data.assigned_to || 'N/A'}`);
        console.log(`   Tiêu đề: ${data.title || 'N/A'}`);
      }
    }
    console.log('---------------------------------------------------------------------------------------\n');
    break;
  }

  case 'archive': {
    ensureDirs();
    const taskId = args[1];
    if (!taskId) {
      console.error('❌ Lỗi: Cần cung cấp mã task. Ví dụ: node task-partition-manager.js archive TASK-001');
      process.exit(1);
    }
    const fileName = taskId.endsWith('.json') ? taskId : `${taskId}.json`;
    const src = path.join(activeDir, fileName);
    const dest = path.join(archiveDir, fileName);

    if (!fs.existsSync(src)) {
      console.error(`❌ Lỗi: Không tìm thấy task ${taskId} tại ${src}`);
      process.exit(1);
    }

    const data = readJsonSafe(src) || {};
    data.status = 'COMPLETED';
    data.completed_at = new Date().toISOString();
    fs.writeFileSync(dest, JSON.stringify(data, null, 2), 'utf8');
    fs.unlinkSync(src);
    console.log(`✅ [ARCHIVED]: Đã chuyển ${fileName} sang swarm/tasks/archive/`);
    updateSummary();
    break;
  }

  case 'create': {
    ensureDirs();
    const taskId = args[1];
    const title = args[2] || 'Untitled Task';
    const assignedTo = args[3] || 'UNASSIGNED';

    if (!taskId) {
      console.error('❌ Lỗi: Cần cung cấp Task ID. Ví dụ: node task-partition-manager.js create TASK-001 "Tiêu đề" AI-BACKEND');
      process.exit(1);
    }

    const taskObj = {
      task_id: taskId,
      title: title,
      status: 'OPEN',
      assigned_to: assignedTo,
      created_at: new Date().toISOString()
    };

    const dest = path.join(activeDir, `${taskId}.json`);
    fs.writeFileSync(dest, JSON.stringify(taskObj, null, 2), 'utf8');
    console.log(`✅ [CREATED]: Đã tạo task mới tại swarm/tasks/active/${taskId}.json (< 1 KB)`);
    updateSummary();
    break;
  }

  case 'claim': {
    ensureDirs();
    const taskId = args[1];
    const worker = args[2];

    if (!taskId || !worker) {
      console.error('❌ Lỗi cú pháp: node task-partition-manager.js claim <TASK_ID> <WORKER_NAME>');
      process.exit(1);
    }

    const dest = path.join(activeDir, `${taskId.replace('.json', '')}.json`);
    if (!fs.existsSync(dest)) {
      console.error(`❌ Không tìm thấy task ${taskId} trong thư mục active/!`);
      process.exit(1);
    }

    const data = readJsonSafe(dest);
    data.status = 'IN_PROGRESS';
    data.assigned_to = worker;
    data.started_at = new Date().toISOString();
    fs.writeFileSync(dest, JSON.stringify(data, null, 2), 'utf8');
    console.log(`🎯 [CLAIMED]: Worker ${worker} đã nhận task ${taskId} (IN_PROGRESS)`);
    updateSummary();
    break;
  }

  case 'summary': {
    const s = updateSummary();
    console.log(JSON.stringify(s, null, 2));
    break;
  }

  default:
    console.log(`
UNIVERSAL AI SWARM FRAMEWORK - TASK PARTITION MANAGER (MODE A GITOPS)
Lệnh hỗ trợ:
  node swarm/scripts/task-partition-manager.js migrate [path_to_monolith.json]
  node swarm/scripts/task-partition-manager.js list
  node swarm/scripts/task-partition-manager.js create <TASK_ID> <TITLE> [WORKER]
  node swarm/scripts/task-partition-manager.js claim <TASK_ID> <WORKER>
  node swarm/scripts/task-partition-manager.js archive <TASK_ID>
  node swarm/scripts/task-partition-manager.js summary
`);
    break;
}
