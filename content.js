// Content script for email providers
(function() {
  'use strict';

  // Check if we're on a supported email provider
  const isGmail = window.location.hostname.includes('mail.google.com');
  const isOutlook = window.location.hostname.includes('outlook');

  if (!isGmail && !isOutlook) return;

  // Create floating action button
  function createFloatingButton() {
    const button = document.createElement('div');
    button.id = 'sourcery-fab';
    button.innerHTML = `
      <div class="sourcery-fab-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
    `;
    
    button.addEventListener('click', () => {
      showTemplateSelector();
    });
    
    document.body.appendChild(button);
  }

  // Show template selector modal
  function showTemplateSelector() {
    const modal = document.createElement('div');
    modal.id = 'sourcery-modal';
    modal.innerHTML = `
      <div class="sourcery-modal-backdrop">
        <div class="sourcery-modal-content">
          <div class="sourcery-modal-header">
            <h3>Select Email Template</h3>
            <button class="sourcery-close-btn">&times;</button>
          </div>
          <div class="sourcery-modal-body">
            <div class="sourcery-template-list">
              <div class="sourcery-template-item" data-template="cold-outreach">
                <h4>Cold Outreach</h4>
                <p>Professional introduction for new prospects</p>
              </div>
              <div class="sourcery-template-item" data-template="follow-up">
                <h4>Follow-up</h4>
                <p>Gentle reminder for previous conversations</p>
              </div>
              <div class="sourcery-template-item" data-template="introduction">
                <h4>Introduction</h4>
                <p>Connect with industry professionals</p>
              </div>
            </div>
            <div class="sourcery-modal-actions">
              <button class="sourcery-btn-secondary" id="open-dashboard">Open Dashboard</button>
              <button class="sourcery-btn-primary" id="generate-ai">Generate with AI</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.sourcery-close-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('#open-dashboard').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openDashboard' });
      modal.remove();
    });
    
    modal.querySelector('#generate-ai').addEventListener('click', () => {
      showAIGenerator();
      modal.remove();
    });
    
    // Template selection
    modal.querySelectorAll('.sourcery-template-item').forEach(item => {
      item.addEventListener('click', () => {
        const template = item.dataset.template;
        insertTemplate(template);
        modal.remove();
      });
    });
    
    // Close on backdrop click
    modal.querySelector('.sourcery-modal-backdrop').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        modal.remove();
      }
    });
  }

  // Show AI generator
  function showAIGenerator() {
    const modal = document.createElement('div');
    modal.id = 'sourcery-ai-modal';
    modal.innerHTML = `
      <div class="sourcery-modal-backdrop">
        <div class="sourcery-modal-content">
          <div class="sourcery-modal-header">
            <h3>Generate Email with AI</h3>
            <button class="sourcery-close-btn">&times;</button>
          </div>
          <div class="sourcery-modal-body">
            <div class="sourcery-ai-form">
              <label for="ai-prompt">Describe your email purpose:</label>
              <textarea id="ai-prompt" placeholder="e.g., Sales outreach to tech companies" rows="3"></textarea>
              <button class="sourcery-btn-primary" id="generate-template">Generate Template</button>
            </div>
            <div class="sourcery-ai-result" id="ai-result" style="display: none;">
              <h4>Generated Template:</h4>
              <div class="sourcery-template-preview">
                <div class="sourcery-subject">
                  <strong>Subject:</strong> <span id="generated-subject"></span>
                </div>
                <div class="sourcery-content">
                  <strong>Content:</strong>
                  <div id="generated-content"></div>
                </div>
              </div>
              <div class="sourcery-ai-actions">
                <button class="sourcery-btn-secondary" id="regenerate">Generate Another</button>
                <button class="sourcery-btn-primary" id="use-template">Use This Template</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    let currentTemplate = null;
    
    // Add event listeners
    modal.querySelector('.sourcery-close-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('#generate-template').addEventListener('click', async () => {
      const prompt = modal.querySelector('#ai-prompt').value;
      if (!prompt) return;
      
      try {
        const template = await generateAITemplate(prompt);
        currentTemplate = template;
        
        modal.querySelector('#generated-subject').textContent = template.subject;
        modal.querySelector('#generated-content').textContent = template.content;
        modal.querySelector('#ai-result').style.display = 'block';
      } catch (error) {
        console.error('Failed to generate template:', error);
      }
    });
    
    modal.querySelector('#regenerate').addEventListener('click', async () => {
      const prompt = modal.querySelector('#ai-prompt').value;
      try {
        const template = await generateAITemplate(prompt, true);
        currentTemplate = template;
        
        modal.querySelector('#generated-subject').textContent = template.subject;
        modal.querySelector('#generated-content').textContent = template.content;
      } catch (error) {
        console.error('Failed to regenerate template:', error);
      }
    });
    
    modal.querySelector('#use-template').addEventListener('click', () => {
      if (currentTemplate) {
        insertGeneratedTemplate(currentTemplate);
        modal.remove();
      }
    });
  }

  // Generate AI template
  async function generateAITemplate(prompt, regenerate = false) {
    // This would call your Supabase edge function
    const response = await fetch('https://ozyzhxspevperusiozos.supabase.co/functions/v1/generate-template', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96eXpoeHNwZXZwZXJ1c2lvem9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDc3NTUsImV4cCI6MjA1ODkyMzc1NX0.0OksDWM1danG0JTfxs0aSjMw8MimE-VCRW2-Epkh5vE',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, regenerate }),
    });
    
    return await response.json();
  }

  // Insert template into email composer
  function insertTemplate(templateType) {
    const templates = {
      'cold-outreach': {
        subject: 'Quick question about {{company}}',
        content: `Hi {{first_name}},

I noticed that {{company}} is making waves in the {{industry}} industry, and I wanted to reach out.

I help companies like yours improve their outreach and lead generation processes. Would you be open to a quick chat about how we could potentially help {{company}} achieve similar results?

Best regards,
[Your name]`
      },
      'follow-up': {
        subject: 'Following up on our previous conversation',
        content: `Hi {{first_name}},

I wanted to follow up on my previous email. I understand you're probably busy, but I'd love to hear your thoughts on how we could help {{company}} improve its outreach efforts.

Would you be open to a brief 15-minute call this week?

Best regards,
[Your name]`
      },
      'introduction': {
        subject: 'Introduction from a fellow {{industry}} professional',
        content: `Hi {{first_name}},

I hope this email finds you well. I'm reaching out because I noticed your work at {{company}} in the {{industry}} space.

I'd love to connect and learn more about your experience in the industry. Would you be open to a brief conversation?

Best regards,
[Your name]`
      }
    };
    
    const template = templates[templateType];
    if (template) {
      insertGeneratedTemplate(template);
    }
  }

  // Insert generated template
  function insertGeneratedTemplate(template) {
    if (isGmail) {
      insertIntoGmail(template);
    } else if (isOutlook) {
      insertIntoOutlook(template);
    }
  }

  // Gmail-specific insertion
  function insertIntoGmail(template) {
    // Find subject field
    const subjectField = document.querySelector('input[name="subjectbox"]') || 
                        document.querySelector('[aria-label*="Subject"]');
    if (subjectField) {
      subjectField.value = template.subject;
      subjectField.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Find compose body
    const composeBody = document.querySelector('[aria-label*="Message Body"]') ||
                       document.querySelector('[contenteditable="true"]');
    if (composeBody) {
      composeBody.innerHTML = template.content.replace(/\n/g, '<br>');
      composeBody.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  // Outlook-specific insertion
  function insertIntoOutlook(template) {
    // Find subject field
    const subjectField = document.querySelector('[aria-label*="Subject"]') ||
                        document.querySelector('input[placeholder*="Subject"]');
    if (subjectField) {
      subjectField.value = template.subject;
      subjectField.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Find compose body
    const composeBody = document.querySelector('[contenteditable="true"]') ||
                       document.querySelector('[aria-label*="Message body"]');
    if (composeBody) {
      composeBody.innerHTML = template.content.replace(/\n/g, '<br>');
      composeBody.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  // Initialize the extension
  function init() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createFloatingButton);
    } else {
      createFloatingButton();
    }
  }

  init();
})();