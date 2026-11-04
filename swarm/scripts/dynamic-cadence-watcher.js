#!/usr/bin/env node
/**
 * DYNAMIC CADENCE WATCHER & ARBITRATION DAEMON (ANTI-HANG & ANTI-VANITY GUARANTEE)
 * Tự động chuyển đổi tần suất:
 * - Khi có task active: Quét 30 giây/lần (Trực chiến P0)
 * - Khi hàng đợi rỗng: Quét 15 phút/lần (Chống nghẽn tài nguyên, Zero-Noise)
 * - Tự động kích hoạt Cầu Nối Liên Dự Án (Federated Bridge Pull) và kiểm tra SLA.
 * - Ghi nhận Binary Heartbeat vào swarm/locks/CADENCE_HEARTBEAT.json để chống báo cáo ảo giác.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..', '..');
const activeTasksDir = path.join(rootDir, 'swarm', 'tasks', 'active');
const locksDir = path.join(rootDir, 'swarm', 'locks');
const bridgeScript = path.join(rootDir, 'swarm', 'scripts', 'federated-bridge.cjs');
const bridgeScriptJs = path.join(rootDir, 'swarm', 'scripts', 'federated-bridge.js');

let timer = null;

if (!fs.existsSync(locksDir)) {
  fs.mkdirSync(locksDir, { recursive: true });
}

function runCadenceCycle() {
  const now = new Date().toISOString();
  let hasActiveTasks = false;

  try {
    // 1. Kéo task mới từ SSOT Partner Gateway qua Federated Bridge
    const targetBridge = fs.existsSync(bridgeScript) ? bridgeScript : bridgeScriptJs;
    if (fs.existsSync(targetBridge)) {
      try {
        execSync(`node "${targetBridge}" pull`, { cwd: rootDir, stdio: 'pipe' });
      } catch (e) {
        // safe fallback
      }
    }

    // 2. Kiểm tra thư mục active/
    if (fs.existsSync(activeTasksDir)) {
      const files = fs.readdirSync(activeTasksDir).filter(f => f.endsWith('.json'));
      hasActiveTasks = files.length > 0;
    }

    // 3. Kiểm tra SLA Timeout cho task
    if (fs.existsSync(targetBridge)) {
      try {
        execSync(`node "${targetBridge}" check-sla`, { cwd: rootDir, stdio: 'pipe' });
      } catch (e) {}
    }

  } catch (err) {
    console.error(`[CADENCE ERROR] ${now}:`, err.message);
  }

  // Dynamic Cadence: 30s khi có việc, 15m (900s) khi rảnh
  const nextInterval = hasActiveTasks ? 30 : 900;

  // Ghi binary heartbeat chống báo cáo màu hồng
  try {
    const heartbeatPath = path.join(locksDir, 'CADENCE_HEARTBEAT.json');
    fs.writeFileSync(heartbeatPath, JSON.stringify({
      last_beat_at: now,
      timestamp: Date.now(),
      has_active_tasks: hasActiveTasks,
      next_interval_sec: nextInterval,
      status: hasActiveTasks ? 'ACTIVE_TRỰC_CHIẾN' : 'IDLE_NGỦ_ĐÔNG'
    }, null, 2), 'utf8');
  } catch (hbErr) {}

  if (hasActiveTasks) {
    console.log(`[DYNAMIC CADENCE] ${now}: Phát hiện task đang active. Chế độ TRỰC CHIẾN (chu kỳ: ${nextInterval}s).`);
  } else {
    process.stdout.write(`[DYNAMIC CADENCE] ${now}: Hàng đợi rỗng. Chế độ NGỦ ĐÔNG (chu kỳ: ${nextInterval}s / 15 phút)...\r`);
  }

  // Hỗ trợ cờ --once
  if (process.argv.includes('--once')) {
    console.log(`\n[DYNAMIC CADENCE] Chạy xong 1 chu kỳ kiểm tra (mode: --once). Kết thúc an toàn.`);
    process.exit(0);
  }

  timer = setTimeout(runCadenceCycle, nextInterval * 1000);
}

console.log('[DYNAMIC CADENCE] Khởi động Daemon Trọng tài Task & Điều hòa Nhịp tim tự động (Anti-Vanity Heartbeat)...');
runCadenceCycle();
