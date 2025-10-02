LoadData();

//GET: domain:port//posts
//GET: domain:port/posts/id
async function LoadData() {
    try {
        let data = await fetch('http://localhost:3000/posts');
        let posts = await data.json();
        
        // Xóa nội dung cũ trong table
        let body = document.getElementById("body");
        body.innerHTML = "";
        
        // Chỉ hiển thị các post chưa bị xóa mềm
        for (const post of posts) {
            if(!post.isDelete){
                body.innerHTML += convertDataToHTML(post);
            }
        }
        
        // Cập nhật thống kê
        updateStats(posts);
        
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        alert('Lỗi khi tải dữ liệu: ' + error.message);
    }
}

function convertDataToHTML(post) {
    let result = "<tr>";
    result += "<td><span class='id-display'>ID: " + post.id + "</span></td>";
    result += "<td><strong>" + post.title + "</strong></td>";
    result += "<td><span class='views-display'>👁️ " + post.views.toLocaleString() + "</span></td>";
    result += "<td><button class='btn btn-danger' onclick='Delete(\""+post.id+"\")'>🗑️ Xóa</button></td>";
    result += "</tr>";
    return result;
}

// Hàm lấy ID tự tăng - cải tiến để xử lý cả string và number
async function getMaxID(){
    try {
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json();
        
        // Lọc ra các ID hợp lệ (loại bỏ null, undefined, empty string)
        let validIds = posts
            .map(post => post.id)
            .filter(id => id !== null && id !== undefined && id !== '')
            .map(id => {
                // Chuyển đổi sang number, nếu không được thì trả về 0
                let numId = parseInt(id);
                return isNaN(numId) ? 0 : numId;
            });
        
        // Nếu không có ID nào hợp lệ, trả về 0
        if (validIds.length === 0) {
            return 0;
        }
        
        return Math.max(...validIds);
    } catch (error) {
        console.error('Lỗi khi lấy Max ID:', error);
        return 0;
    }
}

// Hàm tạo ID tự tăng mới
async function generateNewID(){
    let maxId = await getMaxID();
    return (maxId + 1).toString();
}



//POST: domain:port//posts + body
async function SaveData(){
    try {
        let id = document.getElementById("id").value;
        let title = document.getElementById("title").value;
        let view = document.getElementById("view").value;
        
        // Validate input
        if (!title.trim()) {
            alert('Vui lòng nhập tiêu đề!');
            return;
        }
        
        if (!view || isNaN(parseInt(view))) {
            alert('Vui lòng nhập số lượt xem hợp lệ!');
            return;
        }
        
        let dataObj = {
            title: title.trim(),
            views: parseInt(view),
            isDelete: false // Mặc định không bị xóa
        };
        
        // Kiểm tra xem có phải update hay create mới
        if (id && id.trim()) {
            // Update existing post
            let response = await fetch("http://localhost:3000/posts/" + id);
            if (response.ok) {
                dataObj.id = id;
                let res = await fetch('http://localhost:3000/posts/' + id, {
                    method: 'PUT',
                    body: JSON.stringify(dataObj),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                
                if (res.ok) {
                    alert('Cập nhật bài viết thành công!');
                    LoadData(); // Reload data
                    clearForm();
                } else {
                    alert('Lỗi khi cập nhật bài viết!');
                }
            } else {
                alert('Không tìm thấy bài viết với ID: ' + id);
            }
        } else {
            // Create new post với ID tự tăng
            dataObj.id = await generateNewID();
            let res = await fetch('http://localhost:3000/posts', {
                method: 'POST',
                body: JSON.stringify(dataObj),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            if (res.ok) {
                alert('Tạo bài viết mới thành công với ID: ' + dataObj.id);
                LoadData(); // Reload data
                clearForm();
            } else {
                alert('Lỗi khi tạo bài viết mới!');
            }
        }
    } catch (error) {
        console.error('Lỗi khi lưu dữ liệu:', error);
        alert('Lỗi khi lưu dữ liệu: ' + error.message);
    }
}

// Hàm xóa form sau khi lưu
function clearForm() {
    document.getElementById("id").value = "";
    document.getElementById("title").value = "";
    document.getElementById("view").value = "";
}
//PUT: domain:port//posts/id + body

//SOFT DELETE: domain:port//posts/id (thay vì xóa cứng, chỉ đánh dấu isDelete = true)
async function Delete(id){
    try {
        // Xác nhận trước khi xóa
        if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            return;
        }
        
        let res = await fetch('http://localhost:3000/posts/' + id);
        if (res.ok) {
            let obj = await res.json();
            
            // Kiểm tra xem đã bị xóa chưa
            if (obj.isDelete) {
                alert('Bài viết này đã bị xóa rồi!');
                LoadData(); // Reload để cập nhật UI
                return;
            }
            
            // Thực hiện soft delete
            obj.isDelete = true;
            obj.deletedAt = new Date().toISOString(); // Thêm thời gian xóa để tracking
            
            let result = await fetch('http://localhost:3000/posts/' + id, {
                method: 'PUT',
                body: JSON.stringify(obj),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            if (result.ok) {
                alert('Xóa bài viết thành công!');
                LoadData(); // Reload data để cập nhật UI
            } else {
                alert('Lỗi khi xóa bài viết!');
            }
        } else {
            alert('Không tìm thấy bài viết với ID: ' + id);
        }
    } catch (error) {
        console.error('Lỗi khi xóa bài viết:', error);
        alert('Lỗi khi xóa bài viết: ' + error.message);
    }
}

// Hàm khôi phục bài viết đã bị xóa mềm (bonus feature)
async function RestorePost(id) {
    try {
        let res = await fetch('http://localhost:3000/posts/' + id);
        if (res.ok) {
            let obj = await res.json();
            obj.isDelete = false;
            delete obj.deletedAt; // Xóa thời gian xóa
            
            let result = await fetch('http://localhost:3000/posts/' + id, {
                method: 'PUT',
                body: JSON.stringify(obj),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            if (result.ok) {
                alert('Khôi phục bài viết thành công!');
                LoadData();
            } else {
                alert('Lỗi khi khôi phục bài viết!');
            }
        }
    } catch (error) {
        console.error('Lỗi khi khôi phục bài viết:', error);
        alert('Lỗi khi khôi phục bài viết: ' + error.message);
    }
}

// Hàm cập nhật thống kê
function updateStats(posts) {
    try {
        const totalPosts = posts.length;
        const activePosts = posts.filter(post => !post.isDelete).length;
        const deletedPosts = posts.filter(post => post.isDelete).length;
        const totalViews = posts
            .filter(post => !post.isDelete)
            .reduce((sum, post) => sum + (parseInt(post.views) || 0), 0);
        
        // Cập nhật UI với design đẹp hơn
        const statsElement = document.getElementById('stats');
        if (statsElement) {
            statsElement.innerHTML = `
                <div class="stat-item">
                    <div class="stat-number">${totalPosts}</div>
                    <div class="stat-label">Tổng bài viết</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${activePosts}</div>
                    <div class="stat-label">Đang hiển thị</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${deletedPosts}</div>
                    <div class="stat-label">Đã xóa mềm</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${totalViews.toLocaleString()}</div>
                    <div class="stat-label">Tổng lượt xem</div>
                </div>
            `;
        }
        
        // Hiển thị empty state nếu không có bài viết nào
        const emptyState = document.getElementById('emptyState');
        const tableContainer = document.querySelector('.table-container table');
        
        if (activePosts === 0) {
            if (emptyState) emptyState.style.display = 'block';
            if (tableContainer) tableContainer.style.display = 'none';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            if (tableContainer) tableContainer.style.display = 'table';
        }
        
    } catch (error) {
        console.error('Lỗi khi cập nhật thống kê:', error);
    }
}