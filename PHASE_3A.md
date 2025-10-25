# Phase 3a: Sync Reliability & Recovery

## Goal
Make OneDrive sync production-ready with recovery mechanisms and user controls.

## Why Phase 3a?
Phase 3 (core sync) works in the happy path but is missing critical features:
- No way to recover if IndexedDB is deleted (salt is lost)
- No conflict resolution UI (silently picks "most recent")
- No user-facing sync settings or status
- Limited error handling and retry logic

## Tasks (10 Total)

### Task 1: Salt Recovery Mechanism
Store salt in multiple locations so users can recover without losing access:
- IndexedDB `app-config['salt']` (current)
- Browser `localStorage['lockt-salt-backup']` (backup)
- OneDrive `lockt-salt-metadata.json` (new device recovery)

**Files to modify**:
- `src/services/database.service.ts` - Add localStorage backup
- `src/services/sync.service.ts` - Add salt metadata upload to OneDrive

### Task 2: Account Recovery Flow
Allow users to recover account if IndexedDB deleted but salt is available:
- Check localStorage for backup salt
- Check OneDrive for salt metadata
- Re-derive encryption key using stored salt
- Decrypt and restore data

**Files to create**:
- `src/components/auth/RecoveryFlow.tsx` - Guide user through recovery

### Task 3: Sync Settings UI Component
Allow users to control sync behavior:
- Toggle auto-sync on/off
- Set sync frequency (15, 30, 60 minutes)
- Wi-Fi only toggle
- Conflict resolution strategy (newest/manual)
- Auto-retry on failure

**Files to create**:
- `src/components/sync/SyncSettings.tsx` - Settings modal/page

### Task 4: Sync Status Notifications
Show users what's happening with sync:
- "Syncing to OneDrive..." when started
- "✓ Synced successfully" on completion
- "✗ Sync failed. Retry?" on error
- "⚠ Conflict detected. Resolve?" on conflict

**Files to create**:
- `src/components/sync/SyncStatusToast.tsx` - Toast/snackbar notifications

### Task 5: Conflict Resolution Dialog
Let users choose what to do when versions diverge:
- Display local version (timestamp + data preview)
- Display remote version (timestamp + data preview)
- Options: Keep Local / Download Remote / Merge (if possible)

**Files to create**:
- `src/components/sync/ConflictResolutionDialog.tsx` - Modal for conflict

### Task 6: Sync Progress Indicators
Show upload/download progress:
- Loading spinner during sync
- Progress bar for large data transfers
- Current action (uploading/downloading/comparing)

**Files to modify**:
- `src/components/layout/Header.tsx` - Add sync indicator
- `src/components/sync/SyncStatus.tsx` - Enhance existing component

### Task 7: Retry Logic with Exponential Backoff
Automatically retry failed syncs:
- First retry: 2 seconds
- Second retry: 4 seconds
- Third retry: 8 seconds
- Max 3 retries before giving up

**Files to modify**:
- `src/services/sync.service.ts` - Add retry wrapper

### Task 8: Last Sync Timestamp Display
Show when data was last synced:
- Display in Header: "Last synced 5 minutes ago"
- Update after each successful sync
- Show "Never" if never synced

**Files to modify**:
- `src/components/layout/Header.tsx` - Display last sync time
- `src/services/sync.service.ts` - Track last sync timestamp

### Task 9: Error Handling & User Messages
Provide clear error messages:
- Network errors: "Check your internet connection"
- Auth errors: "Please sign in again"
- Conflict errors: "Data changed on another device"
- Storage errors: "OneDrive ran out of space"

**Files to modify**:
- `src/services/sync.service.ts` - Improve error handling
- `src/components/sync/SyncStatusToast.tsx` - Display user-friendly messages

### Task 10: Multi-Device Sync Testing
Comprehensive testing of sync scenarios:
- Device A creates data, Device B downloads it
- Device A and B both edit same field (conflict)
- Device A offline, comes back online
- Rapid sequential syncs
- Sync while data is being edited

**Files to create**:
- `tests/sync.integration.test.ts` - Sync integration tests (optional)

## Deliverables

✅ **Account Recovery**: Users can recover access after IndexedDB deletion if they have salt backup

✅ **Sync Settings UI**: Users can configure auto-sync frequency, Wi-Fi-only mode, and conflict resolution strategy

✅ **Conflict Resolution Dialog**: Clear UI showing conflicting versions with user choice options

✅ **Real-time Status**: Toast notifications for sync status (started, success, failure, conflict)

✅ **Last Sync Display**: Show in header when data was last synced to OneDrive

✅ **Robust Error Handling**: User-friendly error messages and automatic retry with backoff

✅ **Multi-Device Reliability**: Tested scenarios covering common sync conflicts and edge cases

✅ **Production Readiness**: Sync feature moves from "works in happy path" to "production-ready"

## Priority
**HIGH** - These features are essential for reliable multi-device use.

## Estimated Effort
- Small tasks (3-4, 8): 2-3 hours each
- Medium tasks (1-2, 5-7, 9): 3-4 hours each
- Large task (10): 4-5 hours
- **Total**: ~40 hours or 1-2 weeks depending on testing depth

## Success Criteria
- [ ] Deleted IndexedDB, recovered account using localStorage salt
- [ ] Sync settings persist across sessions
- [ ] Conflict resolution dialog appears and resolves correctly
- [ ] Toast notifications appear for all sync states
- [ ] Last sync time displays and updates
- [ ] Retried sync after network failure
- [ ] Tested 3+ device sync scenarios
- [ ] No unhandled promise rejections in console
