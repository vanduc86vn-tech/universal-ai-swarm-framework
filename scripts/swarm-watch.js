import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * SWARM GITOPS EVENT-DRIVEN WATCHER (DAEMON WORKER)
 * Tự động chạy ngầm, kéo Git về định kỳ (git pull), đối soát TASK_DISPATCH_BOARD.json
 * và phát hiện tác vụ mới được giao cho Agent chuyên trách mà không cần con người can thiệp thủ công!
 */

const rootDir = process.cwd();
const boardPath = path.join(rootDir, 'swarm/TASK_DISPATCH_BOARD.json');

const args = process.argv.slice(2);
const roleArg = args.find((a, i) => args[i - 1] === '--role') || args[0];
const intervalSec = parseInt(args.find((a, i) => args[i - 1] === '--interval') || '30', 10);

if (!roleArg) {
  console.log('Cách sử dụng: node swarm/scripts/swarm-watch.js --role <ROLE_ID> [--interval <SECONDS>]');
  console.log('Ví dụ: node swarm/scripts/swarm-watch.js --role AI-DATA --interval 15');
  process.exit(1);
}

console.log('=== 🛰️ SWARM GITOPS EVENT-DRIVEN DAEMON WATCHER ===');
console.log(`Vai trò theo dõi: [${roleArg}]`);
console.log(`Tần suất kiểm tra: Mỗi ${intervalSec} giây`);
console.log(`Đang lắng nghe tín hiệu tác vụ từ Git & Task Dispatch Board...\n`);

function checkNewTasks() {
  try {
    // 1. Tự động kéo mã nguồn mới nhất từ Git về (nếu có remote git)
    try {
      execSync('git pull --quiet origin main', { stdio: 'ignore', timeout: 8000 });
    } catch {
      // Bỏ qua nếu chưa cấu hình remote hoặc đang offline
    }

    // 2. Đọc Task Dispatch Board
    if (!fs.existsSync(boardPath)) return;
    const board = JSON.parse(fs.readFileSync(boardPath, 'utf8'));

    // 3. Tìm các task được giao cho vai trò này đang chờ nhận
    const pendingTasks = (board.tasks || []).filter(t => 
      t.assigned_to === roleArg && 
      (t.status === 'ASSIGNED' || t.status === 'READY' || t.status === 'READY_FOR_AUDIT')
    );

    if (pendingTasks.length > 0) {
      console.log(`\n🚨 [PHÁT HIỆN TÍN HIỆU TÁC VỤ MỚI CHO ${roleArg}]:`);
      for (const task of pendingTasks) {
        console.log(`--------------------------------------------------`);
        console.log(`Mã Task: ${task.task_id} | Trạng thái: ${task.status}`);
        console.log(`Phân hệ: ${task.module}`);
        console.log(`Tiêu đề: ${task.title}`);
        console.log(`Mô tả: ${task.description || 'Không có'}`);
        console.log(`Hành động kế tiếp: ${task.next_action || 'Bắt đầu thực thi ngay'}`);
        console.log(`--------------------------------------------------`);
      }
      console.log(`\n👉 Yêu cầu Agent [${roleArg}] lập tức chuyển trạng thái sang IN_PROGRESS và thi công!`);
    } else {
      process.stdout.write(`[${new Date().toLocaleTimeString()}] ${roleArg} đang chờ task mới...\r`);
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
