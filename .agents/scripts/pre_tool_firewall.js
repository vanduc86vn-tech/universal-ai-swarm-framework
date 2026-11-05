/**
 * 🛡️ PRE-TOOL PHYSICAL FIREWALL (ANTIGRAVITY LIFECYCLE HOOK)
 * Vị trí kích hoạt: Bước 5 của Pipeline (Trước khi thực thi toolCall).
 * Nhiệm vụ:
 *   1. Chặn tạo file rác (.bak, .tmp, _old) và file task mồm (TODO.md, PENDING_TASKS.txt).
 *   2. Chặn Chat-Ops trên send_message nếu tin nhắn không chứa mã TaskID SSOT.
 *   3. Chặn Role Creep: PM cấm gõ lệnh hạ tầng SSH/SCP/PM2/docker.
 *   4. Chặn Upstream Push Embargo đối với dự án con.
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

    const isPM = matchedRole === 'PROJECT_MANAGER' || matchedNodeId === 'NODE_02';
    const isLead = matchedRole === 'LEAD_ARCHITECT_AND_BA' || matchedNodeId === 'NODE_01';

    // =========================================================================
    // GATE 1: KIỂM SOÁT THAO TÁC FILE (CHỐNG FILE RÁC & TASK MỒM)
    // =========================================================================
    if (['write_file', 'edit_file', 'replace_file_content', 'write_to_file'].includes(toolName)) {
      const targetPath = String(toolArgs.Path || toolArgs.path || '');
      const baseName = path.basename(targetPath).toLowerCase();

      // 1.1. Chặn file rác (.bak, .tmp, _old)
      if (/(\.bak\d*|\.tmp|_old|\.bk)$/i.test(baseName)) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: "[BLOCKED_BY_FIREWALL] LỆNH CẤM FILE RÁC: Tuyệt đối không sinh file rác sao lưu tạm thời (" + baseName + ")! Hãy thao tác trực tiếp trên file gốc."
        }));
        process.exit(0);
      }

      // 1.2. Chặn tạo file task mồm (TODO.md, PENDING_TASKS.txt)
      if (/^(todo|task_todo|pending_tasks|tasks)\.(md|txt)$/i.test(baseName)) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: "[BLOCKED_BY_FIREWALL] LỆNH CẤM GIAO TASK QUA FILE MỒM: Bước đầu tiên là sai thì tất cả đều sai! Mọi công việc phải được tạo và cấp TaskID chính thức trên SSOT (qua lệnh 'node swarm/scripts/gov-client.js create-task') hoặc tệp Partitioned chuẩn (swarm/tasks/active/TASK-xxx.json). Cấm tự tạo " + baseName + "!"
        }));
        process.exit(0);
      }
    }

    // =========================================================================
    // GATE 2: KIỂM SOÁT `send_message` (CHỐNG CHAT-OPS GIAO VIỆC MỒM)
    // =========================================================================
    if (toolName === 'send_message') {
      const messageText = String(toolArgs.Message || '');
      const recipientUuid = String(toolArgs.Recipient || '');

      // Allowlist tín hiệu giao thức
      const allowlistSignalRegex = /(\[SIGNAL:\s*[A-Z0-9_-]+\]|\[(ADMIN|SYSTEM|ACK|P2P_MESH_ACK|REJECTED_CHAT_OPS|HEARTBEAT|DISCOVERY|PING|PONG|WAKEUP|HANDOVER|COMPACT_DONE|HEALTH_CHECK)\])/i;
      if (allowlistSignalRegex.test(messageText)) {
        console.log(JSON.stringify({ decision: "allow" }));
        process.exit(0);
      }

      // Chặn Lead vượt mặt PM điều phối trực tiếp xuống Worker
      if (isLead && pmUuid && recipientUuid && recipientUuid.toLowerCase() !== pmUuid.toLowerCase()) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: "[BLOCKED_BY_FIREWALL] Hiến pháp vi phạm (Lead Usurpation): Bạn là Lead Architect. Tuyệt đối CẤM gửi tin nhắn điều phối trực tiếp xuống Worker! Mọi chỉ đạo phải gửi tới PM (NODE_02 - UUID: " + pmUuid + ") kèm TaskID hợp lệ!"
        }));
        process.exit(0);
      }

      // Bắt buộc phải có mã TaskID
      const taskIdRegex = /(\bTASK-[A-Z0-9_-]+\b|("task_id"\s*:)|(\btask_id\b)|(\bTASK_ID\b))/i;
      if (taskIdRegex.test(messageText)) {
        console.log(JSON.stringify({ decision: "allow" }));
        process.exit(0);
      }

      console.log(JSON.stringify({
        decision: "deny",
        reason: "[BLOCKED_BY_FIREWALL] Hiến pháp vi phạm (Anti Chat-Ops): Bạn đang giao việc mồm! Bước đầu tiên là sai thì tất cả đều sai. Tin nhắn chỉ đạo bắt buộc phải kèm mã Task ID (TASK-xxx) đã đăng bạ trên SSOT hoặc mang cờ tín hiệu hợp lệ ([SIGNAL:...])!"
      }));
      process.exit(0);
    }

    // =========================================================================
    // GATE 3: KIỂM SOÁT `run_command` (CHỐNG ROLE CREEP & UPSTREAM PUSH)
    // =========================================================================
    if (toolName === 'run_command') {
      const cmd = String(toolArgs.CommandLine || '');

      // PM cấm chạy lệnh hạ tầng VPS
      if (isPM && /\b(ssh|scp|rsync|systemctl|service|pm2|docker|docker-compose|kubectl)\b/i.test(cmd)) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: "[BLOCKED_BY_FIREWALL] Hiến pháp vi phạm (Zero Role Creep): Bạn là PM. Tuyệt đối CẤM PM chạy lệnh hạ tầng VPS (" + cmd.split(' ')[0] + ")! Hãy tạo Task giao cho VPS_INFRA_PARTNER!"
        }));
        process.exit(0);
      }

      // Chặn dự án con git push lên master framework
      const isSuperMaster = workspaceRoot.toUpperCase().includes('SUPER LEADER SWARM');
      if (!isSuperMaster && /\bgit\s+push\b.*(swarm-master-ai|universal-ai-swarm-framework)/i.test(cmd)) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: "[BLOCKED_BY_FIREWALL] Hiến pháp vi phạm (Upstream Sovereignty Lock): Tác tử dự án con bị cấm tuyệt đối git push lên kho Master Framework!"
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
