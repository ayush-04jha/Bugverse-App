/**
 * Environment Capture Utility
 * Captures browser, device, and environment information for bug reporting
 */

export const captureEnvironment = () => {
  const environment = {
    // Browser Information
    browser: getBrowserName(),
    browser_version: getBrowserVersion(),
    
    // Operating System
    os: getOS(),
    os_version: getOSVersion(),
    
    // Viewport and Screen
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    
    // Device Type
    device_type: getDeviceType(),
    
    // URL Information
    url: window.location.href,
    pathname: window.location.pathname,
    
    // App Version (if available)
    app_version: getAppVersion(),
    
    // Language
    language: navigator.language,
    
    // Hardware Information
    hardware_concurrency: navigator.hardwareConcurrency || null,
    device_memory: navigator.deviceMemory || null,
    
    // Additional Information
    user_agent: navigator.userAgent,
    platform: navigator.platform,
    cookies_enabled: navigator.cookieEnabled,
    online_status: navigator.onLine
  };
  
  return environment;
};

/**
 * Get browser name from user agent
 */
const getBrowserName = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  
  return 'Unknown';
};

/**
 * Get browser version
 */
const getBrowserVersion = () => {
  const userAgent = navigator.userAgent;
  const browserName = getBrowserName();
  
  let version = 'Unknown';
  
  switch (browserName) {
    case 'Chrome':
      const chromeMatch = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
      version = chromeMatch ? chromeMatch[1] : 'Unknown';
      break;
    case 'Firefox':
      const firefoxMatch = userAgent.match(/Firefox\/(\d+\.\d+)/);
      version = firefoxMatch ? firefoxMatch[1] : 'Unknown';
      break;
    case 'Safari':
      const safariMatch = userAgent.match(/Version\/(\d+\.\d+)/);
      version = safariMatch ? safariMatch[1] : 'Unknown';
      break;
    case 'Edge':
      const edgeMatch = userAgent.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
      version = edgeMatch ? edgeMatch[1] : 'Unknown';
      break;
    case 'Opera':
      const operaMatch = userAgent.match(/Opera|OPR\/(\d+\.\d+)/);
      version = operaMatch ? operaMatch[1] : 'Unknown';
      break;
  }
  
  return version;
};

/**
 * Get operating system
 */
const getOS = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  if (userAgent.includes('Windows NT')) return 'Windows';
  if (userAgent.includes('Mac OS X')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  
  // Fallback to platform
  if (platform.includes('Win')) return 'Windows';
  if (platform.includes('Mac')) return 'macOS';
  if (platform.includes('Linux')) return 'Linux';
  
  return 'Unknown';
};

/**
 * Get OS version
 */
const getOSVersion = () => {
  const userAgent = navigator.userAgent;
  const os = getOS();
  
  let version = 'Unknown';
  
  switch (os) {
    case 'Windows':
      const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
      if (windowsMatch) {
        const ntVersion = windowsMatch[1];
        switch (ntVersion) {
          case '10.0': version = '10/11'; break;
          case '6.3': version = '8.1'; break;
          case '6.2': version = '8'; break;
          case '6.1': version = '7'; break;
          default: version = ntVersion;
        }
      }
      break;
    case 'macOS':
      const macMatch = userAgent.match(/Mac OS X (\d+[._]\d+[._]\d+)/);
      version = macMatch ? macMatch[1].replace(/_/g, '.') : 'Unknown';
      break;
    case 'Android':
      const androidMatch = userAgent.match(/Android (\d+\.\d+)/);
      version = androidMatch ? androidMatch[1] : 'Unknown';
      break;
    case 'iOS':
      const iosMatch = userAgent.match(/OS (\d+[._]\d+[._]\d+)/);
      version = iosMatch ? iosMatch[1].replace(/_/g, '.') : 'Unknown';
      break;
  }
  
  return version;
};

/**
 * Get device type based on screen size and user agent
 */
const getDeviceType = () => {
  const width = window.screen.width;
  const userAgent = navigator.userAgent;
  
  // Check for mobile user agents
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    if (/iPad/i.test(userAgent)) return 'tablet';
    return 'mobile';
  }
  
  // Check screen size
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  
  return 'desktop';
};

/**
 * Get app version (if available in meta tag or config)
 */
const getAppVersion = () => {
  // Try to get version from meta tag
  const metaTag = document.querySelector('meta[name="version"]');
  if (metaTag) {
    return metaTag.getAttribute('content');
  }
  
  // Try to get from global config if available
  if (window.appConfig && window.appConfig.version) {
    return window.appConfig.version;
  }
  
  // Default version
  return '1.0.0';
};

/**
 * Format environment data for display
 */
export const formatEnvironmentForDisplay = (environment) => {
  return `${environment.browser} ${environment.browser_version} / ${environment.os} ${environment.os_version}
Device: ${environment.device_type}
Viewport: ${environment.viewport_width} × ${environment.viewport_height}
Screen: ${environment.screen_width} × ${environment.screen_height}
URL: ${environment.url}`;
};

/**
 * Create environment summary for bug report
 */
export const createEnvironmentSummary = (environment) => {
  return {
    browser_os: `${environment.browser} ${environment.browser_version} / ${environment.os} ${environment.os_version}`,
    device: `${environment.device_type} - ${environment.viewport_width}×${environment.viewport_height}`,
    url: environment.url,
    language: environment.language,
    hardware: environment.hardware_concurrency ? `${environment.hardware_concurrency} cores` : 'Unknown'
  };
};