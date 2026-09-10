/**
 * BugVerse Extension - Popup Script
 * Handles popup UI interactions and bug report submission
 */

// DOM Elements
const authStatus = document.getElementById('authStatus');
const loginSection = document.getElementById('loginSection');
const bugReportSection = document.getElementById('bugReportSection');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const bugForm = document.getElementById('bugForm');
const currentUrl = document.getElementById('currentUrl');
const refreshContext = document.getElementById('refreshContext');
const toggleDetails = document.getElementById('toggleDetails');
const contextDetails = document.getElementById('contextDetails');
const captureScreenshot = document.getElementById('captureScreenshot');
const screenshotPreview = document.getElementById('screenshotPreview');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const successMessage = document.getElementById('successMessage');
const closeSuccess = document.getElementById('closeSuccess');

// State
let currentScreenshot = null;
let technicalContext = null;

/**
 * Initialize popup
 */
async function init() {
  await checkAuthStatus();
  await getCurrentTabUrl();
  await loadTechnicalContext();
}

/**
 * Check authentication status
 */
async function checkAuthStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getAuthStatus' });
    
    if (response.isAuthenticated) {
      showAuthenticatedState(response.userEmail);
    } else {
      showLoginState();
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    showLoginState();
  }
}

/**
 * Show authenticated state
 */
function showAuthenticatedState(email) {
  authStatus.innerHTML = `
    <span class="status-indicator"></span>
    <span class="status-text">${email}</span>
  `;
  loginSection.classList.add('hidden');
  bugReportSection.classList.remove('hidden');
}

/**
 * Show login state
 */
function showLoginState() {
  authStatus.innerHTML = `
    <span class="status-indicator not-authenticated"></span>
    <span class="status-text">Not logged in</span>
  `;
  loginSection.classList.remove('hidden');
  bugReportSection.classList.add('hidden');
}

/**
 * Get current tab URL
 */
async function getCurrentTabUrl() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      currentUrl.textContent = tab.url;
    }
  } catch (error) {
    console.error('Error getting current tab:', error);
    currentUrl.textContent = 'Unable to get URL';
  }
}

/**
 * Load technical context from content script
 */
async function loadTechnicalContext() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getCapturedData' });
    
    if (response.success) {
      technicalContext = response.data;
      updateTechnicalContextUI();
    }
  } catch (error) {
    console.error('Error loading technical context:', error);
  }
}

/**
 * Update technical context UI
 */
function updateTechnicalContextUI() {
  if (!technicalContext) return;
  
  const summary = technicalContext.summary;
  
  document.getElementById('errorCount').textContent = summary.error_count;
  document.getElementById('warningCount').textContent = summary.warning_count;
  document.getElementById('requestCount').textContent = summary.request_count;
  document.getElementById('failedCount').textContent = summary.failed_requests;
  
  // Update console errors
  const consoleErrorsDiv = document.getElementById('consoleErrors');
  consoleErrorsDiv.innerHTML = '';
  
  technicalContext.console_errors.forEach(error => {
    const errorItem = document.createElement('div');
    errorItem.className = `context-item ${error.type}`;
    errorItem.textContent = `${error.type.toUpperCase()}: ${error.message.substring(0, 100)}...`;
    consoleErrorsDiv.appendChild(errorItem);
  });
  
  // Update network requests
  const networkRequestsDiv = document.getElementById('networkRequests');
  networkRequestsDiv.innerHTML = '';
  
  technicalContext.network_requests.slice(0, 10).forEach(req => {
    const reqItem = document.createElement('div');
    reqItem.className = `context-item ${req.success ? 'success' : 'error'}`;
    reqItem.textContent = `${req.method} ${req.url.substring(0, 50)}... (${req.status}) - ${req.responseTime}ms`;
    networkRequestsDiv.appendChild(reqItem);
  });
}

/**
 * Show loading state
 */
function showLoading(text = 'Loading...') {
  loadingText.textContent = text;
  loadingOverlay.classList.remove('hidden');
}

/**
 * Hide loading state
 */
function hideLoading() {
  loadingOverlay.classList.add('hidden');
}

/**
 * Show success message
 */
function showSuccess() {
  successMessage.classList.remove('hidden');
  bugReportSection.classList.add('hidden');
}

/**
 * Hide success message
 */
function hideSuccess() {
  successMessage.classList.add('hidden');
  bugReportSection.classList.remove('hidden');
}

/**
 * Handle login
 */
async function handleLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }
  
  showLoading('Logging in...');
  
  try {
    // Get API URL from storage
    const storageData = await chrome.storage.local.get(['bugverse_api_url']);
    const apiUrl = storageData.bugverse_api_url || 'http://localhost:5000/api';
    
    // Call BugVerse API for login
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const loginData = await response.json();
    
    if (response.ok) {
      // Store token in extension
      await chrome.runtime.sendMessage({
        action: 'setAuthToken',
        token: loginData.token,
        email: email
      });
      
      showAuthenticatedState(email);
      hideLoading();
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed: ' + error.message);
    hideLoading();
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  try {
    await chrome.runtime.sendMessage({ action: 'clearAuthToken' });
    showLoginState();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Handle bug form submission
 */
async function handleBugSubmit(e) {
  e.preventDefault();
  
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const severity = document.getElementById('severity').value;
  const tags = document.getElementById('tags').value;
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  const bugData = {
    title,
    description,
    severity,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    url: tab.url,
    technical_context: technicalContext,
    screenshot: currentScreenshot
  };
  
  showLoading('Submitting bug report...');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'submitBugReport',
      bugData
    });
    
    if (response.success) {
      showSuccess();
      // Reset form
      bugForm.reset();
      currentScreenshot = null;
      screenshotPreview.innerHTML = '<p class="placeholder">No screenshot captured</p>';
    } else {
      throw new Error(response.error || 'Failed to submit bug report');
    }
  } catch (error) {
    console.error('Submit error:', error);
    alert('Failed to submit bug report: ' + error.message);
  } finally {
    hideLoading();
  }
}

/**
 * Handle screenshot capture
 */
async function handleCaptureScreenshot() {
  try {
    showLoading('Capturing screenshot...');
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    
    currentScreenshot = screenshot;
    screenshotPreview.innerHTML = `<img src="${screenshot}" alt="Screenshot">`;
    
    hideLoading();
  } catch (error) {
    console.error('Screenshot error:', error);
    alert('Failed to capture screenshot: ' + error.message);
    hideLoading();
  }
}

/**
 * Toggle technical context details
 */
function toggleContextDetails() {
  contextDetails.classList.toggle('hidden');
  toggleDetails.textContent = contextDetails.classList.contains('hidden') 
    ? 'Show Details' 
    : 'Hide Details';
}

// Event Listeners
loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
bugForm.addEventListener('submit', handleBugSubmit);
refreshContext.addEventListener('click', loadTechnicalContext);
toggleDetails.addEventListener('click', toggleContextDetails);
captureScreenshot.addEventListener('click', handleCaptureScreenshot);
closeSuccess.addEventListener('click', hideSuccess);

// Initialize popup
init();