import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Edit, Calendar, Zap, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { EmailSequence, EmailTemplate } from '../types';

function Sequences() {
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentSequence, setCurrentSequence] = useState<EmailSequence | null>(null);
  const [formData, setFormData] = useState({
    template_id: '',
    interval_days: 1,
    max_followups: 3,
    stagger_delay: 5, // Minutes between each batch
    batch_size: 50, // Emails per batch
    time_window_start: '09:00',
    time_window_end: '17:00',
    days_active: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchSequences();
    fetchTemplates();
  }, []);

  async function fetchSequences() {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select(`
          *,
          email_templates (
            name,
            subject
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSequences(data || []);
    } catch (error) {
      toast.error('Failed to fetch sequences');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTemplates() {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      toast.error('Failed to fetch templates');
      console.error('Error:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (currentSequence) {
        const { error } = await supabase
          .from('email_sequences')
          .update(formData)
          .match({ id: currentSequence.id });

        if (error) throw error;
        toast.success('Sequence updated successfully');
      } else {
        const { error } = await supabase
          .from('email_sequences')
          .insert([formData]);

        if (error) throw error;
        toast.success('Sequence created successfully');
      }

      setShowForm(false);
      setCurrentSequence(null);
      setFormData({
        template_id: '',
        interval_days: 1,
        max_followups: 3,
        stagger_delay: 5,
        batch_size: 50,
        time_window_start: '09:00',
        time_window_end: '17:00',
        days_active: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
        },
      });
      fetchSequences();
    } catch (error) {
      toast.error('Failed to save sequence');
      console.error('Error:', error);
    }
  }

  async function deleteSequence(id: string) {
    try {
      const { error } = await supabase
        .from('email_sequences')
        .delete()
        .match({ id });

      if (error) throw error;
      toast.success('Sequence deleted');
      setSequences(sequences.filter(sequence => sequence.id !== id));
    } catch (error) {
      toast.error('Failed to delete sequence');
      console.error('Error:', error);
    }
  }

  function editSequence(sequence: EmailSequence) {
    setCurrentSequence(sequence);
    setFormData({
      template_id: sequence.template_id,
      interval_days: sequence.interval_days,
      max_followups: sequence.max_followups,
      stagger_delay: sequence.stagger_delay || 5,
      batch_size: sequence.batch_size || 50,
      time_window_start: sequence.time_window_start || '09:00',
      time_window_end: sequence.time_window_end || '17:00',
      days_active: sequence.days_active || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
    });
    setShowForm(true);
  }

  const weekDays = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Email Sequences</h1>
        <p className="mt-2 text-sm text-gray-600">
          Set up automated email follow-up sequences with smart delivery
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <button
            onClick={() => {
              setShowForm(true);
              setCurrentSequence(null);
              setFormData({
                template_id: '',
                interval_days: 1,
                max_followups: 3,
                stagger_delay: 5,
                batch_size: 50,
                time_window_start: '09:00',
                time_window_end: '17:00',
                days_active: {
                  monday: true,
                  tuesday: true,
                  wednesday: true,
                  thursday: true,
                  friday: true,
                  saturday: false,
                  sunday: false,
                },
              });
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Sequence
          </button>

          {showForm && (
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="template" className="block text-sm font-medium text-gray-700">
                        Email Template
                      </label>
                      <select
                        id="template"
                        value={formData.template_id}
                        onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select a template</option>
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
                        Days Between Emails
                      </label>
                      <input
                        type="number"
                        id="interval"
                        min="1"
                        value={formData.interval_days}
                        onChange={(e) => setFormData({ ...formData, interval_days: parseInt(e.target.value) })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="followups" className="block text-sm font-medium text-gray-700">
                        Maximum Follow-ups
                      </label>
                      <input
                        type="number"
                        id="followups"
                        min="1"
                        value={formData.max_followups}
                        onChange={(e) => setFormData({ ...formData, max_followups: parseInt(e.target.value) })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    {showAdvanced ? (
                      <ChevronUp className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    )}
                    Advanced Delivery Settings
                  </button>
                </div>

                {showAdvanced && (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div className="mb-4 flex items-start">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="ml-2 text-sm text-gray-600">
                        These settings help avoid email provider limits and improve deliverability
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="stagger_delay" className="block text-sm font-medium text-gray-700">
                            Delay Between Batches (minutes)
                          </label>
                          <input
                            type="number"
                            id="stagger_delay"
                            min="1"
                            value={formData.stagger_delay}
                            onChange={(e) => setFormData({ ...formData, stagger_delay: parseInt(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="batch_size" className="block text-sm font-medium text-gray-700">
                            Emails per Batch
                          </label>
                          <input
                            type="number"
                            id="batch_size"
                            min="1"
                            max="100"
                            value={formData.batch_size}
                            onChange={(e) => setFormData({ ...formData, batch_size: parseInt(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Active Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {weekDays.map(({ key, label }) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                days_active: {
                                  ...formData.days_active,
                                  [key]: !formData.days_active[key as keyof typeof formData.days_active],
                                },
                              })}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${
                                formData.days_active[key as keyof typeof formData.days_active]
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="time_window_start" className="block text-sm font-medium text-gray-700">
                            Start Time
                          </label>
                          <input
                            type="time"
                            id="time_window_start"
                            value={formData.time_window_start}
                            onChange={(e) => setFormData({ ...formData, time_window_start: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="time_window_end" className="block text-sm font-medium text-gray-700">
                            End Time
                          </label>
                          <input
                            type="time"
                            id="time_window_end"
                            value={formData.time_window_end}
                            onChange={(e) => setFormData({ ...formData, time_window_end: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {currentSequence ? 'Update Sequence' : 'Create Sequence'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {!showForm && (
            <div className="mt-6">
              {loading ? (
                <p className="text-sm text-gray-500">Loading sequences...</p>
              ) : sequences.length === 0 ? (
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12">
                  <div className="text-center">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No sequences
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Create a new sequence to get started
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sequences.map((sequence) => (
                    <div
                      key={sequence.id}
                      className="relative bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {sequence.email_templates?.name}
                        </h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editSequence(sequence)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => deleteSequence(sequence.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Every {sequence.interval_days} days</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Max {sequence.max_followups} follow-ups</span>
                        </div>
                        {sequence.stagger_delay && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Zap className="h-4 w-4 mr-1" />
                            <span>
                              {sequence.batch_size} emails every {sequence.stagger_delay} mins
                            </span>
                          </div>
                        )}
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

export default Sequences;