/**
 * ⚡ PRE-INVOCATION CONTEXT INJECTOR (ANTIGRAVITY PHYSICAL RUNTIME HOOK)
 * 
 * Vị trí kích hoạt: Tầng vật lý Antigravity IDE (Trước mỗi turn chat của mọi Tab).
 * Mục đích: 
 *   1. Tự động bơm Mỏ neo Vai trò Hiến định (No-LLM Hardware Role Anchor) 
 *      để triệt tiêu 100% căn bệnh Quên Vai Trò (Role Amnesia) và Ảo giác (Hallucination).
 *   2. Bơm trạng thái Checkpoint / Active Task để chống mất trí nhớ sau /compact.
 * 
 * KỶ LUẬT THIẾT KẾ:
 * 1. LOCAL STATE ONLY: Tuyệt đối không query MySQL từ xa qua mạng để bảo vệ độ mượt của IDE (< 3ms).
 * 2. SAFE FALLBACK: Bọc try...catch cấp cao nhất. Lỗi luôn trả về {} và exit 0 để không bao giờ đơ IDE.
 * 3. NO-LLM DETERMINISTIC: Khóa cứng vai trò bằng code logic thuần túy, không để LLM tự suy diễn.
 * 4. BOM RESILIENT: Tự động loại bỏ UTF-8 BOM (\uFEFF) trên môi trường Windows.
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
        console.log(JSON.stringify({}));
        process.exit(0);
      }
    }

    const conversationId = payload.conversationId || process.env.ANTIGRAVITY_CONVERSATION_ID || '';
    if (!conversationId) {
      console.log(JSON.stringify({}));
      process.exit(0);
    }

    // Resolve workspace root safely
    let workspaceRoot = '';
    if (Array.isArray(payload.workspacePaths) && payload.workspacePaths.length > 0) {
      workspaceRoot = payload.workspacePaths[0];
    } else {
      workspaceRoot = path.resolve(__dirname, '../../..');
    }

    // 1. Resolve role from local registry
    const registryPath = path.join(workspaceRoot, 'swarm', 'AI_SWARM_REGISTRY.json');
    let matchedNode = null;
    let matchedNodeId = null;

    const registry = readJsonSafe(registryPath);
    if (registry && registry.nodes) {
      for (const [nodeId, nodeData] of Object.entries(registry.nodes)) {
        if (nodeData.conversation_uuid && nodeData.conversation_uuid.toLowerCase() === conversationId.toLowerCase()) {
          matchedNode = nodeData;
          matchedNodeId = nodeId;
          break;
        }
      }
    }

    // If node is not registered in registry, exit quietly
    if (!matchedNode || !matchedNodeId) {
      console.log(JSON.stringify({}));
      process.exit(0);
    }

    const roleName = matchedNode.role || 'UNKNOWN_ROLE';
    const normRole = normalizeRole(roleName);
    const normNode = normalizeRole(matchedNodeId);
    const isLead = (normRole === 'LEADARCHITECTANDBA' || normRole === 'LEAD' || normNode === 'NODE01');

    // 2. Load Role Boundary Matrix (No-LLM Hardware Deterministic Anchor)
    const matrixPath = path.join(__dirname, 'role-boundary-matrix.json');
    const roleMatrix = readJsonSafe(matrixPath) || {};

    let roleDef = null;
    for (const [rKey, rVal] of Object.entries(roleMatrix)) {
      if (normalizeRole(rKey) === normRole || normalizeRole(rVal.node_id) === normNode) {
        roleDef = rVal;
        break;
      }
    }

    // 3. Scan for local checkpoint / compact anchor
    const checkpointsDir = path.join(workspaceRoot, 'swarm', 'tasks', 'checkpoints');
    let checkpointData = null;
    let checkpointFile = null;

    if (fs.existsSync(checkpointsDir)) {
      try {
        const files = fs.readdirSync(checkpointsDir);
        for (const file of files) {
          if (!file.endsWith('.json')) continue;
          const upper = file.toUpperCase();
          if (upper.includes(matchedNodeId.toUpperCase()) || 
              normalizeRole(upper).includes(normRole) ||
              (roleName === 'PROJECT_MANAGER' && upper.includes('PM'))) {
            checkpointFile = file;
            checkpointData = readJsonSafe(path.join(checkpointsDir, file));
            break;
          }
        }
      } catch (e) {
        // Ignore checkpoint read errors
      }
    }

    // 4. Scan for active task assigned to this node / role
    const activeTasksDir = path.join(workspaceRoot, 'swarm', 'tasks', 'active');
    let activeTask = null;

    if (fs.existsSync(activeTasksDir)) {
      try {
        const taskFiles = fs.readdirSync(activeTasksDir).filter(f => f.endsWith('.json'));
        for (const tf of taskFiles) {
          const tContent = readJsonSafe(path.join(activeTasksDir, tf));
          if (tContent) {
            const assigned = normalizeRole(tContent.assigned_to);
            if (assigned === normRole || assigned === normNode || 
                (normRole === 'PROJECTMANAGER' && (assigned === 'PM' || assigned === 'PROJECTMANAGER'))) {
              activeTask = tContent;
              break;
            }
          }
        }
      } catch (e) {
        // Ignore active task read errors
      }
    }

    // 5. Build physical prompt injection (ALWAYS inject for registered nodes)
    const lines = [];
    lines.push(`🚨 [NO-LLM HARDWARE ROLE ANCHOR - TURN START]`);
    lines.push(`• Định danh: ${matchedNodeId} (${roleName}) | Tab UUID: ${conversationId}`);

    if (roleDef) {
      lines.push(`• Vai trò hiến định: ${roleDef.title}`);
      lines.push(`• Ranh giới bất biến: ${roleDef.mandate}`);
      lines.push(`• Lệnh cấm tuyệt đối: ${roleDef.prohibitions}`);
      lines.push(`• Kỷ luật điều phối: ${roleDef.coordination_rule}`);
      if (roleDef.cadence_policy) {
        lines.push(`• Chính sách Cadence: ${roleDef.cadence_policy}`);
      }
    } else {
      lines.push(`• Mô tả vai trò: ${matchedNode.description || 'Theo quy định trong AI_SWARM_REGISTRY.json'}`);
    }

    // 5.1. Detect Cadence Watchdog Tick & Verify Proof-of-Audit Receipt
    const lastInput = String(payload.lastUserInput || '');
    const isCadenceTick = /CADENCE|AUTONOMOUS_CADENCE_TICK|tuần tra chiến lược/i.test(lastInput);

    if (isCadenceTick && isLead) {
      lines.push(`⏰ [CHẾ ĐỘ TUẦN TRA CHIẾN LƯỢC TỰ CHỦ (CADENCE WATCHDOG)]`);
      
      const receiptPath = path.join(checkpointsDir, 'CADENCE_INSPECTION_RECEIPT.json');
      const receipt = readJsonSafe(receiptPath);
      const isReceiptFresh = receipt && (Date.now() - (receipt.created_at_ms || Date.parse(receipt.timestamp))) < (receipt.ttl_seconds || 300) * 1000;

      if (isReceiptFresh && !receipt.consumed) {
        lines.push(`• Trạng thái Biên lai Tuần tra: HỢP LỆ (Mã: ${receipt.receipt_id} | Nonce: ${receipt.audit_nonce})`);
        lines.push(`• Đánh giá SLA SSOT: ${receipt.alarmLevel} (Tổng: ${receipt.totalTasks} | IN_PROGRESS: ${receipt.inProgressCount} | OPEN: ${receipt.openCount} | READY_FOR_AUDIT: ${receipt.readyAuditCount})`);
        lines.push(`• Phân bổ ổ nghẽn: ${JSON.stringify(receipt.workerBottlenecks || {})}`);
        lines.push(`• CHỈ THỊ HÀNH ĐỘNG BẮT BUỘC:`);
        if (receipt.alarmLevel === 'GREEN_NORMAL') {
          lines.push(`  - MỌI CHỈ SỐ ĐỀU XANH: BẮT BUỘC KẾT THÚC TURN TRONG IM LẶNG (0 token chat). CẤM chat suông làm phiền Sếp! ("No News is Good News").`);
        } else {
          lines.push(`  - PHÁT HIỆN VI PHẠM SLA (RED_ALERT): Bắt buộc gửi [SIGNAL: CADENCE_ALARM] cho PM (NODE_02), đính kèm Nonce '${receipt.audit_nonce}' để giải tỏa điểm nghẽn!`);
        }
      } else {
        lines.push(`• CẢNH BÁO: CHƯA CÓ BIÊN LAI KHẢO SÁT HỢP LỆ HOẶC BIÊN LAI ĐÃ HẾT HẠN (> 5 phút)!`);
        lines.push(`• HÀNH ĐỘNG BẮT BUỘC ĐẦU TIÊN: Bạn BẮT BUỘC phải chạy Tool Call vật lý:`);
        lines.push(`  node swarm/scripts/anti-fraud-cadence-monitor.js`);
        lines.push(`  để khảo sát CSDL SSOT và lấy mã xác thực AUDIT_NONCE trước khi đưa ra bất kỳ kết luận nào!`);
      }
    }

    if (checkpointData) {
      lines.push(`• Mỏ neo Checkpoint: [${checkpointFile}] Trạng thái: ${checkpointData.status || checkpointData.state || 'ACTIVE'}`);
      if (checkpointData.next_action) {
        lines.push(`• Nhiệm vụ kế tiếp: ${checkpointData.next_action}`);
      }
      if (checkpointData.active_task_id) {
        lines.push(`• Task ID liên kết: ${checkpointData.active_task_id}`);
      }
      if (Array.isArray(checkpointData.rejection_list) && checkpointData.rejection_list.length > 0) {
        lines.push(`• Cấm đoán từ phiên trước: ${checkpointData.rejection_list.join('; ')}`);
      }
    }

    if (activeTask) {
      lines.push(`• Task đang thực hiện: ${activeTask.task_id || activeTask.id || 'N/A'} - ${activeTask.title || activeTask.name || ''} (${activeTask.status || 'IN_PROGRESS'})`);
    }

    
    // 5.2. Mandatory MySQL Task Binding Injection (PM & Lead Physical Anchor)
    if (normRole === 'PROJECTMANAGER' || normNode === 'NODE02') {
      lines.push(`🛑 [LỆNH CẤM NHẬN VIỆC MỒM - ZERO CHAT-OPS & NO TASK NO WORK]`);
      lines.push(`• BƯỚC ĐẦU TIÊN LÀ SAI THÌ TẤT CẢ ĐỀU SAI: Bạn là PM. Bạn chỉ được phép nhận việc khi Task đã được đăng bạ chính thức trên CSDL MySQL (hdd_swarm_governance).`);
      lines.push(`• KHÔNG THẤY TASK = KHÔNG NHẬN VIỆC = KHÔNG ĐIỀU PHỐI WORKER!`);
      lines.push(`• Nếu Trợ lý/Lead gửi tin nhắn chat mồm, tạo file task ngoài luồng, bạn BẮT BUỘC TỪ CHỐI THI CÔNG NGAY với cú pháp: [REJECTED_CHAT_OPS] Lệnh này chưa có TaskID hợp lệ trên CSDL MySQL!`);
    }
    if (isLead) {
      lines.push(`🛑 [LỆNH CẤM GIAO VIỆC MỒM & TẠO FILE TASK LẬU]`);
      lines.push(`• Bạn là Trợ lý / Lead. Tuyệt đối CẤM giao việc bằng mồm qua send_message hoặc tạo file markdown ngoài luồng.`);
      lines.push(`• BƯỚC ĐẦU TIÊN BẮT BUỘC: Chạy lệnh 'node swarm/scripts/gov-client.js create-task ...' để tạo Task ID trên CSDL MySQL trước khi gửi tín hiệu cho PM!`);
    }

    lines.push(`• KỶ LUẬT THỰC THI: Tuyệt đối tuân thủ ranh giới vai trò. Nghiêm cấm Chat-Ops mồm. CẤM đọc hay phân tích mã nguồn hook/firewall!`);

    const ephemeralMessage = lines.join('\n');

    const output = {
      injectSteps: [
        {
          ephemeralMessage: ephemeralMessage
        }
      ]
    };

    console.log(JSON.stringify(output));
    process.exit(0);

  } catch (err) {
    // Supreme safe fallback: never fail or crash IDE
    console.log(JSON.stringify({}));
    process.exit(0);
  }
}

main();
