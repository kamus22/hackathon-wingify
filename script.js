// --- Global Data Storage and Configuration ---
const users = {
    'user': 'user',     // Normal User
    'admin': 'admin'    // Peer Reviewer
};

// Keys for localStorage
const DRAFT_STORAGE_KEY = 'kb_pending_drafts';
const ARTICLE_STORAGE_KEY = 'kb_article_dates';
const LOGIN_STATE_KEY = 'kb_login_state';

let currentRole = null;
let currentLoggedInUser = null;

const twoYearsInDays = 730;
let currentDraftId = null;

// --- Data Initialization and Persistence Functions ---

// Default article data
const defaultArticlesData = {
    "Things to Consider While Working with Funnels in VWO": "2020-04-01", // OUTDATED https://help.vwo.com/hc/en-us/articles/900000045923-Things-to-Consider-While-Working-with-Funnels-in-VWO
    "How to Track Clicks on Element in VWO?": "2023-09-15", // OUTDATED https://help.vwo.com/hc/en-us/articles/360021101273-How-to-Track-Clicks-on-Element-in-VWO
    "Interpreting Funnel Reports in VWO": "2021-04-06", // OUTDATED https://help.vwo.com/hc/en-us/articles/360019496474-Interpreting-Funnel-Reports-in-VWO
    "Configuring the VWO SmartCode for Your Website": "2025-08-01",
    "Setting Up Goal Tracking": "2023-01-15", // Outdated
    "Understanding Heatmaps and Recordings": "2024-11-20",
    "A/B Testing Best Practices Guide (Legacy)": "2022-05-10", // Outdated
    "What is A/B Testing?": "2021-05-10", // https://help.vwo.com/hc/en-us/articles/360020011033-What-is-A-B-Testing
    "Visitor Counting Logic in VWO": "2025-11-17", // https://help.vwo.com/hc/en-us/articles/360021116334-Visitor-Counting-Logic-in-VWO
    "Implementing Sitewide JS on Your Website": "2025-08-04", // https://help.vwo.com/hc/en-us/articles/35391952505113-Implementing-Sitewide-JS-on-Your-Website
    "Create Campaigns using VWO Copilot": "2025-10-06", // https://help.vwo.com/hc/en-us/articles/50734295118873-Create-Campaigns-using-VWO-Copilot
    "Types of Conversion Goals in VWO Insights": "2023-09-13", // https://help.vwo.com/hc/en-us/articles/900001155266-Types-of-Conversion-Goals-in-VWO-Insights
    "Create a VWO Personalize Campaign": "2025-09-11", // https://help.vwo.com/hc/en-us/articles/7070024310297-Create-a-VWO-Personalize-Campaign
    "VWO Web Rollout Quota FAQs": "2023-11-16", // https://help.vwo.com/hc/en-us/articles/900002997283-VWO-Web-Rollout-Quota-FAQs
    "Benefits of Migrating to VWO Data360": "2025-08-04", // https://help.vwo.com/hc/en-us/articles/49460003645721-Benefits-of-Migrating-to-VWO-Data360
    "Set Up Rules in Feature Experimentation": "2025-10-14", // https://help.vwo.com/hc/en-us/articles/46347563022233-Set-Up-Rules-in-Feature-Experimentation
    "Shopify's VWO App for Integration": "2025-07-18", // https://help.vwo.com/hc/en-us/articles/29708547740441-Shopify-s-VWO-App-for-Integration
    "How to Create a Goal in VWO Insights?": "2025-07-22", // https://help.vwo.com/hc/en-us/articles/900001157243-How-to-Create-a-Goal-in-VWO-Insights
    "Use Copilot Learnings in A/B Tests": "2025-11-20", // https://help.vwo.com/hc/en-us/articles/52611689068953-Use-Copilot-Learnings-in-A-B-Tests
    "SDKs Supported in VWO Feature Experimentation": "2025-08-27", // https://help.vwo.com/hc/en-us/articles/46019383292441-SDKs-Supported-in-VWO-Feature-Experimentation
    "Navigate the VWO Campaigns Overview Dashboard": "2025-10-17", // https://help.vwo.com/hc/en-us/articles/50333947818137-Navigate-the-VWO-Campaigns-Overview-Dashboard
    "What is Your Website’s Experience Score?": "2024-12-12", // https://help.vwo.com/hc/en-us/articles/24624567993753-What-is-Your-Website-s-Experience-Score
    "How to Create a Split URL Test in VWO?": "2025-11-03", // https://help.vwo.com/hc/en-us/articles/360021172854-How-to-Create-a-Split-URL-Test-in-VWO
    "Using the VWO Insights Goals Dashboard": "2023-08-01", // OUTDATED https://help.vwo.com/hc/en-us/articles/360019494134-Using-the-VWO-Insights-Goals-Dashboard
    "What are Funnels in VWO?": "2022-09-21", // OUTDATED https://help.vwo.com/hc/en-us/articles/360019496754-What-are-Funnels-in-VWO
    "Creating Segments Using Query Parameters in VWO": "2022-10-10", // OUTDATED https://help.vwo.com/hc/en-us/articles/360020627533-Creating-Segments-Using-Query-Parameters-in-VWO
};

function loadDrafts() {
    const storedDrafts = localStorage.getItem(DRAFT_STORAGE_KEY);
    return storedDrafts ? JSON.parse(storedDrafts) : [];
}

function saveDrafts(drafts) {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
}

function loadArticleDates() {
    const storedDates = localStorage.getItem(ARTICLE_STORAGE_KEY);
    return storedDates ? JSON.parse(storedDates) : defaultArticlesData;
}

function saveArticleDates(dates) {
    localStorage.setItem(ARTICLE_STORAGE_KEY, JSON.stringify(dates));
}

// Global variable for drafts and articles, loaded on script start
let pendingDrafts = loadDrafts();
let articlesData = loadArticleDates();


// --- DOM Elements ---
const loginScreen = document.getElementById('login-screen');
const checkerView = document.getElementById('checker-view');
const reviewerView = document.getElementById('reviewer-view');
const articleSelect = document.getElementById('article-select');
const resultMessage = document.getElementById('result-message');
const draftingForm = document.getElementById('drafting-form');
const pendingDraftsContainer = document.getElementById('pending-drafts');
const currentUsernameSpan = document.getElementById('current-username');
const currentAdminSpan = document.getElementById('current-admin');


// --- 1. Authentication Functions ---

function loginUser() {
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');
    errorMsg.textContent = '';

    if (users[usernameInput] === passwordInput) {
        const loginState = { 
            user: usernameInput, 
            role: usernameInput === 'admin' ? 'reviewer' : 'user' 
        };
        localStorage.setItem(LOGIN_STATE_KEY, JSON.stringify(loginState));

        currentLoggedInUser = loginState.user;
        currentRole = loginState.role;
        loginScreen.style.display = 'none';

        if (currentRole === 'reviewer') {
            showReviewerView();
        } else {
            showCheckerView();
        }
    } else {
        errorMsg.textContent = 'Invalid username or password.';
    }
}

function logoutUser() {
    localStorage.removeItem(LOGIN_STATE_KEY);
    currentLoggedInUser = null;
    currentRole = null;
    
    // Show only the login screen
    checkerView.style.display = 'none';
    reviewerView.style.display = 'none';
    loginScreen.style.display = 'block';

    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function showCheckerView() {
    currentUsernameSpan.textContent = currentLoggedInUser;
    checkerView.style.display = 'block';
    reviewerView.style.display = 'none';
    populateDropdown();
    // Call checkArticleStatus to set the initial message and state
    checkArticleStatus();
}

function showReviewerView() {
    currentAdminSpan.textContent = currentLoggedInUser;
    reviewerView.style.display = 'block';
    checkerView.style.display = 'none';
    updateReviewPanel();
}


// --- 2. Article Checker Logic (User View) ---

function populateDropdown() {
    articleSelect.innerHTML = '<option value="">-- Select an Article --</option>';
    articlesData = loadArticleDates(); 
    for (const title in articlesData) { 
        const option = document.createElement('option');
        option.value = title;
        option.textContent = title;
        articleSelect.appendChild(option);
    }
}

function checkArticleStatus() {
    const selectedTitle = articleSelect.value;
    draftingForm.style.display = 'none';
    resultMessage.className = 'info';

    // If no article is selected, display the initial instruction message
    if (!selectedTitle) {
        resultMessage.textContent = "Please select an article to check its status.";
        return;
    }

    const creationDateString = articlesData[selectedTitle];
    const creationDate = new Date(creationDateString);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - creationDate.getTime();
    const dayDifference = timeDifference / (1000 * 3600 * 24);

    if (dayDifference > twoYearsInDays) {
        const daysAgo = Math.floor(dayDifference);
        const yearsAgo = (daysAgo / 365.25).toFixed(1);

        resultMessage.textContent = `🚨 ARTICLE OUTDATED: This content is ${yearsAgo} years old (created on ${creationDateString}). It requires a refresh.`;
        resultMessage.className = 'outdated';
        
        pendingDrafts = loadDrafts();
        const existingDraft = pendingDrafts.find(d => d.title === selectedTitle);
        
        if (existingDraft) {
            draftingForm.innerHTML = `<p class="info">A draft for **${selectedTitle}** is already pending peer review.</p>`;
        } else {
            draftingForm.innerHTML = `
                <hr>
                <h3>Draft New Content</h3>
                <p>The current article is outdated. Initiate a draft below, or **Simulate AI Drafting** for a suggested update.</p>
                
                <button onclick="simulateAIDraft()" id="ai-draft-btn">🤖 Simulate AI Draft</button>

                <textarea id="draft-content" rows="5" placeholder="Enter new/corrected content here, or use the AI draft feature."></textarea>
                <button onclick="submitDraft()">Submit Draft for Peer Review</button>
            `;
        }
        draftingForm.style.display = 'block';

    } else {
        resultMessage.textContent = `✅ ARTICLE CURRENT: This content was created on ${creationDateString} and is currently up-to-date.`;
        resultMessage.className = 'current';
        draftingForm.style.display = 'none';
    }
}


function simulateAIDraft() {
    const selectedTitle = articleSelect.value;
    const date = new Date().toLocaleDateString('en-US');

    document.getElementById('draft-content').value = 
        `[AI-GENERATED DRAFT - ${date}]\n\n` + 
        `This new version of "${selectedTitle}" has been updated to reflect the latest UI changes and best practices.\n\n` +
        `Key changes include:\n` +
        `* New screenshot capture for key steps.\n` +
        `* Updated terminology to align with current Salesforce fields.\n` +
        `* Optimized configuration section for better clarity.\n\n` +
        `Please review the complete, detailed content for accuracy and compliance before publishing.`;
        
    document.getElementById('ai-draft-btn').disabled = true;
    document.getElementById('ai-draft-btn').textContent = 'Draft Generated!';
}


function submitDraft() {
    const selectedTitle = articleSelect.value;
    const content = document.getElementById('draft-content').value.trim();

    if (!content) {
        alert("Please enter the proposed content before submitting the draft.");
        return;
    }
    
    const draft = {
        id: Date.now(),
        title: selectedTitle,
        content: content,
        submittedBy: currentLoggedInUser,
        originalDate: articlesData[selectedTitle],
        status: 'pending'
    };

    pendingDrafts.push(draft);
    saveDrafts(pendingDrafts); 
    
    document.getElementById('draft-content').value = '';
    alert(`Draft for "${selectedTitle}" submitted successfully for Peer Review!`);
    
    checkArticleStatus(); 
}

// --- 3. Peer Review Logic (Admin View) ---

function updateReviewPanel() {
    if (currentRole !== 'reviewer') return;

    pendingDraftsContainer.innerHTML = '';
    
    pendingDrafts = loadDrafts(); 
    
    if (pendingDrafts.length === 0) {
        pendingDraftsContainer.innerHTML = '<p class="info">No pending drafts for peer review at this time.</p>';
        return;
    }

    pendingDrafts.forEach(draft => {
        const item = document.createElement('div');
        item.className = 'draft-item';
        item.innerHTML = `
            <span>Draft for: <strong>${draft.title}</strong> (Submitted by: ${draft.submittedBy})</span>
            <button onclick="openModal(${draft.id})">Review Draft</button>
        `;
        pendingDraftsContainer.appendChild(item);
    });
}

function openModal(draftId) {
    const draft = pendingDrafts.find(d => d.id === draftId);
    if (!draft) return;

    currentDraftId = draftId;

    document.getElementById('draft-title').textContent = draft.title;
    document.getElementById('draft-submitter').textContent = draft.submittedBy;
    document.getElementById('draft-original-date').textContent = draft.originalDate;
    document.getElementById('draft-review-content').value = draft.content;
    document.getElementById('review-status-message').textContent = 'Awaiting your decision...';
    document.getElementById('review-status-message').className = 'info';

    document.getElementById('draft-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('draft-modal').style.display = 'none';
    currentDraftId = null;
}

function reviewAction(action) {
    const draftIndex = pendingDrafts.findIndex(d => d.id === currentDraftId);
    if (draftIndex === -1) return;

    const messageElement = document.getElementById('review-status-message');
    const draftTitle = pendingDrafts[draftIndex].title;

    if (action === 'approve') {
        // 1. Update the Article Date (Simulates Publishing)
        articlesData[draftTitle] = new Date().toISOString().split('T')[0]; 
        saveArticleDates(articlesData); 
        
        // 2. Remove the draft
        pendingDrafts.splice(draftIndex, 1);
        saveDrafts(pendingDrafts); 
        
        // Final Success Message using Salesforce terminology
        messageElement.textContent = `✅ Draft Approved! Content successfully **PUBLISHED TO SALESFORCE** and is now live. Article "${draftTitle}" is now current.`;
        messageElement.className = 'current';

    } else if (action === 'reject') {
        // Remove draft
        pendingDrafts.splice(draftIndex, 1);
        saveDrafts(pendingDrafts); 
        
        messageElement.textContent = `❌ Draft Rejected. The contributor will be notified.`;
        messageElement.className = 'outdated';
    }

    // Refresh the panel and close the modal after a short delay
    setTimeout(() => {
        closeModal();
        updateReviewPanel();
    }, 1500);
}


// --- 4. Initialization and Auto-Login Check ---

function checkInitialLogin() {
    const storedState = localStorage.getItem(LOGIN_STATE_KEY);
    
    // Ensure all views are hidden first, then display the correct one
    loginScreen.style.display = 'none';
    checkerView.style.display = 'none';
    reviewerView.style.display = 'none';
    
    if (storedState) {
        const state = JSON.parse(storedState);
        currentLoggedInUser = state.user;
        currentRole = state.role;

        if (currentRole === 'reviewer') {
            showReviewerView();
        } else {
            showCheckerView();
        }
    } else {
        // Show only the login screen if no stored state is found
        loginScreen.style.display = 'block';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Check for previous login state on page load
    checkInitialLogin();
    
    // Attach listener to article selection
    articleSelect.addEventListener('change', checkArticleStatus);
});

// Allow closing the modal by clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('draft-modal');
    if (event.target === modal) {
        closeModal();
    }
}