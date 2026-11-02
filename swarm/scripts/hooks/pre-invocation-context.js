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
    } else {
      lines.push(`• Mô tả vai trò: ${matchedNode.description || 'Theo quy định trong AI_SWARM_REGISTRY.json'}`);
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
