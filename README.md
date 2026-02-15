# 🧧 Hồng Bao Lootbox (Lì Xì Tết)

[English](#english) | [Tiếng Việt](#vietnamese)

---

<a name="english"></a>

## 🇬🇧 English

### Introduction

**Hồng Bao Lootbox** is a fun, interactive web application designed for the Lunar New Year (Tet). It simulates opening "Red Envelopes" (Lì Xì) using game-inspired lootbox mechanics from popular games like **Overwatch** and **CS:GO**.

It's perfect for family gatherings, office parties, or friends to randomly distribute lucky money with excitement and suspense!

### Features

- **Two Exciting Modes**:
  - **Overwatch Mode**: 3D box opening animation, rarity beams, and explosive reveal effects.
  - **CS:GO Mode**: Classic spinning reel mechanic with a suspenseful horizontal scroll.
- **Customizable Drop Rates**: Configure the probability for each rarity tier (Legendary, Epic, Rare, Uncommon, Common).
- **Money Pool Management**: Input a list of money values (e.g., 50k, 100k, 500k) for each tier. The app randomly picks from the available pool.
- **History Tracking**: Keeps a log of recent openings.
- **Responsive Design**: Works on desktop and mobile.
- **Visuals & Sound**: High-quality animations (GSAP), particle effects, and sound effects for a premium feel.

### Tech Stack

- **HTML5 / CSS3**
- **JavaScript (Vanilla)**
- **Tailwind CSS v4** (via CDN for instant styling)
- **GSAP** (GreenSock Animation Platform) for animations
- **Canvas Confetti** for celebration effects

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

1. **Setup**: Click the **Settings** (Gear icon) to configure drop rates and add money values for each tier.
2. **Choose Mode**: Toggle between **OW** (Overwatch) and **CS:GO** using the switch at the top.
3. **Open**: Click the Hongbao (Red Envelope) to open!
4. **Enjoy**: Watch the animation and see what you get.

---

<a name="vietnamese"></a>

## 🇻🇳 Tiếng Việt

### Giới thiệu

**Hồng Bao Lootbox** là ứng dụng web tương tác vui nhộn dành cho dịp Tết Nguyên Đán. Ứng dụng mô phỏng việc "bốc thăm" tiền lì xì dưới dạng mở hộp quà (lootbox) theo phong cách của các tựa game nổi tiếng như **Overwatch** và **CS:GO**.

Đây là công cụ tuyệt vời để gia đình, bạn bè hoặc đồng nghiệp cùng nhau "thử vận may" đầu năm với những hiệu ứng hồi hộp và đẹp mắt.

### Tính năng

- **Hai Chế độ Mở quà**:
  - **Chế độ Overwatch**: Hiệu ứng mở hộp 3D, tia sáng phân loại độ hiếm và hiệu ứng nổ tung hoành tráng.
  - **Chế độ CS:GO**: Hiệu ứng vòng quay (reel) chạy ngang đầy kịch tính như mở hòm trong game bắn súng.
- **Cấu hình Tỷ lệ**: Tự do cài đặt tỷ lệ trúng cho từng cấp độ (Huyền Thoại, Sử Thi, Hiếm, v.v.).
- **Quản lý Tiền thưởng**: Nhập danh sách các tờ tiền (ví dụ: 10k, 20k, 500k) cho từng cấp. Ứng dụng sẽ chọn ngẫu nhiên từ kho tiền bạn nhập.
- **Lịch sử**: Xem lại danh sách những người vừa mở.
- **Giao diện Đẹp mắt**: Thiết kế chuẩn responsive (điện thoại & máy tính), âm thanh sống động, hiệu ứng pháo hoa.

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

1. **Cài đặt**: Bấm vào biểu tượng **Bánh răng** để nhập số lượng tiền và tỷ lệ trúng thưởng cho từng mức.
2. **Chọn Chế độ**: Gạt nút chuyển đổi giữa **OW** (Overwatch) và **CS:GO** ở góc trên.
3. **Mở quà**: Bấm vào phong bao Lì Xì trên màn hình để bắt đầu!
4. **Tận hưởng**: Chờ xem hiệu ứng và nhận kết quả may mắn.

---

_Chúc Mừng Năm Mới! Happy Lunar New Year!_ 🎆
