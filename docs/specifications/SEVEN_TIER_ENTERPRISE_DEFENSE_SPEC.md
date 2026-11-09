# 🏛️ ĐẶC TẢ BỨC TƯỜNG PHÒNG THỦ 7 LỚP DOANH NGHIỆP (ENTERPRISE 7-TIER DEFENSE SPECIFICATION)

- **Mã hiệu:** `SPEC-7TIER-ENTERPRISE-DEFENSE-V3.2`
- **Thẩm quyền phê duyệt:** Sếp Alex (Supreme Project Owner) & Super Master Leader (`[[SUPER MASTER LEADER]]`)
- **Phân loại:** TIÊU CHUẨN KIẾN TRÚC BẤT BIẾN TOÀN HỆ THỐNG
- **Phạm vi áp dụng:** Toàn bộ Swarm Framework (Mode A GitOps & Mode B MySQL Enterprise)

---

## I. TỔNG QUAN BỨC TƯỜNG PHÒNG THỦ 7 LỚP (DEFENSE MATRIX)

Hệ thống kết hợp chặt chẽ giữa phần cứng, hệ điều hành (Windows), CSDL (MySQL) và tầng điều phối AI để loại bỏ 100% các lỗi kinh điển trong hệ phân tán:

| Lớp | Tên Cơ Chế Bảo Vệ | Vấn Đề Gốc Rễ Triệt Tiêu | Triển Khai Kỹ Thuật |
| :---: | :--- | :--- | :--- |
| **1** | **MySQL View-Only Permission** | Ngăn chặn Worker đọc/ghi trực tiếp vào bảng vật lý thô. | Phân quyền DB Role, chỉ expose các Views đã lọc sạch thông tin nhạy cảm. |
| **2** | **Rules + PreToolUse Hook** | Ngăn chặn Agent tự ý chạy SQL tùy tiện hoặc vượt thẩm quyền. | Hook `.agents/pre-tool-firewall.cjs` chặn các lệnh DDL/DML trôi nổi. |
| **3** | **Ask-Permissions Gate** | Ngăn chặn AI tự ý sửa đổi Hook an toàn và Module lõi. | Cơ chế `force_ask` bật popup Approval Card bắt buộc Sếp Alex duyệt tay. |
| **4** | **Cross-Layer Binding + Claim Intent** | Khắc phục điểm mù lệch pha giữa Antigravity Tab và Task ID trên DB. | Tệp `.runtime/active-tasks/{UUID}.json` đồng bộ 2 chiều với bảng `Project_Tasks`. |
| **5** | **Two-Phase Liveness Heartbeat** | Loại bỏ 100% báo động giả khi Agent đang suy nghĩ sâu (Thinking Phase). | Phân biệt `phase: THINKING` (timeout 5m) và `phase: EXECUTING` (timeout 60s). |
| **6** | **Atomic Write + Exponential Retry** | Giải quyết lỗi tranh chấp đọc/ghi file trên Windows (`EBUSY`, `EPERM`). | Module `swarm/utils/file-ops.js` ghi file tạm rồi `renameSync` nguyên tử. |
| **7** | **Row-Level Lock Stored Procedure** | Hai Node cùng nhận 1 Task dẫn đến Race Condition mất nhất quán. | Stored Procedure `sp_claim_task` sử dụng `SELECT ... FOR UPDATE`. |

---

## II. CHI TIẾT KỸ THUẬT 3 CƠ CHẾ BẢO VỆ MỚI ĐƯỢC TÍCH HỢP

### 1. Cơ chế #5: Atomic Write + Exponential Retry (`swarm/utils/file-ops.js`)
* **Nguyên lý:** Không bao giờ ghi trực tiếp vào file đích. Toàn bộ nội dung được ghi vào file tạm `.tmp.{pid}.{timestamp}`, sau đó dùng lệnh đổi tên nguyên tử (`renameSync`).
* **Cơ chế phục hồi:** Khi gặp lỗi khóa file của Windows (`EBUSY`, `EPERM`, `EACCES`), hệ thống áp dụng thuật toán lùi lũy tiến (Exponential Backoff): $50\text{ms} \to 100\text{ms} \to 150\text{ms}$.

### 2. Cơ chế #6: Nhận Task An Toàn Bằng Stored Procedure (`sp_claim_task.sql`)
* **Nguyên lý:** Tận dụng triệt để khóa dòng nguyên tử của MySQL InnoDB (`SELECT ... FOR UPDATE`):
  ```sql
  START TRANSACTION;
  SELECT status, assigned_worker INTO v_status, v_worker
  FROM Project_Tasks WHERE task_id = p_task_id
  FOR UPDATE;
  ```
* **Bảo vệ toàn vẹn:** Giao dịch thứ hai đến sau bắt buộc phải đợi giao dịch thứ nhất kết thúc. Khi giao dịch 2 kiểm tra lại, thấy `status` đã chuyển thành `IN_PROGRESS` $\to$ MySQL tự động từ chối (`ALREADY_CLAIMED`). Triệt tiêu hoàn toàn race condition mà không cần logic code phức tạp.

### 3. Cơ chế #7: Safe-Write Wrapper (`swarm/utils/safe-write.js`)
* **Nguyên lý:** Phối hợp giữa cờ thuộc tính hệ điều hành (`attrib +/-r`) và ghi file nguyên tử:
  1. Kiểm tra nếu file đang là Read-Only: Tạm thời gỡ bỏ bằng `attrib -r`.
  2. Ghi đè file bằng `atomicWrite` an toàn.
  3. Lập tức khôi phục trạng thái bảo vệ `attrib +r`.
* **An toàn tuyệt đối:** Khối `finally` đảm bảo cờ `+r` luôn được khôi phục ngay cả khi tiến trình ghi gặp sự cố ngoài ý muốn.

---

## III. CHỈ THỊ VẬN HÀNH DÀNH CHO TOÀN BỘ CÁC NODE

1. **Đối với Quản trị viên (`NODE_01` & `NODE_02`):** Mọi thao tác ghi file cấu hình nhạy cảm (`AGENTS.md`, `.agents/rules/*`) bắt buộc phải gọi qua `safeWrite()`.
2. **Đối với Worker:** Tuyệt đối cấm tự nhận task bằng câu lệnh UPDATE thủ công; 100% việc nhận việc phải thông qua API gọi Stored Procedure `sp_claim_task`.
