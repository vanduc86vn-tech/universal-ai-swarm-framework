#!/usr/bin/env node

/**
 * ============================================================================
 * UNIVERSAL AI SWARM FRAMEWORK - PARTITIONED TASK MANAGER (MODE A GITOPS)
 * File: swarm/scripts/task-partition-manager.js
 * ============================================================================
 * Chức năng:
 *  Quản lý các file task riêng lẻ trong thư mục swarm/tasks/active/ (< 2 KB)
 *  Tự động lưu trữ (archive) khi hoàn thành và cập nhật swarm/BOARD_SUMMARY.json.
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const activeDir = path.join(rootDir, 'swarm/tasks/active');
const archiveDir = path.join(rootDir, 'swarm/tasks/archive');
const summaryPath = path.join(rootDir, 'swarm/BOARD_SUMMARY.json');

const args = process.argv.slice(2);
const command = args[0] || 'list';

function ensureDirs() {
  if (!fs.existsSync(activeDir)) fs.mkdirSync(activeDir, { recursive: true });
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
}

function updateSummary() {
  ensureDirs();
  const activeFiles = fs.readdirSync(activeDir).filter(f => f.endsWith('.json'));
  const archiveFiles = fs.existsSync(archiveDir) ? fs.readdirSync(archiveDir).filter(f => f.endsWith('.json')) : [];

  const summary = {
    board_name: "SWARM_PROGRESSIVE_TASK_BOARD",
    version: "3.0.0-PARTITIONED",
    mode: "MODE_A_PARTITIONED_GITOPS",
    last_updated: new Date().toISOString(),
    active_tasks_directory: "swarm/tasks/active/",
    archive_tasks_directory: "swarm/tasks/archive/",
    metrics: {
      total_active_tasks: activeFiles.length,
      completed_archived_tasks: archiveFiles.length
    },
    active_task_ids: activeFiles.map(f => f.replace('.json', ''))
  };

  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
}

switch (command) {
  case 'list': {
    ensureDirs();
    const files = fs.readdirSync(activeDir).filter(f => f.endsWith('.json'));
    console.log(`\n📋 DANH SÁCH TASK ĐANG HOẠT ĐỘNG (Tổng: ${files.length}):`);
    console.log('------------------------------------------------------------------');
    for (const f of files) {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(activeDir, f), 'utf8'));
        console.log(`📌 [${content.task_id || f}] Trạng thái: ${content.status || 'N/A'} | Gán: ${content.assigned_to || 'N/A'}`);
        console.log(`   Tiêu đề: ${content.title || 'N/A'}`);
      } catch (e) {
        console.log(`⚠️ Lỗi đọc file ${f}: ${e.message}`);
      }
    }
    console.log('------------------------------------------------------------------\n');
    break;
  }

  case 'archive': {
    ensureDirs();
    const taskId = args[1];
    if (!taskId) {
      console.error('❌ Lỗi: Cần cung cấp mã task cần lưu trữ. Ví dụ: node task-partition-manager.js archive TASK-001');
      process.exit(1);
    }
    const fileName = taskId.endsWith('.json') ? taskId : `${taskId}.json`;
    const srcFile = path.join(activeDir, fileName);
    const destFile = path.join(archiveDir, fileName);

    if (!fs.existsSync(srcFile)) {
      console.error(`❌ Lỗi: Không tìm thấy file task tại ${srcFile}`);
      process.exit(1);
    }

    // Đánh dấu status = COMPLETED trước khi dời
    try {
      const data = JSON.parse(fs.readFileSync(srcFile, 'utf8'));
      data.status = 'COMPLETED';
      data.archived_at = new Date().toISOString();
      fs.writeFileSync(destFile, JSON.stringify(data, null, 2), 'utf8');
      fs.unlinkSync(srcFile);
      console.log(`✅ [ĐÃ LƯU TRỮ]: Chuyển ${fileName} -> swarm/tasks/archive/`);
      updateSummary();
    } catch (err) {
      console.error('❌ Lỗi khi archive:', err.message);
      process.exit(1);
    }
    break;
  }

  default:
    console.log('Cách sử dụng task-partition-manager.js:');
    console.log('  node swarm/scripts/task-partition-manager.js list');
    console.log('  node swarm/scripts/task-partition-manager.js archive <TASK_ID>');
    break;
}
