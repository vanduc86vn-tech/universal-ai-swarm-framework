# ⚙️ GLOBAL SYSTEM ANTIGRAVITY CONFIGURATION (V6.1 ENTERPRISE)
### Tiêu Chuẩn Cấu Hình Toàn Cục Tối Ưu Chi Phí Vertex AI & Kiểm Soát Token Context

> **Tệp cấu hình**: `~/.antigravity/config.yaml`  
> **Phiên bản**: `6.1-ENTERPRISE-ABSTRACT`  
> **Mục tiêu**: Giảm 80% chi phí Google Cloud Vertex AI API, loại bỏ lạm dụng model Pro, tối ưu TTL Caching và kiểm soát trần context window 50,000 tokens.

---

```yaml
# ==============================================================================
# UNIVERSAL ANTIGRAVITY GLOBAL SYSTEM CONFIGURATION
# LOCATION: ~/.antigravity/config.yaml
# SCOPE: SYSTEM-WIDE DEFAULT (SYSTEM TENANT ENGINE)
# PURPOSE: GOOGLE CLOUD VERTEX AI COST REDUCTION & TOKEN BUDGET CONTROL
# ==============================================================================

version: "6.1-ENTERPRISE-ABSTRACT"
system_mode: "PRODUCTION_COST_OPTIMIZED"

# 1. QUẢN LÝ CONTEXT WINDOW & CẮT TẢI DỮ LIỆU ĐẦU RA (PRUNING HIGH TOKEN OUTPUTS)
context_management:
  auto_compact_threshold: 50000        # Ngưỡng token cảnh báo nén context tự động
  context_warn_ratio: 0.70             # Cảnh báo khi chạm 70% dung lượng tối đa của model
  enable_auto_compact: true
  
  # CẮT TẢI LOG VẬT LÝ (Tránh việc terminal/query output hàng chục nghìn dòng làm phình Context)
  prune_large_outputs: true
  max_output_tokens_per_tool: 3000     # Tối đa 3,000 tokens cho mỗi kết quả tool execution
  truncate_strategy: "HEAD_AND_TAIL"   # Trích xuất 50 dòng đầu và 50 dòng cuối log

# 2. PHÂN TẦNG MÔ HÌNH DYNAMIC (MODEL ROUTING TỐI ƯU CHI PHÍ VERTEX AI)
# Giảm 80% chi phí bằng cách ép Worker chạy Flash/Flash-Lite và chỉ cấp Pro cho Strategist
model_routing:
  default_worker_model: "gemini-3.8-flash"
  default_fallback_model: "gemini-3.5-flash-lite"
  executive_strategist_model: "gemini-3.8-pro"
  execution_lead_model: "gemini-3.8-pro"

# 3. TỐI ƯU HÓA CONTEXT CACHING & TTL MANAGEMENT (KHẮC PHỤC LÃNG PHÍ CACHING)
context_caching:
  enabled: true
  min_tokens_for_cache: 32768          # Chỉ tạo KV Cache khi prompt vượt mốc 32k tokens
  ttl_seconds: 300                     # TTL 5 phút chuẩn để tránh lãng phí chi phí lưu trữ cache
  reuse_existing_cache: true

# 4. LOẠI BỎ THƯ MỤC NẶNG TOÀN CỤC KHI QUÉT WORKSPACE
global_ignore_patterns:
  - "**/node_modules/**"
  - "**/venv/**"
  - "**/.git/**"
  - "**/*.tmp"
  - "**/*.log"
  - "**/*.dump"
  - "**/build/**"
  - "**/dist/**"
  - "**/credentials.json"
```

---

## 🔍 CHI TIẾT 4 TRỤ CỘT TỐI ƯU HÓA CHI PHÍ VERTEX AI:

### 1. Phân Tầng Mô Hình Động (Model Tier Routing)
- **Vấn đề cũ**: Mọi Agent Worker (gõ lệnh, kiểm tra file, fix lỗi nhỏ) đều gọi mặc định dòng model Pro (`gemini-3.0-pro` / `gemini-3.1-pro`), chiếm tới **75% tổng chi phí Vertex AI** (> ₫900,000).
- **Giải pháp V6.1**:
  - `Worker Nodes (Task execution, scripts, tests)`: Ép buộc chạy **`gemini-3.8-flash`** hoặc **`gemini-3.5-flash-lite`** (giá rẻ hơn 10-20 lần, tốc độ phản hồi cực nhanh).
  - `Executive Strategist & Lead Architect`: Chỉ phân bổ dòng **`gemini-3.8-pro`** cho các bài toán thiết kế kiến trúc vĩ mô, bóc tách User Stories phức tạp và phê duyệt chất lượng.

### 2. Kiểm Soát Context Window & Cắt Tỉa Output (Pruning Large Outputs)
- **Vấn đề cũ**: Log terminal dài hàng nghìn dòng được nạp trực tiếp vào Context Window, làm dung lượng prompt phình to nhanh chóng, ngốn hàng trăm ngàn token vô ích.
- **Giải pháp V6.1**:
  - Bật `prune_large_outputs: true` với trần `max_output_tokens_per_tool: 3000`.
  - Chiến lược `HEAD_AND_TAIL`: Trích xuất 50 dòng đầu và 50 dòng cuối của stdout/stderr để AI nắm bắt lỗi mà không tải rác vào context.
  - Cảnh báo và tự động compact khi chạm ngưỡng **50,000 tokens**.

### 3. Tối Ưu Hóa Context Caching & Quản Trị TTL
- **Vấn đề cũ**: Text Input Caching tái tạo cache liên tục mỗi lần gọi script mà không tận dụng Time-To-Live (TTL), dẫn đến chi phí caching không giảm mà còn tăng.
- **Giải pháp V6.1**:
  - Ngưỡng tối thiểu tạo cache: `min_tokens_for_cache: 32768` (chỉ cache khi prompt đủ lớn).
  - `ttl_seconds: 300` (5 phút): Giữ cache trong vòng lặp tác vụ ngắn và tự hủy để không phát sinh phí lưu trữ rác.
  - Tái sử dụng cache hiện hữu (`reuse_existing_cache: true`).

### 4. Bộ Lọc Workspace Toàn Cục (Global Ignore)
- Tự động bỏ qua các thư mục phình to như `node_modules`, `venv`, `.git`, `.dump`, `.log` khi các agent quét file.
