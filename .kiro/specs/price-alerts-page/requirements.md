# Requirements Document

## Introduction

Tính năng trang quản lý cảnh báo giá cho phép người dùng xem, chỉnh sửa và xóa các cảnh báo giá đã tạo. Trang này cung cấp giao diện tập trung để quản lý tất cả các cảnh báo. Sau khi thực hiện các hành động thành công (sửa, xóa), trang sẽ tự động tải lại để hiển thị trạng thái mới nhất.

## Glossary

- **Alert System**: Hệ thống quản lý cảnh báo giá cryptocurrency
- **Active Alert**: Cảnh báo đang hoạt động, chưa được kích hoạt
- **Triggered Alert**: Cảnh báo đã được kích hoạt khi điều kiện giá được đáp ứng
- **Frontend Application**: Ứng dụng Next.js hiển thị giao diện người dùng
- **Backend API**: API NestJS cung cấp các endpoints quản lý cảnh báo

## Requirements

### Requirement 1

**User Story:** Là người dùng, tôi muốn xem danh sách tất cả các cảnh báo giá của mình, để tôi có thể theo dõi và quản lý chúng một cách tập trung.

#### Acceptance Criteria

1. WHEN người dùng truy cập trang cảnh báo, THE Frontend Application SHALL hiển thị danh sách tất cả các cảnh báo của người dùng đó
2. THE Frontend Application SHALL hiển thị thông tin chi tiết cho mỗi cảnh báo bao gồm tên coin, biểu tượng, hình ảnh, điều kiện (above/below), giá mục tiêu và trạng thái (active/triggered)
3. THE Frontend Application SHALL phân biệt rõ ràng giữa cảnh báo đang hoạt động và cảnh báo đã kích hoạt thông qua màu sắc hoặc nhãn
4. WHEN không có cảnh báo nào, THE Frontend Application SHALL hiển thị thông báo trống với nút tạo cảnh báo mới
5. THE Frontend Application SHALL hiển thị loading state trong khi đang tải dữ liệu cảnh báo

### Requirement 2

**User Story:** Là người dùng, tôi muốn xóa các cảnh báo không còn cần thiết, để tôi có thể dọn dẹp danh sách cảnh báo của mình.

#### Acceptance Criteria

1. THE Frontend Application SHALL hiển thị nút xóa cho mỗi cảnh báo trong danh sách
2. WHEN người dùng nhấn nút xóa, THE Frontend Application SHALL hiển thị modal xác nhận trước khi xóa
3. WHEN người dùng xác nhận xóa, THE Frontend Application SHALL gọi Backend API để xóa cảnh báo
4. WHEN việc xóa thành công, THE Frontend Application SHALL hiển thị thông báo thành công và tự động tải lại danh sách cảnh báo
5. WHEN việc xóa thất bại, THE Frontend Application SHALL hiển thị thông báo lỗi với nội dung cụ thể

### Requirement 3

**User Story:** Là người dùng, tôi muốn chỉnh sửa các cảnh báo hiện có, để tôi có thể cập nhật điều kiện hoặc giá mục tiêu mà không cần tạo cảnh báo mới.

#### Acceptance Criteria

1. THE Frontend Application SHALL hiển thị nút chỉnh sửa cho mỗi cảnh báo trong danh sách
2. WHEN người dùng nhấn nút chỉnh sửa, THE Frontend Application SHALL hiển thị modal với form chứa thông tin hiện tại của cảnh báo
3. THE Frontend Application SHALL cho phép người dùng thay đổi điều kiện (above/below) và giá mục tiêu
4. WHEN người dùng lưu thay đổi, THE Frontend Application SHALL gọi Backend API để cập nhật cảnh báo
5. WHEN việc cập nhật thành công, THE Frontend Application SHALL hiển thị thông báo thành công và tự động tải lại danh sách cảnh báo
6. WHEN việc cập nhật thất bại, THE Frontend Application SHALL hiển thị thông báo lỗi với nội dung cụ thể

### Requirement 4

**User Story:** Là người dùng, tôi muốn tạo cảnh báo mới trực tiếp từ trang quản lý, để tôi không cần quay lại trang khác.

#### Acceptance Criteria

1. THE Frontend Application SHALL hiển thị nút "Tạo cảnh báo mới" ở vị trí dễ thấy trên trang
2. WHEN người dùng nhấn nút tạo mới, THE Frontend Application SHALL hiển thị modal tạo cảnh báo (sử dụng PriceAlertModal component hiện có)
3. WHEN việc tạo cảnh báo thành công, THE Frontend Application SHALL đóng modal và tự động tải lại danh sách cảnh báo
4. THE Frontend Application SHALL hiển thị thông báo thành công sau khi tạo cảnh báo mới

### Requirement 5

**User Story:** Là người dùng, tôi muốn lọc danh sách cảnh báo theo đồng tiền, để tôi có thể dễ dàng tìm kiếm cảnh báo cụ thể.

#### Acceptance Criteria

1. THE Frontend Application SHALL cung cấp ô tìm kiếm để lọc cảnh báo theo tên hoặc ký hiệu coin
2. WHEN người dùng nhập vào ô tìm kiếm, THE Frontend Application SHALL cập nhật danh sách hiển thị ngay lập tức
3. THE Frontend Application SHALL hiển thị số lượng kết quả tìm kiếm
4. WHEN không có kết quả tìm kiếm, THE Frontend Application SHALL hiển thị thông báo "Không tìm thấy cảnh báo"
