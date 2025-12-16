# VWO Knowledge Base Workflow - Technical Documentation

## 📑 Table of Contents
1. [Application Overview](#application-overview)
2. [Architecture & File Structure](#architecture--file-structure)
3. [Features & Functionality](#features--functionality)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Technical Implementation](#technical-implementation)
6. [Data Storage & Persistence](#data-storage--persistence)
7. [Code Structure](#code-structure)
8. [External Dependencies](#external-dependencies)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 📱 Application Overview

### Purpose
VWO Knowledge Base Workflow is a web application designed to help VWO Technical Support Engineers identify, track, and manage outdated help articles from the VWO knowledge base (help.vwo.com).

### Core Problem Solved
- **Manual Article Checking**: Automates the process of checking article age
- **Centralized Tracking**: Provides a unified system for flagging outdated content
- **AI-Assisted Updates**: Generates structured templates for article update notes
- **Priority Management**: Helps admins identify high-priority articles through consolidation
- **Export Capabilities**: Allows bulk export of flagged articles to PDF

### Target Users
- **VWO Technical Support Engineers** (User role)
- **Documentation Team Admins** (Admin role)

---

## 🏗️ Architecture & File Structure

### File Structure
```
base website/
├── index.html          (117 lines) - Main HTML structure
├── style.css           (604 lines) - All styling and responsive design
├── script.js           (1787 lines) - Application logic and functionality
├── TECHNICAL_DOCUMENTATION.md - This file
└── README.md          - User-facing documentation (optional)
```

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **PDF Generation**: jsPDF library
- **PDF Parsing**: PDF.js library
- **Storage**: Browser localStorage
- **Deployment**: GitHub Pages compatible (static site)

---

## ⚡ Features & Functionality

### 1. **VWO Article Checker** (User Feature)
**Location**: User Dashboard → Article Checker section

**Functionality**:
- Accepts VWO help article URLs (e.g., `https://help.vwo.com/hc/en-us/articles/...`)
- Fetches article metadata using CORS proxy fallback system
- Calculates article age in days and years
- Classifies articles as "outdated" if > 365 days old
- Displays results with color-coded status (red for outdated, green for current)

**Technical Implementation**:
```javascript
// Multi-proxy fallback system
const corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
];
```

**Key Functions**:
- `checkVWOArticle()` - Main checking function
- `extractTitleFromHTML()` - Parses article title from HTML
- `calculateDaysOld()` - Computes age from last-modified date

---

### 2. **Export List Management** (User Feature)
**Location**: User Dashboard → Export List section

**Functionality**:
- Add individual checked articles to a persistent list
- View all flagged articles in one place
- Remove articles from list
- Export entire list to formatted PDF
- Clear all articles at once

**User Workflow**:
1. Check VWO article → Shows outdated status
2. Click "Add to Export List" button
3. Article appears in export list with metadata
4. Repeat for multiple articles
5. Export all to PDF when ready

**Key Functions**:
- `window.addToExportListFromChecker()` - Adds article to list (defined at top for global access)
- `window.exportListToPDF()` - Generates PDF from list (defined at top)
- `window.removeFromExportList(index)` - Removes single article (defined at top)
- `window.clearExportList()` - Clears entire list (defined at top)

**Storage**:
- LocalStorage key: `kb_export_list`
- Data structure: Array of objects with `{title, url, lastUpdated, daysOld, addedBy, addedAt}`

---

### 3. **Submit for Admin Review** (User Feature)
**Location**: Appears after checking outdated article

**Functionality**:
- Allows users to flag articles for admin review
- Includes notes field for additional context
- Automatically adds article to export list
- Stores draft in pending reviews queue

**Key Functions**:
- `submitVWOForReview(url, title, lastUpdated, daysOld)` - Creates review draft
- `saveDrafts(drafts)` - Persists to localStorage

**Storage**:
- LocalStorage key: `kb_pending_drafts`
- Data structure: `{id, title, content, submittedBy, submittedAt, status: 'pending'}`

---

### 4. **AI Draft Simulation** (User Feature)
**Location**: User Dashboard → Submit for Review section (appears when article is outdated)

**Functionality**:
- Auto-generates structured template for article update notes
- Fills textarea with AI-style draft content
- Provides VWO-specific update suggestions
- Allows user to edit generated content before submitting
- Disables after use to prevent duplicate generation

**User Workflow**:
1. Check VWO article → Shows outdated status
2. Click "🤖 Simulate AI Draft" button
3. Textarea auto-fills with AI-generated template
4. User can edit/customize the generated content
5. User submits for admin review

**Key Functions**:
- `simulateVWODraft(articleTitle, lastUpdated)` - Generates AI draft template
- Template includes:
  - Date stamp with current date
  - Article title and last updated date
  - Bulleted list of suggested updates:
    - UI/dashboard screenshots
    - Terminology alignment
    - New feature documentation
    - Integration and API verification
    - Code examples and best practices
  - Salesforce Knowledge Base publishing reference

**Technical Implementation**:
```javascript
function simulateVWODraft(articleTitle, lastUpdated) {
    const date = new Date().toLocaleDateString('en-US');
    
    const aiDraftContent = 
        `[AI-GENERATED DRAFT - ${date}]\n\n` + 
        `This VWO article "${articleTitle}" (last updated: ${lastUpdated}) has been flagged for updates to reflect the latest changes.\n\n` +
        `Suggested Updates:\n` +
        `• Update screenshots to reflect current VWO UI/dashboard design\n` +
        `• Revise terminology to align with latest VWO product naming conventions\n` +
        `• Add documentation for new features released since last update\n` +
        `• Verify all integration steps and API endpoints are current\n` +
        `• Update code examples and best practices\n\n` +
        `Please review the complete article content for accuracy and completeness before publishing to Salesforce Knowledge Base.`;
    
    document.getElementById('vwo-notes').value = aiDraftContent;
    
    const aiDraftBtn = document.getElementById('vwo-ai-draft-btn');
    if (aiDraftBtn) {
        aiDraftBtn.disabled = true;
        aiDraftBtn.textContent = '✅ Draft Generated!';
    }
}
```

**UI Components**:
- Purple gradient button with icon: "🤖 Simulate AI Draft"
- Positioned above the textarea in Submit for Review section
- Hover effects with transform animations
- Changes to green "✅ Draft Generated!" when clicked
- Button automatically disables after generation

**Styling**:
- Base: Purple gradient (`#667eea` → `#764ba2`)
- Hover: Reversed gradient with lift effect
- Disabled: Green background (`#28a745`)
- Smooth transitions and shadows

**Benefits**:
- **Time Savings**: Users don't write update notes from scratch
- **Consistency**: All submissions follow structured format
- **Guidance**: Reminds users of important update aspects
- **Flexibility**: Generated content is fully editable
- **Professional**: VWO-specific suggestions included

---

### 5. **Admin Review Dashboard** (Admin Feature)
**Location**: Admin Panel → Review Drafts Tab

**Functionality**:
- View all pending article review requests
- See submitter name and timestamp
- Read article details and user notes
- Approve or reject submissions
- Automatic cleanup of processed drafts

**Key Functions**:
- `loadAdminView()` - Populates review queue
- `showDraft(id)` - Opens modal with draft details
- `reviewAction(action)` - Handles approve/reject
- `closeModal()` - Closes review modal

**UI Components**:
- Draft cards with metadata
- Modal overlay for detailed review
- Action buttons (Approve/Reject)

---

### 6. **PDF Consolidation** (Admin Feature)
**Location**: Admin Panel → Consolidate PDFs Tab

**Functionality**:
- Upload multiple exported PDF files
- Extract article data from all PDFs
- Identify duplicate articles across PDFs
- Generate priority ranking based on frequency
- Create consolidated report with priority markers

**Priority System**:
- 🔥 **PRIORITY 3x**: Article appears in 3 different PDFs
- 🔥 **PRIORITY 2x**: Article appears in 2 different PDFs
- **Regular**: Article appears in 1 PDF

**Key Functions**:
- `window.uploadPDFs()` - Handles file upload
- `window.consolidatePDFs()` - Main consolidation logic
- `extractArticlesFromPDF(pdfData)` - Parses PDF using PDF.js
- `parseArticlesFromText(text)` - Extracts articles using regex patterns
- `generateConsolidatedReport(sortedArticles, totalPDFs)` - Creates final PDF

**Technical Implementation**:
```javascript
// Article parsing patterns
Pattern 1: /(\d+)\.\s+([^\n]+?)\s+Last Updated:\s+([^\n]+?)\s+Age:\s+([^\n]+?)\s+URL:\s+(https?:\/\/[^\s\n]+)/gi
Pattern 2: /([^\n]+?)\s+Last Updated:\s+([^\n]+?)\s+Age:\s+([^\n]+?)\s+URL:\s+(https?:\/\/[^\s\n]+)/gi
```

---

### 6. **Authentication System**
**Functionality**:
- Simple role-based authentication
- Session persistence across page refreshes
- Automatic role-based view rendering

**Credentials**:
```javascript
const users = {
    'user': 'user',     // Normal User
    'admin': 'admin'    // Admin
};
```

**Key Functions**:
- `loginUser()` - Handles login validation
- `logoutUser()` - Clears session and returns to login
- `checkInitialLogin()` - Restores session on page load
- `showCheckerView()` - Renders user dashboard
- `loadAdminView()` - Renders admin panel

**Storage**:
- LocalStorage key: `kb_login_state`
- Data: `{username, role, timestamp}`

---

## 👥 User Roles & Permissions

### **User Role** (`user/user`)
**Capabilities**:
- ✅ Check VWO article URLs
- ✅ Generate AI draft templates for article updates
- ✅ Add articles to export list
- ✅ Export list to PDF
- ✅ Submit articles for admin review
- ✅ Manage personal export list
- ❌ Cannot access admin panel
- ❌ Cannot consolidate PDFs
- ❌ Cannot review submissions

**Use Case**: 
VWO Support Engineers identifying outdated articles during customer support work

---

### **Admin Role** (`admin/admin`)
**Capabilities**:
- ✅ Review pending article submissions
- ✅ Approve/Reject flagged articles
- ✅ Upload multiple PDF files
- ✅ Consolidate PDFs into priority report
- ✅ View all pending drafts
- ✅ Full access to all features
- ❌ Same article checking as users (no special checking privileges)

**Use Case**:
Documentation team managers prioritizing article updates

---

## 🔧 Technical Implementation

### Global Variables & Configuration
```javascript
// --- Global Data Storage and Configuration ---
const users = {
    'user': 'user',
    'admin': 'admin'
};

// LocalStorage Keys
const DRAFT_STORAGE_KEY = 'kb_pending_drafts';
const EXPORT_LIST_KEY = 'kb_export_list';
const LOGIN_STATE_KEY = 'kb_login_state';
const UPLOADED_PDFS_KEY = 'kb_uploaded_pdfs';

// Runtime State
let currentRole = null;
let currentLoggedInUser = null;
const oneYearInDays = 365;
let currentDraftId = null;
let exportList = [];
let uploadedPDFs = [];
```

---

### Function Organization Strategy

**CRITICAL PATTERN**: Functions called from HTML `onclick` attributes must be defined at the TOP of script.js to ensure they load before any runtime errors occur later in the file.

**Top-Level Functions** (Lines 21-560):
```javascript
window.addToExportListFromChecker = function() { ... }
window.exportListToPDF = async function() { ... }
window.removeFromExportList = function(index) { ... }
window.clearExportList = function() { ... }
window.switchTab = function(tabName) { ... }
window.uploadPDFs = function() { ... }
window.consolidatePDFs = async function() { ... }
window.removeUploadedPDF = function(index) { ... }
extractArticlesFromPDF(pdfData) { ... }
parseArticlesFromText(text) { ... }
generateConsolidatedReport(sortedArticles, totalPDFs) { ... }
```

**Why This Pattern?**
- HTML onclick handlers need global access via `window` object
- If defined later in file, syntax/runtime errors prevent loading
- Moving to top guarantees execution before any errors

**Bottom-Level Functions** (Lines 1400+):
```javascript
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.checkVWOArticle = checkVWOArticle;
window.submitVWOForReview = submitVWOForReview;
window.closeModal = closeModal;
window.reviewAction = reviewAction;
```

---

### CORS Proxy Strategy

**Problem**: 
VWO help articles are on different domain, browser blocks direct fetch due to CORS policy

**Solution**: 
Multi-proxy fallback system tries 3 different CORS proxies sequentially

**Implementation**:
```javascript
const corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
];

// Try each proxy until one succeeds
for (const proxy of corsProxies) {
    try {
        const response = await fetch(proxy + encodedUrl);
        if (response.ok) return response; // Success!
    } catch (error) {
        continue; // Try next proxy
    }
}
```

**Benefits**:
- ✅ Resilient to individual proxy failures
- ✅ No backend server required
- ✅ Works on GitHub Pages
- ⚠️ Proxies may be slow or rate-limited

---

### Article Age Calculation

```javascript
function calculateDaysOld(lastModifiedDate) {
    const lastModified = new Date(lastModifiedDate);
    const now = new Date();
    const diffTime = Math.abs(now - lastModified);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
```

**Threshold**: Articles older than 365 days are flagged as outdated

---

### PDF Generation (jsPDF)

**Export List PDF Format**:
```javascript
// Header
- Title: "VWO Outdated Articles - Export List"
- Metadata: Generated by, Date, Total Articles
- Separator line

// Articles (for each)
- Number & Title (12pt bold)
- Last Updated date
- Age in years and days
- URL (blue, wrapped text)
- Separator line
```

**Consolidated Report PDF Format**:
```javascript
// Header
- Title: "VWO Articles - Consolidated Priority Report"
- Metadata: Generated by, Date, PDFs Consolidated, Unique Articles
- Separator line

// Articles (sorted by frequency)
- Priority badge: "🔥 PRIORITY 3x" or numbered
- Article title (wrapped text)
- Last Updated, Age
- Found in: [list of source PDFs] (if count > 1)
- URL (blue, wrapped)
- Separator line
```

**Page Management**:
- Checks remaining space before adding article
- Auto-creates new page if needed
- Maintains consistent margins (20mm bottom)

---

## 💾 Data Storage & Persistence

### LocalStorage Schema

**1. Login State** (`kb_login_state`)
```json
{
  "username": "user",
  "role": "user",
  "timestamp": "2024-12-15T10:30:00.000Z"
}
```

**2. Export List** (`kb_export_list`)
```json
[
  {
    "title": "How to Set Up VWO SmartCode",
    "url": "https://help.vwo.com/hc/en-us/articles/360033434334",
    "lastUpdated": "2021-05-15",
    "daysOld": 1309,
    "addedBy": "user",
    "addedAt": "2024-12-15T10:35:00.000Z"
  }
]
```

**3. Pending Drafts** (`kb_pending_drafts`)
```json
[
  {
    "id": 1702645123456,
    "title": "How to Set Up VWO SmartCode",
    "content": "VWO Article flagged for update:\n\nURL: https://...\nLast Updated: 2021-05-15\nAge: 3.6 years (1309 days)\n\nNotes: Customer reported outdated installation steps",
    "submittedBy": "user",
    "submittedAt": "2024-12-15T10:40:00.000Z",
    "status": "pending"
  }
]
```

**4. Uploaded PDFs** (`kb_uploaded_pdfs`)
```json
[
  {
    "name": "VWO_Outdated_Articles_user_1702645200000.pdf",
    "uploadedAt": "2024-12-15T11:00:00.000Z",
    "uploadedBy": "admin",
    "size": 245678,
    "base64": "data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ..."
  }
]
```

---

### Data Persistence Functions

**Save Operations**:
```javascript
function saveDrafts(drafts) {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
}

function saveExportList(list) {
    localStorage.setItem(EXPORT_LIST_KEY, JSON.stringify(list));
}

function saveLoginState(username, role) {
    const loginState = { username, role, timestamp: new Date().toISOString() };
    localStorage.setItem(LOGIN_STATE_KEY, JSON.stringify(loginState));
}

function saveUploadedPDFs(pdfs) {
    localStorage.setItem(UPLOADED_PDFS_KEY, JSON.stringify(pdfs));
}
```

**Load Operations**:
```javascript
function loadDrafts() {
    const storedDrafts = localStorage.getItem(DRAFT_STORAGE_KEY);
    return storedDrafts ? JSON.parse(storedDrafts) : [];
}

function loadExportList() {
    const storedList = localStorage.getItem(EXPORT_LIST_KEY);
    return storedList ? JSON.parse(storedList) : [];
}

function checkInitialLogin() {
    const storedLogin = localStorage.getItem(LOGIN_STATE_KEY);
    if (storedLogin) {
        const { username, role } = JSON.parse(storedLogin);
        // Auto-login user
    }
}

function loadUploadedPDFs() {
    const storedPDFs = localStorage.getItem(UPLOADED_PDFS_KEY);
    return storedPDFs ? JSON.parse(storedPDFs) : [];
}
```

---

## 📂 Code Structure

### Main Sections (script.js)

**Line Organization**:

```
Lines 1-20:     Global Variables & Configuration
Lines 21-70:    addToExportListFromChecker (Top-level for onclick)
Lines 88-180:   exportListToPDF (Top-level for onclick)
Lines 181-220:  removeFromExportList (Top-level for onclick)
Lines 221-245:  clearExportList (Top-level for onclick)
Lines 246-270:  switchTab (Top-level for onclick)
Lines 271-310:  uploadPDFs (Top-level for onclick)
Lines 311-410:  consolidatePDFs (Top-level for onclick)
Lines 411-485:  extractArticlesFromPDF (Helper for consolidation)
Lines 486-520:  parseArticlesFromText (Helper for consolidation)
Lines 521-560:  generateConsolidatedReport (Helper for consolidation)

Lines 561-640:  Data Persistence Functions (load/save)
Lines 641-750:  Authentication Functions (login/logout/session)
Lines 751-900:  Article Checker Functions (checkVWOArticle, calculateDaysOld)
Lines 901-1000: Export List Management (updateExportListUI, initializeExportList)
Lines 1001-1100: Admin Review Functions (loadAdminView, showDraft, reviewAction)
Lines 1101-1200: PDF Upload Functions (updateUploadedPDFsList)
Lines 1201-1300: UI Helper Functions (closeModal, etc.)

Lines 1400+:    DOMContentLoaded Event Listener
Lines 1450+:    Global Window Assignments (bottom of file)
```

---

### Key Function Reference

#### **Article Checking**
- `checkVWOArticle()` - Main article checker
- `extractTitleFromHTML(html)` - Parses title from HTML
- `calculateDaysOld(date)` - Calculates article age
- `formatDate(date)` - Formats date for display

#### **Export List Management**
- `window.addToExportListFromChecker()` - Add article to list
- `window.exportListToPDF()` - Generate PDF from list
- `window.removeFromExportList(index)` - Remove single item
- `window.clearExportList()` - Clear entire list
- `updateExportListUI()` - Refresh UI display
- `initializeExportList()` - Load list on page load

#### **AI Draft Generation**
- `window.simulateVWODraft(articleTitle, lastUpdated)` - Generate AI draft template
  - Auto-fills textarea with structured update suggestions
  - Disables button after generation
  - Includes VWO-specific update checklist

#### **Authentication**
- `loginUser()` - Validate credentials and login
- `logoutUser()` - Clear session and logout
- `checkInitialLogin()` - Auto-login from localStorage
- `showCheckerView()` - Render user dashboard
- `loadAdminView()` - Render admin panel

#### **Admin Review**
- `loadAdminView()` - Populate review queue
- `showDraft(id)` - Open draft in modal
- `reviewAction(action)` - Approve/Reject draft
- `closeModal()` - Close review modal
- `submitVWOForReview()` - Submit article for review

#### **PDF Consolidation**
- `window.uploadPDFs()` - Handle file uploads
- `window.consolidatePDFs()` - Main consolidation logic
- `extractArticlesFromPDF(pdfData)` - Parse PDF with PDF.js
- `parseArticlesFromText(text)` - Extract articles via regex
- `generateConsolidatedReport()` - Create final PDF
- `updateUploadedPDFsListManually()` - Refresh upload list UI

#### **Data Persistence**
- `saveDrafts(drafts)` - Save pending reviews
- `loadDrafts()` - Load pending reviews
- `saveExportList(list)` - Save export list
- `loadExportList()` - Load export list
- `saveLoginState(user, role)` - Save session
- `saveUploadedPDFs(pdfs)` - Save uploaded files
- `loadUploadedPDFs()` - Load uploaded files

---

## 🔌 External Dependencies

### CDN Libraries (Loaded in index.html)

**1. jsPDF** (PDF Generation)
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```
- **Purpose**: Generate PDF files from JavaScript
- **Used in**: exportListToPDF(), generateConsolidatedReport()
- **Version**: 2.5.1
- **License**: MIT

**2. PDF.js** (PDF Parsing)
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
```
- **Purpose**: Extract text from uploaded PDF files
- **Used in**: extractArticlesFromPDF()
- **Version**: 3.11.174
- **License**: Apache 2.0
- **Worker**: https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js

### CORS Proxies

**1. AllOrigins**
- URL: `https://api.allorigins.win/raw?url=`
- Purpose: Bypass CORS for article fetching
- Reliability: Medium
- Speed: Medium

**2. CORSProxy.io**
- URL: `https://corsproxy.io/?`
- Purpose: Backup proxy
- Reliability: High
- Speed: Fast

**3. CodeTabs Proxy**
- URL: `https://api.codetabs.com/v1/proxy?quest=`
- Purpose: Third fallback
- Reliability: Medium
- Speed: Slow

---

## 🎨 UI/UX Components

### Color Scheme
```css
--primary-color: #4a90e2
--hover-color: #357abd
--success-color: #27ae60
--warning-color: #e67e22
--danger-color: #e74c3c
--text-dark: #2c3e50
--bg-light: #ecf0f1
--border-color: #bdc3c7
```

### Responsive Design
```css
/* Mobile: < 768px */
- Single column layout
- Full-width buttons
- Stacked forms

/* Tablet: 768px - 1024px */
- Two-column grid for some sections
- Larger touch targets

/* Desktop: > 1024px */
- Full multi-column layout
- Hover effects enabled
- Wider content containers
```

### Key UI Elements

**Login Page**:
- Centered card design
- Username/password inputs
- Single login button
- No registration (hardcoded credentials)

**User Dashboard**:
- Header with logout button
- Article checker section (URL input + check button)
- Results display area (dynamic content)
- Export list sidebar
- Export/Clear buttons

**Admin Panel**:
- Tab navigation (Review Drafts / Consolidate PDFs)
- Draft cards with metadata
- Modal overlay for detailed review
- File upload interface
- Consolidation results display

---

## 🚀 Deployment

### GitHub Pages Deployment

**Requirements**:
- ✅ Static files only (HTML, CSS, JS)
- ✅ No backend server needed
- ✅ All dependencies via CDN
- ✅ localStorage for data persistence

**Files to Upload**:
```
Required:
- index.html
- style.css
- script.js

Optional:
- README.md
- TECHNICAL_DOCUMENTATION.md
```

**Steps**:
1. Create GitHub repository
2. Upload files to main branch
3. Enable GitHub Pages in Settings → Pages
4. Select branch: `main`, folder: `/ (root)`
5. Wait 1-2 minutes for deployment
6. Access at: `https://username.github.io/repo-name/`

**Limitations**:
- ⚠️ CORS proxies may be slow/unreliable
- ⚠️ LocalStorage data is browser-specific (not shared across devices)
- ⚠️ No user registration/management
- ⚠️ Credentials are hardcoded in JavaScript (visible in source)

---

### Alternative Deployment Options

**1. Netlify**
- Drag-and-drop deployment
- Automatic HTTPS
- Custom domain support
- Build optimization

**2. Vercel**
- Git integration
- Instant deployments
- Edge network
- Analytics dashboard

**3. Firebase Hosting**
- Google Cloud integration
- Custom domain
- SSL certificates
- CDN distribution

---

## 🔍 Troubleshooting

### Common Issues & Solutions

**Issue 1: Functions not defined (onclick errors)**
```
Error: Uncaught ReferenceError: functionName is not defined
```
**Solution**: 
- Ensure function is attached to `window` object
- Move function definition to top of script.js (before any errors)
- Hard refresh browser (Ctrl+Shift+R)

**Example**:
```javascript
// WRONG (won't work if defined late in file)
function exportListToPDF() { ... }

// CORRECT (guaranteed to load)
window.exportListToPDF = async function() { ... }
```

---

**Issue 2: CORS proxy failures**
```
Error: Failed to fetch article
```
**Solution**:
- Multi-proxy fallback should handle this automatically
- If all proxies fail, wait 5-10 minutes and retry
- Check if article URL is valid VWO help article
- Verify internet connection

---

**Issue 3: PDF consolidation not working**
```
Error: extractArticlesFromPDF is not defined
```
**Solution**:
- Check PDF.js library loaded in HTML
- Verify worker URL is accessible
- Ensure helper functions defined before consolidatePDFs()
- Check console for PDF.js errors

---

**Issue 4: Export list not persisting**
```
Articles disappear after page refresh
```
**Solution**:
- Check browser localStorage not disabled
- Verify saveExportList() being called
- Check browser console for storage quota errors
- Clear localStorage and try again

**Test localStorage**:
```javascript
// In browser console
localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test')); // Should show 'value'
```

---

**Issue 5: Login not working**
```
Cannot access dashboard after login
```
**Solution**:
- Verify credentials: `user/user` or `admin/admin`
- Check saveLoginState() being called
- Inspect LOGIN_STATE_KEY in localStorage
- Clear localStorage and retry login

---

**Issue 6: UI not updating after actions**
```
Added article but list shows (0 articles)
```
**Solution**:
- Check if updateExportListUI() called after add
- Verify DOM elements exist (export-count, export-list-container)
- Inspect exportList array in console
- Hard refresh browser

**Debug**:
```javascript
// In console
console.log('Export list:', exportList);
console.log('Count element:', document.getElementById('export-count'));
```

---

## 📊 Performance Considerations

### LocalStorage Limits
- **Quota**: ~5-10MB per domain
- **Current Usage**: 
  - Export list: ~1-2KB per article
  - Uploaded PDFs: Can be large (1-5MB each)
  - Total typical usage: < 10MB

**Recommendations**:
- Limit uploaded PDFs to < 5 files at once
- Clear uploaded PDFs after consolidation
- Export and clear export list regularly

---

### CORS Proxy Performance
- **Latency**: 2-10 seconds per article check
- **Rate Limits**: Unknown, varies by proxy
- **Reliability**: 80-90% success rate

**Optimization**:
- Use multi-proxy fallback
- Show loading indicators
- Cache results (future enhancement)

---

### PDF Generation Performance
- **Small PDFs** (1-10 articles): < 1 second
- **Medium PDFs** (10-50 articles): 1-3 seconds
- **Large PDFs** (50+ articles): 3-10 seconds
- **Consolidation** (3 PDFs): 5-15 seconds

---

## 🔮 Future Enhancement Ideas


### Feature Enhancements

**1. Backend Integration**
- Replace localStorage with database (Firebase, MongoDB)
- User authentication via OAuth
- Real-time collaboration
- Cross-device sync

**2. Advanced Article Checking**
- Batch URL checking
- Automatic scanning of entire help center
- Category-based filtering
- Scheduled automatic checks

**3. Analytics Dashboard**
- Most flagged articles
- Average article age by category
- Trend analysis over time
- Team performance metrics

**4. Collaboration Features**
- Comments on flagged articles
- Assignment system (assign articles to team members)
- Status tracking (In Progress, Completed, Deferred)
- Email notifications

**5. Export Enhancements**
- Excel/CSV export
- Custom PDF templates
- Automated email delivery
- Scheduled reports

**6. Article Caching**
- Cache article metadata
- Reduce CORS proxy calls
- Faster repeat checks
- Offline mode support

**7. Integration with VWO**
- Direct API integration (if available)
- Automated article updates
- Bi-directional sync
- Webhook notifications

**8. Advanced PDF Consolidation**
- OCR for scanned PDFs
- Better text extraction
- AI-powered duplicate detection
- Smart categorization

**9. User Management**
- Team creation
- Role-based permissions
- Activity logging
- Admin dashboard

**10. UI/UX Improvements**
- Dark mode
- Customizable themes
- Keyboard shortcuts
- Drag-and-drop file upload
- Progressive Web App (PWA)

---

## 🔐 Security Considerations

### Current Security Model

**⚠️ WARNING**: This is a prototype/hackathon app with minimal security

**Vulnerabilities**:
1. **Hardcoded Credentials**: Username/password visible in JavaScript source
2. **Client-Side Auth**: Authentication logic in frontend (easily bypassed)
3. **No Encryption**: Data stored in plain text in localStorage
4. **XSS Risk**: User input not fully sanitized
5. **CORS Proxies**: Third-party services handle article fetching

### Security Recommendations for Production

**1. Backend Authentication**
```javascript
// Replace hardcoded users with backend API
async function loginUser() {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const { token } = await response.json();
    // Store JWT token, not credentials
}
```

**2. Input Sanitization**
```javascript
// Sanitize user input before display
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
```

**3. HTTPS Only**
- Deploy on HTTPS (GitHub Pages provides this)
- Prevent mixed content warnings
- Secure localStorage access

**4. Rate Limiting**
- Limit article checks per user
- Prevent abuse of CORS proxies
- Throttle PDF uploads

**5. Data Encryption**
- Encrypt sensitive data in localStorage
- Use browser crypto API
- Implement proper key management

---

## 📝 Code Examples

### Example 1: Adding New Article to Export List
```javascript
// User clicks "Add to Export List" button
// onclick="addToExportListFromChecker()"

window.addToExportListFromChecker = function() {
    // 1. Validate article data exists
    if (!window.currentArticleData) {
        alert('No article data available.');
        return;
    }
    
    // 2. Check for duplicates
    const exists = exportList.find(item => 
        item.url === window.currentArticleData.url
    );
    
    if (exists) {
        alert('Article already in list!');
        return;
    }
    
    // 3. Add to array
    exportList.push({
        title: window.currentArticleData.title,
        url: window.currentArticleData.url,
        lastUpdated: window.currentArticleData.lastUpdated,
        daysOld: window.currentArticleData.daysOld,
        addedBy: currentLoggedInUser,
        addedAt: new Date().toISOString()
    });
    
    // 4. Persist to localStorage
    saveExportList(exportList);
    
    // 5. Update UI
    const countSpan = document.getElementById('export-count');
    countSpan.textContent = exportList.length;
    
    // 6. Rebuild list display
    const container = document.getElementById('export-list-container');
    container.innerHTML = '';
    exportList.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'export-item';
        itemDiv.innerHTML = `
            <strong>${item.title}</strong>
            <button onclick="removeFromExportList(${index})">Remove</button>
        `;
        container.appendChild(itemDiv);
    });
    
    // 7. Enable export button
    document.getElementById('export-pdf-btn').disabled = false;
    
    alert('Article added to export list!');
};
```

---

### Example 2: Checking VWO Article
```javascript
async function checkVWOArticle() {
    const urlInput = document.getElementById('vwo-url');
    const url = urlInput.value.trim();
    
    // 1. Validate URL
    if (!url.includes('help.vwo.com')) {
        alert('Please enter a valid VWO help article URL');
        return;
    }
    
    // 2. Show loading state
    const checkBtn = document.getElementById('check-vwo-btn');
    checkBtn.disabled = true;
    checkBtn.textContent = 'Checking...';
    
    try {
        // 3. Try multiple CORS proxies
        const corsProxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest='
        ];
        
        let response;
        for (const proxy of corsProxies) {
            try {
                response = await fetch(proxy + encodeURIComponent(url));
                if (response.ok) break; // Success!
            } catch (err) {
                continue; // Try next proxy
            }
        }
        
        // 4. Extract article metadata
        const html = await response.text();
        const lastModified = response.headers.get('last-modified');
        const articleTitle = extractTitleFromHTML(html);
        
        // 5. Calculate age
        const daysOld = calculateDaysOld(lastModified);
        const isOutdated = daysOld > oneYearInDays;
        
        // 6. Store for export list
        window.currentArticleData = {
            url: url,
            title: articleTitle,
            lastUpdated: new Date(lastModified).toLocaleDateString(),
            daysOld: daysOld
        };
        
        // 7. Display results
        const resultDiv = document.getElementById('vwo-result');
        if (isOutdated) {
            resultDiv.className = 'result outdated';
            resultDiv.innerHTML = `
                <h3>❌ Article is Outdated</h3>
                <p><strong>Title:</strong> ${articleTitle}</p>
                <p><strong>Last Updated:</strong> ${window.currentArticleData.lastUpdated}</p>
                <p><strong>Age:</strong> ${(daysOld / 365.25).toFixed(1)} years</p>
                <button onclick="submitVWOForReview()">Submit for Review</button>
                <button onclick="addToExportListFromChecker()">Add to Export List</button>
            `;
        } else {
            resultDiv.className = 'result current';
            resultDiv.innerHTML = `
                <h3>✅ Article is Current</h3>
                <p><strong>Title:</strong> ${articleTitle}</p>
                <p><strong>Last Updated:</strong> ${window.currentArticleData.lastUpdated}</p>
                <button onclick="addToExportListFromChecker()">Add to Export List</button>
            `;
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to check article. Please try again.');
    } finally {
        // 8. Reset button
        checkBtn.disabled = false;
        checkBtn.textContent = 'Check Article';
    }
}
```

---

### Example 3: PDF Consolidation Workflow
```javascript
async function consolidatePDFs() {
    // 1. Validate PDFs uploaded
    if (uploadedPDFs.length === 0) {
        alert('No PDFs to consolidate!');
        return;
    }
    
    // 2. Show processing state
    const btn = document.getElementById('consolidate-btn');
    btn.disabled = true;
    btn.textContent = '🔄 Processing...';
    
    try {
        const allArticles = [];
        const articleFrequency = new Map();
        
        // 3. Extract text from each PDF
        for (const pdfData of uploadedPDFs) {
            const articles = await extractArticlesFromPDF(pdfData);
            
            // 4. Track article frequency
            articles.forEach(article => {
                const key = article.url;
                
                if (articleFrequency.has(key)) {
                    // Already seen - increment count
                    const existing = articleFrequency.get(key);
                    existing.count++;
                    existing.sources.push(pdfData.name);
                } else {
                    // First occurrence
                    articleFrequency.set(key, {
                        article: article,
                        count: 1,
                        sources: [pdfData.name]
                    });
                }
            });
        }
        
        // 5. Sort by priority (most frequent first)
        const sortedArticles = Array.from(articleFrequency.values())
            .sort((a, b) => b.count - a.count);
        
        // 6. Generate consolidated report
        await generateConsolidatedReport(sortedArticles, uploadedPDFs.length);
        
        // 7. Show success
        alert(`Consolidated ${sortedArticles.length} unique articles!`);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Consolidation failed. Check console for details.');
    } finally {
        btn.disabled = false;
        btn.textContent = '🔗 Consolidate & Generate Report';
    }
}
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

**Login System**:
- [ ] Login with `user/user` shows user dashboard
- [ ] Login with `admin/admin` shows admin panel
- [ ] Invalid credentials show error
- [ ] Logout clears session
- [ ] Page refresh maintains login state

**Article Checker** (User):
- [ ] Valid VWO URL shows article metadata
- [ ] Outdated article (>365 days) shows red status
- [ ] Current article shows green status
- [ ] Invalid URL shows error
- [ ] CORS proxy fallback works

**Export List** (User):
- [ ] Add article to list updates counter
- [ ] Duplicate detection works
- [ ] Remove button deletes item
- [ ] Clear list empties entire list
- [ ] Export to PDF downloads file
- [ ] List persists after page refresh

**Admin Review**:
- [ ] Pending drafts show in admin panel
- [ ] Draft details open in modal
- [ ] Approve removes draft
- [ ] Reject removes draft
- [ ] No drafts shows empty state

**PDF Consolidation** (Admin):
- [ ] Upload PDF shows in list
- [ ] Multiple PDFs can be uploaded
- [ ] Remove PDF works
- [ ] Consolidate generates report
- [ ] Priority markers show for duplicates
- [ ] Consolidated PDF downloads

---

## 📚 Additional Resources

### Documentation Files
- `README.md` - User-facing documentation
- `TECHNICAL_DOCUMENTATION.md` - This file (technical reference)
- `QUICK_START_GUIDE.md` - Getting started guide

### External Resources
- **jsPDF Docs**: https://github.com/parallax/jsPDF
- **PDF.js Docs**: https://mozilla.github.io/pdf.js/
- **VWO Help Center**: https://help.vwo.com/
- **GitHub Pages**: https://pages.github.com/

### Support & Feedback
- **Issues**: Create GitHub issue in repository
- **Questions**: Contact development team
- **Feature Requests**: Submit via GitHub issues

---

## 📄 License & Credits

### Application
- **Name**: VWO Knowledge Base Workflow
- **Version**: 1.0.0
- **Created**: December 2024
- **Purpose**: VWO Hackathon Project
- **Developer**: Kamus
- **Company**: Wingify Software Pvt. Ltd.

### Libraries
- **jsPDF**: MIT License
- **PDF.js**: Apache 2.0 License
- **CORS Proxies**: Various (check individual terms)

---

## 🔄 Version History


**END OF TECHNICAL DOCUMENTATION**

*Last Updated: December 16, 2024*
*Document Version: 1.1*
