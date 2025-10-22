# NNPTUD-S5

## Upload ảnh & Avatar

- UI: mở `public/upload.html` (được phục vụ tĩnh tại `http://localhost:3000/upload.html`).
- API:
  - `POST /files/uploads` — upload 1 ảnh (field `image`). Trả về URL `/files/{filename}`.
  - `POST /files/uploadMulti` — upload nhiều ảnh (field `image`, multiple). Trả về mảng URL `/files/{filename}`.
  - `POST /users/avatar` — upload avatar (field `avatar`, yêu cầu đăng nhập). Trả về `{ avatarURL }`.
  - `GET /files/:filename` — tải file/ảnh về. Server tự tìm trong `resources/files` và `resources/images`.

Lưu ý: cần đăng nhập qua `POST /auth/login` trước khi gọi API avatar để nhận cookie `token`.

## Kết nối MongoDB Compass

1) Mở MongoDB Compass, chọn kết nối bạn đang dùng, bấm biểu tượng copy Connection String.
   - Ví dụ local: `mongodb://127.0.0.1:27017/NNPTUD-S5`
   - Ví dụ Atlas/SRV: `mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/NNPTUD-S5?retryWrites=true&w=majority&appName=...`

2) Đặt biến môi trường `MONGODB_URI` trước khi chạy app:
   - PowerShell (Windows, phiên hiện tại):
     `$env:MONGODB_URI = "<dán connection string từ Compass>"`
     `npm start`
   - CMD:
     `set MONGODB_URI=<connection string>` rồi `npm start`

3) Ứng dụng sẽ ưu tiên `process.env.MONGODB_URI`, nếu không có sẽ fallback `mongodb://localhost:27017/NNPTUD-S5`.

Ghi chú:
- Nếu connection string có khoảng trắng/ký tự đặc biệt, hãy bọc bằng dấu ngoặc kép khi đặt biến môi trường.
- Với Atlas, nhớ whitelist IP hoặc dùng `0.0.0.0/0` cho phát triển, và thay `USERNAME/PASSWORD` chính xác.
