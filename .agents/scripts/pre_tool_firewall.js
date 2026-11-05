/**
 * 🛡️ PRE-TOOL PHYSICAL FIREWALL (ANTIGRAVITY LIFECYCLE HOOK)
 * Vị trí kích hoạt: Bước 5 của Pipeline (Trước mọi tool call).
 * Nhiệm vụ Cưỡng Chế Vật Lý:
 *   1. GATE 1: Chặn tạo file rác (.bak, .tmp, TODO.md) và bảo vệ đề thi test_oracle_invariants.py.
 *   2. GATE 2: Chặn chat-ops & Phân luồng Giao tiếp:
 *      - Giao tiếp Nội bộ: CHỈ cho phép PING ngắt nguyên tử <= 200 ký tự dạng [SIGNAL:...].
 *        CẤM TUYỆT ĐỐI văn tả cảnh, giải thích task mồm qua send_message!
 *      - Giao tiếp Liên dự án: CẤM dùng send_message gửi ra ngoài Workspace (chống Sandbox Trap).
 *   3. GATE 3: Chặn Role Creep (PM cấm gõ lệnh hạ tầng SSH/PM2/docker).
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
    const internalUuids = new Set();

    if (registry && registry.nodes) {
      for (const [nodeId, nodeData] of Object.entries(registry.nodes)) {
        if (nodeData.conversation_uuid) {
          internalUuids.add(nodeData.conversation_uuid.toLowerCase());
          if (conversationId && nodeData.conversation_uuid.toLowerCase() === conversationId.toLowerCase()) {
            matchedRole = nodeData.role || '';
            matchedNodeId = nodeId;
          }
        }
      }
    }

    // =========================================================================
    // GATE 1: KIỂM SOÁT THAO TÁC FILE (CHỐNG FILE RÁC & BẢO VỆ ĐỀ THI)
    // =========================================================================
    if (['write_file', 'edit_file', 'replace_file_content', 'write_to_file', 'multi_replace_file_content'].includes(toolName)) {
      const targetPath = String(toolArgs.Path || toolArgs.path || '').replace(/\\/g, '/');
      const baseName = path.basename(targetPath).toLowerCase();

      // 1.1. Chặn sửa đề thi test_oracle_invariants.py
      if (targetPath.includes('test_oracle_invariants.py')) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: "[BLOCKED_BY_FIREWALL] ĐỀ THI ĐÃ ĐÓNG BĂNG! Bạn không được phép sửa tệp tests/test_oracle_invariants.py để gian lận. Hãy quay về sửa logic mã nguồn trong src/hdd_core/ để pass test!"
        }));
        process.exit(0);
      }

      // 1.2. Chặn file rác .bak, .tmp, _old
      if (/(\.bak\d*|\.tmp|_old|\.bk)$/i.test(baseName)) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: "[BLOCKED_BY_FIREWALL] LỆNH CẤM FILE RÁC: Tuyệt đối không sinh file rác sao lưu tạm thời (" + baseName + ")! Hãy thao tác trực tiếp trên file gốc."
        }));
        process.exit(0);
      }

      // 1.3. Chặn file task mồm (TODO.md, PENDING_TASKS.txt)
      if (/^(todo|task_todo|pending_tasks|tasks)\.(md|txt)$/i.test(baseName)) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: "[BLOCKED_BY_FIREWALL] LỆNH CẤM GIAO TASK QUA FILE MỒM: Bước đầu tiên là sai thì tất cả đều sai! Mọi công việc phải được tạo và cấp TaskID chính thức trên SSOT qua lệnh 'node .agents/skills/ssot-task-governance/scripts/gov-client.js create-task'. Cấm tạo " + baseName + "!"
        }));
        process.exit(0);
      }
    }

    // =========================================================================
    // GATE 2: KIỂM SOÁT send_message (GIAO THỨC P2P NỘI BỘ VS LIÊN DỰ ÁN)
    // =========================================================================
    if (toolName === 'send_message') {
      const messageText = String(toolArgs.Message || '').trim();
      const recipientUuid = String(toolArgs.Recipient || '').trim().toLowerCase();

      // 2.1. CHẶN GIAO TIẾP LIÊN DỰ ÁN QUA send_message (CHỐNG SANDBOX TRAP)
      // Nếu recipientUuid không nằm trong danh bạ nội bộ đã đăng bạ
      if (recipientUuid && internalUuids.size > 0 && !internalUuids.has(recipientUuid)) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: "[BLOCKED_BY_PHYSICAL_HOOK] VI PHẠM RANH GIỚI WORKSPACE: Recipient '" + recipientUuid + "' không thuộc không gian nội bộ của dự án này! Antigravity IDE cô lập Sandbox giữa các Workspace. Giao tiếp liên dự án BẮT BUỘC phải dùng Federated Bridge (REST API / Git Mailbox), tuyệt đối CẤM dùng send_message xuyên dự án!"
        }));
        process.exit(0);
      }

      // 2.2. VAN CHẶN VẬT LÝ ANTI-VERBOSE (CẤM VIẾT VĂN TẢ CẢNH LÀM TRÔI NGỮ CẢNH)
      // Giới hạn độ dài tối đa 200 ký tự cho mọi tin nhắn P2P nội bộ
      if (messageText.length > 200) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: "[BLOCKED_BY_PHYSICAL_HOOK] VI PHẠM NGUYÊN TẮC ZERO-NOISE P2P INTERRUPT: Tin nhắn quá dài (" + messageText.length + " ký tự > 200 ký tự)! Bạn đang viết văn tả cảnh làm loãng ngữ cảnh. Giao tiếp nội bộ CHỈ ĐƯỢC gửi Ping ngắt siêu nhẹ dạng '[SIGNAL:NEW_TASK_ALERT] task_id=TASK-xxx' để đối tác tự kéo task từ SSOT về! Tuyệt đối CẤM diễn giải nhiệm vụ trong send_message!"
        }));
        process.exit(0);
      }

      // 2.3. BẮT BUỘC PHẢI ĐÚNG ĐỊNH DẠNG TÍN HIỆU NGẮT NGUYÊN TỬ
      const validPingRegex = /^\[SIGNAL:\s*[A-Z0-9_-]+\](\s*(task_id\s*=|TASK-)[A-Z0-9_-]+)?/i;
      const isSystemSignal = /^\[(ADMIN|SYSTEM|ACK|P2P_MESH_ACK|REJECTED_CHAT_OPS|HEARTBEAT|DISCOVERY|PING|PONG|WAKEUP|HANDOVER|COMPACT_DONE|HEALTH_CHECK)\]/i.test(messageText);

      if (!validPingRegex.test(messageText) && !isSystemSignal) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: "[BLOCKED_BY_PHYSICAL_HOOK] CÚ PHÁP PING KHÔNG HỢP LỆ: Tin nhắn ngắt nội bộ bắt buộc phải có cờ tín hiệu nguyên tử '[SIGNAL:NEW_TASK_ALERT] task_id=TASK-xxx' hoặc các cờ hệ thống hợp lệ! Cấm chat văn bản mồm ngoài luồng."
        }));
        process.exit(0);
      }

      console.log(JSON.stringify({ decision: "allow" }));
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
