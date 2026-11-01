# ⚡ DÂY CHUYỀN 5 TẦNG SDLC TỰ ĐỘNG HÓA (FSM PIPELINE & HANDOFF CONTRACT)
*Áp dụng bắt buộc cho Orchestrator (PM) và mọi Worker trong toàn bộ vòng đời phát triển tính năng.*

---

## I. MÔ HÌNH CHUYỂN DỊCH TRẠNG THÁI 5 TẦNG (FINITE STATE MACHINE)

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │ TẦNG 1: BLUEPRINT & WBS 4 CẤP (APEX_STRATEGY / Lead Architect)         │
 │ Deliverable: docs/spec/*.SPEC.md, WBS 4 Cấp trên MySQL                 │
 └──────────────────────────────────┬─────────────────────────────────────┘
                                    │ Kích hoạt tự động khi Spec đã duyệt
                                    ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ TẦNG 2: DATA ARCHITECTURE 3NF (DATA_TIER / Database Architect)         │
 │ Deliverable: migrations/*.sql, DDL Rollback < 60s, SP/Views            │
 └──────────────────────────────────┬─────────────────────────────────────┘
                                    │ Kích hoạt tự động khi DDL đã migrate
                                    ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ TẦNG 3: APPLICATION DEVELOPMENT (SERVICE_TIER & PRESENTATION_TIER)     │
 │ Deliverables: src/backend/ Controllers/Services, src/frontend/ UI PWA  │
 └──────────────────────────────────┬─────────────────────────────────────┘
                                    │ Kích hoạt tự động khi Code hoàn tất
                                    ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ TẦNG 4: ZERO-TRUST AUDIT & SECURITY (AUDIT_TIER / AI-AUDIT-QA)         │
 │ Deliverable: docs/audit/QA_AUDIT_*.md, Quét OWASP, 0% Mock Data        │
 └──────────────────────────────────┬─────────────────────────────────────┘
                                    │ Kích hoạt tự động khi Audit = PASSED
                                    ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ TẦNG 5: PHYSICAL CHROME CDP VALIDATION (AUDIT_TIER / AI-BROWSER)       │
 │ Deliverables: Chrome DevTools click thật, HTTP 200, ảnh chụp .png      │
 └──────────────────────────────────┬─────────────────────────────────────┘
                                    │ Hoàn tất toàn bộ chu trình SDLC
                                    ▼
                          [COMPLETED & SIGNED OFF]
```

---

## II. HỢP ĐỒNG CHUYỂN GIAO TỰ ĐỘNG (AUTOMATED HANDOFF CONTRACT)
1. **NGUYÊN TẮC BẤT BIẾN:** Khi Tầng $K$ hoàn thành và đã ký số (`sign-task`) đưa deliverables lên hệ thống, Orchestrator (PM) **BẮT BUỘC TỰ ĐỘNG KÍCH HOẠT TẦNG $K+1$**.
2. **CẤM NGỒI THỤ ĐỘNG CHỜ BOSS:** PM không được phép chờ Boss nhắc việc nếu các điều kiện tiền đề của Tầng $K+1$ đã thỏa mãn.
3. **CỔNG CHẶN CHẤT LƯỢNG (QUALITY GATES):**
   - Nếu Tầng $K$ bị Tòa án Audit (Tầng 4) đánh rớt (`REJECTED`), PM tự động định tuyến Task trả về đúng Worker Tầng $K$ để khắc phục kèm Bệnh án kỹ thuật chi tiết.
   - Tuyệt đối không cho phép task chưa qua kiểm toán Tầng 4 bước sang nghiệm thu Tầng 5.
