# 🚀 HƯỚNG DẪN CHẠY VÀ TEST API

## Bước 1: Khởi động Server

Mở terminal/cmd tại thư mục `NNPTUD-S5-25Sep_DB` và chạy:

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

Bạn sẽ thấy log: `connected` khi kết nối MongoDB thành công.

---

## Bước 2: Tạo Dữ Liệu Mẫu

**Cách 1: Dùng script tự động**

Mở terminal thứ 2 (giữ terminal server chạy) và chạy:

```bash
cd NNPTUD-S5-25Sep_DB
node test-api.js
```

**Cách 2: Dùng Postman hoặc curl**

### 2.1. Tạo Role Admin
```bash
curl -X POST http://localhost:3000/roles ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Admin\",\"description\":\"Quan tri vien\"}"
```

Lưu `_id` của role vừa tạo (ví dụ: `67033abc123def456789`)

### 2.2. Tạo User
```bash
curl -X POST http://localhost:3000/users ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"123456\",\"email\":\"admin@example.com\",\"fullName\":\"Nguyen Van Admin\",\"role\":\"67033abc123def456789\"}"
```
(Thay `67033abc123def456789` bằng role ID thực tế)

---

## Bước 3: Test Các API

### GET All Users
```bash
curl http://localhost:3000/users
```

### GET All Users với Search
```bash
curl "http://localhost:3000/users?search=admin"
```

### GET User theo ID
```bash
curl http://localhost:3000/users/USER_ID_O_DAY
```

### GET User theo Username
```bash
curl http://localhost:3000/users/username/admin
```

### Verify User (chuyển status = true)
```bash
curl -X POST http://localhost:3000/users/verify ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"username\":\"admin\"}"
```

### Update User
```bash
curl -X PUT http://localhost:3000/users/USER_ID_O_DAY ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\":\"Updated Name\"}"
```

### Soft Delete User
```bash
curl -X DELETE http://localhost:3000/users/USER_ID_O_DAY
```

---

## Bước 4: Kiểm tra MongoDB Compass

1. Mở MongoDB Compass
2. Kết nối: `mongodb://localhost:27017`
3. Chọn database: **NNPTUD-S5**
4. Bạn sẽ thấy 2 collections:
   - `roles` - chứa các role đã tạo
   - `users` - chứa các user đã tạo

---

## API Endpoints Tóm Tắt

### ROLES
- `POST   /roles` - Tạo role mới
- `GET    /roles` - Lấy tất cả roles
- `GET    /roles/:id` - Lấy role theo ID
- `PUT    /roles/:id` - Cập nhật role
- `DELETE /roles/:id` - Xóa mềm role

### USERS  
- `POST   /users` - Tạo user mới
- `GET    /users?search=keyword` - Lấy users (có search)
- `GET    /users/:id` - Lấy user theo ID
- `GET    /users/username/:username` - Lấy user theo username
- `PUT    /users/:id` - Cập nhật user
- `DELETE /users/:id` - Xóa mềm user
- `POST   /users/verify` - Verify user

---

## Lưu Ý

- Server phải chạy trước khi test API
- MongoDB phải chạy tại `mongodb://localhost:27017`
- Tạo Role trước khi tạo User (vì User cần role ID)
- Password trong ví dụ chưa được hash (nên thêm bcrypt trong production)


