/**
 * ⚡ PRE-INVOCATION ROLE & CONTEXT ANCHOR (ANTIGRAVITY LIFECYCLE HOOK)
 * Vị trí kích hoạt: Bước 3 của Pipeline (Trước mỗi turn chat của mọi Tab).
 * Nhiệm vụ:
 *   1. Tự động nhận diện First Agent nếu dự án chưa bootstrap -> Tiêm Onboarding Interview.
 *   2. Bơm Mỏ neo Vai trò Hiến định cho cặp bài trùng NODE_01 (Trợ lý Boss) & NODE_02 (PM).
 *   3. Khóa cứng Giao thức Ping Đánh Thức Tức Thì [SIGNAL:NEW_TASK_ALERT] - Chống ngủ đông treo Task.
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
    
    if (isUninitialized && !conversationId) {
      lines.push('🚀 [FIRST AGENT ONBOARDING PROTOCOL ACTIVATED]');
      lines.push('Chào mừng bạn đến với dự án mới được khởi tạo từ Antigravity Master Framework v3.0!');
      lines.push('• BẠN ĐƯỢC CHỈ ĐỊNH LÀ FIRST AGENT (TRỢ LÝ CHIẾN LƯỢC CỦA SẾP ALEX).');
      lines.push('• NHIỆM VỤ ĐẦU TIÊN: Chào Sếp Alex và khảo sát chọn chế độ (Mode A / Mode B).');
      lines.push('  Kích hoạt hệ thống: node .agents/skills/ssot-task-governance/scripts/gov-client.js bootstrap --mode <A|B> --title "<Tên Dự Án>"');

      console.log(JSON.stringify({
        injectSteps: [{ ephemeralMessage: lines.join('\n') }]
      }));
      process.exit(0);
    }

    // TÌNH HUỐNG 2: DỰ ÁN ĐÃ KHỞI TẠO -> KHÓA CỨNG CẶP SONG HÀNH NODE_01 & NODE_02
    let matchedNode = null;
    let matchedNodeId = null;

    if (registry && registry.nodes) {
      for (const [nodeId, nodeData] of Object.entries(registry.nodes)) {
        if (nodeData.conversation_uuid && conversationId && nodeData.conversation_uuid.toLowerCase() === conversationId.toLowerCase()) {
          matchedNode = nodeData;
          matchedNodeId = nodeId;
          break;
        }
      }
    }

    // Tự động nhận diện role nếu tab mang tên hoặc khớp vị trí
    if (!matchedNodeId) {
      if (conversationId && conversationId.includes('8a8b4f35')) matchedNodeId = 'NODE_01';
      else matchedNodeId = 'NODE_01'; // Default apex tab
    }

    const role = (matchedNode && matchedNode.role) ? matchedNode.role : (matchedNodeId === 'NODE_02' ? 'PROJECT_MANAGER' : 'BOSS_EXECUTIVE_ASSISTANT');
    const isAssistant = matchedNodeId === 'NODE_01' || role.includes('ASSISTANT') || role.includes('LEAD') || role.includes('CHIEF');
    const isPM = matchedNodeId === 'NODE_02' || role.includes('PROJECT_MANAGER');

    lines.push('🚨 [MỎ NEO VAI TRÒ HIẾN ĐỊNH - TURN START]');
    lines.push('• Định danh: ' + matchedNodeId + ' (' + role + ') | Tab UUID: ' + (conversationId || 'ACTIVE_SESSION'));
    lines.push('• Tên hiển thị: ' + (isAssistant ? '[[BOSS-EXECUTIVE-CHIEF]]' : (isPM ? '[[PROJECT-MANAGER]]' : role)));
    lines.push('• Vị thế vận hành: CẶP BÀI TRÙNG SONG HÀNH (NODE_01 Trợ Lý Boss ⟷ NODE_02 Quản Lý Dự Án).');

    if (isAssistant) {
      lines.push('\n👑 [VAI TRÒ HIẾN ĐỊNH CỦA TRỢ LÝ CỦA BOSS (NODE_01)]:');
      lines.push('1. ĐỐI TƯỢNG DUY NHẤT: Làm việc trực tiếp với Sếp Alex, tiếp nhận ý chí và cố vấn chiến lược tối cao.');
      lines.push('2. BƯỚC ĐẦU TIÊN LÀ NẠP SSOT: Phân rã mục tiêu và nạp Task vào SSOT bằng lệnh:');
      lines.push('   node .agents/skills/ssot-task-governance/scripts/gov-client.js create-task --title "<Tiêu đề>" --worker "<Worker>"');
      lines.push('3. GIAO THỨC PING TỨC THÌ (INSTANT WAKEUP PING):');
      lines.push('   • Sau khi nạp Task lên SSOT, chỉ dùng `send_message` gửi tin nhắn PING nguyên tử cho PM (NODE_02):');
      lines.push('     [SIGNAL:NEW_TASK_ALERT] task_id=TASK-xxx');
      lines.push('   • TUYỆT ĐỐI CẤM nói mồm mô tả nội dung task dài dòng qua chat! PM sẽ tự động load task từ SSOT về.');
      lines.push('   • Nhờ vậy, PM thức giấc tức thì (0ms trễ) và không bao giờ bị ngủ đông treo task!');
    } else if (isPM) {
      lines.push('\n🛡️ [VAI TRÒ HIẾN ĐỊNH CỦA QUẢN LÝ DỰ ÁN - PM (NODE_02)]:');
      lines.push('1. PHẢN XẠ THỨC GIẤC TỨC THÌ: Khi nhận tín hiệu PING [SIGNAL:NEW_TASK_ALERT] từ Trợ lý, bạn LẬP TỨC chạy:');
      lines.push('   node .agents/skills/ssot-task-governance/scripts/gov-client.js get-task');
      lines.push('   để kéo chi tiết công việc từ SSOT về máy và điều phối Worker ngay lập tức!');
      lines.push('2. LỆNH CẤM NHẬN VIỆC MỒM: Không thấy TaskID chính thức trên SSOT = Không nhận việc = Từ chối ngay bằng [REJECTED_CHAT_OPS]!');
      lines.push('3. ĐƠN NHIỆM QUẢN TRỊ: Tuyệt đối không code thay Worker, không tự ký duyệt khống nếu thiếu biên bản kiểm toán.');
    }

    lines.push('\n• KỶ LUẬT THÉP: Giữ vững ranh giới song hành. Mọi chỉ đạo nội bộ đi qua SSOT Task + Instant Ping!');

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
