/**
 * 🛡️ PRE-TOOL FIREWALL (ANTIGRAVITY PHYSICAL RUNTIME HOOK)
 * 
 * Vị trí kích hoạt: Tầng vật lý Antigravity IDE (Trước khi thực thi send_message hoặc run_command).
 * Mục đích: 
 *   1. Chặn đứng Lead Usurpation (Lead vượt mặt PM để điều phối trực tiếp xuống Worker).
 *   2. Chặn đứng Chat-Ops (Giao việc mồm qua send_message không có Task ID) với Allowlist Protocols.
 *   3. Chặn đứng Role Creep (PM lấn sân gõ lệnh ssh/scp/pm2/docker hạ tầng VPS).
 *   4. Chặn đứng Downstream Push Embargo (Cấm dự án con git push lên Master Framework).
 *   5. Chặn đứng Thói quen Soi mói Framework (Ngăn chặn Agent đọc mã nguồn firewall khi bị deny).
 * 
 * KỶ LUẬT THIẾT KẾ:
 * 1. SAFE FALLBACK: Bọc try...catch cấp cao nhất. Lỗi luôn fallback trả về {"decision": "allow"} và exit 0.
 * 2. SPEED: Hoàn tất kiểm tra regex trong < 2ms, không chặn luồng IDE.
 * 3. NO-LLM CONTEXTUAL EDUCATION: Khi vi phạm, trả về Bệnh án Ranh giới cụ thể để định hướng Agent,
 *    không để Agent bị lú hay trôi dạt ngữ cảnh.
 * 4. BOM RESILIENT: Tự động xử lý UTF-8 BOM (\uFEFF) trên môi trường Windows.
 */

const fs = require('fs');
const path = require('path');

function normalizeRole(str) {
  return String(str || '').toUpperCase().replace(/^AI[-_]/, '').replace(/[-_]/g, '');
}

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
        let cleanInput = rawInput.trim();
        if (cleanInput.charCodeAt(0) === 0xFEFF) {
          cleanInput = cleanInput.slice(1);
        }
        payload = JSON.parse(cleanInput);
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

    // 1. Resolve role & nodes from local registry
    const registryPath = path.join(workspaceRoot, 'swarm', 'AI_SWARM_REGISTRY.json');
    let matchedRole = 'UNKNOWN';
    let matchedNodeId = 'UNKNOWN';
    let pmUuid = '';

    const registryData = readJsonSafe(registryPath);
    if (registryData && registryData.nodes) {
      for (const [nodeId, nodeData] of Object.entries(registryData.nodes)) {
        if (nodeData.conversation_uuid && nodeData.conversation_uuid.toLowerCase() === conversationId.toLowerCase()) {
          matchedRole = nodeData.role || '';
          matchedNodeId = nodeId;
        }
        if (nodeData.role === 'PROJECT_MANAGER' || nodeId === 'NODE_02') {
          pmUuid = nodeData.conversation_uuid || '';
        }
      }
    }

    const normRole = normalizeRole(matchedRole);
    const normNode = normalizeRole(matchedNodeId);
    const isLead = (normRole === 'LEADARCHITECTANDBA' || normRole === 'LEAD' || normNode === 'NODE01');
    const isPM = (normRole === 'PROJECTMANAGER' || normRole === 'PM' || normNode === 'NODE02');

    // =========================================================================
    // GATE A: KIỂM SOÁT `send_message` (CHỐNG LEAD USURPATION & CHAT-OPS)
    // =========================================================================
    if (toolName === 'send_message') {
      const messageText = String(toolArgs.Message || '');
      const recipientUuid = String(toolArgs.Recipient || '');

      // 1. BẢNG MIỄN TRỪ GIAO THỨC HỢP LỆ (Allowlist Protocols)
      const allowlistSignalRegex = /(\[SIGNAL:\s*[A-Z0-9_-]+\]|\[(ADMIN|SYSTEM|ACK|P2P_MESH_ACK|REJECTED_CHAT_OPS|HEARTBEAT|DISCOVERY|PING|PONG|WAKEUP|HANDOVER|COMPACT_DONE|HEALTH_CHECK)\])/i;
      if (allowlistSignalRegex.test(messageText)) {
        console.log(JSON.stringify({ decision: "allow" }));
        process.exit(0);
      }

      // 2. CHỐNG LEAD USURPATION (LEAD VƯỢT MẶT PM ĐIỀU PHỐI XUỐNG WORKER)
      if (isLead && pmUuid && recipientUuid) {
        if (recipientUuid.toLowerCase() !== pmUuid.toLowerCase()) {
          let recipientRole = 'Worker';
          let recipientNodeId = recipientUuid;
          if (registryData && registryData.nodes) {
            for (const [nId, nData] of Object.entries(registryData.nodes)) {
              if (nData.conversation_uuid && nData.conversation_uuid.toLowerCase() === recipientUuid.toLowerCase()) {
                recipientRole = nData.role || 'Worker';
                recipientNodeId = nId;
                break;
              }
            }
          }

          console.log(JSON.stringify({
            decision: "deny",
            reason: `[BLOCKED_BY_PHYSICAL_HOOK] Hiến pháp vi phạm (Lead Usurpation): Vai trò của bạn là Tổng Kiến Trúc Sư Chiến Lược (NODE_01). Tuyệt đối CẤM Lead vượt mặt PM để gửi tin nhắn điều phối trực tiếp xuống Worker (${recipientRole} - ${recipientNodeId})! Mọi chỉ đạo nghiệp vụ bắt buộc phải ủy thác cho PM (NODE_02 - UUID: ${pmUuid}) để PM điều phối theo Dây chuyền 5 Tầng. (CẢNH BÁO: CẤM đọc hay phân tích tệp hook/firewall, hãy chuyển tiếp task cho PM!)`
          }));
          process.exit(0);
        }
      }

      // 3. KIỂM TRA MÃ TASK ID TRÊN SSOT (CHỐNG CHAT-OPS)
      const taskIdRegex = /(\bTASK-[A-Z0-9_-]+\b|("task_id"\s*:)|(\btask_id\b)|(\bTASK_ID\b))/i;
      if (taskIdRegex.test(messageText)) {
        console.log(JSON.stringify({ decision: "allow" }));
        process.exit(0);
      }

      // 4. NẾU KHÔNG CÓ TASK ID VÀ KHÔNG PHẢI TÍN HIỆU MIỄN TRỪ:
      console.log(JSON.stringify({
        decision: "deny",
        reason: `[BLOCKED_BY_PHYSICAL_HOOK] Hiến pháp vi phạm (Anti Chat-Ops): Bạn đang mang vai trò ${matchedRole} (${matchedNodeId}). Nghiêm cấm giao việc mồm! Tin nhắn chỉ đạo bắt buộc phải kèm mã Task ID (TASK-xxx) đã đăng bạ trên SSOT hoặc mang cờ tín hiệu hợp lệ ([SIGNAL:...]). (CẢNH BÁO: CẤM đọc hay phân tích tệp hook/firewall, hãy tạo Task ID chính thức trên SSOT!)`
      }));
      process.exit(0);
    }

    // =========================================================================
    // GATE B: KIỂM SOÁT `run_command` (CHỐNG ROLE CREEP & SOI MÓI FRAMEWORK)
    // =========================================================================
    if (toolName === 'run_command') {
      const cmd = String(toolArgs.CommandLine || '');

      // 1. CHỐNG ROLE CREEP: PM BỊ CẤM CHẠY LỆNH HẠ TẦNG VPS
      if (isPM) {
        const vpsInfraRegex = /\b(ssh|scp|rsync|systemctl|service|pm2|docker|docker-compose|kubectl)\b/i;
        if (vpsInfraRegex.test(cmd)) {
          console.log(JSON.stringify({
            decision: "deny",
            reason: `[BLOCKED_BY_PHYSICAL_HOOK] Hiến pháp vi phạm (Zero Role Creep): Vai trò của bạn là Nhạc Trưởng Điều Phối (NODE_02). Tuyệt đối CẤM PM chạy lệnh hạ tầng VPS (${cmd.split(' ')[0]})! Hãy tạo Task chính thức giao cho VPS_INFRA_PARTNER (NODE_06)! (CẢNH BÁO: CẤM đọc hay phân tích tệp hook/firewall, hãy quay về quản trị Task Board!)`
          }));
          process.exit(0);
        }
      }

      // 2. CHỐNG SOI MÓI VÀ TÒ MÒ ĐỌC TỆP FIREWALL KHI BỊ CHẶN
      const antiSnoopRegex = /(pre-tool-firewall|pre-invocation-context|hooks\.json)/i;
      const isReadOrViewCmd = /\b(type|cat|head|tail|Get-Content|gc|more|less|grep|Select-String)\b/i;
      const isSuperMasterWorkspace = workspaceRoot.toUpperCase().includes('SUPER LEADER SWARM');

      if (antiSnoopRegex.test(cmd) && isReadOrViewCmd.test(cmd) && !isSuperMasterWorkspace) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: `[BLOCKED_BY_PHYSICAL_HOOK] Hiến pháp vi phạm (Anti Tampering): Nghiêm cấm Agent soi mói hoặc can thiệp tệp tường lửa runtime IDE! Hãy tập trung 100% vào vai trò chuyên môn của bạn!`
        }));
        process.exit(0);
      }

      // 3. CHỐNG UPSTREAM PUSH EMBARGO CHO DỰ ÁN CON
      const pushMasterRegex = /\bgit\s+push\b.*(swarm-master-ai|universal-ai-swarm-framework)/i;
      if (pushMasterRegex.test(cmd) && !isSuperMasterWorkspace) {
        console.log(JSON.stringify({
          decision: "deny",
          reason: `[BLOCKED_BY_PHYSICAL_HOOK] Hiến pháp vi phạm (Upstream Sovereignty Lock): Tác tử dự án con bị cấm tuyệt đối git push lên kho Master Framework!`
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
