# 👑 QUY TRÌNH TÁI SINH & TỰ CHUYỂN GIAO KHI PM HOẶC WORKER BỊ ẢO GIÁC NẶNG
**CƠ CHẾ "ZERO-STALE CONTEXT RECYCLING" TRONG UNIVERSAL AI SWARM FRAMEWORK**

- **Phân loại**: OPERATIONAL HANDOVER DIRECTIVE
- **Kế thừa từ**: `Multi-Agent_System_Architecture_Guide.md` & Kịch bản thực chiến `recycle_worker.py`
- **Mục tiêu**: Hướng dẫn độc quyền cho `[[BOSS-EXECUTIVE-CHIEF]]` cách xử lý dứt điểm khi PM hoặc Worker bị ảo giác nặng, mất trí nhớ tạm thời do Context Window phình to.

---

## 🏛️ I. CĂN NGUYÊN BỆNH HỌC: TẠI SAO AGENT BỊ ẢO GIÁC NẶNG?

Khi một Agent (đặc biệt là PM điều phối) vận hành qua nhiều chu kỳ:
1. **Pha loãng Ngữ cảnh (Context Dilution):** Context Window chạm trần đỏ ($> 50,000\text{ tokens}$), tích tụ hàng nghìn dòng log lỗi, các câu lệnh thử-sai, và các file kế hoạch markdown chết.
2. **Ảo giác Tự quy chiếu (Self-Referential Hallucination Loop):** Agent bắt đầu tự huyễn hoặc, tưởng mình đã giao việc (nhưng thực tế giao cho nobody), quên kiểm tra CSDL thật (MySQL SSOT), và tự biên tự diễn trạng thái "hoàn thành 100%".
3. **ĐIỀU LỆ THÉP:** **TUYỆT ĐỐI CẤM CỐ GẮNG CHAT ĐỂ GIẢI THÍCH/UỐN NẮN AGENT ĐANG ẢO GIÁC! CÀNG CHAT CONTEXT CÀNG BẨN VÀ ĐỐT TOKEN VÔ ÍCH.**

---

## ⚙️ II. BẢN CHẤT CƠ CHẾ "ZERO-STALE CONTEXT RECYCLING"

Nguyên lý này quy định: **Tách rời Session tạm thời khỏi Tri thức Khách quan (Verified State)**.  
Session chat của Agent chỉ là bóng đèn tiêu hao; khi chập chờn, ta vứt bóng đèn cũ đi, chỉ giữ lại dòng điện (dữ liệu CSDL và Git), rồi lắp bóng đèn mới sạch 100% vào!

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   SESSION AGENT CŨ BỊ ẢO GIÁC (STALE SESSION)          │
│        (Context > 50k tokens, memory bloat, tự biên tự diễn)           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   │ [1. Export Lịch sử thô ra đĩa]
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│          BỘ LỌC CHUYỂN HÓA TRI THỨC (THE 4-PART VERIFIED FILTER)       │
│  - Bóc tách toàn bộ: Quyết định đã chốt, Schema CSDL, Code đã test     │
│  - Bóc tách: Tasks đang dở dang trên MySQL vật lý                      │
│  - ĐẶC BIỆT: "DANH SÁCH ĐÃ BỊ LOẠI BỎ (CẤM NHẮC LẠI)"                  │
│    (Đóng đinh toàn bộ các ảo giác, lỗi sai của session cũ để cấm lặp) │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   │ [2. Dùng Model Flash tóm tắt siêu rẻ]
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PHIÊN MỚI TINH SẠCH 100% (RECYCLED SESSION)          │
│  - Session ID mới hoàn toàn (0 token context)                          │
│  - Kế thừa bản Verified Context Handover                               │
│  - Khởi động ngay Watcher & Reaper trực chiến (IsDaemon: true)         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ III. QUY TRÌNH 4 BƯỚC MÀ [[BOSS-EXECUTIVE-CHIEF]] PHẢI THI HÀNH

Khi phát hiện PM bị ảo giác, `[[BOSS-EXECUTIVE-CHIEF]]` không được chat tranh cãi với nó mà phải tự kích hoạt quy trình:

### 1. Khảo Sát Sự Thật Vật Lý (Ground Truth Audit):
* **CẤM ĐỌC LỜI PM CŨ!** 
* Chạy SQL: `SELECT TaskID, Title, AssignedWorker, Status FROM Sys_Project_Tasks;` để nắm các task thật.
* Chạy `git status` và `git log -n 5`: Nắm các file thực tế đã được commit trên đĩa cứng.

### 2. Thanh Lọc Task Ảo (Purge Ghost Assignments):
* Quét sạch các task mà PM cũ gán cho nobody / worker chưa đăng bạ trong `Sys_Swarm_Node_Pool`.
* Chuyển toàn bộ task ảo đó về lại trạng thái `'OPEN'`.

### 3. Tạo Task Bàn Giao Trên MySQL Vật Lý:
* Tạo task `TASK-BOOTSTRAP-PM-SUCCESSION` trên bảng `Sys_Project_Tasks` cho vai trò `AI-PROJECT-MANAGER`.
* Trường `Deliverables` lưu link file bàn giao hoặc JSON chứa danh sách task thật cần làm.

### 4. Đăng Bạ Tân PM & Ép Chạy 2 Daemon Trực Chiến:
* Cập nhật UUID của Tân PM vào `Sys_Swarm_Node_Pool` / `Project_Workers`.
* Gửi `send_message(PING)` mang `TaskID` tới Tân PM (Blind TaskID Handshake).
* **Răn đe Tân PM chạy ngay 2 tiến trình nền với `IsDaemon: true`:**
  ```powershell
  node swarm/scripts/swarm-watch.js --role AI-PROJECT-MANAGER --loop
  node swarm/scripts/swarm_self_healing_reaper.js --daemon
  ```

---

## 📚 IV. TÀI LIỆU THAM KHẢO GỐC (IMMUTABLE FRAMEWORK ANCHORS)

Mọi quy chuẩn kỹ thuật chi tiết được lưu trữ bất biến tại:
1. Sổ tay Kiến trúc Hệ thống: [`docs/Multi-Agent_System_Architecture_Guide.md`](file:///c:/Data/universal-ai-swarm-framework/docs/Multi-Agent_System_Architecture_Guide.md)
2. Kịch bản Tái sinh Tự động: [`scripts/recycle_worker.py`](file:///c:/Data/universal-ai-swarm-framework/scripts/recycle_worker.py)
3. Đặc tả Trực chiến P2P & Reaper: [`docs/INTERNAL_P2P_MESH_AND_REAPER_SPEC.md`](file:///c:/Data/universal-ai-swarm-framework/docs/INTERNAL_P2P_MESH_AND_REAPER_SPEC.md)
