# Phase 3a: Sync Reliability & Recovery - Test Plan

## Overview
This test plan validates the implementation of Phase 3a features including salt recovery, conflict resolution, retry logic, toast notifications, and error handling.

---

## Pre-Test Setup

### Required Accounts & Devices
- **Device A**: Primary test device (e.g., Windows PC with Chrome)
- **Device B**: Secondary test device (e.g., Mac with Safari or iPhone with Safari)
- **OneDrive Account**: Microsoft account with at least 100MB free space

### Initial Setup Steps
1. **Device A**: Build and run the app: `npm run dev`
2. Create a new account with password: `Test123!`
3. Save the 12-word recovery phrase
4. Add sample data:
   - 3 passwords (e.g., "Bank Account", "Gmail", "Netflix")
   - 2 credit cards
   - 1 crypto wallet
   - 2 freetext entries
   - 1 health provider
5. Sign in to OneDrive and perform initial sync

---

## Test Suite 1: Salt Recovery (Tasks 1 & 2)

### Test 1.1: Salt Backup Creation
**Priority**: 🔴 Critical
**Feature**: Salt is backed up to all locations on creation

**Steps**:
1. Open DevTools → Console
2. Check `localStorage.getItem('lockt-salt-backup')` exists
3. Check IndexedDB → `lockt-db` → `app-config` → `salt` exists
4. If OneDrive connected: Check OneDrive App Folder for `lockt-salt-metadata.json`

**Expected**:
- ✅ Console shows base64 salt value in localStorage
- ✅ IndexedDB contains salt in app-config
- ✅ OneDrive file exists (if connected)

**Actual**: _____________________

---

### Test 1.2: Salt Recovery from localStorage
**Priority**: 🔴 Critical
**Feature**: Recover account when IndexedDB deleted but localStorage intact

**Steps**:
1. Open DevTools → Application → IndexedDB
2. Right-click `lockt-db` → Delete database
3. Reload page (`Ctrl+R` or `Cmd+R`)
4. Observe Recovery Flow screen

**Expected**:
- ✅ Recovery Flow appears automatically
- ✅ Shows "✓ Available" for Browser Storage
- ✅ Click "Recover Account" successfully restores salt
- ✅ Can log in with original password
- ✅ All data is accessible

**Actual**: _____________________

---

### Test 1.3: Salt Recovery from OneDrive
**Priority**: 🟠 High
**Feature**: Recover account from new device using OneDrive

**Steps**:
1. **Device A**: Ensure synced to OneDrive
2. **Device B**: Open app (fresh browser, no localStorage)
3. Observe setup/recovery flow

**Expected**:
- ✅ App detects no local data
- ✅ Option to "Sign in to OneDrive" appears
- ✅ After OneDrive sign-in, recovery detects salt metadata
- ✅ Recovery completes successfully
- ✅ Can decrypt data with password

**Actual**: _____________________

---

### Test 1.4: Recovery Failure - No Backups
**Priority**: 🟡 Medium
**Feature**: Graceful handling when no backups exist

**Steps**:
1. Clear all data:
   - Delete IndexedDB (`lockt-db`)
   - Clear localStorage (`localStorage.clear()`)
   - Manually delete OneDrive file (via OneDrive web)
2. Reload page

**Expected**:
- ✅ Recovery Flow shows "No Recovery Backups Found"
- ✅ Displays helpful reasons (first time, data cleared, etc.)
- ✅ Options: "Start Fresh Setup" or "Reset App"
- ✅ "Start Fresh" redirects to setup screen

**Actual**: _____________________

---

## Test Suite 2: Conflict Resolution (Task 5)

### Test 2.1: Conflict Detection
**Priority**: 🔴 Critical
**Feature**: Detect when both devices modified data since last sync

**Setup**:
1. **Device A**: Sync data to OneDrive (confirm success)
2. **Device A**: Go offline (disable network or close browser)
3. **Device B**: Modify a password ("Bank Account" → username change)
4. **Device B**: Sync to OneDrive (should succeed)
5. **Device A**: Go back online, modify same password (different field)
6. **Device A**: Attempt sync

**Expected**:
- ✅ Conflict dialog appears on Device A
- ✅ Shows both timestamps with time difference
- ✅ Displays data sizes for both versions
- ✅ Two options: "Keep Local Version" / "Download Cloud Version"
- ✅ Clear warnings about overwrite consequences

**Actual**: _____________________

---

### Test 2.2: Resolve Conflict - Keep Local
**Priority**: 🔴 Critical
**Feature**: User chooses to upload local version

**Setup**: Continue from Test 2.1

**Steps**:
1. In conflict dialog, select "Keep Local Version"
2. Click "Upload Local Version" button
3. Observe toast notifications

**Expected**:
- ✅ Toast shows "Conflict resolved: Local version uploaded"
- ✅ Sync status changes to success
- ✅ **Device B**: Sync again → downloads Device A's version
- ✅ Device B now has Device A's changes

**Actual**: _____________________

---

### Test 2.3: Resolve Conflict - Download Remote
**Priority**: 🔴 Critical
**Feature**: User chooses to download cloud version

**Setup**: Repeat conflict scenario from Test 2.1

**Steps**:
1. In conflict dialog, select "Download Cloud Version"
2. Click "Download Cloud Version" button
3. Observe page reload

**Expected**:
- ✅ Toast shows "Conflict resolved: Cloud version downloaded"
- ✅ Toast shows "Reloading to apply changes..."
- ✅ Page reloads automatically after 1 second
- ✅ After reload, data matches Device B's version
- ✅ Local changes are lost (expected behavior)

**Actual**: _____________________

---

### Test 2.4: Cancel Conflict Resolution
**Priority**: 🟡 Medium
**Feature**: User can dismiss conflict dialog without resolving

**Setup**: Trigger conflict as in Test 2.1

**Steps**:
1. Click "Cancel" button or click outside dialog
2. Observe UI state

**Expected**:
- ✅ Dialog closes
- ✅ Sync status returns to idle
- ✅ No data changes
- ✅ Can retry sync later (conflict reappears)

**Actual**: _____________________

---

## Test Suite 3: Retry Logic (Task 7)

### Test 3.1: Network Retry - Transient Failure
**Priority**: 🟠 High
**Feature**: Auto-retry with exponential backoff

**Steps**:
1. Open DevTools → Network tab
2. Click "Sync" button
3. **Immediately** enable throttling (Slow 3G or Offline)
4. Observe console logs
5. After 2-3 seconds, disable throttling
6. Wait for retries

**Expected**:
- ✅ Console shows retry attempts with delays:
  - "Attempt 1/3... Retrying in 2s"
  - "Attempt 2/3... Retrying in 4s"
  - "Attempt 3/3... Retrying in 8s"
- ✅ If network restored during retry window → succeeds
- ✅ Toast shows "Data uploaded to OneDrive" on success

**Actual**: _____________________

---

### Test 3.2: Retry Exhaustion
**Priority**: 🟠 High
**Feature**: Give up after 3 failed attempts

**Steps**:
1. Go completely offline (disable network)
2. Attempt sync
3. Stay offline through all retries

**Expected**:
- ✅ 3 retry attempts with increasing delays
- ✅ After 3rd failure, stops retrying
- ✅ Toast shows user-friendly error: "Check your internet connection and try again"
- ✅ Toast has "Retry" button
- ✅ Clicking "Retry" starts new sync attempt

**Actual**: _____________________

---

### Test 3.3: No Retry for Conflicts
**Priority**: 🟡 Medium
**Feature**: Conflicts skip retry logic

**Steps**:
1. Create conflict scenario (Test 2.1)
2. Trigger sync with conflict
3. Observe behavior

**Expected**:
- ✅ No retry attempts in console
- ✅ Conflict dialog appears immediately
- ✅ User must resolve manually

**Actual**: _____________________

---

### Test 3.4: No Retry for Auth Errors
**Priority**: 🟡 Medium
**Feature**: Auth errors require manual sign-in

**Steps**:
1. Sign in to OneDrive
2. Manually revoke token (go to Microsoft Account → Active sessions → Remove)
3. Attempt sync

**Expected**:
- ✅ No retry attempts
- ✅ Toast shows "Your OneDrive session expired. Please sign in again"
- ✅ Sync status shows error
- ✅ User can click "Sign In" to re-authenticate

**Actual**: _____________________

---

## Test Suite 4: Toast Notifications (Task 4)

### Test 4.1: Success Toasts
**Priority**: 🟡 Medium
**Feature**: Visual feedback for successful operations

**Steps**:
1. Perform sync (upload)
2. Perform sync (download)
3. Perform sync (no changes)
4. Sign in to OneDrive
5. Resolve a conflict

**Expected**:
- ✅ Upload: "Data uploaded to OneDrive"
- ✅ Download: "Data downloaded from OneDrive"
- ✅ No changes: "Data synced with OneDrive"
- ✅ Sign in: "Connected to OneDrive as [email]"
- ✅ Conflict resolved: "Conflict resolved: [action]"
- ✅ All toasts auto-dismiss after 5 seconds
- ✅ Green checkmark icon

**Actual**: _____________________

---

### Test 4.2: Error Toasts with Retry
**Priority**: 🟡 Medium
**Feature**: Error toasts show actionable retry button

**Steps**:
1. Go offline
2. Attempt sync
3. Observe toast
4. Click "Retry" button

**Expected**:
- ✅ Toast appears with red X icon
- ✅ Message: "Check your internet connection and try again"
- ✅ "Retry" button visible
- ✅ Toast stays for 7 seconds (longer than success)
- ✅ Clicking "Retry" triggers new sync attempt

**Actual**: _____________________

---

### Test 4.3: Warning Toasts
**Priority**: 🟡 Medium
**Feature**: Warnings for conflicts

**Steps**:
1. Create conflict scenario
2. Trigger sync

**Expected**:
- ✅ Yellow/orange warning icon
- ✅ Message: "Sync conflict detected. Please choose a version to keep."
- ✅ Auto-dismisses after 5 seconds
- ✅ Conflict dialog appears regardless

**Actual**: _____________________

---

### Test 4.4: Toast Stacking
**Priority**: 🟡 Medium
**Feature**: Multiple toasts stack vertically

**Steps**:
1. Rapidly trigger multiple operations:
   - Sign in
   - Sync
   - Force upload
   - Force download

**Expected**:
- ✅ Toasts stack in top-right corner
- ✅ Newest toast at bottom
- ✅ No overlap
- ✅ All dismissible independently
- ✅ Auto-dismiss in order received

**Actual**: _____________________

---

## Test Suite 5: Error Messages (Task 9)

### Test 5.1: Network Errors
**Priority**: 🟡 Medium
**Feature**: Clear messaging for network issues

**Test Cases**:
| Scenario | Trigger | Expected Message |
|----------|---------|------------------|
| Offline | Disable network | "Check your internet connection and try again" |
| Timeout | Slow 3G + large data | "Request timed out. Check your connection and try again" |
| DNS Failure | Invalid network | "Check your internet connection and try again" |

**Actual**: _____________________

---

### Test 5.2: Auth Errors
**Priority**: 🟡 Medium
**Feature**: Clear messaging for authentication issues

**Test Cases**:
| Scenario | Trigger | Expected Message |
|----------|---------|------------------|
| Not signed in | Sync without OneDrive | "Please sign in to OneDrive to sync your data" |
| Token expired | Wait 1+ hour, then sync | "Your OneDrive session expired. Please sign in again" |
| Permission denied | Revoke app permissions | "Permission denied. Check your OneDrive app permissions" |

**Actual**: _____________________

---

### Test 5.3: Storage Errors
**Priority**: 🟡 Medium
**Feature**: Clear messaging for storage issues

**Test Cases**:
| Scenario | Trigger | Expected Message |
|----------|---------|------------------|
| Quota exceeded | Fill OneDrive to capacity | "OneDrive is out of storage space. Free up space and try again" |
| File deleted | Delete cloud file manually | "Data not found on OneDrive. It may have been deleted" |

**Actual**: _____________________

---

## Test Suite 6: Multi-Device Sync (Task 10)

### Test 6.1: Basic Multi-Device Flow
**Priority**: 🔴 Critical
**Feature**: Data syncs correctly between devices

**Steps**:
1. **Device A**: Create 5 passwords, sync
2. **Device B**: Sign in, sync (should download)
3. **Device B**: Verify all 5 passwords present
4. **Device B**: Add 3 more passwords, sync
5. **Device A**: Sync (should download)
6. **Device A**: Verify 8 total passwords

**Expected**:
- ✅ All data transfers correctly
- ✅ No data loss
- ✅ Timestamps update correctly
- ✅ Toast notifications appear

**Actual**: _____________________

---

### Test 6.2: Rapid Sequential Syncs
**Priority**: 🟠 High
**Feature**: Handle rapid sync requests gracefully

**Steps**:
1. Click sync button 5 times rapidly
2. Observe behavior

**Expected**:
- ✅ Only one sync executes at a time
- ✅ Other requests show "Sync already in progress"
- ✅ No data corruption
- ✅ No duplicate uploads

**Actual**: _____________________

---

### Test 6.3: Sync During Data Edit
**Priority**: 🟠 High
**Feature**: Handle sync while user editing data

**Steps**:
1. Open password detail view
2. Start editing a field (don't save)
3. Trigger sync from another tab/device
4. Return to editing tab

**Expected**:
- ✅ Edit form remains intact
- ✅ Unsaved changes not lost
- ✅ User warned if conflict detected
- ✅ Can choose to keep edits or discard

**Actual**: _____________________

---

### Test 6.4: Offline-to-Online Transition
**Priority**: 🟠 High
**Feature**: Resume sync when coming back online

**Steps**:
1. Go offline
2. Make 3 data changes
3. Attempt sync (should fail)
4. Go back online
5. Sync again

**Expected**:
- ✅ Offline sync shows "Device is offline"
- ✅ Changes saved locally
- ✅ Online sync succeeds
- ✅ All 3 changes uploaded
- ✅ Toast confirms "Data uploaded to OneDrive"

**Actual**: _____________________

---

## Test Suite 7: Edge Cases & Stress Tests

### Test 7.1: Large Data Set
**Priority**: 🟡 Medium
**Feature**: Handle substantial amount of data

**Steps**:
1. Create 100+ entries across all categories:
   - 50 passwords
   - 30 credit cards
   - 20 freetext entries
   - 10 health records
2. Sync to OneDrive
3. Clear local data
4. Sync from OneDrive (download)

**Expected**:
- ✅ Upload completes within 30 seconds
- ✅ Download completes within 30 seconds
- ✅ All 100+ entries present after download
- ✅ No data corruption
- ✅ No timeout errors

**Actual**: _____________________

---

### Test 7.2: Recovery Phrase Usage
**Priority**: 🟡 Medium
**Feature**: Recovery phrase works correctly

**Steps**:
1. Note the 12-word recovery phrase
2. Completely reset app (clear all data)
3. During login, try using recovery phrase

**Expected**:
- ✅ Recovery phrase input available
- ✅ Correct phrase allows decryption
- ✅ Incorrect phrase shows error
- ✅ Data restored successfully

**Actual**: _____________________

---

### Test 7.3: Concurrent Multi-Device Edits
**Priority**: 🟠 High
**Feature**: Last write wins, with conflict detection

**Steps**:
1. **Both devices**: Open same password entry
2. **Device A**: Edit username → "userA", don't sync
3. **Device B**: Edit password → "passB", don't sync
4. **Device B**: Sync first
5. **Device A**: Sync second

**Expected**:
- ✅ Device A detects conflict
- ✅ Conflict dialog shows both versions
- ✅ User can choose which to keep
- ✅ Chosen version persists across devices

**Actual**: _____________________

---

## Test Suite 8: UI/UX Validation

### Test 8.1: Sync Status Indicators
**Priority**: 🟡 Medium
**Feature**: Real-time sync status visible

**Checklist**:
- ✅ Status icon changes during sync (🔄 → ✅ → ☁️)
- ✅ "Last synced X minutes ago" displays and updates
- ✅ Account name shown when connected
- ✅ Manual sync button disabled during sync
- ✅ Loading spinner visible during operations

**Actual**: _____________________

---

### Test 8.2: Recovery Flow UX
**Priority**: 🟡 Medium
**Feature**: Recovery flow is clear and helpful

**Checklist**:
- ✅ Clear status icons (🔍, ✅, ❌)
- ✅ Backup status displayed (3 locations)
- ✅ Progress indicators during recovery
- ✅ Success/failure states distinct
- ✅ Error messages actionable

**Actual**: _____________________

---

### Test 8.3: Conflict Dialog UX
**Priority**: 🟡 Medium
**Feature**: Conflict dialog is informative

**Checklist**:
- ✅ Timestamps clearly displayed
- ✅ Time difference calculated ("5 hours apart")
- ✅ Data sizes shown
- ✅ Warning text about consequences
- ✅ Buttons clearly labeled
- ✅ Can't submit without choosing

**Actual**: _____________________

---

## Test Suite 9: Mobile Testing (iPhone Safari)

### Test 9.1: Touch Interactions
**Priority**: 🟠 High
**Feature**: All features work on mobile

**Checklist**:
- ✅ Toast notifications visible and dismissible
- ✅ Conflict dialog responsive on small screens
- ✅ Recovery flow works on mobile
- ✅ Sync status readable
- ✅ All buttons tappable (44x44px minimum)

**Actual**: _____________________

---

### Test 9.2: Mobile Network Transitions
**Priority**: 🟠 High
**Feature**: Handle WiFi ↔ Cellular transitions

**Steps**:
1. Start sync on WiFi
2. Disable WiFi (switch to cellular)
3. Complete sync

**Expected**:
- ✅ Sync continues on cellular
- ✅ If WiFi-only enabled, pauses until WiFi returns
- ✅ Toast notification about network change

**Actual**: _____________________

---

## Test Suite 10: Performance & Reliability

### Test 10.1: Sync Performance Benchmarks
**Priority**: 🟡 Medium
**Feature**: Syncs complete in reasonable time

| Data Size | Expected Sync Time | Actual Time |
|-----------|-------------------|-------------|
| 10 entries | < 5 seconds | _________ |
| 50 entries | < 10 seconds | _________ |
| 100 entries | < 20 seconds | _________ |
| 500 entries | < 60 seconds | _________ |

**Notes**: _____________________

---

### Test 10.2: Memory Usage
**Priority**: 🟡 Medium
**Feature**: App doesn't leak memory

**Steps**:
1. Open DevTools → Memory
2. Take heap snapshot
3. Perform 20 sync operations
4. Take another heap snapshot
5. Compare

**Expected**:
- ✅ Memory increase < 10MB
- ✅ No detached DOM nodes
- ✅ No significant object count increase

**Actual**: _____________________

---

## Regression Testing

### Existing Functionality Check
Ensure Phase 3a didn't break existing features:

- ✅ Can create new account
- ✅ Can log in with password
- ✅ Can add/edit/delete passwords
- ✅ Can add/edit/delete credit cards
- ✅ Can add/edit/delete crypto entries
- ✅ Can add/edit/delete freetext
- ✅ Can add/edit/delete health records
- ✅ Search works across all categories
- ✅ Lock/unlock works
- ✅ Export backup works
- ✅ Import backup works

---

## Summary Checklist

### Critical (Must Pass)
- [ ] Salt recovery from localStorage works
- [ ] Salt recovery from OneDrive works
- [ ] Conflict detection works
- [ ] Conflict resolution works (both options)
- [ ] Retry logic attempts 3 times with backoff
- [ ] Multi-device sync without conflicts works

### High Priority (Should Pass)
- [ ] Recovery flow handles no backups gracefully
- [ ] Error toasts show retry button
- [ ] User-friendly error messages display
- [ ] Mobile UI works correctly
- [ ] Rapid syncs handled gracefully
- [ ] Offline-to-online transitions work

### Medium Priority (Nice to Have)
- [ ] Toast stacking works
- [ ] Large data sets sync successfully
- [ ] Performance benchmarks met
- [ ] Memory usage acceptable
- [ ] All UI/UX elements polished

---

## Test Completion Sign-Off

**Tester Name**: _____________________
**Date**: _____________________
**Total Tests Executed**: ____ / 60
**Tests Passed**: ____
**Tests Failed**: ____
**Critical Bugs Found**: ____

**Overall Assessment**:
☐ Ready for Production
☐ Minor Issues - Can Deploy
☐ Major Issues - Needs Work
☐ Critical Issues - Do Not Deploy

**Notes**:
_____________________________________________
_____________________________________________
_____________________________________________
