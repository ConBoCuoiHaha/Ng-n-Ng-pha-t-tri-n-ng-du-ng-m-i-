const axios = require('axios');

// Base URL for API
const BASE_URL = 'http://localhost:3000';

// Test data
let testToken = '';
let testUserId = '';
let testCategoryId = '';
let testProductId = '';

async function testAPI() {
    console.log('🚀 Bắt đầu test API...\n');

    try {
        // 1. Test tạo user mới
        console.log('1️⃣ Testing user creation...');
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            fullName: 'Test User',
            role: 'USER'
        };
        
        const userResponse = await axios.post(`${BASE_URL}/users`, userData);
        testUserId = userResponse.data.data._id;
        console.log('✅ User created:', userResponse.data);
        console.log('');

        // 2. Test login
        console.log('2️⃣ Testing login...');
        const loginData = {
            username: 'testuser',
            password: 'password123'
        };
        
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
        testToken = loginResponse.data.data.token;
        console.log('✅ Login successful:', loginResponse.data);
        console.log('');

        // 3. Test tạo category (cần role MOD hoặc ADMIN)
        console.log('3️⃣ Testing category creation...');
        const categoryData = {
            name: 'Electronics',
            description: 'Electronic devices and gadgets'
        };
        
        const categoryResponse = await axios.post(`${BASE_URL}/categories`, categoryData, {
            headers: { 'Authorization': `Bearer ${testToken}` }
        });
        testCategoryId = categoryResponse.data.data._id;
        console.log('✅ Category created:', categoryResponse.data);
        console.log('');

        // 4. Test tạo product
        console.log('4️⃣ Testing product creation...');
        const productData = {
            name: 'iPhone 15',
            description: 'Latest iPhone model',
            price: 999,
            category: testCategoryId,
            stock: 50
        };
        
        const productResponse = await axios.post(`${BASE_URL}/products`, productData, {
            headers: { 'Authorization': `Bearer ${testToken}` }
        });
        testProductId = productResponse.data.data._id;
        console.log('✅ Product created:', productResponse.data);
        console.log('');

        // 5. Test get all products
        console.log('5️⃣ Testing get all products...');
        const getProductsResponse = await axios.get(`${BASE_URL}/products`, {
            headers: { 'Authorization': `Bearer ${testToken}` }
        });
        console.log('✅ Products retrieved:', getProductsResponse.data);
        console.log('');

        // 6. Test get all categories
        console.log('6️⃣ Testing get all categories...');
        const getCategoriesResponse = await axios.get(`${BASE_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${testToken}` }
        });
        console.log('✅ Categories retrieved:', getCategoriesResponse.data);
        console.log('');

        // 7. Test update product
        console.log('7️⃣ Testing product update...');
        const updateProductData = {
            name: 'iPhone 15 Pro',
            price: 1199,
            stock: 30
        };
        
        const updateProductResponse = await axios.put(`${BASE_URL}/products/${testProductId}`, updateProductData, {
            headers: { 'Authorization': `Bearer ${testToken}` }
        });
        console.log('✅ Product updated:', updateProductResponse.data);
        console.log('');

        // 8. Test get products by category
        console.log('8️⃣ Testing get products by category...');
        const getProductsByCategoryResponse = await axios.get(`${BASE_URL}/categories/${testCategoryId}/products`, {
            headers: { 'Authorization': `Bearer ${testToken}` }
        });
        console.log('✅ Products by category:', getProductsByCategoryResponse.data);
        console.log('');

        console.log('🎉 Tất cả test đều thành công!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Test authorization levels
async function testAuthorization() {
    console.log('\n🔐 Testing authorization levels...\n');

    try {
        // Test với USER role - chỉ có thể view
        console.log('Testing USER permissions...');
        
        // View products - should work
        await axios.get(`${BASE_URL}/products`, {
            headers: { 'Authorization': `Bearer ${testToken}` }
        });
        console.log('✅ USER can view products');

        // Try to create product - should fail
        try {
            await axios.post(`${BASE_URL}/products`, {
                name: 'Unauthorized Product',
                price: 100,
                category: testCategoryId
            }, {
                headers: { 'Authorization': `Bearer ${testToken}` }
            });
            console.log('❌ USER should not be able to create products');
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ USER correctly denied product creation');
            }
        }

        // Try to delete product - should fail
        try {
            await axios.delete(`${BASE_URL}/products/${testProductId}`, {
                headers: { 'Authorization': `Bearer ${testToken}` }
            });
            console.log('❌ USER should not be able to delete products');
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ USER correctly denied product deletion');
            }
        }

    } catch (error) {
        console.error('❌ Authorization test failed:', error.response?.data || error.message);
    }
}

// Run tests
if (require.main === module) {
    testAPI().then(() => {
        testAuthorization();
    });
}

module.exports = { testAPI, testAuthorization };
