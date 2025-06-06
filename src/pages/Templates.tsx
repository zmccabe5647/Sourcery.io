import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Edit, Wand2, Variable, Loader2, Eye, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { EmailTemplate } from '../types';

const templateSuggestions = {
  'cold-outreach': {
    name: 'Cold Outreach',
    subject: 'Quick question about {{company}}',
    content: `Hi {{first_name}},

I noticed that {{company}} is making waves in the {{industry}} industry, and I wanted to reach out.

I help companies like yours improve their outreach and lead generation processes. Would you be open to a quick chat about how we could potentially help {{company}} achieve similar results?

Best regards,
[Your name]`,
  },
  'follow-up': {
    name: 'Follow-up',
    subject: 'Following up on our previous conversation',
    content: `Hi {{first_name}},

I wanted to follow up on my previous email. I understand you're probably busy, but I'd love to hear your thoughts on how we could help {{company}} improve its outreach efforts.

Would you be open to a brief 15-minute call this week?

Best regards,
[Your name]`,
  },
  'introduction': {
    name: 'Introduction',
    subject: 'Introduction from a fellow {{industry}} professional',
    content: `Hi {{first_name}},

I hope this email finds you well. I'm reaching out because I noticed your work at {{company}} in the {{industry}} space.

I'd love to connect and learn more about your experience in the industry. Would you be open to a brief conversation?

Best regards,
[Your name]`,
  },
};

function Templates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
  });
  const [previewData, setPreviewData] = useState({
    first_name: 'John',
    last_name: 'Smith',
    email: 'john@company.com',
    company: 'Acme Inc',
    industry: 'Technology',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  const [shownTemplates, setShownTemplates] = useState<number[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      toast.error('Failed to fetch templates');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function replacePlaceholders(text: string) {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => previewData[key as keyof typeof previewData] || match);
  }

  function highlightVariables(text: string) {
    return text.replace(/\{\{(\w+)\}\}/g, (match) => 
      `<span class="bg-indigo-100 text-indigo-800 px-1 rounded">${match}</span>`
    );
  }

  async function generateTemplate(prompt: string, regenerate: boolean = false) {
    try {
      setGeneratingTemplate(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-template`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            prompt,
            exclude: regenerate ? shownTemplates : []
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate template');
      }

      const data = await response.json();
      
      setFormData(prevData => ({
        ...prevData,
        name: `AI Generated: ${prompt.slice(0, 30)}...`,
        subject: data.subject,
        content: data.content,
      }));

      setShownTemplates(prev => [...prev, data.templateIndex]);
      setShowPreview(true);

      if (!data.hasMore) {
        toast.success('All template variations have been shown. Starting over!', {
          icon: '🔄',
        });
        setShownTemplates([]);
      } else {
        toast.success(regenerate ? 'Generated new variation!' : 'Template generated successfully', {
          icon: '✨',
        });
      }
    } catch (error) {
      toast.error('Failed to generate template');
      console.error('Error:', error);
    } finally {
      setGeneratingTemplate(false);
    }
  }

  function loadTemplateSuggestion(type: keyof typeof templateSuggestions) {
    const suggestion = templateSuggestions[type];
    setFormData(prevData => ({
      ...prevData,
      name: suggestion.name,
      subject: suggestion.subject,
      content: suggestion.content,
    }));
    setShowPreview(true);
    toast.success(`Loaded ${suggestion.name} template`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (currentTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update(formData)
          .match({ id: currentTemplate.id });

        if (error) throw error;
        toast.success('Template updated successfully');
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert([formData]);

        if (error) throw error;
        toast.success('Template created successfully');
      }

      setShowForm(false);
      setCurrentTemplate(null);
      setFormData({ name: '', subject: '', content: '' });
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to save template');
      console.error('Error:', error);
    }
  }

  async function deleteTemplate(id: string) {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .match({ id });

      if (error) throw error;
      toast.success('Template deleted');
      setTemplates(templates.filter(template => template.id !== id));
    } catch (error) {
      toast.error('Failed to delete template');
      console.error('Error:', error);
    }
  }

  function editTemplate(template: EmailTemplate) {
    setCurrentTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
    });
    setShowForm(true);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create and manage your email templates with AI-powered suggestions
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <button
            onClick={() => {
              setShowForm(true);
              setCurrentTemplate(null);
              setFormData({ name: '', subject: '', content: '' });
              setShowPreview(false);
              setShownTemplates([]);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Template
          </button>

          {showForm && (
            <div className="mt-6">
              <div className="mb-6 space-y-6">
                {/* AI Template Generation */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-indigo-900 flex items-center mb-2">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Template with AI
                  </h3>
                  <p className="text-sm text-indigo-700 mb-3">
                    Describe your email purpose and let AI create a template for you
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g., Sales outreach to tech companies"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => generateTemplate(aiPrompt)}
                      disabled={!aiPrompt || generatingTemplate}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {generatingTemplate ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate
                        </>
                      )}
                    </button>
                    {formData.content && (
                      <button
                        onClick={() => generateTemplate(aiPrompt, true)}
                        disabled={generatingTemplate}
                        className="inline-flex items-center px-4 py-2 border border-indigo-200 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50"
                        title="Generate another variation"
                      >
                        <RefreshCw className={`h-4 w-4 ${generatingTemplate ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Start Templates */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-indigo-900 flex items-center mb-2">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Quick Start Templates
                  </h3>
                  <p className="text-sm text-indigo-700 mb-3">
                    Choose a template type and customize it for your needs:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(templateSuggestions).map((type) => (
                      <button
                        key={type}
                        onClick={() => loadTemplateSuggestion(type as keyof typeof templateSuggestions)}
                        className="inline-flex items-center px-3 py-1 border border-indigo-200 rounded-md text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                      >
                        {templateSuggestions[type as keyof typeof templateSuggestions].name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Template Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject Line
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    {showPreview && (
                      <div className="mt-1 text-sm text-gray-500">
                        Preview: {replacePlaceholders(formData.subject)}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Email Content
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="content"
                      rows={8}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    {showPreview && (
                      <div className="mt-2 p-4 bg-gray-50 rounded-md">
                        <div className="text-sm text-gray-900 whitespace-pre-wrap">
                          {replacePlaceholders(formData.content)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <div className="flex items-center mb-2">
                    <Variable className="h-4 w-4 text-gray-500 mr-2" />
                    <h4 className="font-medium text-gray-700">Available Variables:</h4>
                  </div>
                  <ul className="grid grid-cols-2 gap-2">
                    <li className="text-gray-600">{'{{first_name}}'}</li>
                    <li className="text-gray-600">{'{{last_name}}'}</li>
                    <li className="text-gray-600">{'{{email}}'}</li>
                    <li className="text-gray-600">{'{{company}}'}</li>
                    <li className="text-gray-600">{'{{industry}}'}</li>
                  </ul>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setShowPreview(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {currentTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {!showForm && (
            <div className="mt-6">
              {loading ? (
                <p className="text-sm text-gray-500">Loading templates...</p>
              ) : templates.length === 0 ? (
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No templates
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Create a new template to get started
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="relative bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <h4 className="text-lg font-medium text-gray-900">
                        {template.name}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {template.subject}
                      </p>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                        {template.content}
                      </p>
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => editTemplate(template)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Templates;