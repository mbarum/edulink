import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

interface TenantSettings {
  schoolName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  timezone: string;
  logoUrl: string;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<TenantSettings>({
    schoolName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    timezone: 'UTC',
    logoUrl: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings({
          schoolName: data.schoolName || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          address: data.address || '',
          timezone: data.timezone || 'UTC',
          logoUrl: data.logoUrl || '',
        });
      } catch (error) {
        console.error('Failed to load settings', error);
        setMessage({ type: 'error', text: 'Struggled to connect to configuration server.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await api.patch('/settings', settings);
      setMessage({ type: 'success', text: 'School settings successfully updated!' });
    } catch (error) {
      console.error('Failed to save settings', error);
      setMessage({ type: 'error', text: 'Failed to update settings. Please try again.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 5000); // Clear message seamlessly
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center space-x-3 mb-8 text-indigo-600">
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-extrabold text-gray-900">School Configuration</h1>
        </div>

        {message && (
          <div
            className={`flex items-center p-4 mb-6 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden text-gray-800 font-sans">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Official School Name</label>
                <input 
                  type="text" 
                  name="schoolName" 
                  value={settings.schoolName} 
                  onChange={handleChange} 
                  placeholder="e.g. Springfield High"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Primary Contact Email</label>
                <input 
                  type="email" 
                  name="contactEmail" 
                  value={settings.contactEmail} 
                  onChange={handleChange} 
                  placeholder="admin@school.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Institution Phone Number</label>
                <input 
                  type="tel" 
                  name="contactPhone" 
                  value={settings.contactPhone} 
                  onChange={handleChange} 
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Timezone Base</label>
                <select 
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none cursor-pointer"
                >
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                  <option value="America/New_York">Eastern Standard Time (EST)</option>
                  <option value="America/Chicago">Central Standard Time (CST)</option>
                  <option value="America/Denver">Mountain Standard Time (MST)</option>
                  <option value="America/Los_Angeles">Pacific Standard Time (PST)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Asia/Dubai">Dubai (GST)</option>
                  <option value="Asia/Tokyo">Tokyo (GST)</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Physical Address</label>
                <input 
                  type="text" 
                  name="address" 
                  value={settings.address} 
                  onChange={handleChange} 
                  placeholder="123 Main St, Region, Country"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">School Crest / Logo URL</label>
                <input 
                  type="url" 
                  name="logoUrl" 
                  value={settings.logoUrl} 
                  onChange={handleChange} 
                  placeholder="https://assets.yourschool.com/logo.png"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                Save Configuration
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
