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

## 📤 Hướng dẫn đẩy code lên GitHub

```bash
git add .
git commit -m "Add Minion 2D drawing app and Docker deployment files"
git branch -M main
git remote add origin https://github.com/Truong1002/minion.git
git push -u origin main
```
