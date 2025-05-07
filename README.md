# Gold Tracker

Ứng dụng theo dõi và quản lý đầu tư vàng với các tính năng theo dõi giá vàng thời gian thực, tính toán lãi/lỗ và quản lý tài sản vàng.

## Tính Năng Chính

### 1. Theo Dõi Giá Vàng
- Hiển thị giá vàng cập nhật theo thời gian thực
- Hỗ trợ nhiều loại vàng: SJC, VRTL, BTMC
- Biểu đồ theo dõi biến động giá theo thời gian
- Tự động cập nhật giá mỗi 5 phút

### 2. Máy Tính Vàng
- Tính toán lãi/lỗ đầu tư vàng
- Hỗ trợ đơn vị tính: Chỉ và Lượng
- Tính toán giá trị hiện tại và lợi nhuận
- Hiển thị tỷ lệ lãi/lỗ theo phần trăm

### 3. Quản Lý Tài Sản
- Theo dõi danh sách tài sản vàng
- Tính toán giá trị hiện tại của tài sản
- Thống kê tổng đầu tư và lãi/lỗ
- Sắp xếp và lọc tài sản theo nhiều tiêu chí

## Công Nghệ Sử Dụng

- **Frontend**: Next.js, React, TypeScript
- **UI Components**: Shadcn/ui
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Authentication**: JWT, Google OAuth
- **API**: RESTful API

## Cài Đặt

1. Clone repository:
```bash
git clone [repository-url]
cd gold-tracker
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file môi trường:
```bash
cp .env.example .env.local
```

4. Cập nhật các biến môi trường trong `.env.local`

5. Chạy ứng dụng:
```bash
npm run dev
```

## Cấu Trúc Dự Án

```
gold-tracker/
├── app/                    # Next.js app directory
│   ├── assets/            # Trang quản lý tài sản
│   ├── gold-price/        # Trang giá vàng
│   └── login/             # Trang đăng nhập
├── components/            # React components
│   ├── ui/               # UI components
│   └── ...               # Feature components
├── lib/                  # Utility functions
├── store/                # Zustand stores
└── public/              # Static assets
```

## Tính Năng Đang Phát Triển

- [ ] Thêm biểu đồ phân tích kỹ thuật
- [ ] Tích hợp thông báo giá vàng
- [ ] Thêm tính năng đặt lệnh mua/bán
- [ ] Hỗ trợ đa ngôn ngữ

## Đóng Góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request để đóng góp.

## Giấy Phép

MIT License 