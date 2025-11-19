# Requirements Document

## Introduction

Cải thiện hệ thống thông báo cảnh báo giá để có trải nghiệm người dùng tốt hơn. Hiện tại, số lượng thông báo chưa đọc không hiển thị chính xác và logic đánh dấu đã đọc gây nhầm lẫn. Hệ thống cần được cải thiện để hiển thị số lượng cảnh báo mới một cách chính xác và reset khi người dùng mở dropdown thông báo.

## Glossary

- **Notification System**: Hệ thống hiển thị thông báo cảnh báo giá trong header
- **Bell Icon**: Icon chuông thông báo trong header
- **Notification Badge**: Badge hiển thị số lượng thông báo chưa xem
- **Notification Dropdown**: Menu dropdown hiển thị danh sách thông báo
- **Triggered Alert**: Cảnh báo giá đã được kích hoạt (đạt điều kiện)
- **Unviewed Notification**: Thông báo chưa được xem (chưa mở dropdown)

## Requirements

### Requirement 1

**User Story:** Là người dùng, tôi muốn thấy số lượng cảnh báo mới ngay trên icon chuông, để tôi biết có bao nhiêu cảnh báo cần xem mà không cần mở dropdown

#### Acceptance Criteria

1. WHEN THE Notification System loads, THE Notification System SHALL fetch triggered alerts from backend and display count on Notification Badge
2. WHILE THE Notification Badge has unviewed notifications, THE Notification Badge SHALL display the count number with red background
3. WHEN THE count exceeds 9, THE Notification Badge SHALL display "9+" instead of exact number
4. WHEN THE count is 0, THE Notification Badge SHALL be hidden

### Requirement 2

**User Story:** Là người dùng, tôi muốn số thông báo reset về 0 khi tôi click vào icon chuông, để tôi biết rằng tôi đã xem các thông báo mới

#### Acceptance Criteria

1. WHEN THE user clicks Bell Icon, THE Notification System SHALL mark all notifications as viewed
2. WHEN THE user clicks Bell Icon, THE Notification Badge SHALL reset count to 0 and hide badge
3. WHEN THE Notification Dropdown opens, THE Notification System SHALL display all triggered alerts regardless of viewed status

### Requirement 3

**User Story:** Là người dùng, tôi muốn bỏ logic đổi màu khi click vào từng notification item, để giao diện đơn giản hơn và tập trung vào việc xem thông báo

#### Acceptance Criteria

1. THE Notification System SHALL remove individual notification read/unread state
2. THE Notification System SHALL remove background color highlighting for individual notifications
3. THE Notification System SHALL remove click handler that marks individual notifications as read

### Requirement 4

**User Story:** Là người dùng, tôi muốn số thông báo tự động cập nhật khi có cảnh báo mới được trigger, để tôi không bỏ lỡ thông tin quan trọng

#### Acceptance Criteria

1. WHEN THE Notification System is mounted, THE Notification System SHALL poll for new triggered alerts every 30 seconds
2. WHEN THE new triggered alerts are detected, THE Notification System SHALL update Notification Badge count
3. WHEN THE user opens Notification Dropdown, THE Notification System SHALL pause polling
4. WHEN THE user closes Notification Dropdown, THE Notification System SHALL resume polling

### Requirement 5

**User Story:** Là người dùng, tôi muốn trạng thái "đã xem" được lưu lại, để khi tôi reload trang thì số thông báo không hiện lại các cảnh báo đã xem

#### Acceptance Criteria

1. THE Notification System SHALL store last viewed timestamp in localStorage
2. WHEN THE user clicks Bell Icon, THE Notification System SHALL update last viewed timestamp to current time
3. WHEN THE Notification System loads, THE Notification System SHALL compare triggered alerts timestamp with last viewed timestamp to calculate unviewed count
4. WHEN THE triggered alert timestamp is after last viewed timestamp, THE Notification System SHALL count it as unviewed
