# Implementation Plan

- [x] 1. Update NotificationDropdown component state management
  - Remove individual `read` state from Alert interface usage
  - Add `unviewedCount` state to track badge number
  - Add `previousAlertIds` state (Set<string>) to track seen alerts
  - Update initial state to load from localStorage
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Implement localStorage utilities
  - [x] 2.1 Create constants for storage keys
    - Define `STORAGE_KEY = 'notification_count'`
    - Define `ALERT_IDS_KEY = 'notification_alert_ids'`
    - _Requirements: 5.1, 5.2_

  - [x] 2.2 Implement load from localStorage on mount
    - Read stored count and alert IDs
    - Initialize state with stored values
    - Handle missing or corrupted data with try-catch
    - _Requirements: 5.1, 5.3_

  - [x] 2.3 Implement save to localStorage
    - Save count and alert IDs when updated
    - Wrap in try-catch for error handling
    - _Requirements: 5.2_

- [x] 3. Implement new alert detection logic
  - [x] 3.1 Create `checkForNewAlerts` function
    - Compare current alerts with previousAlertIds Set
    - Return count of new alerts (alerts not in Set)
    - _Requirements: 4.2_

  - [x] 3.2 Update polling to detect and increment count
    - Call checkForNewAlerts in polling interval
    - Increment unviewedCount when new alerts detected
    - Update previousAlertIds Set with new alert IDs
    - Save updated state to localStorage
    - _Requirements: 4.1, 4.2_

- [x] 4. Implement reset count on dropdown open
  - [x] 4.1 Create handleOpenDropdown function
    - Set isOpen to true
    - Reset unviewedCount to 0
    - Save current alert IDs to previousAlertIds
    - Save state to localStorage
    - _Requirements: 2.1, 2.2_

  - [x] 4.2 Update bell icon onClick handler
    - Call handleOpenDropdown instead of just setIsOpen
    - _Requirements: 2.1_

- [x] 5. Simplify notification item rendering
  - [x] 5.1 Remove individual read state logic
    - Remove `read` field from Alert type usage
    - Remove `markAsRead` function
    - Remove onClick handler from notification items
    - _Requirements: 3.1, 3.3_

  - [x] 5.2 Remove conditional styling
    - Remove `bg-primary-500/10` background for unread items
    - Keep hover effect for better UX
    - _Requirements: 3.2_

- [x] 6. Update polling behavior
  - [x] 6.1 Implement pause polling when dropdown open
    - Check `!isOpen` condition before starting interval
    - Clear interval when dropdown opens
    - _Requirements: 4.3_

  - [x] 6.2 Implement resume polling when dropdown closes
    - Restart interval when isOpen becomes false
    - _Requirements: 4.4_

- [x] 7. Update badge display logic
  - [x] 7.1 Show badge only when count > 0
    - Conditional render based on unviewedCount
    - _Requirements: 1.4_

  - [x] 7.2 Display "9+" for counts over 9
    - Add ternary to show "9+" when count > 9
    - _Requirements: 1.3_

  - [x] 7.3 Ensure badge styling is correct
    - Red background (bg-danger-500)
    - Positioned absolutely on bell icon
    - _Requirements: 1.2_
