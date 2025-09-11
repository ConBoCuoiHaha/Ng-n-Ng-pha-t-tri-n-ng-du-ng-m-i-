LoadData();
//GET: domain:port//posts
//GET: domain:port/posts/id
async function LoadData() {
  let data = await fetch("http://localhost:3000/posts");
  let posts = await data.json();
  for (const post of posts) {
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

    let checkResponse = await fetch("http://localhost:3000/posts/" + id);

    if (checkResponse.ok) {
      let dataObj = {
        title: title,
        views: view,
      };
      let updateResponse = await fetch("http://localhost:3000/posts/" + id, {
        method: "PUT",
        body: JSON.stringify(dataObj),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(updateResponse);
    } else {
      let dataObj = {
        id: id,
        title: title,
        views: view,
      };
      let createResponse = await fetch("http://localhost:3000/posts", {
        method: "POST",
        body: JSON.stringify(dataObj),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(createResponse);
    }
  } catch (error) {
    console.error("Error saving data:", error);
  }
}
//PUT: domain:port//posts/id + body

//DELETE: domain:port//posts/id
async function Delete(id) {
  try {
    await fetch("http://localhost:3000/posts/" + id, {
      method: "DELETE",
    });
    console.log("Delete thanh cong");
  } catch (error) {
    console.error("Error deleting data:", error);
  }
}
