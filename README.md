# Gold Tracker

Ứng dụng theo dõi giá vàng và quản lý đầu tư vàng cá nhân.


## Tính năng

- **Theo dõi giá vàng thời gian thực**: Cập nhật giá vàng SJC, BTMC và các loại vàng phổ biến khác
- **Biểu đồ giá vàng**: Xem biến động giá vàng theo nhiều khung thời gian (15 phút, 1 giờ, 24 giờ, 7 ngày, 30 ngày)
- **Máy tính vàng**: Tính toán giá trị hiện tại và lợi nhuận/lỗ dựa trên giá mua và số lượng
- **Quản lý danh mục đầu tư**: Theo dõi các khoản đầu tư vàng của bạn
- **Xác thực người dùng**: Đăng nhập bằng Google hoặc tài khoản cá nhân
- **Giao diện thân thiện**: Thiết kế responsive, hỗ trợ chế độ sáng/tối

## Demo

Truy cập ứng dụng demo tại: [https://gold-tracker-b6kkqz5n9-nguyenpts-projects.vercel.app/login](https://gold-tracker-b6kkqz5n9-nguyenpts-projects.vercel.app/login)

## Công nghệ sử dụng

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **Charts**: Recharts
- **Authentication**: JWT, Cookies
- **Hosting**: Vercel

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Passport, JWT
- **Hosting**: Render.com
- **API Documentation**: Swagger

## Cài đặt và chạy local

### Yêu cầu
- Node.js 18.0.0 trở lên
- Docker và Docker Compose (cho backend)
- Git

### Frontend
```bash
# Clone repository
git clone https://github.com/yourusername/gold-tracker.git
cd gold-tracker

# Cài đặt dependencies
npm install

# Tạo file .env.local
cp .env.example .env.local
# Chỉnh sửa .env.local với các biến môi trường cần thiết

# Chạy development server
npm run dev
```

### Backend
```bash
# Di chuyển đến thư mục backend
cd backend

# Tạo file .env
cp .env.example .env
# Chỉnh sửa .env với các biến môi trường cần thiết

# Chạy Docker Compose
docker-compose up -d

# Hoặc chạy trực tiếp với Node.js
npm install
npm run start:dev
```

## Triển khai (Deployment)

### Frontend (Vercel)
1. Fork repository này
2. Tạo dự án mới trên [Vercel](https://vercel.com)
3. Kết nối với repository GitHub của bạn
4. Cấu hình các biến môi trường:
   - `NEXT_PUBLIC_API_URL`: URL của backend API
5. Deploy

### Backend (Render.com)
1. Tạo Web Service mới trên [Render](https://render.com)
2. Kết nối với repository GitHub hoặc sử dụng Docker Registry
3. Cấu hình:
   - Runtime: Docker
   - Region: Chọn region gần vị trí của bạn
   - Environment Variables:
     - `DATABASE_URL`: URL kết nối PostgreSQL
     - `JWT_SECRET`: Secret key cho JWT
     - `FRONTEND_URL`: URL của frontend
4. Deploy

## Cấu trúc dự án

```
gold-tracker/
├── app/                   # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth-success/      # Trang xử lý đăng nhập thành công
│   ├── gold-price/        # Trang hiển thị giá vàng
│   ├── login/             # Trang đăng nhập
│   └── ...
├── components/            # React Components
│   ├── gold-calculator.tsx    # Máy tính vàng
│   ├── gold-price-chart.tsx   # Biểu đồ giá vàng
│   ├── gold-price-table.tsx   # Bảng giá vàng
│   └── ...
├── lib/                   # Thư viện và utilities
│   ├── api.ts             # API client
│   ├── config.ts          # Cấu hình
│   └── ...
├── store/                 # Zustand stores
│   ├── use-auth-store.ts  # Auth state
│   └── ...
├── public/                # Static assets
├── .env.example           # Example environment variables
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── ...
```

## API Endpoints

Backend API được tài liệu hóa bằng Swagger. Truy cập `/api` trên backend server để xem tài liệu API đầy đủ.

Các endpoint chính:
- `GET /gold/prices/latest`: Lấy giá vàng mới nhất
- `GET /gold/prices/history`: Lấy lịch sử giá vàng
- `GET /assets`: Lấy danh sách tài sản
- `POST /assets`: Thêm tài sản mới
- `PUT /assets/:id`: Cập nhật tài sản
- `DELETE /assets/:id`: Xóa tài sản
- `POST /auth/login`: Đăng nhập
- `GET /auth/google`: Đăng nhập bằng Google

## Tính Năng Đang Phát Triển

- [ ] Thêm biểu đồ phân tích kỹ thuật
- [ ] Tích hợp thông báo giá vàng
- [ ] Thêm tính năng đặt lệnh mua/bán
- [ ] Hỗ trợ đa ngôn ngữ

## Đóng góp

Contributions are welcome! Vui lòng tạo issue hoặc pull request để đóng góp.

## Giấy phép

Dự án này được phân phối dưới giấy phép MIT. Xem [LICENSE](LICENSE) để biết thêm chi tiết.

## Tác giả

- **Phạm Trần Sơn Nguyên** - [GitHub](https://github.com/nguyenpts) - [Email](mailto:nguyenpts@gmail.com)

## Lời cảm ơn

- Dữ liệu giá vàng được cung cấp bởi API tự phát triển
- Các thư viện mã nguồn mở được sử dụng trong dự án

---

© 2025 Gold Tracker. All rights reserved. 
Tes deploy 2