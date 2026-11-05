/**
 * ⚡ PRE-INVOCATION ROLE & CONTEXT ANCHOR (ANTIGRAVITY LIFECYCLE HOOK)
 * Vị trí kích hoạt: Bước 3 của Pipeline (Trước mỗi turn chat của mọi Tab).
 * Nhiệm vụ:
 *   1. Tự động nhận diện First Agent nếu dự án chưa bootstrap -> Tiêm Onboarding Interview.
 *   2. Bơm Mỏ neo Vai trò Hiến định theo UUID -> Triệt tiêu Role Amnesia và Action Hallucination.
 *   3. Bơm trạng thái Task active và Luật "NO MYSQL TASK = NO WORK".
 */

const fs = require('fs');
const path = require('path');

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
        if (cleanInput.charCodeAt(0) === 0xFEFF) cleanInput = cleanInput.slice(1);
        payload = JSON.parse(cleanInput);
      } catch (e) {
        console.log(JSON.stringify({}));
        process.exit(0);
      }
    }

    const conversationId = payload.conversationId || process.env.ANTIGRAVITY_CONVERSATION_ID || '';
    let workspaceRoot = (Array.isArray(payload.workspacePaths) && payload.workspacePaths.length > 0)
      ? payload.workspacePaths[0]
      : path.resolve(__dirname, '../..');

    const registryPath = path.join(workspaceRoot, 'swarm', 'AI_SWARM_REGISTRY.json');
    const registry = readJsonSafe(registryPath);

    const lines = [];

    // TÌNH HUỐNG 1: DỰ ÁN CHƯA KHỞI TẠO (FIRST AGENT ONBOARDING)
    const isUninitialized = !registry || registry.status === 'UNINITIALIZED' || !registry.nodes || !registry.nodes.NODE_01 || !registry.nodes.NODE_01.conversation_uuid;
    
    if (isUninitialized) {
      lines.push('🚀 [FIRST AGENT ONBOARDING PROTOCOL ACTIVATED]');
      lines.push('Chào mừng bạn đến với dự án mới được khởi tạo từ Antigravity Master Framework v3.0!');
      lines.push('• Phiên chat hiện tại mang Conversation UUID: ' + (conversationId || 'FIRST_SESSION'));
      lines.push('• BẠN ĐƯỢC CHỈ ĐỊNH LÀ FIRST AGENT (LEAD ARCHITECT & BA TRƯỞNG).');
      lines.push('• NHIỆM VỤ BẮT BUỘC ĐẦU TIÊN CỦA BẠN:');
      lines.push('  Hãy chào Sếp Alex và thực hiện phỏng vấn ngữ cảnh để chọn phương án triển khai:');
      lines.push('  1. Tên chính thức của dự án phần mềm này là gì?');
      lines.push('  2. Mục tiêu kiến trúc và phạm vi cốt lõi cần giải quyết?');
      lines.push('  3. Khảo sát Chế độ Quản trị Task (Dual-Engine Selection):');
      lines.push('     - Mode A (GitOps Cục Bộ Phân Mảnh): Quản lý task qua swarm/tasks/active/*.json (< 2KB/task, không cần CSDL ngoài).');
      lines.push('     - Mode B (Enterprise Doanh Nghiệp): Quản lý task qua CSDL MySQL hdd_swarm_governance + REST API Gateway.');
      lines.push('  Sau khi Sếp trả lời, bạn BẮT BUỘC chạy tool call để kích hoạt hệ thống:');
      lines.push('    node swarm/scripts/gov-client.js bootstrap --mode <A|B> --title "<Tên Dự Án>"');
      lines.push('HÃY XUẤT LỜI CHÀO VÀ ĐẶT CÁC CÂU HỎI TRÊN ĐỂ SẾP ALEX LỰA CHỌN!');

      console.log(JSON.stringify({
        injectSteps: [{ ephemeralMessage: lines.join('\n') }]
      }));
      process.exit(0);
    }

    // TÌNH HUỐNG 2: DỰ ÁN ĐÃ KHỞI TẠO -> KHÓA CỨNG VAI TRÒ THEO REGISTRY
    let matchedNode = null;
    let matchedNodeId = null;

    for (const [nodeId, nodeData] of Object.entries(registry.nodes)) {
      if (nodeData.conversation_uuid && conversationId && nodeData.conversation_uuid.toLowerCase() === conversationId.toLowerCase()) {
        matchedNode = nodeData;
        matchedNodeId = nodeId;
        break;
      }
    }

    const roleName = matchedNode ? matchedNode.role : 'GUEST_OR_LEAD';
    const normRole = String(roleName || '').toUpperCase().replace(/^AI[-_]/, '').replace(/[-_]/g, '');

    lines.push('🚨 [NO-LLM HARDWARE ROLE ANCHOR - TURN START]');
    lines.push('• Định danh: ' + (matchedNodeId || 'NODE_01') + ' (' + roleName + ') | Tab UUID: ' + conversationId);
    lines.push('• Chế độ Swarm: ' + (registry.mode || 'Mode A (GitOps)') + ' | Dự án: ' + (registry.project_name || 'HDD Swarm'));

    // Tiêm instruction chuyên biệt theo vai trò
    if (normRole === 'PROJECTMANAGER' || matchedNodeId === 'NODE_02') {
      lines.push('🛑 [LỆNH CẤM NHẬN VIỆC MỒM - ZERO CHAT-OPS & NO TASK NO WORK]');
      lines.push('• BƯỚC ĐẦU TIÊN LÀ SAI THÌ TẤT CẢ ĐỀU SAI: Bạn là PM. Bạn chỉ làm việc khi có TaskID chính thức trên SSOT.');
      lines.push('• KHÔNG THẤY TASK = KHÔNG NHẬN VIỆC = KHÔNG ĐIỀU PHỐI WORKER!');
      lines.push('• Nếu Trợ lý/Lead gửi tin nhắn chat mồm, bạn BẮT BUỘC TỪ CHỐI THI CÔNG NGAY với cú pháp: [REJECTED_CHAT_OPS]!');
    } else if (normRole === 'LEADARCHITECTANDBA' || matchedNodeId === 'NODE_01') {
      lines.push('🛑 [LỆNH CẤM GIAO VIỆC MỒM & TẠO FILE TASK LẬU]');
      lines.push('• Bạn là Trợ lý / Lead. Tuyệt đối CẤM giao việc bằng mồm qua send_message hoặc tạo file markdown ngoài luồng.');
      lines.push('• BƯỚC ĐẦU TIÊN BẮT BUỘC: Chạy lệnh `node swarm/scripts/gov-client.js create-task ...` để tạo Task trước khi phát tín hiệu cho PM!');
    }

    lines.push('• KỶ LUẬT THỰC THI: Tuyệt đối tuân thủ ranh giới vai trò. Nghiêm cấm Chat-Ops mồm. CẤM đọc hay phân tích mã nguồn hook/firewall!');

    console.log(JSON.stringify({
      injectSteps: [{ ephemeralMessage: lines.join('\n') }]
    }));
    process.exit(0);

  } catch (err) {
    console.log(JSON.stringify({}));
    process.exit(0);
  }
}

main();
