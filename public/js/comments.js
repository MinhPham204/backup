document.addEventListener("DOMContentLoaded", function () {
    const role = localStorage.getItem("role");

    if (role == "1") {
        document.getElementById("commentForm").style.display = "none";
    }

    loadComments();
});

// Gửi bình luận
async function submitComment() {
    const text = document.getElementById("commentText").value;
    const token = localStorage.getItem("token");

    const response = await fetch("/comment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text })
    });

    if (response.ok) {
        document.getElementById("commentText").value = ""; // Xóa nội dung nhập
        loadComments(); // Cập nhật danh sách bình luận
    }
}

// Lấy danh sách bình luận từ server
async function loadComments() {
    const response = await fetch("/comments");
    const comments = await response.json();

    const commentsContainer = document.getElementById("commentsContainer");
    commentsContainer.innerHTML = "";

    comments.forEach(comment => {
        const commentElement = document.createElement("div");
        commentElement.classList.add("border", "p-3", "rounded", "bg-light", "mb-2");

        commentElement.innerHTML = `
            <strong>${comment.username}</strong> <small class="text-muted">${new Date(comment.created_at).toLocaleString()}</small>
            <p>${comment.text}</p>
        `;
        commentsContainer.appendChild(commentElement);
    });
}
