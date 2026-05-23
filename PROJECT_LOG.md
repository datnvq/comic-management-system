# PROJECT LOG - Comic Management System

## Thông tin dự án

Tên dự án: Comic Management System  
Kiến trúc: Microservices + Event-driven Architecture  
Stack dự kiến: NestJS, MongoDB, Redis, RabbitMQ, Docker Compose  

## Tiến trình thực hiện

### Bước 1: Khởi tạo cấu trúc dự án

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo thư mục gốc `comic-management-system`
- Khởi tạo Git repository
- Tạo các thư mục service:
  - api-gateway
  - auth-service
  - user-service
  - comic-service
  - chapter-service
  - search-service
  - notification-service
- Tạo thư mục `docs`
- Tạo các file tài liệu ban đầu:
  - README.md
  - docker-compose.yml
  - PROJECT_LOG.md
  - docs/architecture.md
  - docs/api-design.md
  - docs/database-design.md

Ghi chú:
- Dự án sẽ được triển khai từng bước.
- Trước mỗi lần làm tiếp, cần đọc lại file PROJECT_LOG.md để nắm tiến trình.

### Bước 2: Setup Docker Compose cho hạ tầng hệ thống

Trạng thái: Hoàn thành

Đã thực hiện:
- Cấu hình Docker Compose
- Chạy thành công MongoDB container
- Chạy thành công Redis container
- Chạy thành công RabbitMQ container
- Kiểm tra bằng lệnh `docker ps`
- Các container đang chạy:
  - comic_mongodb
  - comic_redis
  - comic_rabbitmq

Ghi chú:
- MongoDB: localhost:27017
- Redis: localhost:6379
- RabbitMQ: localhost:5672
- RabbitMQ Dashboard: http://localhost:15672

### Bước 3: Khởi tạo Auth Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài NestJS CLI
- Tạo project NestJS cho `auth-service`
- Chạy thử Auth Service bằng `npm run start:dev`
- Kiểm tra API mặc định tại `http://localhost:3000`

Ghi chú:
- Auth Service hiện đang chạy mặc định ở port 3000
- Các chức năng đăng ký, đăng nhập và JWT sẽ được triển khai ở bước sau

### Bước 4: Kết nối Auth Service với MongoDB

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài đặt `@nestjs/mongoose` và `mongoose`
- Cấu hình kết nối MongoDB cho Auth Service
- Kết nối database `comic_auth_db`
- Chạy thử Auth Service thành công

Ghi chú:
- MongoDB đang chạy bằng Docker ở `localhost:27017`
- Auth Service dùng database riêng: `comic_auth_db`

### Bước 5: Tạo User Schema cho Auth Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo thư mục `src/schemas`
- Tạo file `user.schema.ts`
- Khai báo schema User gồm:
  - username
  - email
  - password
  - role
- Đăng ký UserSchema vào AppModule
- Chạy thử Auth Service thành công

Ghi chú:
- User sẽ được lưu trong database `comic_auth_db`
- Trường email được đặt unique để tránh đăng ký trùng tài khoản
- Password sẽ dùng để lưu mật khẩu đã mã hóa ở bước sau

### Bước 6: Xây dựng chức năng đăng ký tài khoản

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài đặt `bcrypt` để mã hóa mật khẩu
- Tạo Auth Module
- Tạo Auth Service
- Tạo Auth Controller
- Tạo Register DTO
- Xây dựng API `POST /auth/register`
- Sửa lỗi `UserModel` chưa được import trong `AuthModule`
- Test đăng ký tài khoản thành công bằng Postman
- API trả về `201 Created`

Ghi chú:
- Password đã được mã hóa trước khi lưu MongoDB
- Response không trả về password
- Khi test API bằng Postman cần chọn `Body -> raw -> JSON`

### Bước 7: Xây dựng chức năng đăng nhập bằng JWT

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài đặt `@nestjs/jwt`
- Tạo `LoginDto`
- Thêm `JwtModule` vào AuthModule
- Xây dựng API `POST /auth/login`
- Kiểm tra email tồn tại
- So sánh password bằng `bcrypt.compare`
- Tạo JWT access token sau khi đăng nhập thành công
- Test login bằng Postman thành công

Ghi chú:
- JWT hiện dùng secret tạm thời `comic_secret_key`
- Token có thời hạn 1 ngày
- Nếu sai email hoặc password, API trả lỗi `401 Unauthorized`
- `/auth/register` dùng để đăng ký
- `/auth/login` dùng để đăng nhập

### Bước 8: Cấu hình port riêng cho Auth Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Sửa `main.ts`
- Chuyển Auth Service từ port `3000` sang port `3001`
- Test lại API `POST /auth/login` thành công trên port `3001`

Ghi chú:
- Port `3000` sẽ dành cho API Gateway
- Auth Service chạy tại `http://localhost:3001`

### Bước 9: Xây dựng JWT Authentication Guard

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài đặt Passport và JWT Strategy
- Tạo `JwtStrategy`
- Tạo `JwtAuthGuard`
- Tạo API `GET /auth/profile`
- Bảo vệ API bằng JWT
- Test Bearer Token bằng Postman thành công

Ghi chú:
- JWT được gửi qua Authorization Header
- Format:
  Authorization: Bearer TOKEN
- Nếu token không hợp lệ hoặc hết hạn:
  API trả `401 Unauthorized`

  ### Bước 10: Dockerize Auth Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo `Dockerfile` cho Auth Service
- Tạo `.dockerignore`
- Build Auth Service bằng Docker
- Thêm Auth Service vào `docker-compose.yml`
- Chạy Auth Service container thành công
- Kết nối Auth Service với MongoDB container bằng hostname `mongodb`
- Test API login thành công qua Docker

Ghi chú:
- Auth Service container tên `comic_auth_service`
- Auth Service chạy ở port `3001`
- Khi chạy trong Docker, không dùng `localhost` để kết nối MongoDB mà dùng tên service `mongodb`

### Bước 11: Khởi tạo Comic Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Xóa `.gitkeep` trong `comic-service`
- Tạo project NestJS cho `comic-service`
- Cài đặt `@nestjs/mongoose` và `mongoose`
- Cấu hình Comic Service chạy ở port `3002`
- Kết nối Comic Service với MongoDB database `comic_comic_db`
- Chạy thử service thành công

Ghi chú:
- Comic Service dùng để quản lý thông tin truyện tranh
- Comic Service chạy tại `http://localhost:3002`
- Database riêng: `comic_comic_db`

### Bước 12: Tạo Comic Schema và API quản lý truyện cơ bản

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo Comic Module
- Tạo Comic Service
- Tạo Comic Controller
- Tạo Comic Schema
- Tạo CreateComicDto
- Xây dựng API `POST /comics`
- Xây dựng API `GET /comics`
- Test thêm truyện và lấy danh sách truyện thành công

Ghi chú:
- Comic Service chạy ở port `3002`
- Dữ liệu truyện được lưu vào database `comic_comic_db`

### Bước 13: Hoàn thiện CRUD cho Comic Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo `UpdateComicDto`
- Xây dựng API `GET /comics/:id`
- Xây dựng API `PATCH /comics/:id`
- Xây dựng API `DELETE /comics/:id`
- Thêm xử lý lỗi `404 Not Found`
- Test CRUD thành công bằng Postman

Ghi chú:
- Comic Service hiện đã hỗ trợ CRUD cơ bản đầy đủ
- MongoDB ObjectId được dùng để định danh truyện
- Khi test API cần thay `:id` bằng ObjectId thực tế

### Bước 14: Dockerize Comic Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo `Dockerfile` cho Comic Service
- Tạo `.dockerignore`
- Thêm Comic Service vào `docker-compose.yml`
- Build và chạy Comic Service bằng Docker Compose
- Kết nối Comic Service với MongoDB container bằng hostname `mongodb`
- Test API `GET /comics` thành công qua Docker

Ghi chú:
- Comic Service container tên `comic_comic_service`
- Comic Service chạy ở port `3002`
- Comic Service hiện hỗ trợ CRUD đầy đủ
- MongoDB được dùng chung thông qua Docker network

### Bước 15: Khởi tạo Chapter Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Xóa `.gitkeep` trong `chapter-service`
- Tạo project NestJS cho `chapter-service`
- Cài đặt `@nestjs/mongoose` và `mongoose`
- Cấu hình Chapter Service chạy ở port `3003`
- Kết nối Chapter Service với MongoDB database `comic_chapter_db`
- Test local service thành công

Ghi chú:
- Chapter Service dùng để quản lý chương truyện
- Chapter Service chạy tại `http://localhost:3003`
- Database riêng: `comic_chapter_db`

### Bước 16: Tạo Chapter Schema và API quản lý chương truyện

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo Chapter Module
- Tạo Chapter Service
- Tạo Chapter Controller
- Tạo Chapter Schema
- Tạo CreateChapterDto
- Xây dựng API `POST /chapters`
- Xây dựng API `GET /chapters/comic/:comicId`
- Xây dựng API `GET /chapters/:id`
- Test tạo chapter thành công
- Test lấy danh sách chapter theo comicId thành công

Ghi chú:
- Chapter liên kết với Comic thông qua `comicId`
- Dữ liệu chapter được lưu trong database `comic_chapter_db`
- `images` lưu danh sách URL ảnh của chapter

### Bước 17: Dockerize Chapter Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo `Dockerfile` cho Chapter Service
- Tạo `.dockerignore`
- Thêm Chapter Service vào `docker-compose.yml`
- Build và chạy Chapter Service bằng Docker Compose
- Kết nối Chapter Service với MongoDB container bằng hostname `mongodb`
- Test API chapter thành công qua Docker

Ghi chú:
- Chapter Service container tên `comic_chapter_service`
- Chapter Service chạy ở port `3003`
- Khi chạy trong Docker, MongoDB được gọi bằng hostname `mongodb`

### Bước 18: Tạo API Gateway

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo project `api-gateway`
- Cài đặt `http-proxy-middleware`
- Cấu hình Gateway chạy ở port `3000`
- Proxy request:
  - `/api/auth` -> Auth Service
  - `/api/comics` -> Comic Service
  - `/api/chapters` -> Chapter Service
- Test thành công:
  - `GET /api/comics`
  - `GET /api/chapters/comic/:comicId`
  - `POST /api/auth/login`

Ghi chú:
- Auth, Comic, Chapter Service chạy bằng Docker
- API Gateway hiện chạy local bằng `npm run start:dev`
- Client chỉ cần gọi qua `http://localhost:3000/api/...`

### Bước 19: Dockerize API Gateway

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo `Dockerfile` cho API Gateway
- Tạo `.dockerignore`
- Chuyển proxy target sang Docker service hostname
- Thêm API Gateway vào `docker-compose.yml`
- Build và chạy toàn bộ hệ thống bằng Docker Compose
- Test API Gateway thành công:
  - `/api/auth`
  - `/api/comics`
  - `/api/chapters`

Ghi chú:
- API Gateway container tên `comic_api_gateway`
- Gateway chạy ở port `3000`
- Các service giao tiếp nội bộ qua Docker network:
  - `auth-service`
  - `comic-service`
  - `chapter-service`

  ### Bước 20: Thêm Redis Cache cho Comic Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài đặt Redis package cho Comic Service
- Tạo Redis Provider
- Kết nối Comic Service với Redis container
- Cache API `GET /comics`
- Tự động xóa cache khi:
  - tạo truyện
  - cập nhật truyện
  - xóa truyện
- Test Redis Cache thành công

Ghi chú:
- Cache key: `all_comics`
- Cache TTL: 60 giây
- Redis giúp giảm tải MongoDB và tăng tốc phản hồi API

### Bước 21: Publish RabbitMQ event khi tạo truyện

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài đặt `amqplib`
- Tạo RabbitMQ Provider cho Comic Service
- Kết nối Comic Service với RabbitMQ container
- Tạo queue `comic.created`
- Publish event `comic.created` sau khi tạo truyện mới
- Test log thành công:
  - RabbitMQ Connected
  - Event published: comic.created

Ghi chú:
- Đây là bước đầu triển khai Event-driven Architecture
- Comic Service không gọi trực tiếp service khác mà gửi event qua RabbitMQ

### Bước 22: Tạo Notification Service consume RabbitMQ event

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo project `notification-service`
- Cài đặt `amqplib`
- Tạo consumer lắng nghe queue `comic.created`
- Thêm Notification Service vào `docker-compose.yml`
- Dockerize Notification Service
- Test nhận event từ RabbitMQ thành công

Ghi chú:
- Notification Service chạy ở port `3004`
- Container tên `comic_notification_service`
- Khi Comic Service tạo truyện mới, Notification Service nhận event và log thông báo

### Bước 23: Publish event khi thêm Chapter mới

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài đặt `amqplib` cho Chapter Service
- Tạo RabbitMQ Provider trong Chapter Service
- Publish event `chapter.created` sau khi tạo chapter mới
- Cập nhật Notification Service để consume thêm queue `chapter.created`
- Build lại Chapter Service và Notification Service
- Test nhận event thành công

Ghi chú:
- Chapter Service publish event `chapter.created`
- Notification Service nhận event và log thông báo chương mới
- Hệ thống hiện đã có giao tiếp bất đồng bộ qua RabbitMQ

### Bước 24: Tạo Search Service cơ bản

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo `search-service`
- Kết nối MongoDB riêng cho Search Service
- Tạo schema `SearchComic`
- Tạo API tìm kiếm:
  - `GET /search?keyword=...`
- Kết nối RabbitMQ
- Consume event `comic.created`
- Tự động index comic mới vào database search
- Dockerize Search Service
- Test search API thành công

Ghi chú:
- Search Service chạy ở port `3005`
- Container tên `comic_search_service`
- Search hoạt động bằng regex search cơ bản
- Dữ liệu search được đồng bộ qua RabbitMQ event

### Bước 25: Đồng bộ đầy đủ dữ liệu Search Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Publish đầy đủ comic data qua event `comic.created`
- Search Service lưu:
  - title
  - author
  - genres
  - description
  - coverImage
  - status
- Nâng cấp search API:
  - tìm theo title
  - tìm theo author
  - tìm theo genres
- Build lại Comic Service và Search Service
- Test search thành công

Ghi chú:
- Search Service hiện hoạt động như search index database
- Dữ liệu được đồng bộ bất đồng bộ qua RabbitMQ

### Bước 26: Bảo vệ API Admin bằng JWT tại API Gateway

Trạng thái: Hoàn thành

Đã thực hiện:
- Cài đặt `jsonwebtoken`
- Tạo `auth.middleware.ts` trong API Gateway
- Bảo vệ các route admin:
  - `POST /api/comics`
  - `PATCH /api/comics/:id`
  - `DELETE /api/comics/:id`
  - `POST /api/chapters`
- Đồng bộ JWT secret với Auth Service
- Test không token trả `401 Unauthorized`
- Test có token tạo comic thành công

Ghi chú:
- Gateway đóng vai trò kiểm tra xác thực tập trung
- Các request đọc dữ liệu `GET` vẫn được public

### Bước 27: Tạo Frontend cơ bản

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo frontend bằng React + Vite + TypeScript
- Kết nối frontend với API Gateway
- Bật CORS cho API Gateway
- Hiển thị danh sách truyện từ API `GET /api/comics`
- Test frontend thành công tại `http://localhost:5173`

Ghi chú:
- Frontend hiện gọi API Gateway tại `http://localhost:3000/api`
- Một số ảnh không hiển thị vì đang dùng URL mẫu `example.com`

### Bước 28: Thêm Search vào Frontend

Trạng thái: Hoàn thành

Đã thực hiện:
- Thêm ô tìm kiếm vào frontend
- Kết nối frontend với Search Service
- Bật CORS cho Search Service
- Tìm kiếm truyện theo:
  - title
  - author
  - genres
- Test search thành công trên giao diện

Ghi chú:
- Frontend gọi Comic Service để lấy danh sách truyện
- Frontend gọi Search Service để tìm kiếm truyện

### Bước 29: Frontend Login và lưu JWT

Trạng thái: Hoàn thành

Đã thực hiện:
- Thêm form login vào frontend
- Gọi API `POST /api/auth/login`
- Nhận `accessToken` từ Auth Service
- Lưu token vào `localStorage`
- Hiển thị trạng thái đã đăng nhập
- Thêm chức năng logout

Ghi chú:
- Token sẽ được dùng cho các chức năng admin ở bước sau

### Bước 30: Admin thêm truyện từ Frontend

Trạng thái: Hoàn thành

Đã thực hiện:
- Thêm admin form trên frontend
- Gửi JWT token trong Authorization header
- Gọi API `POST /api/comics`
- Tạo comic từ giao diện web
- Refresh danh sách truyện sau khi tạo
- Test full flow thành công

Flow hệ thống:
Frontend
-> API Gateway
-> JWT Middleware
-> Comic Service
-> MongoDB
-> Redis Cache Clear
-> RabbitMQ Event
-> Notification Service
-> Search Service
-> Frontend Refresh

Ghi chú:
- Chỉ user đã login mới tạo được truyện
- Search Service tự động index comic mới

### Bước 31: Admin thêm Chapter từ Frontend

Trạng thái: Hoàn thành

Đã thực hiện:
- Thêm form tạo chapter trên frontend
- Gửi JWT token khi gọi `POST /api/chapters`
- Tạo chapter thành công từ giao diện web
- Liên kết chapter với comic thông qua `comicId`
- Test event `chapter.created` thành công

Ghi chú:
- Admin cần copy `_id` của comic để tạo chapter
- Chapter Service publish event qua RabbitMQ
- Notification Service nhận event chương mới

### Bước 32: Xem chi tiết truyện và đọc chapter

Trạng thái: Hoàn thành

Đã thực hiện:
- Thêm chức năng click vào comic để xem chi tiết
- Gọi API `GET /api/chapters/comic/:comicId`
- Hiển thị danh sách chapter theo comic
- Thêm chức năng click chapter để đọc nội dung
- Hiển thị danh sách ảnh của chapter
- Thêm nút Back để quay lại danh sách truyện

Ghi chú:
- Frontend hiện đã có flow đọc truyện cơ bản
- User có thể xem comic, xem chapter và đọc ảnh chapter

### Bước 33: Dockerize Frontend

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo `Dockerfile` cho frontend
- Tạo `.dockerignore` cho frontend
- Thêm frontend vào `docker-compose.yml`
- Build và chạy frontend bằng Docker Compose
- Test frontend tại `http://localhost:5173`

Ghi chú:
- Frontend container tên `comic_frontend`
- Toàn bộ hệ thống hiện đã chạy bằng Docker Compose

### Bước 34: Upload cover image local cho Comic Service

Trạng thái: Hoàn thành

Đã thực hiện:
- Tích hợp Multer cho Comic Service
- Upload ảnh cover từ frontend
- Lưu file local trong thư mục uploads
- Serve static file qua `/uploads`
- Frontend preview ảnh trước khi upload
- MongoDB lưu URL ảnh thật

Flow:
Frontend
-> FormData
-> API Gateway
-> Comic Service
-> Multer upload
-> uploads/
-> MongoDB

Ghi chú:
- Cover image hiện đã upload trực tiếp từ thiết bị
- Không còn cần nhập URL ảnh thủ công

### Bước 35: Upload nhiều ảnh chapter từ thiết bị

Trạng thái: Hoàn thành

Đã thực hiện:
- Tích hợp multi-file upload cho Chapter Service
- Upload nhiều ảnh chapter bằng Multer
- Lưu local uploads cho chapter
- Frontend hỗ trợ chọn nhiều file ảnh
- Preview nhiều ảnh trước khi upload
- Reader hiển thị ảnh thật từ local uploads

Flow:
Frontend
-> FormData multi-images
-> API Gateway
-> Chapter Service
-> Multer multi-upload
-> uploads/
-> MongoDB lưu mảng URL
-> Chapter Reader render ảnh

Ghi chú:
- Chapter reader hiện hoạt động như web truyện thực tế
- Ảnh được nối liền nhau theo chiều dọc

### Bước 36: Upload ảnh local cho Comic và Chapter

Trạng thái: Hoàn thành

Đã thực hiện:
- Comic Service hỗ trợ upload cover image từ thiết bị
- Chapter Service hỗ trợ upload nhiều ảnh chapter từ thiết bị
- Sử dụng Multer để xử lý multipart/form-data
- Lưu file ảnh vào thư mục `uploads`
- Serve static file qua `/uploads`
- Frontend hỗ trợ chọn ảnh bìa truyện
- Frontend hỗ trợ chọn nhiều ảnh chapter
- Chapter reader hiển thị ảnh thật và nối liền nhau

Ghi chú:
- Comic cover dùng 1 ảnh
- Chapter dùng mảng nhiều ảnh
- MongoDB lưu URL ảnh sau khi upload

### Bước 37: Thêm Health Check cho API Gateway

Trạng thái: Hoàn thành

Đã thực hiện:
- Thêm endpoint `GET /health`
- API Gateway trả trạng thái hoạt động của service
- Test health check thành công

Ghi chú:
- Health Check dùng để kiểm tra service còn hoạt động hay không
- Có thể dùng cho monitoring, Docker, Kubernetes hoặc load balancer

### Bước 38: Logging Request tại API Gateway

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo logging middleware cho API Gateway
- Log method và URL của request
- Hiển thị timestamp cho mỗi request
- Test logging bằng Postman thành công

Ví dụ log:
[2026-05-20T10:00:00.000Z] GET /api/comics

Ghi chú:
- Logging hỗ trợ monitoring và debugging hệ thống
- Có thể mở rộng bằng Winston hoặc ELK Stack

### Bước 39: Backup và Restore MongoDB

Trạng thái: Hoàn thành

Đã thực hiện:
- Tạo script backup MongoDB bằng mongodump
- Backup toàn bộ MongoDB container ra file archive
- Copy file backup ra máy thật
- Tạo folder backup lưu dữ liệu
- Test backup thành công

Flow:
MongoDB Container
-> mongodump
-> backup.archive
-> docker cp
-> backup/

Ghi chú:
- Backup file lưu tại backup/backup.archive
- Có thể dùng để restore dữ liệu khi hệ thống gặp sự cố

### Bước 40: Role-based Authorization ADMIN / USER

Trạng thái: Hoàn thành

Đã thực hiện:
- Sử dụng role trong User Schema
- JWT payload chứa thông tin role
- API Gateway kiểm tra role trong middleware
- Chặn USER gọi các API quản trị
- Chỉ ADMIN được phép:
  - tạo truyện
  - sửa truyện
  - xóa truyện
  - tạo chapter
- Test thành công:
  - USER token trả `403 Forbidden: Admin only`
  - ADMIN token thực hiện API thành công

Ghi chú:
- Authentication: xác định người dùng là ai
- Authorization: xác định người dùng được phép làm gì
- Role được kiểm tra tập trung tại API Gateway