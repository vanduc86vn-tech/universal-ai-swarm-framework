/**
 * ============================================================================
 * UNIVERSAL AI SWARM FRAMEWORK - SAFE WRITE WRAPPER
 * File: swarm/utils/safe-write.js
 * ============================================================================
 * Cơ chế #7: Safe-Write (Tạm mở khóa attrib -r -> Ghi nguyên tử -> Đóng khóa attrib +r)
 * Đảm bảo file bảo vệ OS-level Read-Only không bị chặn khi hệ thống cần cập nhật,
 * nhưng vẫn bảo vệ tuyệt đối trước việc Agent con lạm quyền ghi đè trái phép.
 * ============================================================================
 */

const fs = require('fs');
const { execSync } = require('child_process');
const { atomicWrite, atomicWriteSync } = require('./file-ops');

/**
 * Ghi file an toàn có xử lý gỡ và khôi phục cờ Read-Only trên Windows (Async)
 */
async function safeWrite(filePath, content) {
  const isWin = process.platform === 'win32';
  let wasReadOnly = false;

  try {
    // 1. Kiểm tra & gỡ cờ read-only nếu file đã tồn tại và đang bị khóa
    if (isWin && fs.existsSync(filePath)) {
      try {
        const mode = fs.statSync(filePath).mode;
        wasReadOnly = (mode & 0o200) === 0; // Không có quyền ghi = read-only
        if (wasReadOnly) {
          execSync(`attrib -r "${filePath}"`, { stdio: 'ignore' });
        }
      } catch (_) {}
    }

    // 2. Ghi file nguyên tử có retry chống EBUSY
    await atomicWrite(filePath, content);

    // 3. Khôi phục trạng thái bảo vệ ngay lập tức
    if (isWin && wasReadOnly && fs.existsSync(filePath)) {
      try {
        execSync(`attrib +r "${filePath}"`, { stdio: 'ignore' });
      } catch (_) {}
    }

    return { success: true, wasReadOnly };
  } catch (err) {
    // Luôn cố gắng khôi phục trạng thái bảo vệ ngay cả khi gặp lỗi
    if (isWin && wasReadOnly && fs.existsSync(filePath)) {
      try {
        execSync(`attrib +r "${filePath}"`, { stdio: 'ignore' });
      } catch (_) {}
    }
    throw err;
  }
}

/**
 * Ghi file an toàn đồng bộ (Sync)
 */
function safeWriteSync(filePath, content) {
  const isWin = process.platform === 'win32';
  let wasReadOnly = false;

  try {
    if (isWin && fs.existsSync(filePath)) {
      try {
        const mode = fs.statSync(filePath).mode;
        wasReadOnly = (mode & 0o200) === 0;
        if (wasReadOnly) {
          execSync(`attrib -r "${filePath}"`, { stdio: 'ignore' });
        }
      } catch (_) {}
    }

    atomicWriteSync(filePath, content);

    if (isWin && wasReadOnly && fs.existsSync(filePath)) {
      try {
        execSync(`attrib +r "${filePath}"`, { stdio: 'ignore' });
      } catch (_) {}
    }

    return { success: true, wasReadOnly };
  } catch (err) {
    if (isWin && wasReadOnly && fs.existsSync(filePath)) {
      try {
        execSync(`attrib +r "${filePath}"`, { stdio: 'ignore' });
      } catch (_) {}
    }
    throw err;
  }
}

module.exports = {
  safeWrite,
  safeWriteSync
};
