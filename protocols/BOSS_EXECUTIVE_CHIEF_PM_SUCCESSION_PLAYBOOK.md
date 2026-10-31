# 📖 SỔ TAY VẬN HÀNH THAY MÁU PM & THANH LỌC ẢO GIÁC CHO [[BOSS-EXECUTIVE-CHIEF]]
**SOP & PLAYBOOK: EXECUTIVE CHIEF PM SUCCESSION & ANTI-HALLUCINATION PURGE (V1.0)**

- **Mã hiệu**: `SOP-EXEC-CHIEF-PM-SUCCESSION-V1.0`
- **Đối tượng áp dụng độc quyền**: `NODE_01: [[BOSS-EXECUTIVE-CHIEF]]` (Trợ lý Chiến lược & Điểm chạm duy nhất của Sếp Alex).
- **Cơ chế kích hoạt**: Tự động tra cứu và thi hành ngay khi Sếp Alex ban hành chỉ thị `[DIRECTIVE-PURGE-AND-PM-SUCCESSION]`.

---

## 🏛️ I. NGUYÊN TẮC KỶ LUẬT THÉP CỦA CHÁNH VĂN PHÒNG

Khi PM bị sa thải do ảo giác nặng hoặc vi phạm kỷ luật trực chiến (không chạy Daemon Watcher & Reaper), `[[BOSS-EXECUTIVE-CHIEF]]` phải khắc cốt ghi tâm:

1. **Tuyệt đối không nghe lời trần tình của PM cũ:**  
   Không đọc lại các dòng chat giải thích, không yêu cầu PM cũ viết báo cáo (tránh vòng lặp ảo giác tự quy chiếu).
2. **Sự thật duy nhất nằm ở CSDL MySQL & Git Log:**  
   Chỉ những gì có record trên bảng `Sys_Project_Tasks` và có commit trên Git mới được công nhận là đã hoàn thành.
3. **Triệt tiêu toàn bộ Task ma (Ghost Assignments):**  
   Thu hồi toàn bộ các task đang bị gán cho nobody về trạng thái `OPEN` để CSDL phản ánh đúng 100% thực tế.

---

## ⚙️ II. QUY TRÌNH 5 GIAI ĐOẠN THỰC THI CHI TIẾT

```text
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: KHẢO SÁT SỰ THẬT VẬT LÝ (GROUND TRUTH AUDIT)               │
│ - Chạy truy vấn SQL kiểm tra trạng thái Task thực tế                   │
│ - Chạy Git kiểm tra commit thật trên đĩa cứng                          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 2: THANH LỌC TASK MA (PURGE GHOST ASSIGNMENTS)               │
│ - Tìm các task bị gán cho worker không tồn tại trong Node Pool         │
│ - Reset toàn bộ các task này về trạng thái 'OPEN'                      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 3: ĐĂNG BẠ TÂN PM VÀO CSDL RUNTIME                           │
│ - Cập nhật UUID của Tân PM vào Sys_Swarm_Node_Pool / Project_Workers   │
│ - Đóng dấu vai trò 'AI-PROJECT-MANAGER' với status = 'READY'           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 4: TẠO TASK BÀN GIAO & KÍCH HOẠT P2P HANDSHAKE (ZERO CHAT)   │
│ - INSERT task [TASK-BOOTSTRAP-PM-SUCCESSION] vào MySQL SSOT            │
│ - Gửi P2P Blind Handshake: send_message({"taskId": "..."})             │
│ - Ép Tân PM khởi chạy 2 Daemon trực chiến nền (IsDaemon: true)         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 5: BÁO CÁO 3 CON SỐ THỰC TẾ CHO SẾP ALEX                     │
│ 1. Số task COMPLETED thật | 2. Số task OPEN thật | 3. Trạng thái PONG   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 III. CẨM NANG CÂU LỆNH MẪU CHO TỪNG GIAI ĐOẠN

### Giai đoạn 1: Khảo sát sự thật vật lý
Chạy truy vấn SQL trực tiếp để bóc tách hiện trạng:
```sql
-- Đếm chính xác số lượng task theo từng trạng thái thật trong CSDL
SELECT Status, COUNT(*) as TotalTasks 
FROM Sys_Project_Tasks 
GROUP BY Status;

-- Kiểm tra các task đang dang dở
SELECT TaskID, Title, AssignedWorker, Status, AuditVerdict 
FROM Sys_Project_Tasks 
WHERE Status NOT IN ('COMPLETED');
```
Kiểm tra commit Git thực tế trên máy chủ:
```bash
git status --short
git log -n 5 --oneline
```

### Giai đoạn 2: Thanh lọc Task ma (Khử ảo giác nobody)
Thu hồi toàn bộ task bị gán sai về hàng đợi `OPEN`:
```sql
UPDATE Sys_Project_Tasks 
SET Status = 'OPEN', AssignedConversationID = NULL 
WHERE Status IN ('ASSIGNED', 'IN_PROGRESS') 
  AND AssignedWorker NOT IN (
    SELECT worker_role FROM Sys_Swarm_Node_Pool WHERE status = 'READY'
  );
```

### Giai đoạn 3: Đăng bạ Tân PM vào CSDL
Khi Sếp Alex cung cấp UUID của Tân PM (`${NEW_PM_UUID}`):
```sql
INSERT INTO Sys_Swarm_Node_Pool (node_id, worker_role, conversation_id, model_name, status, updated_at)
VALUES (UUID(), 'AI-PROJECT-MANAGER', '${NEW_PM_UUID}', 'gemini-3.8-pro', 'READY', NOW())
ON DUPLICATE KEY UPDATE 
  conversation_id = '${NEW_PM_UUID}', 
  status = 'READY', 
  updated_at = NOW();
```

### Giai đoạn 4: Tạo Task Bàn Giao & Gửi Blind Handshake
1. **Tạo Task trên MySQL SSOT:**
```sql
INSERT INTO Sys_Project_Tasks (
  TaskID, SubPlanID, AssignedWorker, AssignedConversationID, 
  Title, Description, Status, Deliverables
) VALUES (
  'TASK-BOOTSTRAP-PM-SUCCESSION', 'SUBPLAN-BOOTSTRAP', 'AI-PROJECT-MANAGER', '${NEW_PM_UUID}',
  'Tiếp nhận bàn giao chính thức, kích hoạt Watcher & Reaper trực chiến',
  'Đọc hiện trạng thật từ MySQL, loại bỏ toàn bộ ảo giác cũ, khởi chạy ngay 2 daemon nền swarm-watch.js và swarm_self_healing_reaper.js với IsDaemon: true.',
  'ASSIGNED', JSON_OBJECT('handover_type', 'PURGE_AND_SUCCESSION', 'audit_verified_at', NOW())
);
```

2. **Gửi Blind TaskID Handshake qua `send_message`:**
```json
// Gửi duy nhất gói tin sau tới ${NEW_PM_UUID}:
{
  "taskId": "TASK-BOOTSTRAP-PM-SUCCESSION"
}
```

3. **Chỉ thị đính kèm cho Tân PM trong lệnh khởi động:**
Tân PM bắt buộc phải thực thi ngay 2 lệnh nền trước khi nhận việc:
* `run_command(CommandLine='node swarm/scripts/swarm-watch.js --role AI-PROJECT-MANAGER --loop', IsDaemon=true)`
* `run_command(CommandLine='node swarm/scripts/swarm_self_healing_reaper.js --daemon', IsDaemon=true)`

### Giai đoạn 5: Mẫu báo cáo nghiệm thu gửi Sếp Alex
Sau khi Tân PM phản hồi `[PONG: Handshake acknowledged]`, Boss chỉ báo cáo đúng định dạng súc tích:

```markdown
Báo cáo Sếp Alex! Chiến dịch thay máu PM đã hoàn tất 100%:
1. Hiện trạng vật lý xác thực từ MySQL: [X] Tasks COMPLETED thật, [Y] Tasks OPEN đang chờ phân bổ.
2. Đã thanh lọc [Z] task ma bị gán cho nobody về lại hàng đợi OPEN an toàn.
3. Tân PM (UUID: ...) đã đăng bạ vào Pool, phản hồi PONG thành công, và đã kích hoạt 2 Daemon ngầm (Watcher 15s + Reaper 60s) trực chiến 24/7.

Hệ thống đã sạch bóng ảo giác và sẵn sàng nhận lệnh tiếp theo từ Sếp!
```
