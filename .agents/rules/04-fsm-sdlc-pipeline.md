# ⚙️ QUY TRÌNH DÂY CHUYỀN 5 TẦNG & FSM SDLC PIPELINE (STATE MACHINE INVARIANT)

Dây chuyền phát triển phần mềm trong Swarm vận hành như một Máy trạng thái hữu hạn (Finite State Machine - FSM) khép kín gồm 5 Tầng độc lập. Không một tính năng nào được phép vượt cấp hoặc tự duyệt.

---

## I. MÔ HÌNH DÂY CHUYỀN 5 TẦNG (5-TIER SDLC PIPELINE)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 1: STRATEGY & USER STORY (NODE_01: LEAD ARCHITECT & BA)                │
│ -> Bóc tách yêu cầu nghiệp vụ, Acceptance Criteria, Single Point of Contact │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 2: WBS DECOMPOSITION & SCHEDULING (NODE_02: PROJECT MANAGER)           │
│ -> Phân mảnh Task, gán Slot Worker (Zero Ghost Worker Gate), cấp Task ID     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 3: SCHEMA & ARCHITECTURE LOCK (NODE_03: DATABASE ARCHITECT)            │
│ -> Thiết kế 3NF, xuất bản DDL/Migration, Rollback < 60s, 0 DROP/0 TRUNCATE  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 4: EXECUTION & CODE PRODUCTION (NODE_05: BACKEND / WORKERS)            │
│ -> Lập trình tính năng theo schema, nghiêm cấm mock, tuân thủ boundaries    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 5: INDEPENDENT QUALITY GATE (NODE_04: QA & SECURITY AUDITOR)           │
│ -> Kiểm tra nhị phân (OWASP, CDP Browser, Zero Mock), ký PASS hoặc REJECT   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## II. MA TRẬN CHUYỂN DỊCH TRẠNG THÁI TASK (TASK FSM TRANSITIONS)

Mọi Task (dù là Mode A `TASK-xxx.json` hay Mode B `Sys_Project_Tasks`) bắt buộc phải tuân thủ nghiêm ngặt chuỗi chuyển dịch trạng thái sau:

1. `DRAFT`: Đang trong giai đoạn khảo sát, chưa được phân bổ tài nguyên.
2. `READY_FOR_DEV`: Đã có User Story, WBS và Schema được duyệt.
3. `ASSIGNED`: Đã gán cho một Worker ID thực sự tồn tại trong danh bạ Swarm (Cấm gán cho nobody).
4. `IN_PROGRESS`: Worker đã xác nhận nhận việc và bắt đầu thi công.
   - *Biến thể Kế nhiệm (`HANDOVER_PENDING`)*: Kích hoạt khi Worker chạm ngưỡng bão hòa context (> 40k tokens hoặc > 25 turns). Worker xuất `CHK-<TASK_ID>.json` kèm `rejection_list` rồi nhường chỗ cho Tân Worker. Khi Tân Worker đăng bạ tiếp quản (`gov-client register`), trạng thái quay về `IN_PROGRESS`.
5. `DEV_COMPLETE`: Worker đã nộp mã nguồn và bằng chứng thực thi.
6. `IN_AUDIT`: Chuyển sang cho QA Auditor thẩm định độc lập.
7. `AUDIT_PASSED`: QA đóng dấu phê duyệt sau khi đối soát kiểm thử thực tế.
8. `ARCHIVED`: Task hoàn thành, dời sang lưu trữ (Mode A: thư mục `archive/`; Mode B: đánh dấu `is_archived = 1`).

> [!CAUTION]
> **LỆNH CẤM VƯỢT CẤP (ANTI-BYPASS RULE):**
> 1. Worker KHÔNG ĐƯỢC tự chuyển trạng thái task từ `DEV_COMPLETE` sang `AUDIT_PASSED`. Chỉ QA (`NODE_04`) mới có quyền này.
> 2. Nếu QA đánh giá `REJECTED`, task tự động quay ngược về `IN_PROGRESS` kèm biên bản vi phạm `QA_AUDIT_REPORT.md`. Worker phải khắc phục lại từ đầu.
