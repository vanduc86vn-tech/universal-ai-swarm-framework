/**
 * 🛡️ PRE-TOOL PHYSICAL FIREWALL (ANTIGRAVITY LIFECYCLE HOOK)
 * Vị trí kích hoạt: Bước 5 của Pipeline.
 * Khóa cứng:
 *   1. Chặn tạo file rác (.bak, .tmp, TODO.md).
 *   2. Chặn chat-ops: NODE_01 gửi cho NODE_02 CHỈ ĐƯỢC PING nguyên tử [SIGNAL:NEW_TASK_ALERT] task_id=TASK-xxx.
 *      Chặn mọi tin nhắn chat mồm giải thích dài dòng!
 *   3. Chặn PM chạy lệnh hạ tầng VPS (Zero Role Creep).
 */

const fs = require('fs');
const path = require('path');

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => { resolve(data); });
    setTimeout(() => resolve(data), 500);
  });
}

function readJsonSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

async function main() {
  try {
    const rawInput = await readStdin();
    if (!rawInput.trim()) {
      console.log(JSON.stringify({ decision: "allow" }));
      process.exit(0);
    }

    const payload = JSON.parse(rawInput.trim());
    const toolCall = payload.toolCall || {};
    const toolName = toolCall.name || '';
    const toolArgs = toolCall.args || {};
    const conversationId = payload.conversationId || process.env.ANTIGRAVITY_CONVERSATION_ID || '';
    const workspaceRoot = (Array.isArray(payload.workspacePaths) && payload.workspacePaths.length > 0)
      ? payload.workspacePaths[0]
      : path.resolve(__dirname, '../..');

    const registryPath = path.join(workspaceRoot, 'swarm', 'AI_SWARM_REGISTRY.json');
    const registry = readJsonSafe(registryPath);

    let matchedRole = 'UNKNOWN';
    let matchedNodeId = 'UNKNOWN';
    let pmUuid = '';

    if (registry && registry.nodes) {
      for (const [nodeId, nodeData] of Object.entries(registry.nodes)) {
        if (nodeData.conversation_uuid && nodeData.conversation_uuid.toLowerCase() === conversationId.toLowerCase()) {
          matchedRole = nodeData.role || '';
          matchedNodeId = nodeId;
        }
        if (nodeData.role === 'PROJECT_MANAGER' || nodeId === 'NODE_02') {
          pmUuid = nodeData.conversation_uuid || '';
        }
      }
    }

    // =========================================================================
    // GATE 1: KIỂM SOÁT THAO TÁC FILE (CHỐNG FILE RÁC & TASK MỒM)
    // =========================================================================
    if (['write_file', 'edit_file', 'replace_file_content', 'write_to_file', 'multi_replace_file_content'].includes(toolName)) {
      const targetPath = String(toolArgs.Path || toolArgs.path || '').replace(/\\/g, '/');
      const baseName = path.basename(targetPath).toLowerCase();

      // Chặn sửa đề thi test_oracle_invariants.py
      if (targetPath.includes('test_oracle_invariants.py')) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: "[BLOCKED_BY_FIREWALL] ĐỀ THI ĐÃ ĐÓNG BĂNG! Bạn không được phép sửa tests/test_oracle_invariants.py để gian lận. Hãy quay về sửa code trong src/hdd_core/!"
        }));
        process.exit(0);
      }

      // Chặn file rác .bak, .tmp, _old
      if (/(\.bak\d*|\.tmp|_old|\.bk)$/i.test(baseName)) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: "[BLOCKED_BY_FIREWALL] LỆNH CẤM FILE RÁC: Tuyệt đối không sinh file rác sao lưu tạm thời (" + baseName + ")! Hãy thao tác trực tiếp trên file gốc."
        }));
        process.exit(0);
      }

      // Chặn file task mồm
      if (/^(todo|task_todo|pending_tasks|tasks)\.(md|txt)$/i.test(baseName)) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: "[BLOCKED_BY_FIREWALL] LỆNH CẤM GIAO TASK QUA FILE MỒM: Bước đầu tiên là sai thì tất cả đều sai! Mọi công việc phải được tạo và cấp TaskID chính thức trên SSOT qua lệnh 'node .agents/skills/ssot-task-governance/scripts/gov-client.js create-task'. Cấm tạo " + baseName + "!"
        }));
        process.exit(0);
      }
    }

    // =========================================================================
    // GATE 2: KIỂM SOÁT send_message (GIAO THỨC PING TỨC THÌ NỘI BỘ)
    // =========================================================================
    if (toolName === 'send_message') {
      const messageText = String(toolArgs.Message || '').trim();

      // Cho phép tín hiệu Ping tức thì chuẩn [SIGNAL:NEW_TASK_ALERT] task_id=TASK-xxx
      const isInstantTaskAlert = /^\[SIGNAL:\s*NEW_TASK_ALERT\]\s*(task_id\s*=|TASK-)/i.test(messageText);
      if (isInstantTaskAlert) {
        // Kiểm tra độ dài: Ping thì phải ngắn gọn nguyên tử (< 150 ký tự), cấm chat mồm giải thích task
        if (messageText.length > 200) {
          console.log(JSON.stringify({
            decision: "deny",
            reason: "[BLOCKED_CHAT_OPS] TIN NHẮN PING QUÁ DÀI: Bạn đang cố tình giải thích nội dung task qua chat! Theo Hiến pháp, Trợ lý CHỈ PING báo có task bằng cú pháp nguyên tử: [SIGNAL:NEW_TASK_ALERT] task_id=TASK-xxx để PM tự kéo chi tiết từ SSOT về. Cấm nói mồm mô tả nội dung task!"
          }));
          process.exit(0);
        }
        console.log(JSON.stringify({ decision: "allow" }));
        process.exit(0);
      }

      // Cho phép các tín hiệu hệ thống khác
      const allowlistSignalRegex = /^(\[SIGNAL:\s*[A-Z0-9_-]+\]|\[(ADMIN|SYSTEM|ACK|P2P_MESH_ACK|REJECTED_CHAT_OPS|HEARTBEAT|DISCOVERY|PING|PONG|WAKEUP|HANDOVER|COMPACT_DONE|HEALTH_CHECK)\])/i;
      if (allowlistSignalRegex.test(messageText)) {
        console.log(JSON.stringify({ decision: "allow" }));
        process.exit(0);
      }

      // Nếu không có cờ tín hiệu hoặc chat mồm dài dòng
      console.log(JSON.stringify({
        decision: "deny",
        reason: "[BLOCKED_BY_FIREWALL] Hiến pháp vi phạm (Anti Chat-Ops): Bạn đang giao việc mồm! Khi đã nạp Task vào SSOT, Trợ lý CHỈ ĐƯỢC dùng send_message để PING tức thì: [SIGNAL:NEW_TASK_ALERT] task_id=TASK-xxx. Cấm chat văn bản giải thích task làm loãng ngữ cảnh và gây ngủ đông!"
      }));
      process.exit(0);
    }

    // =========================================================================
    // GATE 3: KIỂM SOÁT run_command (CHỐNG ROLE CREEP)
    // =========================================================================
    if (toolName === 'run_command') {
      const cmd = String(toolArgs.CommandLine || '');
      const isPM = matchedRole === 'PROJECT_MANAGER' || matchedNodeId === 'NODE_02';

      if (isPM && /\b(ssh|scp|rsync|systemctl|service|pm2|docker|docker-compose|kubectl)\b/i.test(cmd)) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: "[BLOCKED_BY_FIREWALL] Hiến pháp vi phạm (Zero Role Creep): Bạn là PM. Tuyệt đối CẤM PM chạy lệnh hạ tầng trực tiếp! Hãy tạo Task giao cho Worker chuyên trách!"
        }));
        process.exit(0);
      }
    }

    console.log(JSON.stringify({ decision: "allow" }));
    process.exit(0);

  } catch (err) {
    console.log(JSON.stringify({ decision: "allow" }));
    process.exit(0);
  }
}

main();
