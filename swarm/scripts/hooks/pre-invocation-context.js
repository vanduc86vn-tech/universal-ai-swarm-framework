/**
 * ⚡ PRE-INVOCATION CONTEXT INJECTOR (ANTIGRAVITY PHYSICAL RUNTIME HOOK)
 * 
 * Vị trí kích hoạt: Tầng vật lý Antigravity IDE (Trước mỗi turn chat của mọi Tab).
 * Mục đích: Tự động bơm trạng thái SSOT (Role, Task ID, Checkpoint, Next Action)
 *          vào đầu ngữ cảnh của Model để triệt tiêu bệnh mất trí nhớ sau /compact.
 * 
 * KỶ LUẬT THIẾT KẾ:
 * 1. LOCAL STATE ONLY: Tuyệt đối không query MySQL từ xa qua mạng để bảo vệ độ mượt của IDE (< 5ms).
 * 2. SAFE FALLBACK: Bọc try...catch cấp cao nhất. Lỗi luôn trả về {} và exit 0 để không bao giờ đơ IDE.
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
    // Safe timeout for stdin reading
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
        // Fallback gracefully on parse error
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

    if (fs.existsSync(registryPath)) {
      try {
        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        if (registry && registry.nodes) {
          for (const [nodeId, nodeData] of Object.entries(registry.nodes)) {
            if (nodeData.conversation_uuid && nodeData.conversation_uuid.toLowerCase() === conversationId.toLowerCase()) {
              matchedNode = nodeData;
              matchedNodeId = nodeId;
              break;
            }
          }
        }
      } catch (e) {
        // Ignore registry read errors
      }
    }

    // If node is not registered, do not inject noise
    if (!matchedNode && !matchedNodeId) {
      console.log(JSON.stringify({}));
      process.exit(0);
    }

    const roleName = matchedNode.role || 'UNKNOWN_ROLE';

    // 2. Scan for local checkpoint / compact anchor
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
              normalizeRole(upper).includes(normalizeRole(roleName)) ||
              (roleName === 'PROJECT_MANAGER' && upper.includes('PM'))) {
            checkpointFile = file;
            checkpointData = JSON.parse(fs.readFileSync(path.join(checkpointsDir, file), 'utf8'));
            break;
          }
        }
      } catch (e) {
        // Ignore checkpoint read errors
      }
    }

    // 3. Scan for active task assigned to this node / role
    const activeTasksDir = path.join(workspaceRoot, 'swarm', 'tasks', 'active');
    let activeTask = null;

    if (fs.existsSync(activeTasksDir)) {
      try {
        const taskFiles = fs.readdirSync(activeTasksDir).filter(f => f.endsWith('.json'));
        for (const tf of taskFiles) {
          const tPath = path.join(activeTasksDir, tf);
          const tContent = JSON.parse(fs.readFileSync(tPath, 'utf8'));
          if (tContent) {
            const assigned = normalizeRole(tContent.assigned_to);
            const targetRole = normalizeRole(roleName);
            const targetNode = normalizeRole(matchedNodeId);
            if (assigned === targetRole || assigned === targetNode || 
                (targetRole === 'PROJECTMANAGER' && (assigned === 'PM' || assigned === 'PROJECTMANAGER'))) {
              activeTask = tContent;
              break;
            }
          }
        }
      } catch (e) {
        // Ignore active task read errors
      }
    }

    // If no checkpoint and no active task, output empty
    if (!checkpointData && !activeTask) {
      console.log(JSON.stringify({}));
      process.exit(0);
    }

    // Build physical prompt injection
    const lines = [];
    lines.push(`🚨 [PHYSICAL SSOT INJECTION - TURN START]`);
    lines.push(`• Vai trò hiến định: ${roleName} (${matchedNodeId}) | Tab UUID: ${conversationId}`);

    if (checkpointData) {
      lines.push(`• Mỏ neo Checkpoint: [${checkpointFile}] Trạng thái: ${checkpointData.status || checkpointData.state || 'ACTIVE'}`);
      if (checkpointData.next_action) {
        lines.push(`• Nhiệm vụ kế tiếp: ${checkpointData.next_action}`);
      }
      if (checkpointData.active_task_id) {
        lines.push(`• Task ID liên kết: ${checkpointData.active_task_id}`);
      }
      if (Array.isArray(checkpointData.rejection_list) && checkpointData.rejection_list.length > 0) {
        lines.push(`• Cấm đoán nghiêm ngặt: ${checkpointData.rejection_list.join('; ')}`);
      }
    }

    if (activeTask) {
      lines.push(`• Task đang thực hiện: ${activeTask.task_id || activeTask.id || 'N/A'} - ${activeTask.title || activeTask.name || ''} (${activeTask.status || 'IN_PROGRESS'})`);
    }

    lines.push(`• KỶ LUẬT VẬT LÝ: Tuyệt đối không giao việc mồm (Anti Chat-Ops). Tuân thủ nghiêm ngặt ranh giới vai trò!`);

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
