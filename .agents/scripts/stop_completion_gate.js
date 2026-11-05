/**
 * 🛑 STOP COMPLETION GATE (ANTIGRAVITY LIFECYCLE HOOK)
 * Vị trí kích hoạt: Bước 7 của Pipeline (Khi Agent định buông bút kết thúc câu trả lời).
 * Nhiệm vụ: Tịch thu quyền dừng nếu Agent nhận việc mà CHƯA TẠO TASK TRÊN MYSQL SSOT!
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
    const terminationReason = payload.terminationReason || '';

    // Chỉ kiểm soát khi Model định dừng bình thường (không gọi thêm tool)
    if (terminationReason !== 'NO_TOOL_CALL') {
      console.log(JSON.stringify({ decision: "allow" }));
      process.exit(0);
    }

    const lastUserInput = String(payload.lastUserInput || '').toLowerCase();
    const workspaceRoot = (payload.workspacePaths && payload.workspacePaths[0]) ? payload.workspacePaths[0] : path.resolve(__dirname, '../..');

    // BỎ QUA nếu là tin nhắn hệ thống (System Notification / Hook Wakeup / Loop Prevention)
    if (lastUserInput.includes('<system_message>') || lastUserInput.includes('stop hook blocked') || lastUserInput.includes('termination')) {
      console.log(JSON.stringify({ decision: "allow" }));
      process.exit(0);
    }

    const registryPath = path.join(workspaceRoot, 'swarm', 'AI_SWARM_REGISTRY.json');
    const registry = readJsonSafe(registryPath);

    // Nếu dự án chưa khởi tạo, không chặn dừng để First Agent hỏi Sếp
    if (!registry || registry.status === 'UNINITIALIZED') {
      console.log(JSON.stringify({ decision: "allow" }));
      process.exit(0);
    }

    // Nếu user đưa ra chỉ thị thực thi nhiệm vụ mới
    const isTaskDirective = /(hãy|làm|tạo|triển khai|viết|fix|sửa|deploy|cấu hình|kiểm tra|xây dựng)/i.test(lastUserInput);

    if (isTaskDirective) {
      const receiptPath = path.join(workspaceRoot, 'swarm', 'locks', 'LATEST_TASK_RECEIPT.json');
      let hasValidTaskCreated = false;

      if (fs.existsSync(receiptPath)) {
        try {
          const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
          const ageSeconds = (Date.now() - receipt.timestamp) / 1000;
          // Hiệu lực trong 1 giờ (3600s) cho một phiên làm việc
          if (ageSeconds < 3600 && receipt.task_id && receipt.task_id.startsWith('TASK-')) {
            hasValidTaskCreated = true;
          }
        } catch (e) {}
      }

      if (!hasValidTaskCreated) {
        // TỊCH THU QUYỀN DỪNG! BẮT BUỘC AGENT PHẢI TẠO TASK TRƯỚC KHI TRẢ LỜI SẾP
        console.log(JSON.stringify({
          decision: "continue",
          reason: "🛑 [STOP GATE BẺ GÃY QUYỀN DỪNG]: BƯỚC ĐẦU TIÊN LÀ SAI THÌ TẤT CẢ ĐỀU SAI! Bạn vừa nhận chỉ thị công việc nhưng CHƯA CHẠY LỆNH TẠO TASK TRÊN SSOT! Quyền kết thúc bị tịch thu. Bắt buộc phải chạy lệnh nhị phân: node .agents/skills/ssot-task-governance/scripts/gov-client.js create-task ... để đăng ký Task vào SSOT trước khi buông bút báo cáo Sếp Alex!"
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
