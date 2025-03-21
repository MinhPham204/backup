// function login() {
//     fetch('http://localhost:3000/login', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             username: 'ten_nguoi_dung',
//             password: 'mat_khau'
//         })
//     })
//         .then(response => response.json())
//         .then(data => {
//             if (data.token) {
//                 localStorage.setItem('token', data.token);
//                 localStorage.setItem('role', data.role); // Lưu role nếu cần
//                 console.log('Đăng nhập thành công');
//             } else {
//                 console.log(data.message);
//             }
//         })
//         .catch(error => console.error('Lỗi:', error));
// }

// function getProtectedData() {
//     fetch('http://localhost:3000/protected', {
//         headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//     })
//         .then(response => response.json())
//         .then(data => console.log(data))
//         .catch(error => console.error('Lỗi:', error));
// }