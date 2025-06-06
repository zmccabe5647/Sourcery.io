import React from 'react';
import { createRoot } from 'react-dom/client';
import { Sparkles, ExternalLink, Mail, Users, FileText } from 'lucide-react';

function PopupApp() {
  const openDashboard = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('dashboard.html')
    });
    window.close();
  };

  const openEmailProvider = (provider) => {
    const urls = {
      gmail: 'https://mail.google.com',
      outlook: 'https://outlook.live.com'
    };
    chrome.tabs.create({ url: urls[provider] });
    window.close();
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 h-full flex flex-col">
      <div className="p-4 text-white">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="h-6 w-6" />
          <h1 className="text-lg font-bold">Sourcery.io</h1>
        </div>
        <p className="text-sm text-white/80">
          Email automation made magical ✨
        </p>
      </div>

      <div className="flex-1 bg-white rounded-t-lg p-4 space-y-3">
        <button
          onClick={openDashboard}
          className="w-full flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <ExternalLink className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Open Dashboard</div>
              <div className="text-sm text-gray-500">Manage templates & contacts</div>
            </div>
          </div>
        </button>

        <div className="border-t pt-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => openEmailProvider('gmail')}
              className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">Open Gmail</span>
            </button>
            <button
              onClick={() => openEmailProvider('outlook')}
              className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">Open Outlook</span>
            </button>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="text-xs text-gray-500 text-center">
            Use the floating button on email pages to insert templates
          </div>
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById('popup-root');
const root = createRoot(container);
root.render(<PopupApp />);