# Design Document

## Overview

Trang quản lý cảnh báo giá là một trang Next.js độc lập cho phép người dùng xem, tạo, chỉnh sửa, xóa và lọc các cảnh báo giá cryptocurrency. Trang này sẽ tái sử dụng các components hiện có như `PriceAlertModal` và `DeleteConfirmModal`, đồng thời tạo một component mới `EditAlertModal` để chỉnh sửa cảnh báo.

## Architecture

### Page Structure

```
frontend/src/app/alerts/
  └── page.tsx (Alerts Management Page)
```

### Component Structure

```
Components:
├── PriceAlertModal (existing) - Tạo cảnh báo mới
├── EditAlertModal (new) - Chỉnh sửa cảnh báo
├── DeleteConfirmModal (existing) - Xác nhận xóa
└── AlertCard (inline) - Hiển thị thông tin cảnh báo
```

### Data Flow

1. **Load Alerts**: Page → alertsApi.getAlerts() → Display list
2. **Create Alert**: Button → PriceAlertModal → alertsApi.createAlert() → Reload
3. **Edit Alert**: Button → EditAlertModal → alertsApi.updateAlert() → Reload
4. **Delete Alert**: Button → DeleteConfirmModal → alertsApi.deleteAlert() → Reload
5. **Filter**: Search input → Filter state → Filtered list display

## Components and Interfaces

### 1. Alerts Page (`/app/alerts/page.tsx`)

**Responsibilities:**
- Fetch và hiển thị danh sách cảnh báo
- Quản lý state cho modals (create, edit, delete)
- Xử lý filter/search
- Reload data sau các actions

**State Management:**
```typescript
const [alerts, setAlerts] = useState<PriceAlert[]>([]);
const [loading, setLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState('');
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);
const [deletingAlert, setDeletingAlert] = useState<PriceAlert | null>(null);
```

**Key Functions:**
- `fetchAlerts()`: Load danh sách cảnh báo từ API
- `handleCreateSuccess()`: Reload sau khi tạo thành công
- `handleEditSuccess()`: Reload sau khi sửa thành công
- `handleDeleteConfirm()`: Xóa cảnh báo và reload
- `filteredAlerts`: Computed property lọc alerts theo searchQuery

### 2. EditAlertModal Component

**Props:**
```typescript
interface EditAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: PriceAlert;
  onSuccess: () => void;
}
```

**Features:**
- Pre-fill form với dữ liệu hiện tại
- Cho phép chỉnh sửa condition (above/below) và targetPrice
- Validation giá mục tiêu
- Call API để update
- Toast notifications

**Form Fields:**
- Coin info (read-only display)
- Condition dropdown (above/below)
- Target price input
- Submit/Cancel buttons

### 3. Alert Card (Inline Component)

**Display Information:**
- Coin image, name, symbol
- Current condition and target price
- Status badge (Active/Triggered)
- Created date
- Action buttons (Edit, Delete)

**Visual States:**
- Active alerts: Green indicator
- Triggered alerts: Gray with "Đã kích hoạt" badge
- Hover effects for actions

## Data Models

### PriceAlert (Existing Type)

```typescript
interface PriceAlert {
  _id: string;
  userId: string;
  coinId: string;
  coinSymbol?: string;
  coinName?: string;
  coinImage?: string;
  condition: 'above' | 'below';
  targetPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  triggeredPrice?: number;
  triggeredAt?: string;
}
```

### UpdateAlertRequest (New Type)

```typescript
interface UpdateAlertRequest {
  condition?: 'above' | 'below';
  targetPrice?: number;
  isActive?: boolean;
}
```

## API Integration

### Existing API Methods (from alertsApi)

- `getAlerts()`: Lấy danh sách cảnh báo
- `createAlert(data)`: Tạo cảnh báo mới
- `deleteAlert(alertId)`: Xóa cảnh báo
- `toggleAlert(alertId, isActive)`: Bật/tắt cảnh báo

### New API Method Required

```typescript
async updateAlert(
  alertId: string, 
  data: UpdateAlertRequest
): Promise<AlertsResponse<PriceAlert>>
```

**Backend Endpoint:** `PATCH /alerts/:id`

**Implementation in api.ts:**
```typescript
async updateAlert(
  alertId: string, 
  data: UpdateAlertRequest
): Promise<AlertsResponse<PriceAlert>> {
  try {
    const response = await backendApi.patch(`/alerts/${alertId}`, data);
    return { data: response.data };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      error: err.response?.data?.message || 'Cập nhật cảnh báo thất bại'
    };
  }
}
```

## UI/UX Design

### Layout Structure

```
┌─────────────────────────────────────────┐
│ Header (existing)                       │
├─────────────────────────────────────────┤
│ Page Title: "Quản lý cảnh báo giá"     │
│ [Tạo cảnh báo mới] button               │
│                                         │
│ Search: [🔍 Tìm kiếm theo tên coin...] │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ Alert Card 1                    │   │
│ │ [Edit] [Delete]                 │   │
│ └─────────────────────────────────┘   │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ Alert Card 2                    │   │
│ │ [Edit] [Delete]                 │   │
│ └─────────────────────────────────┘   │
│                                         │
│ ... more cards ...                      │
└─────────────────────────────────────────┘
```

### Color Scheme (Consistent with existing design)

- Background: `bg-gray-900`
- Cards: `bg-gray-800` with `border-gray-600/50`
- Primary action: `bg-primary-500` (blue)
- Success: `text-success-500` (green)
- Danger: `text-danger-500` (red)
- Text: `text-white`, `text-gray-300`

### Responsive Design

- Desktop: Grid layout with 1-2 columns
- Tablet: Single column
- Mobile: Single column with adjusted padding

## Error Handling

### Error Scenarios

1. **Failed to load alerts**
   - Display error message
   - Show retry button
   - Log error to console

2. **Failed to create/edit/delete**
   - Show toast error notification
   - Keep modal open for retry
   - Display specific error message from API

3. **Network errors**
   - Show generic "Lỗi kết nối" message
   - Provide retry option

### Loading States

- Initial page load: Full page spinner
- Action in progress: Button disabled with loading text
- Modal operations: Modal-level loading indicator

## Testing Strategy

### Manual Testing Checklist

1. **Display Tests**
   - [ ] Alerts load correctly on page mount
   - [ ] Empty state displays when no alerts
   - [ ] Loading state shows during fetch
   - [ ] Alert cards display all information correctly
   - [ ] Active/triggered status shows correctly

2. **Create Alert Tests**
   - [ ] Modal opens when clicking "Tạo cảnh báo mới"
   - [ ] Can create alert successfully
   - [ ] List reloads after creation
   - [ ] Success toast appears

3. **Edit Alert Tests**
   - [ ] Edit modal opens with pre-filled data
   - [ ] Can change condition and price
   - [ ] Update saves successfully
   - [ ] List reloads after update
   - [ ] Success toast appears

4. **Delete Alert Tests**
   - [ ] Delete confirmation modal appears
   - [ ] Can cancel deletion
   - [ ] Can confirm deletion
   - [ ] List reloads after deletion
   - [ ] Success toast appears

5. **Filter Tests**
   - [ ] Search filters by coin name
   - [ ] Search filters by coin symbol
   - [ ] Search is case-insensitive
   - [ ] Empty results show appropriate message

6. **Error Handling Tests**
   - [ ] Network error shows error message
   - [ ] API error shows specific message
   - [ ] Failed operations show toast error

### Browser Testing

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

1. **Optimize Re-renders**
   - Use `useMemo` for filtered alerts
   - Use `useCallback` for event handlers
   - Memoize alert cards if list is large

2. **API Calls**
   - Single fetch on mount
   - Reload only after successful mutations
   - Consider implementing optimistic updates

3. **Image Loading**
   - Use Next.js Image component for coin images
   - Lazy load images
   - Provide fallback for missing images

## Accessibility

- Semantic HTML elements
- ARIA labels for buttons and modals
- Keyboard navigation support
- Focus management in modals
- Screen reader friendly error messages

## Future Enhancements (Out of Scope)

- Bulk delete alerts
- Sort options (by date, price, coin)
- Export alerts to CSV
- Alert history/logs
- Push notifications
- Real-time price updates on alert cards
