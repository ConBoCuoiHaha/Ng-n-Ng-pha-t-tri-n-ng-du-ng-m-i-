# Hướng dẫn Test API Category & Soft Delete

## 📌 Yêu cầu
- MongoDB đang chạy (port 27017)
- Server đã start: `npm start`
- Base URL: `http://localhost:3000`

---

## 1️⃣ Category API Endpoints

### 🔹 GET /categories - Lấy tất cả categories
**Test case:**
- ✅ Trả về danh sách categories chưa bị xóa (isDelete = false)
- ✅ Không trả về categories đã bị xóa

```bash
curl http://localhost:3000/categories
```

**Response mẫu:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Electronics",
      "isDelete": false,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### 🔹 GET /categories/:id - Lấy 1 category
**Test case:**
- ✅ Trả về category nếu tồn tại và chưa bị xóa
- ❌ Trả về 404 nếu không tồn tại
- ❌ Trả về 404 nếu đã bị xóa (isDelete = true)

```bash
curl http://localhost:3000/categories/67548abc123def456
```

---

### 🔹 POST /categories - Tạo category mới
**Test case:**
- ✅ Tạo thành công với name hợp lệ
- ❌ Lỗi 400 nếu name rỗng
- ❌ Lỗi 400 nếu name đã tồn tại (duplicate)
- ❌ Lỗi 400 nếu name < 2 ký tự
- ❌ Lỗi 400 nếu name > 100 ký tự

```bash
# Thành công
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Electronics"}'

# Lỗi - name rỗng
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{"name": ""}'

# Lỗi - duplicate
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Electronics"}'
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Tạo category thành công",
  "data": {
    "_id": "...",
    "name": "Electronics",
    "isDelete": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 🔹 PUT /categories/:id - Cập nhật category
**Test case:**
- ✅ Cập nhật thành công với name hợp lệ
- ❌ Lỗi 404 nếu category không tồn tại
- ❌ Lỗi 404 nếu category đã bị xóa
- ❌ Lỗi 400 nếu name rỗng
- ❌ Lỗi 400 nếu name duplicate

```bash
# Thành công
curl -X PUT http://localhost:3000/categories/67548abc123def456 \
  -H "Content-Type: application/json" \
  -d '{"name": "Consumer Electronics"}'
```

---

### 🔹 DELETE /categories/:id - Soft delete category
**Test case:**
- ✅ Soft delete thành công (isDelete = true)
- ✅ Category vẫn còn trong DB nhưng isDelete = true
- ❌ Lỗi 404 nếu category không tồn tại
- ❌ Lỗi 400 nếu đã bị xóa trước đó

```bash
curl -X DELETE http://localhost:3000/categories/67548abc123def456
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Xóa category thành công (soft delete)",
  "data": {
    "_id": "...",
    "name": "Electronics",
    "isDelete": true,
    "updatedAt": "..."
  }
}
```

---

## 2️⃣ Product Soft Delete API

### 🔹 GET /products - Lấy products chưa bị xóa
**Test case:**
- ✅ Chỉ trả về products có isDelete = false
- ✅ Không trả về products đã soft delete

```bash
curl http://localhost:3000/products
```

---

### 🔹 DELETE /products/:id - Soft delete product
**Test case:**
- ✅ Soft delete thành công (isDelete = true)
- ❌ Lỗi 404 nếu product không tồn tại
- ❌ Lỗi 400 nếu đã bị xóa trước đó

```bash
curl -X DELETE http://localhost:3000/products/67548abc123def456
```

---

## 3️⃣ Test Flow đầy đủ

### Kịch bản test Category:
```bash
# 1. Tạo category mới
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Books"}'
# => Lưu lại _id

# 2. Lấy tất cả categories
curl http://localhost:3000/categories
# => Phải thấy "Books"

# 3. Lấy category vừa tạo theo ID
curl http://localhost:3000/categories/<_id>

# 4. Cập nhật category
curl -X PUT http://localhost:3000/categories/<_id> \
  -H "Content-Type: application/json" \
  -d '{"name": "Books & Magazines"}'

# 5. Soft delete
curl -X DELETE http://localhost:3000/categories/<_id>

# 6. Kiểm tra GET all - không thấy category đã xóa
curl http://localhost:3000/categories
# => Không thấy "Books & Magazines"

# 7. Kiểm tra GET by id - trả về 404
curl http://localhost:3000/categories/<_id>
# => 404
```

---

## 4️⃣ Edge Cases cần test

### Validation:
- [ ] Name rỗng hoặc chỉ có khoảng trắng
- [ ] Name quá ngắn (< 2 ký tự)
- [ ] Name quá dài (> 100 ký tự)
- [ ] Name duplicate (unique constraint)
- [ ] ID không hợp lệ (invalid ObjectId)
- [ ] ID không tồn tại

### Soft Delete:
- [ ] Delete 2 lần liên tiếp -> lỗi lần 2
- [ ] GET all sau khi delete -> không thấy item
- [ ] GET by id sau khi delete -> 404
- [ ] Update item đã delete -> 404

### Security:
- [ ] SQL/NoSQL injection trong name
- [ ] XSS trong name field
- [ ] Request với body rỗng
- [ ] Request với JSON không hợp lệ

---

## 5️⃣ Công cụ test khác

### Sử dụng Postman:
1. Import collection với các endpoints trên
2. Tạo environment với BASE_URL = `http://localhost:3000`
3. Chạy test suite

### Sử dụng code test (test-api.js):
```javascript
// Thêm vào file test-api.js
const testCategory = async () => {
  // Test POST
  const createRes = await fetch('http://localhost:3000/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Category' })
  });
  const created = await createRes.json();
  console.log('Created:', created);
  
  // Test GET all
  const getAllRes = await fetch('http://localhost:3000/categories');
  const allCategories = await getAllRes.json();
  console.log('All categories:', allCategories);
  
  // Test DELETE
  const deleteRes = await fetch(`http://localhost:3000/categories/${created.data._id}`, {
    method: 'DELETE'
  });
  const deleted = await deleteRes.json();
  console.log('Deleted:', deleted);
};

testCategory();
```

---

## ✅ Checklist hoàn thành test

- [ ] Tất cả CRUD operations cho Category hoạt động
- [ ] Soft delete cho Category hoạt động đúng
- [ ] Soft delete cho Product hoạt động đúng
- [ ] GET all chỉ trả về items chưa bị xóa
- [ ] Validation hoạt động đúng (rỗng, duplicate, độ dài)
- [ ] Error handling đầy đủ (404, 400, 500)
- [ ] Logging đầy đủ trong console
- [ ] Security: sanitize input, prevent injection

