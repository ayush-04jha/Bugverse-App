/**
 * BugVerse Extension - Content Script
 * Captures console errors and network requests from any website
 */

// Store captured data
let consoleErrors = [];
let networkRequests = [];
let isCapturing = false;

// Original methods to restore later
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalFetch = window.fetch;
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

/**
 * Start capturing technical context
 */
function startCapture() {
  if (isCapturing) return;
  isCapturing = true;
  
  // Clear previous data
  consoleErrors = [];
  networkRequests = [];
  
  // Capture console errors
  console.error = function(...args) {
    const errorData = {
      timestamp: new Date().toISOString(),
      message: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '),
      type: 'error',
      stack: new Error().stack
    };
    consoleErrors.push(errorData);
    originalConsoleError.apply(console, args);
  };
  
  // Capture console warnings
  console.warn = function(...args) {
    const warnData = {
      timestamp: new Date().toISOString(),
      message: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '),
      type: 'warning'
    };
    consoleErrors.push(warnData);
    originalConsoleWarn.apply(console, args);
  };
  
  // Capture fetch requests
  window.fetch = async function(...args) {
    const startTime = performance.now();
    const url = args[0];
    const options = args[1] || {};
    
    try {
      const response = await originalFetch.apply(window, args);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      const requestData = {
        timestamp: new Date().toISOString(),
        url: typeof url === 'string' ? url : url.toString(),
        method: options.method || 'GET',
        status: response.status,
        statusText: response.statusText,
        responseTime: responseTime,
        success: response.ok,
        type: 'fetch'
      };
      
      networkRequests.push(requestData);
      return response;
    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      const requestData = {
        timestamp: new Date().toISOString(),
        url: typeof url === 'string' ? url : url.toString(),
        method: options.method || 'GET',
        status: 'FAILED',
        statusText: error.message,
        responseTime: responseTime,
        success: false,
        type: 'fetch',
        error: error.message
      };
      
      networkRequests.push(requestData);
      throw error;
    }
  };
  
  // Capture XMLHttpRequest
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._method = method;
    this._url = url;
    this._startTime = performance.now();
    return originalXHROpen.apply(this, [method, url, ...rest]);
  };
  
  XMLHttpRequest.prototype.send = function(...args) {
    this.addEventListener('loadend', function() {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - this._startTime);
      
      const requestData = {
        timestamp: new Date().toISOString(),
        url: this._url,
        method: this._method,
        status: this.status,
        statusText: this.statusText,
        responseTime: responseTime,
        success: this.status >= 200 && this.status < 300,
        type: 'xhr'
      };
      
      networkRequests.push(requestData);
    });
    
    return originalXHRSend.apply(this, args);
  };
  
  console.log('BugVerse Extension: Started capturing technical context');
}

/**
 * Stop capturing technical context
 */
function stopCapture() {
  if (!isCapturing) return;
  isCapturing = false;
  
  // Restore original methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  window.fetch = originalFetch;
  XMLHttpRequest.prototype.open = originalXHROpen;
  XMLHttpRequest.prototype.send = originalXHRSend;
  
  console.log('BugVerse Extension: Stopped capturing technical context');
}

/**
 * Get captured technical context
 */
function getCapturedData() {
  return {
    console_errors: consoleErrors,
    network_requests: networkRequests,
    summary: generateSummary()
  };
}

/**
 * Generate summary of captured data
 */
function generateSummary() {
  const errorCount = consoleErrors.filter(e => e.type === 'error').length;
  const warningCount = consoleErrors.filter(e => e.type === 'warning').length;
  const requestCount = networkRequests.length;
  const failedRequests = networkRequests.filter(req => !req.success).length;
  const avgResponseTime = requestCount > 0 
    ? Math.round(networkRequests.reduce((sum, req) => sum + req.responseTime, 0) / requestCount)
    : 0;
  
  return {
    error_count: errorCount,
    warning_count: warningCount,
    request_count: requestCount,
    failed_requests: failedRequests,
    average_response_time: avgResponseTime
  };
}

/**
 * Clear captured data
 */
function clearCapturedData() {
  consoleErrors = [];
  networkRequests = [];
}

// Listen for messages from popup/background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'startCapture':
      startCapture();
      sendResponse({ success: true });
      break;
      
    case 'stopCapture':
      stopCapture();
      sendResponse({ success: true });
      break;
      
    case 'getCapturedData':
      const data = getCapturedData();
      sendResponse({ success: true, data });
      break;
      
    case 'clearData':
      clearCapturedData();
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true; // Keep message channel open for async response
});

// Start capturing when content script loads
startCapture();