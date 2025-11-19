# Requirements Document

## Introduction

Thêm tính năng hiển thị toast notification khi có cảnh báo giá được kích hoạt. Người dùng sẽ nhận được thông báo ngay lập tức trên màn hình với nội dung "x cảnh báo vừa được thực hiện, xem thông báo để biết chi tiết", giúp họ không bỏ lỡ các cảnh báo quan trọng ngay cả khi không nhìn vào icon chuông.

## Glossary

- **Toast Notification**: Thông báo popup tạm thời hiển thị trên màn hình
- **Alert System**: Hệ thống cảnh báo giá cryptocurrency
- **Triggered Alert**: Cảnh báo đã được kích hoạt khi giá đạt điều kiện
- **Notification Polling**: Cơ chế kiểm tra định kỳ để phát hiện cảnh báo mới
- **react-hot-toast**: Thư viện hiển thị toast notifications trong React

## Requirements

### Requirement 1

**User Story:** Là người dùng, tôi muốn nhận toast notification khi có cảnh báo mới được kích hoạt, để tôi biết ngay lập tức mà không cần nhìn vào icon chuông

#### Acceptance Criteria

1. WHEN THE Alert System detects new triggered alerts, THE Alert System SHALL display a toast notification
2. THE toast notification SHALL show the count of new triggered alerts in format "x cảnh báo vừa được thực hiện"
3. THE toast notification SHALL include text "xem thông báo để biết chi tiết"
4. WHEN THE count is 1, THE toast notification SHALL display "1 cảnh báo vừa được thực hiện, xem thông báo để biết chi tiết"
5. WHEN THE count is greater than 1, THE toast notification SHALL display "x cảnh báo vừa được thực hiện, xem thông báo để biết chi tiết"

### Requirement 2

**User Story:** Là người dùng, tôi muốn toast notification tự động biến mất sau vài giây, để không làm lộn xộn giao diện

#### Acceptance Criteria

1. THE toast notification SHALL automatically dismiss after 5 seconds
2. THE toast notification SHALL allow manual dismissal by clicking close button
3. WHEN THE user clicks anywhere on toast, THE toast notification SHALL remain visible until auto-dismiss timeout

### Requirement 3

**User Story:** Là người dùng, tôi muốn toast notification có thể click để mở dropdown thông báo, để nhanh chóng xem chi tiết các cảnh báo

#### Acceptance Criteria

1. WHEN THE user clicks on toast notification, THE Alert System SHALL open notification dropdown
2. WHEN THE user clicks on toast notification, THE toast notification SHALL dismiss immediately
3. WHEN THE notification dropdown opens via toast click, THE Alert System SHALL display all triggered alerts

### Requirement 4

**User Story:** Là người dùng, tôi muốn chỉ nhận một toast notification cho tất cả cảnh báo mới trong cùng một lần polling, để tránh bị spam nhiều toast

#### Acceptance Criteria

1. WHEN THE Alert System detects multiple new alerts in one polling cycle, THE Alert System SHALL show only one toast with total count
2. THE Alert System SHALL NOT show separate toasts for each individual alert
3. WHEN THE Alert System detects new alerts in different polling cycles, THE Alert System SHALL show separate toasts for each cycle

### Requirement 5

**User Story:** Là người dùng, tôi muốn toast notification có styling phù hợp với theme của ứng dụng, để trải nghiệm nhất quán

#### Acceptance Criteria

1. THE toast notification SHALL use dark theme matching application design
2. THE toast notification SHALL use primary color accent for emphasis
3. THE toast notification SHALL include an icon indicating alert/notification type
4. THE toast notification SHALL be positioned at top-right of screen
5. THE toast notification SHALL have smooth enter and exit animations

### Requirement 6

**User Story:** Là người dùng, tôi muốn toast notification không hiển thị khi tôi đang mở dropdown thông báo, để tránh thông báo trùng lặp

#### Acceptance Criteria

1. WHEN THE notification dropdown is open, THE Alert System SHALL NOT display toast notifications for new alerts
2. WHEN THE notification dropdown is closed, THE Alert System SHALL resume displaying toast notifications
3. WHEN THE user closes notification dropdown, THE Alert System SHALL check for new alerts and show toast if any exist

