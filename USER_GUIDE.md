# Lockt User Guide

Welcome to **Lockt** - your secure, personal data vault! This guide will help you get started and make the most of Lockt's features.

## Table of Contents

1. [What is Lockt?](#what-is-lockt)
2. [Getting Started](#getting-started)
3. [First Time Setup](#first-time-setup)
4. [Unlocking Lockt](#unlocking-lockt)
5. [Using Data Categories](#using-data-categories)
6. [OneDrive Sync](#onedrive-sync)
7. [Multi-Device Usage](#multi-device-usage)
8. [Recovery & Backup](#recovery--backup)
9. [Security Best Practices](#security-best-practices)
10. [Troubleshooting](#troubleshooting)
11. [FAQ](#faq)

---

## What is Lockt?

Lockt is a **Progressive Web App (PWA)** that securely stores your sensitive personal information using **client-side encryption**. This means:

- ✅ **Your data is encrypted on your device** before it's stored anywhere
- ✅ **Zero-knowledge security** - Even Microsoft/OneDrive cannot see your data
- ✅ **Multi-device sync** - Access your data from any device with OneDrive
- ✅ **Works offline** - Access your data even without internet
- ✅ **No account required** - Just a master password and optional OneDrive sync

### What You Can Store

Lockt organizes your data into 5 categories:

1. **Passwords** - Bank logins, website credentials, account numbers
2. **Credit Cards** - Card numbers, expiration dates, security codes
3. **Crypto** - Cryptocurrency wallet addresses and recovery phrases
4. **Freetext** - SSNs, insurance policies, passports, or any custom data
5. **Health** - Medical providers, conditions, impairments, and health journal

---

## Getting Started

### Installation

**On iPhone/iPad (Safari):**
1. Open Lockt in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to install the app

**On Android (Chrome):**
1. Open Lockt in Chrome
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home Screen"

**On Desktop:**
1. Open Lockt in Chrome, Edge, or Safari
2. Look for the install icon in the address bar
3. Click to install as a desktop app

**Web Browser:**
- You can also use Lockt directly in any modern web browser without installing

---

## First Time Setup

When you open Lockt for the first time, you'll be guided through account creation:

### Step 1: Create Your Master Password

Your master password is the **most important part** of your security:

- ✅ **Make it strong** - At least 12 characters with uppercase, lowercase, numbers, and symbols
- ✅ **Make it unique** - Don't reuse passwords from other accounts
- ✅ **Make it memorable** - You'll need it every time you unlock Lockt
- ⚠️ **If you forget it, your data is LOST** - There is no password reset!

**Example Strong Passwords:**
- `MyDog&2Cats!LiveIn2025`
- `Coffee@7am_Every_Day!`
- `I<3Hiking_OnWeekends2024`

### Step 2: Save Your Recovery Phrase

After creating your password, you'll receive a **12-word recovery phrase**:

```
Example: abandon ability able about above absent absorb abstract absurd abuse access accident
```

**CRITICAL - Save This Recovery Phrase:**
- ✅ Write it down on paper and store it safely
- ✅ Take a photo and save it in a secure location (encrypted drive, password manager)
- ✅ Never share it with anyone
- ⚠️ This is your ONLY backup if you forget your password!

**Where to Store Your Recovery Phrase:**
- Physical paper in a safe or locked drawer
- Password manager (1Password, Bitwarden, LastPass)
- Encrypted USB drive
- Bank safety deposit box (for maximum security)

### Step 3: Connect to OneDrive (Optional)

OneDrive sync is **completely optional** but highly recommended for:
- ✅ Multi-device access (use Lockt on phone, tablet, and computer)
- ✅ Automatic backups (your encrypted data is backed up to the cloud)
- ✅ Data recovery (if you lose your device, your data is safe)

**To connect OneDrive:**
1. Tap "Connect to OneDrive" button
2. Sign in with your Microsoft account
3. Grant Lockt permission to store encrypted files

**Privacy Note:** OneDrive only stores **encrypted** data. Microsoft cannot see your passwords, cards, or any other information. Only you can decrypt it with your master password.

---

## Unlocking Lockt

Every time you open Lockt, you'll need to unlock it:

### Standard Unlock (Password Only)

1. Enter your master password
2. Tap "Unlock"

### Recovery Phrase Unlock (Password Recovery)

If you forgot your password but have your recovery phrase:

1. Tap "🔐 Forgot password? Use recovery phrase"
2. The password field disappears (you don't need it!)
3. Enter your 12-word recovery phrase in the text box
4. Tap "Recover & Unlock"
5. Your password is automatically decrypted and you're unlocked!

**How It Works:** During account setup, your password is encrypted using your recovery phrase. When you use recovery mode, the recovery phrase decrypts your password, then your password unlocks your data. It's like having a backup key!

---

## Using Data Categories

### Passwords

Store login credentials, bank accounts, and online services.

**Adding a Password Entry:**
1. Tap the "Passwords" tab
2. Tap the "+" button
3. Fill in the details:
   - **Name** - Website or service name (e.g., "Chase Bank")
   - **Username** - Your username or email
   - **Password** - Your password for this service
   - **PIN** - Optional security PIN
   - **Account Number** - Optional (for banks)
   - **Routing Number** - Optional (for US banks)
   - **Phone/Email** - Support contact info
4. Tap "Save"

**Viewing a Password:**
1. Tap on any entry to expand it
2. Tap the eye icon (👁️) to reveal hidden passwords
3. Tap the copy icon to copy to clipboard

**Searching:**
- Use the search bar at the top to find entries by name, username, or other fields

### Credit Cards

Store credit card details, debit cards, and payment methods.

**Adding a Card:**
1. Tap the "Cards" tab
2. Tap the "+" button
3. Fill in:
   - **Name** - Card nickname (e.g., "Chase Sapphire")
   - **Card Number** - Full 16-digit number
   - **Expiration** - MM/YY format
   - **CSC** - Security code (3-4 digits on back)
   - **Phone/Email** - Support contact
4. Tap "Save"

### Crypto

Store cryptocurrency wallet addresses and recovery phrases.

**Adding a Crypto Wallet:**
1. Tap the "Crypto" tab
2. Tap the "+" button
3. Fill in:
   - **Name** - Wallet or exchange name
   - **ETH Address** - Ethereum wallet address
   - **BTC Address** - Bitcoin wallet address
   - **SOL Address** - Solana wallet address
   - **Recovery Phrase** - Wallet recovery phrase (12-24 words)
   - **Phone/Email** - Exchange support contact
4. Tap "Save"

### Freetext

Store anything that doesn't fit in other categories - SSNs, passports, insurance policies, etc.

**Adding Freetext:**
1. Tap the "Freetext" tab
2. Tap the "+" button
3. Fill in:
   - **Name** - Document name (e.g., "Passport")
   - **Field 1-4** - Custom labeled fields (you name them)
   - **Notes** - Additional information
4. Tap "Save"

**Use Cases:**
- Social Security Numbers
- Passport numbers
- Driver's license info
- Insurance policy numbers
- Software license keys
- Security questions/answers

### Health

Track medical information across 4 sub-categories:

**Providers** - Doctors, specialists, therapists
1. Tap "Health" → "Providers" tab
2. Add provider name, specialty, phone, email, address

**Conditions** - Diagnoses and medical conditions
1. Tap "Health" → "Conditions" tab
2. Add condition name, diagnosis date, notes

**Impairments** - Functional limitations
1. Tap "Health" → "Impairments" tab
2. Add impairment name, description, severity

**Journal** - Daily health tracking
1. Tap "Health" → "Journal" tab
2. Add journal entries with:
   - Date
   - Pain level (1-10 scale)
   - Symptoms
   - Notes

---

## OneDrive Sync

OneDrive sync keeps your encrypted data synchronized across all your devices.

### Connecting OneDrive

**First Time:**
1. Open Lockt on any device
2. Tap "Sync" in the navigation
3. Tap "Sign in to OneDrive"
4. Log in with your Microsoft account
5. Grant permissions

**After connecting:**
- Your encrypted data automatically syncs to OneDrive
- Changes you make are uploaded immediately
- Other devices can download your latest data

### Manual Sync

While Lockt auto-syncs, you can manually trigger a sync:

1. Tap the "Sync" icon in the navigation
2. Tap "Sync Now"
3. Wait for the sync to complete (green checkmark)

### Sync Status Indicators

- **🔄 Syncing...** - Upload/download in progress
- **✅ Synced** - Data is up to date
- **⚠️ Conflict** - Both local and cloud were modified (see Conflict Resolution)
- **❌ Sync Failed** - Check internet connection or try again

---

## Multi-Device Usage

Use Lockt on multiple devices seamlessly!

### Setting Up a New Device

**Scenario 1: You already have data on Device A, now adding Device B**

1. **On Device B**, open Lockt
2. **During setup**, tap "Sign in to OneDrive" BEFORE creating a password
3. Sign in with the same Microsoft account as Device A
4. Enter your master password (same as Device A)
5. Lockt will download your encrypted data from OneDrive
6. Unlock and access all your data!

**Scenario 2: Starting fresh on Device B**

1. Create a new account with password + recovery phrase
2. Connect to OneDrive
3. Add your data
4. It will sync to OneDrive for future devices

### Syncing Between Devices

**When you make changes:**
1. Edit data on Device A (add a password, update a card, etc.)
2. Changes are automatically encrypted and uploaded to OneDrive
3. Open Lockt on Device B
4. Tap "Sync Now" or wait for auto-sync
5. Changes appear immediately on Device B!

### Conflict Resolution

**What is a conflict?**
A conflict occurs when you modify the same data on two devices before they sync.

**Example:**
- Device A: You add a password while offline
- Device B: You add a different password while offline
- Both devices try to sync → CONFLICT

**Resolving Conflicts:**
1. Lockt detects the conflict and shows a dialog
2. You'll see two options:
   - **Keep Local Version** - Keep changes from this device
   - **Download Cloud Version** - Use changes from other device
3. Choose which version to keep
4. The selected version overwrites the other

**Prevention Tips:**
- Always sync before making changes on a new device
- Avoid working offline on multiple devices simultaneously
- Wait for sync to complete before switching devices

---

## Recovery & Backup

### If You Forget Your Password

**Option 1: Use Recovery Phrase** (Recommended)
1. Open Lockt
2. Tap "🔐 Use recovery phrase"
3. Enter your password (you still need to remember some part of it)
4. Enter your 12-word recovery phrase
5. Unlock your account

**Option 2: If You Forgot BOTH Password + Recovery Phrase**
- ⚠️ **Your data is permanently lost**
- There is no password reset feature
- You'll need to create a new account and start over
- This is the security tradeoff for zero-knowledge encryption

### Backup Strategies

**Strategy 1: Recovery Phrase Backup (Essential)**
- Write down your 12-word recovery phrase
- Store it in a safe place (safe, lockbox, bank vault)
- NEVER store it digitally without encryption

**Strategy 2: OneDrive Sync (Automatic)**
- Connect to OneDrive
- Your encrypted data is automatically backed up
- If you lose your device, download from OneDrive on a new device

**Strategy 3: Manual Export (Future Feature)**
- Phase 5 will include export to JSON/CSV
- You'll be able to save encrypted backups locally

---

## Security Best Practices

### Master Password Security

✅ **Do:**
- Use a unique, strong password (12+ characters)
- Use a passphrase with multiple words
- Include uppercase, lowercase, numbers, symbols
- Make it memorable (you'll type it often)

❌ **Don't:**
- Reuse passwords from other accounts
- Use simple words or patterns (e.g., "password123")
- Share your password with anyone
- Store it in plaintext (write it down and lock it away if needed)

### Recovery Phrase Security

✅ **Do:**
- Write it down immediately
- Store it in a physically secure location
- Make multiple copies in different secure locations
- Verify you wrote it correctly before closing the setup screen

❌ **Don't:**
- Take a screenshot (unless stored in encrypted storage)
- Email it to yourself
- Store it in a notes app
- Share it with anyone (even family, unless you trust them with ALL your data)

### OneDrive Security

✅ **Do:**
- Enable two-factor authentication (2FA) on your Microsoft account
- Use a strong password for your Microsoft account
- Review OneDrive permissions regularly

❌ **Don't:**
- Share your Microsoft account credentials
- Use OneDrive on public/shared computers without signing out
- Disable 2FA on your Microsoft account

### Device Security

✅ **Do:**
- Use device lock screen (PIN, fingerprint, Face ID)
- Lock Lockt when not in use (tap "Lock" in menu)
- Keep your device OS and browser updated
- Use antivirus/security software

❌ **Don't:**
- Leave Lockt unlocked on unattended devices
- Use Lockt on public/shared computers (unless you absolutely must)
- Jailbreak/root your device (weakens security)

---

## Troubleshooting

### "Incorrect Password or Corrupted Data"

**Possible Causes:**
- Wrong password (check for typos, Caps Lock)
- Wrong recovery phrase
- Data corruption (rare)

**Solutions:**
1. Double-check your password (try typing slowly)
2. Try your recovery phrase if you have it
3. Make sure you're on the correct Microsoft account (if using OneDrive)
4. If nothing works, your data may be unrecoverable

### OneDrive Sync Fails

**Error: "Not signed in to OneDrive"**
- Tap "Sync" → "Sign in to OneDrive"
- Enter your Microsoft credentials

**Error: "Device is offline"**
- Check your internet connection
- Try switching between Wi-Fi and cellular data
- Wait and try again when online

**Error: "Sync already in progress"**
- Wait for current sync to complete
- If stuck, close and reopen the app

### App Won't Unlock After Choosing Cloud Version in Conflict

**Fixed in October 2025 Update:**
- This bug has been resolved
- UI now refreshes automatically after downloading cloud version
- No more redirect to setup screen

**If you're on an older version:**
- Update to the latest version of Lockt
- Restart the app after updating

### OneDrive Sign-In Crashes on iPhone (PWA)

**Symptoms:**
- OneDrive sign-in opens, then immediately closes
- Returns to Lockt without signing in
- Only happens on installed PWA (works in browser)

**Solution:**
1. Remove the Lockt PWA from your home screen
2. Open Safari → Settings (bottom icon)
3. Tap "Clear History and Website Data"
4. Reinstall Lockt PWA
5. Sign in to OneDrive again

**Alternative Solution (Keeps Data):**
1. Open Lockt in Safari browser (not PWA)
2. Sign in to OneDrive
3. Sync your data
4. Reinstall PWA (data will download from OneDrive)

### Recovery Phrase Has Duplicate Words

**Fixed in October 2025 Update:**
- Recovery phrases now use full BIP39 wordlist (2048 words)
- Duplicates are extremely rare (mathematical probability: ~0.003%)
- If you generated your phrase before October 2025, it may have duplicates

**If you have old recovery phrase with duplicates:**
- It will still work correctly
- Order matters more than uniqueness
- Consider generating a new account with updated phrase

### UI Doesn't Update After Sync

**Fixed in October 2025 Update:**
- UI now automatically refreshes after downloading changes from OneDrive
- No manual restart required

**If you're on an older version:**
- Update Lockt to the latest version
- After updating, syncs will automatically refresh the UI

---

## FAQ

### General Questions

**Q: Is Lockt free?**
A: Yes, Lockt is completely free and open-source.

**Q: Do I need OneDrive?**
A: No. OneDrive is optional. You can use Lockt entirely offline without any cloud sync. OneDrive is only needed for multi-device sync.

**Q: Can anyone at Microsoft/OneDrive see my data?**
A: No. Your data is encrypted on your device before it's sent to OneDrive. Microsoft only sees encrypted gibberish - they cannot decrypt it without your password.

**Q: Can I use Lockt without installing the app?**
A: Yes. Lockt works in any modern web browser. Installation as a PWA is optional but recommended for better experience.

**Q: Does Lockt work offline?**
A: Yes. Once you've unlocked Lockt, you can view and edit your data without internet. Changes will sync next time you're online.

### Security Questions

**Q: What encryption does Lockt use?**
A: AES-GCM (256-bit keys) with PBKDF2 key derivation (600,000 iterations). This is industry-standard, bank-level encryption.

**Q: What happens if I forget my password?**
A: If you have your recovery phrase, you can use it ALONE to recover your password and unlock your account. The recovery phrase decrypts an encrypted copy of your password stored in Lockt. If you lost both password and recovery phrase, your data is permanently unrecoverable.

**Q: Can Lockt recover my password for me?**
A: No. There is no password reset feature. Your password is encrypted with your recovery phrase and stored locally. Only YOU can decrypt it with your recovery phrase. No one (including Lockt developers or Microsoft) can recover it for you.

**Q: Is my recovery phrase the same as my password?**
A: No. Your recovery phrase is a 12-word backup key that can decrypt your password. During account creation, Lockt encrypts your password using your recovery phrase. If you forget your password, enter your recovery phrase and Lockt will automatically decrypt and use your password to unlock your data.

**Q: How secure is the 12-word recovery phrase?**
A: Extremely secure. There are 2048^12 possible combinations (~5.4 × 10^39), which is more secure than most 256-bit encryption keys.

### Sync & Multi-Device Questions

**Q: How do I use Lockt on multiple devices?**
A: Connect to OneDrive on all devices using the same Microsoft account, then unlock with the same master password. Your encrypted data syncs automatically.

**Q: What if I edit data on two devices at the same time?**
A: Lockt detects conflicts and lets you choose which version to keep (local or cloud).

**Q: How long does sync take?**
A: Usually 1-5 seconds. Depends on data size and internet speed.

**Q: Can I sync without OneDrive?**
A: Not currently. OneDrive is the only cloud provider supported. Future versions may support Google Drive, Dropbox, etc.

### Data & Storage Questions

**Q: How much data can I store?**
A: Practically unlimited. Your data is stored as a single encrypted file. Most users will have files under 1 MB, which is tiny.

**Q: Where is my data stored?**
A: Two places:
1. Your device (IndexedDB in your browser)
2. OneDrive (if connected) - encrypted in a hidden app folder

**Q: Can I export my data?**
A: Not yet. Phase 5 (future update) will add export to JSON, CSV, and TXT formats.

**Q: What happens if I delete Lockt?**
A: If you delete the app or clear browser data:
- Local data is deleted from your device
- If connected to OneDrive, your encrypted data is still in the cloud
- Reinstall Lockt, sign in to OneDrive, and download your data

**Q: Can I share entries with someone?**
A: Not yet. Sharing will be added in Phase 7 as an encrypted link feature.

### Technical Questions

**Q: What browsers does Lockt support?**
A: Any modern browser:
- ✅ Chrome, Edge, Brave, Opera (Chromium-based)
- ✅ Safari (iOS, macOS)
- ✅ Firefox
- ❌ Internet Explorer (not supported)

**Q: What's a PWA?**
A: Progressive Web App - a website that works like a native app. It can be installed on your home screen, work offline, and send notifications.

**Q: Does Lockt use any trackers or analytics?**
A: No. Lockt does not collect any analytics, telemetry, or usage data. 100% privacy-focused.

**Q: Is Lockt open source?**
A: Yes. You can view the source code on GitHub and verify the security yourself.

---

## Support & Feedback

### Get Help

If you encounter issues not covered in this guide:

1. **Check for Updates** - Make sure you're using the latest version
2. **Read the Troubleshooting Section** - Common issues are documented above
3. **Restart the App** - Close and reopen Lockt
4. **Clear Cache** - In extreme cases, clear browser cache (you won't lose data if synced to OneDrive)

### Report Bugs

Found a bug? Please report it!

- **GitHub Issues**: [Link to your repo]
- **Email**: [Your support email if applicable]

Include:
- Device/browser (e.g., "iPhone 14, Safari")
- What you were doing when the bug occurred
- Error messages (screenshot if possible)
- Whether data was lost

### Feature Requests

Have an idea? We'd love to hear it!

- **GitHub Discussions**: [Link to your repo]
- **Email**: [Your support email]

---

## Version History

### October 25, 2025 - Phase 3a Partial Release (v2)

**Critical Fix:**
- ✅ **Recovery phrase now works correctly as password replacement!**
  - Previously required BOTH password + recovery phrase (wrong!)
  - Now recovery phrase ALONE can unlock account (correct!)
  - Password is encrypted with recovery phrase during account setup (password escrow)
  - Recovery mode decrypts password automatically

**New Features:**
- ✅ Recovery phrase login on unlock screen (toggle button)
- ✅ Full BIP39 wordlist for recovery phrase generation (2048 words)
- ✅ Password escrow system (encrypt password with recovery phrase)

**Bug Fixes:**
- ✅ Fixed: Conflict resolution no longer sends to setup screen
- ✅ Fixed: UI now refreshes automatically after sync (no restart needed)
- ✅ Fixed: Recovery phrases no longer have duplicate words or all "A" words
- ✅ Fixed: Recovery phrase implementation (no longer requires password)

**Technical Improvements:**
- ✅ Added `reloadFromDatabase()` method for seamless state updates
- ✅ Added `encryptPasswordWithRecoveryPhrase()` and `decryptPasswordWithRecoveryPhrase()` methods
- ✅ Improved error handling for OneDrive sync failures
- ✅ Updated unlock flow to support recovery-only mode

### Previous Releases

- **Phase 3** - OneDrive sync with multi-device support
- **Phase 2** - Data entry UI for all 5 categories
- **Phase 1** - Client-side encryption with IndexedDB storage

---

## About Lockt

**Developer**: Built with React, TypeScript, and Web Crypto API
**Encryption**: AES-GCM 256-bit, PBKDF2 600k iterations
**Cloud**: Microsoft OneDrive (optional)
**License**: [Your license]
**Privacy**: Zero-knowledge, no data collection, no analytics

**Thank you for using Lockt! Your privacy and security are our top priorities.**
