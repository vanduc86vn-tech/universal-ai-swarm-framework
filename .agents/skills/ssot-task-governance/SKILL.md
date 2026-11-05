---
name: ssot-task-governance
description: Quy trình chuẩn đóng gói Task, khởi tạo trên SSOT (MySQL Mode B hoặc Partitioned GitOps Mode A), điều phối 5 tầng và kiểm toán đối kháng nhị phân.
---

# SSOT Task Governance & Dispatching Runbook

Sử dụng kỹ năng này khi cần khởi tạo task mới, điều phối dây chuyền 5 tầng hoặc nghiệm thu kiểm toán độc lập.

## Quy Trình 3 Bước Bắt Buộc

### Bước 1: Khởi Tạo Task Chính Thức Trên SSOT
Trước khi gửi bất kỳ tin nhắn P2P nào cho PM, Trợ lý/Lead bắt buộc chạy lệnh:
```bash
# Tạo task trên MySQL SSOT (Mode B) hoặc Partitioned JSON (Mode A)
node swarm/scripts/gov-client.js create-task \
  --title "Tiêu đề công việc chuẩn mực" \
  --worker "AI-BACKEND" \
  --risk "LOW"
```
Lệnh này tự động cấp mã `TASK-xxx` và sinh biên lai `swarm/locks/LATEST_TASK_RECEIPT.json`.

### Bước 2: Bắn Tín Hiệu Cho PM
Sau khi có Task ID, Lead gửi tin nhắn Fast-Path P2P cho PM:
`[SIGNAL: TASK_DISPATCH] Đã khởi tạo TASK-xxx trên SSOT. Đề nghị PM tiếp nhận điều phối!`

### Bước 3: Nghiệm Thu & Kiểm Toán 5 Trạm
Worker làm xong nộp bằng chứng nhị phân (Commit Hash, Exit Code, Logs). QA kiểm toán độc lập và ký:
```bash
node swarm/scripts/gov-client.js audit-complete TASK-xxx --verdict PASS --proof-hash "<HASH>"
```
