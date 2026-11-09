/**
 * ============================================================================
 * UNIVERSAL AI SWARM FRAMEWORK - ATOMIC FILE OPERATIONS
 * File: swarm/utils/file-ops.js
 * ============================================================================
 * Cơ chế #5: Atomic Write + Exponential Retry
 * Giải quyết dứt điểm lỗi tranh chấp đọc/ghi EBUSY / EPERM / EACCES trên Windows.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const delay = (ms) => new Promise(r => setTimeout(r, ms));
const delaySync = (ms) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
};

/**
 * Ghi file nguyên tử bất đồng bộ (Async) kèm Exponential Backoff Retry
 */
async function atomicWrite(filePath, content, maxRetries = 3) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tempPath = `${filePath}.tmp.${process.pid}.${Date.now()}`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      fs.writeFileSync(tempPath, content, 'utf8');
      try {
        fs.renameSync(tempPath, filePath);
      } catch (renameErr) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        fs.renameSync(tempPath, filePath);
      }
      return true;
    } catch (err) {
      try {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      } catch (_) {}

      if (['EBUSY', 'EPERM', 'EACCES'].includes(err.code) && attempt < maxRetries) {
        await delay(50 * attempt); // 50ms -> 100ms -> 150ms
        continue;
      }
      throw err;
    }
  }
}

/**
 * Ghi file nguyên tử đồng bộ (Sync) dành cho hook và script đồng bộ
 */
function atomicWriteSync(filePath, content, maxRetries = 3) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tempPath = `${filePath}.tmp.${process.pid}.${Date.now()}`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      fs.writeFileSync(tempPath, content, 'utf8');
      try {
        fs.renameSync(tempPath, filePath);
      } catch (renameErr) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        fs.renameSync(tempPath, filePath);
      }
      return true;
    } catch (err) {
      try {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      } catch (_) {}

      if (['EBUSY', 'EPERM', 'EACCES'].includes(err.code) && attempt < maxRetries) {
        delaySync(50 * attempt);
        continue;
      }
      throw err;
    }
  }
}

/**
 * Đọc an toàn bất đồng bộ (Async) có thử lại khi file bị khóa
 */
async function safeRead(filePath, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      let raw = fs.readFileSync(filePath, 'utf8');
      if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
      return JSON.parse(raw);
    } catch (err) {
      if ((err.code === 'EBUSY' || (err.message && err.message.includes('locked'))) && attempt < maxRetries) {
        await delay(30 * attempt);
        continue;
      }
      throw err;
    }
  }
}

/**
 * Đọc an toàn đồng bộ (Sync)
 */
function safeReadSync(filePath, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      let raw = fs.readFileSync(filePath, 'utf8');
      if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
      return JSON.parse(raw);
    } catch (err) {
      if ((err.code === 'EBUSY' || (err.message && err.message.includes('locked'))) && attempt < maxRetries) {
        delaySync(30 * attempt);
        continue;
      }
      throw err;
    }
  }
}

module.exports = {
  atomicWrite,
  atomicWriteSync,
  safeRead,
  safeReadSync
};
