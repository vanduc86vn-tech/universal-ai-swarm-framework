---
name: ssot-task-dispatch
description: Quy trình đóng gói 4 khối OOP & nạp MySQL SSOT cho AI Swarm.
---

# SSOT Task Dispatch Skill

Kỹ năng chuẩn đóng gói 4 khối OOP và nạp tác vụ chính thức lên MySQL SSOT.

## 4 Khối Đóng Gói OOP Chuẩn
1. **Khối 1 - Actor Identity**: Định danh Node UUID, vai trò hiến định và quyền hạn.
2. **Khối 2 - Domain Entity**: Khởi tạo thực thể công việc kế thừa từ `BaseEntity`.
3. **Khối 3 - Abstract Plan Alignment**: Định vị công việc trong FSM của `AbstractPlan`.
4. **Khối 4 - Binary Verification Receipt**: Bằng chứng nhị phân (hash, test pass, exit code: 0) trước khi chuyển trạng thái.

## Quy Trình Vận Hành
```bash
# Nạp Task vào MySQL SSOT
python .agents/scripts/dispatch_task.py --title "<Tiêu đề>" --worker "<Role>" --plan "<PlanID>"
```
