# Git Sync & Testing Guide for Lockt

This guide will help you pull the latest changes from GitHub, test them locally, and merge them into your main branch.

## 📍 Prerequisites

Before starting, make sure you have:
- Git installed on your computer
- Node.js and npm installed (for running the app)
- A terminal/command prompt open

## 🗂️ Step 1: Navigate to Your Repository

Open your terminal and navigate to the Lockt repository directory:

```bash
# Navigate to your repository
cd /home/user/lockt

# OR if you're on a different path, adjust accordingly:
# cd /path/to/your/lockt/folder
```

**How to verify you're in the right place:**
```bash
# This should show your current directory path
pwd

# This should list files like package.json, src/, etc.
ls
```

## 📥 Step 2: Fetch Latest Changes from GitHub

First, let's make sure your local repository knows about all the remote branches:

```bash
# Fetch all branches from GitHub (doesn't change your local files yet)
git fetch origin
```

**What this does:** Downloads information about all branches from GitHub without changing your local files.

## 🔍 Step 3: See Available Branches

Let's check what branches are available:

```bash
# List all branches (local and remote)
git branch -a
```

You should see branches like:
- `claude/import-export-csv-feature-011CUpqNjXQkiH4YUHQmmBFU` (the latest feature branch)
- Other claude branches if there are more

## 🔀 Step 4: Switch to the Feature Branch

Now let's switch to the feature branch to test it:

```bash
# Switch to the import/export feature branch
git checkout claude/import-export-csv-feature-011CUpqNjXQkiH4YUHQmmBFU
```

**What this does:** Switches your working directory to the feature branch, updating all your files to match that branch.

**If this is your first time checking out this branch**, Git will automatically create a local copy tracking the remote branch.

**Alternative command if the above doesn't work:**
```bash
# Create a local branch tracking the remote branch
git checkout -b claude/import-export-csv-feature-011CUpqNjXQkiH4YUHQmmBFU origin/claude/import-export-csv-feature-011CUpqNjXQkiH4YUHQmmBFU
```

**Verify you're on the correct branch:**
```bash
git branch
# The current branch will have an asterisk (*) next to it
```

## 📦 Step 5: Install Dependencies

The feature may have added new dependencies (like @types/node). Install them:

```bash
# Install all required npm packages
npm install
```

**What this does:** Installs or updates all JavaScript packages the app needs to run.

**Expected output:** You should see a progress bar and a message like "added X packages" or "up to date".

## 🧪 Step 6: Test the Application

### Option A: Run Development Server (Recommended for Testing)

```bash
# Start the development server
npm run dev
```

**What this does:** Starts a local web server where you can test the app.

**Expected output:**
```
VITE v7.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Open your browser and navigate to:** `http://localhost:5173/`

**To stop the server:** Press `Ctrl+C` in the terminal

### Option B: Build for Production

```bash
# Build the production version
npm run build

# Preview the production build
npm run preview
```

## ✨ Step 7: Test the New Features

Once the app is running, test the new import/export functionality:

### CSV Import/Export Testing:
1. Navigate to any data section (Passwords, Credit Cards, Crypto, Freetext, or Health)
2. Look for the **📥 Import CSV** and **📤 Export CSV** buttons near the top
3. **To test export:**
   - Add some test data if you don't have any
   - Click "📤 Export CSV"
   - Check your Downloads folder for a CSV file with today's date
4. **To test import:**
   - Edit the exported CSV file (add a row, modify data)
   - Click "📥 Import CSV"
   - Select your modified CSV file
   - Verify the imported data appears in the list

### Print Testing (Freetext & Health sections only):
1. Navigate to Freetext or any Health sub-tab
2. Add some test entries if needed
3. Click the **🖨️ Print** button
4. A new window should open with a formatted print preview
5. Use your browser's print function (File → Print or Ctrl/Cmd+P)

### Important Notes:
- **Encrypted Storage:** All data is encrypted locally; import/export happens in memory only
- **Data Merging:** Imports add to existing data (don't overwrite)
- **Search Filters:** Print respects your current search/filter when active

## ✅ Step 8: Merge to Main Branch (After Testing)

Once you've tested and are satisfied with the changes, merge them into your main branch:

### 8a. Switch to Main Branch

```bash
# Switch back to your main branch
git checkout main

# Make sure your main branch is up to date
git pull origin main
```

### 8b. Merge the Feature Branch

```bash
# Merge the feature branch into main
git merge claude/import-export-csv-feature-011CUpqNjXQkiH4YUHQmmBFU
```

**What this does:** Combines all the changes from the feature branch into your main branch.

### 8c. Push to GitHub

```bash
# Push the updated main branch to GitHub
git push origin main
```

### 8d. Clean Up (Optional)

After successfully merging, you can delete the feature branch:

```bash
# Delete the local feature branch
git branch -d claude/import-export-csv-feature-011CUpqNjXQkiH4YUHQmmBFU

# Delete the remote feature branch on GitHub
git push origin --delete claude/import-export-csv-feature-011CUpqNjXQkiH4YUHQmmBFU
```

## 🔄 If You Have Multiple Feature Branches

If there are multiple `claude/*` branches you want to test or merge:

1. **List all remote branches:**
   ```bash
   git branch -r | grep claude
   ```

2. **For each branch, repeat Steps 4-8 above**

3. **If you want to merge all branches at once** (advanced):
   ```bash
   # Switch to main
   git checkout main

   # Merge each feature branch one by one
   git merge claude/branch-name-1
   git merge claude/branch-name-2
   git merge claude/branch-name-3

   # Push all changes
   git push origin main
   ```

## 🤖 Using This with Local Claude Code

If you want to use Claude Code (VS Code extension) to help with this process, use this prompt:

```
I have changes in the remote branch "claude/import-export-csv-feature-011CUpqNjXQkiH4YUHQmmBFU"
that I need to pull, test, and merge to main. Can you help me:

1. Fetch and checkout the feature branch
2. Install any new dependencies
3. Test that the build completes successfully
4. After I confirm testing is done, merge to main and push

I'm currently in the /home/user/lockt directory. Please guide me step by step.
```

**Or for a more automated approach:**

```
Please help me sync all claude/* branches from GitHub to my local repository,
test the builds, and merge them to main. I'm in /home/user/lockt and need
step-by-step guidance. After each branch is checked out, I'll test manually
before proceeding with the merge.
```

## 🆘 Troubleshooting

### Problem: "fatal: Not a git repository"
**Solution:** You're not in the correct directory. Navigate to the lockt folder:
```bash
cd /home/user/lockt
```

### Problem: "error: Your local changes would be overwritten"
**Solution:** You have uncommitted changes. Either commit them or stash them:
```bash
# Save your changes temporarily
git stash

# Or commit your changes
git add .
git commit -m "My local changes"
```

### Problem: Merge conflicts
**Solution:** If Git reports conflicts during merge:
1. Open the conflicted files (Git will list them)
2. Look for conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
3. Manually resolve by choosing which version to keep
4. After resolving:
   ```bash
   git add .
   git commit -m "Resolved merge conflicts"
   ```

### Problem: npm install fails
**Solution:**
```bash
# Clear npm cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Problem: Port 5173 already in use
**Solution:** Either kill the existing process or use a different port:
```bash
# Kill existing process (Mac/Linux)
lsof -ti:5173 | xargs kill -9

# Or run on a different port
npm run dev -- --port 3000
```

## 📚 Additional Resources

- **Git Basics:** https://git-scm.com/book/en/v2/Getting-Started-Git-Basics
- **Git Branch Management:** https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging
- **npm Documentation:** https://docs.npmjs.com/

## 📝 Quick Reference Commands

```bash
# See current branch
git branch

# See all branches
git branch -a

# Switch branches
git checkout branch-name

# See uncommitted changes
git status

# See commit history
git log --oneline

# Update from GitHub
git pull origin branch-name

# Push to GitHub
git push origin branch-name
```

---

**Current Feature:** CSV Import/Export & Print Functionality for all data categories
**Branch:** `claude/import-export-csv-feature-011CUpqNjXQkiH4YUHQmmBFU`
**Created:** 2025-11-06
