# Design Document

## Overview

Thiết kế cải thiện notification system để hiển thị số lượng cảnh báo chưa xem chính xác và đơn giản hóa UX. Hệ thống sẽ track số lượng triggered alerts mới và increment count khi có alert được trigger. Khi user mở dropdown, count reset về 0.

## Architecture

### Component Structure

```
Header
└── NotificationDropdown
    ├── Bell Icon + Badge
    ├── Dropdown Menu
    └── Notification List
```

### Data Flow

1. **Initial Load**: Component fetch triggered alerts count → Display badge
2. **Polling**: Mỗi 30s fetch triggered alerts → So sánh số lượng → Increment count nếu có mới
3. **User Opens Dropdown**: Reset count về 0 → Show all alerts
4. **User Closes Dropdown**: Resume polling

## Components and Interfaces

### NotificationDropdown Component

**State Management:**
```typescript
interface NotificationState {
  isOpen: boolean;
  alerts: Alert[];
  loading: boolean;
  unviewedCount: number;
  previousAlertIds: Set<string>; // Track alerts đã thấy
}
```

**Key Functions:**

1. `loadNotifications()`: Fetch triggered alerts từ API
2. `checkForNewAlerts()`: So sánh alert IDs với previousAlertIds để detect new alerts
3. `resetCount()`: Reset unviewedCount về 0 khi mở dropdown
4. `startPolling()`: Bắt đầu polling mỗi 30s
5. `stopPolling()`: Dừng polling khi dropdown mở

### LocalStorage Schema

```typescript
const STORAGE_KEY = 'notification_count';
const ALERT_IDS_KEY = 'notification_alert_ids';

interface StoredData {
  count: number;
  alertIds: string[]; // IDs của alerts đã thấy
}
```

## Data Models

### Alert Interface (existing)

```typescript
interface Alert {
  _id: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  coinImage?: string;
  condition: 'above' | 'below';
  targetPrice: number;
  isActive: boolean;
  triggeredPrice?: number;
  triggeredAt?: string; // ISO timestamp
  createdAt: string;
}
```

**Note**: Bỏ field `read` vì không còn track individual read state

## Implementation Details

### 1. Badge Display Logic

```typescript
// Show badge only when unviewedCount > 0
{unviewedCount > 0 && (
  <span className="badge">
    {unviewedCount > 9 ? '9+' : unviewedCount}
  </span>
)}
```

### 2. Check for New Alerts

```typescript
const checkForNewAlerts = (currentAlerts: Alert[], previousIds: Set<string>): number => {
  const newAlerts = currentAlerts.filter(alert => !previousIds.has(alert._id));
  return newAlerts.length;
};
```

### 3. Reset Count When Opening Dropdown

```typescript
const handleOpenDropdown = () => {
  setIsOpen(true);
  
  // Reset count
  setUnviewedCount(0);
  
  // Save current alert IDs
  const alertIds = alerts.map(a => a._id);
  localStorage.setItem(ALERT_IDS_KEY, JSON.stringify(alertIds));
  setPreviousAlertIds(new Set(alertIds));
  
  // Save count
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: 0, alertIds }));
};
```

### 4. Polling Implementation

```typescript
useEffect(() => {
  let intervalId: NodeJS.Timeout;
  
  if (!isOpen) {
    // Start polling when dropdown is closed
    intervalId = setInterval(async () => {
      const response = await alertsApi.getTriggeredAlerts();
      if (response.data) {
        const currentAlerts = response.data;
        const newCount = checkForNewAlerts(currentAlerts, previousAlertIds);
        
        if (newCount > 0) {
          setUnviewedCount(prev => prev + newCount);
          // Update previousAlertIds to include new alerts
          const allIds = new Set([...previousAlertIds, ...currentAlerts.map(a => a._id)]);
          setPreviousAlertIds(allIds);
          
          // Save to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            count: unviewedCount + newCount,
            alertIds: Array.from(allIds)
          }));
        }
      }
    }, 30000); // 30 seconds
  }
  
  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, [isOpen, previousAlertIds, unviewedCount]);
```

### 5. Load from LocalStorage on Mount

```typescript
useEffect(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      setUnviewedCount(data.count || 0);
      setPreviousAlertIds(new Set(data.alertIds || []));
    } catch (e) {
      console.error('Error loading notification state:', e);
    }
  }
  
  // Initial load
  loadNotifications();
}, []);
```

### 6. Simplified Notification Item

Bỏ:
- Individual `read` state
- Background color highlighting (`bg-primary-500/10`)
- Click handler `markAsRead()`
- Hover effect có thể giữ lại cho UX

```typescript
<div className="px-4 py-3 hover:bg-dark-700 transition-colors">
  {/* Notification content */}
</div>
```

## Error Handling

1. **LocalStorage Errors**: Wrap localStorage operations trong try-catch, fallback to count = 0
2. **API Errors**: Show error message trong dropdown, không crash component
3. **Invalid Data**: Validate stored data structure, fallback to empty state

## Testing Strategy

### Unit Tests (Optional)

1. Test `checkForNewAlerts()` với different scenarios:
   - No previous alerts (all new)
   - Some new alerts
   - No new alerts
   - Duplicate alert IDs

2. Test localStorage operations:
   - Save and retrieve count + alert IDs
   - Handle missing data
   - Handle corrupted data

### Manual Testing

1. **Badge Display**:
   - Verify badge shows correct count on load
   - Verify badge hides when count is 0
   - Verify "9+" display for count > 9

2. **Mark as Viewed**:
   - Click bell icon → badge resets to 0
   - Reload page → badge stays at 0
   - New alert triggers → badge increments

3. **Polling**:
   - Verify polling updates count every 30s
   - Verify polling stops when dropdown open
   - Verify polling resumes when dropdown closes

4. **Edge Cases**:
   - Clear localStorage → all alerts show as new
   - No triggered alerts → badge hidden
   - Multiple rapid clicks on bell icon

## Performance Considerations

1. **Polling Interval**: 30s là reasonable balance giữa real-time updates và API load
2. **LocalStorage**: Minimal data stored (chỉ 1 timestamp)
3. **Re-renders**: Optimize với proper dependency arrays trong useEffect
4. **API Calls**: Không cần pagination vì chỉ fetch triggered alerts (thường ít)

## UI/UX Improvements

1. **Simplified Interaction**: Chỉ 1 action (click bell) để mark all as viewed
2. **Clear Visual Feedback**: Badge count rõ ràng, reset ngay lập tức
3. **Consistent Behavior**: Không có individual read states gây confusion
4. **Persistent State**: LocalStorage giữ state across sessions
