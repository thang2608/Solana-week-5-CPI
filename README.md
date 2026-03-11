# 🏦 Solana Week 5: Cross-Program Invocation (CPI)

Dự án Tuần 5 tập trung vào kỹ thuật **Cross-Program Invocation (CPI)** trên Solana. Đây là cơ chế cho phép các chương trình (Smart Contracts) tương tác trực tiếp với nhau, tạo tiền đề cho các hệ thống DeFi phức tạp.

## 🌟 Tổng quan hệ thống

Hệ thống bao gồm hai chương trình độc lập tương tác qua lại:

1.  **`bank-app` (Ngân hàng):** Quản lý dòng tiền của người dùng. Chương trình này đóng vai trò là "người gọi" (Caller), sử dụng CPI để chuyển tiền sang quỹ Staking.
2.  **`staking-app` (Quỹ Staking):** Quản lý logic trả lãi (APR 5%) và lưu trữ token. Chương trình này nhận lệnh từ Ngân hàng và xác thực quyền sở hữu qua PDA.

## 🔑 Program Addresses

Dưới đây là địa chỉ chính thức của các chương trình trong dự án này:

| Program | Program ID (Address) |
| :--- | :--- |
| **Bank App** | `ENBtoHpt5i3bYqzisMbwydRPWLSA7MvHEvCzzPTtq69o` |
| **Staking App** | `B7vL89GpEbW2wxALb9eb8QQy5UuG34Fgk59aNBQmYtx4` |

## 🧠 Kiến thức trọng tâm

* **CpiContext:** Cách thiết lập môi trường để gọi hàm từ một chương trình khác.
* **PDA Signatures:** Sử dụng `invoke_signed` để Ngân hàng có thể ký thay người dùng khi tương tác với Quỹ Staking.
* **SPL Token Integration:** Quản lý gửi/rút/stake các đồng Token tùy chỉnh theo chuẩn SPL.
* **Error Handling:** Xử lý lỗi xuyên suốt giữa các chương trình (Cross-program error propagation).

## 🚀 Hướng dẫn khởi chạy

### Cài đặt môi trường
```bash
yarn install
