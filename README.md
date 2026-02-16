# 🧧 Hồng Bao Lootbox (Lì Xì Tết)

[English](#english) | [Tiếng Việt](#vietnamese)

---

<a name="english"></a>

## 🇬🇧 English

### Introduction

**Hồng Bao Lootbox** is a fun, interactive web application designed for the Lunar New Year (Tet). It simulates opening "Red Envelopes" (Lì Xì) using game-inspired lootbox mechanics from popular games like **Overwatch** and **CS:GO**.

It's perfect for family gatherings, office parties, or friends to randomly distribute lucky money with excitement and suspense!

### Features

- **Multi-Lootbox Manager**: Create, edit, and delete different types of Lootboxes (e.g., "Family", "Friends", "VIP"). Each box has its own appearance and drop rates.
- **Advanced Statistics**: View global stats or filter by specific Lootbox. Includes a "Clear History" function with a custom confirmation dialog.
- **Two Exciting Modes**:
  - **Overwatch Mode**: 3D box opening animation, rarity beams, and explosive reveal effects.
  - **CS:GO Mode**: Classic spinning reel mechanic with customizable spin duration and width.
- **Customizable Appearance**: Change colors, gradients, and texts for each Lootbox to match your theme.
- **Sound System**: Distinct sound effects for each rarity tier, including "Heavenly" sounds for Legendary items.
- **Responsive Design**: Optimized for mobile and desktop.

### Tech Stack

- **HTML5 / CSS3**
- **JavaScript (Vanilla + Modules)**
- **Tailwind CSS v4** (via CDN)
- **GSAP** (GreenSock Animation Platform)
- **Canvas Confetti**

### How to Run

This is a static web application, so no complex build process is required!

#### Option 1: Direct Open

Simply double-click `index.html` to open it in your web browser.
_Note: Some browsers might block `localStorage` access on `file://` protocol. If settings don't save, use Option 2._

#### Option 2: Local Server (Recommended)

If you use **VS Code**:

1. Install the "Live Server" extension.
2. Right-click `index.html` and select "Open with Live Server".

OR using **Python** (installed on most systems):

```bash
# Run in the project folder
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

OR using **Node.js**:

```bash
npx serve .
```

### Usage Guide

1. **Manage Boxes**: Click **Manage** (Backpack icon) to create new Lootboxes or select an existing one.
2. **Configure**: Click **Settings** (Gear icon) to customize the drop rates, money pool, and visual theme (colors, text) for the current box.
3. **Choose Mode**: Toggle between **OW** (Overwatch) and **CS:GO** using the switch at the top.
4. **Open**: Click the Hongbao (Red Envelope) to open!
5. **Statistics**: Click **Stats** (Chart icon) to view opening history and drop rate performance.

---

<a name="vietnamese"></a>

## 🇻🇳 Tiếng Việt

### Giới thiệu

**Hồng Bao Lootbox** là ứng dụng web tương tác vui nhộn dành cho dịp Tết Nguyên Đán. Ứng dụng mô phỏng việc "bốc thăm" tiền lì xì dưới dạng mở hộp quà (lootbox) theo phong cách của các tựa game nổi tiếng như **Overwatch** và **CS:GO**.

Đây là công cụ tuyệt vời để gia đình, bạn bè hoặc đồng nghiệp cùng nhau "thử vận may" đầu năm với những hiệu ứng hồi hộp và đẹp mắt.

### Tính năng

- **Quản lý Đa Hộp**: Tạo, sửa, xóa nhiều loại Hồng Bao khác nhau (ví dụ: "Cho Gia đình", "Cho Bạn bè", "VIP"). Mỗi hộp có giao diện và tỷ lệ riêng.
- **Thống Kê Chi Tiết**: Xem thống kê tổng hợp hoặc theo từng loại hộp. Xoá lịch sử dễ dàng với giao diện xác nhận an toàn.
- **Hai Chế độ Mở quà**:
  - **Chế độ Overwatch**: Hiệu ứng mở hộp 3D, tia sáng phân loại độ hiếm và hiệu ứng nổ tung hoành tráng.
  - **Chế độ CS:GO**: Hiệu ứng vòng quay (reel) chạy ngang đầy kịch tính, tuỳ chỉnh thời gian và độ rộng.
- **Tuỳ biến Giao diện**: Chỉnh sửa màu sắc, chữ viết, và màu viền cho từng loại Hồng Bao.
- **Hệ thống Âm thanh**: Âm thanh riêng biệt cho từng cấp độ, đặc biệt là âm thanh "Thần thánh" cho giải Huyền Thoại.

### Công nghệ sử dụng

- **HTML5 / CSS3**
- **JavaScript (Thuần)**
- **Tailwind CSS v4** (dùng CDN, không cần cài đặt)
- **GSAP** (Thư viện chuyển động mượt mà)
- **Canvas Confetti** (Hiệu ứng pháo giấy)

### Hướng dẫn Cài đặt & Chạy

Đây là ứng dụng web tĩnh (static), bạn không cần cài đặt môi trường phức tạp.

#### Cách 1: Mở trực tiếp

Chỉ cần click đúp vào file `index.html` để mở trên trình duyệt.
_Lưu ý: Một số trình duyệt có thể chặn tính năng lưu cài đặt nếu mở kiểu này. Nếu gặp lỗi, hãy dùng Cách 2._

#### Cách 2: Dùng Server Ảo (Khuyên dùng)

Nếu bạn dùng **VS Code**:

1. Cài extension "Live Server".
2. Chuột phải vào `index.html` chọn "Open with Live Server".

Hoặc dùng **Python** (có sẵn trên Mac/Windows):

```bash
# Mở terminal tại thư mục dự án
python -m http.server 8000
# Sau đó truy cập http://localhost:8000
```

Hoặc dùng **Node.js**:

```bash
npx serve .
```

### Hướng dẫn Sử dụng

1. **Quản lý Hộp**: Bấm nút **Quản lý** (Balo) để tạo hộp mới hoặc chọn hộp cần dùng.
2. **Cài đặt**: Bấm nút **Cài đặt** (Bánh răng) để sửa tỷ lệ, danh sách tiền, và trang trí màu sắc/chữ cho hộp hiện tại.
3. **Chọn Chế độ**: Gạt nút chuyển đổi giữa **OW** (Overwatch) và **CS:GO** ở góc trên.
4. **Mở quà**: Bấm vào phong bao Lì Xì trên màn hình để bắt đầu!
5. **Thống kê**: Bấm nút **Thống kê** để xem lịch sử và tổng tiền đã lì xì.

---

_Chúc Mừng Năm Mới! Happy Lunar New Year!_ 🎆
