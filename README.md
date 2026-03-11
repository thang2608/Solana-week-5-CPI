# 🏦 Solana Week 5: Cross-Program Invocation (CPI)

Dự án Tuần 5 tập trung vào kỹ thuật **Cross-Program Invocation (CPI)** trên Solana. Đây là cơ chế cho phép các chương trình (Smart Contracts) tương tác trực tiếp với nhau, tạo tiền đề cho các hệ thống DeFi phức tạp. 

Dự án này đã được triển khai (Deploy) thành công lên mạng **Solana Devnet**.

## 🌐 Devnet Program Addresses

Các Smart Contract đã được live trên Devnet. Bạn có thể kiểm tra trực tiếp trạng thái của chúng trên Solscan:

| Program | Program ID (Address) | Solscan Link |
| :--- | :--- | :--- |
| **Bank App** | `ENBtoHpt5i3bYqzisMbwydRPWLSA7MvHEvCzzPTtq69o` | [View on Solscan](https://solscan.io/account/ENBtoHpt5i3bYqzisMbwydRPWLSA7MvHEvCzzPTtq69o?cluster=devnet) |
| **Staking App** | `B7vL89GpEbW2wxALb9eb8QQy5UuG34Fgk59aNBQmYtx4` | [View on Solscan](https://solscan.io/account/B7vL89GpEbW2wxALb9eb8QQy5UuG34Fgk59aNBQmYtx4?cluster=devnet) |

## 🌟 Tổng quan hệ thống

Hệ thống bao gồm hai chương trình độc lập tương tác qua lại:
1. **`bank-app` (Ngân hàng):** Quản lý dòng tiền của người dùng. Chương trình này đóng vai trò là "người gọi" (Caller), sử dụng CPI để chuyển tiền sang quỹ Staking.
2. **`staking-app` (Quỹ Staking):** Quản lý logic trả lãi (APR 5%) và lưu trữ token. Chương trình này nhận lệnh từ Ngân hàng và xác thực quyền sở hữu qua PDA.

## 🧠 Kiến thức trọng tâm
* **CpiContext:** Thiết lập môi trường để gọi hàm từ một chương trình khác.
* **PDA Signatures:** Sử dụng `invoke_signed` để chương trình Ngân hàng có thể ký thay người dùng khi chuyển tiền.
* **SPL Token Integration:** Quản lý nạp/rút/stake các Token tùy chỉnh theo chuẩn SPL.

## 🚀 Hướng dẫn khởi chạy (Môi trường Devnet)

Đảm bảo bạn đã cấu hình Solana CLI sang Devnet (`solana config set --url devnet`) và có đủ SOL làm phí gas.

```bash
# Cài đặt thư viện
yarn install

# Đồng bộ ID chương trình
anchor keys sync

# Biên dịch chương trình
anchor build

# Chạy test (đảm bảo file Anchor.toml đang trỏ tới Devnet)
anchor test
