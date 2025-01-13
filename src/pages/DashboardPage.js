import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
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
import { BASE_URL } from '../services/api';


const DashboardPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadModal, setDownloadModal] = useState({
    isOpen: false,
    campaignId: null,
    campaignName: ''
});

  const fetchDashboardData = async () => {
      try {
          setLoading(true);
          const token = localStorage.getItem('access_token');
          
          // Fetch all campaigns
          const campaignsResponse = await fetch(`${BASE_URL}/campaigns/`, {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              }
          });
          const campaignsData = await campaignsResponse.json();

          // Fetch all claims
          const claimsResponse = await fetch(`${BASE_URL}/claims/`, {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              }
          });
          const claimsData = await claimsResponse.json();

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

  console.log("Campaigns:", campaigns);
  console.log("Claims:", claims);

  // Filter claims based on search term
  const filteredClaims = claims.filter(claim => 
      claim.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.prize_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarkRedeemed = async (claimId) => {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${BASE_URL}/claims/${claimId}/mark_redeemed/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
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

    return isOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Download Claims Data - {campaignName}</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date (Optional)</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={e => setDateRange({...dateRange, startDate: e.target.value})}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={e => setDateRange({...dateRange, endDate: e.target.value})}
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
    ) : null;
};

const handleDownload = async (dateRange) => {
    try {
        const queryParams = new URLSearchParams({
            ...(dateRange.startDate && { start_date: dateRange.startDate }),
            ...(dateRange.endDate && { end_date: dateRange.endDate })
        });

        const token = localStorage.getItem('access_token');
        const response = await fetch(
            `${BASE_URL}/campaigns/${downloadModal.campaignId}/download-claims/?${queryParams}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

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
                  <p className="text-3xl font-bold">
                      {campaigns.filter(c => new Date(c.end_date) > new Date()).length}
                  </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Pending Claims</h3>
                  <p className="text-3xl font-bold">
                      {claims.filter(c => !c.is_redeemed).length}
                  </p>
              </div>
          </div>

          {/* Campaigns List */}
          <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">Active Campaigns</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map(campaign => (
                      <div key={campaign.id} className="border rounded-lg p-4">
                          <h4 className="font-semibold text-lg mb-2">{campaign.name}</h4>
                          <div className="text-sm text-gray-600">
                              <p>Type: {campaign.campaign_type}</p>
                              <p>Start: {new Date(campaign.start_date).toLocaleDateString()}</p>
                              <p>End: {new Date(campaign.end_date).toLocaleDateString()}</p>
                              <p className="mt-2">
                          
                                  Claims: {claims.filter(c => c.campaign_id === campaign.id).length} / {campaign.max_claims}
                                  
                              </p>
                              <button
                                    onClick={() => setDownloadModal({
                                        isOpen: true,
                                        campaignId: campaign.id,
                                        campaignName: campaign.name
                                    })}
                                    className="text-blue-500 hover:text-blue-700 text-sm"
                                >
                                    Download Claims
                            </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Claims Table with Search */}
          <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                  <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Recent Claims</h3>
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
                                      {campaigns.find(c => c.id === claim.campaign_id)?.name}
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
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          claim.is_redeemed 
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