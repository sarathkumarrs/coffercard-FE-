import React, { useState, useEffect } from 'react';
import { BASE_URL, fetchWithAuth } from '../services/api';
import { Settings as SettingsIcon, Save, Building, Phone, MapPin, FileText } from 'lucide-react';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        company_name: '',
        company_phone: '',
        company_address: '',
        company_location: '',
        redemption_instructions: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            console.log('Fetching settings from:', `${BASE_URL}/vendors/settings/`);
            const response = await fetchWithAuth(`${BASE_URL}/vendors/settings/`);

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error response:', errorData);
                throw new Error(`Failed to fetch settings: ${response.status}`);
            }

            const data = await response.json();
            console.log('Settings data received:', data);
            setSettings({
                company_name: data.company_name || '',
                company_phone: data.company_phone || '',
                company_address: data.company_address || '',
                company_location: data.company_location || '',
                redemption_instructions: data.redemption_instructions || ''
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage({ type: 'error', text: `Failed to load settings: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            console.log('Saving settings:', settings);
            const response = await fetchWithAuth(`${BASE_URL}/vendors/settings/`, {
                method: 'PUT',
                body: JSON.stringify(settings)
            });

            console.log('Save response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Save error response:', errorData);
                throw new Error(`Failed to save settings: ${response.status}`);
            }

            const data = await response.json();
            console.log('Settings saved, response:', data);
            setSettings(data);
            setMessage({ type: 'success', text: 'Settings saved successfully!' });

            // Clear success message after 3 seconds
            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: `Failed to save settings: ${error.message}` });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md">
                {/* Header */}
                <div className="border-b border-gray-200 px-4 sm:px-6 py-4">
                    <div className="flex items-start sm:items-center">
                        <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 mr-2 sm:mr-3 flex-shrink-0 mt-1 sm:mt-0" />
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Company Settings</h1>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                Manage your company information and prize redemption details
                            </p>
                        </div>
                    </div>
                </div>

                {/* Message Display */}
                {message.text && (
                    <div className={`mx-4 sm:mx-6 mt-4 sm:mt-6 px-4 py-3 rounded text-sm ${
                        message.type === 'success'
                            ? 'bg-green-100 border border-green-400 text-green-700'
                            : 'bg-red-100 border border-red-400 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Company Name (Read-only) */}
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <Building className="w-4 h-4 mr-2" />
                            Company Name
                        </label>
                        <input
                            type="text"
                            name="company_name"
                            value={settings.company_name}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500">Company name cannot be changed here</p>
                    </div>

                    {/* Company Phone */}
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <Phone className="w-4 h-4 mr-2" />
                            Company Phone
                        </label>
                        <input
                            type="tel"
                            name="company_phone"
                            value={settings.company_phone}
                            onChange={handleChange}
                            placeholder="e.g., +1 (555) 123-4567"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500">Contact number for customer inquiries</p>
                    </div>

                    {/* Company Address */}
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <Building className="w-4 h-4 mr-2" />
                            Company Address
                        </label>
                        <textarea
                            name="company_address"
                            value={settings.company_address}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Enter your complete company address"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500">Full address where customers can visit</p>
                    </div>

                    {/* Company Location */}
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 mr-2" />
                            Location Details / Google Maps Link
                        </label>
                        <input
                            type="text"
                            name="company_location"
                            value={settings.company_location}
                            onChange={handleChange}
                            placeholder="e.g., Near City Mall or Google Maps URL"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500">Landmarks or Google Maps link for easy navigation</p>
                    </div>

                    {/* Redemption Instructions */}
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <FileText className="w-4 h-4 mr-2" />
                            Prize Redemption Instructions
                        </label>
                        <textarea
                            name="redemption_instructions"
                            value={settings.redemption_instructions}
                            onChange={handleChange}
                            rows="6"
                            placeholder="Enter detailed instructions on how winners can redeem their prizes..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            These instructions will be included in winner notification emails. Be specific about:
                            <br />• How to redeem (in-store, online, etc.)
                            <br />• What to bring (ID, email confirmation, etc.)
                            <br />• Redemption validity period
                            <br />• Business hours
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ How This Works</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Winners will receive an email with their prize details</li>
                            <li>• Your contact information and redemption instructions will be included</li>
                            <li>• Make sure all details are accurate and up-to-date</li>
                            <li>• Clear instructions help winners redeem their prizes easily</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={fetchSettings}
                            className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                            disabled={saving}
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;
