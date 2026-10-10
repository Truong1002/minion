# Minion 2D Fullscreen Hand-Drawn App 🍌✏️

Ứng dụng web chọn kết bạn tương tác với hiệu ứng bút chì phác họa bức tranh Minion 2D toàn màn hình rực rỡ trong 10 giây!

## 🚀 Hướng dẫn chạy bằng Docker

### Chạy trực tiếp với Docker:
```bash
docker build -t minion-app .
docker run -d -p 80:80 --name minion_container minion-app
```
Mở trình duyệt truy cập: `http://localhost`

### Chạy bằng Docker Compose:
```bash
docker compose up -d --build
```

## 🖌️ Bức tranh được vẽ như thế nào

Bức tranh trong app **không phải hình vẽ vector** mà được dựng thẳng từ ảnh gốc `banhkemthotay-vn-21.webp` ngay trên canvas:

1. Khử màu theo trọng số mắt người (0.299R + 0.587G + 0.114B)
2. Đảo âm bản rồi làm nhòe Gauss (box blur 3 lượt, tách trục)
3. Chồng bằng phép **color-dodge** để ra nền chì
4. Chỉnh điểm trắng + gamma cho giấy trắng bong, nét đậm
5. Dò biên **Sobel** để ăn thêm đường viền chì
6. Phủ nét gạch chéo ở vùng tối, rồi trải vân giấy tự sinh
7. Hiện dần theo từng nét chì chéo, có đầu bút chì chạy theo
8. Tô màu: ảnh gốc được tô dần lên giấy theo từng dải sáp zíc-zắc (chồng kiểu multiply để giữ vân giấy), nét chì vẫn nằm trên cùng
9. Dựng 3D: đoán bản đồ độ sâu từ độ nét cục bộ (ảnh xoá phông thì chủ thể nét, hậu cảnh nhoè) cộng trọng số tâm ảnh, rồi cắt tranh thành 7 lát theo độ sâu
10. Lát càng gần càng trôi nhanh khi đổi góc nhìn, chủ thể có bóng đổ trên giấy; xoay theo con trỏ chuột hoặc độ nghiêng điện thoại

| File | Vai trò |
| --- | --- |
| `script.js` | Động cơ tranh chì + hiệu ứng hạt, pháo hoa, nút bấm |
| `sketch-photo.js` | Ảnh gốc `banhkemthotay-vn-21.webp` nhúng sẵn dạng data URI (để canvas đọc được pixel cả khi mở bằng `file://`) |
| `tranh-minion.html` | Trang "xưởng vẽ" riêng (vẫn dùng ảnh Minion cũ, đã nhúng sẵn), có thanh trượt chỉnh độ đậm / viền / gạch chéo |

## 📤 Hướng dẫn đẩy code lên GitHub

```bash
git add .
git commit -m "Add Minion 2D drawing app and Docker deployment files"
git branch -M main
git remote add origin https://github.com/Truong1002/minion.git
git push -u origin main
```
