# Implementation Plan

- [x] 1. Cập nhật API client và types
  - [x] 1.1 Thêm UpdateAlertRequest type vào frontend/src/types/alerts.ts
    - Định nghĩa interface UpdateAlertRequest với các field optional: condition, targetPrice, isActive
    - _Requirements: 3.4_
  
  - [x] 1.2 Thêm updateAlert method vào alertsApi trong frontend/src/lib/api.ts
    - Implement PATCH request đến /alerts/:id endpoint
    - Xử lý response và error tương tự các methods khác
    - Return AlertsResponse<PriceAlert>
    - _Requirements: 3.4_

- [x] 2. Tạo EditAlertModal component
  - [x] 2.1 Tạo file frontend/src/components/EditAlertModal.tsx
    - Định nghĩa EditAlertModalProps interface (isOpen, onClose, alert, onSuccess)
    - Setup component structure với modal overlay và form
    - _Requirements: 3.1, 3.2_
  
  - [x] 2.2 Implement form với pre-filled data
    - Hiển thị thông tin coin (read-only): image, name, symbol
    - Dropdown cho condition (above/below) với giá trị hiện tại
    - Input cho targetPrice với giá trị hiện tại
    - Validation cho targetPrice (phải > 0)
    - _Requirements: 3.2, 3.3_
  
  - [x] 2.3 Implement update logic
    - Handle form submit
    - Call alertsApi.updateAlert với alertId và data
    - Show toast notifications (loading, success, error)
    - Call onSuccess callback sau khi update thành công
    - Close modal sau khi thành công
    - _Requirements: 3.4, 3.5, 3.6_

- [x] 3. Tạo Alerts management page
  - [x] 3.1 Tạo file frontend/src/app/alerts/page.tsx
    - Setup page component với authentication check
    - Import các components cần thiết (PriceAlertModal, EditAlertModal, DeleteConfirmModal)
    - _Requirements: 1.1_
  
  - [x] 3.2 Implement state management
    - State cho alerts list, loading, searchQuery
    - State cho modals: isCreateModalOpen, editingAlert, deletingAlert
    - _Requirements: 1.1, 5.1_
  
  - [x] 3.3 Implement fetchAlerts function
    - Call alertsApi.getAlerts() on mount
    - Handle loading state
    - Handle errors với error message display
    - _Requirements: 1.1, 1.5_
  
  - [x] 3.4 Implement search/filter functionality
    - Search input field với icon
    - Filter alerts theo coinName hoặc coinSymbol (case-insensitive)
    - Use useMemo để optimize filtered list
    - Display số lượng kết quả
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 3.5 Implement alert cards display
    - Map qua filtered alerts và render cards
    - Hiển thị coin image (với fallback), name, symbol
    - Hiển thị condition icon (TrendingUp/TrendingDown) và label
    - Hiển thị targetPrice formatted
    - Hiển thị status badge (Active/Triggered)
    - Hiển thị created date
    - Phân biệt active và triggered alerts bằng màu sắc
    - _Requirements: 1.2, 1.3_
  
  - [x] 3.6 Implement empty state
    - Check nếu alerts.length === 0
    - Hiển thị icon, message và nút "Tạo cảnh báo mới"
    - _Requirements: 1.4_
  
  - [x] 3.7 Implement action buttons
    - Edit button cho mỗi alert → open EditAlertModal
    - Delete button cho mỗi alert → open DeleteConfirmModal
    - "Tạo cảnh báo mới" button ở header → open PriceAlertModal
    - _Requirements: 2.1, 3.1, 4.1_

- [x] 4. Implement modal handlers và reload logic
  - [x] 4.1 Implement create alert handler
    - Open/close PriceAlertModal
    - handleCreateSuccess: reload alerts sau khi tạo thành công
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [x] 4.2 Implement edit alert handler
    - Open EditAlertModal với alert data
    - handleEditSuccess: reload alerts sau khi update thành công
    - _Requirements: 3.5_
  
  - [x] 4.3 Implement delete alert handler
    - Open DeleteConfirmModal với alert info
    - handleDeleteConfirm: call alertsApi.deleteAlert
    - Show toast notifications
    - Reload alerts sau khi xóa thành công
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 5. Styling và responsive design
  - [x] 5.1 Style alerts page layout
    - Page container với padding và max-width
    - Header section với title và create button
    - Search bar styling
    - Grid/flex layout cho alert cards
    - _Requirements: 1.1_
  
  - [x] 5.2 Style alert cards
    - Card background, border, shadow
    - Hover effects
    - Status indicators (active dot, triggered badge)
    - Action buttons positioning và hover states
    - Responsive layout (desktop/tablet/mobile)
    - _Requirements: 1.2, 1.3_
  
  - [x] 5.3 Style EditAlertModal
    - Modal overlay và container
    - Form layout và spacing
    - Dropdown và input styling nhất quán với PriceAlertModal
    - Button styling (Cancel/Save)
    - _Requirements: 3.2_

- [x] 6. Add navigation link
  - [x] 6.1 Thêm link "Cảnh báo" vào Header component
    - Update frontend/src/components/Header.tsx
    - Thêm navigation item cho /alerts route
    - Highlight active state khi ở trang alerts
    - _Requirements: 1.1_
