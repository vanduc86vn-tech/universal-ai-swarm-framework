# 🔄 ĐẶC TẢ KỸ THUẬT: CƠ CHẾ KẾ NHIỆM TỰ ĐỘNG & CHECKPOINT KHÔNG GIÁN ĐOẠN
### ZERO-DOWNTIME SUCCESSION & CONTEXT RECYCLING SPECIFICATION (V6.2)

- **Mã định danh**: `SPEC-ZERO-DOWNTIME-SUCCESSION-V6.2`
- **Cơ quan ban hành**: `[[SUPER MASTER LEADER]]` (Meta-Apex) & Sếp Alex
- **Phân loại**: QUY CHUẨN KIẾN TRÚC BẤT BIẾN TOÀN HỆ SINH THÁI
- **Áp dụng**: Toàn bộ các vai trò (`NODE_01` đến `NODE_06+`) trên Mode A và Mode B.

---

## 🏛️ I. NGUYÊN LÝ CỐT LÕI: TÁI SINH TRƯỚC NGƯỠNG PHÂN RÃ CHÚ Ý

Trong mô hình ngôn ngữ lớn (LLM), khi một phiên làm việc kéo dài qua nhiều chu kỳ:
1. **Hiện tượng Suy thoái Chú ý (Attention Decay):** Khi Context Window vượt quá $40,000 - 50,000\text{ tokens}$ hoặc phiên hội thoại vượt quá 25 lượt (turns), khả năng tuân thủ luật và đối soát nhị phân của Agent giảm mạnh. Agent bắt đầu "tự biên tự diễn", tưởng tượng ra kết quả và bỏ qua kiểm tra CSDL thật.
2. **Nguyên lý Bóng đèn & Dòng điện:**
   - **Session chat (Bóng đèn):** Là vật tư tiêu hao. Khi bắt đầu chập chờn, ta vứt bóng đèn cũ và lắp bóng đèn mới sạch 100%.
   - **CSDL & Git (Dòng điện):** Là Nguồn Sự Thật Duy Nhất (SSOT) bất biến. Dòng điện không bao giờ mất đi.
3. **Mệnh lệnh Tuyệt đối:** **TUYỆT ĐỐI KHÔNG CHAT UỐN NẮN AGENT ĐANG BỊ ẢO GIÁC NẶNG!** Phải kích hoạt giao thức kế nhiệm để thay máu bằng một phiên sạch.

---

## ⚙️ II. QUY TRÌNH 3 BƯỚC KẾ NHIỆM KHÔNG GIÁN ĐOẠN (ZERO-DOWNTIME 3-STEP PIPELINE)

```text
┌────────────────────────────────────────────────────────────────────────┐
│ BƯỚC 1: XUẤT CHECKPOINT TRƯỚC KHI RỜI VỊ TRÍ (PRE-DEPARTURE SNAPSHOT) │
│ Agent cũ phát hiện ngưỡng context -> Ghi nhận tiến độ dở dang          │
│ Lệnh: node swarm/scripts/gov-client.js checkpoint create <TASK_ID> ... │
│ Trạng thái Task chuyển sang: HANDOVER_PENDING                          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ BƯỚC 2: TÂN AGENT THỨC GIẤC & TỰ ĐĂNG BẠ DANH TÍNH (SELF-REGISTRATION) │
│ Tân Agent thức giấc trong Tab mới (Context sạch 100%, 0 token rác)     │
│ Lệnh: node swarm/scripts/gov-client.js register <ROLE> <NEW_UUID>      │
│ gov-client tự động khóa UUID và trả về Checkpoint dở dang              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ BƯỚC 3: TIẾP QUẢN TỨC THÌ & XÓA CHECKPOINT (IMMEDIATE RESUMPTION)      │
│ Tân Agent đọc trường "next_action" từ Checkpoint -> Thi công tiếp ngay │
│ Lệnh: node swarm/scripts/gov-client.js checkpoint clear <TASK_ID>      │
│ Trạng thái Task quay lại: IN_PROGRESS (Zero downtime, 0 lặp lại lỗi)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 III. CẤU TRÚC HỢP ĐỒNG CHECKPOINT (`CHK-<TASK_ID>.json`)

Tệp Checkpoint được lưu trữ tại `swarm/tasks/checkpoints/CHK-<TASK_ID>.json` với dung lượng siêu nhẹ (< 1 KB) gồm 6 trường bắt buộc:

```json
{
  "task_id": "TASK-20261102-001",
  "timestamp": "2026-11-02T05:50:00.000Z",
  "worker_role": "BACKEND_ENGINEER",
  "step_completed": "Đã tạo bảng CSDL Sys_Orders và cấu hình Knex migration 001",
  "step_in_progress": "Đang viết REST API endpoint POST /api/v1/orders",
  "files_modified": [
    "src/controllers/order.controller.ts",
    "src/routes/order.routes.ts"
  ],
  "rejection_list": [
    "CẤM dùng raw SQL nối chuỗi (nguy cơ SQL Injection)",
    "CẤM mở cổng 3306 ra ngoài Internet (chỉ listen 127.0.0.1)",
    "Không dùng thư viện ORM TypeORM vì xung đột migration của Knex"
  ],
  "next_action": "Chạy lệnh kiểm thử đơn vị: npm test src/tests/order.test.ts"
}
```

> [!IMPORTANT]
> **Giá trị cốt tử của `rejection_list`:**  
> Toàn bộ các phương án sai, lỗi cú pháp, lệnh shell bị treo hoặc giả thuyết bị bác bỏ ở phiên cũ bắt buộc phải đưa vào `rejection_list`. Tân Agent khi kế nhiệm sẽ đọc danh sách này và **không bao giờ đi vào vết xe đổ của người tiền nhiệm**.

---

## 🛠️ IV. BỘ LỆNH CLI ĐIỀU PHỐI QUA `gov-client.js`

| Tác vụ | Câu lệnh thực thi | Mục đích |
| :--- | :--- | :--- |
| **Kích hoạt Kế nhiệm** | `node swarm/scripts/gov-client.js trigger-succession <ROLE> [REASON]` | Xuất manifest hướng dẫn bàn giao cho người kế nhiệm. |
| **Tạo Checkpoint** | `node swarm/scripts/gov-client.js checkpoint create <TASK_ID> [JSON\|FILE]` | Đóng băng tiến độ dở dang, chuyển task sang `HANDOVER_PENDING`. |
| **Đọc Checkpoint** | `node swarm/scripts/gov-client.js checkpoint read <TASK_ID>` | Tân Agent kiểm tra xem có việc dở dang cần tiếp quản hay không. |
| **Tự Đăng Bạ UUID** | `node swarm/scripts/gov-client.js register <ROLE\|NODE_ID> <UUID>` | Tân Agent cập nhật danh bạ và nhận ngay Checkpoint tương ứng. |
| **Giải phóng Checkpoint**| `node swarm/scripts/gov-client.js checkpoint clear <TASK_ID>` | Xóa checkpoint sau khi đã tiếp quản thành công, đưa task về `IN_PROGRESS`. |

---

## 🛡️ V. LỢI ÍCH KIẾN TRÚC ĐẠT ĐƯỢC

1. **Giải phóng 100% bàn tay Sếp Alex:** Sếp không cần phải copy paste UUID, không cần nhắc nhở agent làm tiếp việc gì.
2. **Tiết kiệm 80% Token & Tránh Lú Lẫn:** Không để context kéo dài vượt trần 50k tokens. Luôn duy trì đội ngũ Worker trong trạng thái nhận thức sắc bén nhất.
3. **Bảo toàn Tuyệt đối Trạng thái FSM:** Dây chuyền 5 Tầng không bị gián đoạn hay gãy sụp khi có Worker thay máu giữa chừng.
