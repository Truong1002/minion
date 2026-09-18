# Sử dụng Nginx Alpine nhẹ và tối ưu cho web tĩnh
FROM nginx:alpine

# Xóa các file mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy toàn bộ giao diện vào thư mục html của Nginx
COPY . /usr/share/nginx/html

# Mở cổng 80 cho container
EXPOSE 80

# Chạy Nginx ở chế độ foreground
CMD ["nginx", "-g", "daemon off;"]
