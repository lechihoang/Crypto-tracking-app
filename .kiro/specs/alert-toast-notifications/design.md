# Design Document

## Overview

Thiết kế tính năng toast notification để thông báo người dùng khi có cảnh báo giá mới được kích hoạt. Hệ thống sẽ tích hợp với polling logic hiện có trong NotificationDropdown component và sử dụng react-hot-toast để hiển thị thông báo popup. Toast sẽ có thể click để mở dropdown thông báo và tự động dismiss sau 5 giây.

## Architecture

### Component Integration

```
NotificationDropdown (existing)
├── Polling Logic (existing)
├── Toast Notification System (new)
│   ├── showAlertToast() function
│   └── handleToastClick() function
└── react-hot-toast Toaster (new)
```

### Data Flow

1. **Polling detects new alerts** → Check if dropdown is closed
2. **If dropdown closed** → Show toast notification with count
3. **User clicks toast** → Open dropdown + dismiss toast
4. **Auto-dismiss** → Toast disappears after 5 seconds
5. **Dropdown open** → Suppress toast notifications

## Components and Interfaces

### Toast Notification Function

```typescript
const showAlertToast = (count: number, onClickHandler: () => void) => {
  const message = count === 1 
    ? '1 cảnh báo vừa được thực hiện, xem thông báo để biết chi tiết'
    : `${count} cảnh báo vừa được thực hiện, xem thông báo để biết chi tiết`;
  
  toast(message, {
    duration: 5000,
    position: 'top-right',
    icon: '🔔',
    style: {
      background: '#1f2937', // dark-800
      color: '#f9fafb', // gray-50
      border: '1px solid #4b5563', // gray-600
      borderRadius: '0.75rem',
      padding: '16px',
      cursor: 'pointer',
    },
    onClick: onClickHandler,
  });
};
```

### Updated NotificationDropdown State

Không cần thêm state mới, chỉ cần integrate toast vào polling logic hiện có:

```typescript
// Existing state (no changes needed)
const [isOpen, setIsOpen] = useState(false);
const [alerts, setAlerts] = useState<Alert[]>([]);
const [unviewedCount, setUnviewedCount] = useState(0);
const [previousAlertIds, setPreviousAlertIds] = useState<Set<string>>(new Set());
```

## Implementation Details

### 1. Install and Setup react-hot-toast

**Note**: Package đã được cài đặt sẵn trong project (react-hot-toast@^2.6.0)

Thêm Toaster component vào layout hoặc NotificationDropdown:

```typescript
import { Toaster } from 'react-hot-toast';

// In NotificationDropdown component or layout
<Toaster />
```

### 2. Integrate Toast into Polling Logic

Modify `pollForNewAlerts` function:

```typescript
const pollForNewAlerts = async () => {
  try {
    const response = await alertsApi.getTriggeredAlerts();
    if (response.data) {
      const currentAlerts: Alert[] = response.data;
      const newCount = checkForNewAlerts(currentAlerts, previousAlertIds);
      
      if (newCount > 0) {
        const newUnviewedCount = unviewedCount + newCount;
        setUnviewedCount(newUnviewedCount);
        
        // Update previousAlertIds to include new alerts
        const allIds = new Set([...previousAlertIds, ...currentAlerts.map(a => a._id)]);
        setPreviousAlertIds(allIds);
        
        // Save to localStorage
        saveToLocalStorage(newUnviewedCount, Array.from(allIds));
        
        // NEW: Show toast notification (only if dropdown is closed)
        if (!isOpen) {
          showAlertToast(newCount, handleToastClick);
        }
      }
    }
  } catch (error) {
    console.error('Error polling alerts:', error);
  }
};
```

### 3. Toast Click Handler

```typescript
const handleToastClick = () => {
  // Open dropdown
  setIsOpen(true);
  
  // Reset count
  setUnviewedCount(0);
  
  // Load latest notifications
  loadNotifications();
  
  // Save current alert IDs after loading
  setTimeout(() => {
    const alertIds = alerts.map(a => a._id);
    setPreviousAlertIds(new Set(alertIds));
    saveToLocalStorage(0, alertIds);
  }, 500);
};
```

### 4. Toast Styling Configuration

Custom toast styling để match với dark theme của app:

```typescript
const toastOptions = {
  duration: 5000,
  position: 'top-right' as const,
  icon: '🔔',
  style: {
    background: '#1f2937', // dark-800 from tailwind config
    color: '#f9fafb', // gray-50
    border: '1px solid #4b5563', // gray-600
    borderRadius: '0.75rem',
    padding: '16px',
    cursor: 'pointer',
    maxWidth: '400px',
  },
  // Custom class for additional styling
  className: 'alert-toast',
};
```

### 5. Prevent Toast When Dropdown is Open

Logic đã được implement trong polling:

```typescript
// In pollForNewAlerts
if (newCount > 0 && !isOpen) {
  showAlertToast(newCount, handleToastClick);
}
```

### 6. Message Formatting

```typescript
const formatToastMessage = (count: number): string => {
  if (count === 1) {
    return '1 cảnh báo vừa được thực hiện, xem thông báo để biết chi tiết';
  }
  return `${count} cảnh báo vừa được thực hiện, xem thông báo để biết chi tiết`;
};
```

## Data Models

Không cần thay đổi data models hiện có. Sử dụng Alert interface đã có:

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
  triggeredAt?: string;
  createdAt: string;
}
```

## Error Handling

1. **Toast Library Errors**: Wrap toast calls trong try-catch
2. **Click Handler Errors**: Ensure handleToastClick doesn't throw
3. **Polling Errors**: Existing error handling in pollForNewAlerts

```typescript
const showAlertToast = (count: number, onClickHandler: () => void) => {
  try {
    const message = formatToastMessage(count);
    toast(message, {
      ...toastOptions,
      onClick: () => {
        try {
          onClickHandler();
          toast.dismiss(); // Manually dismiss on click
        } catch (error) {
          console.error('Error handling toast click:', error);
        }
      },
    });
  } catch (error) {
    console.error('Error showing toast:', error);
  }
};
```

## Testing Strategy

### Manual Testing

1. **Toast Display**:
   - Trigger new alert → Verify toast appears with correct message
   - Multiple alerts → Verify count is correct
   - Single alert → Verify singular message format

2. **Toast Interaction**:
   - Click toast → Verify dropdown opens
   - Click toast → Verify toast dismisses
   - Wait 5 seconds → Verify toast auto-dismisses

3. **Dropdown Suppression**:
   - Open dropdown → Trigger alert → Verify no toast
   - Close dropdown → Trigger alert → Verify toast appears

4. **Edge Cases**:
   - Rapid multiple alerts → Verify single toast per polling cycle
   - Toast visible + new alerts → Verify new toast replaces old
   - Click toast while loading → Verify no errors

### Unit Tests (Optional)

1. Test `formatToastMessage()`:
   - count = 1 → singular message
   - count > 1 → plural message with count

2. Test `showAlertToast()`:
   - Verify toast is called with correct options
   - Verify onClick handler is attached

3. Test `handleToastClick()`:
   - Verify dropdown opens
   - Verify count resets
   - Verify notifications load

## UI/UX Considerations

### Visual Design

1. **Toast Appearance**:
   - Dark background matching app theme
   - Bell icon (🔔) for visual consistency
   - Rounded corners (0.75rem)
   - Subtle border for definition

2. **Positioning**:
   - Top-right corner (standard notification position)
   - Below header to avoid overlap
   - Above other content

3. **Animation**:
   - Smooth slide-in from right
   - Fade-out on dismiss
   - react-hot-toast default animations

### Interaction Design

1. **Clickable Area**:
   - Entire toast is clickable
   - Cursor changes to pointer on hover
   - Visual feedback on hover (optional)

2. **Dismissal**:
   - Auto-dismiss after 5 seconds
   - Manual dismiss via close button (react-hot-toast default)
   - Dismiss on click (opens dropdown)

3. **Multiple Toasts**:
   - Stack vertically if multiple appear
   - Newer toasts appear on top
   - Maximum 3 visible at once (react-hot-toast default)

### Accessibility

1. **Screen Readers**:
   - Toast content is readable by screen readers
   - Icon has aria-label if needed

2. **Keyboard Navigation**:
   - Toast can be focused with keyboard
   - Enter/Space to trigger click action
   - Escape to dismiss

## Performance Considerations

1. **Toast Rendering**:
   - Lightweight component, minimal performance impact
   - No re-renders of parent component

2. **Polling Integration**:
   - No additional API calls
   - Uses existing polling mechanism
   - Toast only shown when new alerts detected

3. **Memory**:
   - Toast library handles cleanup automatically
   - No memory leaks from dismissed toasts

## Integration Points

### With Existing NotificationDropdown

1. **Polling Logic**: Add toast call in `pollForNewAlerts`
2. **Click Handler**: Reuse existing dropdown open logic
3. **State Management**: No new state needed
4. **Styling**: Match existing dark theme

### With react-hot-toast

1. **Toaster Component**: Add to layout or NotificationDropdown
2. **Toast Function**: Import and use `toast()` from library
3. **Custom Styling**: Use inline styles or custom classes
4. **Configuration**: Set default options if needed

## Future Enhancements

1. **Sound Notification**: Add optional sound when toast appears
2. **Custom Icons**: Use different icons based on alert type
3. **Rich Content**: Show coin image and price in toast
4. **Action Buttons**: Add "View" and "Dismiss" buttons
5. **Notification Preferences**: Allow users to enable/disable toasts
6. **Desktop Notifications**: Integrate with browser Notification API

