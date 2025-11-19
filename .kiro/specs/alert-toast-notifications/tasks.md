# Implementation Plan

- [x] 1. Setup react-hot-toast Toaster component
  - Add Toaster component to app layout or NotificationDropdown
  - Configure default toast options for dark theme
  - Verify toast library is working with a test toast
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2. Create toast notification utility functions
  - [x] 2.1 Create formatToastMessage function
    - Handle singular case (1 cảnh báo)
    - Handle plural case (x cảnh báo)
    - Return formatted message string
    - _Requirements: 1.4, 1.5_

  - [x] 2.2 Create showAlertToast function
    - Accept count and onClick handler parameters
    - Configure toast with custom styling (dark theme)
    - Set duration to 5000ms (5 seconds)
    - Set position to top-right
    - Add bell icon (🔔)
    - Make toast clickable with cursor pointer
    - Wrap in try-catch for error handling
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3. Create toast click handler
  - [x] 3.1 Implement handleToastClick function
    - Open dropdown (setIsOpen to true)
    - Reset unviewed count to 0
    - Load latest notifications
    - Update previousAlertIds with current alerts
    - Save state to localStorage
    - Dismiss toast on click
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Integrate toast into polling logic
  - [x] 4.1 Update pollForNewAlerts function
    - Check if dropdown is closed before showing toast
    - Call showAlertToast when new alerts detected
    - Pass newCount and handleToastClick as parameters
    - Ensure toast only shows once per polling cycle
    - _Requirements: 1.1, 4.1, 4.2, 6.1, 6.2_

  - [x] 4.2 Verify suppression when dropdown is open
    - Test that toast doesn't show when isOpen is true
    - Test that toast resumes when dropdown closes
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 5. Test and verify toast functionality
  - [x] 5.1 Test toast display with different alert counts
    - Test with 1 alert (singular message)
    - Test with multiple alerts (plural message with count)
    - Verify toast appears at top-right position
    - Verify bell icon is displayed
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 5.2 Test toast interaction
    - Click toast and verify dropdown opens
    - Verify toast dismisses on click
    - Verify auto-dismiss after 5 seconds
    - Test manual dismiss with close button
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_

  - [x] 5.3 Test dropdown suppression logic
    - Open dropdown and trigger alert, verify no toast
    - Close dropdown and trigger alert, verify toast appears
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 5.4 Test edge cases
    - Multiple alerts in one polling cycle (single toast)
    - Rapid polling with new alerts
    - Toast visible when new alerts arrive
    - _Requirements: 4.1, 4.2, 4.3_

