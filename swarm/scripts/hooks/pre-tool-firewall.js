/**
 * 🛡️ PRE-TOOL FIREWALL (ANTIGRAVITY PHYSICAL RUNTIME HOOK)
 * 
 * Vị trí kích hoạt: Tầng vật lý Antigravity IDE (Trước khi thực thi send_message hoặc run_command).
 * Mục đích: 
 *   1. Chặn đứng Chat-Ops (Giao việc mồm qua send_message không có Task ID)
 *      nhưng CÓ BẢNG MIỄN TRỪ (Allowlist Protocols) cho tín hiệu Mesh/Ping/Heartbeat.
 *   2. Chặn đứng Role Creep (PM lấn sân gõ lệnh ssh/scp/pm2/docker hạ tầng VPS).
 *   3. Chặn đứng Downstream Push Embargo (Cấm dự án con git push lên Master Framework).
 * 
 * KỶ LUẬT THIẾT KẾ:
 * 1. SAFE FALLBACK: Bọc try...catch cấp cao nhất. Lỗi luôn fallback trả về {"decision": "allow"} và exit 0.
 * 2. SPEED: Hoàn tất kiểm tra regex trong < 2ms, không chặn luồng IDE.
 */

const fs = require('fs');
const path = require('path');

function normalizeRole(str) {
  return String(str || '').toUpperCase().replace(/^AI[-_]/, '').replace(/[-_]/g, '');
}

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => { resolve(data); });
    setTimeout(() => resolve(data), 500);
  });
}

async function main() {
  try {
    const rawInput = await readStdin();
    let payload = {};
    if (rawInput && rawInput.trim()) {
      try {
        payload = JSON.parse(rawInput);
      } catch (e) {
        console.log(JSON.stringify({ decision: "allow" }));
        process.exit(0);
      }
    }

    const toolCall = payload.toolCall || {};
    const toolName = toolCall.name || '';
    const toolArgs = toolCall.args || {};
    const conversationId = payload.conversationId || process.env.ANTIGRAVITY_CONVERSATION_ID || '';

    // Resolve workspace root safely
    let workspaceRoot = '';
    if (Array.isArray(payload.workspacePaths) && payload.workspacePaths.length > 0) {
      workspaceRoot = payload.workspacePaths[0];
    } else {
      workspaceRoot = path.resolve(__dirname, '../../..');
    }

    // Resolve role from local registry
    const registryPath = path.join(workspaceRoot, 'swarm', 'AI_SWARM_REGISTRY.json');
    let matchedRole = 'UNKNOWN';
    let matchedNodeId = 'UNKNOWN';

    if (fs.existsSync(registryPath)) {
      try {
        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        if (registry && registry.nodes) {
          for (const [nodeId, nodeData] of Object.entries(registry.nodes)) {
            if (nodeData.conversation_uuid && nodeData.conversation_uuid.toLowerCase() === conversationId.toLowerCase()) {
              matchedRole = nodeData.role || '';
              matchedNodeId = nodeId;
              break;
            }
          }
        }
      } catch (e) {
        // Ignore registry read error
      }
    }

    const normRole = normalizeRole(matchedRole);
    const normNode = normalizeRole(matchedNodeId);
    const isPM = (normRole === 'PROJECTMANAGER' || normRole === 'PM' || normNode === 'NODE02');

    // =========================================================================
    // GATE A: KIỂM SOÁT `send_message` (CHỐNG CHAT-OPS & BẢO VỆ TÍN HIỆU MESH)
    // =========================================================================
    if (toolName === 'send_message') {
      const messageText = String(toolArgs.Message || '');

      // 1. BẢNG MIỄN TRỪ GIAO THỨC HỢP LỆ (Allowlist Protocols)
      // Cho phép tin nhắn mang cờ tín hiệu Swarm, kiểm tra sức khỏe, heartbeat, ping, ack
      const allowlistSignalRegex = /(\[SIGNAL:\s*[A-Z0-9_-]+\]|\[(ADMIN|SYSTEM|ACK|P2P_MESH_ACK|REJECTED_CHAT_OPS|HEARTBEAT|DISCOVERY|PING|PONG|WAKEUP|HANDOVER|COMPACT_DONE|HEALTH_CHECK)\])/i;
      if (allowlistSignalRegex.test(messageText)) {
        console.log(JSON.stringify({ decision: "allow" }));
        process.exit(0);
      }

      // 2. KIỂM TRA MÃ TASK ID TRÊN SSOT
      // Tin nhắn hợp lệ phải chứa mã TASK-xxx hoặc trường task_id
      const taskIdRegex = /(\bTASK-[A-Z0-9_-]+\b|("task_id"\s*:)|(\btask_id\b)|(\bTASK_ID\b))/i;
      if (taskIdRegex.test(messageText)) {
        console.log(JSON.stringify({ decision: "allow" }));
        process.exit(0);
      }

      // 3. NẾU KHÔNG CÓ TASK ID VÀ KHÔNG PHẢI TÍN HIỆU MIỄN TRỪ:
      // Chặn đứng hành vi giao việc mồm (Anti Chat-Ops)
      console.log(JSON.stringify({
        decision: "deny",
        reason: "[BLOCKED_BY_PHYSICAL_HOOK] Hiến pháp vi phạm (Anti Chat-Ops): Nghiêm cấm giao việc mồm! Tin nhắn chỉ đạo bắt buộc phải kèm mã Task ID (TASK-xxx) đã đăng bạ trên SSOT hoặc mang cờ tín hiệu hợp lệ ([SIGNAL:...])."
      }));
      process.exit(0);
    }

    // =========================================================================
    // GATE B: KIỂM SOÁT `run_command` (CHỐNG ROLE CREEP & UPSTREAM EMBARGO)
    // =========================================================================
    if (toolName === 'run_command') {
      const cmd = String(toolArgs.CommandLine || '');

      // 1. CHỐNG ROLE CREEP: PM BỊ CẤM CHẠY LỆNH HẠ TẦNG VPS
      if (isPM) {
        const vpsInfraRegex = /\b(ssh|scp|rsync|systemctl|service|pm2|docker|docker-compose|kubectl)\b/i;
        if (vpsInfraRegex.test(cmd)) {
          console.log(JSON.stringify({
            decision: "deny",
            reason: "[BLOCKED_BY_PHYSICAL_HOOK] Hiến pháp vi phạm (Zero Role Creep): Role PM tuyệt đối bị cấm chạy lệnh hạ tầng VPS (ssh/scp/pm2/systemctl/docker). Hãy tạo Task chính thức giao cho VPS_INFRA_PARTNER!"
          }));
          process.exit(0);
        }
      }

      // 2. CHỐNG UPSTREAM PUSH EMBARGO CHO DỰ ÁN CON
      // Kiểm tra xem lệnh có phải git push lên các repo master không
      const pushMasterRegex = /\bgit\s+push\b.*(swarm-master-ai|universal-ai-swarm-framework)/i;
      const isSuperMasterWorkspace = workspaceRoot.toUpperCase().includes('SUPER LEADER SWARM');
      
      if (pushMasterRegex.test(cmd) && !isSuperMasterWorkspace) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: "[BLOCKED_BY_PHYSICAL_HOOK] Hiến pháp vi phạm (Upstream Sovereignty Lock): Tác tử dự án con bị cấm tuyệt đối git push lên kho Master Framework!"
        }));
        process.exit(0);
      }

      // Default allow for valid commands
      console.log(JSON.stringify({ decision: "allow" }));
      process.exit(0);
    }

    // Default allow for any other tools
    console.log(JSON.stringify({ decision: "allow" }));
    process.exit(0);

  } catch (err) {
    // Supreme safe fallback: never fail or freeze IDE
    console.log(JSON.stringify({ decision: "allow" }));
    process.exit(0);
  }
}

main();
