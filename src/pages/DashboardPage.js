import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { BASE_URL, fetchWithAuth } from '../services/api';

const DashboardPage = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [downloadModal, setDownloadModal] = useState({
        isOpen: false,
        campaignId: null,
        campaignName: ''
    });

    const { logout } = useAuth(); // Get logout function from context
    const navigate = useNavigate();

    const handleAuthError = () => {
        // Clear token and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (logout) logout();
        navigate('/login');
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all campaigns
            const campaignsResponse = await fetchWithAuth(`${BASE_URL}/campaigns/`);

            if (!campaignsResponse.ok) {
                throw new Error('Failed to fetch campaigns');
            }

            const campaignsData = await campaignsResponse.json();

            // Validate that we got an array
            if (!Array.isArray(campaignsData)) {
                console.error('Invalid campaigns data:', campaignsData);
                throw new Error('Invalid response format for campaigns');
            }

            // Fetch all claims
            const claimsResponse = await fetchWithAuth(`${BASE_URL}/claims/`);

            if (!claimsResponse.ok) {
                throw new Error('Failed to fetch claims');
            }

            const claimsData = await claimsResponse.json();

            // Validate that we got an array
            if (!Array.isArray(claimsData)) {
                console.error('Invalid claims data:', claimsData);
                throw new Error('Invalid response format for claims');
            }

            setCampaigns(campaignsData);
            setClaims(claimsData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Safe filter with array validation
    const filteredClaims = Array.isArray(claims) ? claims.filter(claim => {
        // Filter by search term
        const matchesSearch =
            claim.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.prize_name?.toLowerCase().includes(searchTerm.toLowerCase());

        // Filter by selected campaign if one is selected
        const matchesCampaign = selectedCampaign === null || claim.campaign_id === selectedCampaign;

        return matchesSearch && matchesCampaign;
    }) : [];

    const handleCampaignClick = (campaignId) => {
        setSelectedCampaign(campaignId === selectedCampaign ? null : campaignId);
        setSearchTerm(''); // Clear search when switching campaigns
    };

    const handleMarkRedeemed = async (claimId) => {
        try {
            const response = await fetchWithAuth(`${BASE_URL}/claims/${claimId}/mark_redeemed/`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to mark claim as redeemed');
            }

            // Update the claims list after successful redemption
            setClaims(claims.map(claim =>
                claim.id === claimId
                    ? { ...claim, is_redeemed: true }
                    : claim
            ));

        } catch (error) {
            console.error('Error marking claim as redeemed:', error);
            alert('Failed to mark claim as redeemed');
        }
    };

    const DownloadModal = ({ isOpen, onClose, onDownload, campaignName }) => {
        const [dateRange, setDateRange] = useState({
            startDate: '',
            endDate: ''
        });

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-semibold mb-4">Download Claims Data - {campaignName}</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date (Optional)</label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => onDownload(dateRange)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleDownload = async (dateRange) => {
        try {
            const queryParams = new URLSearchParams({
                ...(dateRange.startDate && { start_date: dateRange.startDate }),
                ...(dateRange.endDate && { end_date: dateRange.endDate })
            });

            const response = await fetchWithAuth(
                `${BASE_URL}/campaigns/${downloadModal.campaignId}/download-claims/?${queryParams}`
            );

            if (!response.ok) throw new Error('Download failed');

            // Create and click a temporary download link
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `campaign_claims_${downloadModal.campaignName}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Close the modal
            setDownloadModal({ isOpen: false, campaignId: null, campaignName: '' });
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download claims data');
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <button
                        onClick={fetchDashboardData}
                        className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Safe array access with default values
    const activeCampaigns = Array.isArray(campaigns)
        ? campaigns.filter(c => new Date(c.end_date) > new Date()).length
        : 0;

    const pendingClaims = Array.isArray(claims)
        ? claims.filter(c => !c.is_redeemed).length
        : 0;

    return (
        <div className="p-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Total Campaigns</h3>
                    <p className="text-3xl font-bold">{campaigns.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Total Claims</h3>
                    <p className="text-3xl font-bold">{claims.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Active Campaigns</h3>
                    <p className="text-3xl font-bold">{activeCampaigns}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Pending Claims</h3>
                    <p className="text-3xl font-bold">{pendingClaims}</p>
                </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-lg shadow mb-8">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">Active Campaigns</h3>
                </div>
                <div className="p-6">
                    {campaigns.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No campaigns found. Create your first campaign to get started!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {campaigns.map(campaign => (
                                <div
                                    key={campaign.id}
                                    onClick={() => handleCampaignClick(campaign.id)}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                        selectedCampaign === campaign.id
                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                            : 'border-gray-300 hover:border-blue-300 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-lg">{campaign.name}</h4>
                                        {selectedCampaign === campaign.id && (
                                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                                Selected
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p>Type: {campaign.campaign_type}</p>
                                        <p>Start: {new Date(campaign.start_date).toLocaleDateString()}</p>
                                        <p>End: {new Date(campaign.end_date).toLocaleDateString()}</p>
                                        <p className="mt-2">
                                            Claims: {Array.isArray(claims) ? claims.filter(c => c.campaign_id === campaign.id).length : 0} / {campaign.max_claims}
                                        </p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDownloadModal({
                                                    isOpen: true,
                                                    campaignId: campaign.id,
                                                    campaignName: campaign.name
                                                });
                                            }}
                                            className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
                                        >
                                            Download Claims
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Claims Table with Search */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h3 className="text-lg font-semibold">
                                {selectedCampaign
                                    ? `Claims for: ${campaigns.find(c => c.id === selectedCampaign)?.name || 'Unknown'}`
                                    : 'Recent Claims (All Campaigns)'}
                            </h3>
                            {selectedCampaign && (
                                <button
                                    onClick={() => setSelectedCampaign(null)}
                                    className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                                >
                                    Show All Campaigns
                                </button>
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="Search claims..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border rounded-lg w-64"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {filteredClaims.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            {searchTerm ? 'No claims match your search.' : 'No claims yet.'}
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Campaign
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Prize
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Claimed At
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredClaims.map((claim) => (
                                    <tr key={claim.id}>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {campaigns.find(c => c.id === claim.campaign_id)?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {claim.user_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {claim.user_email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {claim.prize_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(claim.claimed_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${claim.is_redeemed
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {claim.is_redeemed ? 'Redeemed' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {!claim.is_redeemed && (
                                                <button
                                                    onClick={() => handleMarkRedeemed(claim.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Mark as Redeemed
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <DownloadModal
                isOpen={downloadModal.isOpen}
                onClose={() => setDownloadModal({ isOpen: false, campaignId: null, campaignName: '' })}
                onDownload={handleDownload}
                campaignName={downloadModal.campaignName}
            />
        </div>
    );
};

export default DashboardPage;