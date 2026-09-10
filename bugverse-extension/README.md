# BugVerse Chrome Extension

A Chrome extension that allows users to capture technical context and report bugs from any website directly to BugVerse.

## Features

- **Automatic Technical Context Capture**: Captures console errors, network requests, failed API calls, and response times
- **Cross-Website Bug Reporting**: Report bugs from any website without leaving the page
- **Screenshot Capture**: Take screenshots of the current page to include with bug reports
- **Seamless Integration**: Uses BugVerse authentication and API for seamless bug reporting
- **Real-time Monitoring**: Continuously monitors console errors and network activity

## Installation

### Development Mode

1. Clone the BugVerse repository
2. Navigate to the `bugverse-extension` folder
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" in the top right corner
5. Click "Load unpacked"
6. Select the `bugverse-extension` folder

### Production

The extension will be published to the Chrome Web Store once testing is complete.

## Usage

1. **Install the Extension**: Follow the installation steps above
2. **Login to BugVerse**: 
   - Click the extension icon
   - Enter your BugVerse credentials
   - Or login at `http://localhost:3000` and the extension will detect your session
3. **Navigate to Any Website**: Go to the website where you found a bug
4. **Click Extension Icon**: Open the BugVerse popup
5. **Fill Bug Details**: 
   - Title and description
   - Severity level
   - Tags
6. **Review Technical Context**: See captured console errors and network requests
7. **Capture Screenshot** (Optional): Take a screenshot of the current page
8. **Submit Bug Report**: Send the bug report to BugVerse

## Architecture

### Extension Structure

```
bugverse-extension/
├── manifest.json           # Extension configuration
├── content.js             # Technical context capture (runs on web pages)
├── background.js          # Background service worker (API communication)
├── popup.html             # Bug reporting UI
├── popup.js               # Popup logic
├── popup.css              # Popup styling
├── options.html           # Settings page
├── icons/                 # Extension icons
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
└── README.md             # This file
```

### Data Flow

1. **Content Script**: Captures console errors and network requests from the current page
2. **Background Script**: Handles authentication, API communication, and data aggregation
3. **Popup UI**: Displays captured data and allows users to submit bug reports
4. **BugVerse API**: Receives bug reports and stores them in the database

## Technical Context Captured

- **Console Errors**: JavaScript errors and warnings
- **Network Requests**: All fetch and XMLHttpRequest calls
- **Failed Requests**: Failed API calls with status codes
- **Response Times**: API response performance metrics
- **Page Information**: URL, title, and user agent

## Server Configuration

The extension requires the BugVerse server to be running with CORS enabled for chrome extensions.

### Server Updates

The following changes were made to the BugVerse server:

1. **Bug Model**: Added `technical_context` and `extension_data` fields
2. **Controller**: Added `createExtensionBug` function for extension submissions
3. **Routes**: Added `/api/bugs/extension-report` endpoint
4. **CORS**: Enabled chrome-extension:// origins

### API Endpoint

- **POST** `/api/bugs/extension-report`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "title": "Bug title",
    "description": "Bug description",
    "severity": "medium",
    "tags": ["ui", "mobile"],
    "url": "https://example.com",
    "technical_context": {
      "console_errors": [...],
      "network_requests": [...],
      "summary": {...}
    },
    "screenshot": "base64_encoded_image"
  }
  ```

## Development

### Testing

1. Start the BugVerse server: `cd server && npm start`
2. Start the BugVerse client: `cd client && npm start`
3. Load the extension in Chrome (see Installation)
4. Navigate to any website
5. Click the extension icon and test the features

### Debugging

- **Extension Console**: `chrome://extensions/` → Click "Errors" button
- **Content Script Console**: Right-click on page → Inspect → Console tab
- **Popup Console**: Right-click on popup → Inspect

### Permissions

The extension requires the following permissions:
- `activeTab`: Access to the current tab
- `storage`: Store user tokens and settings
- `scripting`: Inject content scripts
- `tabs`: Get tab information
- `http://localhost:5000/*`: Access to BugVerse API (development)

## Configuration

### API URL

The extension can be configured to use different API URLs:

1. Right-click the extension icon → Options
2. Set the BugVerse API URL
3. Default: `http://localhost:5000/api`

### Capture Settings

Enable/disable automatic technical context capture in the extension options.

## Security

- User tokens are stored in chrome.storage.local
- All API communication uses HTTPS in production
- Sensitive data is never logged or transmitted insecurely
- Extension only communicates with authorized BugVerse servers

## Troubleshooting

### Extension not loading
- Check that all files are in the correct folder structure
- Verify manifest.json syntax
- Check Chrome extensions page for errors

### Authentication issues
- Verify BugVerse server is running
- Check API URL configuration
- Ensure CORS is properly configured on the server

### Technical context not capturing
- Refresh the page after loading the extension
- Check content script console for errors
- Verify that the website allows script injection

### API errors
- Check server logs for detailed error messages
- Verify network requests in browser DevTools
- Ensure user is properly authenticated

## Future Enhancements

- [ ] Session replay recording
- [ ] Performance metrics dashboard
- [ ] Automatic bug detection
- [ ] Integration with project management tools
- [ ] Voice notes for bug descriptions
- [ ] Collaborative bug reporting

## License

This extension is part of the BugVerse project.