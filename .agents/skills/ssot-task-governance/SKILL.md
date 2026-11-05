---
name: ssot-task-governance
description: Quy trình chuẩn đóng gói Task, khởi tạo trên SSOT (MySQL Mode B hoặc Partitioned GitOps Mode A), điều phối 5 tầng và kiểm toán đối kháng nhị phân.
---

# SSOT Task Governance Skill

Kỹ năng quản trị và điều phối toàn bộ vòng đời tác vụ (Task Lifecycle) chuẩn mực cho AI Swarm.
Được đóng gói trọn vẹn theo triết lý OOP và kiến trúc Google Antigravity Native Customization.

## Cấu Trúc Đóng Gói (Skill Bundle)
- `SKILL.md`: Bản đặc tả quy chuẩn và hướng dẫn thao tác.
- `scripts/gov-client.js`: Engine cốt lõi xử lý Dynamic Discovery, SSOT Task Management, Bootstrap, và State Verification.

## Các Lệnh CLI Vận Hành Chính

### 1. Khởi Tạo Hệ Thống (Self-Bootstrap Protocol)
Chạy bởi First Agent khi bắt đầu dự án mới:
```bash
node .agents/skills/ssot-task-governance/scripts/gov-client.js bootstrap --mode <A|B> --title "<Tên Dự Án>"
```

### 2. Tạo & Đăng Bạ Task SSOT
Dùng khi Lead / PM phân rã công việc mới:
```bash
node .agents/skills/ssot-task-governance/scripts/gov-client.js create-task --title "<Tiêu đề công việc>" --worker "<Role Worker>" [--risk <LOW|MED|HIGH>] [--desc "<Mô tả chi tiết>"]
```

### 3. Tra Cứu & Điều Phối Nhanh
- **Định danh UUID đối tác (< 1ms)**:
  ```bash
  node .agents/skills/ssot-task-governance/scripts/gov-client.js resolve <ROLE | NODE_ID>
  ```
- **Tra cứu Task của Worker hiện tại**:
  ```bash
  node .agents/skills/ssot-task-governance/scripts/gov-client.js get-task [ROLE]
  ```
- **Kiểm tra sức khỏe hệ thống (Health Check)**:
  ```bash
  node .agents/skills/ssot-task-governance/scripts/gov-client.js health-check
  ```

*(Lưu ý: Proxy chuyển tiếp tại `node swarm/scripts/gov-client.js` vẫn được duy trì để tương thích ngược 100%).*
