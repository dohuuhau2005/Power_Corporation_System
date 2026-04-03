# Power Corporation Frontend

React frontend application cho Power Corporation Management System.

## Tính Năng

### Admin Dashboard
- 📊 **Tổng Quan**: Xem số liệu thống kê hệ thống
- 🏢 **Quản Lý Chi Nhánh**: CRUD operations cho chi nhánh
- 👥 **Quản Lý Nhân Viên**: Thêm, sửa, xóa nhân viên
- 🛡️ **Kiểm Soát Vai Trò**: Quản lý quyền hạn người dùng

### Employee Dashboard
- 👤 **Thông Tin Cá Nhân**: Xem hồ sơ nhân viên
- 👥 **Quản Lý Khách Hàng**: Xem, thêm, xóa khách hàng
- 📋 **Quản Lý Hóa Đơn**: Tạo và theo dõi hóa đơn điện
- 📊 **Báo Cáo**: Xem lịch sử giao dịch

## Công Nghệ Sử Dụng

- **React 18** - UI Library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Zustand** - State management
- **Vite** - Build tool
- **Tailwind CSS** - Styling (optional)

## Cài Đặt

### Yêu Cầu
- Node.js >= 16.0.0
- npm hoặc yarn

### Steps

1. **Cài đặt dependencies**
```bash
cd frontend
npm install
```

2. **Cấu hình API**
Mở file `src/services/api.js` và sửa `API_BASE_URL` nếu cần:
```javascript
const API_BASE_URL = 'http://localhost:9999'
```

3. **Chạy development server**
```bash
npm run dev
```
Ứng dụng sẽ chạy trên `http://localhost:3000`

4. **Build production**
```bash
npm run build
```

## Cấu Trúc Thư Mục

```
src/
├── components/          # Reusable components
│   ├── AdminLayout.jsx
│   ├── EmployeeLayout.jsx
│   ├── PrivateRoute.jsx
│   ├── Table.jsx
│   └── StatCard.jsx
├── pages/              # Page components
│   ├── AdminDashboard.jsx
│   ├── EmployeeDashboard.jsx
│   ├── LoginPage.jsx
│   ├── admin/
│   │   ├── AdminOverview.jsx
│   │   ├── SitesManagement.jsx
│   │   └── StaffsManagement.jsx
│   └── employee/
│       ├── EmployeeOverview.jsx
│       ├── CustomersManagement.jsx
│       └── BillsManagement.jsx
├── services/           # API services
│   └── api.js
├── store/              # State management
│   └── authStore.js
├── App.jsx
├── main.jsx
└── index.css
```

## Tài Khoản Demo

- **Admin**: MaTK: `NV_000`, Password: `123456`
- **Staff**: MaTK: `NV_101`, Password: `123456`
- **Manager**: MaTK: `NV_301`, Password: `123456`

## API Integration

Frontend kết nối với backend tại:
- **URL**: `http://localhost:9999`
- **Authentication**: JWT tokens lưu trong HTTP-only cookies
- **Endpoints**: Xem file `src/services/api.js`

## Bảo Mật

- ✅ JWT token verification
- ✅ Role-based access control (RBAC)
- ✅ HTTP-only cookies
- ✅ Protected routes
- ✅ Encrypted connection strings in tokens

## Troubleshooting

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
Đảm bảo backend có CORS enabled hoặc proxy được cấu hình trong `vite.config.js`

### Authentication Fails
1. Kiểm tra server backend đang chạy
2. Kiểm tra JWT_SECRET giống nhau giữa backend và frontend
3. Kiểm tra database connection

### Port Already in Use
Nếu port 3000 đã được sử dụng, chỉnh sửa trong `vite.config.js`:
```javascript
server: {
  port: 3001  // hoặc port khác
}
```

## Phát Triển

### Thêm Trang Mới
1. Tạo component ở `src/pages/`
2. Import và thêm Route ở `src/App.jsx`
3. Thêm navigation ở sidebar

### Thêm API Endpoint
1. Thêm function ở `src/services/api.js`
2. Gọi từ component dùng `useEffect`
3. Handle loading và error states

## Deploy

### Vercel
```bash
npm run build
vercel deploy
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

## License

MIT

## Support

Liên hệ: support@powercorp.com
