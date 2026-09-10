/**
 * BugVerse Extension - Background Service Worker
 * Handles extension logic, API communication, and user authentication
 */

// Configuration
let API_BASE_URL = 'http://localhost:5000/api'; // Development URL
// const API_BASE_URL = 'https://your-bugverse-domain.com/api'; // Production URL

// Extension state
let extensionState = {
  isAuthenticated: false,
  userToken: null,
  userEmail: null,
  captureEnabled: true
};

/**
 * Initialize extension on installation
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('BugVerse Extension installed');
  
  // Set default settings
  chrome.storage.local.set({
    'bugverse_api_url': API_BASE_URL,
    'bugverse_capture_enabled': true,
    'bugverse_user_token': null
  });
  
  // Initialize extension state
  loadExtensionState();
});

/**
 * Load extension state from storage
 */
async function loadExtensionState() {
  try {
    const data = await chrome.storage.local.get([
      'bugverse_user_token',
      'bugverse_user_email',
      'bugverse_capture_enabled',
      'bugverse_api_url'
    ]);
    
    extensionState.userToken = data.bugverse_user_token || null;
    extensionState.userEmail = data.bugverse_user_email || null;
    extensionState.isAuthenticated = !!data.bugverse_user_token;
    extensionState.captureEnabled = data.bugverse_capture_enabled !== false;
    
    if (data.bugverse_api_url) {
      // Update API URL from storage
      extensionState.apiUrl = data.bugverse_api_url;
    } else {
      extensionState.apiUrl = API_BASE_URL;
    }
  } catch (error) {
    console.error('Error loading extension state:', error);
  }
}

/**
 * Handle extension icon click
 */
chrome.action.onClicked.addListener(async (tab) => {
  // Open popup (handled by manifest.json)
  console.log('Extension icon clicked on tab:', tab.url);
});

/**
 * Handle messages from popup and content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getAuthStatus':
      sendResponse({
        isAuthenticated: extensionState.isAuthenticated,
        userEmail: extensionState.userEmail
      });
      break;
      
    case 'setAuthToken':
      extensionState.userToken = request.token;
      extensionState.userEmail = request.email;
      extensionState.isAuthenticated = true;
      
      chrome.storage.local.set({
        'bugverse_user_token': request.token,
        'bugverse_user_email': request.email
      });
      
      sendResponse({ success: true });
      break;
      
    case 'clearAuthToken':
      extensionState.userToken = null;
      extensionState.userEmail = null;
      extensionState.isAuthenticated = false;
      
      chrome.storage.local.remove(['bugverse_user_token', 'bugverse_user_email']);
      
      sendResponse({ success: true });
      break;
      
    case 'submitBugReport':
      submitBugReport(request.bugData)
        .then(response => sendResponse({ success: true, data: response }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep message channel open for async response
      
    case 'captureTab':
      captureTabData(sender.tab.id)
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'toggleCapture':
      extensionState.captureEnabled = request.enabled;
      chrome.storage.local.set({ 'bugverse_capture_enabled': request.enabled });
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

/**
 * Submit bug report to BugVerse API
 */
async function submitBugReport(bugData) {
  try {
    if (!extensionState.isAuthenticated || !extensionState.userToken) {
      throw new Error('User not authenticated');
    }
    
    const apiUrl = `${extensionState.apiUrl || API_BASE_URL}/bugs/extension-report`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${extensionState.userToken}`
      },
      body: JSON.stringify(bugData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit bug report');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting bug report:', error);
    throw error;
  }
}

/**
 * Capture tab data including technical context
 */
async function captureTabData(tabId) {
  try {
    // Get tab info
    const tab = await chrome.tabs.get(tabId);
    
    // Get technical context from content script
    const contextResponse = await chrome.tabs.sendMessage(tabId, { action: 'getCapturedData' });
    
    // Get screenshot
    const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    
    return {
      url: tab.url,
      title: tab.title,
      technical_context: contextResponse.data,
      screenshot: screenshot,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error capturing tab data:', error);
    throw error;
  }
}

/**
 * Update extension badge based on capture status
 */
function updateBadge() {
  if (extensionState.isAuthenticated) {
    chrome.action.setBadgeText({ text: extensionState.captureEnabled ? '●' : '○' });
    chrome.action.setBadgeBackgroundColor({ color: extensionState.captureEnabled ? '#4CAF50' : '#9E9E9E' });
  } else {
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#F44336' });
  }
}

// Update badge when state changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    loadExtensionState().then(() => {
      updateBadge();
    });
  }
});

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  loadExtensionState();
  updateBadge();
});

// Initial state load
loadExtensionState();
updateBadge();