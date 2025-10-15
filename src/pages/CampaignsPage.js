import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PrizeModal from '../components/PrizeModal';
import CampaignQR from '../components/CampaignQR';
import { BASE_URL } from '../services/api';
import { Trash2 } from 'lucide-react';


const CampaignsPage = () => {
    console.log('CampaignsPage Component Rendered');
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [selectedCampaignForQR, setSelectedCampaignForQR] = useState(null);
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        campaign_type: 'scratch',
        start_date: '',
        end_date: '',
        max_claims: 0,
        show_social_page:true,
        instagram_link:'',
        facebook_link:'',
        guidelines:'',
        is_in_store:false


    });

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);



    // Fetch campaigns
    const fetchCampaigns = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BASE_URL}/campaigns/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setCampaigns(data);
            console.log('Campaigns:', data);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        }
    };

    const handleEditCampaign = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BASE_URL}/campaigns/${editingCampaign.id}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editingCampaign)
            });
    
            if (!response.ok) {
                throw new Error('Failed to update campaign');
            }
    
            setEditModalOpen(false);
            setEditingCampaign(null);
            fetchCampaigns(); // Refresh the list
        } catch (error) {
            console.error('Error updating campaign:', error);
            alert('Failed to update campaign');
        }
    };

    const handleManagePrizes = (campaign) => {
        setSelectedCampaign(campaign);
    };

    // Create campaign
    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            const { vendor, ...campaignData } = newCampaign;

            console.log('Sending campaign data:', campaignData);

            const response = await fetch(`${BASE_URL}/campaigns/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(campaignData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create campaign');
            }

            const data = await response.json();
            console.log('Campaign created:', data);
            setIsCreateModalOpen(false);
            fetchCampaigns();
            setNewCampaign({
                name: '',
                campaign_type: 'scratch',
                start_date: '',
                end_date: '',
                max_claims: 0
            });
        } catch (err) {
            console.error('Error creating campaign:', err);
            alert(err.message);
        }
    };


    const handleDeleteCampaign = async (campaignId) => {
        // Show confirmation dialog
        if (!window.confirm('Are you sure you want to delete this campaign?')) {
            return;
        }
    
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${BASE_URL}/campaigns/${campaignId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to delete campaign');
            }
    
            // Refresh campaigns list
            fetchCampaigns();
        } catch (error) {
            console.error('Error deleting campaign:', error);
            alert('Failed to delete campaign');
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    if (!campaigns) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Campaigns</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Create Campaign
                </button>
            </div>

            <div className="grid gap-4">
    {campaigns.map((campaign) => (
        <div key={campaign.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{campaign.name}</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => {
                            setEditingCampaign({...campaign});
                            setEditModalOpen(true);
                        }}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleManagePrizes(campaign)}
                        className="bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600"
                    >
                        Manage Prizes
                    </button>
                    <button
                        onClick={() => setSelectedCampaignForQR(campaign)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                        Show QR
                    </button>
                    <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
            <p className="text-gray-600">Type: {campaign.campaign_type}</p>
            <div className="mt-2">
                <p>Start: {new Date(campaign.start_date).toLocaleDateString()}</p>
                <p>End: {new Date(campaign.end_date).toLocaleDateString()}</p>
                <p>Max Claims: {campaign.max_claims}</p>
            </div>
        </div>
    ))}
</div>

            {selectedCampaignForQR && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Campaign QR Code</h2>
                <button 
                    onClick={() => setSelectedCampaignForQR(null)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ×
                </button>
            </div>
            <CampaignQR url={selectedCampaignForQR.public_url} />
        </div>
    </div>
)}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] flex flex-col">
                       <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-xl font-bold">Create New Campaign</h2>
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <form onSubmit={handleCreateCampaign}>
                                <div className="mb-4">
                                    <label className="block mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={newCampaign.name}
                                        onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-2">Type</label>
                                    <select
                                        value={newCampaign.campaign_type}
                                        onChange={e => setNewCampaign({...newCampaign, campaign_type: e.target.value})}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="scratch">Scratch Card</option>
                                        <option value="spin">Spin and Win</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-2">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={newCampaign.start_date}
                                        onChange={e => setNewCampaign({...newCampaign, start_date: e.target.value})}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-2">End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={newCampaign.end_date}
                                        onChange={e => setNewCampaign({...newCampaign, end_date: e.target.value})}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={newCampaign.is_in_store}
                                            onChange={e => setNewCampaign({...newCampaign, is_in_store: e.target.checked})}
                                            className="mr-2"
                                        />
                                        <div>
                                            <span className="font-medium">In-store Campaign</span>
                                            <p className="text-sm text-gray-500">Enable this if the campaign will be used at point of sale for different customers</p>
                                        </div>
                                    </label>
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-2">Max Claims</label>
                                    <input
                                        type="number"
                                        value={newCampaign.max_claims}
                                        onChange={e => setNewCampaign({...newCampaign, max_claims: parseInt(e.target.value)})}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={newCampaign.show_social_page}
                                            onChange={e => setNewCampaign({...newCampaign, show_social_page: e.target.checked})}
                                            className="mr-2"
                                        />
                                        Show social media follow page before game
                                    </label>
                                </div>

                                {newCampaign.show_social_page && (
                                    <>
                                        <div className="mb-4">
                                            <label className="block mb-2">Instagram Link</label>
                                            <input
                                                type="url"
                                                value={newCampaign.instagram_link}
                                                onChange={e => setNewCampaign({...newCampaign, instagram_link: e.target.value})}
                                                className="w-full p-2 border rounded"
                                                placeholder="https://instagram.com/..."
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block mb-2">Facebook Link</label>
                                            <input
                                                type="url"
                                                value={newCampaign.facebook_link}
                                                onChange={e => setNewCampaign({...newCampaign, facebook_link: e.target.value})}
                                                className="w-full p-2 border rounded"
                                                placeholder="https://facebook.com/..."
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block mb-2">Guidelines</label>
                                            <textarea
                                                value={newCampaign.guidelines}
                                                onChange={e => setNewCampaign({...newCampaign, guidelines: e.target.value})}
                                                className="w-full p-2 border rounded"
                                                rows="4"
                                                placeholder="Enter each guideline on a new line"
                                            />
                                        </div>

                                    </>
                                )}
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-4 py-2 border rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Prize Modal */}
            {selectedCampaign && (
                <PrizeModal 
                    campaign={selectedCampaign} 
                    onClose={() => setSelectedCampaign(null)}
                />
            )}


            {editModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold">Edit Campaign</h2>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <form onSubmit={handleEditCampaign}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={editingCampaign.name}
                                            onChange={e => setEditingCampaign({
                                                ...editingCampaign,
                                                name: e.target.value
                                            })}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2">Type</label>
                                        <select
                                            value={editingCampaign.campaign_type}
                                            onChange={e => setEditingCampaign({
                                                ...editingCampaign,
                                                campaign_type: e.target.value
                                            })}
                                            className="w-full p-2 border rounded"
                                        >
                                            <option value="scratch">Scratch Card</option>
                                            <option value="spin">Spin and Win</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-2">Start Date</label>
                                        <input
                                            type="datetime-local"
                                            value={editingCampaign.start_date.slice(0, 16)}
                                            onChange={e => setEditingCampaign({
                                                ...editingCampaign,
                                                start_date: e.target.value
                                            })}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2">End Date</label>
                                        <input
                                            type="datetime-local"
                                            value={editingCampaign.end_date.slice(0, 16)}
                                            onChange={e => setEditingCampaign({
                                                ...editingCampaign,
                                                end_date: e.target.value
                                            })}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2">Max Claims</label>
                                        <input
                                            type="number"
                                            value={editingCampaign.max_claims}
                                            onChange={e => setEditingCampaign({
                                                ...editingCampaign,
                                                max_claims: parseInt(e.target.value)
                                            })}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    {editingCampaign.show_social_page && (
                                        <>
                                            <div>
                                                <label className="block mb-2">Instagram Link</label>
                                                <input
                                                    type="url"
                                                    value={editingCampaign.instagram_link || ''}
                                                    onChange={e => setEditingCampaign({
                                                        ...editingCampaign,
                                                        instagram_link: e.target.value
                                                    })}
                                                    className="w-full p-2 border rounded"
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-2">Facebook Link</label>
                                                <input
                                                    type="url"
                                                    value={editingCampaign.facebook_link || ''}
                                                    onChange={e => setEditingCampaign({
                                                        ...editingCampaign,
                                                        facebook_link: e.target.value
                                                    })}
                                                    className="w-full p-2 border rounded"
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-2">Guidelines</label>
                                                <textarea
                                                    value={editingCampaign.guidelines || ''}
                                                    onChange={e => setEditingCampaign({
                                                        ...editingCampaign,
                                                        guidelines: e.target.value
                                                    })}
                                                    className="w-full p-2 border rounded"
                                                    rows="4"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t bg-gray-50">
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setEditModalOpen(false);
                                        setEditingCampaign(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditCampaign}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default CampaignsPage;