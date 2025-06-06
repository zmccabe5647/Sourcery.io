import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Plus, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { read, utils } from 'xlsx';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { Contact } from '../types';

function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      toast.error('Failed to fetch contacts');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function validateAndProcessFile(file: File) {
    if (!file) return;
    
    // Check file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid Excel or CSV file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      // Validate required fields
      const requiredFields = ['first_name', 'last_name', 'email'];
      const hasRequiredFields = jsonData.length > 0 && requiredFields.every(field => 
        Object.keys(jsonData[0]).some(key => 
          key.toLowerCase().replace(/[^a-z]/g, '') === field.replace('_', '')
        )
      );

      if (!hasRequiredFields) {
        toast.error(
          <div>
            <p>Missing required columns. Your file must include:</p>
            <ul className="list-disc ml-4 mt-2">
              <li>First Name</li>
              <li>Last Name</li>
              <li>Email</li>
            </ul>
          </div>
        );
        return;
      }

      const { error } = await supabase.from('contacts').insert(
        jsonData.map((row: any) => ({
          first_name: row.first_name || row.firstName || row['First Name'] || '',
          last_name: row.last_name || row.lastName || row['Last Name'] || '',
          email: row.email || row.Email || '',
          company: row.company || row.Company || '',
          title: row.title || row.Title || '',
          industry: row.industry || row.Industry || '',
        }))
      );

      if (error) throw error;
      toast.success('Contacts imported successfully');
      fetchContacts();
    } catch (error) {
      toast.error('Failed to import contacts');
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await validateAndProcessFile(file);
    }
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      await validateAndProcessFile(file);
    }
  }

  async function deleteContact(id: string) {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .match({ id });

      if (error) throw error;
      toast.success('Contact deleted');
      setContacts(contacts.filter(contact => contact.id !== id));
    } catch (error) {
      toast.error('Failed to delete contact');
      console.error('Error:', error);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <p className="mt-2 text-sm text-gray-600">
          Import and manage your contact list
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          {/* File Upload Section */}
          <div 
            className={`relative border-2 ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-dashed border-gray-300'} rounded-lg p-12 text-center transition-colors duration-200`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInput}
              disabled={uploading}
            />

            <div className="space-y-4">
              <div className="flex justify-center">
                <FileSpreadsheet className="h-12 w-12 text-gray-400" />
              </div>
              
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload a file</span>
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              
              <p className="text-xs text-gray-500">
                CSV or Excel files up to 10MB
              </p>

              {/* Template Instructions */}
              <div className="mt-4 text-left bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  File Format Requirements:
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Your file should include these columns:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li><span className="font-medium">Required:</span> First Name, Last Name, Email</li>
                    <li><span className="font-medium">Optional:</span> Company, Title, Industry</li>
                  </ul>
                  <div className="mt-4">
                    <a
                      href="data:text/csv;charset=utf-8,First Name,Last Name,Email,Company,Title,Industry%0AJohn,Doe,john@example.com,Acme Inc,CEO,Technology"
                      download="contacts_template.csv"
                      className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      Download Template
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {uploading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Uploading contacts...</p>
                </div>
              </div>
            )}
          </div>

          {/* Contacts List */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact List</h3>
            {loading ? (
              <p className="text-sm text-gray-500">Loading contacts...</p>
            ) : contacts.length === 0 ? (
              <p className="text-sm text-gray-500">No contacts uploaded yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contacts.map((contact) => (
                      <tr key={contact.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {contact.first_name} {contact.last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {contact.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {contact.company}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {contact.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => deleteContact(contact.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contacts;