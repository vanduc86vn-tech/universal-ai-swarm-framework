#!/usr/bin/env node

/**
 * ============================================================================
 * UNIVERSAL AI SWARM FRAMEWORK - DOCTOR REFACTOR INJECTION ENGINE
 * File: swarm/scripts/doctor-refactor-inject.js
 * ============================================================================
 * Chức năng:
 *  Tự động bọc bộ khung quản trị Antigravity Native (AGENTS.md, .agents/, swarm/)
 *  vào bất kỳ dự án cũ nào (Brownfield Project) mà không làm hỏng code hiện hữu.
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourceRootDir = path.resolve(__dirname, '../../');

// 1. Phân tích tham số dòng lệnh
const args = process.argv.slice(2);
let targetDir = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--target' && args[i + 1]) {
    targetDir = path.resolve(args[++i]);
  } else if (args[i].startsWith('--target=')) {
    targetDir = path.resolve(args[i].split('=')[1]);
  } else if (!args[i].startsWith('--') && !targetDir) {
    targetDir = path.resolve(args[i]);
  }
}

if (!targetDir) {
  console.error('❌ [LỖI THIẾU THAM SỐ]: Cần chỉ định thư mục dự án mục tiêu.');
  console.log('Cách sử dụng:');
  console.log('  node swarm/scripts/doctor-refactor-inject.js --target <ĐƯỜNG_DẪN_DỰ_ÁN_CŨ>');
  console.log('Ví dụ:');
  console.log('  node swarm/scripts/doctor-refactor-inject.js --target C:/Projects/AI-Warm/HDD-AI-ERP');
  process.exit(1);
}

if (!fs.existsSync(targetDir)) {
  console.error(`❌ [LỖI ĐƯỜNG DẪN]: Thư mục mục tiêu không tồn tại: ${targetDir}`);
  process.exit(1);
}

console.log('==================================================================');
console.log('🩺  ANTIGRAVITY DOCTOR REFACTOR INJECTION ENGINE');
console.log('==================================================================');
console.log(`📁 Thư mục nguồn Master : ${sourceRootDir}`);
console.log(`🎯 Thư mục mục tiêu      : ${targetDir}`);
console.log('------------------------------------------------------------------\n');

// 2. Tiền kiểm không xâm lấn (Non-invasive Pre-flight Diagnostic)
console.log('🔍 [BƯỚC 1/4]: TIỀN KIỂM DỰ ÁN MỤC TIÊU...');
const isGitRepo = fs.existsSync(path.join(targetDir, '.git'));
console.log(`   - Git Repository          : ${isGitRepo ? '✅ ĐÃ CÓ .git' : '⚠️ CHƯA CÓ .git (Cần git init)'}`);

const detectedStacks = [];
if (fs.existsSync(path.join(targetDir, 'package.json'))) detectedStacks.push('Node.js / JavaScript / TypeScript');
if (fs.existsSync(path.join(targetDir, 'pom.xml')) || fs.existsSync(path.join(targetDir, 'build.gradle'))) detectedStacks.push('Java / Gradle / Maven');
if (fs.existsSync(path.join(targetDir, 'requirements.txt')) || fs.existsSync(path.join(targetDir, 'Pipfile'))) detectedStacks.push('Python');
if (fs.existsSync(path.join(targetDir, 'go.mod'))) detectedStacks.push('Golang');
if (fs.existsSync(path.join(targetDir, 'composer.json'))) detectedStacks.push('PHP');
if (fs.existsSync(path.join(targetDir, 'docker-compose.yml')) || fs.existsSync(path.join(targetDir, 'Dockerfile'))) detectedStacks.push('Docker Containerized');

console.log(`   - Tech Stack phát hiện    : ${detectedStacks.length > 0 ? detectedStacks.join(', ') : 'Chưa nhận diện rõ (General Codebase)'}`);

// 3. Hàm copy an toàn với cơ chế sao lưu .bak
function safeCopyFile(srcFile, destFile) {
  const destDir = path.dirname(destFile);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(destFile)) {
    const srcContent = fs.readFileSync(srcFile, 'utf8');
    const destContent = fs.readFileSync(destFile, 'utf8');
    if (srcContent === destContent) {
      console.log(`   ⏩ [ĐÃ CÓ & TRÙNG KHỚP]: ${path.relative(targetDir, destFile)}`);
      return;
    }
    const bakFile = destFile + '.bak';
    fs.copyFileSync(destFile, bakFile);
    console.log(`   📦 [SAO LƯU]: ${path.basename(destFile)} -> ${path.basename(bakFile)}`);
  }

  fs.copyFileSync(srcFile, destFile);
  console.log(`   ✅ [ĐÃ TIÊM]: ${path.relative(targetDir, destFile)}`);
}

// 4. Bọc rào chắn quản trị Native Scaffolding
console.log('\n💉 [BƯỚC 2/4]: TIÊM BỘ KHUNG QUẢN TRỊ NATIVE ANTIGRAVITY...');

// 4.1. AGENTS.md
const srcAgentsMd = path.join(sourceRootDir, 'AGENTS.md');
if (fs.existsSync(srcAgentsMd)) {
  safeCopyFile(srcAgentsMd, path.join(targetDir, 'AGENTS.md'));
}

// 4.2. .agents/rules.json & .agents/rules/
const srcRulesJson = path.join(sourceRootDir, '.agents/rules.json');
if (fs.existsSync(srcRulesJson)) {
  safeCopyFile(srcRulesJson, path.join(targetDir, '.agents/rules.json'));
}

const srcRulesDir = path.join(sourceRootDir, '.agents/rules');
if (fs.existsSync(srcRulesDir)) {
  const ruleFiles = fs.readdirSync(srcRulesDir).filter(f => f.endsWith('.md'));
  for (const rf of ruleFiles) {
    safeCopyFile(path.join(srcRulesDir, rf), path.join(targetDir, '.agents/rules', rf));
  }
}

// 4.3. .agents/mcp_config.json
const srcMcpConfig = path.join(sourceRootDir, '.agents/mcp_config.json');
if (fs.existsSync(srcMcpConfig)) {
  safeCopyFile(srcMcpConfig, path.join(targetDir, '.agents/mcp_config.json'));
}

// 4.4. swarm/AI_SWARM_REGISTRY.json & TASK_DISPATCH_BOARD.json
const srcRegistry = path.join(sourceRootDir, 'swarm/AI_SWARM_REGISTRY.json');
const destRegistry = path.join(targetDir, 'swarm/AI_SWARM_REGISTRY.json');
if (fs.existsSync(srcRegistry) && !fs.existsSync(destRegistry)) {
  safeCopyFile(srcRegistry, destRegistry);
} else if (fs.existsSync(destRegistry)) {
  console.log(`   ⏩ [ĐÃ CÓ REGISTRY]: Giữ nguyên registry hiện hữu để không mất UUID`);
}

const srcBoard = path.join(sourceRootDir, 'swarm/TASK_DISPATCH_BOARD.json');
const destBoard = path.join(targetDir, 'swarm/TASK_DISPATCH_BOARD.json');

// Khai tử file Monolithic nếu phát hiện dung lượng quá 45 KB
if (fs.existsSync(destBoard)) {
  const stats = fs.statSync(destBoard);
  if (stats.size > 45000) {
    const monolithBak = destBoard + '.monolith.bak';
    fs.renameSync(destBoard, monolithBak);
    console.log(`   🚨 [KHAI TỬ FILE ĐƠN KHỐI]: Phát hiện file cũ ${Math.round(stats.size / 1024)} KB (> 45 KB). Đã đổi tên -> ${path.basename(monolithBak)}`);
    safeCopyFile(srcBoard, destBoard);
  } else {
    console.log(`   ⏩ [ĐÃ CÓ TASK BOARD]: Dung lượng an toàn (${stats.size} bytes)`);
  }
} else if (fs.existsSync(srcBoard)) {
  safeCopyFile(srcBoard, destBoard);
}

// 4.4.1. Khởi tạo cấu trúc Mode A (Partitioned Tasks)
const activeTasksDir = path.join(targetDir, 'swarm/tasks/active');
const archiveTasksDir = path.join(targetDir, 'swarm/tasks/archive');
if (!fs.existsSync(activeTasksDir)) fs.mkdirSync(activeTasksDir, { recursive: true });
if (!fs.existsSync(archiveTasksDir)) fs.mkdirSync(archiveTasksDir, { recursive: true });

const srcSummary = path.join(sourceRootDir, 'swarm/BOARD_SUMMARY.json');
const destSummary = path.join(targetDir, 'swarm/BOARD_SUMMARY.json');
if (fs.existsSync(srcSummary) && !fs.existsSync(destSummary)) {
  safeCopyFile(srcSummary, destSummary);
}

const srcSampleTask = path.join(sourceRootDir, 'swarm/tasks/active/TASK-SAMPLE-001.json');
const destSampleTask = path.join(activeTasksDir, 'TASK-SAMPLE-001.json');
if (fs.existsSync(srcSampleTask) && !fs.existsSync(destSampleTask)) {
  safeCopyFile(srcSampleTask, destSampleTask);
}

// 4.4.2. Cung cấp DDL Enterprise cho Mode B
const srcDdl = path.join(sourceRootDir, 'docs/database/HDD_SWARM_GOVERNANCE_FULL_DDL.sql');
const destDdlDir = path.join(targetDir, 'docs/database');
if (!fs.existsSync(destDdlDir)) fs.mkdirSync(destDdlDir, { recursive: true });
const destDdl = path.join(destDdlDir, 'HDD_SWARM_GOVERNANCE_FULL_DDL.sql');
if (fs.existsSync(srcDdl) && !fs.existsSync(destDdl)) {
  safeCopyFile(srcDdl, destDdl);
}

// 4.4.3. Tiêm Sổ Tay Tác Chiến Runtime cho từng Role (NODE_01 -> NODE_06)
const srcRuntimeDir = path.join(sourceRootDir, 'swarm/runtime');
const destRuntimeDir = path.join(targetDir, 'swarm/runtime');
if (fs.existsSync(srcRuntimeDir)) {
  if (!fs.existsSync(destRuntimeDir)) fs.mkdirSync(destRuntimeDir, { recursive: true });
  const runtimeFiles = fs.readdirSync(srcRuntimeDir).filter(f => f.endsWith('.md'));
  for (const rf of runtimeFiles) {
    safeCopyFile(path.join(srcRuntimeDir, rf), path.join(destRuntimeDir, rf));
  }
}

// 4.5. swarm/scripts/swarm-watch.js
const srcWatch = path.join(sourceRootDir, 'swarm/scripts/swarm-watch.js');
if (fs.existsSync(srcWatch)) {
  safeCopyFile(srcWatch, path.join(targetDir, 'swarm/scripts/swarm-watch.js'));
}

// 5. Khởi tạo template Bệnh án Hiện trạng (Health Check Report)
console.log('\n📋 [BƯỚC 3/4]: THIẾT LẬP BỆNH ÁN HIỆN TRẠNG (HEALTH CHECK REPORT)...');
const docsDir = path.join(targetDir, 'docs');
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

const reportPath = path.join(docsDir, 'BROWNFIELD_HEALTH_CHECK_REPORT.md');
if (!fs.existsSync(reportPath)) {
  const reportContent = `# 🩺 BỆNH ÁN HIỆN TRẠNG DỰ ÁN CŨ (BROWNFIELD HEALTH CHECK REPORT)
- **Tên dự án**: ${path.basename(targetDir)}
- **Ngày tiếp nhận**: ${new Date().toISOString()}
- **Người chẩn đoán**: Lead Architect & Bác Sĩ Refactor (NODE_01)
- **Cơ chế áp dụng**: Chuẩn hóa theo Antigravity Native Engine (UASOF V6.2)

---

## 1. TỔNG QUAN HIỆN TRẠNG
- **Thư mục dự án**: \`${targetDir}\`
- **Quản lý phiên bản (Git)**: ${isGitRepo ? 'Đã có kho Git' : 'Chưa có Git'}
- **Tech Stack nhận diện**: ${detectedStacks.join(', ') || 'Đang cập nhật'}

## 2. DANH MỤC BỆNH LÝ & NỢ KỸ THUẬT (TECHNICAL DEBT)
- [ ] Rà soát file cấu hình môi trường (.env) và bảo mật bí mật (Secret Leakage).
- [ ] Rà soát CSDL hiện hữu: Bảng, Views, Stored Procedures (Tuân thủ nguyên tắc 0 DROP / 0 TRUNCATE).
- [ ] Rà soát lỗi cú pháp, API bị đứt gãy, các gói thư viện lỗi thời.

## 3. LỘ TRÌNH PHẪU THUẬT & REFACTOR
- Các đầu việc tiếp theo sẽ được bóc tách thành Task ID đưa vào \`swarm/TASK_DISPATCH_BOARD.json\`.
`;
  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`   ✅ [ĐÃ XUẤT BẢN]: docs/BROWNFIELD_HEALTH_CHECK_REPORT.md`);
} else {
  console.log(`   ⏩ [ĐÃ CÓ BỆNH ÁN]: Giữ nguyên docs/BROWNFIELD_HEALTH_CHECK_REPORT.md`);
}

// 6. Hoàn tất & Hướng dẫn bước tiếp theo
console.log('\n🎉 [BƯỚC 4/4]: HOÀN TẤT BỌC RÀO CHẮN QUẢN TRỊ!');
console.log('==================================================================');
console.log('👉 HƯỚNG DẪN DÀNH CHO AGENT TRỢ LÝ TIẾP THEO:');
console.log('1. Mở file AGENTS.md và swarm/AI_SWARM_REGISTRY.json vừa được tiêm vào.');
console.log('2. Đăng ký Conversation UUID của bạn vào NODE_01 trong registry.');
console.log('3. Bắt đầu phỏng vấn Sếp Alex về kế hoạch phẫu thuật / refactor dự án này.');
console.log('==================================================================\n');
