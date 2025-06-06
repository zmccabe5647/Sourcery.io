// Background service worker for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Sourcery.io extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open dashboard in new tab
  chrome.tabs.create({
    url: chrome.runtime.getURL('dashboard.html')
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openDashboard') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('dashboard.html')
    });
  } else if (request.action === 'getTemplates') {
    // Handle template requests
    sendResponse({ templates: [] });
  }
  
  return true;
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('Storage changed:', changes);
});