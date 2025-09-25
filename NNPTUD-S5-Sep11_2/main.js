LoadData();
//GET: domain:port//posts
//GET: domain:port/posts/id
async function LoadData() {
  let data = await fetch("http://localhost:3000/posts");
  let posts = await data.json();
  // Chỉ hiển thị các bản ghi chưa bị xóa mềm
  let activePosts = posts.filter(post => !post.isDeleted);
  for (const post of activePosts) {
    let body = document.getElementById("body");
    body.innerHTML += convertDataToHTML(post);
  }
}
async function LoadDataA() {
  try {
    let data = await fetch("http://localhost:3000/posts");
    let posts = await data.json();
    for (const post of posts) {
      let body = document.getElementById("body");
      body.innerHTML += convertDataToHTML(post);
    }
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

function convertDataToHTML(post) {
  let result = "<tr>";
  result += "<td>" + post.id + "</td>";
  result += "<td>" + post.title + "</td>";
  result += "<td>" + post.views + "</td>";
  result +=
    "<td><input type='submit' value='Delete' onclick='Delete(" +
    post.id +
    ")'></input></td>";
  result += "</tr>";
  return result;
}

//POST: domain:port//posts + body
async function SaveData() {
  try {
    let id = document.getElementById("id").value;
    let title = document.getElementById("title").value;
    let view = document.getElementById("view").value;

    if (id) {
      // Nếu có ID thì update
      let checkResponse = await fetch("http://localhost:3000/posts/" + id);
      if (checkResponse.ok) {
        let dataObj = {
          title: title,
          views: view,
          isDeleted: false
        };
        let updateResponse = await fetch("http://localhost:3000/posts/" + id, {
          method: "PUT",
          body: JSON.stringify(dataObj),
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Updated successfully");
      }
    } else {
      // Nếu không có ID thì tạo mới với ID tự tăng
      let data = await fetch("http://localhost:3000/posts");
      let posts = await data.json();
      
      // Tìm ID lớn nhất và tăng lên 1
      let maxId = 0;
      posts.forEach(post => {
        let postId = parseInt(post.id);
        if (postId > maxId) {
          maxId = postId;
        }
      });
      let newId = maxId + 1;

      let dataObj = {
        id: newId.toString(),
        title: title,
        views: view,
        isDeleted: false
      };
      let createResponse = await fetch("http://localhost:3000/posts", {
        method: "POST",
        body: JSON.stringify(dataObj),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Created successfully with ID:", newId);
    }
    
    // Refresh trang sau khi lưu
    location.reload();
  } catch (error) {
    console.error("Error saving data:", error);
  }
}
//PUT: domain:port//posts/id + body

//SOFT DELETE: Cập nhật isDeleted = true thay vì xóa cứng
async function Delete(id) {
  try {
    // Lấy thông tin bản ghi hiện tại
    let response = await fetch("http://localhost:3000/posts/" + id);
    let post = await response.json();
    
    // Cập nhật trường isDeleted = true
    let dataObj = {
      ...post,
      isDeleted: true
    };
    
    await fetch("http://localhost:3000/posts/" + id, {
      method: "PUT",
      body: JSON.stringify(dataObj),
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log("Soft delete successful for ID:", id);
    // Refresh trang để cập nhật danh sách
    location.reload();
  } catch (error) {
    console.error("Error soft deleting data:", error);
  }
}
