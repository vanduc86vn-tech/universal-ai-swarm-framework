import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * SWARM GITOPS EVENT-DRIVEN WATCHER (DAEMON WORKER) V3.2
 * Tự động chạy ngầm trong hộp thoại vật lý của Worker, kéo Git về định kỳ (git pull),
 * tự động phân giải vai trò từ Conversation ID (UUID) trong AI_SWARM_REGISTRY.json
 * và bắt task chính xác mà KHÔNG CẦN HARDCODE bất kỳ tên AI nào!
 */

const rootDir = process.cwd();
const boardPath = path.join(rootDir, 'swarm/TASK_DISPATCH_BOARD.json');
const registryPath = path.join(rootDir, 'swarm/AI_SWARM_REGISTRY.json');

const args = process.argv.slice(2);
let idArg = null;
let roleArg = null;
let intervalSec = 15;

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
    intervalSec = parseInt(args[++i], 10) || 15;
  } else if (arg.startsWith('--interval=')) {
    intervalSec = parseInt(arg.split('=')[1], 10) || 15;
  } else if (!arg.startsWith('--')) {
    // Phân tích đối số vị trí (Positional argument)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(arg)) {
      if (!idArg) idArg = arg;
    } else if (arg.startsWith('AI-') || !roleArg) {
      if (!roleArg) roleArg = arg;
    }
  }
}

// Nếu truyền --id mà chưa có --role, tự động tra cứu Registry để giải mã vai trò
if (idArg && !roleArg && fs.existsSync(registryPath)) {
  try {
    const reg = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    const entries = reg.slot_bindings || reg.active_swarms || (Array.isArray(reg) ? reg : []);
    const entry = entries.find(s => 
      s.concrete_conversation_id === idArg || 
      s.conversation_id === idArg ||
      s.uuid === idArg
    );
    if (entry) {
      roleArg = entry.project_assigned_id || entry.role || entry.immutable_role_id || entry.abstract_meta_role;
      console.log(`[REGISTRY LOOKUP]: Đã tự động phân giải Conversation ID [${idArg}] -> Vai trò: [${roleArg}]`);
    }
  } catch (err) {
    console.error('Lỗi khi tra cứu registry:', err.message);
  }
}

const targetIdentifier = roleArg || idArg;

if (!targetIdentifier) {
  console.log('Cách sử dụng:');
  console.log('  1. Theo Conversation ID (Khuyên dùng - Không Hardcode):');
  console.log('     node swarm/scripts/swarm-watch.js --id <CONVERSATION_UUID> [--interval <SECONDS>] --loop');
  console.log('  2. Theo Tên Vai Trò:');
  console.log('     node swarm/scripts/swarm-watch.js --role <ROLE_NAME> [--interval <SECONDS>] --loop');
  process.exit(1);
}

console.log('=== 🛰️ SWARM GITOPS EVENT-DRIVEN DAEMON WATCHER (V3.2.3) ===');
console.log(`Định danh phiên chat (UUID): ${idArg || 'N/A'}`);
console.log(`Vai trò đảm nhiệm: [${roleArg || 'Tự động bắt theo UUID'}]`);
console.log(`Tần suất kiểm tra: Mỗi ${intervalSec} giây`);
console.log(`Trạng thái: Đang chạy ngầm trong hộp thoại vật lý, lắng nghe Git...\n`);

function checkNewTasks() {
  try {
    // 1. Tự động kéo mã nguồn mới nhất từ Git về (không hardcode nhánh main/master)
    try {
      execSync('git pull --quiet', { stdio: 'ignore', timeout: 8000 });
    } catch {
      // Bỏ qua nếu chưa cấu hình remote hoặc đang offline
    }

    // 2. Đọc Task Dispatch Board
    if (!fs.existsSync(boardPath)) return;
    const board = JSON.parse(fs.readFileSync(boardPath, 'utf8'));

    // 3. Tìm các task được giao cho vai trò này hoặc UUID này
    const validStatuses = ['ASSIGNED', 'READY', 'READY_FOR_AUDIT', 'PENDING', 'OPEN', 'TODO'];
    const pendingTasks = (board.tasks || []).filter(t => {
      const matchRole = roleArg && (t.assigned_to === roleArg || t.role === roleArg);
      const matchId = idArg && (t.assigned_conversation_id === idArg || t.assigned_to === idArg);
      const isPending = validStatuses.includes(t.status);
      return (matchRole || matchId) && isPending;
    });

    if (pendingTasks.length > 0) {
      console.log(`\n🚨 [PHÁT HIỆN TÍN HIỆU TÁC VỤ MỚI CHO ${roleArg || idArg}]:`);
      for (const task of pendingTasks) {
        console.log(`--------------------------------------------------`);
        console.log(`Mã Task: ${task.task_id} | Trạng thái: ${task.status}`);
        console.log(`Phân hệ: ${task.module}`);
        console.log(`Tiêu đề: ${task.title}`);
        console.log(`Mô tả: ${task.description || 'Không có'}`);
        console.log(`Hành động kế tiếp: ${task.next_action || 'Bắt đầu thực thi ngay'}`);
        console.log(`--------------------------------------------------`);
      }
      console.log(`\n👉 Đã tìm thấy tác vụ mới! Tiến trình tự động kết thúc để Antigravity đánh thức Agent tại tab này thi công ngay!`);
      // Thoát mã 0 để background task hoàn tất -> Đánh thức AI Agent trong tab chat dậy thực thi
      process.exit(0);
    } else {
      process.stdout.write(`[${new Date().toLocaleTimeString()}] [${roleArg || idArg}] đang chờ task mới từ Git...\r`);
    }
  } catch (err) {
    console.error('Lỗi trong chu kỳ watch:', err.message);
  }
}

// Chạy lần đầu ngay lập tức
checkNewTasks();

// Lặp lại theo chu kỳ intervalSec
if (args.includes('--loop')) {
  setInterval(checkNewTasks, intervalSec * 1000);
}
