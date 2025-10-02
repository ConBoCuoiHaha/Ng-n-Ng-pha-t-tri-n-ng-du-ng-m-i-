// Script test API để tạo dữ liệu mẫu
// Chạy: node test-api.js

const http = require('http');

// Helper function để gọi API
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(body)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: body
                    });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Main test function
async function testAPI() {
    console.log('========================================');
    console.log('BẮT ĐẦU TEST API - TẠO DỮ LIỆU MẪU');
    console.log('========================================\n');

    try {
        // 1. Tạo Role Admin
        console.log('1️⃣ Tạo Role: Admin...');
        const roleAdmin = await makeRequest('POST', '/roles', {
            name: 'Admin',
            description: 'Quản trị viên hệ thống'
        });
        console.log('✅ Kết quả:', roleAdmin.status);
        console.log('   Data:', JSON.stringify(roleAdmin.data, null, 2));
        const adminRoleId = roleAdmin.data.data?._id;
        console.log('   Role ID:', adminRoleId, '\n');

        // 2. Tạo Role User
        console.log('2️⃣ Tạo Role: User...');
        const roleUser = await makeRequest('POST', '/roles', {
            name: 'User',
            description: 'Người dùng thông thường'
        });
        console.log('✅ Kết quả:', roleUser.status);
        console.log('   Data:', JSON.stringify(roleUser.data, null, 2));
        const userRoleId = roleUser.data.data?._id;
        console.log('   Role ID:', userRoleId, '\n');

        // 3. Tạo User 1
        console.log('3️⃣ Tạo User: admin...');
        const user1 = await makeRequest('POST', '/users', {
            username: 'admin',
            password: '123456',
            email: 'admin@example.com',
            fullName: 'Nguyễn Văn Admin',
            avatarUrl: 'https://i.pravatar.cc/150?img=1',
            role: adminRoleId
        });
        console.log('✅ Kết quả:', user1.status);
        console.log('   Data:', JSON.stringify(user1.data, null, 2), '\n');

        // 4. Tạo User 2
        console.log('4️⃣ Tạo User: john...');
        const user2 = await makeRequest('POST', '/users', {
            username: 'john',
            password: 'pass123',
            email: 'john@example.com',
            fullName: 'John Doe',
            role: userRoleId
        });
        console.log('✅ Kết quả:', user2.status);
        console.log('   Data:', JSON.stringify(user2.data, null, 2), '\n');

        // 5. Tạo User 3
        console.log('5️⃣ Tạo User: jane...');
        const user3 = await makeRequest('POST', '/users', {
            username: 'jane',
            password: 'pass456',
            email: 'jane@example.com',
            fullName: 'Jane Smith',
            avatarUrl: 'https://i.pravatar.cc/150?img=5',
            role: userRoleId
        });
        console.log('✅ Kết quả:', user3.status);
        console.log('   Data:', JSON.stringify(user3.data, null, 2), '\n');

        // 6. Lấy tất cả roles
        console.log('6️⃣ GET All Roles...');
        const allRoles = await makeRequest('GET', '/roles');
        console.log('✅ Kết quả:', allRoles.status);
        console.log('   Số lượng roles:', allRoles.data.data?.length, '\n');

        // 7. Lấy tất cả users
        console.log('7️⃣ GET All Users...');
        const allUsers = await makeRequest('GET', '/users');
        console.log('✅ Kết quả:', allUsers.status);
        console.log('   Số lượng users:', allUsers.data.data?.length, '\n');

        // 8. Tìm kiếm user theo username
        console.log('8️⃣ Search Users với search="john"...');
        const searchUsers = await makeRequest('GET', '/users?search=john');
        console.log('✅ Kết quả:', searchUsers.status);
        console.log('   Số lượng tìm thấy:', searchUsers.data.data?.length, '\n');

        // 9. Get user theo username
        console.log('9️⃣ GET User by username: "admin"...');
        const userByUsername = await makeRequest('GET', '/users/username/admin');
        console.log('✅ Kết quả:', userByUsername.status);
        console.log('   User:', JSON.stringify(userByUsername.data.data, null, 2), '\n');

        // 10. Verify user
        console.log('🔟 Verify User với email và username...');
        const verifyResult = await makeRequest('POST', '/users/verify', {
            email: 'admin@example.com',
            username: 'admin'
        });
        console.log('✅ Kết quả:', verifyResult.status);
        console.log('   Data:', JSON.stringify(verifyResult.data, null, 2), '\n');

        console.log('========================================');
        console.log('✅ HOÀN THÀNH! Kiểm tra MongoDB Compass');
        console.log('   Database: NNPTUD-S5');
        console.log('   Collections: users, roles');
        console.log('========================================');

    } catch (error) {
        console.error('❌ LỖI:', error.message);
        console.log('\n⚠️  Hãy chắc chắn server đã chạy: npm start');
    }
}

// Chạy test
testAPI();


